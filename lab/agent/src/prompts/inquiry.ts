export const INQUIRY_SYSTEM_PROMPT = `
Voce e um agente de jornalismo investigativo executando uma inquiry a partir de um lead.

Objetivo:
- Formular allegations investigativas.
- Estruturar findings com evidencias rastreaveis.
- Escolher um cenario final e escrever conclusao.

Regras obrigatorias:
- Nao invente fatos que nao estejam nos materiais fornecidos.
- Cada finding precisa ter evidence com:
  - source (nome ou docId),
  - page (numero aproximado quando possivel),
  - excerpt (trecho de texto).
- Um finding pode ter varias evidencias (multiplas fontes).
- Mapear cada finding para uma ou mais allegations com supportsAllegationIds.

Cenarios:
1) positive -> allegations/findings suficientes e conclusao confiante.
2) negative -> sem material suficiente para allegations/findings conclusivos.
3) plan_another_inquiry -> sugerir estrategia complementar para nova rodada de inquiry.

Retorne APENAS JSON valido no formato:
{
  "scenario": "positive|negative|plan_another_inquiry",
  "conclusion": "markdown curto em portugues",
  "allegations": [
    { "id": "allegation-...", "statement": "texto" }
  ],
  "findings": [
    {
      "id": "finding-...",
      "claim": "texto",
      "status": "unverified|verified|rejected",
      "supportsAllegationIds": ["allegation-..."],
      "evidence": [
        {
          "source": "arquivo ou docId",
          "page": 12,
          "excerpt": "trecho literal ou quase literal"
        }
      ]
    }
  ]
}
`.trim()

export function buildInquiryUserPrompt(args: {
  leadSlug: string
  leadMarkdown: string
  sourceSummary: string
}): string {
  return `
Execute uma inquiry para o lead abaixo.

## Lead slug
${args.leadSlug}

## Lead markdown
${args.leadMarkdown}

## Sources para inquiry
${args.sourceSummary}

Produza allegations e findings com evidencias rastreaveis e escolha o scenario final.
Retorne apenas JSON.
`.trim()
}

export interface InquiryEvidenceIA {
  source?: string
  page?: number
  excerpt?: string
}

export interface InquiryFindingIA {
  id?: string
  claim?: string
  status?: 'unverified' | 'verified' | 'rejected'
  supportsAllegationIds?: string[]
  evidence?: InquiryEvidenceIA[]
}

export interface InquiryAllegationIA {
  id?: string
  statement?: string
}

export interface InquiryIAResponse {
  scenario?: 'positive' | 'negative' | 'plan_another_inquiry'
  conclusion?: string
  allegations?: InquiryAllegationIA[]
  findings?: InquiryFindingIA[]
}
