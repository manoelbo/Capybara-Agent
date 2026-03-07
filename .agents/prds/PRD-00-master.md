# Capybara Agent — PRD Master

> **Versão:** 0.1 (MVP)
> **Autor:** Manoel Brasil Orlandi
> **Data:** Março 2026
> **Deadline MVP:** ~13 de Março de 2026 (1 semana, agentic coding)
> **Desenvolvedor:** Solo (com agentic coding — Cursor/Claude)
> **Plataforma MVP:** macOS first (DMG)
> **Idioma UI:** Inglês
> **Documento de referência:** `.agents/refs/Capybara_agent_project.md`

---

## 1. Resumo Executivo

O **Capybara Agent** é um aplicativo desktop open source que utiliza LLMs de forma agêntica para apoiar e desenvolver investigações jornalísticas. O app ingere documentos brutos (PDFs, e-mails, imagens, textos), transforma-os em formatos estruturados e rastreáveis, e organiza tudo em dossiês Markdown interconectados com graph view — enquanto o jornalista mantém controle total sobre verificação de fatos e publicação.

O produto é construído com Electron.js para rodar localmente, garantindo que dados sensíveis permaneçam na máquina do usuário. A integração inicial com LLMs é feita via OpenRouter, permitindo acesso a centenas de modelos com uma única API key.

**Objetivo do MVP (v0.1):** Uma primeira versão instalável onde o jornalista consegue (1) importar documentos, (2) processá-los via LLM em Markdown estruturado, (3) ter dossiês organizados automaticamente pelo agente, (4) visualizar conexões num graph interativo, e (5) interagir com o agente via chat para conduzir linhas investigativas — tudo com rastreabilidade completa de volta às fontes originais.

---

## 2. Missão

**Declaração:** Democratizar o acesso a ferramentas de investigação jornalística avançadas, tornando a análise de documentos complexos rápida, transparente e acessível a qualquer jornalista, independente de conhecimento técnico.

**Princípios centrais:**

1. **Transparência total** — O jornalista vê tudo que o agente faz; nenhuma conclusão sem fonte rastreável
2. **Controle humano** — A IA faz o trabalho pesado, mas o jornalista decide o que é válido
3. **Acessibilidade** — Interface simples o suficiente para quem não sabe programar
4. **Privacidade por design** — Dados ficam locais; nenhum servidor intermediário
5. **Open source e auditável** — Ferramentas de jornalismo devem ser tão accountable quanto o jornalismo que apoiam

---

## 3. Usuários-Alvo

### Persona 1: Thiago — O Watchdog orientado a dados
- **Perfil:** Jornalista investigativo, São Paulo
- **Tech:** Alta (confortável com bancos de dados, APIs)
- **Dor:** Milhares de páginas de contratos públicos; meses de leitura manual; risco de processo por erro
- **Necessidade:** Processamento massivo de PDFs, extração de tabelas, cross-referência, rastreabilidade para prova judicial

### Persona 2: Linn — A Rastreadora financeira
- **Perfil:** Jornalista financeira, Estocolmo
- **Tech:** Baixa (não programa, não usa terminal)
- **Dor:** Dump massivo de e-mails, precisa filtrar conexões específicas (Suécia) num oceano de dados
- **Necessidade:** Busca inteligente por linguagem natural, organização automática, interface amigável

---

## 4. Mapa do Produto — Domínios

O Capybara Agent é dividido em **5 domínios** que se interconectam:

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKSPACE, INFRA & AI ENGINE                │
│         (Electron, IPC, Storage, OpenRouter, Model Routing)     │
├──────────────┬──────────────────────────┬───────────────────────┤
│   SOURCES &  │  DOSSIER, INVESTIGAÇÕES  │   CHAT, AGENT &       │
│   DOCUMENT   │       & GRAPH VIEW       │   CAPYBARA MARKDOWN   │
│  PROCESSING  │                          │                       │
│              │  ◄── consome ────────►   │  ◄── orquestra ──►    │
│  produz ──►  │  entidades, annotations  │  agent loop, tools    │
│  metadata,   │  clues, [[links]],       │  streaming, menções   │
│  preview,    │  graph view              │  dialeto markdown,    │
│  replica     │                          │  renderer             │
├──────────────┴──────────────────────────┴───────────────────────┤
│                    UI, INTERAÇÃO & SCREENS                       │
│   Layout master, sidebar, viewer templates, Chat-First Principle │
│   Contextual Action Bar, screen map, keyboard shortcuts          │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de dados entre domínios

