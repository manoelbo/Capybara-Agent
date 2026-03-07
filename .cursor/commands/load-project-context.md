---
description: Carregar contexto completo do projeto (estrutura, documentação, estado atual)
---

# Load Project Context

## Objetivo

Construir entendimento abrangente do codebase e da documentação do **Capybara Agent** analisando estrutura, PRDs, regras do Cursor, skills e estado atual do repositório.

## Processo

### 1. Analisar estrutura do projeto

Listar arquivos rastreados pelo git:
!`git ls-files`

Mostrar estrutura de diretórios (até 3 níveis, excluindo pastas pesadas):
No macOS/Linux: `tree -L 3 -I 'node_modules|__pycache__|.git|dist|build'`  
Se `tree` não existir: `find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' | head -80`

### 2. Ler documentação central

- **Visão do projeto:** `.agents/capybara_agent_project.md` (overview, features, design system, UI spec)
- **PRD Master:** `.agents/prds/PRD-00-master.md` (missão, escopo MVP, stack, arquitetura, fases)
- **PRDs de domínio:** `.agents/prds/PRD-01-workspace-infra-ai.md` até `PRD-05-ui-interaction-screens.md` (ler índices/sumários; aprofundar conforme necessidade)
- **Regras do Cursor:** `.cursor/rules/*.mdc` (ex.: `capybara-agent-inspiration.mdc`)
- **Plans:** `.agents/plans/README.md` e listar arquivos em `.agents/plans/`

### 3. Identificar arquivos-chave

Com base na estrutura, identificar e ler (quando existirem):

- **Entry points:** `main.js`, `main.ts`, `index.ts`, `src/main/`, `src/preload/`
- **Configuração:** `package.json`, `tsconfig.json`, `vite.config.*`, `electron.vite.config.*`
- **Schema/ORM:** `drizzle.config.*`, `src/**/schema*.ts`, pastas `db/` ou `database/`
- **Skills e comandos:** `.cursor/skills/**/SKILL.md`, `.cursor/commands/*.md`

### 4. Entender estado atual

Ver atividade recente:
!`git log -10 --oneline`

Ver branch e status:
!`git status`

## Relatório de saída

Fornecer um **resumo conciso** com os títulos abaixo. Usar bullet points e cabeçalhos claros para facilitar leitura.

### Visão do projeto
- Propósito e tipo de aplicação (ex.: app desktop Electron para investigação jornalística)
- Tecnologias e frameworks principais
- Versão/estado atual (MVP v0.1, fase de implementação, etc.)

### Arquitetura
- Estrutura geral e organização (pastas `.agents/`, `.cursor/`, código em `src/` se existir)
- Padrões arquiteturais (Main/Renderer, IPC, domínios do PRD)
- Diretórios importantes e suas funções

### Stack tecnológica
- Linguagens e versões
- Frameworks e bibliotecas principais (Electron, React, shadcn, Vercel AI SDK, etc.)
- Ferramentas de build e package manager
- Testes (se configurados)

### Princípios e convenções
- Estilo de código e convenções observadas
- Padrão de documentação (PRDs, plans, skills)
- Abordagem de planejamento (plan-feature, inspiration-research)

### Estado atual
- Branch ativa
- Foco recente ou mudanças em desenvolvimento
- Observações ou pontos de atenção imediatos

**Manter o resumo escaneável: bullet points e cabeçalhos claros.**
