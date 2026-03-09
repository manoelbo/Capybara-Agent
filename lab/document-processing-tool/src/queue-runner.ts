/**
 * Fila sequencial: processa documentos da pasta source um a um, atualizando checkpoint global.
 */
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { access } from 'node:fs/promises'
import {
  loadSourceCheckpoint,
  saveSourceCheckpoint,
  markSourceStatus,
  upsertSourceFileEntries,
  setSourceQueued
} from './source-checkpoint.js'
import { scanSourceFiles, toSourceFileEntries } from './source-indexer.js'
import { processSingleDocument } from './pipeline.js'
import type { QueueMode, OpenRouterUsage } from './types.js'

export interface QueueRunnerOptions {
  sourceDir: string
  mode: QueueMode
  apiKey: string
  model: string
  previewModel?: string
  maxPages?: number
  chunkPages: number
  concurrency: number
  resume: boolean
  providerSort?: 'latency' | 'throughput' | 'price'
  debugOpenRouter?: boolean
}

export async function runQueue(options: QueueRunnerOptions): Promise<void> {
  const sourceDirAbs = path.resolve(options.sourceDir)
  await mkdir(sourceDirAbs, { recursive: true })

  let checkpoint = await loadSourceCheckpoint(sourceDirAbs)
  const scanned = await scanSourceFiles(sourceDirAbs)
  const existingByDocId = checkpoint?.files
    ? new Map(checkpoint.files.map((f) => [f.docId, f]))
    : undefined
  const entries = toSourceFileEntries(scanned, existingByDocId)
  checkpoint = await upsertSourceFileEntries(sourceDirAbs, entries)

  const pdfs =
    options.mode === 'queue'
      ? checkpoint.files.filter(
          (f) =>
            f.fileType === 'pdf' &&
            f.queuedAt != null &&
            (f.status === 'not_processed' || f.status === 'failed')
        )
      : options.mode === 'all'
        ? checkpoint.files.filter(
            (f) =>
              f.fileType === 'pdf' &&
              (f.status === 'not_processed' || f.status === 'failed')
          )
        : checkpoint.files.filter(
            (f) =>
              f.selected &&
              f.fileType === 'pdf' &&
              (f.status === 'not_processed' || f.status === 'failed')
          )

  for (const f of pdfs.filter((x) => x.status === 'failed')) {
    try {
      await access(path.join(f.artifactDir, 'checkpoint.json'))
      f.resumeFromCheckpoint = true
    } catch {
      f.resumeFromCheckpoint = false
    }
  }
  const toProcess = pdfs.filter(
    (f) =>
      f.status === 'not_processed' || (f.status === 'failed' && f.resumeFromCheckpoint)
  )

  if (toProcess.length === 0) {
    console.log('Nenhum documento pendente para processar.')
    return
  }

  if (options.mode === 'all' || options.mode === 'selected') {
    const now = new Date().toISOString()
    await setSourceQueued(sourceDirAbs, toProcess.map((e) => e.docId), now)
  }

  checkpoint = await loadSourceCheckpoint(sourceDirAbs)
  if (checkpoint) {
    checkpoint = { ...checkpoint, queueStatus: 'running', lastRunAt: new Date().toISOString() }
    await saveSourceCheckpoint(sourceDirAbs, checkpoint)
  }

  const total = toProcess.length
  let doneCount = 0
  let failedCount = 0

  for (let i = 0; i < toProcess.length; i += 1) {
    const entry = toProcess[i]
    const current = i + 1
    console.log(`\n[${current}/${total}] ${entry.originalFileName} (${entry.docId})`)
    const outputDir = entry.artifactDir
    const chunksDir = path.join(outputDir, 'chunks')
    const checkpointPath = path.join(outputDir, 'checkpoint.json')
    const replicaPath = path.join(outputDir, 'replica.md')
    const previewPath = path.join(outputDir, 'preview.md')
    const metadataPath = path.join(outputDir, 'metadata.md')
    const reportPath = path.join(outputDir, 'run-report.json')

    await markSourceStatus(sourceDirAbs, entry.docId, 'replica_running')

    try {
      let lastReport: {
        totalPagesInPdf?: number
        totalChunks?: number
        usage?: OpenRouterUsage
      } = {}
      await processSingleDocument({
        apiKey: options.apiKey,
        pdfPath: entry.sourcePath,
        outputDir,
        chunksDir,
        checkpointPath,
        replicaPath,
        previewPath,
        metadataPath,
        reportPath,
        model: options.model,
        previewModel: options.previewModel,
        maxPages: options.maxPages,
        chunkPages: options.chunkPages,
        concurrency: options.concurrency,
        resume: options.resume,
        providerSort: options.providerSort,
        debugOpenRouter: options.debugOpenRouter,
        onReplicaStart: () => {
          console.log(`  Réplica: iniciando...`)
        },
        onReplicaDone: () => {
          console.log(`  Réplica: concluída.`)
        },
        onPreviewMetadataStart: () => {
          markSourceStatus(sourceDirAbs, entry.docId, 'preview_metadata_running').catch(() => {})
          console.log(`  Preview/metadata: iniciando...`)
        },
        onDone: (report) => {
          lastReport = report
          console.log(`  Concluído.`)
        },
        onError: () => {}
      })

      await markSourceStatus(sourceDirAbs, entry.docId, 'done', {
        processingSummary: {
          totalPagesInPdf: lastReport.totalPagesInPdf,
          totalChunks: lastReport.totalChunks,
          usage: lastReport.usage,
          model: options.model,
          previewModel: options.previewModel ?? options.model
        }
      })
      doneCount += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await markSourceStatus(sourceDirAbs, entry.docId, 'failed', { lastError: message })
      console.error(`  Erro: ${message}`)
      failedCount += 1
    }
  }

  checkpoint = await loadSourceCheckpoint(sourceDirAbs)
  if (checkpoint) {
    checkpoint = { ...checkpoint, queueStatus: 'idle' }
    await saveSourceCheckpoint(sourceDirAbs, checkpoint)
  }
  const summary =
    failedCount > 0
      ? `${doneCount} concluído(s), ${failedCount} falha(s). Rode process-all de novo para reprocessar os que falharam.`
      : `${total} documento(s) processado(s).`
  console.log(`\nFila concluída: ${summary}`)
}
