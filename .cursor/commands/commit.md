---
description: Criar um commit atômico para todas as alterações não commitadas (tag + mensagem)
---

# Commit

Criar um **novo commit** para todas as alterações não commitadas.

## 1. Ver o que está pendente

Rodar para inspecionar o estado do repositório e as diferenças:

```bash
git status && git diff HEAD && git status --porcelain
```

- `git status` — visão geral dos arquivos modificados e não rastreados.
- `git diff HEAD` — diff completo das alterações em relação ao último commit.
- `git status --porcelain` — lista machine-friendly dos arquivos para script/parse.

## 2. Adicionar arquivos

Adicionar **todos** os arquivos não rastreados e alterados (staged + unstaged):

```bash
git add -A
```

Ou, se quiser incluir apenas os arquivos já listados (sem remoções automáticas): `git add -u` para alterados/removidos e `git add .` para novos. Para “tudo”: `git add -A` ou `git add .` na raiz.

## 3. Mensagem de commit atômica

Criar **uma** mensagem de commit que descreva de forma atômica e clara o que foi feito.

- Uma única mudança lógica por commit.
- Mensagem objetiva (ex.: “Add validation for email field” em vez de “fixes” genéricos).

## 4. Tag do tipo de mudança

Iniciar a mensagem com uma **tag** que reflita o tipo de trabalho, seguindo convenções (Conventional Commits ou similar):

| Tag     | Uso típico                          |
|--------|--------------------------------------|
| `feat` | Nova funcionalidade                  |
| `fix`  | Correção de bug                      |
| `docs` | Apenas documentação                  |
| `style`| Formatação, espaços, sem mudança de código |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Testes                               |
| `chore`| Tarefas de build, deps, config, etc.  |

**Formato sugerido:** `tag: descrição curta` ou `tag(escopo): descrição curta`.

Exemplos:
- `feat(auth): add email validation`
- `fix(api): handle null response`
- `docs: update README setup steps`

## Resumo do fluxo

1. Rodar `git status && git diff HEAD && git status --porcelain`.
2. `git add -A` (ou o conjunto de arquivos desejado).
3. Montar mensagem com **tag** + descrição atômica.
4. Executar `git commit -m "tag: mensagem"`.
