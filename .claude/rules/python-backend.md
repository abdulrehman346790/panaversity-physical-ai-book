---
paths:
  - "chatbot/**/*.py"
---

# Python Backend Rules

## FastAPI Standards
- Use `async def` for all route handlers
- Use Pydantic BaseModel for request/response schemas
- Use dependency injection for database connections
- Use `HTTPException` for error responses
- Use `APIRouter` for route organization

## Code Style
- Type hints on all function parameters and return types
- Docstrings on public functions
- Use `python-dotenv` for env var loading
- Use `logging` module, not print statements

## Database
- Use `psycopg` (v3) for Neon Postgres, not psycopg2
- Use connection pooling with `psycopg_pool`
- Always use parameterized queries (no string formatting)

## OpenAI Integration
- Use `openai` SDK v1.x (async client)
- Handle rate limits with exponential backoff
- Always set temperature and max_tokens explicitly
- Use streaming for chat responses
