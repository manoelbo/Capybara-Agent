/**
 * Prompts e tipos para o comando dig: agente investigativo procurando leads,
 * atualização incremental de conclusões, geração e ranqueamento de linhas investigativas.
 */

export interface DigConclusion {
  summary: string
  keyFindings: string[]
  updatedAt: string
}

export interface DigSuggestedLine {
  title: string
  description: string
  rank: number
  relatedDocIds?: string[]
}

export interface DigFinalResult {
  suggestedLines: DigSuggestedLine[]
  comparisonWithExisting?: string
  recommendation: string
}

export const DIG_SYSTEM_PROMPT = `
Voce e um agente de jornalismo investigativo focado em descobrir leads e indícios para investigacoes.

Sua tarefa e analisar resumos (previews) de documentos e, de forma incremental, ir acumulando conclusoes.
Cada vez que receber um novo preview, compare com as conclusoes anteriores e atualize seu entendimento.
Ao final, voce vai sugerir linhas investigativas (possiveis frentes de apuracao) ranqueadas por relevancia.

Seja objetivo. Baseie-se apenas no que os previews mostram. Nao invente fatos.
Retorne sempre texto claro em Markdown ou JSON conforme o prompt especifico de cada etapa.
`.trim()

export function buildDigIncrementalPrompt(
  previousConclusions: string,
  newPreview: string,
  documentName: string
): string {
  if (!previousConclusions.trim()) {
    return `
Analise o preview do documento abaixo e extraia conclusoes iniciais (resumo, achados principais).

## Documento: ${documentName}

${newPreview}

Retorne um bloco com:
## Resumo
Paragrafo curto do que se trata.

## Achados principais
Lista em tópicos dos pontos mais relevantes para uma investigacao.
`.trim()
  }
  return `
Voce ja tem conclusoes acumuladas da analise de documentos anteriores. Agora receba um novo preview e atualize suas conclusoes.

--- CONCLUSAO ANTERIOR ---
${previousConclusions}
--- FIM CONCLUSAO ANTERIOR ---

--- NOVO DOCUMENTO: ${documentName} ---
${newPreview}
--- FIM NOVO DOCUMENTO ---

Atualize o bloco de conclusao: mantenha o que continua valido, incorpore achados do novo documento, destaque contradicoes ou reforcos.
Retorne um unico bloco com:
## Resumo
Paragrafo atualizado.

## Achados principais
Lista atualizada em topicos.
`.trim()
}

export function buildDigLinesPrompt(conclusions: string): string {
  return `
Com base nas conclusoes acumuladas abaixo, liste possiveis linhas investigativas (frentes de apuracao que um jornalista poderia seguir).

--- CONCLUSAO ACUMULADA ---
${conclusions}
--- FIM ---

Para cada linha sugerida, informe:
- Titulo curto
- Descricao em 1-2 frases do que seria investigado e por que e relevante
- Ranque de 1 (mais importante) a N

Retorne uma lista numerada no formato:
1. **Titulo** — Descricao. (Rank: 1)
2. **Titulo** — Descricao. (Rank: 2)
...
`.trim()
}

export function buildDigRankAndComparePrompt(
  suggestedLinesText: string,
  existingLeadsMarkdown: string
): string {
  return `
Voce sugeriu as seguintes linhas investigativas a partir dos previews analisados:

--- SUGESTOES ---
${suggestedLinesText}
--- FIM SUGESTOES ---

Agora compare com os leads que ja existem no workspace:

--- LEADS EXISTENTES ---
${existingLeadsMarkdown || '(Nenhum lead registrado ainda.)'}
--- FIM LEADS EXISTENTES ---

Tarefas:
1. Escolha as 3 linhas mais promissoras entre suas sugestoes (evitando duplicar o que ja existe).
2. Para cada uma das 3, escreva um paragrafo curto explicando por que e relevante e como se diferencia dos leads existentes (se houver).
3. Ao final, escreva uma recomendacao em uma linha: qual dessas 3 o usuario deveria criar primeiro como lead e por quê.

Formato de saida (use os titulos exatos):
## Linhas sugeridas (top 3)
(para cada uma: titulo, descricao, diferencial)

## Recomendacao
Uma frase orientando o proximo passo (ex.: "Para criar um lead, use o comando /create-lead com a ideia X.").
`.trim()
}
