# Feature: Comandos dig e create-lead (Agent Lab)

O plano deve ser completo; valide documentação, padrões do codebase e sanidade das tarefas antes de implementar.

Preste atenção aos nomes de utils, tipos e modelos existentes. Importe dos arquivos corretos.

## Feature Description

Dois novos comandos no Agent Lab CLI:

1. **dig** — Fluxo de “escavação” inspirado no notebook *Long Context LLMs para Reportagem Investigativa*: o agente lê previews de documentos de forma incremental (um preview → conclusões; adiciona outro → compara e atualiza conclusões), até acabar os previews disponíveis. Em seguida analisa possíveis linhas investigativas, ranqueia, sugere três ao usuário, compara com as investigações já existentes em `output/investigations` e orienta o uso de `/create-lead`.

2. **create-lead** — Cria um lead (investigação inicial) na pasta `output/investigations` com codinome/ideia (ex.: `lead-cartel-combination`), título, descrição e **planos**. O plano é um checklist de passos que o agente deve executar para aprofundar o lead (buscar pessoas/lugares nos documentos, comparar valores, usar documento réplica, trechos de PDF, buscas na internet, etc.). A IA monta título, descrição e checklist; **não** cria clues nem linhas investigativas ainda.

## User Story

**As a** investigador usando o Agent Lab,  
**I want** rodar `/dig` para descobrir possíveis linhas investigativas a partir dos previews em `lab/agent/filesystem/source`, e depois usar `/create-lead` para registrar um lead com plano de ação,  
**So that** eu tenha sugestões ranqueadas de por onde investigar e um markdown de lead com checklist acionável para o agente.

## Problem Statement

- O **init** já gera um entendimento inicial a partir de previews aleatórios, mas não produz **linhas investigativas** nem sugere leads de forma estruturada.
- Não existe comando para criar um “lead” com plano de investigação (checklist) sem passar pelo pipeline pesado do **investigate** (plan + extração + insights + linhas + conclusões + dossier).
- O notebook de referência mostra uma estratégia incremental (adicionar um contrato/resumo por vez, atualizar insights, depois gerar linhas de investigação) que queremos replicar no lab com previews, sem orçamento de tokens.

## Solution Statement

- **dig**: Novo runner `run-dig.ts` que (1) usa prompt de agente investigativo procurando leads; (2) carrega previews de forma **incremental** (começa com um aleatório, chama IA para conclusões; adiciona outro preview ao contexto, pede comparação e novas conclusões; repete até acabar os previews); (3) com o contexto acumulado, gera lista de linhas investigativas, ranqueia e escolhe 3 sugestões; (4) lê conteúdo das pastas em `output/investigations` (investigation.md existentes) e compara com as 3 sugestões; (5) devolve mensagem ao usuário explicando as 3 linhas e instruindo uso de `/create-lead`.
- **create-lead**: Novo runner `run-create-lead.ts` que (1) chama a IA com contexto do que é um lead e quais tipos de passos compõem um “plano” (buscar pessoas, lugares, comparar valores, usar replica, trechos de PDF, buscas na internet, etc.); (2) a IA retorna codinome, título, descrição e checklist (planos); (3) chama `createInvestigation` com slug = codinome (ex.: `lead-cartel-combination`), título, descrição, hipótese (opcional) e checklist; não cria clues nem linhas.

Fontes de dados:
- **Previews**: `lab/agent/filesystem/source/.artifacts/<docId>/preview.md`; lista de candidatos via `listPreviewCandidates` + checkpoint `lab/agent/filesystem/source/source-checkpoint.json`.
- **Leads existentes**: `lab/agent/filesystem/investigation/leads/` (ler para comparação no dig).

## Feature Metadata

