import httpx
from openai import AsyncOpenAI
from app.config import settings


async def embed_text_ollama(text: str, model: str = "nomic-embed-text") -> list[float]:
    """Embed text using local Ollama."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.ollama_url}/api/embeddings",
            json={"model": model, "prompt": text}
        )
        response.raise_for_status()
        data = response.json()
        return data.get("embedding", [])


async def embed_texts_ollama(texts: list[str], model: str = "nomic-embed-text") -> list[list[float]]:
    """Embed multiple texts using local Ollama."""
    if not texts:
        return []
    embeddings = []
    for text in texts:
        embedding = await embed_text_ollama(text, model)
        embeddings.append(embedding)
    return embeddings


async def embed_text(client: AsyncOpenAI, text: str, model: str = "text-embedding-3-small") -> list[float]:
    """Embed a single text string and return the vector."""
    if settings.use_ollama:
        return await embed_text_ollama(text, settings.ollama_embedding_model)
    response = await client.embeddings.create(input=text, model=model)
    return response.data[0].embedding


async def embed_texts(client: AsyncOpenAI, texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """Embed multiple texts in a single batch call."""
    if not texts:
        return []
    if settings.use_ollama:
        return await embed_texts_ollama(texts, settings.ollama_embedding_model)
    response = await client.embeddings.create(input=texts, model=model)
    return [item.embedding for item in response.data]
