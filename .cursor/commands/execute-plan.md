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
- Se o plano tiver **CONTEXT REFERENCES**, ler os arquivos e a documentação listados antes de implementar. **A documentação prioritária é a listada no plano** (Relevant Documentation); usar Context7 na execução só se surgir algo não coberto pelo plano.

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

### 5. Teste visual / interativo (quando o plano envolver UI ou Electron)

Quando o plano tiver **ACCEPTANCE CRITERIA**, **VISUAL / E2E CHECKS** ou **TESTING STRATEGY** que exijam validar a UI (cliques, fluxos, elementos na tela), o agente deve **abrir a aplicação e testar interativamente**. Usar **skill electron** (app desktop), **MCP cursor-ide-browser** (app na web) e, quando for teste via navegador/preview, **seguir as orientações da skill ou plugin Vercel** (ou equivalente) para alinhar com a funcionalidade de browser do Cursor.

#### Opção A — App Electron (desktop)

Usar a **skill electron** (ler `.cursor/skills/electron/SKILL.md`):

1. **Build/Dev** — Garantir que o app está buildado ou em dev (`pnpm build` ou `pnpm dev`).
2. **Lançar com CDP** — Iniciar o app com `--remote-debugging-port=9222` (ex.: binário em `dist` ou script no package.json). Exemplo macOS: `./dist/mac/App.app/Contents/MacOS/App --remote-debugging-port=9222`.
3. **Conectar** — `agent-browser connect 9222` (ou `npx agent-browser connect 9222`).
4. **Snapshot** — `agent-browser snapshot -i` para listar elementos interativos e refs (@e1, @e2, …).
5. **Executar checks de aceitação** — Conforme o plano ou ACCEPTANCE CRITERIA: clicar em botões (`agent-browser click @eN`), preencher campos (`agent-browser fill @eN "valor"`), navegar, verificar texto (`agent-browser get text @eN`). Re-snapshot após mudanças de estado.
6. **Screenshot** — `agent-browser screenshot nome.png` para registro visual do estado final.
7. **Dark mode** — Se o app usar tema escuro: `AGENT_BROWSER_COLOR_SCHEME=dark agent-browser connect 9222` (e comandos seguintes).

#### Opção B — App na web (localhost ou URL)

Quando o app estiver acessível em uma URL (ex.: dev server em `http://localhost:5173`):

1. **Subir o app** — Garantir que o dev server está rodando (ex.: `pnpm dev`).
2. **Abrir no browser** — Usar o MCP **cursor-ide-browser**: `browser_navigate` com a URL do app (ex.: `http://localhost:5173`).
3. **Snapshot** — `browser_snapshot` (com `interactive: true` para elementos clicáveis) para obter a árvore e refs dos elementos.
4. **Executar checks de aceitação** — Conforme o plano: `browser_click` em elementos, `browser_type` ou `browser_fill` em campos, `browser_press_key` se necessário. Fazer novo `browser_snapshot` após navegação ou mudança de estado.
5. **Screenshot** — `browser_take_screenshot` para registrar o estado da tela.

Ordem do MCP browser: primeiro `browser_navigate`, depois `browser_lock` antes de interações; ao terminar, `browser_unlock`.

Escolher **Opção A** para app Electron empacotado ou janela desktop; **Opção B** quando o plano indicar teste via dev server na web. Se o plano tiver uma seção **VISUAL / E2E CHECKS** ou lista de passos de aceitação, executar esses passos usando a opção escolhida e reportar no "Resultados da validação".

### 6. Verificação final

Antes de encerrar, confirmar:

- ✅ Todas as tarefas do **STEP-BY-STEP TASKS** concluídas.
- ✅ Testes criados e passando.
- ✅ Todos os comandos de **VALIDATION COMMANDS** executados com sucesso.
- ✅ Quando aplicável: **teste visual/interativo** (skill electron e/ou MCP cursor-ide-browser) executado e checks de aceitação atendidos.
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

### Teste visual / interativo (quando aplicável)
- Se foi usado **skill electron**: port CDP, passos executados (snapshot, click, fill, etc.) e caminho do screenshot.
- Se foi usado **MCP cursor-ide-browser**: URL aberta, passos executados e resultado (e.g. screenshot salvo). Quando aplicável, indicar se foram seguidas as orientações da skill/plugin Vercel para teste em browser.
- Se não houve passo de teste visual (plano sem UI/Electron), indicar "N/A".

### Pronto para commit
- Confirmar que todas as alterações estão completas.
- Confirmar que todas as validações passaram.
- Indicar se está pronto para comando `/commit` ou fluxo de commit do projeto.

## Notas

- Se surgir algo não coberto pelo plano, documentar e decidir (ou perguntar ao usuário) antes de desviar.
- Se for necessário desviar do plano, explicar o motivo.
- Se testes ou validações falharem, corrigir a implementação até passarem; não pular etapas de validação.
- **Teste visual:** Planos que envolvem UI ou app Electron devem incluir a seção **VISUAL / E2E CHECKS** (ou passos de aceitação equivalentes) e o passo 5 (teste visual/interativo) usando a skill electron, o MCP cursor-ide-browser e, quando aplicável, as orientações da skill/plugin Vercel para teste em browser.
