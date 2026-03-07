# PRD-04: Chat, Agent & Capybara Markdown

> **Domínio:** Chat, Agent & Capybara Markdown
> **PRD Master:** `PRD-00-master.md`
> **Depende de:** Workspace & Infra, Sources, Dossier & Investigations
> **Consumido por:** — (domínio transversal; é o orquestrador de tudo)

---

## 1. Visão do Domínio

Este é o domínio **transversal** do Capybara Agent. O Chat é o ponto de entrada de toda interação; o Agent é o motor que executa ações; e o Capybara Markdown é o formato unificado que todos os domínios leem e escrevem. Juntos, eles formam a "inteligência" do produto.

---

## 2. User Stories

### Chat
1. **Como** jornalista, **quero** conversar com o agente em linguagem natural **para** dar instruções sem precisar de interface complexa.
2. **Como** jornalista, **quero** ver em tempo real o que o agente está fazendo **para** ter transparência total.
3. **Como** jornalista, **quero** mencionar fontes (@), dossiê (@dossier), e investigações (!) no chat **para** dar contexto preciso ao agente.
4. **Como** jornalista, **quero** escolher entre 3 modos (Pergunta, Planejamento, Agente) **para** controlar o nível de autonomia da IA.
5. **Como** jornalista, **quero** ver um contador de tokens **para** saber quando preciso resumir o contexto.

### Agent
6. **Como** agente AI, **quero** ter ferramentas (tools) para ler, escrever e organizar o workspace **para** executar tarefas investigativas autonomamente.
7. **Como** agente AI, **quero** planejar antes de executar (Planning Mode) **para** que o jornalista aprove minhas ações antes.

### Capybara Markdown
8. **Como** jornalista, **quero** ver documentos Markdown renderizados com tipografia bonita e blocos especiais (annotations, clues, events) **para** ler de forma confortável.

---

## 3. Chat Panel — Especificação Técnica

### 3.1 Layout

```
┌─ Chat ──────────────────────────────────────────────────┐
│  Mode: [Q] [P] [A]               Tokens: 42.3k / 150k  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Message area com streaming]                            │
│                                                          │
│  🤖 Capybara:                                           │
│  "Encontrei 3 contratos mencionando Construtora XYZ..."  │
│                                                          │
│  [📄 metadata.md criado → contrato-01]          [abrir]  │
│  [💡 Nova Pista: Empresa X em 3 contratos]      [abrir]  │
│  [👤 João Silva.md criado no Dossiê]            [abrir]  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Context: [!Corporate Cluster ×] [@contrato-01 ×]       │
│  ┌───────────────────────────────────────────────────┐  │
│  │ /  Mensagem ou comando...                         │  │
│  └───────────────────────────────────────────────────┘  │
│  [+ Novo chat]  [🗑 Limpar contexto]                    │
│                                                          │
│  ⚠️ 142k/150k tokens  [Resumir conversa]                │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Componentes do Chat

#### Mode Toggle (Q/P/A)

```typescript
type ChatMode = 'question' | 'planning' | 'agent'

interface ChatModeStore {
  mode: ChatMode
  setMode: (mode: ChatMode) => void
}
```

| Modo | Comportamento | Ícone |
|------|--------------|-------|
| **Q** (Question) | IA responde perguntas; NÃO modifica arquivos | 💬 |
| **P** (Planning) | IA propõe plano; espera aprovação antes de executar | 📋 |
| **A** (Agent) | IA executa autonomamente: cria, modifica, deleta | 🤖 |

#### Token Counter

```typescript
import { isWithinTokenLimit, encode } from 'gpt-tokenizer'

function countSessionTokens(messages: ChatMessage[]): number {
  return messages.reduce((total, msg) => {
    return total + encode(msg.content).length
  }, 0)
}
```

- Sempre visível: `42.3k / 150k`
- Warning banner quando > 90% do limite
- Botão "Resumir conversa" → injeta `/summarize`

#### Action Pills

Cada modificação do agente gera um pill clicável:

```typescript
interface ActionPill {
  type: 'file_created' | 'file_updated' | 'clue_added' | 'entity_created'
  icon: string
  label: string
  filePath: string // abre no Viewer ao clicar
}
```

#### Context Bar

Tags de contexto ativo:

```typescript
interface ContextTag {
  type: 'source' | 'dossier' | 'investigation'
  prefix: '@' | '!'
  name: string
  filePath: string
  removable: true
}
```

### 3.3 Input com react-mentions-ts + cmdk

**Tecnologia:** `react-mentions-ts` para @mentions e !mentions + `cmdk` para /commands

Três triggers de autocomplete:

| Trigger | Busca | Fonte de dados |
|---------|-------|----------------|
| `@` | Sources + Dossier entities | MiniSearch (indexado do SQLite) |
| `!` | Investigative Lines | MiniSearch |
| `/` | Slash Commands | Lista estática + cmdk |

```typescript
import { MentionsInput, Mention } from 'react-mentions-ts'

