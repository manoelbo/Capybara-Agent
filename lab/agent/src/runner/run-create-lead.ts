import { resolveRuntimeConfig } from '../config/env.js'
import {
  ensureDir,
  listPreviewCandidates,
  readSourceCheckpoint,
  slugify
} from '../core/fs-io.js'
import { toRelative } from '../core/paths.js'
import { createLeadFile } from '../tools/investigative/create-lead-file.js'
import { createFeedbackController, type FeedbackController, type FeedbackMode } from '../cli/renderer.js'
import { OpenRouterClient } from '../llm/openrouter-client.js'
import { stripCodeFence } from '../core/markdown.js'
import {
  buildCreateLeadSystemPrompt,
  buildCreateLeadUserPrompt,
  type CreateLeadIAResponse
} from '../prompts/create-lead.js'
import { getToolManifestForPrompt } from '../prompts/tool-manifest.js'
import type { InquiryPlan } from '../core/contracts.js'

export interface RunCreateLeadOptions {
  idea?: string
  model?: string
  feedbackMode?: FeedbackMode
  feedback?: FeedbackController
}

interface ParsedCreateLead {
  codename: string
  title: string
  description: string
  inquiryPlan: InquiryPlan
}

export function normalizeLeadSlug(codename: string): string {
  const slug = slugify(codename).replace(/^-+|-+$/g, '')
  if (!slug) return 'investigacao'
  return slug.startsWith('lead-') ? slug.slice('lead-'.length) : slug
}

/** Exportado para testes. */
export function parseCreateLeadResponse(raw: string): ParsedCreateLead {
  const cleaned = stripCodeFence(raw.trim())
  try {
    const parsed = JSON.parse(cleaned) as CreateLeadIAResponse
    const inquiryPlan = normalizeInquiryPlan(parsed.inquiryPlan)
    return {
      codename: typeof parsed.codename === 'string' ? parsed.codename : 'investigacao',
      title: typeof parsed.title === 'string' ? parsed.title : 'Lead de investigacao',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      inquiryPlan
    }
  } catch {
    return {
      codename: 'investigacao',
      title: 'Lead de investigacao',
      description: raw.slice(0, 500),
      inquiryPlan: normalizeInquiryPlan(undefined)
    }
  }
}

export async function runCreateLead(options: RunCreateLeadOptions = {}): Promise<void> {
  const runtime = await resolveRuntimeConfig(options.model ? { model: options.model } : {})
  await ensureDir(runtime.paths.outputDir)
  await ensureDir(runtime.paths.eventsDir)
  await ensureDir(runtime.paths.investigationDir)
  await ensureDir(runtime.paths.leadsDir)
  await ensureDir(runtime.paths.allegationsDir)
  await ensureDir(runtime.paths.findingsDir)

  const ownsFeedback = !options.feedback
  const feedback =
    options.feedback ??
    (await createFeedbackController({
      eventsDir: runtime.paths.eventsDir,
      sessionName: 'create-lead',
      ...(options.feedbackMode ? { mode: options.feedbackMode } : {})
    }))

  const idea = options.idea?.trim()

  feedback.step(idea ? `Criando lead a partir da ideia: "${idea}"` : 'Gerando lead (ideia livre)...', 'in_progress')

  const client = new OpenRouterClient(runtime.apiKey)
  const sourceSummary = await buildSourceSummary(runtime.paths.sourceArtifactsDir, runtime.paths.sourceDir)
  if (sourceSummary) {
    feedback.step('Contexto de source carregado para planejar o lead', 'completed')
  } else {
    feedback.warn(
      'Nenhum preview encontrado em filesystem/source/.artifacts (ou fallback legado); lead sera gerado sem contexto de source.'
    )
  }

  const userPrompt = buildCreateLeadUserPrompt(idea, sourceSummary)
  const systemPrompt = buildCreateLeadSystemPrompt(getToolManifestForPrompt())
  const rawResponse = await client.chatText({
    model: runtime.model,
    system: systemPrompt,
    user: userPrompt,
    temperature: 0.3
  })

  const parsed = parseCreateLeadResponse(rawResponse)
  const slug = normalizeLeadSlug(parsed.codename)
  const title = parsed.title
  const description = parsed.description
  feedback.step('Salvando lead e planejamento de inquiry em filesystem/investigation/leads...', 'in_progress')

  const output = await createLeadFile(
    {
      title,
      description,
      slug,
      inquiryPlan: parsed.inquiryPlan
    },
    { paths: runtime.paths }
  )

  const relPath = toRelative(runtime.paths.projectRoot, output.leadPath)
  feedback.fileChange({
    path: relPath,
    changeType: 'new',
    addedLines: 0,
    removedLines: 0,
    preview: `Lead "${title}" criado com Inquiry Plan.`
  })
  feedback.step('Lead criado', 'completed', relPath)

  feedback.finalSummary('Lead criado', [
    `Lead: ${relPath}`,
    'Proximo passo: execute /inquiry para gerar allegations e findings conectados ao lead.'
  ])

  if (ownsFeedback) {
    await feedback.flush()
  }
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeInquiryPlan(input: CreateLeadIAResponse['inquiryPlan']): InquiryPlan {
  const fallback = ['Sem detalhamento fornecido pela IA']
  return {
    formulateAllegations: asStringList(input?.formulateAllegations).slice(0, 8).length
      ? asStringList(input?.formulateAllegations).slice(0, 8)
      : fallback,
    defineSearchStrategy: asStringList(input?.defineSearchStrategy).slice(0, 8).length
      ? asStringList(input?.defineSearchStrategy).slice(0, 8)
      : fallback,
    gatherFindings: asStringList(input?.gatherFindings).slice(0, 8).length
      ? asStringList(input?.gatherFindings).slice(0, 8)
      : fallback,
    mapToAllegations: asStringList(input?.mapToAllegations).slice(0, 8).length
      ? asStringList(input?.mapToAllegations).slice(0, 8)
      : fallback
  }
}

async function buildSourceSummary(
  sourceArtifactsDir: string,
  sourceDir: string
): Promise<string | undefined> {
  const docIdToName = await readSourceCheckpoint(sourceDir)
  const candidates = await listPreviewCandidates(sourceArtifactsDir, docIdToName)
  if (candidates.length === 0) return undefined

  const lines = candidates
    .slice(0, 12)
    .map((item, index) => `${index + 1}. ${item.documentName} (docId: ${item.docId})`)

  const suffix =
    candidates.length > 12
      ? `\n... e mais ${candidates.length - 12} documento(s) com preview.`
      : ''

  return `Total de documentos com preview: ${candidates.length}\n${lines.join('\n')}${suffix}`
}
