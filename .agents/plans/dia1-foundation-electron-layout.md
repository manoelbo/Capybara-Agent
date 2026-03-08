# Feature: Dia 1 — Foundation: Frameless Window + Layout Master

The following plan should be complete, but it is important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types and models. Import from the right files etc.

## Feature Description

Após o setup manual (guia em `.agents/guides/dia1-setup-electron-vite-react-tailwind-shadcn.md`), esta feature configura a **frameless window** do Electron com macOS traffic lights e implementa o **layout master** baseado no Application Shell 9 do shadcnblocks, adaptado para as 4 zonas do Capybara Agent: Activity Bar + File Explorer Sidebar + Viewer Area + Chat Panel.

O objetivo é ter uma **estrutura base visual validável** — o app Electron abre com frameless window, traffic lights, drag region, e o layout IDE-style com as 4 zonas renderizadas (mesmo que com conteúdo placeholder).

## User Story

As a journalist using Capybara Agent
I want a native-feeling macOS app with an IDE-style layout
So that I can navigate between sources, viewer, and chat in a familiar, efficient interface

## Problem Statement

O projeto precisa de uma base visual que permita validar o layout e a estrutura do app antes de implementar funcionalidades de domínio. Sem essa fundação, não é possível construir os demais domínios (Sources, Dossier, Chat) de forma coerente.

## Solution Statement

1. Configurar `BrowserWindow` como frameless com `titleBarStyle: 'hiddenInset'` e traffic light position customizada
2. Instalar o bloco Application Shell 9 via shadcnblocks CLI
3. Adaptar o shell para as 4 zonas do Capybara (Activity Bar, Sidebar, Viewer, Chat)
4. Adicionar drag region via CSS (`-webkit-app-region: drag`) no header
5. Aplicar dark mode como default e configurar classe `.dark` no HTML

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Main Process (BrowserWindow), Renderer (Layout components)
**Dependencies**: shadcn/ui (button, collapsible, drawer, scroll-area, sidebar), shadcnblocks (application-shell9), lucide-react

---

## CONTEXT REFERENCES

### Relevant Codebase Files — IMPORTANT: YOU MUST READ THESE BEFORE IMPLEMENTING!

- `.agents/prds/PRD-01-workspace-infra-ai.md` (lines 89-107) - Why: Contém a spec exata da frameless window com `titleBarStyle: 'hiddenInset'`, `trafficLightPosition`, dimensões e `webPreferences`
- `.agents/prds/PRD-05-ui-interaction-screens.md` (lines 46-93) - Why: Contém a spec do Master Layout com as 4 zonas, medidas (Activity Bar ~48px, Sidebar ~260px, Chat ~380px), e comportamento de cada zona
- `.agents/prds/PRD-05-ui-interaction-screens.md` (lines 33-42) - Why: Detalhes do Application Shell 9 (Activity Bar, File Explorer Sidebar, Panel Toggle, Scroll areas, Dark mode)
- `.agents/prds/PRD-00-master.md` (lines 326-337) - Why: Detalhes sobre Application Shell 9 e suas dependências
- `.agents/guides/dia1-setup-electron-vite-react-tailwind-shadcn.md` - Why: Guia que o usuário seguiu para o setup base (paths, aliases, configurações)
- `electron.vite.config.ts` - Why: Config de build que será lida para verificar aliases e plugins
- `src/main/index.ts` - Why: Entry point do main process onde será configurado o BrowserWindow

### New Files to Create

- `src/renderer/src/components/app/AppLayout.tsx` - Layout master que combina Activity Bar + Sidebar + Viewer + Chat
- `src/renderer/src/components/app/ActivityBar.tsx` - Barra de ícones de módulo (Explorer, Search, Graph, Settings)
- `src/renderer/src/components/app/AppSidebar.tsx` - File explorer sidebar (wrapper do componente shadcn sidebar)
- `src/renderer/src/components/app/ViewerPanel.tsx` - Painel central do viewer (placeholder inicial)
- `src/renderer/src/components/app/ChatPanel.tsx` - Painel do chat à direita (placeholder inicial)
- `src/renderer/src/styles/drag-region.css` - Estilos para drag region do frameless window (ou inline no globals)

