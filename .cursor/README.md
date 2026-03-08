# Configuração do Cursor (Capybara Agent)

Toda a **configuração do agente** e do workflow no Cursor fica aqui: skills, comandos e rules.

## Estrutura

```
.cursor/
├── commands/          # Comandos de agente (Cmd+K ou Command Palette)
├── skills/            # Skills (comportamentos especializados do agente)
├── rules/             # Regras persistentes (.mdc)
├── settings.json      # Configurações do projeto no Cursor
└── README.md          # Este arquivo
```

## Skills (`skills/`)

Skills são instruções que o agente usa automaticamente quando o contexto se encaixa. Cada skill fica em `skills/<nome>/SKILL.md`.

| Skill | Uso |
|-------|-----|
| **plan-feature** | Criar plano de implementação completo (codebase + Context7). Ver também o plano mestre em `.agents/plan-feature-master.md`. |
| **inspiration-research** | Pesquisar nos projetos em `.agents/inspirations/` e recomendar qual seguir para um tópico. |
| **electron** | Automatizar apps Electron (Slack, VS Code, Figma, etc.) via agent-browser e CDP. |

## Comandos (`commands/`)

Comandos são acionados pelo usuário (argumento opcional em `$ARGUMENTS`).

| Comando | Descrição |
|---------|-----------|
| **plan-feature** | Executa o plano mestre e gera `.agents/plans/{nome}.md`. Entrada: nome ou descrição da feature. |
| **inspire-from-projects** | Aciona inspiração nos projetos de referência. Entrada: tópico ou feature. |
| **execute-plan** | Implementa a partir de um plano (ler plano → tarefas → testes → validação). Entrada: caminho do plano ou nome (ex.: `.agents/plans/sidebar-collapsible.md`). |
| **load-project-context** | Carrega contexto completo do projeto (estrutura, PRDs, rules, skills, estado do git). |
| **commit** | Cria commit atômico com tag (feat/fix/docs/...) para alterações pendentes. |
| **run-tests** | Roda a suíte de testes (usa `.agents/test-registry.md`). |
| **post-commit-tests** | Analisa último commit, gera/complementa testes e atualiza o registro. |

## Rules (`rules/`)

Regras em `.mdc` orientam o agente de forma persistente (ex.: `capybara-agent-inspiration.mdc` — manifesto de projetos de inspiração e critérios de decisão).

## Onde ficam os dados do projeto?

Os **artefatos** (PRDs, planos gerados, inspirações, registro de testes) ficam em **`.agents/`**. Os comandos e skills referenciam esses caminhos. Ver `.agents/README.md` para detalhes.
