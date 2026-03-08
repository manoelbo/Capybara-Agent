# Guia de Setup — Dia 1: Electron-Vite + React + TypeScript + Tailwind + shadcn/ui

> **Objetivo:** Montar a base do projeto Capybara Agent com electron-vite, React, TypeScript, Tailwind CSS, shadcn/ui, shadcnblocks e fontes IBM Plex.
>
> **Quem executa:** Você (manualmente no terminal).
>
> **Pré-requisitos:** Node.js ≥ 18, pnpm instalado (`npm install -g pnpm`).

---

## Passo 1: Criar o projeto com electron-vite

> **⚠️ IMPORTANTE:** O diretório `~/Developer/Capybara Agent` já contém arquivos do projeto (`.agents/`, `.cursor/`, `.gitignore`, etc.). O scaffold do electron-vite **não pode ser feito diretamente nele** — ao perguntar "Remove existing files and continue?", responder `y` **apagaria tudo**. A solução é criar numa pasta temporária e mover os arquivos.

### 1.1: Criar o scaffold numa pasta temporária

```bash
cd ~/Developer
pnpm create @quick-start/electron@latest capybara-agent-tmp
```

### Escolhas no prompt interativo:

| Pergunta | Resposta |
|---|---|
| **Project name:** | `capybara-agent` (ou aceite o default) |
| **Select a framework:** | `react` |
| **Add TypeScript?** | `Yes` |
| **Add Electron updater plugin?** | `Yes` |
| **Enable Electron download mirror proxy?** | `No` |

### 1.2: Mover os arquivos do scaffold para o projeto

```bash
cp -rn ~/Developer/capybara-agent-tmp/* ~/Developer/Capybara\ Agent/
cp -rn ~/Developer/capybara-agent-tmp/.* ~/Developer/Capybara\ Agent/ 2>/dev/null

# Verificar que os arquivos-chave chegaram
ls ~/Developer/Capybara\ Agent/package.json
ls ~/Developer/Capybara\ Agent/electron.vite.config.ts
ls ~/Developer/Capybara\ Agent/src/main/index.ts

# Remover a pasta temporária
rm -rf ~/Developer/capybara-agent-tmp
```

> **Nota:** O `cp -rn` usa a flag `-n` (no-clobber) para **não sobrescrever** arquivos que já existem no destino (como `.gitignore`).

### 1.3: Verificar que nada foi sobrescrito

```bash
cd ~/Developer/Capybara\ Agent
ls -la .agents/
ls -la .cursor/
```

---

## Passo 2: Instalar dependências e testar

```bash
pnpm install
pnpm dev
```

> Deve abrir uma janela Electron com a tela default do template. Feche o app (`Cmd+Q`) e continue.

---

## Passo 3: Instalar Tailwind CSS v4

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

### 3.1: Ajustar `tsconfig.node.json`

Abra `tsconfig.node.json` e **altere** `moduleResolution` para `"Bundler"`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["electron-vite/node"]
  },
  "include": ["electron.vite.config.*", "src/main/**/*", "src/preload/**/*"]
}
```

### 3.2: Adicionar Tailwind ao `electron.vite.config.ts`

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

### 3.3: Configurar o CSS global

Substitua o conteúdo de `src/renderer/src/assets/main.css` por:

```css
@import "tailwindcss";
```

### 3.4: Verificar o import no `main.tsx`

Certifique-se de que `src/renderer/src/main.tsx` importa o CSS:

```typescript
import './assets/main.css'
```

### 3.5: Testar Tailwind

Substitua o conteúdo de `src/renderer/src/App.tsx`:

```tsx
function App(): JSX.Element {
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <h1 className="text-4xl font-bold text-white">Capybara Agent</h1>
    </div>
  )
}

