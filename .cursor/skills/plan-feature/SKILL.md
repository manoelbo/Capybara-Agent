---
name: Plan Feature
description: Criar plano de implementação completo para uma feature com análise de codebase e template pronto para o agente de execução.
---

# Skill: Plan Feature

## Missão

Transformar um pedido de feature em um **plano de implementação completo** por meio de: entendimento da feature, análise do codebase e pensamento estratégico. O plano é salvo em `.agents/plans/{kebab-case-descriptive-name}.md`.

**Princípio central:** Nesta fase **não escrevemos código**. O objetivo é produzir um plano rico em contexto para que um agente de execução implemente a feature em **uma passada**, sem precisar de pesquisas adicionais.

**Filosofia:** Context is King. O plano deve conter **toda** a informação necessária para implementação — padrões, leitura obrigatória, documentação, comandos de validação — para que o agente de execução tenha sucesso na primeira tentativa.

---

## Quando usar

- Quando o usuário pedir para **planejar uma nova feature**, **criar um plano de implementação** ou usar o comando **plan-feature**.
- **Passo a passo completo:** O fluxo está no **plano mestre** `.agents/plan-feature-master.md`. O comando plan-feature instrui o agente a executar esse plano sem pular etapas.
- Entrada: nome ou descrição da feature (ex.: "add user authentication", "implementar tool editFile do agente", "sidebar colapsável").

---

## Entrada

- **Feature:** Nome ou descrição em uma frase/parágrafo. Pode ser refinada na Fase 1.

---

## Processo de planejamento (4 fases)

### Fase 1: Feature Understanding

- Extrair o **problema central** e o valor para o usuário.
- Classificar: **Feature Type** (New Capability / Enhancement / Refactor / Bug Fix) e **Complexity** (Low / Medium / High).
- Mapear sistemas/componentes afetados.
- Escrever ou refinar **User Story** no formato:
  - **As a** &lt;tipo de usuário&gt;, **I want** &lt;ação/objetivo&gt;, **So that** &lt;benefício/valor&gt;.
- Se os requisitos estiverem ambíguos, **perguntar ao usuário** antes de continuar.

---

### Fase 2: Codebase Intelligence

**2.1 Análise de estrutura do projeto**

- Detectar linguagem(ns), frameworks e versões.
- Mapear estrutura de diretórios e padrões arquiteturais.
- Identificar fronteiras de serviços/componentes, arquivos de configuração, ambiente e build.
- Procurar `CLAUDE.md`, `.cursor/rules`, convenções do projeto.

**2.2 Reconhecimento de padrões**

- Buscar implementações similares no codebase.
- Documentar convenções: nomenclatura, organização de arquivos, tratamento de erros, logging.
- Extrair padrões do domínio da feature e anti-padrões a evitar.

**2.3 Dependências, testes e integração**

- Listar dependências externas relevantes.
- Identificar framework de testes, estrutura e exemplos de testes.
- Mapear pontos de integração: arquivos a atualizar, novos arquivos e localização, padrões de registro (rotas, APIs, etc.).

- **Esclarecer ambiguidades** com o usuário se necessário (bibliotecas, abordagens, decisões de arquitetura) antes de seguir.

---

### Context7 (opcional)

**Se houver dúvidas ou você achar necessário**, faça pesquisas no **Context7** (MCP) para consultar documentações das bibliotecas envolvidas. Use **apenas em casos de dúvida**; não é obrigatório em todo planejamento. **Se usar:** inclua na seção **Relevant Documentation** do plano não só link e "why", mas também **Key takeaways / Essential content** (2–4 frases ou um snippet mínimo por referência) com o que o implementador precisa saber daquela doc — assim o plano fica autocontido e o executor em outra conversa não precisa reconsultar Context7 (ver seção "Context7 (MCP)" abaixo para ferramentas).

---

### Fase 3: Pensamento estratégico

- Avaliar como a feature se encaixa na arquitetura existente.
- Identificar dependências críticas e ordem de execução.
- Considerar: edge cases, erros, testes, performance, segurança, manutenibilidade.
- Tomar **decisões de design** com justificativa (alternativas, extensibilidade, compatibilidade, escalabilidade).
- Garantir que cada tarefa do plano tenha um **comando de validação** executável.

---

### Fase 4: Geração do plano (template)

Na Fase 4, abrir `.cursor/skills/plan-feature/SKILL.md`, seção **"Template do plano"**, e preencher **todas** as seções com base nas Fases 1–3 (e em referências Context7 apenas se tiver feito pesquisa opcional). Gerar **um único arquivo** em `.agents/plans/{kebab-case-descriptive-name}.md`. Criar o diretório `.agents/plans/` se não existir. Quando a feature tiver UI ou Electron, preencher também a seção **VISUAL / E2E CHECKS** com passos concretos (abrir URL/app, snapshot, verificar elemento, clicar, verificar resultado, screenshot) e indicar se o teste é via Electron (CDP) ou web (localhost/URL).

---

## Template do plano (preencher completamente)

