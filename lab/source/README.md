# Source (ambiente de teste)

Esta pasta é um **ambiente de teste** de como funcionará a pasta de fontes (sources) no Reverso Agent.

## Uso

Aqui o usuário coloca os arquivos (ex.: PDFs) que deseja processar com a ferramenta **document-processing-tool** (em `lab/document-processing-tool`).

- Coloque um ou mais PDFs nesta pasta.
- Da raiz do projeto, execute por exemplo:

  ```bash
  pnpm lab:pdf:ocr
  ```

  usando `--input "lab/source/meu-documento.pdf"` e `--output` no diretório de saída desejado (ex.: `examples/output` ou uma pasta dentro de `lab/`).

## Exemplo

```bash
node lab/document-processing-tool/run.js \
  --input "lab/source/contrato.pdf" \
  --output "examples/output" \
  --chunk-pages 5 \
  --concurrency 15
```

Quando o workspace real do Reverso estiver ativo, a pasta de fontes seguirá a mesma ideia: um local único onde o usuário deposita documentos para ingestão e processamento (réplica, preview, metadata).