1. **Sources** produz `preview.md`, `metadata.md`, `replica.md` → alimenta **Dossier**
2. **Dossier** consome metadata, organiza entidades, cria `[[links]]` → alimenta **Graph View**
3. **Chat & Agent** orquestra tudo: processa Sources, popula Dossier, cria Clues, faz web search
4. **Capybara Markdown** é o formato unificado: todos os domínios leem e escrevem nele
5. **Workspace & Infra** fornece IPC, storage, AI SDK e file watching para todos os domínios

### PRDs de Domínio

| # | Domínio | Arquivo | Resumo |
|---|---------|---------|--------|
| 1 | Workspace, Infra & AI Engine | `PRD-01-workspace-infra-ai.md` | Electron, IPC, storage, OpenRouter, model routing, temas, distribuição |
| 2 | Sources & Document Processing | `PRD-02-sources-processing.md` | Ingestão de arquivos, PDF→MD, OCR, metadata, preview, replica, batch |
| 3 | Dossier, Investigações & Graph View | `PRD-03-dossier-investigations-graph.md` | Entidades, annotations, clues, linhas investigativas, graph, traceability |
| 4 | Chat, Agent & Capybara Markdown | `PRD-04-chat-agent-markdown.md` | Chat UI, agent loop, tools, modos, dialeto markdown, renderer |
| 5 | UI, Interação & Screens | `PRD-05-ui-interaction-screens.md` | Layout master, sidebar, viewer templates, Chat-First Principle, action bar, screen map, CAN/CANNOT, keyboard shortcuts |

---

## 5. Escopo do MVP (v0.1)

### ✅ No escopo

**Funcionalidade principal:**
- ✅ Workspaces isolados ("Investigation Desk")
- ✅ Ingestão de documentos via drag-and-drop
- ✅ Processamento de PDFs via LLM (replica.md page-by-page)
- ✅ Geração de preview.md e metadata.md
- ✅ Dossiê com entidades: People, Groups, Places, Timeline
- ✅ Investigative Annotations com rastreabilidade
- ✅ Linhas investigativas com Clues
- ✅ Chat interativo com streaming, modos Q/P/A
- ✅ Menções @source, @dossier, !investigation
- ✅ Slash commands (/create_line, /summarize, /web_search, etc.)
- ✅ Graph View (widget flutuante + fullscreen)
- ✅ Bidirectional links [[wikilinks]]
- ✅ Verificação manual de status (verified/unverified/rejected)
- ✅ Capybara Markdown com blocos custom (:::annotation, :::clue, :::event)
- ✅ Token counter com sugestão de summarize

**Técnico:**
- ✅ Electron com context isolation e preload seguro
- ✅ OpenRouter como único provider (API key simples)
- ✅ Model routing: 3 modelos por tarefa (processing, writing, reasoning)
- ✅ Fontes IBM Plex bundled localmente

**Distribuição:**
- ✅ Build para macOS (DMG) — macOS first
- ❌ Build para Windows (NSIS) — pós-MVP
- ❌ Build para Linux (AppImage) — pós-MVP

**Simplificações para 1 semana:**
- ✅ Chat sessions em memória (sem persistência no SQLite no MVP)
- ✅ Web research via fetch + Cheerio (sem Tavily/API externa)
- ✅ Graph view pode ser simplificado (widget only, sem fullscreen filters no MVP)

### ❌ Fora do escopo (v0.1)

