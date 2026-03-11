import path from 'node:path'
import { readFile } from 'node:fs/promises'
import type {
  FindingEvidence,
  InquiryPlan,
  InquiryScenario,
  VerificationStatus
} from '../../core/contracts.js'
import { ensureDir, slugify, writeUtf8 } from '../../core/fs-io.js'
import { formatFrontmatter } from '../../core/markdown.js'
import type { ToolContext } from './context.js'

export interface LeadAllegationInput {
  id: string
  statement: string
}

export interface LeadFindingInput {
  id: string
  claim: string
  evidence: FindingEvidence[]
  status: VerificationStatus
  supportsAllegationIds: string[]
}

export interface CreateLeadFileInput {
  slug: string
  title: string
  description: string
  inquiryPlan: InquiryPlan
  allegations?: LeadAllegationInput[]
  findings?: LeadFindingInput[]
}

export interface CreateLeadFileOutput {
  leadPath: string
  allegationPaths: string[]
  findingPaths: string[]
}

export interface AppendLeadConclusionInput {
  slug: string
  scenario: InquiryScenario
  conclusion: string
}

export interface PersistInquiryArtifactsInput {
  slug: string
  allegations: LeadAllegationInput[]
  findings: LeadFindingInput[]
}

function normalizeAllegationId(raw: string, idx: number): string {
  const base = slugify(raw || `allegation-${idx + 1}`) || `allegation-${idx + 1}`
  return base.startsWith('allegation-') ? base : `allegation-${base}`
}

function normalizeFindingId(raw: string, idx: number): string {
  const base = slugify(raw || `finding-${idx + 1}`) || `finding-${idx + 1}`
  return base.startsWith('finding-') ? base : `finding-${base}`
}

function renderInquiryPlanSection(inquiryPlan: InquiryPlan): string {
  return [
    '## Inquiry Plan',
    '',
    '### 1. Formular Allegations',
    ...inquiryPlan.formulateAllegations.map((item) => `- ${item}`),
    '',
    '### 2. Define Search Strategy',
    ...inquiryPlan.defineSearchStrategy.map((item) => `- ${item}`),
    '',
    '### 3. Gather Findings',
    ...inquiryPlan.gatherFindings.map((item) => `- ${item}`),
    '',
    '### 4. Map to Allegations',
    ...inquiryPlan.mapToAllegations.map((item) => `- ${item}`)
  ].join('\n')
}

function statusSummary(
  findings: Array<{ status: VerificationStatus; allegationIds: string[] }>,
  allegationId: string
): string {
  const list = findings.filter((f) => f.allegationIds.includes(allegationId))
  const verified = list.filter((f) => f.status === 'verified').length
  const rejected = list.filter((f) => f.status === 'rejected').length
  const unverified = list.filter((f) => f.status === 'unverified').length
  return `verified:${verified}, unverified:${unverified}, rejected:${rejected}`
}

export async function createLeadFile(
  input: CreateLeadFileInput,
  ctx: ToolContext
): Promise<CreateLeadFileOutput> {
  await ensureDir(ctx.paths.investigationDir)
  await ensureDir(ctx.paths.leadsDir)
  await ensureDir(ctx.paths.allegationsDir)
  await ensureDir(ctx.paths.findingsDir)

  const normalizedAllegations = (input.allegations ?? []).map((item, idx) => ({
    id: normalizeAllegationId(item.id, idx),
    statement: item.statement
  }))
  const normalizedFindings = (input.findings ?? []).map((item, idx) => ({
    id: normalizeFindingId(item.id, idx),
    claim: item.claim,
    evidence: item.evidence,
    status: item.status,
    allegationIds: item.supportsAllegationIds.map((v) => normalizeAllegationId(v, idx))
  }))

  const leadPath = path.join(ctx.paths.leadsDir, `lead-${input.slug}.md`)

  const leadContent = [
    formatFrontmatter({
      type: 'lead',
      slug: `lead-${input.slug}`,
      title: input.title,
      created_at: new Date().toISOString(),
      allegations_count: normalizedAllegations.length,
      findings_count: normalizedFindings.length
    }),
    '',
    '# Contexto',
    input.description,
    '',
    renderInquiryPlanSection(input.inquiryPlan),
    '',
    '## Allegations Index',
      ...(normalizedAllegations.length
        ? normalizedAllegations.map((item) => `- [[${item.id}]]`)
        : ['- (sera preenchido pelo comando /inquiry)']),
    '',
    '## Findings Index',
      ...(normalizedFindings.length
        ? normalizedFindings.map((item) => `- [[${item.id}]]`)
        : ['- (sera preenchido pelo comando /inquiry)']),
    ''
  ].join('\n')
  await writeUtf8(leadPath, leadContent)

  const allegationPaths: string[] = []
  const findingPaths: string[] = []

  if (normalizedAllegations.length > 0 || normalizedFindings.length > 0) {
    const persisted = await persistInquiryArtifacts(
      {
        slug: input.slug,
        allegations: input.allegations ?? [],
        findings: input.findings ?? []
      },
      ctx
    )
    allegationPaths.push(...persisted.allegationPaths)
    findingPaths.push(...persisted.findingPaths)
  }

  return { leadPath, allegationPaths, findingPaths }
}

