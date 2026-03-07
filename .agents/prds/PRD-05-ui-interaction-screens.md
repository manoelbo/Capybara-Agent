# PRD-05: UI, Interação & Screens

> **Domínio:** Interface, Interação & Mapa de Telas
> **PRD Master:** `PRD-00-master.md`
> **Depende de:** Todos os domínios (Infra, Sources, Dossier, Chat/Agent)
> **Consumido por:** Implementação do Renderer Process
> **Referência primária:** `.agents/refs/Capybara_agent_project.md` §Design System, §User Interface Specification

---

## 1. Visão do Domínio

Este domínio especifica **como o usuário interage com o Capybara Agent**: layout master, estrutura da sidebar, templates do viewer, o Chat-First Principle (padrão arquitetural de interação), action bars, mapa completo de telas, e a divisão clara entre o que o usuário CAN e CANNOT fazer diretamente.

Os domínios anteriores (PRD-01 a PRD-04) cobrem **o que** o sistema faz. Este PRD cobre **como** o usuário experimenta isso.

---

## 2. Referências de Design

O Capybara Agent é inspirado em 4 referências:

| Referência | O que inspira |
|---|---|
| **Obsidian** | Sidebar file tree, Graph View, Markdown viewer read-only |
| **Notion** | Navegação single-page (sem abas), organização de workspace |
| **Cursor / Claude Code** | Chat always-present, agent feedback real-time, streaming, action pills |
| **Mintlify / Docusaurus** | Rendering limpo de Markdown longo, TOC, backlinks |

---

## 3. Master Layout

O app é dividido em **3 zonas persistentes**:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │            [Viewer Area]                    │  [Chat]  │
│ collapsible│  Single page view (Notion-style)             │  fixed   │
│  ~260px    │  flex (grows/shrinks)                        │  ~380px  │
│            │  + floating Graph View (bottom-right)        │expandable│
└──────────────────────────────────────────────────────────────────────┘
```

### 3.1 Sidebar (esquerda)

- Largura default: ~260px
- Colapsável via `Cmd+B` ou ícone hamburger
- Quando colapsada, Viewer + Chat ocupam toda a largura
- Conteúdo: file tree, drop zone, processing status, graph view link

### 3.2 Viewer Area (centro)

- Cresce/shrink conforme estado da Sidebar e Chat
- Exibe **uma página por vez** (Notion-style, sem abas horizontais)
- Graph View flutua como widget no bottom-right corner
- Contextual Action Bar aparece abaixo do breadcrumb para tipos específicos

### 3.3 Chat (direita)

- Sempre visível; pode ser expandido (viewer encolhe proporcionalmente)
- Nunca totalmente oculto
- Estado mínimo: input bar + mode indicator
- Largura expandida: ~380px

---

## 4. Sidebar — Estrutura Detalhada

A sidebar é um file tree **read-only**. O usuário NÃO pode criar, renomear, mover ou deletar itens diretamente. Todas as mudanças estruturais são feitas pelo agente via chat.

### 4.1 Seções (de cima para baixo)

**1. Workspace Header**

```
┌────────────────────────────────────┐
│ ⚙ Investigation Desk: [name]      │
└────────────────────────────────────┘
```

- Exibe nome do Investigation Desk atual
- Chevron para trocar entre workspaces

**2. Sources**

```
📁 Sources
  ├── 📄 contrato-01.pdf          [✓]
  ├── 📄 contrato-02.pdf          [⟳]
  ├── 📄 email-dump.eml           [○]
  └── 📁 fotografias/
        ├── 🖼️ foto-reuniao.jpg   [✓]
        └── 🖼️ scan-doc.png      [○]