- ❌ Autenticação direta com providers nativos (Anthropic, Google)
- ❌ Multi-provider setup (somente OpenRouter no MVP)
- ❌ CSV/tabela extraction como feature dedicada
- ❌ Auto-update (release manual no MVP)
- ❌ Busca semântica com embeddings
- ❌ Edição direta de Markdown pelo usuário
- ❌ Importação de URLs / monitoramento de pastas
- ❌ Exportação de dossiê (PDF, HTML)
- ❌ Internacionalização (UI em inglês no MVP)
- ❌ Colaboração multi-usuário
- ❌ Chat persistence (sessões descartáveis no MVP)
- ❌ Builds Windows/Linux (macOS first)
- ❌ SERP API / Tavily (web research simplificado)

---

## 6. Stack Tecnológica — Decisões e Recomendações

### Decisões já tomadas

| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Framework desktop | Electron.js | ✅ Decidido |
| UI framework | React | ✅ Decidido (via shadcn/ui) |
| CSS | Tailwind CSS | ✅ Decidido (via shadcn/ui) |
| Componentes | shadcn/ui | ✅ Decidido |
| Tema | Capybara 0 (tweakcn) | ✅ Decidido |
| Fontes | IBM Plex Sans Thai, Mono, Sans JP | ✅ Decidido |
| AI gateway | OpenRouter (v0.1) | ✅ Decidido |
| Cores | OKLCH-based tokens | ✅ Decidido |

### Decisões pendentes — Recomendações

As decisões abaixo foram pesquisadas e avaliadas. Para cada uma, apresento a **recomendação** com justificativa.

#### 6.1 Build Tool / Boilerplate Electron

| Opção | Prós | Contras |
|-------|------|---------|
| **electron-vite** | Vite (build rápido, HMR), template React pronto, popular (4.8k stars) | Usa electron-builder (não oficial), mais decisões manuais |
| electron-forge | Oficial do Electron, all-in-one CLI, plugin Vite disponível | Plugin Vite experimental, mais opinativo |

**→ Recomendação: `electron-vite`**
Motivo: DX superior com Vite (HMR instantâneo, builds rápidos), template React pronto, comunidade ativa. O electron-builder integrado resolve packaging e distribuição.

#### 6.2 Gerenciamento de Estado

| Opção | Prós | Contras |
|-------|------|---------|
| **Zustand** | 3KB, sem Provider, API simples, 18M downloads/semana | Menos opinionado para times grandes |
| Jotai | Atômico, derivações reativas | Mais complexo para estado global |
| Redux Toolkit | DevTools excelentes, padrão para enterprise | 15KB, boilerplate, over-engineering para projeto solo |

**→ Recomendação: `Zustand`**
Motivo: Minimalista, sem boilerplate, perfeito para Electron (sem SSR). Stores separados por domínio (workspace store, chat store, viewer store, etc.).

#### 6.3 AI SDK / Integração com LLMs

| Opção | Prós | Contras |
|-------|------|---------|
| **OpenAI SDK apontando para OpenRouter** | API OpenAI-compatible madura, tool calling confiável, streaming via SSE padrão, controle total do agent loop | Agent loop manual (~150-200 linhas) |
| Vercel AI SDK + @openrouter/ai-sdk-provider | API unificada, streaming nativo | Bugs críticos em tool calling no provider OpenRouter (v2.2.3), otimizado para Next.js/não para agent loops em Node.js puro |
| Mastra | Suporte explícito a Electron, multi-model, MCP built-in | Dependência grande, menos controle |
| LangChain.js | 1000+ integrações, agent patterns maduros | Pesado, Python-first, overengineered |

**→ Recomendação: `OpenAI SDK` apontando para OpenRouter**
Motivo: O OpenRouter expõe uma API OpenAI-compatible madura. Usar o `openai` SDK diretamente (com `baseURL` apontando para OpenRouter) garante tool calling confiável, streaming via SSE padrão, e controle total do agent loop (~150-200 linhas de código). O Vercel AI SDK + provider OpenRouter tem bugs ativos em tool calling (lifecycle events de tools silenciosamente dropados durante streaming) que são deal-breakers para agent loops robustos.

