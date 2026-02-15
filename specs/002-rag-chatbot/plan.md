# Implementation Plan: RAG Chatbot

**Branch**: `002-rag-chatbot` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-rag-chatbot/spec.md`

## Summary

Build a RAG (Retrieval-Augmented Generation) chatbot for the Physical AI & Humanoid Robotics textbook. The system ingests 16 MDX chapter files into Qdrant Cloud vector store, then provides an AI-powered Q&A interface embedded in the Docusaurus book. The backend uses FastAPI with the OpenAI Agents SDK (`openai-agents` v0.8+) for agent orchestration, LiteLLM for free model access (Cerebras Llama 3.3 70B), and SSE streaming for real-time responses. A React widget in the Docusaurus site provides the chat UI.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/React (frontend widget)
**Primary Dependencies**: `openai-agents[litellm]` v0.8+, FastAPI, `qdrant-client`, `openai`, `langchain-text-splitters`
**Storage**: Qdrant Cloud (vectors), Neon Serverless Postgres (ingestion records), SQLite (conversation sessions via SDK)
**Testing**: pytest + httpx (backend), manual E2E (frontend)
**Target Platform**: Linux server (backend API), Browser (frontend widget on GitHub Pages)
**Project Type**: Web application (backend API + frontend widget)
**Performance Goals**: First token <2s, full response <10s, widget load <3s
**Constraints**: Free-tier services (Qdrant, Cerebras, Neon), CORS for GitHub Pages, async-only backend
**Scale/Scope**: 16 chapters, ~400-500 chunks, single concurrent user (hackathon demo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Content Accuracy | PASS | RAG ensures answers grounded in textbook content, not hallucination |
| II. Spec-Driven Development | PASS | Following SDD: specify → plan → tasks → implement |
| III. Modular Feature Independence | PASS | Chatbot deploys independently; book works without it |
| IV. Security & Secrets | PASS | All keys in .env, CORS configured, no hardcoded secrets |
| V. Simplicity & YAGNI | PASS | Flat config, SQLiteSession over custom sessions, no abstractions |
| VI. Accessibility & Multilingual | N/A | Urdu translation is separate feature (005) |
| VII. Async-First Backend | PASS | All routes async, AsyncQdrantClient, Runner.run_streamed() |
| VIII. Docusaurus & MDX Standards | PASS | Widget as Docusaurus theme component, MDX conventions preserved |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/
│   └── openapi.yaml     # Phase 1: API contract (OpenAPI 3.1)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Actionable task list (via /sp.tasks)
```

### Source Code (repository root)

```text
chatbot/                          # Backend (FastAPI + OpenAI Agents SDK)
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app, lifespan, CORS middleware
│   ├── config.py                 # Pydantic BaseSettings from env vars
│   ├── context.py                # AppContext dataclass for RunContextWrapper
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py               # POST /api/chat, /api/chat/stream, /api/chat/selected
│   │   └── ingest.py             # POST /api/ingest
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── rag_agent.py          # Agent definition, model selection, instructions
│   │   └── tools.py              # @function_tool search_docs (Qdrant RAG)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding.py          # OpenAI text-embedding-3-small wrapper
│   │   ├── vector_store.py       # AsyncQdrantClient operations
│   │   └── ingestion.py          # MDX parsing, chunking, batch embedding + upsert
│   └── models/
│       ├── __init__.py
│       └── schemas.py            # Pydantic request/response models
├── scripts/
│   ├── ingest_book.py            # CLI script: bulk ingest all chapters
│   └── setup_collections.py     # CLI script: create Qdrant collection
├── requirements.txt
├── .env.example
└── Dockerfile

physical-ai-book/                 # Frontend (Docusaurus)
├── src/
│   ├── components/
│   │   └── ChatWidget/
│   │       ├── index.js          # Main ChatWidget component
│   │       └── styles.module.css # Widget styling
│   └── theme/
│       └── Root.js               # Docusaurus Root wrapper (injects ChatWidget globally)
└── static/
    └── img/
        └── chat-icon.svg         # Chat button icon
```

**Structure Decision**: Web application pattern — backend API (Python/FastAPI) and frontend widget (React in Docusaurus) are separate projects. Backend lives in `chatbot/` at repo root. Frontend components integrate into existing `physical-ai-book/` Docusaurus project.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Docusaurus Book (GitHub Pages)                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ChatWidget Component (React)                     │    │
│  │ - Floating button (bottom-right)                 │    │
│  │ - Expandable chat panel                          │    │
│  │ - SSE streaming via fetch() + ReadableStream     │    │
│  │ - Selected text integration                      │    │
│  └──────────────────┬──────────────────────────────┘    │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTPS (CORS)
                      ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend (Railway/Render/Fly.io)                 │
