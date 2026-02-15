# Tasks: RAG Chatbot

**Input**: Design documents from `specs/002-rag-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Not explicitly requested. Test tasks omitted per template rules.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backend project initialization, dependency configuration, environment setup

- [x] T001 Create chatbot project directory structure per plan.md: `chatbot/app/`, `chatbot/app/routers/`, `chatbot/app/agent/`, `chatbot/app/services/`, `chatbot/app/models/`, `chatbot/scripts/`
- [x] T002 Create `chatbot/requirements.txt` with pinned dependencies: `fastapi>=0.109.0`, `uvicorn[standard]>=0.27.0`, `openai-agents[litellm]>=0.8.0`, `openai>=1.12.0`, `qdrant-client>=1.7.0`, `psycopg[binary,pool]>=3.1.0`, `python-dotenv>=1.0.0`, `pydantic>=2.6.0`, `pydantic-settings>=2.1.0`, `langchain-text-splitters>=0.0.1`, `litellm>=1.0.0`
- [x] T003 [P] Create `chatbot/.env.example` with all required environment variables per quickstart.md (OPENAI_API_KEY, CEREBRAS_API_KEY, QDRANT_URL, QDRANT_API_KEY, DATABASE_URL, USE_FREE_MODEL, FREE_MODEL_ID, CORS_ORIGINS)
- [x] T004 [P] Create `chatbot/app/config.py` with Pydantic `BaseSettings` class loading all env vars: openai_api_key, cerebras_api_key, qdrant_url, qdrant_api_key, database_url, use_free_model (bool, default True), free_model_id (str, default "cerebras/llama-3.3-70b"), cors_origins (list), embedding_model (str, default "text-embedding-3-small")
- [x] T005 [P] Create all `__init__.py` files: `chatbot/app/__init__.py`, `chatbot/app/routers/__init__.py`, `chatbot/app/agent/__init__.py`, `chatbot/app/services/__init__.py`, `chatbot/app/models/__init__.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and models shared by multiple user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Pydantic request/response schemas in `chatbot/app/models/schemas.py`: ChatRequest (message: str max 2000, session_id: str), SelectedTextRequest (selected_text: str max 5000, question: str max 2000, session_id: str), ChatResponse (response: str), IngestRequest (docs_path: str), IngestResponse (status, chapters_processed, chunks_created, errors), HealthResponse (status, qdrant: bool, model: str, chunks_count: int), ErrorResponse (error, detail)
- [x] T007 Create `chatbot/app/context.py` with AppContext dataclass for RunContextWrapper: fields for AsyncQdrantClient, AsyncOpenAI, and collection_name (default "book_chapters")
- [x] T008 Create embedding service in `chatbot/app/services/embedding.py`: async function `embed_text(client: AsyncOpenAI, text: str, model: str) -> list[float]` and batch variant `embed_texts(client: AsyncOpenAI, texts: list[str], model: str) -> list[list[float]]` using text-embedding-3-small
- [x] T009 Create vector store service in `chatbot/app/services/vector_store.py`: async functions for `create_collection(client, name, size=1536)`, `upsert_points(client, name, points)`, `search(client, name, vector, limit=5)`, `delete_by_filter(client, name, field, value)`, `count_points(client, name)` using AsyncQdrantClient
- [x] T010 Create FastAPI application in `chatbot/app/main.py`: async lifespan (init AsyncQdrantClient + AsyncOpenAI on startup, close on shutdown), CORS middleware with configurable origins, include routers, store AppContext in app.state
- [x] T011 Create health check endpoint `GET /api/health` in `chatbot/app/main.py` or as part of the main app: ping Qdrant, return HealthResponse with qdrant status, model name, and chunks count

**Checkpoint**: Foundation ready — all services initialized, schemas defined, app running with health endpoint

---

## Phase 3: User Story 4 — Content Ingestion (Priority: P1)

**Goal**: Ingest all 16 MDX chapter files into Qdrant vector store with metadata so chatbot has content to search

**Independent Test**: Run `python scripts/ingest_book.py`, then query Qdrant to verify all 16 chapters are indexed with correct metadata. Search for "ROS 2 launch files" returns relevant chunks.

### Implementation for User Story 4