function ChatInput() {
  return (
    <MentionsInput value={value} onChange={handleChange}>
      <Mention
        trigger="@"
        data={(search) =>
          miniSearch.search(search, {
            filter: (result) => ['source', 'entity'].includes(result.type)
          }).map(r => ({ id: r.id, display: r.title }))
        }
        markup="@[__display__](__id__)"
      />
      <Mention
        trigger="!"
        data={(search) =>
          miniSearch.search(search, {
            filter: (result) => result.type === 'investigation'
          }).map(r => ({ id: r.id, display: r.title }))
        }
        markup="![__display__](__id__)"
      />
    </MentionsInput>
  )
}
```

Para `/` commands, usar **cmdk** (shadcn Command component) — ativado quando o input começa com `/`:

```typescript
const slashCommands = [
  { id: 'create_line', label: 'Criar Investigação', description: 'Criar nova linha investigativa' },
  { id: 'check_annotations', label: 'Verificar Annotations', description: 'Revisar annotations pendentes' },
  { id: 'summarize', label: 'Resumir Conversa', description: 'Comprimir contexto ativo' },
  { id: 'web_search', label: 'Busca Web', description: 'Pesquisar na internet' },
  { id: 'process', label: 'Processar Fonte', description: 'Processar documento selecionado' },
]
```

### 3.4 Streaming de Respostas

```typescript
// Main process (IPC handler)
ipcMain.handle('ai:chat', async (event, input) => {
  const { messages, mode, model } = ipcSchema['ai:chat'].input.parse(input)
  const client = createOpenRouterClient(apiKey)

  const stream = await client.chat.completions.create({
    model: getModelId('reasoning'),
    messages,
    tools: mode === 'agent' ? agentTools : undefined,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      event.sender.send('ai:stream-chunk', { text: content })
    }
    const toolCalls = chunk.choices[0]?.delta?.tool_calls
    if (toolCalls) {
      event.sender.send('ai:stream-tool-call', { toolCalls })
    }
  }

  event.sender.send('ai:stream-done', {})
})
```

---

## 4. Agent — Motor Agêntico

### 4.1 Loop do Agente

Inspirado em Claude Code / Codex: recebe tarefa → planeja → seleciona ferramenta → executa → observa resultado → itera até completar.

```
                    ┌──────────────┐
                    │  User prompt │
                    │  + contexto  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   PLANNING   │  ◄── Em Planning Mode,
                    │   (reasoning │      pausa aqui e espera
                    │    model)    │      aprovação do usuário
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │  TOOL SELECTION         │
              │  Escolhe qual ferramenta│
              │  usar baseado no plano  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  EXECUTION              │
              │  Executa a ferramenta   │
              │  (read, write, search)  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  OBSERVATION            │
              │  Analisa o resultado    │
              │  Decide: continuar ou   │
              │  tarefa completa?       │
              └────────────┬────────────┘
                           │
                    ┌──────▼───────┐
                    │  Completo?   │──── Não ──► volta para TOOL SELECTION
                    └──────┬───────┘
                           │ Sim
                    ┌──────▼───────┐
                    │   Resposta   │
                    │   ao usuário │
                    └──────────────┘
```

### 4.2 Ferramentas do Agente (Tools)

Implementadas como tools OpenAI-compatible (function calling):

#### Ferramentas de Leitura & Navegação

```typescript
const readFile = tool({
  description: 'Read a file from the workspace',
  parameters: z.object({
    path: z.string().describe('Relative path from workspace root'),
  }),
  execute: async ({ path }) => {
    return await fs.readFile(join(workspacePath, path), 'utf-8')
  },
})