#### 6.4 IPC Type-Safe (Main ↔ Renderer)

| Opção | Prós | Contras |
|-------|------|---------|
| **IPC tipado com Zod** | ~50 linhas de código, zero deps extras, type-safe, streaming via `ipcRenderer.on()` | Pode ficar desorganizado sem disciplina; migração para framework se o projeto crescer |
| electron-trpc (fork mat-sz/trpc-electron) | Leverages tRPC v11, queries/mutations/subscriptions | Fork com adoção modesta (42 stars); electron-trpc original NÃO suporta tRPC v11 |
| Hono RPC | Alternativa moderna para Electron | Emergente, menos documentação |

**→ Recomendação: `IPC tipado com Zod` (MVP)**
Motivo: Para um MVP de 1 semana com projeto solo, tRPC é over-engineering. IPC tipado com Zod dá type-safety com ~50 linhas de código. Para streaming, `ipcRenderer.on()` com typed events é mais direto que subscriptions do tRPC. Todos os schemas ficam centralizados em `shared/ipc-schema.ts`. Se o projeto crescer, migração para tRPC ou Hono RPC é natural.

#### 6.5 Banco de Dados Local

| Opção | Prós | Contras |
|-------|------|---------|
| **better-sqlite3 + Kysely** | Performance (11.7x mais rápido que sqlite3), sync API, Kysely dá type-safety mais forte sem overhead de ORM | Native module (rebuild para Electron) |
| better-sqlite3 + Drizzle ORM | Performance + ORM maduro com migrations | Overhead de migrations/drizzle-kit desnecessário para MVP com ~5 tabelas |
| sql.js | Pure WASM, sem native module | Mais lento, carrega DB inteiro na memória |
| Arquivos JSON/MD puros | Simples, sem dependência | Sem queries complexas, sem indexação |

**→ Recomendação: `better-sqlite3` + `Kysely`**
Motivo: Para indexar backlinks, buscar entidades, rastrear status de processamento — SQLite é ideal. Kysely oferece type-safety mais forte que Drizzle para projetos pequenos, com query builder expressivo e sem overhead de migrations/schema declarations. Para um MVP com ~5 tabelas, Kysely dá o equilíbrio ideal entre type-safety e simplicidade. Os dados editoriais (dossiê, fontes) continuam em Markdown no filesystem; o SQLite serve como índice de busca e metadata operacional.

#### 6.6 Busca Full-Text

| Opção | Prós | Contras |
|-------|------|---------|
| MiniSearch | 767K downloads, leve, fuzzy, autocomplete, zero deps | Menos rápido que FlexSearch em datasets enormes |
| **FlexSearch** | Mais rápido, phonetic matching, web workers | API mais complexa, mais pesado |

**→ Recomendação: `MiniSearch`**
Motivo: Autocomplete em tempo real para menções (@source, @dossier, !investigation), fuzzy matching, levíssimo. O volume de dados por workspace (centenas a poucos milhares de docs) está bem dentro da capacidade do MiniSearch.

#### 6.7 Markdown Rendering (Capybara Markdown)

| Componente | Lib recomendada |
|-----------|-----------------|
| Renderer base | `react-markdown` |
| Parser de directives (:::annotation, :::clue, :::event) | `remark-directive` + `remark-directive-rehype` |
| Wikilinks [[entity]] | Plugin remark custom (ou `remark-wiki-link`) |
| YAML frontmatter | `gray-matter` (3.9M downloads, battle-tested) |
| Source references →[source] | Plugin rehype custom |
| Syntax highlighting | `rehype-highlight` ou `rehype-prism-plus` |
| Math (se necessário) | `remark-math` + `rehype-katex` |

**→ Recomendação: Unified ecosystem (`react-markdown` + `remark-directive` + `remark-directive-rehype` + plugins custom)**
Motivo: O Capybara Markdown tem extensões não-triviais (:::annotation, [[links]], →[source]). O unified ecosystem (remark/rehype) é feito exatamente para isso: parse → AST → transform → render. Cada extensão é um plugin isolado e testável.