│                                                         │
│  POST /api/chat/stream  → Runner.run_streamed() → SSE  │
│  POST /api/chat         → Runner.run() → JSON           │
│  POST /api/chat/selected → Dynamic Agent → JSON         │
│  POST /api/ingest       → Parse → Chunk → Embed → Store │
│  GET  /api/health       → Qdrant ping + model check     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ OpenAI Agents SDK                                 │   │
│  │ ┌──────────┐  ┌────────────┐  ┌───────────────┐ │   │
│  │ │ Agent    │  │ @function  │  │ SQLiteSession │ │   │
│  │ │ "Tutor"  │──│ search_docs│  │ (memory)      │ │   │
│  │ └──────────┘  └─────┬──────┘  └───────────────┘ │   │
│  └──────────────────────┼───────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┼───────────────────────────┐   │
│  │ Services             │                            │   │
│  │ ┌─────────┐   ┌──────┴─────┐   ┌──────────────┐ │   │
│  │ │Embedding│   │VectorStore │   │ Ingestion    │ │   │
│  │ │Service  │   │ (Qdrant)   │   │ Pipeline     │ │   │
│  │ └────┬────┘   └──────┬─────┘   └──────┬───────┘ │   │
│  └──────┼───────────────┼────────────────┼──────────┘   │
└─────────┼───────────────┼────────────────┼──────────────┘
          │               │                │
          ▼               ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌────────────────┐
   │ OpenAI API │  │ Qdrant     │  │ Neon Postgres  │
   │ (embeddings│  │ Cloud      │  │ (ingestion     │
   │  only)     │  │ (vectors)  │  │  records)      │
   └────────────┘  └────────────┘  └────────────────┘
```

## Key Design Decisions

### D1: Agent Framework — OpenAI Agents SDK with LiteLLM

Use `openai-agents[litellm]` for agent orchestration. The `Agent[AppContext]` pattern provides typed dependency injection. `@function_tool` decorators create tools from async functions with docstring-based descriptions. LiteLLM extension enables free models (Cerebras) for testing.

**Mapping to spec requirements**:
- FR-002 (search before answering) → `@function_tool search_docs` with agent instructions "ALWAYS search first"
- FR-003 (citations) → Agent instructions require citing sources from search results
- FR-004 (streaming) → `Runner.run_streamed()` + SSE events
- FR-005 (conversation memory) → `SQLiteSession` passed to each `Runner.run()` call
- FR-009 (decline off-topic) → Agent instructions specify scope boundaries

### D2: Model Configuration — Dual-Mode (Free/Paid)

Environment variable `USE_FREE_MODEL` toggles between:
- **Free (default)**: `LitellmModel(model="cerebras/llama-3.3-70b")` — 14,400 req/day
- **Paid**: `"gpt-4o-mini"` — OpenAI direct, higher quality

The `get_model()` function in `rag_agent.py` reads config and returns the appropriate model. No code changes needed to switch — just change `.env`.

### D3: Ingestion Strategy — Chapter-Level Replacement

Each chapter is identified by its `file_path`. During re-ingestion:
1. Delete all existing points for that chapter (`file_path` filter)
2. Re-chunk and re-embed the updated content
3. Upsert new points

This avoids duplicates without requiring a full collection rebuild.

**Mapping to spec requirements**:
- FR-007 (ingest 16 chapters) → `ingest_book.py` script walks `docs/` directory
- FR-008 (re-ingestion) → Delete-by-filter + upsert pattern

### D4: Frontend Widget — Docusaurus Theme Component

Use Docusaurus `Root` wrapper pattern to inject `ChatWidget` on every page. The widget is a React component with:
- Floating button (fixed position, bottom-right, z-index above content)
- Expandable panel (chat messages, input field, send button)
- SSE client via `fetch()` + `ReadableStream` (supports POST, unlike EventSource)
- Text selection listener for "Ask about this" feature

**Mapping to spec requirements**:
- FR-001 (chat interface) → ChatWidget React component
- FR-006 (selected text) → `window.getSelection()` listener + `/api/chat/selected` call
- FR-014 (floating widget) → CSS fixed positioning, z-index layering
- FR-015 (preserve conversation) → React state persists across open/close

### D5: CORS & Deployment

Backend deployed to Railway/Render with explicit CORS:
```python
allow_origins=["https://abdulrehman346790.github.io", "http://localhost:3000"]
```

GitHub Pages (static) → Backend API (separate host). CORS is the only cross-origin mechanism needed (no cookies, no auth headers for chatbot).

## Implementation Phases

### Phase 1: Backend Scaffolding
- Project structure (`chatbot/` directory)
- `requirements.txt`, `.env.example`, `config.py`
- FastAPI app with lifespan, CORS, health endpoint
- Pydantic schemas

### Phase 2: Ingestion Pipeline
- MDX parser (strip frontmatter, JSX, components)
- Document chunker (RecursiveCharacterTextSplitter)
- Embedding service (OpenAI text-embedding-3-small)
- Qdrant operations (collection setup, upsert, delete-by-filter)
- `setup_collections.py` and `ingest_book.py` scripts
- Ingestion record tracking (Neon Postgres)

### Phase 3: RAG Agent & Chat API
- AppContext dataclass
- `@function_tool search_docs` (embed query → Qdrant search → format)
- Agent definition with tutor instructions
- `POST /api/chat` (non-streaming)
- `POST /api/chat/stream` (SSE streaming)
- `POST /api/chat/selected` (dynamic agent with selected text)
- SQLiteSession integration

### Phase 4: Frontend Widget
- ChatWidget React component (button + panel)
- SSE client (fetch + ReadableStream)
- Message rendering (markdown, citations, streaming indicator)
- Text selection integration ("Ask about this")
- Docusaurus Root wrapper for global injection
- CSS styling (responsive, non-obstructive)

### Phase 5: Integration & Polish
- End-to-end testing (ingest → search → chat → stream)
- Error handling (backend down, rate limits, empty results)
- Rate limiting middleware
- Build verification (Docusaurus still builds)
- Deployment configuration

## Complexity Tracking

No constitution violations. All decisions align with principles:
- Simplicity (V): Flat config, SQLiteSession, no custom abstractions
- Async-first (VII): All routes async, AsyncQdrantClient
- Modular independence (III): Chatbot is fully separate from book; book works without it