const listDirectory = tool({
  description: 'List contents of a directory in the workspace',
  parameters: z.object({
    path: z.string().describe('Relative path from workspace root'),
  }),
  execute: async ({ path }) => {
    return await fs.readdir(join(workspacePath, path))
  },
})

const searchWorkspace = tool({
  description: 'Search for text across all workspace files',
  parameters: z.object({
    query: z.string(),
    fileTypes: z.array(z.string()).optional(),
  }),
  execute: async ({ query, fileTypes }) => {
    return miniSearch.search(query, { filter: ... })
  },
})
```

#### Ferramentas de Escrita & Edição

```typescript
const writeFile = tool({
  description: 'Create or overwrite a file in the workspace',
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }) => {
    await fs.writeFile(join(workspacePath, path), content)
    await updateSearchIndex(path, content)
    return { success: true, path }
  },
})

const editFile = tool({
  description: 'Edit a specific section of a file',
  parameters: z.object({
    path: z.string(),
    oldContent: z.string(),
    newContent: z.string(),
  }),
  execute: async ({ path, oldContent, newContent }) => {
    const file = await fs.readFile(join(workspacePath, path), 'utf-8')
    const updated = file.replace(oldContent, newContent)
    await fs.writeFile(join(workspacePath, path), updated)
    return { success: true, path }
  },
})

const deleteFile = tool({
  description: 'Delete a file from the workspace',
  parameters: z.object({
    path: z.string(),
  }),
  execute: async ({ path }) => {
    await fs.unlink(join(workspacePath, path))
    return { success: true }
  },
})
```

#### Ferramentas do Dossiê

```typescript
const createEntity = tool({
  description: 'Create a new entity in the dossier (person, group, place)',
  parameters: z.object({
    type: z.enum(['person', 'group', 'place']),
    name: z.string(),
    content: z.string().describe('Full markdown content with frontmatter'),
  }),
  execute: async ({ type, name, content }) => {
    const slug = slugify(name)
    const dir = `dossier/${type}s` // people, groups, places
    const path = `${dir}/${slug}.md`
    await fs.writeFile(join(workspacePath, path), content)
    await indexEntity({ type, name, path })
    return { success: true, path }
  },
})

const addAnnotation = tool({
  description: 'Add an investigative annotation to a dossier entity',
  parameters: z.object({
    entityPath: z.string(),
    annotation: z.object({
      source: z.string(),
      page: z.number(),
      highlight: z.string(),
      text: z.string(),
    }),
  }),
  execute: async ({ entityPath, annotation }) => {
    const block = formatAnnotationBlock(annotation)
    await appendToFile(entityPath, block)
    return { success: true }
  },
})

const createTimelineEvent = tool({
  description: 'Add an event to the timeline',
  parameters: z.object({
    date: z.string(),
    actors: z.array(z.string()),
    type: z.string(),
    source: z.string(),
    description: z.string(),
    follows: z.string().optional(),
  }),
  execute: async ({ date, actors, type, source, description, follows }) => {
    // Determinar arquivo: timeline/YYYY/YYYY-MM.md
    // Criar se não existe, append event block
  },
})
```

#### Ferramentas de Investigação

```typescript
const createInvestigation = tool({
  description: 'Create a new investigative line',
  parameters: z.object({
    title: z.string(),
    question: z.string(),
    description: z.string(),
    checklist: z.array(z.string()),
  }),
  execute: async ({ title, question, description, checklist }) => {
    // Criar pasta + investigation.md + pasta clues/
  },
})

const addClue = tool({
  description: 'Add a clue to an investigative line',
  parameters: z.object({
    investigation: z.string(),
    source: z.string(),
    page: z.number(),
    highlight: z.string(),
    text: z.string(),
  }),
  execute: async ({ investigation, source, page, highlight, text }) => {
    // Criar arquivo .md na pasta clues/ da investigation
  },
})
```

#### Ferramentas de Processamento

```typescript
const processSource = tool({
  description: 'Trigger processing of a source document',
  parameters: z.object({
    sourcePath: z.string(),
  }),
  execute: async ({ sourcePath }) => {
    // Inicia pipeline de processamento (PRD-02)
    // Retorna status e estimativa
  },
})
```

#### Ferramentas de Rastreabilidade & Verificação

```typescript
const crossReferenceCheck = tool({
  description: 'Cross-reference a claim across multiple sources to check consistency',
  parameters: z.object({
    claim: z.string().describe('The claim or fact to verify'),
    sourcePaths: z.array(z.string()).describe('Paths to sources to check against'),
  }),
  execute: async ({ claim, sourcePaths }) => {
    const results = []
    for (const path of sourcePaths) {
      const content = await fs.readFile(join(workspacePath, path), 'utf-8')
      results.push({ path, content: content.slice(0, 5000) })
    }
    return { claim, sources: results }
  },
})