- [x] T012 [US4] Create MDX preprocessing function in `chatbot/app/services/ingestion.py`: extract YAML frontmatter to metadata dict, strip `import` statements, strip JSX component tags, strip admonition markers (:::tip, :::note) but keep text, preserve code blocks and Mermaid diagrams
- [x] T013 [US4] Create document chunking function in `chatbot/app/services/ingestion.py`: use RecursiveCharacterTextSplitter with chunk_size=1000, chunk_overlap=100, separators=["\n## ", "\n### ", "\n\n", "\n", " "]. Return list of dicts with text, chapter, module, section, chunk_index, file_path
- [x] T014 [US4] Create full ingestion pipeline function in `chatbot/app/services/ingestion.py`: async function that walks docs directory, reads each MDX file, preprocesses, chunks, embeds (batch), deletes old points by file_path filter, upserts new points to Qdrant. Track chapters_processed, chunks_created, errors. Return IngestResponse.
- [x] T015 [US4] Create Qdrant collection setup script `chatbot/scripts/setup_collections.py`: create "book_chapters" collection with 1536-dim COSINE vectors. Reads QDRANT_URL and QDRANT_API_KEY from .env. Idempotent (skip if collection exists).
- [x] T016 [US4] Create bulk ingestion script `chatbot/scripts/ingest_book.py`: read all MDX/MD files from `physical-ai-book/docs/`, call ingestion pipeline, print summary (chapters processed, chunks created, any errors). Uses asyncio.run().
- [x] T017 [US4] Create ingestion API endpoint `POST /api/ingest` in `chatbot/app/routers/ingest.py`: accept optional IngestRequest, call ingestion pipeline, return IngestResponse. Include error handling for file not found, Qdrant errors.
- [x] T018 [US4] Create Neon Postgres ingestion_records table and tracking: add SQL migration in `chatbot/scripts/setup_collections.py` to create ingestion_records table per data-model.md schema. Log ingestion runs with started_at, completed_at, chapters_processed, chunks_created, errors, status.

**Checkpoint**: Ingestion complete — all 16 chapters indexed in Qdrant with metadata. Search returns relevant chunks.

---

## Phase 4: User Story 1 — Ask a Question About Course Content (Priority: P1) MVP

**Goal**: Students can ask questions and receive textbook-grounded answers with citations via the API

**Independent Test**: POST to `/api/chat` with `{"message": "What is a ROS 2 node?"}` and verify response is grounded in textbook content with chapter/section citation. POST to `/api/chat/stream` and verify SSE events stream correctly.

### Implementation for User Story 1

- [x] T019 [US1] Create `@function_tool search_docs` in `chatbot/app/agent/tools.py`: accept RunContextWrapper[AppContext] and query string, embed the query using ctx.context.openai, search Qdrant via ctx.context.qdrant.query_points(), format results as "[Chapter: X | Section: Y]\ntext" with --- separators. Return "No relevant documents found" if empty.
- [x] T020 [US1] Create `get_model()` function and RAG agent definition in `chatbot/app/agent/rag_agent.py`: read config to select LitellmModel (Cerebras) or OpenAI model. Define Agent[AppContext] with name="Physical AI Tutor", instructions (ALWAYS search first, cite sources, decline off-topic), tools=[search_docs], model=get_model().
- [x] T021 [US1] Create non-streaming chat endpoint `POST /api/chat` in `chatbot/app/routers/chat.py`: accept ChatRequest, call Runner.run(rag_agent, input=message, context=app_ctx), return ChatResponse with result.final_output. Validate message length <= 2000.
- [x] T022 [US1] Create streaming chat endpoint `POST /api/chat/stream` in `chatbot/app/routers/chat.py`: accept ChatRequest, call Runner.run_streamed(rag_agent, input=message, context=app_ctx), iterate stream_events(), yield SSE events for ResponseTextDeltaEvent (type="delta"), tool_call_item (type="tool_call"), and done signal. Return StreamingResponse with media_type="text/event-stream".
- [x] T023 [US1] Wire chat router into FastAPI app: import and include chat router in `chatbot/app/main.py`, pass AppContext from app.state to route handlers via dependency injection.

**Checkpoint**: API accepts questions and returns textbook-grounded streaming answers with citations. Core RAG pipeline functional.

---

## Phase 5: User Story 2 — Multi-Turn Conversation (Priority: P2)

**Goal**: Chatbot maintains conversation context across multiple turns within a session

**Independent Test**: Send "What is Gazebo?" then "How does it integrate with ROS 2?" to the same session_id. Verify second response correctly references Gazebo without re-explaining.

### Implementation for User Story 2

- [x] T024 [US2] Add SQLiteSession management to `chatbot/app/routers/chat.py`: create session store (dict mapping session_id to SQLiteSession), initialize new session on first request per session_id, pass session to Runner.run() and Runner.run_streamed() calls.
- [x] T025 [US2] Update streaming endpoint in `chatbot/app/routers/chat.py` to pass session parameter: ensure Runner.run_streamed() receives session=sessions[request.session_id] for multi-turn context.
- [x] T026 [US2] Update non-streaming endpoint in `chatbot/app/routers/chat.py` to pass session parameter: ensure Runner.run() receives session=sessions[request.session_id] for multi-turn context.

