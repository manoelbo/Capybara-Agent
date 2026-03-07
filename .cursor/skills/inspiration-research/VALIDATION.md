# Validação: Inspiration Research

Este documento descreve como validar o fluxo completo da funcionalidade **Inspiration** (rule + skill + subagentes). A skill principal já contém uma seção **Validation**; aqui está o passo a passo executável.

## Pré-requisitos

- Projetos clonados em `.agents/inspirations/`: `open-cowork`, `Trilium`, `aider`, `learn-claude-code`, `opencode` (pastas faltando podem ser ignoradas).
- Cursor com suporte a `mcp_task` (subagentes `explore` e `generalPurpose`).

## Passo a passo

1. **Abrir uma nova conversa** (ou sessão de brainstorm).

2. **Disparar o fluxo** de uma das formas:
   - **Comando:** Usar o comando "Inspire from Projects" com argumento, ex.: `como estruturar a ferramenta editFile do agente`.
   - **Chat:** Escrever: "Vamos nos inspirar nos projetos em Inspirations para [tópico]". Exemplo: "Vamos nos inspirar nos projetos em Inspirations para edição de trechos de arquivo pelo agente."

3. **Verificar que o agente:**
   - Considera a rule `capybara-agent-inspiration.mdc` (manifesto e critérios).
   - Invoca a skill `inspiration-research`.
   - Dispara subagentes **explore** em paralelo (um por projeto existente em `.agents/inspirations/`).
   - Agrega os resumos e dispara um subagente **generalPurpose** (decisor).
   - Responde com **apenas** a recomendação final (1–2 parágrafos), sem colar todos os resumos no chat.

4. **Critério de sucesso:** A resposta final deve mencionar pelo menos um projeto por nome e o motivo da recomendação (ex.: aider para edição parcial, opencode para tools).

## Tópicos sugeridos para teste

- "como estruturar a ferramenta editFile do agente"
- "layout sidebar + viewer + chat no desktop"
- "organização de árvore de notas estilo Obsidian"
- "loop do agente: planejar, executar ferramenta, observar"

## Se algo falhar

- **Pasta faltando:** O agente deve pular esse projeto e seguir com os demais.
- **Subagente explore falhou:** Usar os resumos que voltaram e ainda assim chamar o decisor.
- **Decisor não foi chamado:** Garantir que a skill está a ser seguida (consultar `.cursor/skills/inspiration-research/SKILL.md`).
