"""Bulk ingest all textbook chapters into Qdrant."""
import asyncio
import os
import sys

from dotenv import load_dotenv

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
load_dotenv()

from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient

from app.services.ingestion import ingest_all_chapters
from app.services.vector_store import create_collection


async def main():
    qdrant_url = os.environ.get("QDRANT_URL", "")
    qdrant_key = os.environ.get("QDRANT_API_KEY", "")
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    embedding_model = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")

    if not qdrant_url or not qdrant_key:
        print("ERROR: QDRANT_URL and QDRANT_API_KEY must be set in .env")
        return

    if not openai_key:
        print("ERROR: OPENAI_API_KEY must be set in .env")
        return

    # Resolve docs path relative to repo root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)  # chatbot/
    repo_root = os.path.dirname(repo_root)    # project root
    docs_path = os.path.join(repo_root, "physical-ai-book", "docs")

    if not os.path.isdir(docs_path):
        print(f"ERROR: Docs directory not found: {docs_path}")
        return

    print(f"Docs path: {docs_path}")
    print(f"Embedding model: {embedding_model}")
    print()

    qdrant = AsyncQdrantClient(url=qdrant_url, api_key=qdrant_key)
    openai_client = AsyncOpenAI(api_key=openai_key)

    try:
        # Ensure collection exists
        await create_collection(qdrant, "book_chapters")

        print("Starting ingestion...")
        result = await ingest_all_chapters(
            qdrant=qdrant,
            openai_client=openai_client,
            collection_name="book_chapters",
            docs_path=docs_path,
            embedding_model=embedding_model,
        )

        print()
        print("=== Ingestion Summary ===")
        print(f"Status: {result['status']}")
        print(f"Chapters processed: {result['chapters_processed']}")
        print(f"Chunks created: {result['chunks_created']}")
        if result["errors"]:
            print(f"Errors ({len(result['errors'])}):")
            for err in result["errors"]:
                print(f"  - {err['file']}: {err['error']}")
    finally:
        await qdrant.close()
        await openai_client.close()


if __name__ == "__main__":
    asyncio.run(main())
