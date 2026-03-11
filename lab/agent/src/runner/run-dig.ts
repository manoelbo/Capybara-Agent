import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { resolveRuntimeConfig } from '../config/env.js'
import {
  ensureDir,
  loadPreviewsIncremental,
  writeUtf8
} from '../core/fs-io.js'
import { toRelative } from '../core/paths.js'
import { OpenRouterClient } from '../llm/openrouter-client.js'
import { createFeedbackController, type FeedbackController, type FeedbackMode } from '../cli/renderer.js'
import {
  DIG_SYSTEM_PROMPT,
  buildDigIncrementalPrompt,
  buildDigLinesPrompt,
  buildDigRankAndComparePrompt
} from '../prompts/dig.js'

export interface RunDigOptions {
  model?: string
  feedbackMode?: FeedbackMode
  feedback?: FeedbackController
}

async function loadExistingLeadsMarkdown(leadsDir: string): Promise<string> {
  let entries: Dirent[]
  try {
    entries = await readdir(leadsDir, { withFileTypes: true })
  } catch {
    return ''
  }
  const lines: string[] = []
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue
    const leadPath = path.join(leadsDir, e.name)
    try {
      const content = await readFile(leadPath, 'utf8')
      const excerpt = content.length > 700 ? `${content.slice(0, 700)}...` : content
      lines.push(`### ${e.name}\n${excerpt}\n`)
    } catch {
      lines.push(`### ${e.name}\n(lead inacessivel)\n`)
    }
  }
  return lines.join('\n---\n\n')
}

export async function runDig(options: RunDigOptions = {}): Promise<void> {
  const runtime = await resolveRuntimeConfig(options.model ? { model: options.model } : {})
  await ensureDir(runtime.paths.outputDir)
  await ensureDir(runtime.paths.eventsDir)
  await ensureDir(runtime.paths.reportsDir)

  const ownsFeedback = !options.feedback
  const feedback =
    options.feedback ??
    (await createFeedbackController({
      eventsDir: runtime.paths.eventsDir,
      sessionName: 'dig',
      ...(options.feedbackMode ? { mode: options.feedbackMode } : {})
    }))

  feedback.step('Iniciando dig (escavacao de leads)...', 'in_progress')
  feedback.step(
    `Carregando previews de ${toRelative(runtime.paths.projectRoot, runtime.paths.sourceArtifactsDir)}`,
    'in_progress'
  )

  const { previews } = await loadPreviewsIncremental(
    runtime.paths.sourceArtifactsDir,
    runtime.paths.sourceDir
  )

  if (previews.length === 0) {
    throw new Error(
      `Nenhum preview encontrado em ${runtime.paths.sourceArtifactsDir}. Verifique se existem pastas com preview.md em lab/agent/filesystem/source/.artifacts.`
    )
  }

  feedback.step(`${previews.length} preview(s) carregado(s)`, 'completed')
  feedback.step('Analise incremental (um preview por vez)...', 'in_progress')

  const client = new OpenRouterClient(runtime.apiKey)
  let accumulatedConclusions = ''

  for (let i = 0; i < previews.length; i += 1) {
    const p = previews[i]!
    feedback.step(`Documento ${i + 1}/${previews.length}: ${p.documentName}`, 'in_progress')
    const userPrompt = buildDigIncrementalPrompt(accumulatedConclusions, p.content, p.documentName)
    const conclusion = await client.chatText({
      model: runtime.model,
      system: DIG_SYSTEM_PROMPT,
      user: userPrompt,
      temperature: 0.2
    })
    accumulatedConclusions = conclusion.trim()
  }

  feedback.step('Analise incremental concluida', 'completed')
  feedback.step('Gerando linhas investigativas a partir das conclusoes...', 'in_progress')

  const linesUserPrompt = buildDigLinesPrompt(accumulatedConclusions)
  const suggestedLinesText = await client.chatText({
    model: runtime.model,
    system: DIG_SYSTEM_PROMPT,
    user: linesUserPrompt,
    temperature: 0.2
  })

  feedback.step('Comparando com leads existentes e ranqueando top 3...', 'in_progress')

  const existingLeads = await loadExistingLeadsMarkdown(runtime.paths.leadsDir)
  const existingMarkdown = existingLeads
  const rankUserPrompt = buildDigRankAndComparePrompt(suggestedLinesText.trim(), existingMarkdown)
  const finalText = await client.chatText({
    model: runtime.model,
    system: DIG_SYSTEM_PROMPT,
    user: rankUserPrompt,
    temperature: 0.2
  })

  feedback.step('Dig concluido', 'completed')

  const reportContent = [
    '# Dig — Linhas investigativas sugeridas',
    '',
    `Gerado em ${new Date().toISOString()}`,
    `Previews analisados: ${previews.length}`,
    '',
    '---',
    '',
    finalText.trim(),
    ''
  ].join('\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const reportPath = path.join(runtime.paths.reportsDir, `dig-${timestamp}.md`)
  await writeUtf8(reportPath, reportContent)

  const relReport = toRelative(runtime.paths.projectRoot, reportPath)
  feedback.fileChange({
    path: relReport,
    changeType: 'new',
    addedLines: reportContent.split('\n').length,
    removedLines: 0,
    preview: 'Relatorio dig com top 3 linhas e recomendacao.'
  })

  feedback.finalSummary('Proximos passos', [
    `Relatorio salvo em ${relReport}.`,
    'Para criar um lead a partir de uma das sugestoes, use: pnpm reverso create-lead --idea "nome ou ideia do lead".'
  ])

  if (ownsFeedback) {
    await feedback.flush()
  }
}
