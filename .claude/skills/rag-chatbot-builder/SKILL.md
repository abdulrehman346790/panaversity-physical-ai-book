---
name: rag-chatbot-builder
description: Builds RAG (Retrieval-Augmented Generation) chatbot with FastAPI backend, Qdrant Cloud vector store, Neon Serverless Postgres, and OpenAI Agents SDK (v0.8+). Use when implementing the chatbot, ingestion pipeline, or embedding service.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# RAG Chatbot Builder

You are an expert in building production-grade RAG chatbots using the **OpenAI Agents SDK** (`openai-agents` v0.8+). You build the integrated chatbot for the Physical AI textbook.

## Required Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Backend API | FastAPI (Python 3.11+) | Async throughout |
| Agent Framework | `openai-agents` v0.8+ | `pip install 'openai-agents[litellm]'` |
| Vector Database | Qdrant Cloud (Free Tier) | 1536-dim, COSINE distance |
| Relational Database | Neon Serverless Postgres | Sessions, user data, metadata |
| Embeddings | OpenAI `text-embedding-3-small` | 1536 dims, $0.02/1M tokens |
| LLM (Production) | GPT-4o-mini or GPT-4o | Via OpenAI API |
| LLM (Free Testing) | Cerebras Llama 3.3 70B | 14,400 req/day, OpenAI-compatible |
| LLM (Backup Free) | Groq Llama 3.3 70B | 1,000 req/day, 12K tok/min |
| Frontend Widget | Embedded in Docusaurus (React) | SSE streaming |

## Critical SDK Information

### Package & Imports (DO NOT get these wrong)

```bash
# Install
pip install 'openai-agents[litellm]'

# The package is "openai-agents" but imports are from "agents"
```

```python
# CORRECT imports
from agents import Agent, Runner, function_tool, RunContextWrapper
from agents import SQLiteSession, RunConfig
from agents.extensions.models.litellm_model import LitellmModel

# WRONG - do NOT use these
# from openai_agents import ...  # WRONG package name
# from openai import Agent       # WRONG - Agent is NOT in openai package
```

### Free Model Configuration (for testing without OpenAI costs)

```python
from agents import Agent, RunConfig
from agents.extensions.models.litellm_model import LitellmModel

# Option 1: Cerebras Llama 3.3 70B (RECOMMENDED - 14,400 req/day free)
CEREBRAS_MODEL = LitellmModel(model="cerebras/llama-3.3-70b")

# Option 2: Groq Llama 3.3 70B (1,000 req/day free)
GROQ_MODEL = LitellmModel(model="groq/llama-3.3-70b-versatile")

# Option 3: Groq Llama 3.1 8B (14,400 req/day, smaller model)
GROQ_SMALL_MODEL = LitellmModel(model="groq/llama-3.1-8b-instant")

# Usage: pass model to Agent or RunConfig
agent = Agent(
    name="RAG Bot",
    instructions="...",
    model=CEREBRAS_MODEL,  # Free testing model
)

# Or override at runtime:
result = await Runner.run(
    agent, input="...",
    run_config=RunConfig(model=CEREBRAS_MODEL),
)
```

**Environment variables for free providers:**
```env
# Cerebras (get key at: https://cloud.cerebras.ai/)
CEREBRAS_API_KEY=csk-...

# Groq (get key at: https://console.groq.com/)
GROQ_API_KEY=gsk_...
```

## Architecture

```
Docusaurus Book (GitHub Pages)
    |
    | SSE (Server-Sent Events)
    v
FastAPI Backend (deployed separately)
    |
    +-- POST /api/chat/stream     --> Runner.run_streamed() + SSE
    +-- POST /api/chat            --> Runner.run() (non-streaming)
    +-- POST /api/chat/selected   --> Selected text Q&A
    +-- POST /api/ingest          --> Ingest MDX chapters
    +-- GET  /api/health          --> Health check
    |
    +-- OpenAI Agents SDK
    |     +-- Agent (with instructions + tools)
    |     +-- @function_tool search_docs (Qdrant RAG)
    |     +-- SQLiteSession (conversation memory)
    |     +-- RunContextWrapper (dependency injection)
    |
    +-- Qdrant Cloud (vector search)
    +-- Neon Postgres (sessions, metadata)
    +-- OpenAI API (embeddings only)
```

## Project Structure