```markdown
# Feature: <feature-name>

The following plan should be complete, but it is important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types and models. Import from the right files etc.

## Feature Description

<Detailed description of the feature, its purpose, and value to users>

## User Story

As a <type of user>
I want <action/goal>
So that <benefit/value>

## Problem Statement

<Clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<Describe the proposed solution approach and how it solves the problem>

## Feature Metadata

**Feature Type**: [New Capability/Enhancement/Refactor/Bug Fix]
**Estimated Complexity**: [Low/Medium/High]
**Primary Systems Affected**: [List of main components/services]
**Dependencies**: [External libraries or services required]

---

## CONTEXT REFERENCES

### Relevant Codebase Files — IMPORTANT: YOU MUST READ THESE BEFORE IMPLEMENTING!

<List files with line numbers and relevance>

- `path/to/file.ts` (lines 15-45) - Why: Contains pattern for X that we'll mirror
- ...

### New Files to Create

- `path/to/new_file.ts` - Purpose
- ...

### Relevant Documentation — YOU SHOULD READ THESE BEFORE IMPLEMENTING! (optional; add if Context7 was used)

<If you consulted Context7 or have doc links — include for each: library, section, why, and Key takeaways / Essential content (2–4 sentences or a minimal code snippet the executor must know). The plan must be self-contained so the executor in a new conversation does not need to re-query Context7.>

- [Documentation Link 1](url#section)
  - Specific section: ...
  - Why: ...
  - **Key takeaways / Essential content:** (e.g. API signature, short example, or caveat the implementer needs)
- ...

### Patterns to Follow

**Naming Conventions:** (from codebase)

**Error Handling:** (from codebase)

**Logging Pattern:** (from codebase)

**Other Relevant Patterns:** (from codebase)

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation
**Tasks:** ...

### Phase 2: Core Implementation
**Tasks:** ...

### Phase 3: Integration
**Tasks:** ...

### Phase 4: Testing & Validation
**Tasks:** ...

---

## STEP-BY-STEP TASKS

Execute every task in order, top to bottom. Each task is atomic and independently testable.

**Task format guidelines:** CREATE | UPDATE | ADD | REMOVE | REFACTOR | MIRROR

### {ACTION} {target_file}
- **IMPLEMENT**: {detail}
- **PATTERN**: {file:line}
- **IMPORTS**: {imports}
- **GOTCHA**: {constraints}
- **VALIDATE**: `{command}`

<Continue for all tasks in dependency order...>

---

## TESTING STRATEGY

### Unit Tests
### Integration Tests
### Edge Cases

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
### Level 2: Unit Tests
### Level 3: Integration Tests
### Level 4: Manual Validation
### Level 5: Additional (e.g. MCP)

---

## ACCEPTANCE CRITERIA

- [ ] ...
- [ ] ...

---

## VISUAL / E2E CHECKS (opcional — preencher quando a feature tiver UI ou Electron)

Quando a feature envolver interface ou app desktop, descrever passos concretos para o agente validar no navegador. O executor usará skill electron (CDP) ou MCP cursor-ide-browser (web); se houver skill/plugin Vercel para preview ou teste em browser, seguir suas orientações.

**Tipo de teste:** [ ] Electron (CDP)  [ ] Web (localhost/URL)

**Passos (exemplo):**
1. Abrir [URL ou app com CDP]; fazer snapshot.
2. Verificar que [elemento/fluxo X] está visível.
3. Clicar em [alvo Y]; verificar que [resultado Z].
4. Screenshot final para registro.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed
- [ ] All validation commands executed successfully
- [ ] Full test suite passes
- [ ] No linting/type errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria met

---

## NOTES

<Design decisions, trade-offs>
```

---

## Context7 (MCP) — opcional

Use **apenas se houver dúvidas ou você achar necessário** consultar documentações. Servidor: `plugin-context7-plugin-context7`. Ferramentas: **resolve-library-id** (`query`, `libraryName`) para obter library ID; **query-docs** (`libraryId`, `query`) para perguntas específicas. Ao preencher a seção **Relevant Documentation** do plano, inclua para cada referência: link, seção, motivo (**Why**) e **Key takeaways / Essential content** (2–4 frases ou snippet mínimo) com o que o executor precisa saber — para que o plano seja autocontido em outra conversa.

---

## Critérios de qualidade do plano

- **Context completeness:** Padrões identificados, libs documentadas com links **e key takeaways** (conteúdo essencial no plano), integrações mapeadas, gotchas e anti-padrões registrados; toda tarefa com comando de validação.
- **Implementation ready:** Um desenvolvedor (ou agente) consegue executar sem contexto extra; tarefas em ordem de dependência; cada tarefa atômica e testável; referências com file:line.
- **Pattern consistency:** Tarefas seguem convenções do projeto; testes alinhados aos padrões existentes.
- **Information density:** Referências específicas e acionáveis; URLs com âncora quando possível; comandos de validação não interativos.

---

## Relatório final

Após gerar o plano, apresentar ao usuário:

1. **Resumo** da feature e da abordagem.
2. **Caminho completo** do arquivo criado: `.agents/plans/{kebab-case-descriptive-name}.md`.
3. **Complexidade** estimada.
4. **Riscos ou considerações** principais para a implementação.
5. **Confiança (1–10)** de que a execução terá sucesso em uma passada.

---

## Nome do arquivo e diretório

- **Diretório:** `.agents/plans/` (criar se não existir).
- **Nome do arquivo:** `{kebab-case-descriptive-name}.md` (ex.: `add-user-authentication.md`, `implement-editfile-tool.md`, `sidebar-collapsible.md`).
