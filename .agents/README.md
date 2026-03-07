# Conteúdo do projeto (artefatos do agente)

A pasta **`.agents`** guarda o **conteúdo e os artefatos** do projeto usados pelos comandos e skills do Cursor. A **configuração** do agente (skills, comandos, rules) fica em **`.cursor/`**.

## Estrutura

```
.agents/
├── prds/                    # Product Requirements (PRD-00-master + domínios)
├── plans/                   # Planos de feature gerados (comando plan-feature)
├── inspirations/            # Projetos de referência (clone de repos para inspiração)
├── plan-feature-master.md   # Plano mestre executado pelo comando plan-feature
├── test-registry.md         # Registro de testes (post-commit-tests / run-tests)
├── capybara_agent_project.md # Visão geral do projeto (overview, design, UI)
└── README.md                # Este arquivo
```

## Uso pelos comandos do Cursor

- **plan-feature** → lê `plan-feature-master.md`, grava em `plans/{nome}.md`, usa `inspirations/` e a rule de inspiração.
- **inspire-from-projects** → pesquisa em `inspirations/` e usa a rule em `.cursor/rules/`.
- **execute-plan** → lê planos em `plans/*.md`.
- **load-project-context** → lê PRDs, `capybara_agent_project.md`, lista `plans/`.
- **post-commit-tests** / **run-tests** → usam `test-registry.md`.

Tudo que é “como o agente se comporta” está em **`.cursor/`**. Tudo que é “dados e documentação do projeto” está aqui em **`.agents/`**.