```
chatbot/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + lifespan
│   ├── config.py               # Settings from env vars (Pydantic BaseSettings)
│   ├── context.py              # AppContext dataclass for RunContextWrapper
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py             # Chat endpoints (stream + non-stream)
│   │   └── ingest.py           # Content ingestion endpoints
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── rag_agent.py        # Agent definition + tools
│   │   └── tools.py            # @function_tool definitions
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding.py        # OpenAI embedding service
│   │   ├── vector_store.py     # Qdrant operations
│   │   └── ingestion.py        # MDX parsing + chunking
│   └── models/
│       ├── __init__.py
│       └── schemas.py          # Pydantic request/response models
├── scripts/
│   ├── ingest_book.py          # Bulk ingest all chapters
│   └── setup_collections.py   # Initialize Qdrant collections
├── requirements.txt
├── .env.example
└── Dockerfile
```

## Key Implementation Patterns

### 1. Application Context (Dependency Injection)

```python
# app/context.py
from dataclasses import dataclass
from qdrant_client import AsyncQdrantClient
from openai import AsyncOpenAI

@dataclass
class AppContext:
    """Injected into all @function_tool calls via RunContextWrapper.
    Never sent to the LLM - purely local."""
    qdrant: AsyncQdrantClient
    openai: AsyncOpenAI
    collection_name: str = "book_chapters"
```

### 2. RAG Tool Definition

```python
# app/agent/tools.py
from agents import function_tool, RunContextWrapper
from app.context import AppContext

@function_tool
async def search_docs(ctx: RunContextWrapper[AppContext], query: str) -> str:
    """Search the Physical AI textbook for information relevant to the query.
    Use this tool whenever the user asks a question about the course content."""

    # 1. Embed the query
    emb_response = await ctx.context.openai.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    query_vector = emb_response.data[0].embedding

    # 2. Search Qdrant
    results = await ctx.context.qdrant.query_points(
        collection_name=ctx.context.collection_name,
        query=query_vector,
        limit=5,
    )

    # 3. Format results for the agent
    if not results.points:
        return "No relevant documents found in the textbook."

    parts = []
    for pt in results.points:
        source = pt.payload.get("chapter", "unknown")
        section = pt.payload.get("section", "")
        text = pt.payload.get("text", "")
        parts.append(f"[Chapter: {source} | Section: {section}]\n{text}")

    return "\n\n---\n\n".join(parts)
```

### 3. Agent Definition

```python
# app/agent/rag_agent.py
from agents import Agent
from agents.extensions.models.litellm_model import LitellmModel
from app.agent.tools import search_docs
from app.context import AppContext
from app.config import settings

def get_model():
    """Return model based on configuration."""
    if settings.USE_FREE_MODEL:
        return LitellmModel(model=settings.FREE_MODEL_ID)
    return settings.OPENAI_MODEL  # e.g., "gpt-4o-mini"

rag_agent = Agent[AppContext](
    name="Physical AI Tutor",
    instructions="""You are a knowledgeable tutor for the Physical AI & Humanoid Robotics textbook.

RULES:
1. ALWAYS use the search_docs tool before answering questions about course content.
2. Base your answers on the retrieved documents. Cite chapters and sections.
3. If no relevant documents are found, say so honestly.
4. Explain concepts clearly as a patient teacher would.
5. When showing code, ensure it's accurate to ROS 2, Gazebo, Isaac, or VLA patterns.
6. Keep answers concise but thorough.""",
    tools=[search_docs],
    model=get_model(),
)
```

### 4. FastAPI Streaming Endpoint

```python
# app/routers/chat.py
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from agents import Runner, SQLiteSession
from openai.types.responses import ResponseTextDeltaEvent
from app.agent.rag_agent import rag_agent
from app.context import AppContext
from app.models.schemas import ChatRequest

router = APIRouter(prefix="/api")

# In-memory session store (use Redis/Postgres in production)
sessions: dict[str, SQLiteSession] = {}

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, app_ctx: AppContext):
    """Streaming chat endpoint using Server-Sent Events."""
    if request.session_id not in sessions:
        sessions[request.session_id] = SQLiteSession(request.session_id)

    async def event_generator():
        result = Runner.run_streamed(
            rag_agent,
            input=request.message,
            context=app_ctx,
            session=sessions[request.session_id],
        )
        async for event in result.stream_events():
            if event.type == "raw_response_event":
                if isinstance(event.data, ResponseTextDeltaEvent):
                    data = json.dumps({"type": "delta", "content": event.data.delta})
                    yield f"data: {data}\n\n"
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    data = json.dumps({"type": "tool_call", "tool": event.item.raw_item.name})
                    yield f"data: {data}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )

@router.post("/chat")
async def chat(request: ChatRequest, app_ctx: AppContext):
    """Non-streaming chat endpoint."""
    if request.session_id not in sessions:
        sessions[request.session_id] = SQLiteSession(request.session_id)

    result = await Runner.run(
        rag_agent,
        input=request.message,
        context=app_ctx,
        session=sessions[request.session_id],
    )
    return {"response": result.final_output}
```

