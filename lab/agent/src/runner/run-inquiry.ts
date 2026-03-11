import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { resolveRuntimeConfig } from '../config/env.js'
import { createFeedbackController, type FeedbackController, type FeedbackMode } from '../cli/renderer.js'
import { limitText, loadPreviewsIncremental, slugify } from '../core/fs-io.js'
import { stripCodeFence } from '../core/markdown.js'
import { toRelative } from '../core/paths.js'
import type { FindingEvidence, InquiryScenario, VerificationStatus } from '../core/contracts.js'
import { OpenRouterClient } from '../llm/openrouter-client.js'
import {
  buildInquiryUserPrompt,
  INQUIRY_SYSTEM_PROMPT,
  type InquiryIAResponse
} from '../prompts/inquiry.js'
import { appendLeadConclusion, persistInquiryArtifacts } from '../tools/investigative/create-lead-file.js'

export interface RunInquiryOptions {
  lead: string
  model?: string
  feedbackMode?: FeedbackMode
  feedback?: FeedbackController
}

interface ParsedInquiry {
  scenario: InquiryScenario
  conclusion: string
  allegations: Array<{ id: string; statement: string }>
  findings: Array<{
    id: string
    claim: string
    status: VerificationStatus
    supportsAllegationIds: string[]
    evidence: FindingEvidence[]
  }>
}

export async function runInquiry(options: RunInquiryOptions): Promise<void> {
  const leadInput = options.lead?.trim()
  if (!leadInput) {
    throw new Error('Parametro obrigatorio: inquiry --lead <slug>')
  }

  const runtime = await resolveRuntimeConfig(options.model ? { model: options.model } : {})
  const ownsFeedback = !options.feedback
  const feedback =
    options.feedback ??
    (await createFeedbackController({
      eventsDir: runtime.paths.eventsDir,
      sessionName: 'inquiry',
      ...(options.feedbackMode ? { mode: options.feedbackMode } : {})
    }))

  const slug = normalizeLeadInput(leadInput)
  const leadPath = path.join(runtime.paths.leadsDir, `lead-${slug}.md`)

  feedback.step(`Iniciando inquiry para lead: ${slug}`, 'in_progress')
  let leadMarkdown = ''
  try {
    leadMarkdown = await readFile(leadPath, 'utf8')
  } catch {
    throw new Error(
      `Lead nao encontrado: ${toRelative(runtime.paths.projectRoot, leadPath)}. Rode create-lead antes.`
    )
  }

  const sourceSummary = await buildInquirySourceSummary(runtime.paths.sourceArtifactsDir, runtime.paths.sourceDir)
  const userPrompt = buildInquiryUserPrompt({
    leadSlug: slug,
    leadMarkdown: limitText(leadMarkdown, 10_000),
    sourceSummary
  })

  feedback.step('Executando inquiry com LLM...', 'in_progress')
  const client = new OpenRouterClient(runtime.apiKey)
  const raw = await client.chatText({
    model: runtime.model,
    system: INQUIRY_SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.2
  })

  const parsed = parseInquiryResponse(raw)
  feedback.step(`Cenario identificado: ${parsed.scenario}`, 'completed')

  const persisted = await persistInquiryArtifacts(
    {
      slug,
      allegations: parsed.allegations,
      findings: parsed.findings
    },
    { paths: runtime.paths }
  )

  for (const p of persisted.allegationPaths) {
    feedback.fileChange({
      path: toRelative(runtime.paths.projectRoot, p),
      changeType: 'new',
      addedLines: 0,
      removedLines: 0,
      preview: 'Allegation gerada pelo inquiry.'
    })
  }
  for (const p of persisted.findingPaths) {
    feedback.fileChange({
      path: toRelative(runtime.paths.projectRoot, p),
      changeType: 'new',
      addedLines: 0,
      removedLines: 0,
      preview: 'Finding gerado pelo inquiry.'
    })
  }

  const leadUpdated = await appendLeadConclusion(
    {
      slug,
      scenario: parsed.scenario,
      conclusion: parsed.conclusion
    },
    { paths: runtime.paths }
  )
  feedback.fileChange({
    path: toRelative(runtime.paths.projectRoot, leadUpdated),
    changeType: 'edited',
    addedLines: 0,
    removedLines: 0,
    preview: '# Conclusion atualizado com resultado da inquiry.'
  })

  feedback.finalSummary('Inquiry concluida', [
    `Lead atualizado: ${toRelative(runtime.paths.projectRoot, leadUpdated)}`,
    `Allegations: ${persisted.allegationPaths.length}`,
    `Findings: ${persisted.findingPaths.length}`,
    parsed.scenario === 'plan_another_inquiry'
      ? 'Recomendacao: executar inquiry novamente com estrategia complementar.'
      : 'Resultado consolidado no lead.'
  ])

  if (ownsFeedback) {
    await feedback.flush()
  }
}

