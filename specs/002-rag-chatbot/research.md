# Research: RAG Chatbot (002-rag-chatbot)

**Date**: 2026-02-13
**Branch**: `002-rag-chatbot`

## R1: OpenAI Agents SDK

**Decision**: Use `openai-agents` v0.8+ with LiteLLM extension

**Rationale**:
- Official OpenAI agent framework with first-class support for tool calling, streaming, and conversation memory
- Package is `openai-agents` on PyPI, but imports are `from agents import ...`
- LiteLLM extension enables 100+ model providers including free-tier models (Cerebras, Groq)
- Built-in `SQLiteSession` for conversation memory eliminates need for custom session management
- `RunContextWrapper[T]` pattern provides clean dependency injection without leaking context to the LLM
- `Runner.run_streamed()` provides native async streaming compatible with FastAPI SSE

**Alternatives considered**:
- **LangChain**: Heavier framework, more abstractions than needed. YAGNI principle applies.
- **LlamaIndex**: Strong RAG focus but doesn't align with constitution's mandated "OpenAI Agents SDK"
- **Raw OpenAI API**: Would require manual tool calling, session management, and streaming orchestration

**Key verified patterns**:
```python
# Installation
pip install 'openai-agents[litellm]'

# Core imports
from agents import Agent, Runner, function_tool, RunContextWrapper
from agents import SQLiteSession, RunConfig
from agents.extensions.models.litellm_model import LitellmModel

# Streaming events
from openai.types.responses import ResponseTextDeltaEvent
```

## R2: Free LLM Model for Testing

**Decision**: Cerebras Llama 3.3 70B as primary free model, Groq as backup

**Rationale**:
- Cerebras: 14,400 req/day, 64K tok/min output, OpenAI-compatible API — most generous free tier
- Groq: 1,000 req/day, 12K tok/min — reliable backup if Cerebras is down
- Both accessible via LiteLLM with `LitellmModel(model="cerebras/llama-3.3-70b")`
- Llama 3.3 70B provides strong instruction-following and RAG grounding quality
- Environment variable toggle (`USE_FREE_MODEL`) switches between free and paid models

**Alternatives considered**:
- **GPT-4o-mini**: Best quality but costs $0.15/$0.60 per 1M tokens. Reserved for production.
- **Sambanova**: Free tier exists but lower rate limits and less documentation
- **Google Gemini**: Generous free tier but LiteLLM integration less tested

## R3: Vector Database (Qdrant Cloud)

**Decision**: Qdrant Cloud Free Tier with `AsyncQdrantClient`

**Rationale**:
- Constitution mandates Qdrant Cloud Free Tier
- Free tier: 1GB storage, sufficient for ~400-500 textbook chunks
- `qdrant-client` Python package provides `AsyncQdrantClient` for non-blocking operations
- `query_points()` method for similarity search, supports metadata filtering
- 1536-dimension vectors with COSINE distance (matches text-embedding-3-small output)

**Key patterns**:
```python
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Collection: 1536-dim, COSINE distance
# query_points(collection_name, query=vector, limit=5)
# upsert(collection_name, points=[PointStruct(...)])
```

## R4: Embedding Model

**Decision**: OpenAI `text-embedding-3-small` (1536 dimensions)

**Rationale**:
- Constitution mandates this specific model
- $0.02 per 1M tokens — extremely cheap (~$0.01 to embed entire book)
- 1536 dimensions provides good quality/cost tradeoff
- Same model for ingestion and query embedding ensures vector space consistency

**Alternatives considered**:
- **text-embedding-3-large**: Better quality but 3072 dims doubles storage cost. Overkill for 16 chapters.
- **Free embedding models**: Quality significantly lower for technical content. Cost is negligible.

## R5: Document Chunking Strategy

**Decision**: `RecursiveCharacterTextSplitter` with markdown-aware separators

