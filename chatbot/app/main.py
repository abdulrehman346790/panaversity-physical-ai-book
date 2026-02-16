import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient

from app.config import settings
from app.context import AppContext
from app.models.schemas import HealthResponse, ErrorResponse
from app.services.vector_store import count_points, create_collection

load_dotenv()

# Set API keys as env vars for LiteLLM
if settings.cerebras_api_key:
    os.environ["CEREBRAS_API_KEY"] = settings.cerebras_api_key
if settings.groq_api_key:
    os.environ["GROQ_API_KEY"] = settings.groq_api_key


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize clients
    qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key, timeout=10.0)
    # OpenAI client is optional - we use LiteLLM/Cerebras for LLM
    openai_client = None
    if settings.openai_api_key:
        openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

    app.state.ctx = AppContext(qdrant=qdrant, openai=openai_client)

    # Ensure collection exists
    try:
        await create_collection(qdrant, "book_chapters")
    except Exception:
        pass  # Collection may already exist

    yield

    # Shutdown: close clients
    await qdrant.close()
    await openai_client.close()


app = FastAPI(
    title="Physical AI Textbook RAG Chatbot",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(error="Internal server error", detail=str(exc)).model_dump(),
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check(request: Request):
    ctx: AppContext = request.app.state.ctx
    qdrant_ok = False
    chunks = 0
    try:
        chunks = await count_points(ctx.qdrant, ctx.collection_name)
        qdrant_ok = True
    except Exception:
        pass

    model_name = settings.free_model_id if settings.use_free_model else "gpt-4o-mini"
    status = "healthy" if qdrant_ok else "degraded"

    return HealthResponse(status=status, qdrant=qdrant_ok, model=model_name, chunks_count=chunks)


# Import and include routers
from app.routers import chat, ingest

app.include_router(chat.router)
app.include_router(ingest.router)