function normalizeLeadInput(value: string): string {
  const trimmed = value.trim().replace(/\.md$/i, '')
  const withoutPrefix = trimmed.startsWith('lead-') ? trimmed.slice('lead-'.length) : trimmed
  const slug = slugify(withoutPrefix)
  if (!slug) throw new Error('Slug do lead invalido.')
  return slug
}

function normalizeScenario(value: string | undefined): InquiryScenario {
  if (value === 'positive' || value === 'negative' || value === 'plan_another_inquiry') {
    return value
  }
  return 'negative'
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeEvidence(evidence: unknown): FindingEvidence[] {
  if (!Array.isArray(evidence)) return []
  return evidence
    .map((item) => {
      const source = typeof (item as { source?: unknown })?.source === 'string'
        ? String((item as { source?: string }).source).trim()
        : ''
      const excerpt = typeof (item as { excerpt?: unknown })?.excerpt === 'string'
        ? String((item as { excerpt?: string }).excerpt).trim()
        : ''
      const pageRaw = (item as { page?: unknown })?.page
      const page = typeof pageRaw === 'number' && Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : undefined
      if (!source || !excerpt) return undefined
      return { source, excerpt, ...(page !== undefined ? { page } : {}) }
    })
    .filter((item): item is FindingEvidence => Boolean(item))
}

export function parseInquiryResponse(raw: string): ParsedInquiry {
  const cleaned = stripCodeFence(raw.trim())
  try {
    const parsed = JSON.parse(cleaned) as InquiryIAResponse
    const allegations = (parsed.allegations ?? [])
      .map((item, idx) => ({
        id: slugify(item?.id || `allegation-${idx + 1}`) || `allegation-${idx + 1}`,
        statement: typeof item?.statement === 'string' ? item.statement.trim() : ''
      }))
      .filter((item) => item.statement.length > 0)

    const allegationSet = new Set(allegations.map((item) => item.id))
    const findings = (parsed.findings ?? [])
      .map((item, idx) => {
        const claim = typeof item?.claim === 'string' ? item.claim.trim() : ''
        const statusRaw = item?.status
        const status: VerificationStatus =
          statusRaw === 'verified' || statusRaw === 'rejected' || statusRaw === 'unverified'
            ? statusRaw
            : 'unverified'
        const supportsAllegationIds = asStringList(item?.supportsAllegationIds)
          .map((id) => slugify(id) || id)
          .filter((id) => allegationSet.has(id))
        return {
          id: slugify(item?.id || `finding-${idx + 1}`) || `finding-${idx + 1}`,
          claim,
          status,
          supportsAllegationIds,
          evidence: normalizeEvidence(item?.evidence)
        }
      })
      .filter((item) => item.claim.length > 0 && item.evidence.length > 0)

    const scenario = normalizeScenario(parsed.scenario)
    const conclusion =
      typeof parsed.conclusion === 'string' && parsed.conclusion.trim().length > 0
        ? parsed.conclusion.trim()
        : defaultConclusion(scenario)

    return { scenario, conclusion, allegations, findings }
  } catch {
    return {
      scenario: 'negative',
      conclusion: defaultConclusion('negative'),
      allegations: [],
      findings: []
    }
  }
}

function defaultConclusion(scenario: InquiryScenario): string {
  if (scenario === 'positive') {
    return 'A inquiry encontrou allegations e findings suficientes para sustentar os achados com boa confianca.'
  }
  if (scenario === 'plan_another_inquiry') {
    return 'A inquiry atual gerou base parcial. Recomenda-se uma nova inquiry com estrategia complementar para ampliar cobertura e confirmar hipoteses.'
  }
  return 'A inquiry nao encontrou allegations/findings conclusivos com o material de source disponivel nesta rodada.'
}

async function buildInquirySourceSummary(sourceArtifactsDir: string, sourceDir: string): Promise<string> {
  const { previews } = await loadPreviewsIncremental(sourceArtifactsDir, sourceDir)
  if (previews.length === 0) return '(Nenhum preview disponivel)'
  return previews
    .slice(0, 10)
    .map((preview, idx) => {
      const excerpt = limitText(preview.content.replace(/\s+/g, ' ').trim(), 1200)
      return `## Source ${idx + 1}: ${preview.documentName} (${preview.docId})\n${excerpt}`
    })
    .join('\n\n')
}