```

- **Processing status badge** inline à direita:
  - `○` Not processed (gray)
  - `⟳` Processing (animated spinner, yellow)
  - `✓` Processed (green)
- Clicar no nome abre a **view processada** (preview.md + metadata.md) no Viewer
- Ícone 🔗 ao lado de cada arquivo abre o **original** no app padrão do sistema

**3. Investigations**

```
🔍 Investigations
  ├── 📋 Corporate Cluster Hypothesis
  │     ├── 💡 Clue: Company X in 3 contracts     [○]
  │     ├── 💡 Clue: Inflated price lot 22         [✓]
  │     └── 💡 Clue: Same root CNPJ                [✕]
  └── 📋 Public Works Overbilling
        └── 💡 (empty)
```

- Linhas investigativas são expandíveis para mostrar clues
- Clues exibem verification status badge inline
- Clicar numa investigation abre detail view no Viewer
- Clicar numa clue abre com traceability link visível

**4. Dossier**

```
📂 Dossier
  ├── 👤 People/
  │     ├── João Silva.md
  │     └── Maria Fernandes.md
  ├── 🏛️ Groups/
  │     └── Construtora XYZ.md
  ├── 📍 Places/
  └── 📅 Timeline/
        ├── 2023/
        └── 2024/
```

- Estrutura de pastas gerenciada exclusivamente pelo agente
- Clicar em qualquer `.md` abre no Viewer
- Arquivos do dossiê suportam `[[bidirectional links]]` renderizados como links clicáveis

**5. Drop Zone & Processing Status**

```
┌────────────────────────────────────┐
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │ 📎 Drop files here          │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                    │
│  ⟳ contrato-02.pdf  Processing... │
│  ✓ contrato-01.pdf  Done          │
│  ○ scan.png         Queued        │
└────────────────────────────────────┘
```

- Drag-and-drop zone para adicionar sources
- Feed de status de processamento em tempo real
- Cada entrada: nome do arquivo + status (queued, processing, done, error)
- Clicar numa entrada abre o source detail correspondente no Viewer

**6. Graph View Link (footer)**

- Botão fixo no fundo da sidebar: `⤢ Open Full Graph`
- Clicar abre Graph View fullscreen no Viewer

---

## 5. Chat-First Principle

> **Regra fundamental:** Nenhum botão no aplicativo executa uma ação diretamente. Todo botão **injeta um comando no chat** e convida o usuário a adicionar contexto antes de pressionar Enter.

### 5.1 Fluxo de Injeção

1. Usuário clica um botão (ex: "New Clue" dentro de uma investigation vazia)
2. Chat panel abre (se estava minimizado)
3. Input field recebe comando pré-preenchido
4. Mensagem de orientação aparece acima do input em estilo sutil de onboarding:

> *"This command was generated automatically. Add more context if you want and press Enter."*

5. O usuário pode editar o comando, adicionar instruções, ou simplesmente pressionar Enter

### 5.2 Button-to-Command Map

| Contexto | Label do botão | Comando injetado no chat |
|---|---|---|
| Investigations (vazio) | `• New Investigation` | `/create_line` + guidance text |
| Investigation detail | `• New Clue` | `/create_clue !InvestigationName` + guidance text |
| Investigation detail | `📋 Create Plan` | `/plan !InvestigationName` + guidance text |
| Investigation detail | `✏️ Update Investigation` | `!InvestigationName update:` + guidance text |
| Sources (files selecionados) | `Process Selected (3)` | `/process @file1 @file2 @file3` |
| Sources | `Process All Unprocessed` | `/process_all unprocessed` com estimativa de custo |
| Dossier entity | `🌐 Enrich from Web` | `/web_search @dossier/people/EntityName` |
| Source (processado) | `🔄 Reprocess` | `/reprocess @filename` |

### 5.3 Implementação

```typescript
interface ChatInjection {
  command: string
  guidanceText: string
  contextTags?: ContextTag[]
  autoSubmit?: boolean // nunca true por padrão
}