### Relevant Documentation — YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- **electron-vite docs** — Scaffolding e project structure
  - Section: Development > Project Structure > Conventions
  - Why: Entender os paths e entry points do electron-vite
  - **Key takeaways:** Main entry: `src/main/index.ts`, Preload: `src/preload/index.ts`, Renderer: `src/renderer/index.html`. Para dev, usar `process.env['ELECTRON_RENDERER_URL']` para HMR. Para prod, `path.join(__dirname, '../renderer/index.html')`.

- **Electron BrowserWindow** — Frameless window config
  - Section: `titleBarStyle` options
  - Why: Configurar window nativa no macOS
  - **Key takeaways:** `titleBarStyle: 'hiddenInset'` remove a title bar mas mantém os traffic lights inset. `trafficLightPosition: { x: 12, y: 12 }` posiciona os botões. `contextIsolation: true` é obrigatório. `sandbox: false` necessário para native modules (better-sqlite3 futuro).

- **shadcnblocks Application Shell 9**
  - Section: IDE-Style File Explorer Shell
  - Why: Base do layout master
  - **Key takeaways:** Dependências: button, collapsible, drawer, scroll-area, sidebar (shadcn/ui) + lucide-react. O shell implementa: Activity Bar (ícones), File Explorer sidebar (tree), panel toggle (header). Dark-friendly. O bloco é instalável via `pnpm dlx shadcn@latest add @shadcnblocks/application-shell9`.

- **shadcn/ui Sidebar** — Componente base
  - Section: sidebar component docs
  - Why: O Application Shell 9 usa o sidebar como base
  - **Key takeaways:** O `SidebarProvider` envolve o layout. `Sidebar` aceita `collapsible="icon"` ou `"offcanvas"`. O `SidebarTrigger` toggle a sidebar. Usar `useSidebar()` hook para estado.

### Patterns to Follow

**Naming Conventions:**
- Componentes de app em `src/renderer/src/components/app/` (PascalCase)
- Componentes shadcn/ui em `src/renderer/src/components/ui/` (kebab-case files)
- Imports via alias `@/` que resolve para `src/renderer/src/`

**Error Handling:**
- Main process: try/catch com logging no console
- Renderer: Error boundaries para componentes React

**Other Relevant Patterns:**
- Dark mode: classe `.dark` no `<html>` (shadcn/ui convention)
- CSS custom properties para theming (tokens OKLCH do Capybara 0)
- Layout usa flexbox, não CSS Grid
- `ScrollArea` do shadcn/ui para todos os painéis scrolláveis

---

## IMPLEMENTATION PLAN

### Phase 1: Frameless Window (Main Process)
Configurar `BrowserWindow` com frameless window, traffic lights, e dark mode no `<html>`.

### Phase 2: Instalar dependências shadcn/ui + Application Shell 9
Instalar todos os componentes shadcn/ui necessários e o bloco Application Shell 9.

### Phase 3: Layout Master (Renderer)
Adaptar o Application Shell 9 para o layout de 4 zonas do Capybara Agent.

### Phase 4: Validação visual
Verificar que o layout renderiza corretamente com as 4 zonas, drag region funciona, e dark mode está ativo.

---

## STEP-BY-STEP TASKS

Execute every task in order, top to bottom. Each task is atomic and independently testable.

### UPDATE `src/main/index.ts` — Frameless BrowserWindow

