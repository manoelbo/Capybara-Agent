---
description: Após o commit — analisar alterações, gerar/complementar testes da feature e atualizar registro e documentação interna.
---

# Post-commit tests

Executar **após** cada commit de código. Analisa o último commit, gera ou complementa testes para a feature alterada, atualiza o registro em `.agents/test-registry.md` e a documentação interna.

## 1. Obter dados do último commit

Rodar no repositório:

```bash
git log -1 --format=%H%n%s%n%b
git diff-tree --no-commit-id --name-only -r HEAD
git show HEAD --no-stat
```

- Primeiro comando: hash (`%H`), assunto (`%s`), corpo (`%b`) do último commit.
- Segundo: lista de arquivos alterados nesse commit.
- Terceiro: diff completo para o agente analisar o escopo da feature.

## 2. Validar contexto

- Se não houver commit (repositório novo ou sem commits), orientar o usuário a fazer o primeiro commit antes.
- Se o commit tocar **apenas** arquivos de docs/config (ex.: só `.md`, `.mdc`, `.json` em `.cursor/` ou `.agents/`), registrar em `.agents/test-registry.md` como "sem testes de código" para esse commit e encerrar com relatório breve.

## 3. Inferir feature e escopo

- A partir da **mensagem** do commit (ex.: `feat(auth): add email validation`) e dos **arquivos alterados**, identificar:
  - Módulo/feature (ex.: auth, sidebar, api).
  - Tipo de teste adequado: unit (Vitest em `tests/unit/`) ou e2e (Playwright em `tests/e2e/`), conforme [PRD-01](.agents/prds/PRD-01-workspace-infra-ai.md) e [TESTING STRATEGY](.cursor/skills/plan-feature/SKILL.md) dos planos.

## 4. Gerar ou complementar testes

- Ler convenções do projeto: estrutura em `tests/unit/` e `tests/e2e/`, padrões em planos e PRDs (Vitest + Playwright).
- Para cada arquivo de **código** alterado relevante (excluir apenas config/docs quando fizer sentido):
  - Criar ou atualizar arquivos de teste em `tests/unit/` ou `tests/e2e/` seguindo padrões existentes (`*.spec.ts` / `*.test.ts`, `describe`/`it`).
  - Cobrir casos principais e edge cases óbvios; **não duplicar** testes que já existam.
- Se o projeto ainda não tiver `package.json` ou scripts de teste, criar os arquivos de teste na estrutura esperada e anotar no registro que os comandos serão preenchidos quando Vitest/Playwright estiverem configurados.

## 5. Atualizar registro de testes

- Arquivo: **`.agents/test-registry.md`** (criar se não existir).
- Para o **commit atual**, registrar:
  - Hash e mensagem do commit.
  - Nome/escopo da feature (extraído da mensagem ou dos arquivos).
  - Lista de arquivos de teste **criados ou alterados**.
  - Comando para rodar só esses testes (ex.: `pnpm test -- tests/unit/auth/validation.test.ts`) e comando da suíte completa (ex.: `pnpm test`).
- Manter no topo do arquivo a seção **"Como rodar testes"** com: suíte completa, "só última feature" (referência ao último bloco), e onde ficam os testes.

## 6. Atualizar documentação interna

- Em **`.agents/test-registry.md`**: garantir índice legível (por commit/feature) e seção "Como rodar testes" atualizada.
- Adicionar ou manter em [.agents/plans/README.md](.agents/plans/README.md) uma linha ou seção explicando que, após cada commit de código, o comando **post-commit-tests** gera testes e atualiza o registro, e que **run-tests** usa esse registro para rodar a suíte ou só a última feature.

## 7. Relatório final

Entregar ao usuário:

- **Resumo:** commit analisado (hash, mensagem), feature inferida.
- **Testes:** arquivos de teste criados ou alterados (com caminhos).
- **Registro:** caminho `.agents/test-registry.md` e trecho relevante de "Como rodar testes".
- **Próximo passo:** lembrete para rodar o comando **run-tests** (ou o comando do projeto) para validar.

## Notas

- Este comando não altera o histórico git; apenas cria/edita arquivos de teste e o registro. O usuário pode commitar essas mudanças em um commit separado (ex.: `test: add tests for feat X`) ou junto à próxima alteração.
- Se testes ou validações falharem ao rodar, corrigir a implementação dos testes até passarem antes de encerrar.