function injectChatCommand(injection: ChatInjection) {
  const chatStore = useChatStore.getState()
  chatStore.setInputValue(injection.command)
  chatStore.setGuidance(injection.guidanceText)
  if (injection.contextTags) {
    injection.contextTags.forEach(tag => chatStore.addContextTag(tag))
  }
  chatStore.ensureVisible() // expande o chat se minimizado
}
```

---

## 6. Viewer Area — Especificação Detalhada

### 6.1 Navegação (Notion-style)

O Viewer exibe **uma página por vez**, sem abas horizontais.

1. Clicar num item na sidebar abre no Viewer, substituindo o conteúdo atual
2. Clicar num `[[backlink]]` dentro de uma página navega para a entidade, substituindo a view
3. **Back/forward** do browser (`Cmd+[` / `Cmd+]`) para navegar entre páginas recentes
4. **Breadcrumb trail** no topo: `Dossier > People > João Silva`

```
┌─────────────────────────────────────────────────────────────────┐
│  ← →  Dossier > People > João Silva                            │
│  ─────────────────────────────────────────────────────────────  │
│  [Contextual Action Bar: ações específicas para este tipo]      │
├─────────────────────────────────────────────────────────────────┤
│  [Conteúdo renderizado]                                         │
│                                                                 │
│                                        ┌─── GRAPH VIEW ───────┐│
│                                        │  ◉ João Silva        ││
│                                        │ / \                  ││
│                                        │◉   ◉ Construtora XYZ ││
│                                        │     [⤢ Expand]       ││
│                                        └──────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Contextual Action Bar

Aparece **abaixo do breadcrumb** com ações relevantes ao tipo de conteúdo atual. Botões seguem o Chat-First Principle (injetam comandos no chat).

| Content type | Ações disponíveis |
|---|---|
| Source (detail) | `🔄 Reprocess` `🔗 Open Original` `📋 View Replica` |
| Investigation | `💡 New Clue` `📋 Create Plan` `✏️ Update Investigation` |
| Dossier entity | `🌐 Enrich from Web` `📝 Add Annotation` |
| Sources (list) | `Process Selected` `Process All Unprocessed` |
| Graph View (fullscreen) | Filter controls, color/type toggles |

A action bar é **oculta** quando o conteúdo não tem ações específicas (ex: lendo uma replica).

### 6.3 Viewer Templates por Content Type

#### Source Detail View

```
contrato-emergencial-042.pdf
Status: ✓ Processed  |  Type: PDF  |  Pages: 147
🔗 Open original file
─────────────────────────────────────
[preview.md rendered]
[metadata.md rendered]

── Dossier Connections ──────────────
👤 João Silva (People)
🏛️ Construtora XYZ (Groups)
🏛️ Prefeitura de São Paulo (Groups)
```

- Header com metadata do arquivo e processing status
- Link para abrir arquivo original
- Preview e metadata renderizados abaixo
- Para PDFs: seção/tab adicional com `replica.md`
- Dossier Connections compilado a partir de `entities_mentioned` do metadata.md

#### Investigation Detail View

```
🔍 Corporate Cluster Hypothesis
Created: 2026-02-12  |  Updated: yesterday
─────────────────────────────────────
[Description]
[Objectives checklist]

── Clues ─────────────────────────────
💡 Company X appears in 3 distinct contracts
   Source: contrato-01.pdf, p.23 → [view source]
   Status: ○ unverified

💡 Inflated unit price on lot 22
   Source: contrato-03.pdf, p.87 → [view source]
   Status: ✓ verified
```

#### Dossier Entity View

```
👤 João Silva
[AI-generated Markdown content with [[backlinks]]]

── Investigative Annotations ─────────
📌 Signed contract #042 as legal representative
   Source: contrato-01.pdf, p.2 → [view source]
   Status: ○ unverified

── Connections ───────────────────────
📄 contrato-01.pdf (Source)
📄 contrato-03.pdf (Source)
🏛️ Construtora XYZ (Dossier)
📋 Corporate Cluster (Investigation)
```

### 6.4 Connections Block (Backlinks)

