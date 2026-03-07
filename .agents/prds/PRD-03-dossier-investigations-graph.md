# PRD-03: Dossier, Investigações & Graph View

> **Domínio:** Dossier, Investigações & Graph View
> **PRD Master:** `PRD-00-master.md`
> **Depende de:** Workspace & Infra, Sources & Processing
> **Consumido por:** Chat & Agent, Capybara Markdown (renderer)

---

## 1. Visão do Domínio

Este domínio é o **núcleo de conhecimento** do Capybara Agent. Aqui vivem as entidades (pessoas, grupos, lugares, eventos), as conexões entre elas (bidirectional links), as investigações com suas pistas (clues), e a visualização em grafo. Tudo é alimentado pelo processamento de Sources e orquestrado pelo Agent via Chat.

---

## 2. User Stories

1. **Como** jornalista, **quero** que o agente organize automaticamente as informações em dossiês de pessoas, empresas e lugares **para** ter uma visão clara de quem está envolvido na investigação.
2. **Como** jornalista, **quero** criar linhas investigativas com hipóteses e pistas **para** organizar meu raciocínio e ter evidências conectadas a fontes.
3. **Como** jornalista, **quero** verificar manualmente o status de cada pista (verificado/não verificado/rejeitado) **para** manter controle editorial sobre os fatos.
4. **Como** jornalista, **quero** ver um grafo visual de como pessoas, empresas e documentos se conectam **para** identificar padrões ocultos.
5. **Como** jornalista, **quero** clicar em qualquer [[link]] e navegar diretamente para a entidade referenciada **para** explorar conexões rapidamente.
6. **Como** jornalista, **quero** ver de onde veio cada afirmação (rastreabilidade) **para** poder verificar no documento original.
7. **Como** agente AI, **quero** criar e atualizar entidades no dossiê **para** organizar as descobertas da investigação.

---

## 3. Modelo de Dados do Dossiê

### 3.1 Entidades

O dossiê organiza dados em **4 tipos de entidade**, cada um como pasta + arquivo Markdown:

#### People (👤)

```markdown
---
type: person
name: João Silva
aliases: ["J. Silva", "João Carlos Silva"]
category: businessman
first_seen_in: contrato-emergencial-042.pdf
tags: [representante-legal, construtora-xyz]
created: 2026-03-15T14:35:00Z
updated: 2026-03-15T16:20:00Z
---

# João Silva

João Silva é representante legal da [[Construtora XYZ]], tendo
assinado múltiplos contratos emergenciais com a
[[Prefeitura de São Paulo]] entre 2023 e 2024.

## Resumo

Aparece como signatário em 3 contratos emergenciais de obras
públicas, todos envolvendo a zona leste de São Paulo...

:::annotation
status: unverified
source: contrato-01.pdf
page: 2
highlight: "João Silva, representante legal"
---
João Silva assinou o contrato #042 como representante legal
da Construtora XYZ.
:::

:::annotation
status: verified
source: contrato-03.pdf
page: 15
highlight: "procuração de João Carlos Silva"
---
João Silva também possui procuração registrada em cartório
para representar o Consórcio ABC.
:::
```

#### Groups (🏛️)

```markdown
---
type: group
name: Construtora XYZ
category: company
registration_id: "12.345.678/0001-99"
members: ["[[João Silva]]", "[[Maria Fernandes]]"]
first_seen_in: contrato-emergencial-042.pdf
tags: [construtora, obras-publicas, emergencial]
created: 2026-03-15T14:35:00Z
updated: 2026-03-15T16:20:00Z
---

# Construtora XYZ

Empresa de construção civil envolvida em múltiplos contratos
emergenciais com a [[Prefeitura de São Paulo]]...
```

Categories válidas para groups: `company`, `government`, `political_party`, `criminal_org`, `foundation`, `team`

#### Places (📍)

```markdown
---
type: place
name: Zona Leste de São Paulo
country: Brasil
city: São Paulo
coordinates: [-23.5505, -46.6333]
tags: [obras-publicas, ponte]
---

# Zona Leste de São Paulo

Local das obras emergenciais contratadas pelo contrato #042...
```

#### Timeline (📅)

```
dossier/timeline/
├── 2023/
│   ├── 2023-06.md
│   └── 2023-11.md
└── 2024/
    ├── 2024-03.md
    └── 2024-04.md
```

Cada arquivo mensal contém Event Blocks:

