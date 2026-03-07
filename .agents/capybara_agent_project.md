# Capybara Agent Project

Criado por: Manoel Brasil Orlandi
Criado em: March 5, 2026 10:29 AM
Última atualização em: March 6, 2026 9:23 PM

**Capybara Agent** is an open source desktop application that uses LLMs agentically to support and develop journalistic investigations.

## Overview

Capybara Agent helps journalists process raw, unstructured information and turn it into organized, traceable investigative work, while always keeping a clear path back to the original sources. The project is built using Electron.js to operate as a local application, ensuring sensitive data remains on the user's machine, reducing costs, and making it widely accessible across different platforms to facilitate easy installation.

## Core Features

### 1. Workspace Setup & AI Provider Flexibility

Capybara Agent allows journalists to configure their workspace and customize the agent according to their specific investigative needs. It does not lock you into a single AI provider, offering complete flexibility to decide which models to use. You can choose the LLM and provider that best fits your needs, budget, or privacy requirements, whether that is OpenAI, Anthropic, a local model, or any other supported backend.

- **Isolated Workspaces ("Investigation Desk"):** Similar to an Obsidian Vault, users can create dedicated, isolated environments for each investigation. Each workspace operates entirely independently, maintaining its own dedicated dossier, list of investigative lines, source repository, and specific configurations. Switching environments means completely stepping out of one investigation and into another.
- **Streamlined OpenRouter Integration (Testing Phase):** To facilitate rapid testing and ease of use in the initial versions, the setup is radically simplified. Users only need to provide a single **OpenRouter API Key**. While future versions will feature robust authentication and direct multi-provider setups, this approach grants immediate access to a vast array of models.
- **Task-Specific Model Routing:** To optimize both cost and performance, the agent divides its cognitive workload across three distinct types of AI models:
    - **Data Processing & OCR:** Handles the heavy lifting of parsing PDFs, extracting text, and generating source metadata. We recommend highly efficient, low-cost models for this. Defaults: **Gemini 2.5 Flash Lite** or **Mistral OCR** (via OpenRouter).
    - **Writing & Summarization:** Dedicated to drafting Markdown documents, structuring the dossier, and writing summaries. Default: **Gemini 3 Flash**.
    - **Reasoning & Strategy:** The core engine for generating complex investigative lines, strategic planning, and deep analysis. Default: **Gemini 3 Pro (with Reasoning)**.


### 2. Sources: Document Transformation, Formatting & Metadata Enrichment

Capybara Agent ingests different types of sources and converts them into structured, workable formats. Contracts, reports, chat logs, photographs, transcriptions: regardless of how messy or unstructured the input is, the agent parses and reformats it for investigative use, making it ready to be connected to the Dossier and Graph View.

- **The Source Architecture:** To ensure the AI and the user can easily understand and decide if a document is relevant to the investigation context, every ingested source is organized into a clear, multi-file structure:
    - **Original Document:** The raw, untouched file.
    - `preview.md`: A lightweight, AI-generated summary that gives a quick overview of what the document is about, helping the agent and the journalist decide whether to pull it into the active context.
    - `metadata.md`: A structured file containing all the enriched metadata, recognized entities, tags, and descriptions. This file acts as the bridge that connects the source to the Dossier and the Graph View.
    - `replica.md` (Specifically for PDFs): Called a **Replica**, this is a faithful page-by-page Markdown reproduction of the original PDF. The name reflects its purpose: to create a perfect reading mirror of the original document in Markdown, preserving layout and pagination for accurate reading and citation. Replicas are never edited; they always mirror the original.
- **Progressive Metadata Enrichment:** Sources are progressively enriched with metadata as the AI works on them. For example, if a photograph is ingested, the AI can detect important elements within the image and add that specific context to the description. This metadata directly feeds into the Dossier and Graph View to map connections.
- **Transparent Metadata Interaction:** To avoid a "black box" scenario, journalists have full visibility into what the AI is writing in the `metadata.md` file. While they cannot edit the metadata directly by typing, they can interact with the AI and ask it to alter, correct, or update the metadata based on their feedback.
- **Selective Processing:** Heavy processing is reserved for images and PDFs. Text-based documents like code, emails, `.txt`, HTML, `.doc`, and Markdown are preserved in their original format but are enriched with the standard metadata and preview structures.
- **Bulk Organization & Processing:** Users can select documents in bulk, organize them into folders, and trigger mass processing while monitoring the progress of the entire batch.
- **Processing Status & Transparency:** The interface clearly displays the status of each document (e.g., unprocessed, processing, complete) and provides upfront and real-time feedback on estimated costs and time required for the task.
- **Contextual Chat Integration:** When a source or folder is mentioned in the chat simply by using an `@`, the agent retrieves the entire folder context (including the `preview.md` and `metadata.md`). For PDFs, it specifically sends the `replica.md` to the AI to ensure fast and accurate analysis.
- **Autonomous Agent Workflows:** The agent is equipped with specific tools and workflows that allow it to autonomously understand when it needs to process a file or generate metadata to advance its investigative strategy.

### 3. Custom & Autonomous Investigative Lines

Journalists can create and write their own investigative lines to guide the agent, customizing exactly how they want the AI to work. Alternatively, they have the option to let the agent autonomously create a strategy to find clues and develop investigative lines on its own. This allows the system to collect evidence and clues for these investigations, keeping everything organized in a single centralized place.

- **Investigative Hypotheses Area:** A dedicated workspace where journalists can organize their investigative lines, representing the core hypotheses they are exploring. These lines start with general questions, break down into sub-questions, and require a specific planning process.
- **Clues Management:** The planning process within an investigative line generates "Clues". Similar to investigative annotations, clues are based on concrete facts and must be directly connected to a readable, searchable original source document. Clues also feature a verification status (e.g., verified, unverified, or rejected).
- **Manual Line Creation:** Journalists have full control to manually create investigative lines. They can define a central question, set a title based on that question, write a description, and create a checklist of specific items to investigate.
- **AI-Suggested Lines:** If the journalist needs inspiration or a starting point, they can prompt the AI to suggest investigative lines. The agent will then autonomously analyze the available documents (like contracts or reports) and return a list of suggested hypotheses, structured in Markdown with relevant metadata.
- **Chat Integration via Mentions:** Investigative lines are deeply integrated into the workflow. Journalists can instantly pull up and reference any investigative line directly within the chat interface simply by using an exclamation mark (`!`) to search and mention it.

### 4. Investigative Dossiers

Capybara Agent creates dossiers that consolidate the most important points of an investigation. Inspired by Obsidian, dossiers are written in standard Markdown with custom extensions to organize all collected information. They feature Graph View support, where users can visualize nodes and explore how people, places, and things connect within the universe of the investigation. They can be easily visualized directly within the desktop application.

- **Dedicated AI-Managed Environment:** Dossiers live in a separate, structured environment of folders and Markdown files. Initially, this area is strictly managed and organized by the AI, meaning journalists cannot edit these files directly, ensuring structural integrity.
- **Dossier Configuration File:** A core `dossier.md` file dictates the instructions and rules for how the agent should structure and organize the information.
- **Standardized Entity Structures:** The dossier automatically organizes data into four standard entity types:
    - **People (👤):** Folders for individuals containing metadata (IDs, categories, classifications like 'politician' or 'celebrity'), summaries, and investigative annotations.
    - **Groups (🏛️):** Folders for any collective entity: companies, government bodies, political parties, criminal organizations, foundations, or teams. Each group has a `category` field in its frontmatter that specifies the subtype (e.g., `company`, `government`, `political_party`, `criminal_org`, `foundation`, `team`), allowing the renderer and Graph View to display appropriate icons and badges.
    - **Places (📍):** A geographic hierarchy containing subfolders for countries, cities, and specific locations or addresses.
    - **Timeline (📅):** A chronological organization system with folders for each year and Markdown files for each month. Each month file contains structured **Event Blocks** (`:::event`) that log discrete actions with their actors, consequences, and source references, forming traceable cause-and-effect chains.
