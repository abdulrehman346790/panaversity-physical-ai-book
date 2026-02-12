---
paths:
  - "**/*"
---

# Project Conventions - Physical AI Textbook Hackathon

## Tech Stack
- **Book**: Docusaurus 3.x with MDX, deployed to GitHub Pages
- **Chatbot Backend**: FastAPI (Python 3.11+)
- **Vector DB**: Qdrant Cloud (Free Tier)
- **Database**: Neon Serverless Postgres
- **Chat SDK**: OpenAI Agents SDK / ChatKit SDK
- **Auth**: better-auth
- **Spec Toolkit**: Spec-Kit Plus

## File Naming
- Chapters: `docs/<module>/<number>-<slug>.mdx`
- Components: `src/components/<Name>/index.tsx`
- API routes: `chatbot/app/routers/<name>.py`
- Python: snake_case files and functions
- TypeScript/React: PascalCase components, camelCase functions

## Content Standards
- Every chapter: frontmatter + learning objectives + prerequisites + content + exercise + takeaways + questions
- Code examples must be runnable with all imports shown
- Use Mermaid for all diagrams
- Minimum 2000 words per chapter

## API Standards
- All endpoints use async/await
- Pydantic v2 models for validation
- Proper HTTP status codes
- CORS configured for GitHub Pages domain
- Environment variables for all secrets (never hardcode)