#### 6.8 Graph View

| Opção | Prós | Contras |
|-------|------|---------|
| **react-force-graph** | React-nativo, force-directed (estilo Obsidian), 2D/3D/VR | Menos algoritmos de layout |
| Cytoscape.js | Algoritmos avançados, WebGPU (3M edges), clustering | Não é React-nativo, API mais complexa |
| D3.js force | Máxima customização | Muito low-level, integração React manual |

**→ Recomendação: `react-force-graph` (2D)**
Motivo: O graph view do Capybara é inspirado no Obsidian — force-directed, interativo, nós clicáveis. react-force-graph entrega exatamente isso, é React-nativo, e suporta Canvas/WebGL para performance. Para o MVP, é a opção com menor friction.

#### 6.9 Chat Input (Menções e Autocomplete)

| Opção | Prós | Contras |
|-------|------|---------|
| **react-mentions-ts** | TypeScript-first, múltiplos triggers (@, !) nativos, ~10-20KB, zero learning curve | Menos extensível para rich text futuro |
| Tiptap | Extensão de mentions built-in, headless, ProseMirror base | 50-70KB, overkill para input de chat simples |
| Lexical | Meta-backed, imutável | Mentions requerem mais implementação custom |
| textarea simples + custom | Zero deps | Muito trabalho para @, !, / triggers |

**→ Recomendação: `react-mentions-ts` para menções + `cmdk` para slash commands**
Motivo: O chat input precisa de 3 coisas: @mentions, !mentions, e /commands. Isso é um textarea com popup de autocomplete, não um editor rich text. react-mentions-ts é TypeScript-first, suporta múltiplos triggers nativamente, e pesa ~10-20KB vs 50-70KB do Tiptap. Para `/` commands, cmdk (já no plano via shadcn) continua como solução separada. Se no futuro o input precisar de rich text (bold, links), migrar para Tiptap.

#### 6.10 Command Palette / Slash Commands

**→ Recomendação: `cmdk`**
Motivo: shadcn/ui já tem um componente Command baseado em cmdk. Zero configuração extra. Perfeito para o menu de slash commands (/) e para busca global.

#### 6.11 Token Counting

**→ Recomendação: `gpt-tokenizer`**
Motivo: Pure JS (sem WASM), síncrono, `isWithinTokenLimit` para check rápido sem encoding completo, `estimateCost` built-in, suporta todos os encodings modernos. Ideal para o token counter em tempo real no chat.

#### 6.12 File Watching

**→ Recomendação: `chokidar`**
Motivo: 113M downloads/semana, cross-platform confiável, standard para Electron. Necessário para detectar quando o agente cria/modifica arquivos no workspace e atualizar a sidebar e o viewer automaticamente.

#### 6.13 Web Research (Agente)

| Opção | Prós | Contras |
|-------|------|---------|
| **Playwright (embutido)** | Controle total, scraping de qualquer site, sem custo recorrente | Aumenta tamanho do app (~50MB+), complexo |
| SERP API (Tavily, SerpAPI) | Simples, resultados limpos, sem manutenção | Custo por request, dependência de terceiro |

**→ Recomendação: `Tavily API` para busca web no MVP + `Cheerio` para scraping de URLs específicas**
Motivo: Embutir Playwright no Electron aumenta muito o tamanho do app. Para o MVP, Tavily (ou similar) é mais prático para buscas web. Cheerio (parser HTML leve) resolve scraping de páginas específicas sem browser headless. Playwright pode entrar em versão futura.

#### 6.14 Packaging e Distribuição

**→ Recomendação: `electron-builder`**
Motivo: Auto-update via electron-updater (para versão futura), builds para macOS (DMG), Windows (NSIS), Linux (AppImage). Mais maduro que Electron Forge para distribuição.

#### 6.15 Testes

