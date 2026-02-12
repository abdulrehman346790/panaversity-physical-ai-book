---
name: rag-chatbot-builder
description: Builds RAG (Retrieval-Augmented Generation) chatbot with FastAPI backend, Qdrant Cloud vector store, Neon Serverless Postgres, and OpenAI Agents SDK. Use when implementing the chatbot, ingestion pipeline, or embedding service.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# RAG Chatbot Builder

You are an expert in building production-grade RAG chatbots. You build the integrated chatbot for the Physical AI textbook using the required tech stack.

## Required Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | FastAPI (Python 3.11+) |
| Vector Database | Qdrant Cloud (Free Tier) |
| Relational Database | Neon Serverless Postgres |
| Chat SDK | OpenAI Agents SDK / ChatKit SDK |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI GPT-4o-mini or GPT-4o |
| Frontend Widget | Embedded in Docusaurus (React component) |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Docusaurus Book                 │
│  ┌───────────────────────────────────────────┐  │
│  │          ChatWidget (React)               │  │
│  │  - Floating chat button                   │  │
│  │  - Selected text context                  │  │
│  │  - Conversation history                   │  │
│  └──────────────┬────────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │ HTTP/WebSocket
                  ▼
┌─────────────────────────────────────────────────┐
│              FastAPI Backend                      │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │ /chat    │ │ /ingest  │ │ /chat/selected  │ │
│  └────┬─────┘ └────┬─────┘ └───────┬─────────┘ │
│       │            │               │             │
│  ┌────▼────────────▼───────────────▼──────────┐ │
│  │           RAG Pipeline                      │ │
│  │  1. Embed query (OpenAI)                    │ │
│  │  2. Search vectors (Qdrant)                 │ │
│  │  3. Build context prompt                    │ │
│  │  4. Generate response (OpenAI Agents SDK)   │ │
│  └─────────────────────────────────────────────┘ │
└──────────┬──────────────────┬────────────────────┘
           │                  │
     ┌─────▼─────┐    ┌──────▼──────┐
     │  Qdrant   │    │    Neon     │
     │  Cloud    │    │  Postgres   │
     │ (vectors) │    │ (metadata,  │
     │           │    │  sessions,  │
     │           │    │  users)     │
     └───────────┘    └─────────────┘
```

## Project Structure

```
chatbot/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings from env vars
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py             # Chat endpoints
│   │   └── ingest.py           # Content ingestion endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding.py        # OpenAI embedding service
│   │   ├── vector_store.py     # Qdrant operations
│   │   ├── rag_pipeline.py     # RAG orchestration
│   │   └── agent.py            # OpenAI Agents SDK integration
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py          # Pydantic models
│   │   └── database.py         # Neon Postgres models
│   └── utils/
│       ├── __init__.py
│       ├── chunker.py          # Document chunking
│       └── markdown_parser.py  # Parse MDX content
├── scripts/
│   ├── ingest_book.py          # Bulk ingest all chapters
│   └── setup_collections.py   # Initialize Qdrant collections
├── requirements.txt
├── .env.example
└── Dockerfile
```

## Key Implementation Patterns

### 1. Document Chunking Strategy

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_chapter(content: str, metadata: dict) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=512,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "]
    )
    chunks = splitter.split_text(content)
    return [
        {
            "text": chunk,
            "metadata": {
                **metadata,
                "chunk_index": i,
            }
        }
        for i, chunk in enumerate(chunks)
    ]
```

### 2. Qdrant Collection Setup

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

client.create_collection(
    collection_name="book_chapters",
    vectors_config=VectorParams(
        size=1536,  # text-embedding-3-small dimension
        distance=Distance.COSINE
    )
)
```

### 3. FastAPI Chat Endpoint

```python
@router.post("/chat")
async def chat(request: ChatRequest):
    # 1. Embed the user query
    query_embedding = await embedding_service.embed(request.message)

    # 2. Search Qdrant for relevant chunks
    results = await vector_store.search(
        query_embedding,
        limit=5,
        filter_conditions=request.filters  # optional chapter filter
    )

    # 3. Build context from retrieved chunks
    context = "\n\n".join([r.payload["text"] for r in results])

    # 4. Generate response using OpenAI Agents SDK
    response = await agent_service.generate(
        query=request.message,
        context=context,
        selected_text=request.selected_text  # for selected-text feature
    )

    return ChatResponse(
        answer=response.content,
        sources=[r.payload["metadata"] for r in results]
    )
```

### 4. Selected Text Feature

The chatbot must support answering questions about user-selected text:

```python
@router.post("/chat/selected")
async def chat_selected(request: SelectedTextRequest):
    """Answer questions about text the user selected on the page."""
    system_prompt = f"""You are a helpful tutor for the Physical AI textbook.
    The student has selected the following text and has a question about it:

    SELECTED TEXT:
    {request.selected_text}

    Answer based primarily on this selected text, supplemented by
    relevant context from the textbook."""

    # Still do RAG for supplementary context
    query_embedding = await embedding_service.embed(request.selected_text)
    results = await vector_store.search(query_embedding, limit=3)

    response = await agent_service.generate(
        query=request.question,
        context=context,
        system_prompt=system_prompt
    )
    return ChatResponse(answer=response.content, sources=results)
```

### 5. Docusaurus Chat Widget Integration

```jsx
// src/components/ChatWidget/index.jsx
import React, { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedText, setSelectedText] = useState('');

  // Listen for text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection().toString().trim();
      if (selection.length > 10) {
        setSelectedText(selection);
      }
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // ... chat UI implementation
}
```

## Environment Variables Required

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant Cloud
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=...

# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# App Config
CORS_ORIGINS=https://yourusername.github.io
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
```

## Quality Checklist

- [ ] Chat endpoint returns answers grounded in book content
- [ ] Selected text feature works (user highlights text, asks question)
- [ ] Sources are returned with each response
- [ ] CORS configured for GitHub Pages domain
- [ ] Rate limiting implemented
- [ ] Error handling for API failures
- [ ] Conversation history maintained per session
- [ ] Ingestion pipeline processes all MDX chapters
- [ ] Vector search returns relevant chunks
- [ ] Neon Postgres stores chat sessions and user data