**Checkpoint**: Multi-turn conversations work — follow-up questions correctly reference prior context within the same session.

---

## Phase 6: User Story 5 — Chatbot Widget in Book (Priority: P2)

**Goal**: Floating chat widget appears on every book page, connects to backend, displays streaming responses

**Independent Test**: Navigate to any book page, click chat button, type a question, verify streaming response appears in the widget with proper formatting.

### Implementation for User Story 5

- [x] T027 [US5] Create ChatWidget React component in `physical-ai-book/src/components/ChatWidget/index.js`: floating button (bottom-right, fixed position), expandable panel with message list, text input, send button. State: isOpen, messages[], inputValue, isStreaming. Auto-generate session_id (UUID v4) on mount.
- [x] T028 [US5] Implement SSE streaming client in ChatWidget: use fetch() with POST to `/api/chat/stream`, read response body via ReadableStream/TextDecoderStream, parse SSE `data:` lines, handle event types (delta → append to current message, tool_call → show "Searching..." indicator, done → mark complete). Configure backend URL from environment or config.
- [x] T029 [US5] Add message rendering to ChatWidget: render user messages (right-aligned, blue), assistant messages (left-aligned, gray) with markdown support. Show streaming indicator (animated dots) while isStreaming=true. Auto-scroll to bottom on new messages.
- [x] T030 [US5] Create CSS styles in `physical-ai-book/src/components/ChatWidget/styles.module.css`: floating button (56px circle, shadow, z-index 1000), panel (400px wide, 500px tall, border-radius, shadow), responsive (full-width on mobile <768px), message bubbles, input area styling.
- [x] T031 [US5] Create Docusaurus Root wrapper in `physical-ai-book/src/theme/Root.js`: import and render ChatWidget as a child of the default Root component so it appears on every page globally.
- [x] T032 [US5] Implement input validation in ChatWidget: disable send button when input is empty or isStreaming=true, show character counter when approaching 2000 limit, prevent submission over 2000 characters (FR-012, FR-013).
- [x] T033 [US5] Add connection status indicator to ChatWidget: on mount call `GET /api/health`, show green dot if healthy, red dot with "Chatbot unavailable" if unhealthy. Show retry button on connection failure (FR-010).
- [x] T034 [US5] Preserve conversation state on widget open/close: keep messages[] in React state (not cleared on close), only reset on page navigation or explicit "New chat" button.

**Checkpoint**: Chat widget visible on all book pages, sends messages, displays streaming responses, handles errors gracefully.

---

## Phase 7: User Story 3 — Ask About Selected Text (Priority: P3)

**Goal**: Students can highlight text on the page and ask targeted questions about it

**Independent Test**: Select a paragraph on any chapter page, click "Ask about this", type a question, verify response focuses on selected text.

### Implementation for User Story 3

- [x] T035 [US3] Create selected text chat endpoint `POST /api/chat/selected` in `chatbot/app/routers/chat.py`: accept SelectedTextRequest, create a dynamic Agent[AppContext] with selected text injected into instructions, call Runner.run() with the question, return ChatResponse. Per contracts/openapi.yaml.
- [x] T036 [US3] Add text selection listener to ChatWidget in `physical-ai-book/src/components/ChatWidget/index.js`: listen for `mouseup` events on document, check `window.getSelection()`, if non-empty text selected show a floating "Ask about this" tooltip/button near the selection.
- [x] T037 [US3] Implement "Ask about this" flow in ChatWidget: when "Ask about this" clicked, store selected text, open chat panel with prefilled context "[Selected: ...truncated...]", user types question, POST to `/api/chat/selected` with selected_text and question, display response in chat.

**Checkpoint**: Selected text Q&A works end-to-end — select text, ask question, get targeted response.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, rate limiting, build verification, deployment readiness