```markdown
---
type: timeline
year: 2024
month: 3
events_count: 2
tags: [licitacao, contrato]
---

# Março 2024

:::event
date: 2024-03-15
actors: [[Prefeitura de São Paulo]], [[Construtora XYZ]]
type: bid_opening
source: edital-042.pdf
---
Prefeitura de São Paulo abre licitação emergencial #042
para reparos em ponte na zona leste.
:::

:::event
date: 2024-03-22
actors: [[Construtora XYZ]], [[Consórcio ABC]]
type: bid_result
source: ata-resultado-042.pdf
follows: 2024-03-15/bid_opening
---
Construtora XYZ vence licitação #042 com proposta de
R$ 47M, 38% acima do segundo colocado (Consórcio ABC).
:::
```

### 3.2 Dossier Config

Arquivo `dossier/dossier.md` que define regras para o agente:

```markdown
---
type: dossier_config
language: pt-BR
---

# Configuração do Dossiê

## Regras para o Agente

1. Toda annotation deve ter source reference com página exata
2. Novas entidades devem ser criadas quando um nome aparece em 2+ sources
3. Groups devem sempre ter registration_id quando disponível
4. Timeline events devem ter campo follows quando houver relação causal
5. Use [[wikilinks]] para conectar entidades entre si
6. Tags devem ser lowercase, hyphenated, em português
```

---

## 4. Investigações e Pistas (Clues)

### 4.1 Estrutura

```
investigations/
└── corporate-cluster-hypothesis/
    ├── investigation.md
    └── clues/
        ├── company-x-3-contracts.md
        ├── inflated-price-lot-22.md
        └── same-root-cnpj.md
```

### 4.2 Investigation File

```markdown
---
type: investigation
title: Corporate Cluster Hypothesis
question: "Existe um cluster de empresas com mesmo dono que está vencendo licitações emergenciais de forma desproporcional?"
created: 2026-03-15T14:40:00Z
updated: 2026-03-16T10:00:00Z
status: active
tags: [empresas, licitacao, cluster]
---

# Corporate Cluster Hypothesis

## Questão Central
Existe um cluster de empresas com mesmo dono/CNPJ raiz que está
vencendo licitações emergenciais de forma desproporcional?

## Descrição
Análise inicial dos contratos emergenciais sugere que um grupo
de empresas aparentemente independentes compartilha o mesmo
CNPJ raiz e está concentrando contratos...

## Checklist
- [ ] Verificar CNPJs raiz de todas as vencedoras
- [ ] Comparar preços unitários com média de mercado
- [ ] Mapear representantes legais em comum
- [ ] Cruzar datas de abertura com regime emergencial
```

### 4.3 Clue File

```markdown
---
type: clue
investigation: Corporate Cluster Hypothesis
source: contrato-03.pdf
page: 87
status: verified
created: 2026-03-15T15:00:00Z
---

:::clue
status: verified
source: contrato-03.pdf
page: 87
highlight: "preço unitário R$ 4.200,00/m²"
investigation: Corporate Cluster Hypothesis
---
Preço unitário inflacionado no lote 22: R$ 4.200,00/m²
comparado à média de mercado de R$ 1.800,00/m².
:::
```

---

## 5. Bidirectional Links ([[Wikilinks]])

### 5.1 Como funcionam

Qualquer texto envolvido em `[[ ]]` cria um link bidirecional:
- `[[João Silva]]` → link para `dossier/people/joao-silva.md`
- `[[Construtora XYZ]]` → link para `dossier/groups/construtora-xyz.md`

### 5.2 Resolução de links

```typescript
async function resolveWikilink(name: string, db: Kysely<CapybaraDB>): Promise<string | null> {
  // 1. Buscar por nome exato no índice de entidades (SQLite via Kysely)
  const entity = await db
    .selectFrom('entities')
    .select('file_path')
    .where('name', '=', name)
    .executeTakeFirst()
  if (entity) return entity.file_path

  // 2. Buscar por aliases (JSON array search)
  const byAlias = await db
    .selectFrom('entities')
    .select('file_path')
    .where('tags', 'like', `%${name}%`)
    .executeTakeFirst()
  if (byAlias) return byAlias.file_path

  // 3. Retornar null (link quebrado — renderizar em vermelho)
  return null
}
```

### 5.3 Backlinks (Connections Block)

Renderizado automaticamente no final de cada entidade, investigation e clue:

```
── Connections ───────────────────────
📄 contrato-01.pdf (Source)
📄 contrato-03.pdf (Source)
🏛️ Construtora XYZ (Dossier)
📋 Corporate Cluster (Investigation)
💡 Inflated price lot 22 (Clue)
```

Backlinks são computados via query no SQLite (tabela `backlinks`) + scan de `[[ ]]` references.

**Variante para Sources:** Sources recebem um bloco especial "Dossier Connections" compilado a partir do campo `entities_mentioned` do `metadata.md`, mostrando quais entidades do dossiê (People, Groups, Places) estão vinculadas àquela source.

