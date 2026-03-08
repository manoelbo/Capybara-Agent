---
description: Criar plano de implementação completo para uma feature (análise de codebase)
argument-hint: [nome ou descrição da feature]
---

# Plan Feature

Usar a **skill Plan Feature** (`.cursor/skills/plan-feature/SKILL.md`) e executar o **plano mestre** em `.agents/plan-feature-master.md` do início ao fim. **Não pule nenhuma etapa:** Fase 1 (Feature Understanding), Fase 2 (Codebase Intelligence), Fase 3 (Pensamento estratégico), Fase 4 (Gerar `.agents/plans/{kebab-case-name}.md`).

**Entrada da feature:** **$ARGUMENTS**

Se **$ARGUMENTS** estiver vazio, peça ao usuário que descreva a feature em uma frase ou parágrafo e então execute o plano mestre com essa descrição.

**Regras:**
- Nesta fase **não escreva código**; apenas produza o plano.
- **Context7:** Se houver dúvidas ou você achar necessário, faça pesquisas no Context7 (MCP) para consultar documentações; use **apenas em casos de dúvida**.
- Ao final **gerar** o arquivo `.agents/plans/{kebab-case-name}.md` conforme o template da skill e entregar o relatório final (resumo, path do plano, complexidade, riscos, confiança 1–10).
