import logging
from pathlib import Path

from fastapi import APIRouter, Request, HTTPException

from app.context import AppContext
from app.models.schemas import IngestRequest, IngestResponse
from app.services.ingestion import ingest_all_chapters

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.post("/ingest", response_model=IngestResponse)
async def ingest_content(request: Request, body: IngestRequest = IngestRequest()):
    """Parse, chunk, embed, and store all MDX chapter files."""
    ctx: AppContext = request.app.state.ctx

    docs_path = body.docs_path
    if not Path(docs_path).is_absolute():
        # Resolve relative to project root (two levels up from chatbot/app/)
        import os

        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        docs_path = os.path.join(project_root, docs_path)

    if not Path(docs_path).is_dir():
        raise HTTPException(status_code=404, detail=f"Docs directory not found: {docs_path}")

    logger.info(f"Starting ingestion from {docs_path}")

    result = await ingest_all_chapters(
        qdrant=ctx.qdrant,
        openai_client=ctx.openai,
        collection_name=ctx.collection_name,
        docs_path=docs_path,
    )

    return IngestResponse(**result)
