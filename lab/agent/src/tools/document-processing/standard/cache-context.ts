import { readFile } from 'node:fs/promises'
import type { FileAnnotation, OpenRouterMessage } from '../openrouter-client.js'
import { OpenRouterClient } from '../openrouter-client.js'
import type { OpenRouterUsage } from '../types.js'

const NATIVE_PDF_PLUGIN = [{ id: 'file-parser', pdf: { engine: 'native' as const } }]

export interface CacheContext {
  /** Mensagem user original contendo o PDF em base64. */
  pdfUserMessage: OpenRouterMessage
  /** Resposta assistant da Etapa 1, com annotations do PDF parseado. */
  firstAssistantMessage: OpenRouterMessage
  annotations: FileAnnotation[]
  model: string
  sourceFileName: string
}

export interface BuildCacheContextParams {
  pdfPath: string
  sourceFileName: string
  model: string
  systemPrompt: string
  userPrompt: string
  client: OpenRouterClient
  timeoutMs?: number
}

export interface CacheContextResult {
  ctx: CacheContext
  content: string
  usage: OpenRouterUsage
}

/**
 * Etapa 1: envia o PDF inteiro ao Gemini com engine "native" + prompt inicial.
 * Retorna o CacheContext com o prefixo da conversa para reutilizar nas etapas 2-7.
 *
 * O mecanismo de cache funciona via sticky routing implicito do OpenRouter:
 * ao reenviar o mesmo prefixo (pdfUserMessage + firstAssistantMessage) nas
 * chamadas seguintes, o provider reutiliza o contexto ja processado e aplica
 * desconto automatico nos tokens do prefixo.
 */
export async function buildCacheContext(
  params: BuildCacheContextParams
): Promise<CacheContextResult> {
  const pdfBytes = await readFile(params.pdfPath)
  const base64 = pdfBytes.toString('base64')
  const fileData = `data:application/pdf;base64,${base64}`

  const pdfUserMessage: OpenRouterMessage = {
    role: 'user',
    content: [
      { type: 'text', text: params.userPrompt },
      { type: 'file', file: { filename: params.sourceFileName, file_data: fileData } }
    ]
  }

  const result = await params.client.chatWithPdf({
    model: params.model,
    messages: [
      { role: 'system', content: params.systemPrompt },
      pdfUserMessage
    ],
    temperature: 0.1,
    timeoutMs: params.timeoutMs ?? 180_000,
    plugins: NATIVE_PDF_PLUGIN
  })

  const firstAssistantMessage: OpenRouterMessage = {
    role: 'assistant',
    content: result.content,
    annotations: result.annotations
  }

  const ctx: CacheContext = {
    pdfUserMessage,
    firstAssistantMessage,
    annotations: result.annotations,
    model: params.model,
    sourceFileName: params.sourceFileName
  }

  return { ctx, content: result.content, usage: result.usage }
}

/**
 * Monta o array de mensagens para chamadas subsequentes usando o contexto cacheado.
 * O prefixo identico maximiza cache hits implicitos do Gemini no OpenRouter.
 */
export function buildCachedMessages(
  ctx: CacheContext,
  systemPrompt: string,
  newInstruction: string
): OpenRouterMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ctx.pdfUserMessage,
    ctx.firstAssistantMessage,
    { role: 'user', content: newInstruction }
  ]
}

/**
 * Executa uma chamada usando o contexto cacheado do PDF.
 */
export async function callWithCache(
  ctx: CacheContext,
  client: OpenRouterClient,
  systemPrompt: string,
  instruction: string,
  timeoutMs = 120_000,
  maxTokens?: number
): Promise<{ content: string; usage: OpenRouterUsage }> {
  const messages = buildCachedMessages(ctx, systemPrompt, instruction)
  return client.chatCached({
    model: ctx.model,
    messages,
    temperature: 0.1,
    timeoutMs,
    ...(typeof maxTokens === 'number' ? { maxTokens } : {})
  })
}
