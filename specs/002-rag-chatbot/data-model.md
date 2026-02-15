# Data Model: RAG Chatbot (002-rag-chatbot)

**Date**: 2026-02-13
**Branch**: `002-rag-chatbot`

## Entities

### 1. ChapterChunk (Qdrant Vector Store)

A searchable segment of textbook content stored as a vector with metadata.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for the chunk |
| vector | float[1536] | Embedding from text-embedding-3-small |
| text | string | Raw text content of the chunk (max 1000 chars) |
| chapter | string | Source chapter title (e.g., "Introduction to Physical AI") |
| module | string | Module name (e.g., "module-1-ros2") |
| section | string | Section heading the chunk falls under |
| chunk_index | integer | Position of this chunk within the chapter |
| file_path | string | Source MDX file path (e.g., "docs/module-1-ros2/01-intro-physical-ai.mdx") |

**Storage**: Qdrant Cloud collection `book_chapters` (1536-dim, COSINE distance)

**Relationships**: None (flat structure, metadata used for filtering)

**Validation rules**:
- `text` must not be empty
- `vector` must be exactly 1536 dimensions
- `chapter` and `module` must not be empty
- `chunk_index` must be >= 0

---

### 2. ConversationSession (SQLite via SDK)

Managed by `SQLiteSession` from the OpenAI Agents SDK. Stores conversation turns per session.

| Field | Type | Description |
|-------|------|-------------|
| session_id | string | Client-generated UUID v4 |
| messages | list | Ordered list of conversation turns (managed by SDK) |

**Storage**: SQLite file managed by `SQLiteSession` (SDK handles schema)

**Notes**: The SDK manages the internal schema. We only control `session_id` creation and pass it to `Runner.run()`.

---

### 3. IngestionRecord (Neon Postgres)

Metadata tracking each ingestion run for auditability.

| Field | Type | Description |
|-------|------|-------------|
| id | serial | Auto-increment primary key |
| started_at | timestamptz | When ingestion began |
| completed_at | timestamptz | When ingestion finished (null if in-progress) |
| chapters_processed | integer | Number of chapters successfully processed |
| chunks_created | integer | Total chunks upserted to Qdrant |
| errors | jsonb | Array of error objects [{file, error}] |
| status | text | "running", "completed", "failed" |

**Storage**: Neon Postgres table `ingestion_records`

**Validation rules**:
- `started_at` must not be null
- `status` must be one of: "running", "completed", "failed"
- `chapters_processed` must be >= 0

---

### 4. ChatMessage (Frontend State Only)

Ephemeral messages displayed in the chat widget. Not persisted server-side (session history handled by SQLiteSession).

| Field | Type | Description |
|-------|------|-------------|
| id | string | Client-generated UUID |
| role | "user" \| "assistant" | Who sent the message |
| content | string | Message text content |
| citations | list | Source citations [{chapter, section}] (assistant only) |
| timestamp | datetime | When the message was created |
| isStreaming | boolean | True while response is being streamed |

**Storage**: React component state (client-side only)

---

## Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│  ChapterChunk    │         │ IngestionRecord  │
│  (Qdrant)        │◄────────│ (Neon Postgres)  │
│                  │ creates  │                  │
│  - vector[1536]  │         │  - started_at    │
│  - text          │         │  - chapters_done │
│  - chapter       │         │  - chunks_total  │
│  - module        │         │  - status        │
│  - section       │         └──────────────────┘
└──────────────────┘
        ▲
        │ searches
        │
┌──────────────────┐         ┌──────────────────┐
│  Agent Tool      │         │ ConversationSess │
│  (search_docs)   │         │ (SQLiteSession)  │
│                  │         │                  │
│  query → embed   │         │  - session_id    │
│  → Qdrant search │         │  - messages[]    │
│  → format results│         └──────────────────┘
└──────────────────┘                 ▲
        ▲                            │ maintains context
        │ calls                      │
┌──────────────────┐         ┌──────────────────┐
│  RAG Agent       │────────►│  Runner.run()    │
│  (openai-agents) │ uses    │  Runner.run_     │
│                  │         │  streamed()      │
│  - instructions  │         └──────────────────┘
│  - tools[]       │
│  - model         │
└──────────────────┘
```

## Database Schema (Neon Postgres)

```sql
-- Ingestion tracking table
CREATE TABLE IF NOT EXISTS ingestion_records (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    chapters_processed INTEGER NOT NULL DEFAULT 0,
    chunks_created INTEGER NOT NULL DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'running'
        CHECK (status IN ('running', 'completed', 'failed'))
);

-- Index for querying latest ingestion
CREATE INDEX idx_ingestion_started_at ON ingestion_records(started_at DESC);
```

## Qdrant Collection Schema

```python
# Collection: book_chapters
# Vectors: 1536 dimensions, COSINE distance
# Payload fields:
#   - text (string): chunk content
#   - chapter (string): chapter title
#   - module (string): module name
#   - section (string): section heading
#   - chunk_index (integer): position in chapter
#   - file_path (string): source file path
```