**Rationale**:
- Splits on heading boundaries first (`## `, `### `), then paragraphs, then sentences
- 1000 character chunks (~200-250 tokens) balance context vs. precision
- 100 character overlap (10%) prevents losing context at boundaries
- `langchain-text-splitters` package provides battle-tested implementation

**Key patterns**:
```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n## ", "\n### ", "\n\n", "\n", " "]
)
```

## R6: MDX Preprocessing

**Decision**: Strip MDX components and frontmatter before chunking

**Rationale**:
- MDX files contain YAML frontmatter, JSX imports, and React components that aren't useful for search
- Regex-based stripping is simpler and faster than full MDX parsing
- Preserve markdown headings, paragraphs, code blocks, and list items
- Extract frontmatter metadata (title, description, keywords) separately for chunk metadata

**Approach**:
1. Extract YAML frontmatter → metadata dict
2. Remove `import` statements and JSX component tags
3. Remove admonition markers (`:::tip`, `:::note`) but keep their text content
4. Keep code blocks (valuable for technical Q&A)
5. Keep Mermaid diagrams as text (they describe architecture)

## R7: Session Management

**Decision**: `SQLiteSession` from openai-agents SDK for conversation memory

**Rationale**:
- Built into the SDK — zero custom code needed
- Stores conversation history per session_id
- SQLite file is lightweight and sufficient for hackathon scale
- Session_id generated client-side (UUID v4), passed with each request
- No cross-device persistence required (per spec assumptions)

**Alternatives considered**:
- **Neon Postgres sessions**: More durable but adds complexity. SQLite is simpler and meets requirements.
- **Redis**: Fast but another service to manage. Over-engineering for hackathon.
- **In-memory dict**: Lost on restart. SQLite persists across restarts.

## R8: Streaming Architecture

**Decision**: FastAPI `StreamingResponse` with Server-Sent Events (SSE)

**Rationale**:
- `Runner.run_streamed()` provides async event iterator
- SSE is simpler than WebSocket for unidirectional streaming (server → client)
- Native browser `EventSource` API on client side — no extra library needed
- Event types: `delta` (text chunks), `tool_call` (search indicator), `done` (completion signal)

**Key pattern**:
```python
async def event_generator():
    result = Runner.run_streamed(agent, input=message, context=ctx, session=session)
    async for event in result.stream_events():
        if event.type == "raw_response_event":
            if isinstance(event.data, ResponseTextDeltaEvent):
                yield f"data: {json.dumps({'type': 'delta', 'content': event.data.delta})}\n\n"
    yield f"data: {json.dumps({'type': 'done'})}\n\n"

return StreamingResponse(event_generator(), media_type="text/event-stream")
```

## R9: Frontend Widget Architecture

**Decision**: Docusaurus React component with SSE client via `fetch()` + `ReadableStream`

**Rationale**:
- Docusaurus is React-based — custom components integrate natively
- `EventSource` API doesn't support POST requests (needed for sending messages)
- Use `fetch()` with `ReadableStream` reader for POST-based SSE streaming
- Component registered as Docusaurus theme component, auto-injected on all pages
- State managed with React `useState`/`useReducer` — no external state library needed

**Alternatives considered**:
- **iframe embed**: Isolated but no text selection integration, harder to style
- **Web Component**: Framework-agnostic but adds complexity vs. native React in Docusaurus
- **Third-party chat widget (Crisp, Intercom)**: No RAG integration, no customization

## R10: Backend Deployment

**Decision**: Deploy FastAPI backend to a free cloud host (Railway / Render / Fly.io)

**Rationale**:
- GitHub Pages is static-only — backend needs a separate host
- Railway: Free tier with 500 hours/month, easy Python deployment, auto-sleep
- Render: Free tier with auto-sleep, 750 hours/month
- Fly.io: Free tier with 3 shared VMs
- All support environment variables for secrets management
- Specific provider chosen at deployment time, not architecture-affecting

**CORS configuration**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://abdulrehman346790.github.io"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```