- **IMPLEMENT**: Configurar `BrowserWindow` com frameless window para macOS:
  ```typescript
  const mainWindow = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    show: false, // show when ready-to-show
    backgroundColor: '#09090b', // zinc-950 para evitar flash branco
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  ```
- **PATTERN**: PRD-01 lines 92-107 (spec exata)
- **IMPORTS**: `import { join } from 'path'`, `import { BrowserWindow } from 'electron'`
- **GOTCHA**: Verificar que o template já faz `createWindow()` e `app.whenReady()`. Apenas modificar os parâmetros do `new BrowserWindow()`. Manter a lógica de HMR (`ELECTRON_RENDERER_URL`) que o template já traz. O `show: false` + `ready-to-show` evita flash de conteúdo branco.
- **VALIDATE**: `pnpm dev` — janela abre sem title bar, com traffic lights (fechar/minimizar/maximizar) no canto superior esquerdo, fundo escuro.

### INSTALL dependências shadcn/ui para o Application Shell 9

- **IMPLEMENT**: Instalar os componentes necessários via CLI:
  ```bash
  pnpm dlx shadcn@latest add button collapsible drawer scroll-area sidebar tooltip
  ```
- **GOTCHA**: O CLI vai criar os arquivos em `src/renderer/src/components/ui/`. Se perguntar algo sobre overwrite, aceite. O `tooltip` é necessário para os ícones da Activity Bar.
- **VALIDATE**: Verificar que os arquivos foram criados em `src/renderer/src/components/ui/`: `button.tsx`, `collapsible.tsx`, `drawer.tsx`, `scroll-area.tsx`, `sidebar.tsx`, `tooltip.tsx`. Verificar que `src/renderer/src/lib/utils.ts` foi criado com a função `cn()`.

### INSTALL Application Shell 9 do shadcnblocks

- **IMPLEMENT**: Instalar o bloco:
  ```bash
  pnpm dlx shadcn@latest add @shadcnblocks/application-shell9
  ```
- **GOTCHA**: Isso vai criar um componente em `src/renderer/src/components/` (possivelmente em `blocks/` ou `ui/`). Anotar o path exato. Se falhar por falta de registry, verificar que `components.json` tem a seção `registries` configurada conforme o guia.
- **VALIDATE**: Verificar que o arquivo do Application Shell 9 foi criado. Ler o conteúdo para entender a estrutura e imports.

### CREATE `src/renderer/src/components/app/ActivityBar.tsx`

- **IMPLEMENT**: Barra vertical de ícones na extrema esquerda (~48px), inspirada na Activity Bar do Application Shell 9, mas customizada para os módulos do Capybara:
  - Explorer (Files) — ícone padrão, ativo por default
  - Search — ícone de busca
  - Graph — ícone de rede/grafo
  - Settings — ícone de engrenagem, posicionado no bottom
  
  Cada ícone deve ter:
  - `Tooltip` com nome do módulo
  - Estado ativo (highlight visual via `data-active` ou classe condicional)
  - Callback `onModuleChange(module: string)`
  
  A Activity Bar deve ter:
  - `className`: fundo mais escuro que a sidebar (`bg-sidebar` ou variante)
  - Largura fixa de 48px
  - Flex column, items centralizados, gap entre ícones
  - Ícone de Settings no `mt-auto` (bottom)
  - Borda direita sutil

- **PATTERN**: PRD-05 lines 58-71 (Activity Bar spec), Application Shell 9 (activity bar pattern)
- **IMPORTS**: `import { Files, Search, Network, Settings } from 'lucide-react'`, `import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'`, `import { Button } from '@/components/ui/button'`
- **GOTCHA**: A Activity Bar é **sempre visível**, nunca colapsa. Não confundir com a sidebar.
- **VALIDATE**: Componente renderiza sem erros TypeScript. `pnpm build` passa sem type errors.

### CREATE `src/renderer/src/components/app/AppSidebar.tsx`

- **IMPLEMENT**: Wrapper da sidebar do shadcn/ui adaptado para o Capybara. Na fundação, exibir:
  - Header com nome do workspace (placeholder: "Investigation Desk")
  - Seções placeholder com labels: "Sources", "Investigations", "Dossier"
  - Cada seção como `Collapsible` com chevron
  - Footer com link "Open Full Graph"
  
  Usar `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent` do shadcn sidebar.
  
  Largura: usar o default do shadcn sidebar (que já é ~260px).

