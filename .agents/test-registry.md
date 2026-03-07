# Registro de testes (pós-commit)

Este arquivo é gerado e atualizado pelo comando **post-commit-tests**. O comando **run-tests** usa este registro para rodar a suíte completa ou apenas os testes da última feature.

## Como rodar testes

- **Suíte completa:** `pnpm test` (ou `pnpm test:unit && pnpm test:e2e` quando existir).
- **Só última feature:** ver último bloco em "Por commit" abaixo e rodar o comando listado em "Comando para este commit".

Quando não houver `package.json` ou scripts de teste no projeto, os comandos serão preenchidos assim que o projeto tiver Vitest/Playwright configurados (conforme PRD-01).

## Por commit (mais recente primeiro)

_(Nenhum commit registrado ainda. Rode o comando **post-commit-tests** após um commit de código para gerar testes e preencher esta seção.)_