Renderizado no **bottom** de cada Dossier entity, Investigation e Clue. Responde: *"O que mais referencia esta entidade?"*

**Regras de visibilidade:**

| Content type | Connections block |
|---|---|
| Dossier entity | ✅ Sempre |
| Investigation | ✅ Sempre |
| Clue | ✅ Sempre |
| Source (preview + metadata) | ✅ "Dossier Connections" (via `entities_mentioned` do metadata.md) |
| Source (replica) | ❌ Não exibido |

Cada item é um link clicável que navega para o arquivo referenciado.

### 6.5 Table of Contents ("In this document")

Colapsável, para documentos com 3+ headings:

```
┌─ In this document ─────────────────┐
│  Summary                           │
│  Corporate Relationships           │
│  Linked Contracts                  │
│  Investigative Annotations         │
└────────────────────────────────────┘
```

**Regras de visibilidade:**

| Content type | Table of Contents |
|---|---|
| Dossier entity | ✅ Se 3+ headings |
| Investigation | ✅ Se 3+ headings |
| Clue | ❌ (clues são curtas) |
| Source (preview + metadata) | ✅ Se 3+ headings |
| Source (replica) | ✅ Sempre (são longas) |

---

## 7. Verification Status — Interação Detalhada

A **única** ação de edição direta disponível ao usuário em todo o aplicativo. Tudo mais é read-only e gerenciado via chat.

### 7.1 Padrão de Interação (hover-based)

**Estado default:**

```
💡 Company X appears in 3 contracts
   Source: contrato-01.pdf, p.23 → [view source]
   Status: ○ unverified
```

**On hover:** Dois ícones de ação aparecem ao lado do status.

```
Status: ○ unverified   [✓ Verify]  [✕ Reject]
```

**Após clicar:** Status atualiza imediatamente, sem dialog de confirmação.

- `✓ verified` — texto verde
- `✕ rejected` — texto vermelho com strikethrough no título da clue
- `○ unverified` — texto cinza (default)

**Toggling back:** Clicar no status de item já verificado/rejeitado reseta para `unverified`.

### 7.2 Persistência

A mudança de status é salva diretamente no campo `status` do bloco `:::annotation` ou `:::clue` no arquivo `.md` no disco, via IPC.

---

## 8. Sources — Upload & Management

Sources são adicionadas **exclusivamente via drag and drop**. Sem file picker dialog, sem monitoramento de pasta, sem import de URL no v0.1.

### 8.1 Sources Panel (no Viewer)

```
┌─ Sources ─────────────────────────────────────────────┐
│                                                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  │  📎 Drag and drop your files here               │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                                        │
│  ☐ contrato-01.pdf              [✓ Processed]          │
│  ☐ contrato-02.pdf              [⟳ Processing...]      │
│  ☐ email.eml                    [○ Not processed]      │
│  ☐ scan.png                     [○ Not processed]      │
│                                                        │
│  [Process Selected (2)]    [Process All Unprocessed]   │
│                                                        │
│  ℹ️ To update a file, delete it and upload again.      │
└────────────────────────────────────────────────────────┘
```

**Regras:**
- Drag and drop é o único método de adicionar arquivos
- Arquivos originais são **imutáveis** após upload
- Para "atualizar" um source: deletar a referência e re-upload
- Deletar um source remove o original e todos os `.md` gerados (preview, metadata, replica)
- Checkboxes permitem multi-seleção para batch processing
- Botões de processamento injetam comandos no chat (Chat-First Principle)

### 8.2 Drag-and-Drop no Chat

O usuário **pode** arrastar arquivos diretamente no chat. Porém, a interface deve **encorajar ativamente** o uso da área de Sources:

- Se um arquivo é dropado no chat, uma mensagem sutil aparece:

> *"Tip: For full processing and traceability, add files to Sources first via the sidebar."*

- O arquivo dropado no chat é enviado como contexto temporário para aquela mensagem, mas NÃO é adicionado à base de Sources automaticamente.

---

