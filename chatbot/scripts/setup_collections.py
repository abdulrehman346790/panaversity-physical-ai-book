"""Setup Qdrant collections and Neon Postgres tables."""
import asyncio
import os
import sys

from dotenv import load_dotenv

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
load_dotenv()

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams


async def setup_qdrant():
    """Create the book_chapters collection in Qdrant Cloud."""
    url = os.environ.get("QDRANT_URL", "")
    api_key = os.environ.get("QDRANT_API_KEY", "")

    if not url or not api_key:
        print("ERROR: QDRANT_URL and QDRANT_API_KEY must be set in .env")
        return

    client = AsyncQdrantClient(url=url, api_key=api_key)

    try:
        collections = await client.get_collections()
        existing = [c.name for c in collections.collections]

        if "book_chapters" in existing:
            print("Collection 'book_chapters' already exists. Skipping.")
        else:
            await client.create_collection(
                collection_name="book_chapters",
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
            )
            print("Created collection 'book_chapters' (1536-dim, COSINE)")
    finally:
        await client.close()


async def setup_postgres():
    """Create the ingestion_records table in Neon Postgres."""
    database_url = os.environ.get("DATABASE_URL", "")

    if not database_url:
        print("WARNING: DATABASE_URL not set. Skipping Postgres setup.")
        return

    try:
        import psycopg

        async with await psycopg.AsyncConnection.connect(database_url) as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS ingestion_records (
                        id SERIAL PRIMARY KEY,
                        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        completed_at TIMESTAMPTZ,
                        chapters_processed INTEGER NOT NULL DEFAULT 0,
                        chunks_created INTEGER NOT NULL DEFAULT 0,
                        errors JSONB DEFAULT '[]'::jsonb,
                        status TEXT NOT NULL DEFAULT 'running'
                            CHECK (status IN ('running', 'completed', 'failed'))
                    )
                """)
                await cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_ingestion_started_at
                    ON ingestion_records(started_at DESC)
                """)
            await conn.commit()
        print("Created table 'ingestion_records' in Neon Postgres")
    except ImportError:
        print("WARNING: psycopg not installed. Skipping Postgres setup.")
    except Exception as e:
        print(f"WARNING: Postgres setup failed: {e}")


async def main():
    print("=== Setting up Qdrant collections ===")
    await setup_qdrant()
    print()
    print("=== Setting up Neon Postgres tables ===")
    await setup_postgres()
    print()
    print("Setup complete!")


if __name__ == "__main__":
    asyncio.run(main())