- [x] T038 Add error handling middleware to `chatbot/app/main.py`: catch unhandled exceptions, return structured ErrorResponse JSON with appropriate HTTP status codes (422 validation, 500 internal, 503 service unavailable)
- [x] T039 [P] Add rate limiting to chat endpoints in `chatbot/app/routers/chat.py`: simple in-memory rate limiter (max 30 requests per minute per session_id) returning 429 Too Many Requests
- [x] T040 [P] Create `chatbot/Dockerfile` for deployment: Python 3.11 slim base, copy requirements.txt and install, copy app/, expose port 8000, CMD uvicorn
- [x] T041 Verify Docusaurus book still builds with ChatWidget: run `npm run build` in `physical-ai-book/`, fix any import or build errors from new components
- [x] T042 [P] Create chat-icon.svg in `physical-ai-book/static/img/chat-icon.svg`: simple chat bubble icon for the widget button
- [x] T043 End-to-end smoke test: run backend locally, ingest book content, open Docusaurus dev server, test full flow (ask question → streaming answer → citations → follow-up → selected text)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US4 Ingestion (Phase 3)**: Depends on Phase 2 — SHOULD complete before US1 (content needed for search)
- **US1 Ask Questions (Phase 4)**: Depends on Phase 2 + Phase 3 (needs ingested content)
- **US2 Multi-Turn (Phase 5)**: Depends on Phase 4 (adds sessions to existing chat endpoints)
- **US5 Chat Widget (Phase 6)**: Depends on Phase 2 only (can build frontend while backend develops, but needs API for testing)
- **US3 Selected Text (Phase 7)**: Depends on Phase 4 (backend) + Phase 6 (frontend widget)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Foundational) ──┬──► Phase 3 (US4: Ingestion) ──► Phase 4 (US1: Q&A) ──► Phase 5 (US2: Multi-Turn)
                                               │                                        │
                                               └──► Phase 6 (US5: Widget) ──────────────┴──► Phase 7 (US3: Selected Text)
                                                                                              │
                                                                                              ▼
                                                                                        Phase 8 (Polish)
```

### Within Each User Story

- Models/services before endpoints
- Core functionality before enhancements
- Backend before frontend integration

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel (different files)
- **Phase 2**: T006, T007, T008, T009 can run in parallel (different files), T010 and T011 depend on them
- **Phase 3**: T012 and T013 can run in parallel (same file but independent functions), T014 depends on both
- **Phase 3**: T015 is independent of T012-T014
- **Phase 6**: T027-T034 are mostly sequential (building on same component) but T030 (CSS) and T042 (icon) can parallel
- **Phase 6 vs Phase 3/4**: Frontend widget (Phase 6) can be built in parallel with backend (Phase 3/4) using mock data, then integrate

---

## Parallel Example: Phase 2 (Foundational)

```bash
# These can all run in parallel (different files):
Task: "Create Pydantic schemas in chatbot/app/models/schemas.py"          # T006
Task: "Create AppContext in chatbot/app/context.py"                        # T007
Task: "Create embedding service in chatbot/app/services/embedding.py"      # T008
Task: "Create vector store service in chatbot/app/services/vector_store.py" # T009

# Then sequentially (depends on above):
Task: "Create FastAPI app in chatbot/app/main.py"                          # T010
Task: "Create health endpoint"                                              # T011
```

## Parallel Example: Backend + Frontend

```bash
# After Phase 2, can run backend and frontend in parallel:

# Backend track:
Task: T012-T018 (Ingestion)
Task: T019-T023 (Chat API)

# Frontend track (simultaneously):
Task: T027-T034 (Chat Widget with mock/localhost backend)
```

---

## Implementation Strategy

### MVP First (User Stories 4 + 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T011)
3. Complete Phase 3: US4 Ingestion (T012-T018)
4. Complete Phase 4: US1 Q&A (T019-T023)
5. **STOP and VALIDATE**: Test via curl/Postman — ask questions, verify grounded answers with citations
6. This is a functional backend MVP earning core hackathon points

### Incremental Delivery

1. Setup + Foundational → Backend running with health check
2. Add US4 (Ingestion) → Book content searchable in Qdrant
3. Add US1 (Q&A) → API answers questions with citations (MVP!)
4. Add US2 (Multi-Turn) → Conversations maintain context
5. Add US5 (Widget) → Students can use chatbot in the book
6. Add US3 (Selected Text) → Enhanced contextual Q&A
7. Polish → Error handling, rate limiting, deployment

### Task Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|---------------|
| Phase 1: Setup | — | T001-T005 (5) | 3 |
| Phase 2: Foundational | — | T006-T011 (6) | 4 |
| Phase 3: US4 Ingestion | P1 | T012-T018 (7) | 2 |
| Phase 4: US1 Q&A | P1 | T019-T023 (5) | 0 |
| Phase 5: US2 Multi-Turn | P2 | T024-T026 (3) | 0 |
| Phase 6: US5 Widget | P2 | T027-T034 (8) | 2 |
| Phase 7: US3 Selected | P3 | T035-T037 (3) | 0 |
| Phase 8: Polish | — | T038-T043 (6) | 3 |
| **Total** | | **43 tasks** | **14 parallelizable** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend URL for widget should be configurable (env var or Docusaurus config)
- Free model (Cerebras) is default for testing — switch to GPT-4o-mini via env var for production
