import { callWithCache, type CacheContext } from '../cache-context.js'
import { OpenRouterClient } from '../../openrouter-client.js'
import {
  STANDARD_GROUPS_SYSTEM_PROMPT,
  STANDARD_GROUPS_USER_PROMPT
} from '../prompts.js'
import { extractJsonArray, repairTruncatedJsonArray } from '../../../../core/markdown.js'
import { slugify, writeUtf8, ensureDir } from '../../../../core/fs-io.js'
import { findExistingGroup, mergeGroupInto } from '../dedup/group-dedup.js'
import type { GroupExtraction } from '../../../../core/contracts.js'
import type { OpenRouterUsage } from '../../types.js'
import path from 'node:path'

export interface StepGroupsParams {
  ctx: CacheContext
  groupsDir: string
  client: OpenRouterClient
  timeoutMs?: number
}

export interface StepGroupsResult {
  created: string[]
  updated: string[]
  usage: OpenRouterUsage
}

function buildGroupMarkdown(g: GroupExtraction, slug: string, now: string): string {
  const memberLines = g.members.map((m) => `- ${m.startsWith('[[') ? m : `[[${m}]]`}`).join('\n')
  const tagLines = g.tags.map((t) => `  - ${t}`).join('\n')
  const roleWithDoc = `${g.role_in_document} (obra/documento: ${g.first_seen_in})`
  const tableRow = `| ${g.first_seen_in} | ${roleWithDoc} | ${g.pages_mentioned.join(', ')} |`
  const contextualSummary = g.summary?.includes(g.first_seen_in)
    ? g.summary
    : `${g.summary}\n\nContexto desta entrada: obra/documento **${g.first_seen_in}**.`

  const frontmatter = [
    '---',
    'type: group',
    `name: "${g.name}"`,
    `category: ${g.category}`,
    `registration_id: "${g.registration_id ?? ''}"`,
    `first_seen_in: "${g.first_seen_in}"`,
    'tags:',
    tagLines || '  []',
    `created: ${now}`,
    `updated: ${now}`,
    '---'
  ].join('\n')

  return [
    frontmatter,
    '',
    `# ${g.name}`,
    '',
    '## Resumo',
    '',
    contextualSummary || `${g.name} — ${roleWithDoc}`,
    '',
    '## Membros / Representantes',
    '',
    memberLines || '(Nenhum identificado)',
    '',
    '## Papel nos documentos',
    '',
    '| Documento | Papel | Páginas |',
    '| --- | --- | --- |',
    tableRow,
    '',
    '## Anotações investigativas',
    '',
    '(Preenchido posteriormente pelo agente via :::annotation blocks)',
    '',
    '## Connections',
    '',
    '(Auto-gerado pelo renderer via backlinks)',
    ''
  ].join('\n')
}

/**
 * Etapa 5: extrai Group entities, faz dedup e cria/atualiza arquivos em {groupsDir}.
 */
export async function runStepGroups(params: StepGroupsParams): Promise<StepGroupsResult> {
  await ensureDir(params.groupsDir)

  const { content, usage } = await callWithCache(
    params.ctx,
    params.client,
    STANDARD_GROUPS_SYSTEM_PROMPT,
    STANDARD_GROUPS_USER_PROMPT,
    params.timeoutMs ?? 120_000,
    8192
  )

  let groups: GroupExtraction[] = []
  try {
    groups = JSON.parse(extractJsonArray(content)) as GroupExtraction[]
    if (!Array.isArray(groups)) groups = []
  } catch {
    try {
      groups = JSON.parse(repairTruncatedJsonArray(extractJsonArray(content))) as GroupExtraction[]
      if (!Array.isArray(groups)) groups = []
      console.log(`  [step-groups] JSON reparado: ${groups.length} groups.`)
    } catch {
      console.warn('  [step-groups] Falha ao parsear JSON de groups.')
      groups = []
    }
  }

  const created: string[] = []
  const updated: string[] = []
  const now = new Date().toISOString()

  for (const group of groups) {
    if (!group.name) continue

    const match = await findExistingGroup(group, params.groupsDir)
    if (match) {
      await mergeGroupInto(match.filePath, group)
      updated.push(match.filePath)
    } else {
      const slug = slugify(group.name)
      const filePath = path.join(params.groupsDir, `${slug}.md`)
      const markdown = buildGroupMarkdown(group, slug, now)
      await writeUtf8(filePath, markdown)
      created.push(filePath)
    }
  }

  return { created, updated, usage }
}