export default App
```

```bash
pnpm dev
```

> Deve aparecer "Capybara Agent" em branco centralizado num fundo escuro.

---

## Passo 4: Configurar path aliases

### 4.1: Ajustar `tsconfig.web.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/renderer/src/*"]
    }
  }
}
```

### 4.2: Ajustar `tsconfig.json` (raiz)

> **⚠️ CRÍTICO:** O CLI do shadcn lê o `tsconfig.json` da raiz para resolver os path aliases. Se `paths` só existir no `tsconfig.web.json`, o CLI não encontra o alias `@/*` e cria uma pasta literal `@/` na raiz. Precisamos adicionar `paths` também ao `tsconfig.json` raiz.

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }, { "path": "./tsconfig.web.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/renderer/src/*"]
    }
  }
}
```

### 4.3: Alias no `electron.vite.config.ts`

Já feito no Passo 3.2 — o alias `'@'` já aponta para `resolve('src/renderer/src')`.

---

## Passo 5: Instalar shadcn/ui (instalação manual)

> **⚠️ Por que manual?** O CLI `shadcn init` não reconhece `electron.vite.config.ts` como framework suportado e falha com "could not detect a supported framework". A solução oficial é a **instalação manual** conforme https://v4.shadcn.com/docs/installation/manual.

### 5.1: Instalar dependências do shadcn/ui

```bash
pnpm add shadcn class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

### 5.2: Criar o helper `cn()`

Crie o arquivo `src/renderer/src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5.3: Configurar o CSS global com tokens do shadcn/ui

Substitua **todo o conteúdo** de `src/renderer/src/assets/main.css` por:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

/* ===== TEMA CAPYBARA 0 (light) ===== */
:root {
  --radius: 0rem;
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0.6654 0.1594 292.3994);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.7805 0.1302 204.3029);
  --secondary-foreground: oklch(1.0000 0 0);
  --muted: oklch(0.9551 0 0);
  --muted-foreground: oklch(0.3211 0 0);
  --accent: oklch(0.8744 0.1610 95.5815);
  --accent-foreground: oklch(0 0 0);
  --destructive: oklch(0.7621 0.1182 33.3830);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0 0 0);
  --input: oklch(0.5555 0 0);
  --ring: oklch(0.9865 0.0066 286.2780);
  --chart-1: oklch(0.6654 0.1594 292.3994);
  --chart-2: oklch(0.7805 0.1302 204.3029);
  --chart-3: oklch(0.8744 0.1610 95.5815);
  --chart-4: oklch(0.7412 0.1398 1.5282);
  --chart-5: oklch(0.7958 0.1668 158.8194);
  --sidebar: oklch(1.0000 0 0);
  --sidebar-foreground: oklch(0 0 0);
  --sidebar-primary: oklch(0.6654 0.1594 292.3994);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.8744 0.1610 95.5815);
  --sidebar-accent-foreground: oklch(0 0 0);
  --sidebar-border: oklch(0 0 0);
  --sidebar-ring: oklch(0.9865 0.0066 286.2780);
}

/* ===== TEMA CAPYBARA 0 (dark) ===== */
.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(1.0000 0 0);
  --card: oklch(0.2639 0.0306 273.3087);
  --card-foreground: oklch(1.0000 0 0);
  --popover: oklch(0.2639 0.0306 273.3087);
  --popover-foreground: oklch(1.0000 0 0);
  --primary: oklch(0.8649 0.0662 289.7121);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.8072 0.1090 201.1642);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.3211 0 0);
  --muted-foreground: oklch(0.8452 0 0);
  --accent: oklch(0.9594 0.1242 105.5589);
  --accent-foreground: oklch(0 0 0);
  --destructive: oklch(0.8703 0.0632 32.9827);
  --destructive-foreground: oklch(0 0 0);
  --border: oklch(0.4459 0 0);
  --input: oklch(1.0000 0 0);
  --ring: oklch(0.8649 0.0662 289.7121);
  --chart-1: oklch(0.8649 0.0662 289.7121);
  --chart-2: oklch(0.8072 0.1090 201.1642);
  --chart-3: oklch(0.9594 0.1242 105.5589);
  --chart-4: oklch(0.8484 0.0799 356.8570);
  --chart-5: oklch(0.8522 0.1189 162.9113);
  --sidebar: oklch(0 0 0);
  --sidebar-foreground: oklch(1.0000 0 0);
  --sidebar-primary: oklch(0.8649 0.0662 289.7121);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.9594 0.1242 105.5589);
  --sidebar-accent-foreground: oklch(0 0 0);
  --sidebar-border: oklch(1.0000 0 0);
  --sidebar-ring: oklch(0.8649 0.0662 289.7121);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: normal;
  }
}
```

> **O que mudou vs. o guia anterior:**
> - Não depende mais do `shadcn init` — tudo é manual.
> - O tema Capybara 0 já está embutido diretamente (extraído do tweakcn registry).
> - O `@theme inline` mapeia as variáveis CSS para classes do Tailwind v4.
> - Não precisa mais rodar `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/...`.

### 5.4: Criar `components.json` manualmente

Crie o arquivo `components.json` na **raiz** do projeto.

**Para blocos gratuitos** (ex.: `button`), use a URL simples no registry:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/renderer/src/assets/main.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide",
  "registries": {
    "@shadcnblocks": "https://shadcnblocks.com/r/{name}"
  }
}
```

**Para blocos Pro** (ex.: Application Shell 9), você precisará trocar o registry para a forma com autenticação no **Passo 7**.

### 5.5: Testar instalação de um componente

```bash
pnpm dlx shadcn@latest add button
```

> Deve criar `src/renderer/src/components/ui/button.tsx`. Se perguntar sobre overwrite ou paths, aceite os defaults.

### 5.6: Testar o componente + tema

