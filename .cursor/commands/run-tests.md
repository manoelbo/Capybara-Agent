---
description: Rodar suíte de testes (completa ou só da última feature) conforme registro em .agents.
argument-hint: [all|last]
---

# Run tests

Rodar a suíte de testes conforme o registro em `.agents/test-registry.md`. Suporta modo **completo** (todos os testes) ou **última feature** (apenas os testes associados ao último commit registrado).

**Argumento opcional:** `all` (padrão) = suíte completa; `last` = só testes da última feature no registro.

## 1. Ler o registro de testes

- Ler **`.agents/test-registry.md`**.
- Se o arquivo não existir, orientar o usuário a rodar primeiro o comando **post-commit-tests** após um commit de código.

## 2. Verificar ambiente de testes

- Verificar se existe **`package.json`** na raiz do projeto e quais scripts de teste estão definidos (ex.: `test`, `test:unit`, `test:e2e`).
- Se não existir `package.json` ou scripts de teste, informar no relatório que os comandos serão aplicáveis quando o projeto tiver Vitest/Playwright configurados; mostrar os comandos documentados no registro para referência.

## 3. Modo "todos" (suíte completa)

- Quando o argumento for `all` ou estiver vazio: executar o comando da **suíte completa** indicado no registro (ex.: `pnpm test` ou `pnpm test:unit && pnpm test:e2e`).
- Executar o comando no terminal e capturar a saída.

## 4. Modo "última feature"

- Quando o argumento for `last`: usar o **último** bloco "Por commit" no `test-registry.md` e obter a lista de arquivos de teste e o "Comando para este commit".
- Executar apenas os testes listados para esse commit (ex.: `pnpm test -- tests/unit/auth/validation.test.ts` ou o comando exato registrado).
- Se não houver nenhum commit com testes no registro, informar e sugerir rodar a suíte completa ou executar **post-commit-tests** após um commit de código.

## 5. Resultado e correção

- Exibir a **saída** dos testes no terminal.
- Indicar **sucesso** ou **falha**.
- Em caso de falha: sugerir correções com base na saída e, se o usuário desejar, rodar novamente após as correções; ou reportar que é necessária intervenção manual.

## Resumo de saída

- Comando executado.
- Modo (completo / última feature).
- Resultado: passou / falhou.
- Se falhou: resumo dos erros e próxima ação sugerida.
