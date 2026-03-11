import type { ToolName } from '../core/tool-registry.js'

export interface ToolManifestItem {
  name: ToolName
  description: string
  whenToUse: string
}

export const TOOL_MANIFEST: ToolManifestItem[] = [
  {
    name: 'createDossierEntity',
    description: 'Cria entidades do dossie (person, group, place) em arquivos dedicados.',
    whenToUse: 'Quando identificar atores, organizacoes ou locais que devem ser materializados.'
  },
  {
    name: 'createTimelineEvent',
    description: 'Cria eventos na timeline mensal do dossie com data, atores e descricao.',
    whenToUse: 'Quando houver marco temporal relevante para ordenar os acontecimentos.'
  },
  {
    name: 'linkEntities',
    description: 'Adiciona conexoes [[wiki-links]] entre entidades em um arquivo markdown.',
    whenToUse: 'Quando precisar explicitar relacoes entre atores, locais e documentos.'
  },
  {
    name: 'processSourceTool',
    description:
      'Executa subcomandos de processamento da pasta source (fila, status, selecao e monitoramento).',
    whenToUse:
      'Quando precisar gerar/atualizar artefatos em source/.artifacts antes de init, dig, create-lead ou inquiry.'
  }
]

export function getToolManifestForPrompt(items: ToolManifestItem[] = TOOL_MANIFEST): string {
  const lines = items.map(
    (item, idx) =>
      `${idx + 1}. ${item.name}\n- descricao: ${item.description}\n- quando_usar: ${item.whenToUse}`
  )
  return ['Ferramentas disponiveis do agente:', ...lines].join('\n')
}