### 5. Selected Text Feature

```python
@router.post("/chat/selected")
async def chat_selected(request: SelectedTextRequest, app_ctx: AppContext):
    """Answer questions about text the user selected on the page."""
    from agents import Agent

    # Create a specialized agent with selected text in instructions
    selected_agent = Agent[AppContext](
        name="Selected Text Tutor",
        instructions=f"""You are a helpful tutor. The student selected this text:

SELECTED TEXT:
{request.selected_text}

Answer their question based primarily on this text, supplemented by
relevant context from the textbook via search_docs.""",
        tools=[search_docs],
        model=rag_agent.model,
    )

    result = await Runner.run(
        selected_agent,
        input=request.question,
        context=app_ctx,
    )
    return {"response": result.final_output}
```

### 6. Document Chunking (Ingestion)

```python
# app/services/ingestion.py
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_chapter(content: str, metadata: dict) -> list[dict]:
    """Chunk a chapter into pieces for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,       # ~200-250 tokens
        chunk_overlap=100,     # 10% overlap
        separators=["\n## ", "\n### ", "\n\n", "\n", " "]
    )
    chunks = splitter.split_text(content)
    return [
        {
            "text": chunk,
            "metadata": {
                "chapter": metadata.get("chapter", ""),
                "module": metadata.get("module", ""),
                "section": metadata.get("section", ""),
                "chunk_index": i,
            }
        }
        for i, chunk in enumerate(chunks)
    ]
```

### 7. Qdrant Collection Setup

```python
# scripts/setup_collections.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

client.create_collection(
    collection_name="book_chapters",
    vectors_config=VectorParams(
        size=1536,  # text-embedding-3-small
        distance=Distance.COSINE,
    )
)
```

### 8. Pydantic Request/Response Models

```python
# app/models/schemas.py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class SelectedTextRequest(BaseModel):
    selected_text: str
    question: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str

class HealthResponse(BaseModel):
    status: str
    qdrant: bool
    model: str
```

## Environment Variables

```env
# OpenAI (required for embeddings, optional for LLM)
OPENAI_API_KEY=sk-...

# Free model for testing (pick one)
USE_FREE_MODEL=true
FREE_MODEL_ID=cerebras/llama-3.3-70b
CEREBRAS_API_KEY=csk-...
# GROQ_API_KEY=gsk_...

# Qdrant Cloud
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=...

# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# App Config
CORS_ORIGINS=https://abdulrehman346790.github.io
EMBEDDING_MODEL=text-embedding-3-small
```

## Key SDK Gotchas

1. **NEVER use `Runner.run_sync()` in FastAPI** - it blocks the event loop. Use `Runner.run()` or `Runner.run_streamed()`.
2. **`@function_tool` relies on docstrings** - always write clear docstrings for tools.
3. **`RunContextWrapper` is never sent to the LLM** - purely local dependency injection.
4. **Sessions must be passed explicitly** to each `Runner.run()` call.
5. **Package is `openai-agents`, import is `from agents import ...`** - not `from openai_agents`.
6. **Streaming pauses during tool execution** - show a "searching..." indicator in the UI.

## Quality Checklist

- [ ] Chat endpoint returns answers grounded in book content
- [ ] Streaming endpoint sends SSE events correctly
- [ ] Selected text feature works (user highlights text, asks question)
- [ ] Sources are cited in agent responses
- [ ] CORS configured for GitHub Pages domain
- [ ] Rate limiting implemented
- [ ] Error handling for API failures (OpenAI, Qdrant, Postgres)
- [ ] Conversation history maintained via SQLiteSession
- [ ] Ingestion pipeline processes all 16 MDX chapters
- [ ] Vector search returns relevant chunks
- [ ] Free model (Cerebras/Groq) works for testing
- [ ] Can switch to GPT-4o-mini for production via env var