**Feature Type**: New Capability  
**Estimated Complexity**: High  
**Primary Systems Affected**: `lab/agent` (runner, prompts, CLI, fs-io)  
**Dependencies**: OpenRouter (existente), estrutura de `lab/agent/filesystem/source` e `lab/agent/filesystem`

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `lab/agent/src/core/paths.ts` — `LabPaths`: `sourceDir`, `sourceArtifactsDir`, `investigationsDir`, `outputDir`.
- `lab/agent/src/core/fs-io.ts` — `loadRandomPreviewsWithinBudget`, `listPreviewCandidates`, `readSourceCheckpoint`, `estimateTokens`, `PreviewItem`, `RandomPreviewsResult`.
- `lab/agent/src/runner/run-init.ts` — Uso de `loadRandomPreviewsWithinBudget`, feedback, OpenRouterClient, prompt de agente investigativo.
- `lab/agent/src/runner/run-create-line.ts` — Interface de create-line e uso de `createInvestigationLine`.
- `lab/agent/src/tools/investigative/create-investigation.ts` — `CreateInvestigationInput` (title, question, description, hypothesis, checklist, relatedContracts); `createInvestigation` escreve pasta em `investigationsDir` com `investigation.md`.
- `lab/agent/src/index.ts` — Parse de comandos e flags; adicionar casos `dig` e `create-lead`.
- `lab/agent/ref/Long Context LLMs para Reportagem Investigativa (1).ipynb` — Estratégia: Block 6 (análise cumulativa, um contrato por vez, atualizar insights); Block 7 (criar linhas de investigação a partir dos insights); comparação com artefatos existentes.
- `lab/agent/filesystem/source/source-checkpoint.json` — Estrutura: `files[]` com `docId`, `originalFileName`, `artifactDir`; status dos documentos.
- `lab/agent/filesystem/source/.artifacts/<docId>/preview.md` — Conteúdo do preview (frontmatter + resumo executivo, key points, people, places, timeline).

### New Files to Create

- `lab/agent/src/prompts/dig.ts` — Prompts do dig: sistema (agente investigativo procurando leads), atualização incremental de conclusões, geração de linhas investigativas, ranqueamento e comparação com investigações existentes.
- `lab/agent/src/runner/run-dig.ts` — Orquestração: carregar previews incrementalmente, chamadas à IA, leitura de investigations existentes, mensagem final com sugestão de /create-lead.
- `lab/agent/src/runner/run-create-lead.ts` — Chamada à IA para montar codinome, título, descrição, planos (checklist); chamada a `createInvestigation`; sem clues/lines.

### Relevant Documentation

- Notebook ref: estratégia incremental (adicionar um documento, atualizar insights, repetir); depois gerar linhas de investigação a partir dos insights; formato de saída com “Investigação N” e “Contratos Relacionados”.

### Patterns to Follow

**Naming Conventions:** `run-<comando>.ts` para runners; prompts em `src/prompts/<nome>.ts`.  
**Error Handling:** Validar parâmetros no início do runner; usar `resolveRuntimeConfig` e paths de `LabPaths`.  
**Logging/Feedback:** Usar `createFeedbackController` com sessionName (`dig`, `create-lead`) e `feedback.step` / `feedback.finalSummary` como em `run-init.ts`.

---

## IMPLEMENTATION PLAN

### Phase 1: Prompts e tipos para dig
- Definir em `dig.ts` system prompt do agente investigativo (procurando leads/indícios).
- Prompt para “atualizar conclusões” dado contexto anterior + novo preview.
- Prompt para “gerar linhas investigativas” a partir das conclusões acumuladas.
- Prompt para “ranquear e escolher 3 linhas” e “comparar com investigações existentes”.
- Tipos TypeScript para: conclusão incremental, linha investigativa sugerida, resultado final do dig.

### Phase 2: Carregamento incremental de previews
- Em `fs-io.ts` (ou em módulo usado só pelo dig): função que retorna uma **sequência** de previews (reutilizar lista embaralhada de `listPreviewCandidates` + leitura de `preview.md` um a um), permitindo ao dig processar um preview por vez e acumular “conclusões anteriores” + “novo preview” para a IA a cada passo.

### Phase 3: Runner run-dig
- Implementar `run-dig.ts`: resolver paths, criar feedback, carregar previews de forma incremental.
- Loop: (a) enviar primeiro preview (ou conclusões anteriores + próximo preview) para IA; (b) obter conclusões; (c) acumular; (d) repetir até fim dos previews.
- Chamada à IA para listar e ranquear linhas investigativas; escolher 3.
- Listar pastas em `investigationsDir`, ler `investigation.md` de cada uma (título/descrição) e incluir no prompt de “comparação”.
- Mensagem final em texto/Markdown explicando as 3 linhas e instruindo: “Para criar um lead, use o comando /create-lead”.
- Registrar comando `dig` no `index.ts` (e no README do lab).