## 9. Graph View — Estados

### 9.1 Widget Flutuante (default)

Compacto, ancorado no **bottom-right** do Viewer. Paira sobre o conteúdo. Visível quando qualquer arquivo de Dossier, Investigation ou Clue está aberto.

```
┌─── GRAPH VIEW ───────┐
│  ◉ João Silva         │
│ / \                   │
│◉   ◉ Construtora XYZ  │
│                       │
│ ON THIS PAGE          │
│  João Silva           │
│  Construtora XYZ      │
│       [⤢ Expand]      │
└───────────────────────┘
```

- Background semi-transparente, totalmente opaco no hover
- Colapsável para ícone `◉` para maximizar espaço de leitura
- Mostra nós e conexões do **page ativo**
- "ON THIS PAGE" lista backlinks como texto clicável
- Atualiza dinamicamente ao navegar
- Nós são clicáveis: navega para entidade no Viewer

### 9.2 Fullscreen

Clicar "Expand" substitui o conteúdo do Viewer com o grafo completo:

- Mostra **todos** os nós e conexões do workspace
- Filtros: por tipo de entidade (People, Groups, Places, Sources, Investigations)
- Color coding: nós coloridos por tipo + highlighting custom por tags
- Zoom e pan controls
- Clicar num nó → abre entidade no Viewer e sai do fullscreen
- Botão "Exit fullscreen" retorna ao estado anterior do Viewer
- Também acessível pelo botão no footer da sidebar (`⤢ Open Full Graph`)

### 9.3 MVP Simplification

Para o MVP de 1 semana:
- ✅ Widget flutuante (react-force-graph-2d, bottom-right)
- ✅ Nós por tipo com cores/ícones
- ✅ Clicar nó → navegar para entidade
- ❌ Fullscreen com filtros avançados → pós-MVP
- ❌ Customização visual (color-coding por tags) → pós-MVP

---

## 10. Screen Map

Lista completa de todas as telas e estados do aplicativo:

| # | Tela / Estado | Descrição | PRD de referência |
|---|---|---|---|
| 1 | **Onboarding** | Create Investigation Desk + paste OpenRouter API Key | PRD-01 |
| 2 | **Sources (list view)** | Dropzone + file list com status badges + checkboxes + botões de processamento | PRD-02, §8.1 |
| 3 | **Source (detail view)** | preview.md + metadata.md renderizados + link para original + status | PRD-02 |
| 4 | **Source (replica view)** | replica.md renderizado para PDFs, com Table of Contents | PRD-02 |
| 5 | **Investigations (list view)** | Lista de linhas investigativas + botão "New Investigation" (injeta no chat) | PRD-03 |
| 6 | **Investigation (detail view)** | Title/question + description + checklist + clues com hover-based status toggles | PRD-03 |
| 7 | **Dossier (tree navigation)** | Folder tree (People, Groups, Places, Timeline) com Graph View widget | PRD-03 |
| 8 | **Dossier (entity detail)** | Markdown renderizado com `[[backlinks]]`, annotations, e Connections block | PRD-03 |
| 9 | **Graph View (widget)** | Grafo contextual compacto + "On this page" list, embedded no corner do viewer | PRD-03 |
| 10 | **Graph View (fullscreen)** | Grafo completo da investigação com filtros por type/tag/color + zoom + click-to-navigate | PRD-03 |
| 11 | **Settings** | API Key, seleção de modelo por task, theme toggle, token limit configuration | PRD-01 |
| 12 | **Chat** | Painel always-present à direita com mode toggle, token counter, action pills, context bar | PRD-04 |

---

## 11. Interaction Summary — CAN vs CANNOT

### O que o usuário CAN fazer diretamente (sem chat)