- **Investigative Annotations:** A foundational concept where the AI creates specific notes that affirm or update a fact. Every annotation must be strictly linked to its original source document and includes a verification status (e.g., checked, unverified, or rejected by the journalist).
- **Web Enrichment Shortcuts:** Within any dossier file, users can trigger a shortcut command that asks the agent to search the internet for more information about that specific entity (person, group, city, etc.). This action automatically opens the chat with the web search command enabled and the dossier entity tagged, prompting the AI to enrich the file and create a more comprehensive summary.
- **Direct Chat Citations:** Dossiers are deeply integrated with the chat. Users can mention the dossier by simply typing `@dossier/` and choosing the specific type of information (e.g., `@dossier/people/John`). This allows journalists to quickly search, retrieve data, and make direct citations from the dossier right in the middle of a chat conversation.
- **Obsidian-Style Bidirectional Linking (`[[ ]]`):** The system uses bidirectional links to map out connections across the dossier. By wrapping text in double brackets (e.g., `[[John Doe]]` or `[[Contract A]]`), users and the AI create direct references between documents. If a name appears in multiple files, linking them ties everything to a single entity. These mentions automatically generate the nodes and edges used to visualize the network.

### 5. Interactive Project Graph View

Powered by the bidirectional linking from the dossiers, the Graph View is an interactive, Obsidian-style visual representation that connects all data points of the project, creating a comprehensive Knowledge Graph of the entire investigation. It allows journalists to visually explore how people, companies, places, and documents intersect, making it easier to spot hidden patterns and complex networks.

- **Dossier Node Organization:** The graph automatically organizes nodes based on the dossier's folder structure. Different entities become distinct types of nodes (e.g., *People*, *Places*, and *Groups*), allowing for a structured and easily readable network.
- **Source Connectivity & Metadata:** Original sources are also represented as nodes in the graph. The metadata generated during the document processing phase (such as mentioned people or locations) acts as the bridge, automatically drawing connections between raw source documents and the structured dossier entities.
- **Investigative Lines & Clues Integration:** The graph goes beyond entities and sources by fully integrating the investigative workflow. *Investigative Lines* and specific *Clues* are plotted as nodes, visually mapping out how a hypothesis connects to the actual evidence and the entities involved.
- **Visual Customization & Tagging:** Users have full control over the visual presentation of the graph. They can classify nodes by color, apply specific highlights based on tags, and filter the view to focus only on relevant information (e.g., highlighting all nodes tagged as "politician" or color-coding specific companies).

### 6. Source Indexing & Traceability

Every piece of work Capybara Agent produces is indexed and connected back to its original sources. This traceability is directly applied when stating facts in the dossiers and logging clues found during the investigative lines, always linking these points back to the original documents. This allows journalists to easily review the context. Additionally, all materials and claims can be manually verified, and the user can assign a status to each item (such as checked, unverified, or discarded).

- **Precise Backtracking:** Whenever an investigative annotation is made in a dossier or a clue is added to an investigative line, the system provides exact backtracking to where the information originated.
- **Original Source Highlighting:** Similar to tools like NotebookLM, traceability links point not just to the file, but to the exact location where the fact is mentioned, allowing the user to see the specific text highlighted within the original PDF or document.
- **Original vs. Processed Context:** The workflow strictly distinguishes between the original file and its processed metadata or Markdown versions. Even though the AI relies on the processed files and metadata to connect the dots and draw conclusions, the traceability reference **always** directs the journalist to the original, raw file for verification.
- **Manual Verification Status:** All facts, clues, and claims can be manually verified by the journalist, who can assign specific statuses to each item (e.g., checked, unverified, or rejected) to maintain the rigorous integrity of the investigation.

### 7. Interactive Chat Interface

The application features an interactive chat interface that connects seamlessly to the entire investigation ecosystem. Through the chat, journalists can tag specific files, define lines of investigation, and have a dynamic conversation where files and information are returned. It provides full transparency, allowing the user to clearly see exactly what the agent is doing, its current tasks, and what modifications are being made in real-time.

- **Streamlined Conversational UX:** The chat functions like modern AI interfaces. Users can easily type prompts and drag-and-drop files. The AI's responses are generated in real-time (streaming), beautifully formatted in Markdown to make complex investigative data easy to read and understand.
- **Continuous AI Feedback:** The agent constantly provides feedback on its actions, clearly outlining the step-by-step process it is following to reach a conclusion or complete a task.
- **Real-Time Modification Tracking:** Similar to tools like Cursor, the interface visually displays exactly what the AI changed. Users can instantly see if a file in the dossier was edited, if new investigative annotations were added, or if new clues were attached to an investigation line.
- **Slash Commands (`/`):** Users can type `/` to access a menu of typical AI commands and actions, streamlining the workflow.
- **Source Context via Mentions (`@`):** By using `@`, journalists can connect specific context to the chat:
    - `@source`: Mentions an original investigation file. Crucially, this pulls in not just the raw file, but all its supporting metadata. For PDFs, the AI receives the finalized `.md` processed version instead of the heavy PDF.
    - `@dossier`: Allows the user to mention specific dossier folders (like People, Groups, Timeline) or pinpoint specific Markdown files within the dossier.
- **Investigative Line Context (`!`):** Using an exclamation mark (`!`) allows the user to search and pull an entire investigative line directly into the chat's context, forcing the AI to focus its actions on that specific hypothesis.
- **Operating Modes:** The chat can operate in three distinct modes, giving the journalist control over the AI's autonomy:
    - **Question Mode:** The AI acts purely as a consultant. It figures out where to search to answer the user's question, but it *will not* create, modify, or delete any files or annotations.
    - **Planning Mode:** The AI formulates a detailed plan of action (what it intends to search, process, or modify) and waits for the user's approval before executing.
    - **Agent Mode:** The AI takes full autonomous control. It executes plans, modifies dossier files, creates clues, writes investigative annotations, and even processes new files if necessary to advance the investigation.
- **Encouraging Source Centralization:** While users *can* drag and drop files directly into the chat, the interface actively encourages and guides them to place all files into the "Sources" database first. This ensures all materials go through the proper transformation and traceability pipeline.
- **Session & Context Management:** Users can easily create new chat sessions or reset the current context to start a fresh line of inquiry. The interface features a real-time token counter displaying the current context size. While the system supports massive context windows (up to 1,000,000 tokens, depending on user preference and the selected model), the default maximum is set to 150k (150,000) tokens to optimize performance and cost.
- **Context Summarization:** To manage extensive investigations, users can use a `/summarize` command to compress the active context. When the conversation approaches the 150k token limit, the UI proactively displays a suggestion and a one-click button prompting the user to summarize the chat, freeing up token space while retaining essential investigative knowledge.

### 8. Specialized Investigative Agent

Capybara Agent is powered by an agentic AI specialized in investigative journalism tasks. The AI is equipped with multiple tools, commands, and skills, executing workflows designed specifically for journalistic exploration. The agent autonomously conducts research, extracts data, organizes information into dossiers, and performs strategic planning to help journalists seamlessly explore their source base. Inspired by how coding agents like Claude Code and Codex operate, the agent follows an agentic loop: it receives a task, plans, selects and executes the right tools, observes the results, and iterates until the objective is complete.

- **Reading & Navigation Tools:** Tools that allow the agent to read sources, dossier files, investigative lines, and list workspace contents to understand the current state of the investigation.
- **Writing & Editing Tools:** Tools for creating, editing, moving, and deleting Markdown files across the workspace, enabling the agent to build and maintain dossiers, write annotations, and organize information.
- **Dossier Organization & Formatting Tools:** Tools for structuring and maintaining the dossier file system, including creating entity folders (people, groups, places), generating and updating standardized Markdown templates, organizing timeline entries, formatting raw information into the dossier's conventions, and keeping the overall folder hierarchy clean and consistent.
- **Traceability & Verification Tools:** Tools for attaching source references to every annotation and clue, linking claims back to exact locations in original documents, cross-referencing facts across multiple sources to check for consistency, updating verification statuses (checked, unverified, rejected), and flagging contradictions or unsupported claims for the journalist to review.
- **Entity Connection & Graph Tools:** Tools for creating and managing links between dossier entities (person to group, person to place, group to event), updating the relationship graph, detecting implicit connections across sources, and maintaining the data that powers the Graph View visualization.
- **Investigative Action Tools:** Specialized tools for adding investigative annotations, creating and managing clues, creating new investigative lines, updating source metadata, and advancing the overall investigative strategy.
- **Document Processing Tools:** Tools for triggering PDF-to-Markdown extraction, processing images via OCR/vision, generating metadata from raw documents, and estimating costs before executing batch operations. This processing is performed with the help of LLMs themselves, breaking down files into chunks and sending them to models specifically optimized for document processing tasks.
- **Web Research Tools:** Tools that allow the agent to search the web, scrape public pages, and enrich dossier entities (people, groups, places) with publicly available information, always marking new findings as unverified and citing the original URLs.
- **Planning & Reasoning Tools:** Tools for creating structured action plans, reflecting on progress and identifying gaps, suggesting new investigative lines based on available evidence, and summarizing large sets of information into concise overviews.
- **Built-in Helper Commands:** To assist journalists with repetitive tasks, the agent features quick slash commands:
    - `/create_line`: The user briefly describes their hypothesis, and the agent helps structure and formally create a new Investigative Line.
    - `/check_annotations`: The agent reviews and cross-checks the information within investigative annotations to ensure accuracy and consistency with the sources.
    - `/summarize`: Compresses the active chat context to reduce token usage while retaining essential investigative knowledge.
    - `/web_search`: Directs the agent to perform live internet searches to obtain external information and facts outside the local source base.