const updateVerificationStatus = tool({
  description: 'Update the verification status of an annotation or clue',
  parameters: z.object({
    filePath: z.string(),
    blockIndex: z.number().describe('Index of the annotation/clue block in the file'),
    newStatus: z.enum(['unverified', 'verified', 'rejected']),
  }),
  execute: async ({ filePath, blockIndex, newStatus }) => {
    // Parse the file, find the Nth :::annotation or :::clue block,
    // update its status field, write back to disk
  },
})
```

#### Ferramentas de Conexão & Grafo

```typescript
const updateEntityConnections = tool({
  description: 'Scan a file for [[wikilinks]] and update the backlinks index',
  parameters: z.object({
    filePath: z.string(),
  }),
  execute: async ({ filePath }) => {
    const content = await fs.readFile(join(workspacePath, filePath), 'utf-8')
    const wikilinks = extractWikilinks(content)
    await updateBacklinksIndex(filePath, wikilinks)
    return { filePath, linksFound: wikilinks.length }
  },
})
```

#### Ferramentas de Web Research

```typescript
// MVP: simplified web research — fetch + Cheerio only, no external API
const scrapeUrl = tool({
  description: 'Fetch and extract text content from a URL',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async ({ url }) => {
    const html = await fetch(url).then(r => r.text())
    const $ = cheerio.load(html)
    $('script, style, nav, footer, header').remove()
    return $('article, main, body').text().trim().slice(0, 10000)
  },
})

// Post-MVP: add Tavily API or similar for proper web search
// const webSearch = tool({ ... })
```

#### Ferramentas de Planejamento

```typescript
const createPlan = tool({
  description: 'Create a structured action plan for an investigative task',
  parameters: z.object({
    goal: z.string(),
    steps: z.array(z.object({
      action: z.string(),
      tool: z.string(),
      rationale: z.string(),
    })),
  }),
  execute: async ({ goal, steps }) => {
    return { goal, steps, status: 'awaiting_approval' }
  },
})
```

### 4.3 System Prompt do Agente

```markdown
You are Capybara, an AI investigative journalism assistant.
You help journalists process documents, organize information
into dossiers, and develop investigative hypotheses.

## Core Rules

1. Every claim must be traceable to an original source document
2. Always use :::annotation blocks with source references
3. Create [[wikilinks]] to connect entities across the dossier
4. Never fabricate information — only extract what's in the sources
5. When uncertain, mark annotations as "unverified"
6. Write in the journalist's language (match their input language)
7. Be transparent about your reasoning and limitations

## Available Context

- @source mentions provide preview.md + metadata.md of a source
- For PDFs, you can read replica.md for the full text
- @dossier mentions provide the entity's markdown file
- !investigation mentions provide the investigation + all clues
- Use tools to read additional files when needed

## Working Style

- Explain what you're doing in natural language
- Report modifications as action pills
- In Planning Mode: present plan and wait for approval
- In Agent Mode: execute autonomously but explain each step
- In Question Mode: answer questions only, never modify files
```

---

## 5. Capybara Markdown — Dialeto e Renderer

### 5.1 Stack do Renderer

```
react-markdown
├── remark-directive           → Parse :::annotation, :::clue, :::event
├── remark-directive-rehype    → Converter directives para React components
├── remark-wiki-link           → Parse [[wikilinks]]
│   (ou plugin custom)
├── remark-gfm                 → GitHub Flavored Markdown (tabelas, tasklists)
├── remark-frontmatter         → Ignorar frontmatter no rendering
├── rehype-highlight           → Syntax highlighting de code blocks
├── rehype-source-ref          → Plugin CUSTOM: parse →[source, p.X, "highlight"]
│   (transforma em badges clicáveis de rastreabilidade)
└── gray-matter                → Parse YAML frontmatter em objetos JS
    (pré-processing)
