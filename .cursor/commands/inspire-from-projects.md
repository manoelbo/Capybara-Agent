---
description: Acionar inspiração nos projetos em .agents/inspirations/ para um tópico ou feature
argument-hint: [tópico ou feature para inspirar]
---

# Inspire from Projects

## Objetivo

Acionar a funcionalidade de **Inspiration**: pesquisar nos projetos de referência em `.agents/inspirations/` e obter uma recomendação de qual(is) projeto(s) seguir para o tópico ou feature indicado.

## Instrução para o agente

1. Consulte a **Cursor rule** `capybara-agent-inspiration.mdc` para o manifesto de projetos e critérios de decisão.
2. Siga a **skill** `.cursor/skills/inspiration-research/SKILL.md`: use o tópico abaixo como entrada, dispare os subagentes **explore** (em paralelo) e o subagente **generalPurpose** (decisor), e apresente **apenas** a recomendação final ao usuário (1–2 parágrafos).

## Tópico para inspirar

Vamos nos inspirar nos projetos em `.agents/inspirations/` para o tópico:

**$ARGUMENTS**

(Se `$ARGUMENTS` estiver vazio, peça ao usuário que descreva em uma frase o tópico ou a feature para a qual quer inspiração e então execute o fluxo da skill com essa descrição.)

## Resultado esperado

Ao final, mostrar só a recomendação do decisor: qual(is) projeto(s) seguir e por quê, em 1–2 parágrafos. Não colar no chat todos os resumos de pesquisa dos subagentes explore.
