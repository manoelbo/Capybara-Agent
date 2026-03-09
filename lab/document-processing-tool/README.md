# Document Processing Tool (PDF → réplica, preview, metadata)

Pipeline de PDF para Markdown (réplica, preview, metadata).

Usa **Mistral-OCR** via OpenRouter: envia o PDF em chunks configuráveis (default 5 páginas), processa em paralelo (default 15) e suporta resume via checkpoint. Réplica usa **OpenAI GPT-5 Nano** (`openai/gpt-5-nano`); preview e metadata usam **Google Gemini 2.5 Flash** (`google/gemini-2.5-flash`) por padrão.

Sem integração com Electron/IPC. Tudo roda via Node.

## Pré-requisitos

- `OPENROUTER_API_KEY` em `.env.local` na raiz do projeto
- Dependências já instaladas (`pnpm install`)

## Execução

```bash
pnpm lab:pdf:ocr
# ou smoke (2 páginas):
pnpm lab:pdf:ocr:smoke
```

**CLI direto:**

```bash
node lab/document-processing-tool/run.js \
  --input "examples/input/2022_COMBATE_EROSÃO_Jd. Novo Parelheiros.pdf" \
  --output "examples/output" \
  --chunk-pages 5 \
  --concurrency 15
```

(Omite `--model` e `--preview-model` para usar os padrões: GPT-5 Nano na réplica, Gemini 2.5 Flash no preview/metadata.)

## Opções

- `--model` — modelo para réplica (Mistral-OCR no backend). Padrão: `openai/gpt-5-nano`
- `--preview-model` — modelo para preview e metadata. Padrão: `google/gemini-2.5-flash`
- `--chunk-pages N` — páginas por chunk (padrão: 5)
- `--concurrency N` — requisições em paralelo (padrão: 15, máx. 20)
- `--resume false` — desativa retomada a partir do checkpoint (padrão: ativado)
- `--max-pages N` — limita a N páginas (smoke test)
- `--debug-openrouter true` — grava a resposta bruta da API em `openrouter-debug-chunk-XX.json` no diretório de output (annotations sanitizadas para leitura).
- `--provider-sort latency` — prioriza provedores com menor latência. Alternativas: `throughput` ou `price`.

## Saída

Em `examples/output/<slug-do-pdf>/` (ou o path passado em `--output`):

- `replica.md`
- `preview.md`
- `metadata.md`
- `run-report.json`
- `chunks/chunk-XX.md` — artefato por chunk
- `checkpoint.json` — progresso dos chunks e status de preview/metadata (resume)

---

## Pasta source (lote e monitoramento)

A pasta **`lab/source`** é um ambiente de teste para processar vários arquivos: coloque PDFs em `lab/source` e use os subcomandos abaixo. O estado global fica em `lab/source/source-checkpoint.json` (status por arquivo, seleção, erros). Os artefatos de cada documento são gravados em `lab/source/.artifacts/<docId>/` (replica.md, preview.md, metadata.md, checkpoint.json, run-report.json).

### Subcomandos

**Processar todos os pendentes (não processados ou com falha recuperável):**

```bash
node lab/document-processing-tool/run.js process-all --source lab/source
# ou
pnpm lab:source:process-all
```

**Processar apenas os selecionados:**

```bash
node lab/document-processing-tool/run.js process-selected --source lab/source
# ou
pnpm lab:source:process-selected
```

(Use o comando `select` para marcar arquivos como selecionados.)

**Monitorar a pasta source (atualiza o checkpoint ao adicionar/remover/alterar arquivos):**

```bash
node lab/document-processing-tool/run.js watch --source lab/source
# ou
pnpm lab:source:watch
```

**Definir seleção (para uso com process-selected):**

```bash
node lab/document-processing-tool/run.js select --source lab/source --files "doc1.pdf,doc2.pdf" --value true
```

Os mesmos parâmetros de pipeline (`--model`, `--chunk-pages`, `--concurrency`, etc.) podem ser passados em `process-all` e `process-selected`.

---

## Testes

Os testes ficam em **`lab/document-processing-tool/tests/`**:

- **`source-queue.test.ts`** — Testes unitários da fila e do checkpoint (sem API): carregar/salvar checkpoint, `setSourceQueued`, estrutura do checkpoint.
- **`e2e-smoke.test.ts`** — E2E smoke: cria pasta source temporária, copia 1 PDF (`examples/input/test-doc-erosao-renamed.pdf`), roda `process-all` com `--max-pages 2`, verifica artefatos e checkpoint, roda `queue-status` e `queue-clear`, e remove a pasta ao final. O E2E exige `OPENROUTER_API_KEY` em `.env.local`; se estiver ausente ou o processamento falhar, o teste é ignorado.

**Como rodar:**

- Na raiz do projeto: **`pnpm test`** (comando master) ou **`pnpm run test:doc-tool`** (só os testes do document-processing-tool).
- Os unitários não precisam de API key; o E2E usa a API e pode levar alguns minutos quando a key está configurada.