Substitua `src/renderer/src/App.tsx`:

```tsx
import { Button } from '@/components/ui/button'

function App(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
      <h1 className="text-4xl font-bold text-foreground">Capybara Agent</h1>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </div>
  )
}

export default App
```

Adicione a classe `dark` no `src/renderer/index.html` para testar dark mode:

```html
<!doctype html>
<html lang="en" class="dark">
```

```bash
pnpm dev
```

> Os botões devem renderizar com as cores do tema Capybara 0 (roxo primary, ciano secondary, amarelo accent) em dark mode. Se aparecerem com cores corretas e cantos retos (radius 0), o tema está funcionando.

---

## Passo 6: Instalar fontes IBM Plex

```bash
pnpm add @ibm/plex-sans-thai-looped @ibm/plex-mono @ibm/plex-sans-jp
```

### 6.1: Adicionar @font-face no CSS global

Adicione **no topo** do `src/renderer/src/assets/main.css` (antes do `@import "tailwindcss"`):

```css
/* IBM Plex Sans Thai Looped — corpo principal */
@font-face {
  font-family: 'IBM Plex Sans Thai Looped';
  font-style: normal;
  font-weight: 300;
  src: url('@ibm/plex-sans-thai-looped/fonts/split/woff2/IBMPlexSansThaiLooped-Light.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans Thai Looped';
  font-style: normal;
  font-weight: 400;
  src: url('@ibm/plex-sans-thai-looped/fonts/split/woff2/IBMPlexSansThaiLooped-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans Thai Looped';
  font-style: normal;
  font-weight: 500;
  src: url('@ibm/plex-sans-thai-looped/fonts/split/woff2/IBMPlexSansThaiLooped-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans Thai Looped';
  font-style: normal;
  font-weight: 600;
  src: url('@ibm/plex-sans-thai-looped/fonts/split/woff2/IBMPlexSansThaiLooped-SemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans Thai Looped';
  font-style: normal;
  font-weight: 700;
  src: url('@ibm/plex-sans-thai-looped/fonts/split/woff2/IBMPlexSansThaiLooped-Bold.woff2') format('woff2');
}

/* IBM Plex Mono — código */
@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  src: url('@ibm/plex-mono/fonts/split/woff2/IBMPlexMono-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 500;
  src: url('@ibm/plex-mono/fonts/split/woff2/IBMPlexMono-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 700;
  src: url('@ibm/plex-mono/fonts/split/woff2/IBMPlexMono-Bold.woff2') format('woff2');
}

/* IBM Plex Sans JP — fallback japonês */
@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 400;
  src: url('@ibm/plex-sans-jp/fonts/split/woff2/IBMPlexSansJP-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 500;
  src: url('@ibm/plex-sans-jp/fonts/split/woff2/IBMPlexSansJP-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 700;
  src: url('@ibm/plex-sans-jp/fonts/split/woff2/IBMPlexSansJP-Bold.woff2') format('woff2');
}
```

### 6.2: Configurar font-family no `@theme inline`

Dentro do bloco `@theme inline { ... }` que já existe no CSS, **adicione** estas linhas:

```css
  --font-sans: 'IBM Plex Sans Thai Looped', 'IBM Plex Sans JP', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  --font-serif: 'IBM Plex Sans JP', ui-sans-serif, system-ui, sans-serif;
```

### 6.3: Testar fontes

Atualize `App.tsx`:

```tsx
import { Button } from '@/components/ui/button'

function App(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
      <h1 className="text-4xl font-bold text-foreground">Capybara Agent</h1>
      <p className="text-muted-foreground">IBM Plex Sans Thai Looped</p>
      <code className="text-lg text-accent font-mono">IBM Plex Mono</code>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </div>
  )
}

export default App
```

```bash
pnpm dev
```

> Verifique no DevTools (Elements → Computed → font-family) que as fontes IBM Plex estão sendo aplicadas. O texto principal deve usar IBM Plex Sans Thai Looped e o `<code>` deve usar IBM Plex Mono.

---

## Passo 7: Instalar e testar Application Shell 9 (@shadcnblocks/application-shell9)

O **Application Shell 9** é um bloco **Pro** do shadcnblocks (IDE-style com Activity Bar + File Explorer Sidebar). Para instalá-lo é necessário configurar a autenticação com sua API Key.

### 7.1: Configurar o registry com API Key

A API Key deve estar em `.env.local` na raiz do projeto com o nome exato `SHADCNBLOCKS_API_KEY` (você já configurou). O valor deve começar com `sk_live_`.

Edite o `components.json` e **substitua** a seção `registries` pela forma com autenticação:

```json
  "registries": {
    "@shadcnblocks": {
      "url": "https://shadcnblocks.com/r/{name}",
      "headers": {
        "Authorization": "Bearer ${SHADCNBLOCKS_API_KEY}"
      }
    }
  }
```