### Phase 4: create-lead — prompt e runner
- Criar prompt (em `dig.ts` ou novo arquivo `create-lead.ts`) que descreve o que é um lead: codinome (slug), título, descrição, planos (checklist). Exemplos de itens do plano: buscar pessoas nos documentos de source, lugares, comparar valores, usar documento réplica para PDFs, trechos específicos de contrato para análise, buscas na internet para enriquecer contexto.
- Runner `run-create-lead.ts`: opção de passar “nome/ideia do lead” como argumento (ex.: `--idea "cartel combinação"`) ou deixar a IA sugerir; chamar IA para retornar objeto { codename, title, description, hypothesis?, plans: string[] }; normalizar codename para slug (ex.: lead-cartel-combination); chamar `createInvestigation` com title, question (pode ser descrição ou título), description, hypothesis, checklist = plans; não criar clues nem lines.
- Registrar comando `create-lead` no `index.ts` e README.

### Phase 5: Integração CLI e documentação
- `index.ts`: casos `dig` e `create-lead` no switch; flags opcionais apenas para create-lead (ex.: `--idea`).
- README do lab: documentar `/dig` e `/create-lead` e fluxo recomendado (init → agent-instructions → dig → create-lead).

---

## STEP-BY-STEP TASKS

Execute na ordem. Cada tarefa é atômica e testável.

### CREATE lab/agent/src/prompts/dig.ts
- **IMPLEMENT**: Constantes de system prompt para agente investigativo (procurando leads). Funções: `buildDigIncrementalPrompt(previousConclusions, newPreview, documentName)`, `buildDigLinesPrompt(conclusions)`, `buildDigRankAndComparePrompt(suggestedLines, existingInvestigationsMarkdown)`. Tipos: `DigConclusion`, `DigSuggestedLine`, `DigFinalResult`.
- **PATTERN**: `lab/agent/src/prompts/investigation.ts` para estilo de prompts e exports.
- **VALIDATE**: `pnpm --dir lab/agent run typecheck`

### ADD lab/agent/src/core/fs-io.ts — função para sequência de previews
- **IMPLEMENT**: `loadPreviewsIncremental(sourceArtifactsDir, sourceDir): Promise<{ previews: PreviewItem[] }>` que retorna lista ordenada (aleatória) de previews. Reutilizar `listPreviewCandidates` + shuffle + leitura de cada `preview.md`; sem orçamento de tokens.
- **PATTERN**: Mesmo padrão de `loadRandomPreviewsWithinBudget` mas retornando a lista completa de previews disponíveis em ordem aleatória.
- **VALIDATE**: `pnpm --dir lab/agent run typecheck`

### CREATE lab/agent/src/runner/run-dig.ts
- **IMPLEMENT**: Resolver runtime/paths; criar feedback sessionName `dig`. Carregar previews com `loadPreviewsIncremental(...)`. Loop: para i = 0..previews.length-1, montar contexto = conclusões anteriores + preview[i]; chamar IA com `buildDigIncrementalPrompt`; acumular conclusões. Depois chamar IA para linhas com `buildDigLinesPrompt`; depois ranquear e comparar com investigações existentes (ler `investigationsDir`, para cada subpasta ler `investigation.md` e extrair título/descrição). Retornar texto final com 3 linhas sugeridas e instrução para /create-lead. Escrever opcionalmente relatório em `output/reports/dig-<timestamp>.md`.
- **IMPORTS**: resolveRuntimeConfig, paths, OpenRouterClient, fs-io (loadPreviewsIncremental, readFile), prompts/dig, createFeedbackController.
- **VALIDATE**: `pnpm --dir lab/agent run typecheck`