```
── Dossier Connections ──────────────
👤 João Silva (People)
🏛️ Construtora XYZ (Groups)
🏛️ Prefeitura de São Paulo (Groups)
📍 São Paulo, Zona Leste (Places)
```

**Regras de visibilidade completas:** ver `PRD-05-ui-interaction-screens.md` §6.4.

---

## 6. Rastreabilidade (Traceability)

### 6.1 Source Reference Links `→[source]`

Sintaxe inline para deep-linking ao documento original:

```markdown
João Silva assinou o contrato como representante legal.
→[contrato-01.pdf, p.2, "João Silva, representante legal"]
```

O renderer exibe como badge clicável que abre o documento original na página exata.

### 6.2 Fluxo de Verificação

```
Annotation/Clue criada pelo agente
    │
    ▼ status: unverified (default)
    │
    ├──► Jornalista clica →[source] → vê original highlighted
    │
    ├──► Hover → [✓ Verify] [✕ Reject]
    │
    ├──► ✓ → status: verified (persiste em .md)
    └──► ✕ → status: rejected (persiste em .md, strikethrough)
```

### 6.3 Persistência de Status

Quando o usuário muda o status, o renderer atualiza o campo `status` no bloco `:::annotation` ou `:::clue` do arquivo `.md` no disco via IPC.

---

## 7. Graph View

### 7.1 Tecnologia

**`react-force-graph` (2D)** — Force-directed graph com Canvas/WebGL rendering.

### 7.2 Dados do Grafo

O grafo é construído a partir de:

| Fonte de dados | Nós gerados | Arestas |
|---------------|-------------|---------|
| `dossier/people/*.md` | 👤 People nodes | `[[links]]` → edges |
| `dossier/groups/*.md` | 🏛️ Group nodes | `[[links]]` → edges |
| `dossier/places/*.md` | 📍 Place nodes | `[[links]]` → edges |
| `sources/*/metadata.md` | 📄 Source nodes | `entities_mentioned` → edges |
| `investigations/*/investigation.md` | 🔍 Investigation nodes | `[[links]]` → edges |
| `investigations/*/clues/*.md` | 💡 Clue nodes | `source` + `investigation` → edges |

### 7.3 Zustand Store — Graph

```typescript
interface GraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  filters: {
    types: Set<EntityType>
    tags: Set<string>
    highlightColor: Map<string, string>
  }
  focusedNodeId: string | null

  buildGraph: (workspace: Workspace) => void
  setFilter: (type: EntityType, enabled: boolean) => void
  focusNode: (nodeId: string) => void
}
```

### 7.4 Widget Flutuante

- Posição: bottom-right do Viewer
- Mostra apenas nós relacionados à página atual
- Semi-transparente, opaco no hover
- Colapsável para ícone `◉`
- "ON THIS PAGE" lista backlinks como texto clicável
- Botão "⤢ Expand" abre fullscreen

### 7.5 Fullscreen

- Substitui o conteúdo do Viewer
- Mostra TODOS os nós do workspace
- Filtros por tipo de entidade (checkboxes)
- Color coding por tipo + tags custom
- Zoom, pan, drag
- Clicar num nó → navegar para entidade e sair do fullscreen

---

## 8. Contratos com Outros Domínios

### ← Consome de Sources
- `metadata.md` → `entities_mentioned` para criar/atualizar entidades
- `metadata.md` → `dates_found` para criar events na Timeline
- Campos `source` e `page` em annotations e clues referenciam Sources

### ← Consome de Workspace & Infra
- SQLite para indexação de entidades, backlinks, busca
- File system para CRUD de arquivos de dossiê
- File watcher para detectar mudanças em arquivos do dossiê

### → Produz para Chat & Agent
- Menção `@dossier/people/João` carrega arquivo da entidade
- Menção `!Corporate Cluster` carrega investigation + clues
- Backlinks e entities alimentam o contexto do agente

### → Produz para Capybara Markdown (Renderer)
- Frontmatter com schema padronizado para rendering
- Blocos `:::annotation`, `:::clue`, `:::event` para rendering custom
- `[[wikilinks]]` para navegação
- `→[source]` para rastreabilidade

### → Produz para UI & Interaction (PRD-05)
- Dados para Graph View widget e fullscreen
- Verification status toggle (hover-based) — ver PRD-05 §7
- Dados para Connections Block e Dossier Connections — ver PRD-05 §6.4
- Templates de viewer por content type — ver PRD-05 §6.3

---

## 9. Dependências Específicas

```json
{
  "dependencies": {
    "react-force-graph-2d": "^1.25"
  }
}
```

O graph é a única dependência específica deste domínio. Resolução de wikilinks, backlinks e rastreabilidade são implementados com SQLite (do domínio Infra) + plugins do unified ecosystem (do domínio Markdown).
