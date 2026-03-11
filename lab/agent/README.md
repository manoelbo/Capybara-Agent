# Agent Lab

Ambiente isolado (Node.js + TypeScript) para testar o nucleo do agente investigativo fora do Electron.

## Fluxo recomendado

1. **init** — Primeira coisa a fazer: le previews aleatorios em `lab/agent/filesystem/source/.artifacts`, gera entendimento inicial e cria `filesystem/agent.md`.
2. **agent-setup** — Ajuste as instrucoes do agente (ex.: foco em uma pessoa ou tema).
3. **dig** — Encontrar possiveis leads a partir dos previews (analise incremental, top 3 sugestoes, comparacao com leads existentes).
4. **create-lead** — Registrar um lead com Inquiry Plan (planejamento) em `filesystem/investigation/leads`.
5. **inquiry** — Executar a investigacao do lead para gerar allegations/findings estruturados e conclusao.

## Comandos via alias (raiz do projeto)

Use `pnpm reverso <comando>` para rodar o agente a partir da raiz:

```bash
pnpm reverso init --max-tokens 30000
pnpm reverso agent-setup --text "Adicione que o foco da investigacao e a pessoa X"
pnpm reverso dig
pnpm reverso create-lead --idea "cartel combinacao"
pnpm reverso inquiry --lead "cartel-combinacao"
```

## Comandos

### init

Le previews em `lab/agent/filesystem/source/.artifacts` (ate um orcamento global de tokens), gera entendimento da investigacao e escreve `lab/agent/filesystem/agent.md`.

```bash
pnpm reverso init
pnpm reverso init --max-tokens 30000
pnpm reverso init --model google/gemini-2.5-flash
```

Ou pelo lab:

```bash
pnpm --dir lab/agent run init -- --max-tokens 30000
```

### agent-setup

Atualiza o arquivo `filesystem/agent.md` com uma nova instrucao (historico + instrucoes ativas).

```bash
pnpm reverso agent-setup --text "Adicione que o foco da investigacao e a pessoa X"
```

### dig

Le previews de `lab/agent/filesystem/source/.artifacts` de forma incremental (um por vez), acumula conclusoes, gera leads sugeridos, ranqueia as 3 melhores sugestoes e compara com os leads ja existentes em `filesystem/investigation/leads`. Salva relatorio em `filesystem/reports/dig-<timestamp>.md` e exibe recomendacao para usar **create-lead**.

```bash
pnpm reverso dig
pnpm reverso dig --model google/gemini-2.5-flash
pnpm reverso dig --feedback visual
```

### create-lead

Cria um lead em `filesystem/investigation/leads/lead-<slug>.md` com contexto e **Inquiry Plan**.
Este comando e somente de planejamento: nao gera allegations/findings.

O formato segue o modelo de Inquiry Plan:
1) Formular Allegations
2) Define Search Strategy
3) Gather Findings
4) Map to Allegations

As relacoes e conclusao da inquiry serao geradas no comando `inquiry`.

- **--idea** (opcional): ideia ou nome do lead (ex.: "cartel combinacao"). Se omitir, a IA sugere.

```bash
pnpm reverso create-lead --idea "cartel combinacao"
pnpm reverso create-lead
```

Arquivo gerado:
- `lab/agent/filesystem/investigation/leads/lead-<slug>.md`

### inquiry

Executa a investigacao para um lead ja criado:

- gera allegations em `lab/agent/filesystem/investigation/allegations/`
- gera findings em `lab/agent/filesystem/investigation/findings/`
- atualiza `lead-<slug>.md` com `# Conclusion` e o cenario final

Formato de evidence por finding:
- `source` (docId/nome)
- `page` (aproximada quando possivel)
- `excerpt` (trecho textual)
- um finding pode ter varias evidencias/fontes

```bash
pnpm reverso inquiry --lead "cartel-combinacao"
pnpm reverso inquiry cartel-combinacao
```

### doc-process

Executa o pipeline de processamento de documentos dentro do `lab/agent`.

Subcomandos de source:

```bash
pnpm reverso doc-process process-all --source lab/agent/filesystem/source
pnpm reverso doc-process queue-status --source lab/agent/filesystem/source
pnpm reverso doc-process queue-clear --source lab/agent/filesystem/source
pnpm reverso doc-process watch --source lab/agent/filesystem/source
```

Modo PDF unico:

```bash
pnpm reverso doc-process --input "examples/input/2022_COMBATE_EROSÃO_Jd. Novo Parelheiros.pdf" --output "examples/output" --chunk-pages 5 --concurrency 15
```

## Configuracao

Variavel obrigatoria no root do projeto (`.env.local`):

```bash
OPENROUTER_API_KEY=...
```

Modelo default: `google/gemini-2.5-flash`.

## Saidas esperadas

- **init**: `lab/agent/filesystem/agent.md` (contexto, hipotese, escopo, instrucoes, previews usados, proximos passos).
- **agent-setup**: mesmo arquivo atualizado com historico e instrucoes ativas.
- **dig**: `lab/agent/filesystem/reports/dig-<timestamp>.md` (top 3 sugestoes, comparacao, recomendacao).
- **create-lead**: `lab/agent/filesystem/investigation/leads/lead-<slug>.md` (contexto + inquiry plan).
- **inquiry**:
  - `lab/agent/filesystem/investigation/allegations/*.md`
  - `lab/agent/filesystem/investigation/findings/*.md`
  - `# Conclusion` atualizada em `lead-<slug>.md` com cenario:
    - positiva
    - negativa
    - plan another inquiry

## Verificacao tecnica

```bash
pnpm --dir lab/agent run typecheck
pnpm --dir lab/agent run test
```