**→ Recomendação: `Vitest` (unit/integration) + `Playwright` (E2E)**
Motivo: Vitest integra nativamente com Vite (mesmo toolchain do electron-vite). Playwright para testes E2E do app Electron.

#### 6.16 Persistência de Chat

**→ Recomendação: `SQLite` (via better-sqlite3/Kysely)**
Motivo: Sessões de chat com milhares de mensagens, token counts, timestamps — relacional é mais adequado que JSON/MD. Queries tipo "todas as sessões deste workspace" são triviais com SQL.

---

## 7. Arquitetura de Alto Nível

```
┌──────────────────────────────────────────────────────────────┐
│                        ELECTRON APP                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    MAIN PROCESS                           │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │ AI Engine   │  │ File System  │  │ SQLite (DB)    │  │ │
│  │  │ (OpenAI SDK │  │ Manager      │  │ (better-sqlite3│  │ │
│  │  │  → OpenRou- │  │ (chokidar +  │  │  + Kysely)     │  │ │
│  │  │  ter)       │  │  workspace   │  │                │  │ │
│  │  │             │  │  operations)  │  │ - search index │  │ │
│  │  │ - streaming │  │              │  │ - chat sessions│  │ │
│  │  │ - tools     │  │ - read/write │  │ - backlinks    │  │ │
│  │  │ - agent loop│  │ - watch      │  │ - processing   │  │ │
│  │  └──────┬──────┘  └──────┬───────┘  │   status       │  │ │
│  │         │                │          └───────┬────────┘  │ │
│  │         └────────┬───────┘                  │           │ │
│  │                  │ IPC tipado (Zod)          │           │ │
│  │                  ▼                          │           │ │
│  └──────────────────┬──────────────────────────┘           │ │
│                     │                                       │ │
│  ┌──────────────────▼──────────────────────────────────────┐ │
│  │                   RENDERER PROCESS                       │ │
│  │                                                          │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │  Sidebar   │  │  Viewer      │  │  Chat Panel     │ │ │
│  │  │  (file     │  │  (Capybara   │  │  (react-mentions│ │ │
│  │  │   tree,    │  │   Markdown   │  │   input,        │ │ │
│  │  │   drag &   │  │   renderer,  │  │   action pills, │ │ │
│  │  │   drop,    │  │   Graph View │  │   cmdk menu,    │ │ │
│  │  │   status)  │  │   widget)    │  │   modes Q/P/A)  │ │ │
│  │  └────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                                          │ │
│  │  State: Zustand stores (workspace, viewer, chat, graph)  │ │
│  │  Routing: React Router (ou TanStack Router)              │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Fases de Implementação (1 semana — agentic coding)

> **Contexto:** Solo developer usando agentic coding (Cursor/Claude). A timeline
> de 1 semana exige foco brutal no essencial. Cada dia tem um objetivo claro.
> Build para macOS only. Chat sessions em memória. Web research simplificado.

### Dia 1–2 — Fundação (Electron + Layout + Infra)

**Objetivo:** App Electron funcional com layout completo e infraestrutura base.

- ✅ Setup electron-vite + React + TypeScript + Tailwind
- ✅ Tema Capybara 0 (shadcn/ui + tweakcn)
- ✅ Fontes IBM Plex bundled
- ✅ Frameless window com drag regions (macOS traffic lights)
- ✅ Layout master (Sidebar + Viewer + Chat)
- ✅ IPC tipado com Zod (shared/ipc-schema.ts)
- ✅ better-sqlite3 + Kysely (schema base: sources, entities, backlinks)
- ✅ File system manager (workspace CRUD + chokidar watcher)
- ✅ Zustand stores (workspace, viewer, chat)
- ✅ Sidebar com file tree dinâmico
- ✅ Viewer com Capybara Markdown renderer (react-markdown + remark-directive + gray-matter)
- ✅ Blocos custom: :::annotation, :::clue, :::event, [[wikilinks]]
- ✅ Onboarding screen (criar Investigation Desk + API key + tema)

**Validação:** App abre, sidebar mostra file tree do workspace, viewer renderiza MD com blocos custom, onboarding funciona.

### Dia 3–4 — Sources + AI Engine + Chat

**Objetivo:** Processamento de documentos via LLM + chat com streaming funcionando end-to-end.

- ✅ Drag-and-drop de arquivos para Sources (sidebar + viewer)
- ✅ OpenAI SDK apontando para OpenRouter configurado
- ✅ Pipeline PDF: pdfjs-dist → render pages como imagens → vision model → replica.md
- ✅ Geração de preview.md e metadata.md via LLM
- ✅ Status de processamento com badges (○ ⟳ ✓) na sidebar
- ✅ Chat panel com streaming (react-mentions-ts input)
- ✅ Menções @source no chat (autocomplete básico)
- ✅ Mode toggle Q/P/A (Question mode funcional, Agent mode básico)
- ✅ Source Detail View no viewer (preview + metadata + link para original)
- ✅ Processamento de imagens via vision model

**Validação:** Drag PDF → processamento automático → replica/preview/metadata gerados → sidebar atualizada → chat pergunta sobre o documento e responde com contexto.

### Dia 5–6 — Agent + Dossier + Investigations

**Objetivo:** Agent loop completo que popula dossiê e cria investigações.

- ✅ Agent tools (read, write, list, search, createEntity, addAnnotation, addClue, createInvestigation, createTimelineEvent)
- ✅ Agent loop: plan → tool call → observe → iterate (OpenAI SDK + while loop manual)
- ✅ Agent Mode funcional (cria/modifica arquivos autonomamente)
- ✅ Planning Mode (apresenta plano, espera aprovação)
- ✅ Action pills no chat (mostra o que o agente modificou)
- ✅ Dossiê: entidades People, Groups, Places, Timeline
- ✅ Investigative Lines + Clues
- ✅ Verification toggle (hover-based status change)
- ✅ Connections block (backlinks via SQLite)
- ✅ Menções @dossier e !investigation no chat
- ✅ Slash commands (/create_line, /summarize) via cmdk
- ✅ Token counter
- ✅ MiniSearch para autocomplete

**Validação:** Importar contratos → pedir ao agente "analise esses documentos" → agente cria dossiê com pessoas, empresas, annotations, clues → tudo rastreável.

### Dia 7 — Graph View + Polish + Build

**Objetivo:** Graph view funcional, polish geral, build macOS.

- ✅ Graph View widget (react-force-graph-2d, bottom-right)
- ✅ Nós por tipo com cores/ícones
- ✅ Clicar nó → navegar para entidade
- ✅ Web search básico (fetch + Cheerio, sem API externa)
- ✅ Settings (modelos, tema, token limit)
- ✅ Polish: navegação back/forward, breadcrumbs, light/dark toggle
- ✅ Source reference links →[source] clicáveis
- ✅ Table of Contents para docs longos
- ✅ Build macOS (DMG) via electron-builder
- ✅ README básico

**Validação:** App completo instalável no macOS, workflow end-to-end funcional.

### Pós-MVP (Semana 2+)

- Graph View fullscreen com filtros e customização visual
- Chat persistence (SQLite)
- Batch processing com estimativa de custo
- Builds Windows + Linux
- Testes (Vitest + Playwright E2E)
- Auto-update via electron-updater
- Web research via API (Tavily)
- /check_annotations, /web_search completos
- Context summarization (/summarize funcional)

---

## 9. Critérios de Sucesso do MVP

### Funcionais
- ✅ Jornalista consegue criar workspace, importar documentos, e processá-los via LLM
- ✅ PDFs são convertidos em replica.md com fidelidade page-by-page
- ✅ Agente cria e popula dossiê automaticamente com entidades e annotations
- ✅ Toda annotation/clue tem rastreabilidade para o documento original
- ✅ Graph view mostra conexões entre entidades, sources e investigations
- ✅ Chat opera nos 3 modos (Q/P/A) com streaming

### Qualidade
- ✅ App inicia em < 3 segundos
- ✅ Processamento de PDF de 100 páginas completa em < 5 minutos
- ✅ UI responsiva durante processamento (não trava)
- ✅ Zero dados enviados para servidores além do provider de AI escolhido

### UX
- ✅ Persona "Linn" (tech baixa) consegue completar workflow básico sem documentação
- ✅ Feedback visual claro em todas as operações do agente
- ✅ Rastreabilidade é acessível em 1 clique (annotation → source original)

---

## 10. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Custo de API OpenRouter** pode surpreender usuários em processamento massivo | Alto | Estimativa de custo antes de processar; alertas de gasto; modelo econômico como default |
| **better-sqlite3 native module** pode causar problemas de rebuild com Electron | Médio | Usar `electron-rebuild`; testar em CI para 3 plataformas; fallback para sql.js se necessário |
| **Qualidade da replica.md** depende do LLM — tabelas complexas podem falhar | Alto | Pipeline vision (páginas como imagens); modelo dedicado para processing; fallback manual |
| **Tamanho do app Electron** pode ser grande (200MB+) | Médio | Não embutir Playwright; otimizar assets; usar fontes subset |
| **Complexidade do Capybara Markdown** — muitas extensões custom podem criar bugs de rendering | Médio | Cada extensão como plugin isolado com testes unitários; fallback para markdown padrão |

---

## 11. Decisões Tomadas

| Pergunta | Resposta |
|----------|---------|
| **Time** | Solo developer com agentic coding (Cursor/Claude) |
| **Timeline** | 1 semana (~13 Março 2026) |
| **Plataformas** | macOS first (Windows/Linux pós-MVP) |
| **Web research** | Simplificado: fetch + Cheerio (sem API externa no MVP) |
| **Chat persistence** | Descartável no MVP (em memória) |
| **Idioma UI** | Inglês |

### Perguntas ainda abertas

1. **Experiência com Electron**: Primeiro projeto Electron, ou já tem experiência?
2. **Distribuição**: GitHub Releases? (Impacta estratégia pós-MVP de auto-update)
3. **Context window default**: 150k tokens — requisito firme ou ajustável?
4. **Agentic loop**: Loop sequencial simples é suficiente para o MVP, ou precisa de sub-agents paralelos?

---

## 12. Considerações Futuras (pós-MVP)

- **v0.3:** Multi-provider (Anthropic, Google direto), extração de tabelas para CSV, Operating Modes avançados
- **v0.4:** Busca semântica com embeddings, dossier customization, enriquecimento web contextual
- **v0.5+:** Auto-update, exportação de dossiê, internacionalização, plugins/extensões, colaboração

---

## 13. User Journeys de Referência

O documento de referência (`Capybara_agent_project.md`) contém user journeys detalhados que servem como **critérios de aceitação** para cada fase:

| Versão | Persona | Cenário | Seção no doc de referência |
|---|---|---|---|
| v0.1 | Thiago | Setup → ingestão → processamento → AI-driven hypotheses → agentic workflow → dossier population | §User Journey: Version 0.1 |
| v0.1 | Linn | Setup → multi-format ingestion → smart processing → guided line creation → agentic search → graph visualization | §User Journey: Version 0.1 |
| v0.3 | Thiago | Model selection → operating modes → precision table extraction → scaling → comparative analysis → traceability & verification | §User Journey: Version 0.3 |
| v0.4 | Linn | Multi-provider auth → dossier customization → contextual enrichment → fact-checking | §User Journey: Version 0.4 |

Para o MVP, os journeys de v0.1 de Thiago e Linn são os **cenários-chave de validação**.

---

## 14. Anexos

- **Documento de referência completo:** `.agents/refs/Capybara_agent_project.md`
- **Design System (tema Capybara 0):** [tweakcn.com/themes/cmmfid9kr000104jufj121z63](https://tweakcn.com/themes/cmmfid9kr000104jufj121z63)
- **PRDs de domínio:** `.agents/prds/PRD-01-*.md` a `PRD-05-*.md`
