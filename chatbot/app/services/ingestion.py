import os
import re
import yaml
import logging
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient

from app.services.embedding import embed_texts
from app.services.vector_store import upsert_points, delete_by_filter

logger = logging.getLogger(__name__)


def extract_frontmatter(content: str) -> tuple[dict, str]:
    """Extract YAML frontmatter and return (metadata, body)."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if match:
        try:
            metadata = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            metadata = {}
        body = content[match.end() :]
        return metadata, body
    return {}, content


def preprocess_mdx(content: str) -> str:
    """Strip MDX-specific syntax while preserving readable text and code blocks."""
    # Remove import statements
    text = re.sub(r"^import\s+.*$", "", content, flags=re.MULTILINE)
    # Remove JSX self-closing tags like <Component />
    text = re.sub(r"<[A-Z][a-zA-Z]*\s*[^>]*/\s*>", "", text)
    # Remove JSX opening/closing tags like <Component> and </Component>
    text = re.sub(r"</?[A-Z][a-zA-Z]*[^>]*>", "", text)
    # Remove admonition markers but keep content
    text = re.sub(r"^:::.*$", "", text, flags=re.MULTILINE)
    # Clean up excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def detect_module(file_path: str) -> str:
    """Extract module name from file path."""
    parts = Path(file_path).parts
    for part in parts:
        if part.startswith("module-") or part == "appendices":
            return part
    return "unknown"


def detect_sections(text: str) -> list[tuple[str, str]]:
    """Split text by headings and return (heading, content) pairs."""
    sections = []
    current_heading = "Introduction"
    current_content = []

    for line in text.split("\n"):
        heading_match = re.match(r"^#{1,3}\s+(.+)$", line)
        if heading_match:
            if current_content:
                sections.append((current_heading, "\n".join(current_content)))
            current_heading = heading_match.group(1)
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections.append((current_heading, "\n".join(current_content)))

    return sections


def chunk_chapter(content: str, metadata: dict, file_path: str) -> list[dict]:
    """Chunk a chapter into pieces for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )

    module = detect_module(file_path)
    chapter_title = metadata.get("title", Path(file_path).stem)

    # Get section-aware chunks
    sections = detect_sections(content)
    chunks = []
    chunk_index = 0

    for section_heading, section_text in sections:
        section_chunks = splitter.split_text(section_text)
        for text in section_chunks:
            text = text.strip()
            if len(text) < 50:
                continue
            chunks.append(
                {
                    "text": text,
                    "metadata": {
                        "chapter": chapter_title,
                        "module": module,
                        "section": section_heading,
                        "chunk_index": chunk_index,
                        "file_path": file_path,
                    },
                }
            )
            chunk_index += 1

    return chunks


async def ingest_chapter(
    qdrant: AsyncQdrantClient,
    openai_client: AsyncOpenAI,
    collection_name: str,
    file_path: str,
    embedding_model: str = "text-embedding-3-small",
) -> int:
    """Ingest a single chapter: parse, chunk, embed, store. Returns chunk count."""
    content = Path(file_path).read_text(encoding="utf-8")
    metadata, body = extract_frontmatter(content)
    clean_body = preprocess_mdx(body)
    chunks = chunk_chapter(clean_body, metadata, file_path)

    if not chunks:
        return 0

    # Delete old points for this file
    try:
        await delete_by_filter(qdrant, collection_name, "file_path", file_path)
    except Exception:
        pass  # May not exist yet

    # Embed all chunks in batch
    texts = [c["text"] for c in chunks]
    vectors = await embed_texts(openai_client, texts, embedding_model)

    # Prepare points for upsert
    points = [
        {"vector": vec, "payload": {**chunk["metadata"], "text": chunk["text"]}}
        for vec, chunk in zip(vectors, chunks)
    ]

    await upsert_points(qdrant, collection_name, points)
    return len(points)


async def ingest_all_chapters(
    qdrant: AsyncQdrantClient,
    openai_client: AsyncOpenAI,
    collection_name: str,
    docs_path: str,
    embedding_model: str = "text-embedding-3-small",
) -> dict:
    """Ingest all MDX/MD files from the docs directory."""
    docs_dir = Path(docs_path)
    if not docs_dir.exists():
        return {"status": "failed", "chapters_processed": 0, "chunks_created": 0, "errors": [{"file": docs_path, "error": "Directory not found"}]}

    files = list(docs_dir.rglob("*.mdx")) + list(docs_dir.rglob("*.md"))
    chapters_processed = 0
    chunks_created = 0
    errors = []

    for file_path in sorted(files):
        try:
            count = await ingest_chapter(qdrant, openai_client, collection_name, str(file_path), embedding_model)
            chapters_processed += 1
            chunks_created += count
            logger.info(f"Ingested {file_path.name}: {count} chunks")
        except Exception as e:
            logger.error(f"Failed to ingest {file_path.name}: {e}")
            errors.append({"file": str(file_path), "error": str(e)})

    status = "completed" if not errors else "completed"
    if chapters_processed == 0 and errors:
        status = "failed"

    return {
        "status": status,
        "chapters_processed": chapters_processed,
        "chunks_created": chunks_created,
        "errors": errors,
    }