- **PATTERN**: PRD-05 lines 96-191 (Sidebar spec), shadcn sidebar component patterns
- **IMPORTS**: `import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar'`
- **GOTCHA**: O `Sidebar` do shadcn precisa estar dentro de um `SidebarProvider`. Esse provider ficará no `AppLayout.tsx`. A sidebar deve ser colapsável via `Cmd+B`.
- **VALIDATE**: Componente renderiza sem erros. Sidebar mostra seções placeholder.

### CREATE `src/renderer/src/components/app/ViewerPanel.tsx`

- **IMPLEMENT**: Painel central que ocupa o espaço restante (flex-1). Conteúdo placeholder:
  - Header com breadcrumb simples ("Capybara Agent > Welcome")
  - Área de conteúdo com mensagem de boas-vindas
  - O header deve ter `-webkit-app-region: drag` para a drag region (apenas no topo)
  
  A drag region permite arrastar a janela pelo header do viewer.

- **PATTERN**: PRD-05 lines 245-270 (Viewer spec)
- **IMPORTS**: `import { ScrollArea } from '@/components/ui/scroll-area'`
- **GOTCHA**: A drag region precisa ter uma altura mínima (~40px) e não deve cobrir elementos clicáveis. Usar `-webkit-app-region: no-drag` em botões dentro da drag region.
- **VALIDATE**: Arrastar a janela pelo header do viewer funciona. Conteúdo placeholder visível.

### CREATE `src/renderer/src/components/app/ChatPanel.tsx`

- **IMPLEMENT**: Painel fixo à direita com largura ~380px. Conteúdo placeholder:
  - Header: "Chat" com indicador de modo (Q)
  - Área de mensagens (vazia, com placeholder text)
  - Input bar no bottom (textarea simples, não funcional)
  
  O painel deve:
  - Ter borda esquerda sutil
  - Scroll area para mensagens
  - Input fixo no bottom

- **PATTERN**: PRD-05 lines 87-92 (Chat spec), PRD-04 (chat UI patterns)
- **IMPORTS**: `import { ScrollArea } from '@/components/ui/scroll-area'`
- **GOTCHA**: O chat é **sempre visível**, nunca totalmente oculto. Estado mínimo: input bar + mode indicator.
- **VALIDATE**: Chat panel renderiza à direita com input placeholder.

### CREATE `src/renderer/src/components/app/AppLayout.tsx`

- **IMPLEMENT**: Componente raiz de layout que compõe as 4 zonas:
  ```
  ┌──────────────────────────────────────────────────────────────┐
  │ ActivityBar │ Sidebar │ ViewerPanel (flex-1) │ ChatPanel     │
  │   48px      │ ~260px  │ grows/shrinks        │ ~380px        │
  └──────────────────────────────────────────────────────────────┘
  ```
  
  Estrutura:
  ```tsx
  <TooltipProvider>
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <ActivityBar />
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <ViewerPanel />
        </main>
        <ChatPanel />
      </div>
    </SidebarProvider>
  </TooltipProvider>
  ```

- **PATTERN**: PRD-05 lines 46-57 (layout spec)
- **IMPORTS**: Todos os componentes de app + `SidebarProvider` + `TooltipProvider`
- **GOTCHA**: `min-w-0` no main é essencial para que o flex-1 funcione com conteúdo overflow. O `h-screen` + `overflow-hidden` previne scroll no body.
- **VALIDATE**: Layout renderiza com as 4 zonas visíveis. Sidebar colapsa/expande.

### UPDATE `src/renderer/src/App.tsx` — Montar o layout

- **IMPLEMENT**: Substituir o conteúdo do App.tsx para usar o AppLayout:
  ```tsx
  import { AppLayout } from '@/components/app/AppLayout'

  function App(): JSX.Element {
    return <AppLayout />
  }

  export default App
  ```

