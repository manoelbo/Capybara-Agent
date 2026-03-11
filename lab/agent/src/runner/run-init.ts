import path from 'node:path'
import { resolveRuntimeConfig } from '../config/env.js'
import { ensureDir, loadRandomPreviewsWithinBudget, writeUtf8 } from '../core/fs-io.js'
import { formatFrontmatter } from '../core/markdown.js'
import { toRelative } from '../core/paths.js'
import { OpenRouterClient } from '../llm/openrouter-client.js'
import { createFeedbackController, type FeedbackController, type FeedbackMode } from '../cli/renderer.js'

const INIT_SYSTEM_PROMPT = `
Voce e um agente de jornalismo investigativo. Recebera resumos (previews) de documentos de uma pasta source.

Sua tarefa: com base apenas nos previews, escrever em Markdown um entendimento inicial da investigacao.

Retorne um unico bloco Markdown com as secoes abaixo (use os titulos exatos). Nao invente fatos; baseie-se apenas no que os previews mostram.

## Contexto da investigacao
Paragrafo resumindo do que se trata o material (obras, contratos, entidades, locais).

## Hipótese inicial
Uma ou duas frases com a hipotese de trabalho ou pergunta central que a investigacao pode responder.

## Escopo atual
O que esta dentro do escopo com base nos documentos vistos e o que fica de fora.

## Instrucoes do agente
Lista curta de instrucoes para o agente (ex.: priorizar rastreabilidade, nao concluir sem fonte, marcar nao verificado quando em duvida).
`.trim()

export interface RunInitOptions {
  maxTokens?: number
  model?: string
  feedbackMode?: FeedbackMode
  feedback?: FeedbackController
}

const DEFAULT_MAX_TOKENS = 20_000

export async function runInit(options: RunInitOptions = {}): Promise<void> {
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS
  const runtime = await resolveRuntimeConfig(options.model ? { model: options.model } : {})
  await ensureDir(runtime.paths.outputDir)
  await ensureDir(runtime.paths.eventsDir)
  const ownsFeedback = !options.feedback
  const feedback =
    options.feedback ??
    (await createFeedbackController({
      eventsDir: runtime.paths.eventsDir,
      sessionName: 'init',
      ...(options.feedbackMode ? { mode: options.feedbackMode } : {})
    }))

  feedback.step('Iniciando agente Reverso...', 'in_progress')
  feedback.step(`Lendo previews em ${runtime.paths.sourceArtifactsDir}`, 'in_progress', `max ${maxTokens} tokens`)
  const result = await loadRandomPreviewsWithinBudget(
    runtime.paths.sourceArtifactsDir,
    runtime.paths.sourceDir,
    maxTokens
  )

  if (result.previews.length === 0) {
    throw new Error(
      `Nenhum preview encontrado em ${runtime.paths.sourceArtifactsDir}. Candidatos: ${result.candidatesCount}. Verifique se existem pastas com preview.md.`
    )
  }

  feedback.step(
    `${result.usedCount} previews carregados`,
    'completed',
    `${result.estimatedTokens} tokens estimados`
  )
  feedback.step('Gerando entendimento inicial da investigacao...', 'in_progress')
  const userParts = result.previews.map(
    (p) => `## Documento: ${p.documentName}\n\n${p.content}`
  )
  const userPrompt = userParts.join('\n\n---\n\n')

  const client = new OpenRouterClient(runtime.apiKey)
  const understanding = await client.chatTextStream({
    model: runtime.model,
    system: INIT_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.2,
    onChunk(delta) {
      feedback.assistantDelta(delta)
    }
  })
  feedback.step('Entendimento inicial concluido', 'completed')

  feedback.step('Salvando arquivo de configuracao do agente', 'in_progress')
  const previewList = result.previews.map((p) => `- ${p.documentName} (${p.docId})`).join('\n')
  const agentContent = [
    formatFrontmatter({
      type: 'agent_config',
      updated: new Date().toISOString(),
      previews_used: result.usedCount,
      estimated_tokens: result.estimatedTokens
    }),
    '',
    understanding.trim(),
    '',
    '## Previews usados nesta sessao',
    '',
    previewList,
    ''
  ].join('\n')

  const agentPath = path.join(runtime.paths.outputDir, 'agent.md')
  await writeUtf8(agentPath, agentContent)

  const relPath = toRelative(runtime.paths.projectRoot, agentPath)
  feedback.fileChange({
    path: relPath,
    changeType: 'new',
    addedLines: agentContent.split('\n').length,
    removedLines: 0,
    preview: 'agent.md criado com contexto inicial e instrucoes.'
  })
  feedback.step('Arquivo salvo com sucesso', 'completed', relPath)
  feedback.info(`Log de eventos salvo em ${toRelative(runtime.paths.projectRoot, feedback.logPath)}`)
  feedback.finalSummary('Proximos passos', [
    `Previews usados: ${result.usedCount} (${result.estimatedTokens} tokens estimados).`,
    'Ajuste instrucoes com: pnpm reverso agent-setup --text "Adicione que o foco da investigacao e..."',
    'Depois, use o comando /dig para encontrar linhas investigativas.'
  ])
  if (ownsFeedback) {
    await feedback.flush()
  }
}