### 9. Capybara Markdown: Custom Markdown Dialect & Renderer

Capybara Agent uses its own extended Markdown dialect, purpose-built for investigative journalism. Rather than being a generic Markdown editor, the application is a **specialized Markdown interpreter and viewer** that renders standard Markdown beautifully while introducing custom block types, metadata conventions, and linking primitives designed specifically for organizing, connecting, and verifying investigative material. Every `.md` file in the workspace follows this dialect, and the viewer knows how to parse and render all of its extensions into a polished, interactive read-only interface.

- **Styled Markdown Rendering:** All Markdown files are rendered with clean typography, proper spacing, and theme-aware colors (Catppuccin Latte/Frappé). The renderer handles standard elements (headings, lists, tables, code blocks, blockquotes, images) with a documentation-site aesthetic inspired by Mintlify and Docusaurus, optimized for long reading sessions.
- **Bidirectional Links (`[[ ]]`):** The dialect supports Obsidian-style wikilinks. Wrapping any entity name in double brackets (e.g., `[[João Silva]]`, `[[Construtora XYZ]]`) creates a clickable navigation link that connects to the corresponding dossier entity. These links are the foundation of the Graph View: every `[[ ]]` reference automatically generates a node and an edge in the knowledge graph.
- **YAML Frontmatter Metadata Block:** Every `.md` file begins with a structured YAML frontmatter section that the renderer parses and displays as a formatted header card. The frontmatter schema varies by file type (source, dossier entity, investigation, clue) but always includes fields like `type`, `created`, `updated`, and `tags`. This metadata is what powers search, filtering, and the Graph View's node classification.
- **Investigative Annotation Block (`:::annotation`):** A custom fenced block for facts the AI has extracted and affirmed. Each annotation includes a **source reference** pointing to the exact location in the original document, a **verification status** (`unverified`, `verified`, `rejected`) that the user can toggle directly via hover interaction, and a **text body** describing the fact. The renderer displays these as visually distinct cards with status badges and clickable traceability links.

```markdown
:::annotation
status: unverified
source: contrato-01.pdf
page: 2
highlight: "João Silva, legal representative"
---
João Silva signed contract #042 as the legal representative of Construtora XYZ.
:::
```

- **Clue Block (`:::clue`):** Similar in structure to the Investigative Annotation block, but used inside Investigative Lines to log specific pieces of evidence. Clues also carry a **verification status** and a **source reference**, and they are visually rendered as evidence cards. The key difference is that clues are always attached to an investigative line, while annotations live inside dossier entities.

```markdown
:::clue
status: verified
source: contrato-03.pdf
page: 87
highlight: "unit price R$ 4.200,00/m²"
investigation: Corporate Cluster Hypothesis
---
Inflated unit price on lot 22: R$ 4.200,00/m² compared to the market average of R$ 1.800,00/m².
:::
```

- **Event Block (`:::event`):** A custom fenced block used inside Timeline files to log discrete, timestamped actions. Each event records **what happened**, **who was involved** (via `[[ ]]` actor links), the **event type**, and a **source reference**. Critically, events support a `follows` field that links one event to a prior event, creating explicit **cause-and-effect chains** across the timeline. The renderer displays events as a mini visual timeline within monthly files, with actor links feeding directly into the Graph View.

```markdown
:::event
date: 2024-03-15
actors: [[Prefeitura de São Paulo]], [[Construtora XYZ]]
type: bid_opening
source: edital-042.pdf
---
Prefeitura de São Paulo opens emergency bid #042
for bridge repairs in the east zone.
:::

:::event
date: 2024-03-22
actors: [[Construtora XYZ]], [[Consórcio ABC]]
type: bid_result
source: ata-resultado-042.pdf
follows: 2024-03-15/bid_opening
---
Construtora XYZ wins bid #042 with a proposal of
R$ 47M, 38% above the runner-up (Consórcio ABC).
:::
```

- **Source Reference Links (`→[source]`):** A custom inline syntax for deep-linking back to original documents. Unlike standard Markdown links, source references encode not just the file path but also the **exact location** within the original document (page number, paragraph, or highlighted text span). The renderer displays these as small clickable badges that open the original file at the precise location, similar to academic citation links.

```markdown
João Silva signed the contract as legal representative.
→[contrato-01.pdf, p.2, "João Silva, legal representative"]
```

- **Connections Block (auto-generated):** The renderer automatically appends a Connections section at the bottom of every dossier entity, investigation, and clue file. This block is not written manually in the Markdown source; instead, the renderer scans all `[[ ]]` references across the workspace and compiles a reverse-lookup list of every file that mentions the current entity. This is the Markdown-native implementation of backlinks. For **Sources**, a dedicated "Dossier Connections" section is also rendered, compiled from the `entities_mentioned` field in `metadata.md`, showing which dossier entities (People, Groups, Places) are linked to that source.
- **Entity Type Icons & Badges:** The frontmatter `type` field determines an icon prefix that the renderer displays next to the document title (e.g., `👤` for People, `🏛️` for Groups, `📍` for Places, `📄` for Sources, `🔍` for Investigations, `💡` for Clues, `📅` for Events). For Groups, the icon can vary by `category` (e.g., `🏢` company, `🏛️` government, `⚖️` political party). Tags from the frontmatter are rendered as colored badges below the title.
- **Table of Contents Generation:** For documents with three or more headings, the renderer automatically generates a collapsible "In this document" sidebar or top block, allowing quick navigation within long files. This is especially useful for `replica.md` files that can span hundreds of pages.
- **Verification Status Rendering:** The `status` field inside `:::annotation` and `:::clue` blocks is rendered as an interactive element. Unlike all other content in the viewer (which is strictly read-only), the verification status is the **one thing the user can directly toggle**. On hover, the renderer reveals `[✓ Verify]` and `[✕ Reject]` buttons. The status change is persisted back to the `.md` file on disk.
- **Consistent Metadata Schema per File Type:** The dialect enforces specific frontmatter schemas depending on the document type. This ensures the AI always writes metadata in a predictable structure, making it easy for both the renderer and the agent to parse, query, and cross-reference information across the workspace.

| File type | Required frontmatter fields |  |  |
| --- | --- | --- | --- |
| Source (preview) | `type`, `original_file`, `format`, `pages`, `processed_at`, `tags`, `summary` |  |  |
| Source (metadata) | `type`, `original_file`, `entities_mentioned`, `dates_found`, `locations`, `tags` |  |  |
| Dossier entity (Person) | `type: person`, `name`, `aliases`, `category`, `first_seen_in`, `tags` |  |  |
| Dossier entity (Group) | `type: group`, `name`, `category`, `registration_id`, `members`, `first_seen_in`, `tags` |  |  |
| Dossier entity (Place) | `type: place`, `name`, `country`, `city`, `coordinates`, `tags` |  |  |
| Investigation | `type: investigation`, `title`, `question`, `created`, `updated`, `status`, `tags` |  |  |
| Clue | `type: clue`, `investigation`, `source`, `page`, `status`, `created` |  |  |
| Timeline entry | `type: timeline`, `year`, `month`, `events_count`, `tags` |  |  |
| Event | `type: event`, `date`, `actors`, `event_type`, `source`, `follows`, `tags` |  |  |

## Philosophy

Capybara Agent is built on the premise that investigative journalism requires not just powerful tools, but **transparent, reproducible, and accessible ones**. The agent does the heavy lifting, but the journalist always stays in control, with full visibility into how every conclusion was reached.