### CREATE lab/agent/src/runner/run-create-lead.ts
- **IMPLEMENT**: Opção `--idea "<texto>"` ou sem idea (IA gera). Prompt para IA retornar JSON: { codename, title, description, hypothesis?, plans: string[] }. plans = checklist (ex.: "Buscar todas as pessoas mencionadas nos documentos de source", "Comparar valores de contratos entre documentos", "Usar documento réplica para PDFs quando precisar de trecho completo"). Normalizar codename com slugify; garantir prefixo `lead-` se não tiver. Chamar `createInvestigation` com title, question: description, description, hypothesis: hypothesis ?? '', checklist: plans, relatedContracts: []. Não criar clues nem lines.
- **PATTERN**: run-create-line.ts para uso de createInvestigation/createInvestigationLine; create-investigation.ts para input.
- **VALIDATE**: `pnpm --dir lab/agent run typecheck`

### UPDATE lab/agent/src/index.ts
- **IMPLEMENT**: Adicionar casos `dig` e `create-lead` no switch. dig: chamar runDig (sem parâmetros obrigatórios). create-lead: flags --idea "<texto>"; chamar runCreateLead.
- **PATTERN**: Mesmo estilo dos outros casos (plan, investigate, create-line).
- **VALIDATE**: `pnpm --dir lab/agent run typecheck`

### UPDATE lab/agent/README.md
- **IMPLEMENT**: Documentar comando dig (o que faz, exemplo de uso, saída em reports/dig-*.md e mensagem final). Documentar create-lead (--idea opcional, exemplo). Atualizar fluxo recomendado: init → agent-instructions → dig → create-lead.
- **VALIDATE**: Leitura manual

---

## TESTING STRATEGY

### Unit Tests
- `loadPreviewsIncremental` com mock de diretório ou fixtures: verificar que retorna lista de previews em ordem aleatória (seed opcional para teste).
- Parsing do JSON de create-lead (codename, title, description, plans) com resposta simulada da IA.

### Integration Tests
- dig: com 2–3 previews pequenos em lab/agent/filesystem/source, rodar dig e verificar que gera relatório e mensagem com sugestão de /create-lead.
- create-lead: rodar create-lead --idea "teste lead" e verificar que existe `output/investigations/lead-teste-lead/investigation.md` com checklist.

### Edge Cases
- dig sem previews: falhar com mensagem clara. dig com apenas 1 preview: ainda assim gerar “linhas” a partir desse único documento. create-lead com idea vazia: IA gera codename/título/descrição/planos.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
- `pnpm --dir lab/agent run typecheck`

### Level 2: Unit Tests
- `pnpm --dir lab/agent run test`

### Level 3: Integration / Manual
- Na raiz: `pnpm reverso dig` (com lab/agent/filesystem/source populado).
- `pnpm reverso create-lead --idea "cartel combinação"` e inspecionar `lab/agent/output/investigations/lead-cartel-combinacao/investigation.md`.

---

## ACCEPTANCE CRITERIA

- [ ] Comando `dig` existe e pode ser invocado via `pnpm reverso dig` ou `pnpm --dir lab/agent run dig`.
- [ ] dig carrega previews de lab/agent/filesystem/source de forma incremental, mantém conclusões acumuladas até o fim dos previews.
- [ ] dig gera lista de linhas investigativas, ranqueia e sugere 3; compara com investigações em output/investigations; exibe mensagem final com instrução para /create-lead.
- [ ] Comando `create-lead` existe e pode ser invocado com ou sem `--idea`.
- [ ] create-lead cria pasta em output/investigations com slug tipo lead-* e investigation.md contendo título, descrição, hipótese e checklist (planos) montados pela IA; sem clues nem linhas.
- [ ] README do lab atualizado com dig e create-lead.

---

## NOTES

- **Formato das “linhas” no dig**: Podem ser texto livre no prompt (ex.: “Linha 1: …”, “Linha 2: …”) e parse simples para exibir as 3; ou JSON estruturado se a IA for chamada com response format JSON.
- **create-lead vs createInvestigation**: Reutilizar createInvestigation garante consistência com o resto do lab (investigation.md, pasta clues/, lines/). O lead é uma investigação “inicial” só com checklist; clues e lines virão depois quando o usuário rodar outras etapas.
- **Comparação com investigações existentes**: Objetivo é evitar sugerir leads muito parecidos com o que já existe; o prompt do dig deve receber títulos/descrições das pastas em investigationsDir e pedir à IA para destacar diferenças ou sobreposição.
