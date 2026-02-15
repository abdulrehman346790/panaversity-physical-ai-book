from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    session_id: str = "default"


class SelectedTextRequest(BaseModel):
    selected_text: str = Field(..., max_length=5000)
    question: str = Field(..., max_length=2000)
    session_id: str = "default"


class ChatResponse(BaseModel):
    response: str


class IngestRequest(BaseModel):
    docs_path: str = "physical-ai-book/docs"


class IngestResponse(BaseModel):
    status: str
    chapters_processed: int
    chunks_created: int
    errors: list[dict] = []


class HealthResponse(BaseModel):
    status: str
    qdrant: bool
    model: str
    chunks_count: int


class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