Being open source means that anyone can inspect, contribute to, and improve Capybara Agent. Journalism tools should be as accountable as the journalism they support.

# Design System

Capybara Agent uses **shadcn/ui** as its component layer, running inside Electron's renderer process (which is essentially a standard web app on Chromium). The difference between a regular web app and an Electron app is mostly about packaging, security boundaries, and access to native APIs, not about how shadcn works.

The application uses a custom theme called **Capybara 0**, built with [tweakcn](https://tweakcn.com/themes/cmmfid9kr000104jufj121z63) and distributed as a shadcn registry item.

### Theme Characteristics

- **Fonts:** IBM Plex Sans Thai (sans), IBM Plex Mono (mono), IBM Plex Sans JP (serif)
- **Border radius:** `0rem` (sharp corners throughout)
- **Spacing:** `0.25rem` base
- **Shadows:** Flat, minimal shadow system
- **Color system:** OKLCH-based, with full light and dark mode token sets

### Color Palette (Light Mode)

| Token | Role | OKLCH Value |
| --- | --- | --- |
| `primary` | Main actions, sidebar highlights | `oklch(0.6654 0.1594 292.40)` (purple) |
| `secondary` | Secondary actions, badges | `oklch(0.7805 0.1302 204.30)` (teal) |
| `accent` | Highlights, sidebar accent | `oklch(0.8744 0.1610 95.58)` (yellow) |
| `destructive` | Errors, rejected status | `oklch(0.7621 0.1182 33.38)` (red-orange) |
| `background` | Page background | `oklch(1.0 0 0)` (white) |
| `foreground` | Primary text | `oklch(0 0 0)` (black) |
| `muted` | Subtle backgrounds | `oklch(0.9551 0 0)` (light gray) |
| `border` | All borders | `oklch(0 0 0)` (black) |

### Color Palette (Dark Mode)

| Token | Role | OKLCH Value |
| --- | --- | --- |
| `primary` | Main actions, sidebar highlights | `oklch(0.8649 0.0662 289.71)` (soft purple) |
| `secondary` | Secondary actions, badges | `oklch(0.8072 0.1090 201.16)` (teal) |
| `accent` | Highlights, sidebar accent | `oklch(0.9594 0.1242 105.56)` (bright yellow) |
| `destructive` | Errors, rejected status | `oklch(0.8703 0.0632 32.98)` (soft red) |
| `background` | Page background | `oklch(0 0 0)` (black) |
| `foreground` | Primary text | `oklch(1.0 0 0)` (white) |
| `card` | Card and popover surfaces | `oklch(0.2639 0.0306 273.31)` (dark blue-gray) |
| `border` | All borders | `oklch(0.4459 0 0)` (medium gray) |

### Installation

Apply the theme via the shadcn CLI:

```bash
pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/cmmfid9kr000104jufj121z63
```

This injects the CSS variable tokens into the project's global stylesheet (typically under `:root` for light mode and `.dark` for dark mode) and updates shadcn configuration files.

To preview the theme visually: [tweakcn.com/themes/cmmfid9kr000104jufj121z63](http://tweakcn.com/themes/cmmfid9kr000104jufj121z63)

## Installing Components

Components are installed on demand using the shadcn CLI v4. They are copied into the project as editable source files (not installed as a package dependency), which allows full customization.

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add scroll-area
```

Components land in `src/renderer/components/ui/`. Product-level components (composed from shadcn primitives) live in `src/renderer/components/app/`.

To inspect what a component will add before installing:

```bash
pnpm dlx shadcn@latest add button --dry-run
pnpm dlx shadcn@latest add button --diff
```

## Light/Dark Mode Switching

shadcn/ui switches themes by toggling the `dark` class on the root `<html>` element. The renderer handles this with a simple utility:

```tsx
// src/renderer/lib/theme.ts
export function setTheme(mode: "light" | "dark") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(mode)
}
```

### Persisting Theme Preference (Electron Store + IPC)

To persist the user's theme choice across sessions:

**Main process** (storage layer):

- Uses `electron-store` (or a JSON file on disk) to persist preferences
- Exposes `getTheme` and `setTheme` handlers via IPC

**Preload** (secure bridge):

- Exposes `window.settings.getTheme()` and `window.settings.setTheme(mode)` via `contextBridge`

**Renderer** (UI layer):

- Calls `getTheme()` on startup and applies the class
- When the user toggles the theme, updates the DOM class and calls `setTheme()` to persist

This pattern keeps Node.js APIs out of the renderer entirely.

## Typography: Bundling IBM Plex Locally

The Capybara 0 theme specifies IBM Plex as its font family. For a desktop application, fonts should be **bundled locally** rather than loaded from Google Fonts:

- Works offline
- Eliminates network-dependent rendering
- Prevents font flash (FOUT)

### Setup

1. Place `.woff2` font files in `src/renderer/assets/fonts/`
2. Declare `@font-face` rules in the global stylesheet:

```css
/* src/renderer/styles/globals.css */
@font-face {
  font-family: "IBM Plex Sans Thai";
  src: url("../assets/fonts/IBMPlexSansThai-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Sans Thai";
  src: url("../assets/fonts/IBMPlexSansThai-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Mono";
  src: url("../assets/fonts/IBMPlexMono-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

1. The theme's CSS variables (`--font-sans`, `--font-mono`, `--font-serif`) already reference these families, so Tailwind picks them up automatically.

## Electron-Specific UI Considerations

### Custom Window Frame & Drag Regions

Capybara Agent uses a **frameless window** (no native title bar). This requires explicit drag region management:

```css
/* The top header bar is draggable (allows window movement) */
.titlebar {
  -webkit-app-region: drag;
}

/* All interactive elements inside the header must opt out */
.titlebar button,
.titlebar input,
.titlebar [role="menuitem"] {
  -webkit-app-region: no-drag;
}
```

This is critical for shadcn components placed inside the header area (buttons, mode toggles, dropdowns). Without `no-drag`, click events will be swallowed by the drag handler.

### Scrollbars

Electron inherits Chromium's default scrollbars. For a polished look, use shadcn's `ScrollArea` component (built on Radix) to provide styled, consistent scrollbars across the sidebar, viewer panels, and chat.

### Context Isolation & Security

The renderer runs with `contextIsolation: true` and `nodeIntegration: false`. All communication with the filesystem, AI providers, and workspace data happens through IPC channels exposed via the preload script. The UI layer (shadcn components, React state) never touches Node.js APIs directly.

## Component Architecture

The component hierarchy follows a two-tier pattern:

### Tier 1: shadcn/ui primitives (`src/renderer/components/ui/`)

Installed directly from the shadcn registry. These are low-level building blocks:

- `Button`, `Input`, `Dialog`, `DropdownMenu`, `Tabs`, `Badge`, `Checkbox`, `ScrollArea`, `Tooltip`, `Sidebar`, `Popover`, `Separator`

### Tier 2: Product components (`src/renderer/components/app/`)

Composed from Tier 1 primitives, tailored to Capybara Agent's specific UI patterns:

- `AppSidebar` (file tree with status badges, drop zone, and processing status feed)
- `ViewerPanel` (Markdown renderer with breadcrumb navigation)
- `ChatPanel` (message area, mode toggle, context bar, input with autocomplete)
- `GraphFloatingWidget` / `GraphFullscreen` (force-directed graph visualization)
- `VerificationToggle` (hover-based status toggle for clues/annotations)
- `ActionPill` (clickable modification badges in chat)
- `TokenCounter` (real-time context size display)
- `ModeToggle` (Q/P/A mode selector, inside Chat Panel)
- `SourceCard` (file entry with processing status badge)
- `ConnectionsBlock` (backlinks section for dossier entities)

---

# User Interface Specification

## Design Philosophy & References

Capybara Agent's interface draws from four main references:

- **Obsidian** for the sidebar file tree, the Graph View visualization, and the read-only Markdown viewer. The application is not an editor. It is a *viewer* with an AI chat layer on top.
- **Notion** for workspace organization and navigation style. Instead of stacked horizontal tabs, pages open one at a time in the viewer area, similar to how Notion handles page navigation. Notion's chat panel layout also inspires how the AI panel is organized on the right side, keeping everything clean and accessible.
- **Cursor / Claude Code** for the always-present chat panel, real-time agent feedback, and the concept that every action flows through the chat. The chat's internal functionality (streaming responses, action pills, slash commands, context mentions) is inspired by Cursor.
- **Documentation sites** (Mintlify, Docusaurus) for the clean rendering of long Markdown documents, table of contents, and backlink sections.

The application is **desktop-only** (Electron.js). 

## Master Layout

The screen is divided into three persistent zones:

```jsx
┌──────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │            [Viewer Area]                    │  [Chat]  │
│ collapsible│  Single page view (Notion-style)             │  fixed   │
│  ~260px    │  flex (grows/shrinks)                        │  ~380px  │
│            │  + floating Graph View (bottom-right)        │expandable│
└──────────────────────────────────────────────────────────────────────┘
```

- **Sidebar (left):** Collapsible via `Cmd+B` or a hamburger icon. Contains the file system tree, a drag-and-drop area for uploading files with real-time processing status, and the Graph View shortcut in the footer. When collapsed, the viewer and chat take the full width.
- **Viewer Area (center):** The main content area. Displays one page at a time (Notion-style navigation, no horizontal tabs). The **Graph View** floats as a compact widget in the bottom-right corner. For investigation and case views, a **contextual action bar** appears at the top of the viewer with relevant actions. Grows and shrinks based on sidebar and chat states.
- **Chat (right):** Always present. Can be expanded (viewer shrinks proportionally) but never fully hidden. Minimum state: input bar + mode indicator. Functionality inspired by Cursor, organization inspired by Notion.

## Sidebar: The Navigator

A read-only file tree. The user **cannot** create, rename, move, or delete items directly in the sidebar. All structural changes are performed by the AI agent through chat commands.

### Sidebar Structure (top to bottom)

**1. Workspace Header**

```jsx
┌────────────────────────────────────┐
│ ⚙ Investigation Desk: [name]      │
└────────────────────────────────────┘
```

- Displays the current Investigation Desk name
- Chevron icon to switch between workspaces

**2. Sources**

```
📁 Sources
  ├── 📄 contrato-01.pdf          [✓]
  ├── 📄 contrato-02.pdf          [⟳]
  ├── 📄 email-dump.eml           [○]
  └── 📁 fotografias/
        ├── 🖼️ foto-reuniao.jpg   [✓]
        └── 🖼️ scan-doc.png      [○]
```

- Each file displays a **processing status badge** inline on the right:
    - `○` Not processed (gray)
    - `⟳` Processing (animated spinner, yellow)
    - `✓` Processed (green)
- Clicking a file name opens its **processed view** ([preview.md](http://preview.md) + [metadata.md](http://metadata.md)) in the viewer, not the original file
- A secondary link icon (🔗) next to each file opens the **original document** in the system's default application

**3. Investigations**

```
🔍 Investigations
  ├── 📋 Corporate Cluster Hypothesis
  │     ├── 💡 Clue: Company X in 3 contracts     [○]
  │     ├── 💡 Clue: Inflated price lot 22         [✓]
  │     └── 💡 Clue: Same root CNPJ                [✕]
  └── 📋 Public Works Overbilling
        └── 💡 (empty)
```

- Investigative lines are expandable to show their clues
- Clues display their verification status badge inline
- Clicking an investigative line opens its detail view in the viewer
- Clicking a clue opens it with its traceability link visible

**4. Dossier**

```jsx
📂 Dossier
  ├── 👤 People/
  │     ├── João Silva.md
  │     └── Maria Fernandes.md
  ├── 🏛️ Groups/
  │     └── Construtora XYZ.md
  ├── 📍 Places/
  └── 📅 Timeline/
        ├── 2023/
        └── 2024/
```

- Folder structure managed exclusively by the AI agent
- Clicking any `.md` file opens it in the viewer
- Dossier files support `[[bidirectional links]]` which are rendered as clickable navigation links in the viewer

**5. Drop Zone & Processing Status (sidebar area)**

Below the file tree sections, the sidebar contains a dedicated area for file ingestion and monitoring:

```jsx
┌────────────────────────────────────┐
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │ 📎 Drop files here          │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                    │
│  ⟳ contrato-02.pdf  Processing... │
│  ✓ contrato-01.pdf  Done          │
│  ○ scan.png         Queued        │
└────────────────────────────────────┘
```

- Drag-and-drop zone for adding new source files
- Real-time processing status feed showing what the agent is currently working on
- Each entry shows file name + current status (queued, processing, done, error)
- Clicking a status entry opens the corresponding source detail in the viewer

**6. Graph View Link (sidebar footer)**

- A persistent button pinned at the very bottom of the sidebar: `⤢ Open Full Graph`
- Clicking it opens the full interactive Graph View in the viewer area

## Viewer Area: Single Page View

The viewer renders Markdown files beautifully. It is **strictly read-only**: there is no text cursor, no editing, no inline inputs. The only interactive elements are navigation links, status toggles on clues/annotations, and action buttons that delegate to the chat.

### Navigation Behavior (Notion-style)

The viewer displays **one page at a time**, similar to Notion's page navigation. There are no horizontal tabs or side-by-side panels.

1. Clicking an item in the sidebar opens it in the viewer, replacing the current content
2. Clicking a `[[backlink]]` inside a page navigates to that entity, replacing the current view
3. The browser-style **back/forward buttons** (or `Cmd+[` / `Cmd+]`) allow quick navigation between recently viewed pages
4. A **breadcrumb trail** at the top of the viewer shows the current path (e.g., `Dossier > People > João Silva`)

```jsx
┌─────────────────────────────────────────────────────────────────┐
│  ← →  Dossier > People > João Silva                            │
│  ─────────────────────────────────────────────────────────────  │
│  [Contextual Action Bar: actions specific to this content type] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 João Silva                                                  │
│                                                                 │
│  [AI-generated Markdown content with [[backlinks]]]             │
│                                                                 │
│  ── Investigative Annotations ─────────                         │
│  📌 Signed contract #042 as legal representative                │
│     Source: contrato-01.pdf, p.2 → [view source]               │
│     Status: ○ unverified                                        │
│                                                                 │
│  ── Connections ───────────────────                              │
│  📄 contrato-01.pdf (Source)                                    │
│  🏛️ Construtora XYZ (Dossier)         ┌─── GRAPH VIEW ───────┐ │
│  📋 Corporate Cluster (Investigation)  │  ◉ João Silva        │ │
│                                        │ / \                  │ │
│                                        │◉   ◉ Construtora XYZ │ │
│                                        │     [⤢ Expand]       │ │
│                                        └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Contextual Action Bar

At the top of the viewer, below the breadcrumb, a **contextual action bar** appears with actions relevant to the current content type. These buttons follow the Chat-First Principle: they inject commands into the chat.

| Content type | Available actions |
| --- | --- |
| Source (detail) | `🔄 Reprocess` `🔗 Open Original` `📋 View Replica` |
| Investigation | `💡 New Clue` `📋 Create Plan` `✏️ Update Investigation` |
| Dossier entity | `🌐 Enrich from Web` `📝 Add Annotation` |
| Sources (list) | `Process Selected` `Process All Unprocessed` |
| Graph View (fullscreen) | Filter controls, color/type toggles |

The action bar is hidden when viewing content types that have no specific actions (e.g., reading a replica).

### Viewer Templates by Content Type

Each type of content has a specific layout in the viewer:

**Source Detail View**

```
contrato-emergencial-042.pdf
Status: ✓ Processed  |  Type: PDF  |  Pages: 147
🔗 Open original file
─────────────────────────────────────
[preview.md rendered]
[metadata.md rendered]
```

- Top section shows file metadata and processing status
- Link to open the original untouched file
- Rendered preview and metadata below
- For PDFs, an additional tab/section shows the `replica.md`

**Investigation Detail View**

```
🔍 Corporate Cluster Hypothesis
Created: 2026-02-12  |  Updated: yesterday
─────────────────────────────────────
[Description]
[Objectives checklist]

── Clues ─────────────────────────────
💡 Company X appears in 3 distinct contracts
   Source: contrato-01.pdf, p.23 → [view source]
   Status: ○ unverified

💡 Inflated unit price on lot 22
   Source: contrato-03.pdf, p.87 → [view source]
   Status: ✓ verified
```

**Dossier Entity View**

```jsx
👤 João Silva
[AI-generated Markdown content with [[backlinks]]]

── Investigative Annotations ─────────
📌 Signed contract #042 as legal representative
   Source: contrato-01.pdf, p.2 → [view source]
   Status: ○ unverified

── Connections ───────────────────────
📄 contrato-01.pdf (Source)
📄 contrato-03.pdf (Source)
🏛️ Construtora XYZ (Dossier)
📋 Corporate Cluster (Investigation)
```

### Connections Block (Backlinks)

Displays at the **bottom** of every Dossier entity and every Investigation/Clue. It answers the question: *"What else references this entity?"*

```jsx
── Connections ───────────────────────
📄 contrato-01.pdf (Source)
📄 contrato-03.pdf (Source)
📋 Corporate Cluster (Investigation)
💡 Inflated price lot 22 (Clue)
🏛️ Construtora XYZ (Dossier)
```

**Visibility rules:**

| Content type | Connections block |
| --- | --- |
| Dossier entity | ✅ Always |
| Investigation | ✅ Always |
| Clue | ✅ Always |
| Source (preview + metadata) | ✅ Dossier Connections (via entities_mentioned in [metadata.md](http://metadata.md)) |
| Source (replica) | ❌ Not shown |

Each item in the Connections block is a clickable link that navigates to the referenced file in the viewer.

### Table of Contents Block ("In this document")

Appears at the **top** of the viewer panel, collapsible, for documents with 3 or more headings. Helps navigate long Markdown files.

```
┌─ In this document ─────────────────┐
│  Summary                           │
│  Corporate Relationships           │
│  Linked Contracts                  │
│  Investigative Annotations         │
└────────────────────────────────────┘
```

**Visibility rules:**

| Content type | Table of Contents |
| --- | --- |
| Dossier entity | ✅ If 3+ headings |
| Investigation | ✅ If 3+ headings |
| Clue | ❌ (clues are short) |
| Source (preview + metadata) | ✅ If 3+ headings |
| Source (replica) | ✅ Always (these are long) |

## Graph View

The Graph View exists in two states: **floating widget** and **fullscreen**.

### Floating Widget State (default)

A compact, floating box anchored to the **bottom-right corner** of the viewer area. It hovers over the content and is always visible when any Dossier file, Investigation, or Clue is open. Inspired by Obsidian Publish's interactive graph, but repositioned to stay out of the way of the main reading flow.

```jsx
┌─── GRAPH VIEW ───────┐
│  ◉ João Silva         │
│ / \                   │
│◉   ◉ Construtora XYZ  │
│                       │
│ ON THIS PAGE          │
│  João Silva           │
│  Construtora XYZ      │
│       [⤢ Expand]      │
└───────────────────────┘
```

- Floats over the viewer content in the bottom-right corner
- Semi-transparent background, becomes fully opaque on hover
- Can be collapsed to a small icon button (`◉`) to maximize reading space
- Shows nodes and connections related to the **currently active page**
- "ON THIS PAGE" section lists backlinks as clickable text
- Updates dynamically when the user navigates to a different page
- Nodes are clickable: clicking a node navigates to that entity in the viewer

### Fullscreen State

Clicking "Expand" replaces the viewer content with the full investigation graph.

- Shows **all** nodes and connections across the entire workspace
- Filter controls: filter by entity type (People, Groups, Places, Sources, Investigations)
- Color coding: nodes colored by type, with custom tag-based highlighting
- Zoom and pan controls
- Clicking any node opens that entity in the viewer and exits fullscreen
- "Exit fullscreen" button returns to the previous viewer state
- Can also be triggered from the sidebar footer button (`⤢ Open Full Graph`)

## Verification Status: The Only User Edit

The **only** direct editing action available to the user in the entire application is toggling the verification status of **Clues** and **Investigative Annotations**. Everything else is read-only and managed through chat commands.

### Interaction Pattern (hover-based)

**Default state:** Status displayed as subtle inline text.

```
💡 Company X appears in 3 contracts
   Source: contrato-01.pdf, p.23 → [view source]
   Status: ○ unverified
```

**On hover:** Two action icons appear next to the status.

```
Status: ○ unverified   [✓ Verify]  [✕ Reject]
```

**After clicking:** Status updates immediately, no confirmation dialog.

- `✓ verified` displays in green text
- `✕ rejected` displays in red text with strikethrough on the clue title
- `○ unverified` displays in gray text (default)

**Toggling back:** Clicking the status again on an already verified or rejected item resets it to `unverified`.

## Sources: Upload & Management

Sources are added **exclusively via drag and drop**. There is no file picker dialog, no folder monitoring, no import from URL (in v0.1).

### Sources Panel (in the viewer)

```
┌─ Sources ─────────────────────────────────────────────┐
│                                                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  │  📎 Drag and drop your files here               │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                                        │
│  ☐ contrato-01.pdf              [✓ Processed]          │
│  ☐ contrato-02.pdf              [⟳ Processing...]      │
│  ☐ email.eml                    [○ Not processed]      │
│  ☐ scan.png                     [○ Not processed]      │
│                                                        │
│  [Process Selected (2)]    [Process All Unprocessed]   │
│                                                        │
│  ℹ️ To update a file, delete it and upload again.      │
└────────────────────────────────────────────────────────┘
```

**Rules:**

- Drag and drop is the only way to add files
- Original files are **immutable** after upload. The user cannot edit them inside the app.
- To "update" a source: delete the reference, then re-upload the new version
- Deleting a source removes the original file and all generated `.md` files (preview, metadata, replica)
- Checkboxes allow multi-selection for batch processing
- Both processing buttons inject commands into the chat (see Chat-First Principle below)

## Chat-First Principle: How Buttons Work

No button in the application executes an action directly. Every button **injects a command into the chat** and invites the user to add context before pressing Enter.

### The Injection Flow

1. User clicks a button (e.g., "New Clue" inside an empty investigation)
2. The chat panel opens (if it was minimized)
3. The input field receives a pre-filled command
4. A guidance message appears above the input in a subtle onboarding style:

> *"This command was generated automatically. Add more context if you want and press Enter."*
> 
1. The user can edit the command, add instructions, or simply press Enter to execute

### Button-to-Command Map

| Context | Button label | Injected chat command |
| --- | --- | --- |
| Investigations (empty) |   `• New Investigation` | `/create_line`  • guidance text |
| Investigation detail |   `• New Clue` | `/create_clue !InvestigationName`  • guidance text |
| Investigation detail | `📋 Create Plan` | `/plan !InvestigationName`  • guidance text |
| Investigation detail | `✏️ Update Investigation` | `!InvestigationName update:`  • guidance text |
| Sources (files selected) | `Process Selected (3)` | `/process @file1 @file2 @file3` |
| Sources | `Process All Unprocessed` | `/process_all unprocessed` with cost estimate |
| Dossier entity | `🌐 Enrich from Web` | `/web_search @dossier/people/EntityName` |
| Source (processed) | `🔄 Reprocess` | `/reprocess @filename` |

## Chat Panel

The chat is the **command center** of the application. It is always visible on the right side of the screen.

### Chat Anatomy

```
┌─ Chat ──────────────────────────────────────────────────┐
│  Mode: [Q] [P] [A]               Tokens: 42.3k / 150k  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 Capybara:                                           │
│  "Found 3 contracts mentioning Construtora XYZ.          │
│   I'll start reading the budget tables from each one,    │
│   this should take about 2 minutes."                     │
│                                                          │
│  [📄 metadata.md created → contrato-01]       [open]     │
│  [💡 New Clue: Company X in 3 contracts]      [open]     │
│  [👤 João Silva.md created in Dossier]        [open]     │
│                                                          │
│  🤖 Capybara:                                           │
│  "Done! I created João Silva's page in the Dossier       │
│   with the connections I found. Should I continue         │
│   analyzing the remaining contracts?"                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Context: [!Corporate Cluster ×] [@contrato-01 ×]        │
│  ┌───────────────────────────────────────────────────┐   │
│  │ /  Message or command...                          │   │
│  └───────────────────────────────────────────────────┘   │
│  [+ New chat]  [🗑 Clear context]                        │
│                                                          │
│  ⚠️ 142k/150k tokens  [Summarize conversation]           │
└─────────────────────────────────────────────────────────┘
```

### Chat Components

**1. Mode Toggle Bar (top)**

Three toggle buttons indicating the current operating mode:

- **Q** (Question Mode): AI answers questions only. No file modifications.
- **P** (Planning Mode): AI proposes a plan and waits for approval before executing.
- **A** (Agent Mode): AI acts autonomously, modifying files, creating clues, and building the dossier.

The active mode is highlighted. Switching modes takes effect immediately for the next message.

**2. Token Counter**

Always visible next to the mode toggle. Shows `current / limit` (e.g., `42.3k / 150k`). When usage exceeds ~90%, a warning banner appears with a one-click "Summarize conversation" button that triggers the `/summarize` command.

**3. Message Area**

The agent writes in **natural, human language**. It is not a technical log. Example:

> *"OK, I found the contract. It has 147 pages. I'll start reading the budget tables now, this should take about 2 minutes. Meanwhile, I can already tell you that Construtora XYZ's registration number appears on the cover page. I'm noting that down."*
> 

**4. Action Pills**

Every modification the agent makes to the workspace generates a **clickable pill** in the chat:

- `[📄 metadata.md updated]`
- `[💡 New Clue added]`
- `[👤 João Silva.md created in Dossier]`

Clicking a pill opens the corresponding file in the viewer.

**5. Active Context Bar**

Displays tags representing what is currently loaded into the AI's context:

- `!Investigation Name` (investigative line)
- `@source/filename` (source file)
- `@dossier/people/Name` (dossier entity)

Each tag has an `×` button to remove it from context.

**6. Input Field with Autocomplete**

The input field supports three special triggers:

- `/` opens a **slash command menu** (e.g., `/create_line`, `/check_annotations`, `/summarize`, `/web_search`)
- `@` opens a **source and dossier search** (e.g., `@source/contrato-01`, `@dossier/people/João`)
- `!` opens an **investigative line search** (e.g., `!Corporate Cluster`)

**7. Session Controls**

- **New chat:** Creates a fresh chat session with empty context
- **Clear context:** Removes all `@` and `!` tags but keeps the conversation history
- **Summarize:** Compresses the conversation to free up token space

## Screen Map

Complete list of all screens and states in the application:

| # | Screen / State | Description |
| --- | --- | --- |
| 1 | **Onboarding** | Create Investigation Desk + paste OpenRouter API Key  |
| 2 | **Sources (list view)** | Dropzone + file list with status badges + checkboxes + processing buttons |
| 3 | **Source (detail view)** | [preview.md](http://preview.md)  • [metadata.md](http://metadata.md) rendered + link to original + processing status |
| 4 | **Source (replica view)** | [replica.md](http://replica.md) rendered for PDFs, with table of contents |
| 5 | **Investigations (list view)** | List of investigative lines + "New Investigation" button (injects to chat) |
| 6 | **Investigation (detail view)** | Title/question + description + checklist + clues with hover-based status toggles |
| 7 | **Dossier (tree navigation)** | Folder tree (People, Groups, Places, Timeline) with Graph View widget |
| 8 | **Dossier (entity detail)** | Rendered Markdown with `[[backlinks]]`, investigative annotations, and Connections block |
| 9 | **Graph View (widget)** | Compact contextual graph + "On this page" list, embedded in viewer corner |
| 10 | **Graph View (fullscreen)** | Full investigation graph with filters by type/tag/color + zoom + click-to-navigate |
| 11 | **Settings** | API Key, model selection per task, theme toggle, token limit configuration |
| 12 | **Chat** | Always-present right panel with mode toggle, token counter, action pills, and context bar |

## Interaction Summary

To make the read-only, chat-first philosophy concrete, here is a summary of what the user **can** and **cannot** do directly in the interface:

**What the user CAN do directly (without chat):**

- Navigate the sidebar file tree
- Open files in the viewer (click to open, Notion-style single page navigation)
- Click `[[backlinks]]` to navigate between documents
- Use back/forward navigation to move between recently viewed pages
- Toggle verification status on Clues and Investigative Annotations (hover-based)
- Drag and drop files into the Sources dropzone
- Select multiple files with checkboxes
- Expand/collapse the sidebar
- Expand/collapse the chat
- Switch between light and dark mode
- Switch chat operating mode (Q/P/A)
- Interact with the Graph View (zoom, pan, click nodes)

**What the user CANNOT do directly (must use chat):**

- Create, edit, or delete any Markdown file
- Create or modify investigative lines (except status toggling)
- Create or modify clues (except status toggling)
- Process source documents
- Modify metadata or previews
- Organize files into folders
- Create or modify dossier entities
- Enrich entities with web data
- Any structural change to the workspace

# User Personas

### Persona 1: Thiago, The Data-Driven Watchdog

**Profile:**

- **Role:** Investigative Journalist
- **Location:** São Paulo, Brazil
- **Tech Literacy:** High (comfortable with databases, understands APIs, and follows tech trends)
- **Language:** Native Portuguese, Fluent English

**Background & Current Investigation:**
Thiago is deep into a major investigation regarding the São Paulo City Hall (*Prefeitura de São Paulo*). He has noticed a recent spike in billion-dollar emergency contracts—a mechanism that bypasses standard bureaucratic hurdles. He has downloaded gigabytes of public records containing massive, 200MB files with complex budget tables and dense legal jargon. **Manually reading and cross-referencing all these contracts would take him months, if not years, of tedious work.** **Goals & Curiosities:**

- **Follow the Money:** Identify if a specific cluster of companies is disproportionately winning these emergency bids.
- **Price Auditing:** Extract and cross-reference the budget tables across all contracts to see if the unit prices are artificially inflated.
- **Bulletproof Accuracy (Avoiding Lawsuits):** Thiago is highly concerned about being sued for defamation by these powerful, billionaire companies. He cannot afford a single mistake; he needs a strict revision strategy to double-check every claim before writing his article.

**How Capybara Agent Solves His Problems:**

- **Massive Time Savings:** Capybara Agent does the heavy lifting, ingesting the massive 200MB contracts and transforming the complex tables into workable formats in minutes, saving Thiago months of manual reading.
- **Source Indexing & Traceability:** This is Thiago's safety net. Every extracted price or connection is strictly indexed back to its original source. Before publishing, Thiago uses Capybara's traceability features to click directly through to the exact page of the original contract to manually verify the information.
- **Status Assignment (Revision Strategy):** He uses the tool to assign statuses to every clue (e.g., "unverified," "checked," "discarded"), ensuring nothing makes it into the final story without his explicit, manual confirmation.

---

## Persona 2: Linn, The Financial Tracker

**Profile:**

- **Role:** Financial Journalist
- **Location:** Stockholm, Sweden
- **Tech Literacy:** Low (Relies entirely on user-friendly software; does not know how to code or use terminal commands)
- **Language:** Native Swedish, Fluent English

**Background & Current Investigation:**
Lynn is investigating the financial networks exposed in the Epstein Files. She has downloaded a massive dump of emails from the leak. Unlike Thiago, Lynn isn't dealing with scanned PDFs; her dataset consists entirely of raw text files, `.eml` files, and HTML exports. Her goal is highly specific: she needs to map out any and all connections to Sweden, specifically Stockholm, hidden within this massive digital paper trail.

**Goals & Curiosities:**

- **Targeted Discovery:** Find every mention, subtle reference, or hidden connection to Stockholm or Sweden within the email dumps.
- **Filter the Noise:** Separate the relevant Swedish connections from the millions of unrelated emails so she can focus her investigation only on what matters to her local audience.
- **Ease of Use:** Since she doesn't know how to use Python scripts or command-line search tools, she needs a system that understands what she wants using plain English.

**How Capybara Agent Solves Her Problems:**

- **Agentic Search Tools:** Instead of heavy OCR processing, the Capybara Agent acts much like an AI coding assistant (such as Claude Code or Cursor). Lynn simply uses the chat interface to ask, *"Search the entire database for any emails mentioning Sweden, Stockholm, or Swedish financial institutions."* * **Automated Tagging & Organization:** The agent autonomously navigates the HTML and text files, locates the relevant emails, and separates them from the rest of the dataset. It automatically tags these files with high relevance so Lynn can easily access them.
- **Custom Investigative Lines:** Lynn can then set an investigative line specifically on this newly segregated "Swedish" folder, asking the agent to autonomously summarize the context of why Stockholm was mentioned in these specific threads, keeping everything organized in her markdown dossiers.

# User Journey

### Version 0.1: The Foundation & Autonomous Discovery

**User:** Thiago (Investigating City Hall emergency contracts)

**1. Setup & Ingestion**

Thiago starts by creating a new **Investigation Desk**. To get to work immediately, he simply pastes his **OpenRouter API Key** into the settings, leaving the default task-specific models untouched. 

He navigates to the **Sources** menu, where the interface instructs him to drag and drop his files. He drags dozens of heavy PDF contracts into the application. Initially, they all appear in the list with an "Unprocessed" status. Thiago selects them all, clicks "Process," and watches the real-time visual feedback as the system starts working.

**2. Deep Document Transformation**

Behind the scenes, the agent initiates a specialized loop for the PDFs. It breaks each contract down, sending them page by page to the configured OpenRouter model to transcribe them perfectly into Markdown. After a few minutes, the files' statuses change from "Processing" to "Processed" and "Summarized."

Thiago now has a perfect, readable Markdown version of every contract, accurately mapped page by page. Alongside the transcriptions, the agent has automatically generated the metadata, providing him with instant summaries (`preview.md`), document categories, and relevant tags for each file.

**3. AI-Driven Hypothesis Generation**

With his sources ready, Thiago switches to the **Investigations** tab. Feeling overwhelmed by the sheer volume of data and lacking a specific starting point, he asks the AI to suggest potential leads.

The agent begins an autonomous discovery loop. It reads the first contract, writes a summary, and updates its metadata. It then reads the next contract, summarizes it, compares it with the previous one, and actively looks for anomalies or strange patterns. The AI repeats this comparison process across at least 30 different contracts.

Once it identifies strong patterns, the agent presents Thiago with a list of suggested **Investigative Lines**. Thiago reviews them, finds one focusing on specific corporate clusters highly relevant, and accepts it. The system creates the new Investigative Line, featuring a central question as the title, a brief description, a targeted checklist, and an empty "Clues" node ready to be filled.

**4. The Agentic Workflow & Dossier Population**

Thiago moves to the **Chat Interface** and types `!` to mention his newly created Investigative Line. Recognizing the complex context e do the agentic work. 

Is does a planning,It searches through the processed documents, deploying sub-agents to extract the most relevant chunks and data points from the PDFs (via de metadata and markdown version). As it analyzes the evidence and reaches conclusions, the agent autonomously begins building the **Dossier**, organizing information about people, groups, places, and timelines. It creates dedicated pages for newly discovered people and companies, writes precise **Investigative Annotations**, and officially logs hard evidence as **Clues** directly inside Thiago's Investigative Line

**User:** Linn (Investigating the Epstein Files and Swedish connections)

**1. Setup & Multi-Format Ingestion**

Linn creates her own new **Investigation Desk** and adds her OpenRouter API Key. She is dealing with a massive, heterogeneous data dump. In the **Sources** area, she uploads a mix of PDFs, `.eml` email files, HTML exports, and photographs.

**2. Smart Document Processing**

She selects all files and clicks "Process." The agent handles the different file types intelligently:

- **Images & PDFs:** Heavy processing is applied. PDFs get a perfect page-by-page Markdown **Replica** (`replica.md`). For photographs, the AI analyzes the visual content and generates rich descriptive metadata, noting people or locations found in the images.
- **Emails (.eml) & HTML:** Instead of creating redundant text replicas, the agent focuses purely on metadata. It generates `preview.md` files containing summaries and key information points extracted directly from the raw code.

**3. Guided Investigative Line Creation**

Knowing exactly what she wants but needing help structuring it, Linn clicks a button to get assistance creating an **Investigative Line**. She provides a brief prompt, explaining she is looking for any connections between Sweden and the Epstein Files, and gives the AI a few specific directions. The agent helps her refine this into a formal, highly structured Investigative Line with clear objectives and search parameters.

**4. Agentic Search & Dossier Assembly**

Linn opens the **Chat Interface**, mentions her new Investigative Line, and hits enter. The AI immediately kicks into action. It formulates a complex search strategy, hunting for various keywords, implicit connections, and specific names. It pulls the best data chunks, builds a rich context, and sends it to the reasoning model.

The agent then systematically breaks down the findings to populate the **Dossier**. It creates entities for new names, updates the metadata of the original source documents to reflect these new discoveries, and establishes the bidirectional links.

**5. Visualizing the Network**

With the Dossier fully populated, Linn opens the **Interactive Project Graph View**. The system has automatically mapped out the entire network. She can visually explore the nodes, seeing exactly how the Swedish contacts connect to specific emails, HTML records, and photographs. The visual representation allows her to connect the dots and immediately understand the hidden structures within her investigation.

### Version 0.3: Advanced Extraction & Comparative Analysis

**User:** Thiago (Continuing the São Paulo City Hall investigation)

**1. Enhanced Setup & Model Selection**

Thiago updates Capybara Agent to version 0.3. Instead of manually pasting an API key, he now logs in directly with his OpenRouter account. The interface provides a clear explanation of how OpenRouter works, noting that creating a new account grants a $10 starting credit. In his workspace settings, he explores the advanced model selection. Using a built-in search function that queries the entire OpenRouter catalog, he searches and handpicks the exact models he wants for the three core tasks: document extraction, text summarization, and investigative reasoning. Before starting, he toggles his workspace appearance to his preferred Dark Mode.

**2. Operating Modes & Precision Table Extraction**

Back in his investigation, Thiago opens the chat. He now has the ability to switch between specific Operating Modes. He sets the chat to **Question Mode** to safely ask questions without the AI making any changes to the dossier. To provide precise context, he types `@source` to mention a specific contract and uses `!` to link his current Investigative Line. He prompts the agent to extract the budget table from this specific document and save it as a CSV. The agent intelligently identifies the table's location, slices that specific chunk of the PDF, and sends only the relevant part to the AI for extraction. The agent successfully generates a clean `.csv` file, saves it into the Sources area, and creates the necessary metadata to permanently link the new CSV back to its origin in the original PDF.

**3. Scaling the Investigation**

Impressed by the clean CSV export, Thiago decides to scale this analysis. He switches the agent to full **Agent Mode**, types `/create_line` in the chat, and instructs the agent: "Create an investigative line to compare the budget tables and unit prices across all public works contracts."

**4. Autonomous Comparative Analysis**

The specialized agent grasps the assignment. It recognizes the pattern of these budget tables and begins a mass extraction process across multiple files. It smartly prioritizes the contracts that were previously classified in their metadata as urgent and controversial. The AI extracts the tables, compiles them into a unified dataset, and evaluates the data to find price differences and artificially inflated values. Finally, the agent logs these price differences as formal **Clues** and writes detailed **Investigative Annotations**.

**5. Traceability & Manual Verification**

To ensure bulletproof accuracy, Thiago reviews the AI's work. He opens the newly created Clues and Investigative Annotations. Next to each claim, there is a traceability link. Thiago clicks it and is instantly taken to the exact page and highlighted text within the original PDF contract. After reading the source material himself, he uses the status interface to manually mark each item. He marks the accurate findings as "verified", leaves some as "unverified" for further review, and uses the "discard" option to completely remove any clues that are irrelevant or incorrect.

### Version 0.4: Multi-Provider Setup & Deep Dossier Exploration

**User:** Linn (Deepening the Epstein Files network analysis)

**1. Advanced AI Provider Authentication**

Linn upgrades to version 0.4. Instead of relying solely on OpenRouter, the new workspace settings allow her to connect directly to native AI providers. Since she has a premium Claude account, she authenticates directly with Anthropic, and also connects her Google account to use Gemini, giving her full flexibility and direct access to her premium models.

**2. Dossier Customization & Visualization**

Navigating to the **Dossier**, Linn takes advantage of the new Obsidian-style customization features. She organizes the complex web of Swedish connections by color-coding different modules, applying custom tags to specific entities, and creating tailored visual layouts to better map out and understand the data structures.

**3. Contextual Entity Enrichment**

While reading a specific Dossier page about a newly discovered financial firm, she realizes she needs more external context. She clicks the new "Enrich" button directly within the dossier file. The agent automatically runs a targeted web search and deep internal analysis specifically focused on that firm, seamlessly appending the newly found context and metadata to the page.

**4. Fact-Checking & Verification**

To ensure her reporting is completely accurate, Linn utilizes the verification system. She reviews the newly enriched data and generated clues, clicking the traceability links to cross-reference the AI's claims with the original `.eml` and HTML sources. Once confirmed, she uses the status interface to mark the solid connections as "verified".