```

### Plugin custom: `rehype-source-ref`

Transforma a sintaxe `→[contrato-01.pdf, p.2, "João Silva"]` em badges clicáveis:

```typescript
function rehypeSourceRef() {
  return (tree: Root) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /→\[(.+?)\]/g
      let match
      while ((match = regex.exec(node.value)) !== null) {
        const ref = parseSourceRef(match[1])
        // Replace text node with SourceRefBadge component
        // Badge shows: 📄 contrato-01.pdf, p.2
        // On click: opens original file at page 2 with text highlighted
      }
    })
  }
}

function parseSourceRef(raw: string): SourceRef {
  // "contrato-01.pdf, p.2, \"João Silva\"" →
  // { file: "contrato-01.pdf", page: 2, highlight: "João Silva" }
  const parts = raw.split(',').map(s => s.trim())
  return {
    file: parts[0],
    page: parts[1] ? parseInt(parts[1].replace('p.', '')) : undefined,
    highlight: parts[2]?.replace(/"/g, ''),
  }
}
```

### 5.2 Componentes Custom por Block Type

```typescript
const markdownComponents = {
  // :::annotation → AnnotationCard
  annotation: ({ status, source, page, highlight, children }) => (
    <AnnotationCard
      status={status}
      source={source}
      page={page}
      highlight={highlight}
      onVerify={() => updateStatus('verified')}
      onReject={() => updateStatus('rejected')}
    >
      {children}
    </AnnotationCard>
  ),

  // :::clue → ClueCard
  clue: ({ status, source, page, highlight, investigation, children }) => (
    <ClueCard
      status={status}
      source={source}
      page={page}
      highlight={highlight}
      investigation={investigation}
      onVerify={() => updateStatus('verified')}
      onReject={() => updateStatus('rejected')}
    >
      {children}
    </ClueCard>
  ),

  // :::event → EventCard (rendered as mini timeline within monthly files)
  event: ({ date, actors, type, source, follows, children }) => (
    <EventCard
      date={date}
      actors={actors}
      type={type}
      source={source}
      follows={follows}
    >
      {children}
    </EventCard>
  ),

  // [[wikilink]] → NavigationLink
  wikiLink: ({ value, href }) => (
    <WikiLink
      name={value}
      href={href}
      onClick={() => navigateToEntity(href)}
    />
  ),
}
```

### Timeline Visual Layout

Dentro de arquivos mensais (`timeline/YYYY/YYYY-MM.md`), múltiplos `:::event` blocks são renderizados como uma **mini visual timeline** vertical:

```
│ 15 Mar ── bid_opening ─────────────────────────────────
│          Prefeitura de São Paulo abre licitação #042...
│          Actors: [[Prefeitura de São Paulo]], [[Construtora XYZ]]
│          📄 edital-042.pdf
│
│ 22 Mar ── bid_result ──────────────────────────────────
│  ↳ follows: 15 Mar / bid_opening
│          Construtora XYZ vence licitação #042...
│          Actors: [[Construtora XYZ]], [[Consórcio ABC]]
│          📄 ata-resultado-042.pdf
```

- Linha vertical conecta eventos cronologicamente
- `follows` field renderiza seta `↳` indicando cadeia causa-efeito
- Actors como [[wikilinks]] clicáveis
- Badge com source reference

### 5.3 Frontmatter Rendering

```typescript
import matter from 'gray-matter'

function renderMarkdownFile(filePath: string, rawContent: string) {
  const { data: frontmatter, content } = matter(rawContent)

  return (
    <>
      <FrontmatterHeader
        type={frontmatter.type}
        name={frontmatter.name || frontmatter.title}
        tags={frontmatter.tags}
        created={frontmatter.created}
        updated={frontmatter.updated}
        icon={getIconForType(frontmatter.type)}
      />
      <CapybaraMarkdown content={content} />
      {shouldShowConnections(frontmatter.type) && (
        <ConnectionsBlock filePath={filePath} />
      )}
      {shouldShowTOC(content) && (
        <TableOfContents content={content} />
      )}
    </>
  )
}
```

### 5.4 Ícones por Tipo de Entidade

| type | icon | variações por category |
|------|------|------------------------|
| person | 👤 | — |
| group | 🏛️ | 🏢 company, 🏛️ government, ⚖️ political_party |
| place | 📍 | — |
| source_preview | 📄 | — |
| investigation | 🔍 | — |
| clue | 💡 | — |
| event | 📅 | — |
| timeline | 📅 | — |

### 5.5 Estilização

O renderer usa classes Tailwind + tokens do tema Capybara 0:

- Tipografia: `font-sans` (IBM Plex Sans Thai)
- Code blocks: `font-mono` (IBM Plex Mono)
- Espaçamento: Otimizado para leitura longa
- Annotations: Cards com borda lateral colorida (verde=verified, cinza=unverified, vermelho=rejected)
- Wikilinks: Texto com underline + ícone do tipo da entidade

---

## 6. Zustand Stores do Domínio

```typescript
// Chat Store — MVP: fully in-memory (no persistence)
// Sessions are lost when the app closes. Persistence added post-MVP.
interface ChatStore {
  messages: ChatMessage[]
  mode: ChatMode
  contextTags: ContextTag[]
  tokenCount: number
  tokenLimit: number // default 150000
  isStreaming: boolean

  sendMessage: (content: string) => Promise<void>
  setMode: (mode: ChatMode) => void
  addContextTag: (tag: ContextTag) => void
  removeContextTag: (tagId: string) => void
  clearMessages: () => void
  newSession: () => void // just clears messages + context
}

// Viewer Store
interface ViewerStore {
  currentFile: string | null
  history: string[]
  historyIndex: number

  openFile: (path: string) => void
  goBack: () => void
  goForward: () => void
}
```

---

## 7. Chat-First Principle

O chat opera sob o **Chat-First Principle** (detalhado em `PRD-05-ui-interaction-screens.md` §5): nenhum botão no app executa ações diretamente. Todos os botões injetam comandos pré-preenchidos no chat input, permitindo ao usuário adicionar contexto antes de executar.

Isso impacta diretamente este domínio:
- Action pills no chat são o feedback de ações executadas
- Slash commands são a interface principal de interação
- O chat deve suportar `setInputValue()` e `setGuidance()` para injeção externa
- O chat deve expandir automaticamente quando um comando é injetado (via `ensureVisible()`)

Detalhes completos do Button-to-Command Map: ver PRD-05 §5.2.

---

## 8. Transparent Metadata Interaction

Jornalistas têm visibilidade completa sobre o que a IA escreve no `metadata.md`. Embora não possam editar metadata diretamente (tipando), podem interagir com a IA via chat para alterar, corrigir ou atualizar metadata:

**Fluxo:**
1. Jornalista abre source detail view → vê metadata.md renderizado
2. Identifica algo incorreto ou incompleto
3. Vai ao chat e digita: `@source/contrato-01 update the metadata: João Silva's role should be CEO, not legal representative`
4. Agente usa `editFile` tool para corrigir o campo em metadata.md
5. Viewer atualiza automaticamente (via file watcher)

---

## 9. Contratos com Outros Domínios

### ← Consome de Workspace & Infra
- `ipc:ai.*` — Engine de AI (streaming, tools)
- `ipc:db.*` — Persistência de chat, busca
- `ipc:files.*` — Leitura/escrita de arquivos
- Zustand stores compartilhados

### ← Consome de Sources
- preview.md e metadata.md para contexto do agente
- replica.md para análise detalhada de PDFs
- Status de processamento para informar o agente

### ← Consome de Dossier & Investigations
- Arquivos de entidades para contexto do agente
- Investigations e Clues para contexto com !mention
- Backlinks para Connections Block no renderer

### ← Consome de UI & Interaction (PRD-05)
- Chat-First Principle: comandos injetados externamente
- Contextual Action Bar: botões delegam ao chat
- Keyboard shortcuts: `Cmd+K` foca chat input

### → Produz (via ferramentas do agente)
- Cria e modifica arquivos em Sources, Dossier e Investigations
- Popula entidades, annotations, clues, events
- Atualiza metadata e índices

---

## 10. Dependências Específicas

```json
{
  "dependencies": {
    "react-markdown": "^9",
    "remark-directive": "^4",
    "remark-directive-rehype": "^0.4",
    "remark-gfm": "^4",
    "remark-frontmatter": "^5",
    "rehype-highlight": "^7",
    "gray-matter": "^4",
    "minisearch": "^7",
    "react-mentions": "^4",
    "cmdk": "^1",
    "gpt-tokenizer": "^3.4",
    "cheerio": "^1.0",
    "slugify": "^1.6"
  }
}
```