- ✅ Navegar o file tree na sidebar
- ✅ Abrir arquivos no Viewer (click to open, Notion-style single page)
- ✅ Clicar `[[backlinks]]` para navegar entre documentos
- ✅ Usar back/forward para navegar entre páginas recentes
- ✅ Alternar verification status em Clues e Annotations (hover-based)
- ✅ Arrastar e soltar arquivos na zona de Sources
- ✅ Selecionar múltiplos arquivos com checkboxes
- ✅ Expandir/colapsar a sidebar
- ✅ Expandir/colapsar o chat
- ✅ Alternar entre light e dark mode
- ✅ Alternar modo do chat (Q/P/A)
- ✅ Interagir com o Graph View (zoom, pan, clicar nós)

### O que o usuário CANNOT fazer diretamente (deve usar chat)

- ❌ Criar, editar ou deletar qualquer arquivo Markdown
- ❌ Criar ou modificar linhas investigativas (exceto toggle de status)
- ❌ Criar ou modificar clues (exceto toggle de status)
- ❌ Processar documentos
- ❌ Modificar metadata ou previews
- ❌ Organizar arquivos em pastas
- ❌ Criar ou modificar entidades do dossiê
- ❌ Enriquecer entidades com dados da web
- ❌ Qualquer mudança estrutural no workspace

---

## 12. Keyboard Shortcuts

| Ação | Shortcut |
|---|---|
| Toggle sidebar | `Cmd+B` |
| Navigate back | `Cmd+[` |
| Navigate forward | `Cmd+]` |
| Focus chat input | `Cmd+K` |
| New chat session | `Cmd+Shift+N` |
| Toggle theme | `Cmd+Shift+T` |
| Open Graph View fullscreen | `Cmd+G` |

---

## 13. Onboarding Screen

### 13.1 Fluxo

```
┌─────────────────────────────────────────────┐
│                                             │
│  🐾 Welcome to Capybara Agent              │
│                                             │
│  Create your first Investigation Desk       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Investigation name                  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ OpenRouter API Key (sk-or-...)      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Theme: [☀️ Light] [🌙 Dark]                │
│                                             │
│  [Create Investigation Desk →]              │
│                                             │
└─────────────────────────────────────────────┘
```

### 13.2 Comportamento

- Exibido na primeira vez que o app abre (sem workspace existente)
- Após criar, o app navega para o layout master com workspace vazio
- API Key é salva em `.capybara/config.json` dentro do workspace
- Modelos default são pré-configurados (podem ser ajustados depois em Settings)
- Se o usuário já tem workspaces, mostra uma tela de seleção em vez do onboarding

---

## 14. Frontmatter Schema Consolidado

Tabela de referência rápida para todos os tipos de arquivo e seus campos frontmatter obrigatórios:

| Tipo de arquivo | Campos obrigatórios |
|---|---|
| Source (preview) | `type`, `original_file`, `format`, `pages`, `processed_at`, `tags`, `summary` |
| Source (metadata) | `type`, `original_file`, `entities_mentioned`, `dates_found`, `locations`, `tags` |
| Source (replica) | `type`, `original_file`, `pages`, `generated_at`, `model` |
| Dossier entity (Person) | `type: person`, `name`, `aliases`, `category`, `first_seen_in`, `tags`, `created`, `updated` |
| Dossier entity (Group) | `type: group`, `name`, `category`, `registration_id`, `members`, `first_seen_in`, `tags`, `created`, `updated` |
| Dossier entity (Place) | `type: place`, `name`, `country`, `city`, `coordinates`, `tags` |
| Investigation | `type: investigation`, `title`, `question`, `created`, `updated`, `status`, `tags` |
| Clue | `type: clue`, `investigation`, `source`, `page`, `status`, `created` |
| Timeline entry | `type: timeline`, `year`, `month`, `events_count`, `tags` |
| Event (bloco :::event) | `date`, `actors`, `type` (event_type), `source`, `follows` (optional), `tags` |
| Dossier config | `type: dossier_config`, `language` |

### Entity Type Icons (resolução dinâmica)

