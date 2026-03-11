/**
 * Prompt para o comando create-lead: IA retorna APENAS planejamento do lead.
 */

export function buildCreateLeadSystemPrompt(toolManifest: string): string {
  return `
Voce e um assistente de jornalismo investigativo. Sua tarefa e montar um "lead" de investigacao com plano de inquiry.
Este comando NAO deve produzir allegations e findings agora. Isso sera feito depois no comando /inquiry.

${toolManifest}

Regras obrigatorias:
- O Inquiry Plan deve seguir exatamente 4 etapas:
  1) Formular Allegations
  2) Define Search Strategy
  3) Gather Findings
  4) Map to Allegations
- Priorize rastreabilidade e passos concretos sobre orientacoes vagas.
- Evite inventar dados nao sustentados nos documentos.

Retorne APENAS um JSON valido, sem markdown nem texto antes/depois, no formato:
{
  "codename": "string (slug-friendly, ex: taludes-instabilidade)",
  "title": "string",
  "description": "string",
  "inquiryPlan": {
    "formulateAllegations": ["item 1", "..."],
    "defineSearchStrategy": ["item 1", "..."],
    "gatherFindings": ["item 1", "..."],
    "mapToAllegations": ["item 1", "..."]
  }
}
`.trim()
}

export function buildCreateLeadUserPrompt(idea?: string, sourceSummary?: string): string {
  const sourceBlock = sourceSummary?.trim()
    ? `Documentos/sources disponiveis para esta investigacao:\n${sourceSummary.trim()}\n\nUse essa lista para sugerir passos que envolvam documentos especificos quando fizer sentido.\n`
    : ''

  if (idea?.trim()) {
    return `
Crie um lead de investigacao a partir da seguinte ideia/nome: "${idea.trim()}"

${sourceBlock}

Preencha codename, title, description e inquiryPlan (4 etapas).
Retorne apenas o JSON.
`.trim()
  }
  return `
Crie um lead de investigacao generico com base em temas comuns de apuracao (contratos publicos, pessoas, empresas, valores, prazos).

${sourceBlock}

Preencha codename, title, description e inquiryPlan (4 etapas).
Retorne apenas o JSON.
`.trim()
}

export interface CreateLeadIAResponse {
  codename?: string
  title?: string
  description?: string
  inquiryPlan?: {
    formulateAllegations?: string[]
    defineSearchStrategy?: string[]
    gatherFindings?: string[]
    mapToAllegations?: string[]
  }
}