> **Documentação:** [Shadcn CLI — shadcnblocks Docs](https://docs.shadcnblocks.com/blocks/shadcn-cli/). O CLI do shadcn expande a variável `${SHADCNBLOCKS_API_KEY}` a partir do ambiente. Se você usar `.env.local`, rode os comandos a partir da **raiz do projeto**; muitas ferramentas carregam `.env.local` automaticamente. Se der "Authentication required", exporte antes: `export $(grep -v '^#' .env.local | xargs)` (macOS/Linux).

### 7.2: Instalar o bloco

Na raiz do projeto:

```bash
pnpm dlx shadcn@latest add @shadcnblocks/application-shell9
```

Se aparecer **"Authentication required for pro blocks"**:
- Confirme que a chave em `.env.local` começa com `sk_live_`
- Confirme que o nome da variável é exatamente `SHADCNBLOCKS_API_KEY`
- Rode na mesma sessão: `export $(grep -v '^#' .env.local | xargs)` e depois o comando `pnpm dlx shadcn@latest add ...` de novo

O CLI criará um ou mais arquivos (por exemplo em `src/renderer/src/components/blocks/application-shell-9/` ou em `@/components/` — confira a saída do comando).

### 7.3: Integrar no App e rodar

Importe o componente principal que o CLI criou (o nome exato pode ser `ApplicationShell9` ou similar) no `App.tsx` e use-o como conteúdo principal. Exemplo (ajuste o caminho conforme a saída do CLI):

```tsx
import { ApplicationShell9 } from '@/components/blocks/application-shell-9' // ajuste o path se necessário

function App(): JSX.Element {
  return <ApplicationShell9 />
}

export default App
```

Se o bloco tiver sido instalado em outro path (ex.: `@/components/application-shell-9`), use esse path. Em seguida:

```bash
pnpm dev
```

### 7.4: Teste manual — checklist

Use esta lista para confirmar que o Application Shell 9 instalou e está rodando corretamente:

- [ ] O comando `pnpm dlx shadcn@latest add @shadcnblocks/application-shell9` terminou sem erro "Authentication required".
- [ ] Existem arquivos novos no projeto (ex.: em `src/renderer/src/components/` ou `blocks/`) gerados pelo CLI.
- [ ] `pnpm dev` abre o app Electron sem erros no console.
- [ ] Na janela do app aparece uma **Activity Bar** (barra vertical estreita à esquerda) com ícones.
- [ ] Ao lado da Activity Bar aparece uma **Sidebar** (painel com file tree ou área de conteúdo do shell).
- [ ] O restante da tela mostra a **área de conteúdo principal** do shell (ex.: área central ou painel).
- [ ] O layout está em **dark mode** se o `<html>` tiver a classe `dark`.
- [ ] Não há erros de import ou de componente quebrado no DevTools (Console).

Se todos os itens acima estiverem OK, o Application Shell 9 está instalado e funcionando. Você pode usar esse layout como base para o próximo passo (layout master adaptado ao Capybara no plano agêntico).

---

## Checklist final

- [ ] `pnpm dev` abre o app Electron sem erros
- [ ] Tailwind CSS v4 funciona (classes utilitárias aplicadas)
- [ ] shadcn/ui instalado manualmente (helper `cn()`, `components.json`, componente `button` funciona)
- [ ] shadcnblocks configurado como registry em `components.json`
- [ ] Tema Capybara 0 aplicado (cores OKLCH, cantos retos com `--radius: 0rem`)
- [ ] Dark mode funciona (classe `dark` no `<html>`)
- [ ] Fontes IBM Plex instaladas e renderizando corretamente
- [ ] Path alias `@/` resolvendo para `src/renderer/src/`
- [ ] **Passo 7:** Application Shell 9 instalado com API Key; app abre com Activity Bar + Sidebar + área de conteúdo; checklist do Passo 7.4 conferido

---

## O que você NÃO precisa refazer

Se você já completou os Passos 1-4 do guia anterior com sucesso:
- **Passo 1** (scaffold electron-vite) ✅ — já feito
- **Passo 2** (pnpm install + pnpm dev) ✅ — já feito
- **Passo 3** (Tailwind v4) ✅ — já feito
- **Passo 4** (path aliases) ✅ — já feito

**Comece a partir do Passo 5** (shadcn/ui manual) neste guia atualizado.

---

## Próximo passo

Após completar este guia (incluindo o Passo 7 e o teste manual do Application Shell 9), o agente continuará com:

1. **Frameless window** com drag regions e macOS traffic lights
2. **Layout master** adaptado ao Capybara a partir do Application Shell 9 (Activity Bar + Sidebar + Viewer + Chat)
