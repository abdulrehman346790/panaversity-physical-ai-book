from dataclasses import dataclass
from qdrant_client import AsyncQdrantClient
from openai import AsyncOpenAI


@dataclass
class AppContext:
    """Injected into all @function_tool calls via RunContextWrapper.
    Never sent to the LLM - purely local dependency injection."""

    qdrant: AsyncQdrantClient
    openai: AsyncOpenAI
    collection_name: str = "book_chapters"