export async function persistInquiryArtifacts(
  input: PersistInquiryArtifactsInput,
  ctx: ToolContext
): Promise<{ allegationPaths: string[]; findingPaths: string[] }> {
  const normalizedAllegations = input.allegations.map((item, idx) => ({
    id: normalizeAllegationId(item.id, idx),
    statement: item.statement
  }))
  const normalizedFindings = input.findings.map((item, idx) => ({
    id: normalizeFindingId(item.id, idx),
    claim: item.claim,
    evidence: item.evidence,
    status: item.status,
    allegationIds: item.supportsAllegationIds.map((v) => normalizeAllegationId(v, idx))
  }))

  const allegationPaths: string[] = []
  for (const allegation of normalizedAllegations) {
    const findingIds = normalizedFindings
      .filter((finding) => finding.allegationIds.includes(allegation.id))
      .map((finding) => finding.id)
    const filePath = path.join(ctx.paths.allegationsDir, `${allegation.id}.md`)
    const body = [
      formatFrontmatter({
        type: 'allegation',
        id: allegation.id,
        lead_slug: `lead-${input.slug}`,
        statement: allegation.statement,
        finding_ids: findingIds,
        status_summary: statusSummary(normalizedFindings, allegation.id)
      }),
      '',
      `# ${allegation.statement}`,
      '',
      '## Findings vinculados',
      ...(findingIds.length ? findingIds.map((id) => `- [[${id}]]`) : ['- nenhum finding vinculado']),
      ''
    ].join('\n')
    await writeUtf8(filePath, body)
    allegationPaths.push(filePath)
  }

  const findingPaths: string[] = []
  for (const finding of normalizedFindings) {
    const filePath = path.join(ctx.paths.findingsDir, `${finding.id}.md`)
    const linkedAllegations = finding.allegationIds.filter((id) =>
      normalizedAllegations.some((item) => item.id === id)
    )
    const body = [
      formatFrontmatter({
        type: 'finding',
        id: finding.id,
        lead_slug: `lead-${input.slug}`,
        claim: finding.claim,
        status: finding.status,
        allegation_ids: linkedAllegations,
        evidence: finding.evidence.map((item) => {
          const page = typeof item.page === 'number' ? ` p.${item.page}` : ''
          return `${item.source}${page}: ${item.excerpt}`
        })
      }),
      '',
      `# ${finding.claim}`,
      '',
      `Status: ${finding.status}`,
      '',
      '## Evidence',
      ...(finding.evidence.length
        ? finding.evidence.map((item) => {
            const page = typeof item.page === 'number' ? ` p.${item.page}` : ''
            return `- ${item.source}${page}: "${item.excerpt}"`
          })
        : ['- nao informado']),
      '',
      '## Allegations relacionadas',
      ...(linkedAllegations.length
        ? linkedAllegations.map((id) => `- [[${id}]]`)
        : ['- nenhuma allegation relacionada']),
      ''
    ].join('\n')
    await writeUtf8(filePath, body)
    findingPaths.push(filePath)
  }

  await upsertLeadIndexes(input.slug, normalizedAllegations.map((a) => a.id), normalizedFindings.map((f) => f.id), ctx)
  return { allegationPaths, findingPaths }
}

export async function appendLeadConclusion(
  input: AppendLeadConclusionInput,
  ctx: ToolContext
): Promise<string> {
  const leadPath = path.join(ctx.paths.leadsDir, `lead-${input.slug}.md`)
  const current = await readFile(leadPath, 'utf8')
  const scenarioLabel =
    input.scenario === 'positive'
      ? 'Cenario 1 (Positiva)'
      : input.scenario === 'negative'
        ? 'Cenario 2 (Negativa)'
        : 'Cenario 3 (Plan Another Inquiry)'
  const marker = '# Conclusion'
  const block = [marker, '', `Scenario: ${scenarioLabel}`, '', input.conclusion.trim(), ''].join('\n')
  const updated = current.includes(marker)
    ? current.replace(
        /# Conclusion[\s\S]*$/m,
        `${marker}\n\nScenario: ${scenarioLabel}\n\n${input.conclusion.trim()}\n`
      )
    : `${current.trimEnd()}\n\n${block}\n`
  await writeUtf8(leadPath, updated)
  return leadPath
}

async function upsertLeadIndexes(
  slug: string,
  allegationIds: string[],
  findingIds: string[],
  ctx: ToolContext
): Promise<void> {
  const leadPath = path.join(ctx.paths.leadsDir, `lead-${slug}.md`)
  const current = await readFile(leadPath, 'utf8')
  const allegationsSection = [
    '## Allegations Index',
    ...(allegationIds.length ? allegationIds.map((id) => `- [[${id}]]`) : ['- (a preencher por /inquiry)']),
    ''
  ].join('\n')
  const findingsSection = [
    '## Findings Index',
    ...(findingIds.length ? findingIds.map((id) => `- [[${id}]]`) : ['- (a preencher por /inquiry)']),
    ''
  ].join('\n')

  const withAllegations = current.match(/## Allegations Index[\s\S]*?(?=\n## |\s*$)/)
    ? current.replace(/## Allegations Index[\s\S]*?(?=\n## |\s*$)/, allegationsSection.trimEnd())
    : `${current.trimEnd()}\n\n${allegationsSection}`

  const withFindings = withAllegations.match(/## Findings Index[\s\S]*?(?=\n## |\s*$)/)
    ? withAllegations.replace(/## Findings Index[\s\S]*?(?=\n## |\s*$)/, findingsSection.trimEnd())
    : `${withAllegations.trimEnd()}\n\n${findingsSection}`

  await writeUtf8(leadPath, `${withFindings.trimEnd()}\n`)
}
