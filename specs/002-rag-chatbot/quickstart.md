# Quickstart: RAG Chatbot (002-rag-chatbot)

**Date**: 2026-02-13
**Branch**: `002-rag-chatbot`

## Prerequisites

- Python 3.11+
- Node.js 20+ (for Docusaurus frontend)
- API keys: OpenAI, Cerebras (or Groq), Qdrant Cloud
- Neon Postgres database

## 1. Backend Setup

```bash
# From repo root
cd chatbot

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

## 2. Environment Configuration

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# OpenAI (required for embeddings)
OPENAI_API_KEY=sk-...

# Free model for testing
USE_FREE_MODEL=true
FREE_MODEL_ID=cerebras/llama-3.3-70b
CEREBRAS_API_KEY=csk-...

# Qdrant Cloud
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=...

# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# CORS
CORS_ORIGINS=http://localhost:3000,https://abdulrehman346790.github.io
```

## 3. Initialize Services

```bash
# Setup Qdrant collection
python scripts/setup_collections.py

# Ingest book content (creates embeddings and stores in Qdrant)
python scripts/ingest_book.py
```

## 4. Run Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/api/health`

## 5. Run Frontend (Development)

```bash
# From repo root
cd physical-ai-book
npm start
```

The chat widget should appear on every page at bottom-right.

## 6. Test the Full Flow

1. Open `http://localhost:3000/docs/module-1-ros2/intro-physical-ai`
2. Click the chat button (bottom-right)
3. Type: "What is Physical AI?"
4. Verify: streaming response with chapter citations

## API Key Setup Links

| Service | Free Tier | Signup |
|---------|-----------|--------|
| OpenAI | $5 credit | https://platform.openai.com/api-keys |
| Cerebras | 14,400 req/day | https://cloud.cerebras.ai/ |
| Groq | 1,000 req/day | https://console.groq.com/ |
| Qdrant Cloud | 1GB storage | https://cloud.qdrant.io/ |
| Neon Postgres | 0.5GB storage | https://neon.tech/ |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError: agents` | Run `pip install 'openai-agents[litellm]'` |
| CORS errors in browser | Add `http://localhost:3000` to `CORS_ORIGINS` |
| Qdrant connection refused | Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env` |
| Empty search results | Run `python scripts/ingest_book.py` first |
| Cerebras rate limit | Switch to Groq: set `FREE_MODEL_ID=groq/llama-3.3-70b-versatile` |