- **GOTCHA**: Remover qualquer conteúdo de teste do Tailwind que existia antes.
- **VALIDATE**: `pnpm dev` — app abre com layout completo (4 zonas).

### UPDATE `src/renderer/index.html` — Dark mode default

- **IMPLEMENT**: Adicionar classe `dark` ao elemento `<html>` para dark mode por padrão:
  ```html
  <!doctype html>
  <html lang="en" class="dark">
  ```

- **GOTCHA**: O shadcn/ui usa a classe `dark` no `<html>` para ativar dark mode. O tema Capybara 0 já define variáveis para `.dark`.
- **VALIDATE**: App abre em dark mode. Cores do tema Capybara aplicadas.

### UPDATE CSS global — Drag region + body reset

- **IMPLEMENT**: Adicionar ao `src/renderer/src/assets/main.css`:
  ```css
  body {
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  
  .drag-region {
    -webkit-app-region: drag;
  }
  
  .drag-region button,
  .drag-region a,
  .drag-region input,
  .drag-region [role="button"] {
    -webkit-app-region: no-drag;
  }
  ```

- **GOTCHA**: A drag region deve ser aplicada via classe `.drag-region` no header do viewer. Os traffic lights do macOS já têm no-drag implícito. Elementos clicáveis dentro da drag region precisam de `no-drag`.
- **VALIDATE**: Arrastar a janela pelo header funciona. Botões dentro da drag region continuam clicáveis.

---

## TESTING STRATEGY

### Unit Tests
Nenhum teste unitário nesta fase (foundation visual). Testes virão com lógica de negócio.

### Integration Tests
- Verificar que todos os componentes renderizam sem crash
- Verificar que o layout respeita as proporções (Activity Bar 48px, Sidebar ~260px, Chat ~380px)

