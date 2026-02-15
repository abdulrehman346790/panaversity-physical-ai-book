import json
import logging
import time

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse

from agents import Agent, Runner
from openai.types.responses import ResponseTextDeltaEvent

from app.agent.rag_agent import rag_agent
from app.agent.tools import search_docs
from app.context import AppContext
from app.models.schemas import ChatRequest, SelectedTextRequest, ChatResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

# In-memory session store (session_id -> conversation history)
# Using simple list-based memory since SQLiteSession may not be available
sessions: dict[str, list[dict]] = {}

# Rate limiting: session_id -> list of timestamps
rate_limits: dict[str, list[float]] = {}
MAX_REQUESTS_PER_MINUTE = 30


def check_rate_limit(session_id: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = time.time()
    if session_id not in rate_limits:
        rate_limits[session_id] = []

    # Clean old entries (older than 60 seconds)
    rate_limits[session_id] = [t for t in rate_limits[session_id] if now - t < 60]

    if len(rate_limits[session_id]) >= MAX_REQUESTS_PER_MINUTE:
        return False

    rate_limits[session_id].append(now)
    return True


def get_conversation_input(session_id: str, message: str) -> str:
    """Build input with conversation context for multi-turn support."""
    if session_id not in sessions:
        sessions[session_id] = []

    # Add the new user message
    sessions[session_id].append({"role": "user", "content": message})

    # Build context from recent history (last 10 turns)
    history = sessions[session_id][-20:]  # Last 10 exchanges (20 messages)

    if len(history) <= 1:
        return message

    # Include recent history as context
    context_parts = []
    for msg in history[:-1]:  # All but the current message
        role = "Student" if msg["role"] == "user" else "Tutor"
        context_parts.append(f"{role}: {msg['content']}")

    context = "\n".join(context_parts)
    return f"Previous conversation:\n{context}\n\nCurrent question: {message}"


def save_assistant_response(session_id: str, response: str) -> None:
    """Save assistant response to session history."""
    if session_id in sessions:
        sessions[session_id].append({"role": "assistant", "content": response})


@router.post("/chat/stream")
async def chat_stream(request: Request, body: ChatRequest):
    """Streaming chat endpoint using Server-Sent Events."""
    ctx: AppContext = request.app.state.ctx

    if not check_rate_limit(body.session_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 30 requests per minute.")

    conversation_input = get_conversation_input(body.session_id, body.message)

    async def event_generator():
        full_response = ""
        try:
            result = Runner.run_streamed(
                rag_agent,
                input=conversation_input,
                context=ctx,
            )
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        delta = event.data.delta
                        full_response += delta
                        data = json.dumps({"type": "delta", "content": delta})
                        yield f"data: {data}\n\n"
                elif event.type == "run_item_stream_event":
                    if hasattr(event.item, "type") and event.item.type == "tool_call_item":
                        tool_name = getattr(event.item.raw_item, "name", "search_docs")
                        data = json.dumps({"type": "tool_call", "tool": tool_name})
                        yield f"data: {data}\n\n"
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            data = json.dumps({"type": "error", "content": str(e)})
            yield f"data: {data}\n\n"

        save_assistant_response(body.session_id, full_response)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(request: Request, body: ChatRequest):
    """Non-streaming chat endpoint."""
    ctx: AppContext = request.app.state.ctx

    if not check_rate_limit(body.session_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 30 requests per minute.")

    conversation_input = get_conversation_input(body.session_id, body.message)

    result = await Runner.run(
        rag_agent,
        input=conversation_input,
        context=ctx,
    )

    response_text = result.final_output
    save_assistant_response(body.session_id, response_text)

    return ChatResponse(response=response_text)


@router.post("/chat/selected", response_model=ChatResponse)
async def chat_selected(request: Request, body: SelectedTextRequest):
    """Answer questions about text the user selected on the page."""
    ctx: AppContext = request.app.state.ctx

    if not check_rate_limit(body.session_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 30 requests per minute.")

    # Create a specialized agent with selected text in instructions
    selected_agent = Agent[AppContext](
        name="Selected Text Tutor",
        instructions=f"""You are a helpful tutor for the Physical AI & Humanoid Robotics textbook.

The student selected this text from the textbook:

SELECTED TEXT:
{body.selected_text}

Answer their question based primarily on this selected text, supplemented by
relevant context from the textbook via search_docs. Always cite sources.
If the selected text is sufficient to answer, you may answer directly.""",
        tools=[search_docs],
        model=rag_agent.model,
    )

    result = await Runner.run(
        selected_agent,
        input=body.question,
        context=ctx,
    )

    return ChatResponse(response=result.final_output)