```typescript
function getIconForType(type: string, category?: string): string {
  const iconMap: Record<string, string> = {
    person: '👤',
    group: '🏛️',
    place: '📍',
    source_preview: '📄',
    source_metadata: '📄',
    source_replica: '📄',
    investigation: '🔍',
    clue: '💡',
    event: '📅',
    timeline: '📅',
  }

  if (type === 'group' && category) {
    const groupIcons: Record<string, string> = {
      company: '🏢',
      government: '🏛️',
      political_party: '⚖️',
      criminal_org: '🚨',
      foundation: '🏛️',
      team: '👥',
    }
    return groupIcons[category] || '🏛️'
  }

  return iconMap[type] || '📄'
}
```

---

## 15. Contratos com Outros Domínios

### ← Consome de todos os domínios

- PRD-01: Electron window (frameless, traffic lights), theme, IPC
- PRD-02: Source status badges, processing pipeline, drop zone
- PRD-03: Dossier file tree, entity templates, graph data, backlinks, verification
- PRD-04: Chat panel, streaming, action pills, mentions, mode toggle, markdown rendering

### → Provê para implementação

- Layout constraints e medidas
- Especificações de interação detalhadas
- Screen map completo
- Chat-First Principle como padrão arquitetural
- Keyboard shortcuts

---

## 16. UX Requirements Transversais

### ScrollArea

Todos os painéis scrolláveis (sidebar, viewer, chat message area) devem usar o componente `ScrollArea` do shadcn/ui (baseado em Radix) para garantir scrollbars estilizadas e consistentes, em vez dos scrollbars nativos do Chromium.

```bash
pnpm dlx shadcn@latest add scroll-area
```

### Tema Capybara 0 — Instalação

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmmfid9kr000104jufj121z63
```

Isso injeta os CSS variable tokens no stylesheet global (`:root` para light, `.dark` para dark) e atualiza os arquivos de configuração do shadcn.

### Highlight em PDF Original

No MVP, `→[source]` links abrem o arquivo original no app padrão do sistema (Preview.app no macOS). A funcionalidade de highlight in-place dentro do PDF (estilo NotebookLM) é planejada para pós-MVP e requer um viewer de PDF embutido.

---

## 17. Dependências Específicas deste Domínio

Este domínio não adiciona dependências novas. Toda a UI é construída com:

- `shadcn/ui` + Tailwind (PRD-01)
- `react-force-graph-2d` (PRD-03)
- `react-mentions` (PRD-04)
- `cmdk` (PRD-04)
- `react-markdown` + unified plugins (PRD-04)

Os componentes de produto específicos estão definidos no doc de referência:

| Componente | Localização | Descrição |
|---|---|---|
| `AppSidebar` | `components/app/` | File tree com status badges, drop zone, processing feed |
| `ViewerPanel` | `components/app/` | Markdown renderer com breadcrumb navigation |
| `ChatPanel` | `components/app/` | Message area, mode toggle, context bar, input com autocomplete |
| `GraphFloatingWidget` | `components/app/` | Widget de grafo no bottom-right |
| `GraphFullscreen` | `components/app/` | Grafo expandido com filtros |
| `VerificationToggle` | `components/app/` | Hover-based status toggle para clues/annotations |
| `ActionPill` | `components/app/` | Badges clicáveis de modificação no chat |
| `TokenCounter` | `components/app/` | Display de tamanho de contexto real-time |
| `ModeToggle` | `components/app/` | Seletor Q/P/A dentro do Chat Panel |
| `SourceCard` | `components/app/` | Entrada de arquivo com badge de status |
| `ConnectionsBlock` | `components/app/` | Seção de backlinks para entidades |
| `ContextualActionBar` | `components/app/` | Barra de ações por tipo de conteúdo |
| `BreadcrumbNav` | `components/app/` | Navegação breadcrumb + back/forward |
| `TableOfContents` | `components/app/` | TOC colapsável para docs longos |
| `FrontmatterHeader` | `components/app/` | Header card com metadata do frontmatter |
