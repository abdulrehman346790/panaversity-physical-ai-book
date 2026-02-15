from openai import AsyncOpenAI


async def embed_text(client: AsyncOpenAI, text: str, model: str = "text-embedding-3-small") -> list[float]:
    """Embed a single text string and return the vector."""
    response = await client.embeddings.create(input=text, model=model)
    return response.data[0].embedding


async def embed_texts(client: AsyncOpenAI, texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """Embed multiple texts in a single batch call."""
    if not texts:
        return []
    response = await client.embeddings.create(input=texts, model=model)
    return [item.embedding for item in response.data]
