# Master Plan: Planejamento de Feature

**Use este documento quando o usuário pedir para planejar uma feature (comando plan-feature ou equivalente).** Execute **todas** as etapas na ordem; não pule etapas.

**Entrada:** A descrição da feature vem em **$ARGUMENTS** (ou na mensagem do usuário). Se estiver vazia, peça a descrição antes de começar.

**Princípio:** Nesta fase **não se escreve código**. O resultado é um único arquivo em `.agents/plans/{kebab-case-name}.md` com contexto completo para implementação em uma passada.

---

## Fase 1: Feature Understanding

- Extrair o **problema central** e o valor para o usuário.
- Classificar **Feature Type:** New Capability | Enhancement | Refactor | Bug Fix.
- Classificar **Complexity:** Low | Medium | High.
- Mapear sistemas/componentes afetados.
- Escrever **User Story:** *As a &lt;tipo de usuário&gt;, I want &lt;ação/objetivo&gt;, So that &lt;benefício/valor&gt;.*
- Se requisitos estiverem ambíguos, **perguntar ao usuário** e só então continuar.

---

## Fase 2: Codebase Intelligence

### 2.1 Análise de estrutura do projeto

- Detectar linguagem(ns), frameworks e versões.
- Mapear diretórios e padrões arquiteturais; fronteiras de componentes; configs (package.json, etc.); build e ambiente.
- Procurar `CLAUDE.md`, `.cursor/rules`, convenções.

### 2.2 Reconhecimento de padrões

- Buscar implementações similares no codebase.
- Documentar convenções: nomenclatura, organização de arquivos, erro, logging.
- Extrair padrões do domínio e anti-padrões a evitar.

### 2.3 Dependências, testes e integração

- Listar dependências externas relevantes; framework de testes e exemplos; pontos de integração (arquivos a atualizar, novos arquivos, padrões de registro).
- Esclarecer ambiguidades com o usuário se necessário antes de seguir.

---

## Context7 (opcional)

**Se houver dúvidas ou você achar necessário**, faça pesquisas no **Context7** (MCP) para consultar documentações das bibliotecas envolvidas. Servidor: `plugin-context7-plugin-context7`; ferramentas: **resolve-library-id** (obter library ID) e **query-docs** (perguntas específicas). Use **apenas em casos de dúvida**; não é obrigatório em todo planejamento. Se usar, inclua na seção **Relevant Documentation** do plano, para cada referência: link, seção, motivo e **Key takeaways / Essential content** (2–4 frases ou snippet mínimo) para o plano ficar autocontido para o executor em outra conversa.

---

## Fase 3: Pensamento estratégico

- Avaliar encaixe na arquitetura existente; dependências críticas e ordem de execução.
- Considerar edge cases, erros, testes, performance, segurança, manutenibilidade.
- Tomar decisões de design com justificativa.
- Garantir que **cada tarefa** do plano tenha pelo menos **um comando de validação** executável.

---

## Fase 4: Geração do plano

- **Arquivo de saída:** `.agents/plans/{kebab-case-descriptive-name}.md` (ex.: `implement-editfile-tool.md`, `sidebar-collapsible.md`). Criar o diretório `.agents/plans/` se não existir.
- **Template completo:** Usar a estrutura em `.cursor/skills/plan-feature/SKILL.md` (seção "Template do plano") e preencher **todas** as seções com base nas Fases 1–3 (e em referências Context7 apenas se tiver feito pesquisa opcional):
  - Feature Description, User Story, Problem Statement, Solution Statement, Feature Metadata
  - **CONTEXT REFERENCES:** Relevant Codebase Files (com file:line e Why), New Files to Create, Relevant Documentation (se aplicável: link, why e **Key takeaways / Essential content** por referência), Patterns to Follow
  - IMPLEMENTATION PLAN (Foundation, Core, Integration, Testing)
  - STEP-BY-STEP TASKS (formato: ACTION target_file; IMPLEMENT, PATTERN, IMPORTS, GOTCHA, VALIDATE)
  - TESTING STRATEGY, VALIDATION COMMANDS, ACCEPTANCE CRITERIA, COMPLETION CHECKLIST, NOTES

---

## Relatório final (ao usuário)

Após escrever o arquivo do plano, apresentar:

1. **Resumo** da feature e da abordagem.
2. **Caminho completo** do plano: `.agents/plans/{kebab-case-descriptive-name}.md`.
3. **Complexidade** estimada.
4. **Riscos ou considerações** principais.
5. **Confiança (1–10)** de que a execução terá sucesso em uma passada.
