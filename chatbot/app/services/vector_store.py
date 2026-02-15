import uuid
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue


async def create_collection(client: AsyncQdrantClient, name: str, size: int = 1536) -> None:
    """Create a Qdrant collection if it doesn't exist."""
    collections = await client.get_collections()
    existing = [c.name for c in collections.collections]
    if name not in existing:
        await client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=size, distance=Distance.COSINE),
        )


async def upsert_points(client: AsyncQdrantClient, name: str, points: list[dict]) -> None:
    """Upsert points (vector + payload) into a collection."""
    qdrant_points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=p["vector"],
            payload=p["payload"],
        )
        for p in points
    ]
    # Batch in chunks of 100
    for i in range(0, len(qdrant_points), 100):
        batch = qdrant_points[i : i + 100]
        await client.upsert(collection_name=name, points=batch)


async def search(client: AsyncQdrantClient, name: str, vector: list[float], limit: int = 5) -> list:
    """Search for similar vectors and return scored points."""
    results = await client.query_points(
        collection_name=name,
        query=vector,
        limit=limit,
    )
    return results.points


async def delete_by_filter(client: AsyncQdrantClient, name: str, field: str, value: str) -> None:
    """Delete all points matching a payload field value."""
    await client.delete(
        collection_name=name,
        points_selector=Filter(
            must=[FieldCondition(key=field, match=MatchValue(value=value))]
        ),
    )


async def count_points(client: AsyncQdrantClient, name: str) -> int:
    """Count total points in a collection."""
    info = await client.get_collection(collection_name=name)
    return info.points_count or 0
