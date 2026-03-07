---
description: Executar plano de implementação (tarefas, testes, validação)
argument-hint: [caminho-do-plano.md]
---

# Execute: Implementar a partir do Plano

## Plano a executar

Ler o arquivo de plano: **$ARGUMENTS**

Se `$ARGUMENTS` estiver vazio ou for apenas um nome (ex.: `sidebar-collapsible`), usar: `.agents/plans/$ARGUMENTS.md` ou `.agents/plans/{kebab-case}.md`.

## Instruções de execução

### 1. Ler e entender

- Ler o plano **inteiro** com atenção.
- Entender todas as tarefas e suas dependências (ordem em **STEP-BY-STEP TASKS**).
- Anotar os **comandos de validação** (seção **VALIDATION COMMANDS** e campo **VALIDATE** de cada tarefa).
- Revisar a **TESTING STRATEGY** e os **ACCEPTANCE CRITERIA**.
- Se o plano tiver **CONTEXT REFERENCES**, ler os arquivos e a documentação listados antes de implementar.

### 2. Executar tarefas na ordem

Para **cada** tarefa em **STEP-BY-STEP TASKS**:

#### a. Localizar a tarefa
- Identificar o arquivo e a ação (CREATE | UPDATE | ADD | REMOVE | REFACTOR | MIRROR).
- Ler os arquivos relacionados existentes, se for modificação.
- Respeitar **PATTERN**, **IMPORTS** e **GOTCHA** indicados na tarefa.

#### b. Implementar
- Seguir as especificações do campo **IMPLEMENT**.
- Manter consistência com os padrões do projeto (ver **Patterns to Follow** no plano).
- Incluir tipos e documentação conforme convenções do codebase.
- Usar logging estruturado onde fizer sentido.

#### c. Verificar após cada alteração
- Checagem de sintaxe após mudança em arquivo.
- Imports corretos e tipos bem definidos.
- Rodar o comando **VALIDATE** da tarefa, se houver, antes de seguir.

### 3. Aplicar a estratégia de testes

Após concluir as tarefas de implementação:

- Criar os arquivos de teste indicados na **TESTING STRATEGY**.
- Implementar os casos de teste descritos (unit, integration, edge cases).
- Seguir a abordagem de testes do plano e do projeto.

### 4. Rodar os comandos de validação

Executar **todos** os comandos da seção **VALIDATION COMMANDS** do plano, na ordem indicada (Level 1 → 2 → 3 → 4 → 5):

```bash
# Executar cada comando exatamente como especificado no plano
```

Se algum comando falhar:
- Corrigir o problema.
- Rodar novamente o comando.
- Só seguir quando passar.

### 5. Verificação final

Antes de encerrar, confirmar:

- ✅ Todas as tarefas do **STEP-BY-STEP TASKS** concluídas.
- ✅ Testes criados e passando.
- ✅ Todos os comandos de **VALIDATION COMMANDS** executados com sucesso.
- ✅ Código alinhado às convenções do projeto (e ao plano).
- ✅ **ACCEPTANCE CRITERIA** atendidos.
- ✅ **COMPLETION CHECKLIST** do plano marcado.

## Relatório de saída

Entregar um resumo objetivo:

### Tarefas concluídas
- Lista de todas as tarefas concluídas (referência ao STEP-BY-STEP TASKS).
- Arquivos criados (com caminhos).
- Arquivos modificados (com caminhos).

### Testes adicionados
- Arquivos de teste criados.
- Casos de teste implementados.
- Resultado da execução dos testes.

### Resultados da validação
```bash
# Saída de cada comando de validação executado
```

### Pronto para commit
- Confirmar que todas as alterações estão completas.
- Confirmar que todas as validações passaram.
- Indicar se está pronto para comando `/commit` ou fluxo de commit do projeto.

## Notas

- Se surgir algo não coberto pelo plano, documentar e decidir (ou perguntar ao usuário) antes de desviar.
- Se for necessário desviar do plano, explicar o motivo.
- Se testes ou validações falharem, corrigir a implementação até passarem; não pular etapas de validação.
