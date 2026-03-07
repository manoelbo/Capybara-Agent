# Master Plan: Planejamento de Feature

**Use este documento quando o usuário pedir para planejar uma feature (comando plan-feature ou equivalente).** Execute **todas** as etapas na ordem; não pule inspiração nem Context7.

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

## Fase 2: Codebase Intelligence + Inspiração

### 2.1 Análise de estrutura do projeto

- Detectar linguagem(ns), frameworks e versões.
- Mapear diretórios e padrões arquiteturais; fronteiras de componentes; configs (package.json, etc.); build e ambiente.
- Procurar `CLAUDE.md`, `.cursor/rules`, convenções.

### 2.2 Inspiração — EXECUTAR TODOS OS PASSOS ABAIXO

**2.2.1** Consultar a rule `.cursor/rules/capybara-agent-inspiration.mdc` e obter a lista de projetos e critérios de decisão. Projetos: `open-cowork`, `Trilium`, `aider`, `learn-claude-code`, `opencode`. Confirmar quais pastas existem em `.agents/inspirations/`.

**2.2.2** Disparar subagentes **explore em paralelo** (um por projeto existente):
- Ferramenta: **mcp_task**
- Parâmetros: `subagent_type: "explore"`, `description` curta (ex.: "research open-cowork for feature topic")
- **Prompt** a enviar em cada chamada (substituir `<PROJETO>` e `<TÓPICO_DA_FEATURE>`):

```
No repositório em .agents/inspirations/<PROJETO>/, pesquise como o projeto aborda o seguinte tópico:

"<TÓPICO_DA_FEATURE>"

Responda em 3–5 frases: o que esse projeto faz de relevante para esse tópico (estrutura, padrões, arquivos-chave). Se não achar nada relevante, diga "Nenhuma referência clara para este tópico."
```

- Disparar **todas** as chamadas mcp_task explore **em paralelo** (mesma rodada), uma por pasta existente.

**2.2.3** Agregar as respostas dos subagentes explore em um único bloco de texto, identificando cada projeto por nome.

**2.2.4** Disparar **um** subagente decisor:
- Ferramenta: **mcp_task**
- Parâmetros: `subagent_type: "generalPurpose"`, `description`: "decide which inspiration projects to recommend"
- **Prompt** (colar resumos agregados e tópico; incluir critérios da rule):

```
Você é o decisor de inspiração do projeto Capybara Agent. Receba os resumos abaixo e o tópico original. Com base nos critérios de decisão fornecidos, recomende qual(is) projeto(s) seguir para esse tópico e por quê.

Tópico original: "<TÓPICO_DA_FEATURE>"

Critérios de decisão (da rule):
- Arquitetura de agente e ferramentas → preferir learn-claude-code e opencode.
- Edição precisa de trechos de documento → adaptar com aider.
- Estrutura de app desktop, chat e UI → open-cowork.
- Organização de árvore, menu e Markdown → Trilium.
- Ideias criativas ou fora da curva → considerar opencode e learn-claude-code.

Resumos por projeto:
[COLAR AQUI OS RESUMOS AGREGADOS]

Responda em 1–2 parágrafos apenas: qual(is) projeto(s) seguir e por quê. Não repita os resumos.
```

**2.2.5** Usar a **resposta do decisor** no plano final na seção **Inspiration (projects in .agents/inspirations/)**.

### 2.3 Reconhecimento de padrões

- Buscar implementações similares no codebase.
- Documentar convenções: nomenclatura, organização de arquivos, erro, logging.
- Extrair padrões do domínio e anti-padrões a evitar.

### 2.4 Dependências, testes e integração

- Listar dependências externas relevantes; framework de testes e exemplos; pontos de integração (arquivos a atualizar, novos arquivos, padrões de registro).
- Esclarecer ambiguidades com o usuário se necessário antes de seguir.

---

## Fase 3: Pesquisa externa (Context7) — EXECUTAR CHAMADAS MCP

- **Servidor MCP:** `plugin-context7-plugin-context7`
- Para **cada** biblioteca/framework relevante à feature (ex.: React, Electron, Vercel AI SDK, Drizzle, OpenRouter, etc.):
  1. Chamar a ferramenta **resolve-library-id** com `query` (contexto da feature) e `libraryName` (nome da lib). Obter o **library ID** (formato `/org/project` ou `/org/project/version`).
  2. Chamar a ferramenta **query-docs** com `libraryId` (obtido acima) e `query` (pergunta **específica** sobre a feature). Máximo **3 chamadas query-docs por biblioteca**; priorizar o mais relevante.
- Dividir por domínio se fizer sentido (ex.: uma rodada para agente/tools, outra para UI, outra para Markdown).
- Compilar as referências no plano na seção **Relevant Documentation**, com link, seção específica e "Why: ...".

---

## Fase 4: Pensamento estratégico

- Avaliar encaixe na arquitetura existente; dependências críticas e ordem de execução.
- Considerar edge cases, erros, testes, performance, segurança, manutenibilidade.
- Tomar decisões de design com justificativa.
- Garantir que **cada tarefa** do plano tenha pelo menos **um comando de validação** executável.

---

## Fase 5: Geração do plano

- **Arquivo de saída:** `.agents/plans/{kebab-case-descriptive-name}.md` (ex.: `implement-editfile-tool.md`, `sidebar-collapsible.md`). Criar o diretório `.agents/plans/` se não existir.
- **Template completo:** Usar a estrutura em `.cursor/skills/plan-feature/SKILL.md` (seção "Template do plano") e preencher **todas** as seções com base nas Fases 1–4:
  - Feature Description, User Story, Problem Statement, Solution Statement, Feature Metadata
  - **CONTEXT REFERENCES:** Inspiration (resultado do decisor), Relevant Codebase Files (com file:line e Why), New Files to Create, **Relevant Documentation** (resultado Context7 com Why), Patterns to Follow
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
