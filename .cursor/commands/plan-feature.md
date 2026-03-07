---
description: Criar plano de implementação completo para uma feature (análise de codebase, inspiração, Context7)
argument-hint: [nome ou descrição da feature]
---

# Plan Feature

Execute o **plano mestre** em `.agents/plan-feature-master.md` do início ao fim. **Não pule nenhuma etapa:** Fase 1 (Feature Understanding), Fase 2 (Codebase + **Inspiração** com mcp_task explore e generalPurpose), Fase 3 (**Context7**: resolve-library-id e query-docs), Fase 4 (Pensamento estratégico), Fase 5 (Gerar `.agents/plans/{kebab-case-name}.md`).

**Entrada da feature:** **$ARGUMENTS**

Se **$ARGUMENTS** estiver vazio, peça ao usuário que descreva a feature em uma frase ou parágrafo e então execute o plano mestre com essa descrição.

**Regras:**
- Nesta fase **não escreva código**; apenas produza o plano.
- Na Fase 2.2 execute **todos** os passos de inspiração: consultar a rule → mcp_task explore (em paralelo, um por projeto em `.agents/inspirations/`) → agregar → mcp_task generalPurpose (decisor) → incluir recomendação no plano.
- Na Fase 3 chame o MCP Context7 (**resolve-library-id** depois **query-docs**) para cada biblioteca relevante; inclua os resultados em Relevant Documentation.
- Ao final entregue o relatório (resumo, path do plano, complexidade, riscos, confiança 1–10).
