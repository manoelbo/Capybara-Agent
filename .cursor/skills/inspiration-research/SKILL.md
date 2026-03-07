---
name: Inspiration Research
description: Pesquisar nos projetos em .agents/inspirations/ para inspirar a próxima feature; dispara subagentes de pesquisa e um decisor que recomenda qual projeto seguir.
---

# Skill: Inspiration Research

## Quando usar

- No fluxo de **brainstorm** (antes de propor abordagens concretas) ou quando o usuário pedir inspiração nos projetos de referência.
- Exemplos de gatilho: "vamos nos inspirar nos projetos em Inspirations para [tópico]", "que projeto em inspirations pode me ajudar com X?", "pesquise nas referências como fazer Y".

## Entrada

- **Tópico:** uma frase ou parágrafo descrevendo o que se quer inspirar (ex.: "como estruturar a ferramenta editFile do agente", "layout sidebar + viewer + chat", "edição de trechos de Markdown").

## Manifesto

Consultar a **Cursor rule** `capybara-agent-inspiration.mdc` para obter a lista de projetos e papéis. Não usar arquivo separado de manifesto.

Projetos esperados em `.agents/inspirations/`: `open-cowork`, `Trilium`, `aider`, `learn-claude-code`, `opencode`. Se uma pasta não existir, pule-a.

---

## Processo em 5 passos

1. **Usar o manifesto** — Da rule, obter a tabela de projetos (pasta, papel, use for, PRDs). Confirmar quais pastas existem em `.agents/inspirations/`.

2. **Disparar subagentes explore em paralelo** — Para cada projeto listado no manifesto cuja pasta exista, invocar **um** `mcp_task` com `subagent_type: "explore"`, apontando para `.agents/inspirations/<projeto>/`. O prompt deve pedir: como esse projeto aborda o **tópico** dado pelo usuário; resposta em resumo curto (3–5 frases). Disparar todos em paralelo (várias chamadas `mcp_task` ao mesmo tempo, uma por projeto).

3. **Agregar resumos** — Reunir as respostas dos subagentes explore em um único bloco de texto, identificando cada projeto por nome.

4. **Disparar subagente decisor** — Invocar **um** `mcp_task` com `subagent_type: "generalPurpose"`. Entregar: (a) os resumos agregados, (b) o tópico original, (c) os critérios de decisão da rule. Pedir: qual(is) projeto(s) seguir e por quê, em 1–2 parágrafos; só a recomendação, sem repetir os resumos.

5. **Apresentar só o resultado do decisor** — Mostrar ao usuário apenas a recomendação final (1–2 parágrafos). Não colar todos os resumos de pesquisa no chat para não poluir o contexto.

---

## Prompts de exemplo

### Para o pesquisador (explore), um por projeto

```
No repositório em .agents/inspirations/<NOME_DO_PROJETO>/, pesquise como o projeto aborda o seguinte tópico:

"[TÓPICO COLE AQUI]"

Responda em 3–5 frases: o que esse projeto faz de relevante para esse tópico (estrutura, padrões, arquivos-chave). Se não achar nada relevante, diga "Nenhuma referência clara para este tópico."
```

Exemplo concreto para `aider` e tópico "edição de trechos de arquivo":

```
No repositório em .agents/inspirations/aider/, pesquise como o projeto aborda o seguinte tópico:

"edição de trechos de arquivo (diff, search-replace, não reescrever o arquivo inteiro)"

Responda em 3–5 frases: o que esse projeto faz de relevante para esse tópico (estrutura, padrões, arquivos-chave). Se não achar nada relevante, diga "Nenhuma referência clara para este tópico."
```

### Para o decisor (generalPurpose)

```
Você é o decisor de inspiração do projeto Capybara Agent. Receba os resumos abaixo de pesquisas feitas em projetos de referência e o tópico original. Com base nos critérios de decisão fornecidos, recomende qual(is) projeto(s) o time deve seguir para esse tópico e por quê.

Tópico original: "[TÓPICO]"

Critérios de decisão (resumo):
- Arquitetura de agente e ferramentas → preferir learn-claude-code e opencode.
- Edição precisa de trechos de documento → adaptar com aider.
- Estrutura de app desktop, chat e UI → open-cowork.
- Organização de árvore, menu e Markdown → Trilium.
- Ideias criativas ou fora da curva → considerar opencode e learn-claude-code.

Resumos por projeto:
[COLAR AQUI OS RESUMOS AGREGADOS]

Responda em 1–2 parágrafos apenas: qual(is) projeto(s) seguir e por quê. Não repita os resumos.
```

### Formato de saída esperado do decisor

- 1–2 parágrafos em prosa.
- Deve mencionar pelo menos um projeto por nome e o motivo da recomendação.
- Exemplo: "Para a ferramenta editFile, recomendo seguir o **aider** pelos formatos diff/udiff de edição parcial, e o **opencode** pela definição da tool `edit` e permissões. O learn-claude-code pode complementar no desenho do loop do agente."

---

## Notas

- **Paralelismo:** Dispare todos os `mcp_task` do tipo `explore` em paralelo (várias invocações na mesma rodada), um por projeto, para não estender o contexto com pesquisas sequenciais longas.
- **Pastas faltando:** Se `.agents/inspirations/<projeto>/` não existir, não invoque explore para esse projeto; siga só com os que existem.
- **Plugin superpowers:** Se o projeto usar o plugin superpowers, o fluxo deve funcionar com ele; a skill não substitui a configuração do plugin, apenas descreve o uso de `mcp_task` (explore + generalPurpose).

---

## Validation

Para testar o fluxo, siga o passo a passo em **VALIDATION.md** (neste diretório). Resumo:

1. Iniciar uma sessão de brainstorm (ex.: "Quero decidir como implementar a ferramenta editFile do agente").
2. Pedir explicitamente: "Vamos nos inspirar nos projetos em Inspirations para [tópico]" (ex.: "para edição de trechos de arquivo").
3. Verificar que o agente:
   - Considera a rule `capybara-agent-inspiration.mdc` e a skill.
   - Dispara subagentes **explore** em paralelo para cada projeto existente em `.agents/inspirations/`.
   - Agrega os resumos e dispara um subagente **generalPurpose** (decisor).
   - Apresenta **apenas** a recomendação final (1–2 parágrafos) ao usuário, sem colar todos os resumos no chat.

Se algum subagente falhar ou uma pasta estiver faltando, o agente deve seguir com os resultados disponíveis e ainda assim invocar o decisor com o que tiver.
