from agents import function_tool, RunContextWrapper

from app.context import AppContext
from app.services.embedding import embed_text
from app.services.vector_store import search


@function_tool
async def search_docs(ctx: RunContextWrapper[AppContext], query: str) -> str:
    """Search the Physical AI textbook for information relevant to the query.
    Use this tool whenever the user asks a question about the course content,
    ROS 2, Gazebo, NVIDIA Isaac, VLA models, or humanoid robotics."""

    # 1. Embed the query
    query_vector = await embed_text(ctx.context.openai, query)

    # 2. Search Qdrant
    results = await search(ctx.context.qdrant, ctx.context.collection_name, query_vector, limit=5)

    # 3. Format results for the agent
    if not results:
        return "No relevant documents found in the textbook."

    parts = []
    for pt in results:
        chapter = pt.payload.get("chapter", "unknown")
        section = pt.payload.get("section", "")
        text = pt.payload.get("text", "")
        module = pt.payload.get("module", "")
        parts.append(f"[Chapter: {chapter} | Module: {module} | Section: {section}]\n{text}")

    return "\n\n---\n\n".join(parts)