### Edge Cases
- Janela redimensionada para tamanho mínimo (1024x600) — layout não deve quebrar
- Sidebar colapsada — viewer e chat devem ocupar o espaço restante
- macOS traffic lights não devem sobrepor conteúdo da Activity Bar

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
pnpm build
```
> Build deve completar sem erros TypeScript.

### Level 2: Visual
```bash
pnpm dev
```
> App abre com:
> - Frameless window (sem title bar)
> - Traffic lights no canto superior esquerdo
> - Dark mode (fundo escuro)
> - Layout 4 zonas visíveis
> - Drag region funcional no header

### Level 3: Resize
> Redimensionar janela para 1024x600 (mínimo). Layout não deve quebrar.

### Level 4: Sidebar Toggle
> Sidebar colapsa e expande. Viewer ocupa espaço liberado.

### Level 5: Teste manual — Application Shell 9 instalado e rodando

**Quem executa:** Você (validação manual após o guia).

Siga o **Passo 7** do guia (`.agents/guides/dia1-setup-electron-vite-react-tailwind-shadcn.md`): configure o registry com `SHADCNBLOCKS_API_KEY` em `.env.local`, instale `@shadcnblocks/application-shell9`, integre no App e rode `pnpm dev`. Use o **checklist do Passo 7.4** para confirmar:

- [ ] Comando `pnpm dlx shadcn@latest add @shadcnblocks/application-shell9` concluiu sem "Authentication required"
- [ ] Existem arquivos novos gerados pelo CLI (ex.: em `src/renderer/src/components/`)
- [ ] `pnpm dev` abre o app sem erros no console
- [ ] Activity Bar visível (barra vertical esquerda com ícones)
- [ ] Sidebar visível ao lado da Activity Bar
- [ ] Área de conteúdo principal visível
- [ ] Dark mode aplicado (se `<html class="dark">`)
- [ ] Sem erros de import/componente no DevTools

Se todos os itens estiverem OK, o Application Shell 9 está instalado e rodando corretamente. O plano de implementação (frameless + layout adaptado) parte dessa base.

---

## ACCEPTANCE CRITERIA

- [ ] App Electron abre com frameless window (sem title bar nativa)
- [ ] Traffic lights (fechar/minimizar/maximizar) visíveis no canto superior esquerdo
- [ ] Drag region funciona: arrastar janela pelo header do viewer
- [ ] Dark mode ativo por padrão (tema Capybara 0)
- [ ] Fontes IBM Plex renderizando
- [ ] **Application Shell 9 instalado e rodando** — você validou com o checklist do guia Passo 7.4 (Activity Bar + Sidebar + área de conteúdo visíveis, sem erros)
- [ ] Layout com 4 zonas visíveis: Activity Bar | Sidebar | Viewer | Chat
- [ ] Activity Bar mostra 4 ícones (Explorer, Search, Graph, Settings)
- [ ] Sidebar mostra seções placeholder (Sources, Investigations, Dossier)
- [ ] Sidebar colapsa/expande
- [ ] Viewer mostra conteúdo placeholder com breadcrumb
- [ ] Chat mostra painel placeholder com input
- [ ] Window redimensiona sem quebrar layout (min 1024x600)
- [ ] `pnpm build` completa sem erros

---

## VISUAL / E2E CHECKS

**Tipo de teste:** [x] Electron (CDP)  [ ] Web (localhost/URL)

**Passos:**
1. Rodar `pnpm dev` para iniciar o app
2. Verificar visualmente:
   - Frameless window com traffic lights
   - 4 zonas do layout visíveis
   - Dark mode ativo
   - Fontes IBM Plex aplicadas
3. Clicar no ícone de toggle da sidebar — sidebar colapsa
4. Arrastar a janela pelo header — window se move
5. Redimensionar para 1024x600 — layout se adapta
6. Screenshot final para registro

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

### Decisões de design

1. **electron-vite (alex8088) vs vite-plugin-electron:** Mantido electron-vite conforme PRD. Apesar de issues com Tailwind v4, a solução funciona com `moduleResolution: "Bundler"` no `tsconfig.node.json` e `@tailwindcss/vite` no plugin renderer.

2. **Tailwind v4 vs v3:** Usando v4 com `@import "tailwindcss"` e `@tailwindcss/vite` plugin. O shadcn/ui moderno suporta v4. Se houver problemas irrecuperáveis, fallback para v3 com PostCSS é possível.

3. **Dark mode default:** O app inicia em dark mode (classe `dark` no HTML). Conforme PRD-01 §3.9, o toggle de tema é via IPC e persiste em config.json — mas isso será implementado no futuro.

4. **Drag region:** Aplicada via CSS class `.drag-region` no header do viewer. Os traffic lights do macOS com `hiddenInset` ficam no espaço da sidebar/activity bar. O drag region deve cobrir toda a faixa superior do viewer para maximizar a área clicável.

5. **Application Shell 9 como base:** O bloco será instalado e usado como referência/base. Os componentes de app (`AppLayout`, `ActivityBar`, etc.) podem adaptar o código do shell ou reimplementar parcialmente, desde que sigam o mesmo padrão visual (VS Code-like).

6. **Placeholder approach:** Todos os painéis iniciam com conteúdo placeholder (texto estático). A lógica real (file tree, markdown rendering, chat) será implementada nos próximos dias conforme os PRDs de domínio.

### Riscos

- **@tailwindcss/vite + electron-vite:** Pode haver issues em dev mode com custom utilities. Se isso acontecer, fallback para PostCSS (`@tailwindcss/postcss`).
- **shadcnblocks registry:** Se o `@shadcnblocks/application-shell9` falhar para instalar, copiar o código diretamente do site shadcnblocks.com.
- **Fontes IBM Plex via npm:** Os paths dos woff2 dentro de `node_modules` precisam ser resolvidos pelo Vite. Se não funcionar, copiar os woff2 para `src/renderer/src/assets/fonts/` e referenciar diretamente.
