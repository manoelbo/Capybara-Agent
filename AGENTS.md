# AGENTS.md — learned preferences and workspace facts

## Learned User Preferences

- Sempre responder em Português Brasileiro.
- Ao executar `continual-learning`, usar processamento incremental via `.cursor/hooks/state/continual-learning-index.json`, atualizando entradas existentes no `AGENTS.md` (não apenas append) e removendo do índice transcripts deletados.
- Preferir feedback de execução no estilo agente (streaming/progresso no terminal) e deixar a conclusão/instrução final na resposta de chat.
- Em tarefas de UI, validar navegando no app (Electron) e, quando for trabalho de componente, validar também no Storybook antes de concluir.
- Em UI, preferir workflow de exploração com múltiplas variações no Storybook e só aplicar no componente real após escolha explícita.
- Em refactors de UI, preferir quebrar componentes grandes em subcomponentes menores e expor cada parte em stories isoladas.
- Para doc-process (process-all, process-queue, rerun, watch), usar por padrão o modo de feedback "visual" (caixas no terminal), como em init/dig/create-lead.
- Do not write "proximos passos" or next-step guidance into Markdown artifact files; return that guidance only in terminal/conversation feedback.
- Do not implement token budgeting for `dig` (or similar incremental preview processing); process available previews until they run out.

## Learned Workspace Facts

- Agent Lab investigation flow is split into stages: `init` -> `deep-dive` (legacy alias: `dig`) -> `create-lead` (planning only) -> `inquiry` (execution).
- `create-lead` must produce only lead context + Inquiry Plan; allegations/findings are generated later by `inquiry`.
- Inquiry outputs are stored globally under `lab/agent/filesystem/investigation/allegations/` and `lab/agent/filesystem/investigation/findings/`, linked back to the lead.
- `document-processing` has two operation modes: `standard` (default pipeline) and `deep` (replica generation with maximum fidelity, typically one document at a time).
- In `standard`, `preview.md`, `index.md`, and `metadata.md` are artifact-level outputs; `replica.md` remains a `deep` output and should be preserved.
- O comando `/test-ui-electron` e o fluxo padrão de teste visual no app Electron, com snapshots/screenshots e dependência de CDP ativo.
- O projeto possui um laboratório de Storybook em `lab/storybook`, com stories para `ui`, `blocks` e `screens`, usado para experimentar componentes antes da integração final.
- O `AppSidebar` foi modularizado em subcomponentes em `src/renderer/src/components/app/sidebar/` (header, section, menu item, collapsible menu item e footer).
- O comando `/storybook-variants` repete o fluxo: especificar componente(s) e objetivo → agente cria variações no Storybook (pequenas e grandes) → usuário escolhe qual → agente implementa no componente real usando a story como fonte de verdade (respeitando edições feitas no Storybook).
- O CLI do Agent Lab possui entrada conversacional direta: `pnpm reverso agent --text/--prompt` e `pnpm reverso --text/--prompt`, com roteamento por sessão (`deep-dive-session`) e estado de leads.

## Cursor Cloud specific instructions

### Services overview

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Electron app (dev) | `pnpm dev` | 5173 (renderer) | Requires display; dbus errors are normal in headless envs |
| Storybook | `pnpm lab:storybook:dev` | 6006 | Best surface for UI testing in Cloud |
| Agent Lab CLI | `pnpm reverso <command>` | — | Requires `OPENROUTER_API_KEY` in `.env.local` |

### Lint / Typecheck / Test

- **Lint:** `pnpm lint` (ESLint v9 flat config). First uncached run is very slow (~20-30 min on constrained VMs). Subsequent runs use `.eslintcache` and are fast. For quick checks, run `npx eslint --no-cache <specific-files>`.
- **Typecheck:** `pnpm typecheck` (runs `typecheck:node` then `typecheck:web`). Pre-existing TS errors exist in `markdown-it` related files (missing `@types/markdown-it`).
- **Tests:** `pnpm test` runs document-processing tests via Node's built-in test runner with tsx.

### Gotchas

- The `lab/agent/filesystem/dossier/` directory may not exist on a fresh checkout. The Electron app logs errors when watching this path. Create it with `mkdir -p lab/agent/filesystem/dossier` if needed.
- No databases or Docker required. All data is stored as Markdown files on the local filesystem.
- The `postinstall` script runs `electron-builder install-app-deps` to rebuild native deps for Electron.
- Agent Lab CLI features require `OPENROUTER_API_KEY` env var (set in `.env.local` at project root). See `lab/agent/.env.example` for reference.
