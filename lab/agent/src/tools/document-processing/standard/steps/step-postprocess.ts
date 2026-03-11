import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { basename } from 'node:path'
import type { NoteItem } from '../../../../core/contracts.js'

export interface PostprocessEntities {
  persons: string[]
  groups: string[]
  places: string[]
  events: string[]
  notes: NoteItem[]
}

export interface StepPostprocessParams {
  artifactDir: string
  entities: PostprocessEntities
}

export interface StepPostprocessResult {
  metadataPath: string
  previewPath: string
}

function toWikiLinks(filePaths: string[]): string[] {
  return filePaths.map((fp) => {
    const name = basename(fp, '.md')
    return `[[${name}]]`
  })
}

function renderNotesSection(notes: NoteItem[]): string {
  if (notes.length === 0) return ''
  const lines = notes
    .sort((a, b) => a.page - b.page)
    .map((note) => {
      const tags = note.tags.length > 0 ? ` [${note.tags.join(', ')}]` : ''
      return `- **${note.category}** — Página ${note.page}: "${note.highlight}"${tags}\n  - ${note.description}`
    })
    .join('\n')
  return `\n## Notes geradas\n\n${lines}\n`
}

function updateMetadataEntities(existingContent: string, entities: PostprocessEntities): string {
  const personsLinks = toWikiLinks(entities.persons).join(', ')
  const groupsLinks = toWikiLinks(entities.groups).join(', ')
  const placesLinks = toWikiLinks(entities.places).join(', ')

  const sectionToAdd = `
## Entidades extraídas (Standard Process)

**persons_mentioned:** ${personsLinks || '(nenhum)'}
**groups_mentioned:** ${groupsLinks || '(nenhum)'}
**places_mentioned:** ${placesLinks || '(nenhum)'}
**events_mentioned:** ${entities.events.map((f) => basename(f)).join(', ') || '(nenhum)'}
**notes_count:** ${entities.notes.length}
`

  // Substitui se ja existe, senao adiciona ao final
  if (existingContent.includes('## Entidades extraídas (Standard Process)')) {
    return existingContent.replace(
      /\n## Entidades extraídas \(Standard Process\)[\s\S]*?(?=\n##|\s*$)/,
      sectionToAdd
    )
  }
  return `${existingContent.trimEnd()}\n${sectionToAdd}`
}

function updatePreviewWithNotes(existingContent: string, notes: NoteItem[]): string {
  if (notes.length === 0) return existingContent

  const notesSection = renderNotesSection(notes)

  // Substitui secao de notes se ja existe
  if (existingContent.includes('## Notes geradas')) {
    return existingContent.replace(/\n## Notes geradas[\s\S]*?(?=\n##|\s*$)/, notesSection)
  }

  // Adiciona antes da ultima secao ou ao final
  return `${existingContent.trimEnd()}\n${notesSection}`
}

/**
 * Etapa 8: pos-processamento apos todas as etapas de extracao.
 * - Atualiza metadata.md com lista de entidades extraidas
 * - Atualiza preview.md com links para as Notes geradas
 */
export async function runStepPostprocess(
  params: StepPostprocessParams
): Promise<StepPostprocessResult> {
  const metadataPath = path.join(params.artifactDir, 'metadata.md')
  const previewPath = path.join(params.artifactDir, 'preview.md')

  // Atualiza metadata.md
  let metadataContent = ''
  try {
    metadataContent = await readFile(metadataPath, 'utf8')
  } catch {
    // metadata.md nao existe ainda, cria basico
    metadataContent = '---\ntype: metadata\n---\n\n# Metadados\n'
  }
  const updatedMetadata = updateMetadataEntities(metadataContent, params.entities)
  await writeFile(metadataPath, updatedMetadata, 'utf8')

  // Atualiza preview.md com links de notes
  let previewContent = ''
  try {
    previewContent = await readFile(previewPath, 'utf8')
  } catch {
    previewContent = ''
  }
  const updatedPreview = updatePreviewWithNotes(previewContent, params.entities.notes)
  await writeFile(previewPath, updatedPreview, 'utf8')

  return { metadataPath, previewPath }
}
