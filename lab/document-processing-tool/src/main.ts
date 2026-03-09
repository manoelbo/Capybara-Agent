import { writeFile } from 'node:fs/promises'
import { resolveLabConfig } from './config.js'
import { processSingleDocument } from './pipeline.js'
import { isSourceSubcommand, runCli } from './cli.js'
import type { RunReport } from './types.js'

async function runLegacy(argv: string[]): Promise<void> {
  const startedAt = new Date()
  const config = resolveLabConfig(argv)

  const partial = await processSingleDocument({
    apiKey: config.apiKey,
    pdfPath: config.inputPdfPath,
    outputDir: config.outputDir,
    chunksDir: config.chunksDir,
    checkpointPath: config.checkpointPath,
    replicaPath: config.replicaPath,
    previewPath: config.previewPath,
    metadataPath: config.metadataPath,
    reportPath: config.reportPath,
    model: config.model,
    previewModel: config.previewModel,
    maxPages: config.maxPages,
    chunkPages: config.chunkPages,
    concurrency: config.concurrency,
    resume: config.resume,
    providerSort: config.providerSort,
    debugOpenRouter: config.debugOpenRouter
  })

  const report: RunReport = {
    ...partial,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    elapsedMs: new Date().getTime() - startedAt.getTime()
  }

  await writeFile(config.reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`Relatório gerado: ${config.reportPath}`)
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (isSourceSubcommand(argv)) {
    const handled = await runCli(argv)
    if (handled) return
  }
  await runLegacy(argv)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Erro fatal no laboratório PDF: ${message}`)
  process.exitCode = 1
})
