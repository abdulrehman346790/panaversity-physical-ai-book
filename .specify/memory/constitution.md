<!-- Sync Impact Report
  Version change: 0.0.0 → 1.0.0
  Modified principles: N/A (initial constitution)
  Added sections: Core Principles (8), Technology Constraints, Development Workflow, Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
    - .specify/templates/spec-template.md ✅ (User stories, requirements format compatible)
    - .specify/templates/tasks-template.md ✅ (Phase structure, checklist format compatible)
  Follow-up TODOs: None
-->

# Physical AI Textbook Constitution

## Core Principles

### I. Content Accuracy & Technical Depth

All textbook content MUST be technically accurate and verifiable against official documentation. Every code example MUST be syntactically correct and runnable with all imports shown. Technical claims MUST cite authoritative sources (docs.ros.org, developer.nvidia.com, gazebosim.org). No concept may be presented without a working code example or practical demonstration. Chapters MUST include learning objectives, prerequisites, hands-on exercises, and review questions.

**Rationale**: A textbook with incorrect code or outdated APIs erodes student trust and wastes learning time. The Physical AI domain moves rapidly; accuracy is non-negotiable.

### II. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST follow the SDD pipeline: `/sp.constitution` → `/sp.specify` → `/sp.plan` → `/sp.tasks` → `/sp.implement`. Specifications define WHAT and WHY (no tech stack). Plans define HOW (tech stack, architecture, file structure). No implementation work may begin without an approved spec and plan. Every command invocation MUST produce a Prompt History Record (PHR) in `history/prompts/`.

**Rationale**: SDD ensures intent is captured before implementation, reducing rework and maintaining traceability across the project lifecycle.

### III. Modular Feature Independence

Each feature (book, chatbot, auth, personalization, translation) MUST be independently deployable and testable. Features MUST NOT have hard circular dependencies. The book MUST function without the chatbot; the chatbot MUST function without auth; personalization and translation MUST gracefully degrade when auth is unavailable. Shared infrastructure (database, API) MUST be defined in a foundational phase.

**Rationale**: The hackathon has tiered scoring (100 base + 200 bonus). Modular independence ensures partial delivery still earns maximum points for completed features.

### IV. Security & Secrets Management

All secrets (API keys, database credentials, auth tokens) MUST be stored in environment variables and loaded via `.env` files. `.env` files MUST be listed in `.gitignore` and MUST NEVER be committed. Authentication MUST use HTTP-only cookies for session tokens. All user input MUST be validated and sanitized. Database queries MUST use parameterized statements. CORS MUST be explicitly configured for the deployment domain only.

**Rationale**: A public-facing textbook with a chatbot and auth system is an attack surface. Security failures in a hackathon demo are disqualifying.

### V. Simplicity & YAGNI

Start with the simplest viable implementation. Do not add abstractions, patterns, or indirection layers unless the current code demonstrably requires them. Three similar lines of code are better than a premature abstraction. Do not design for hypothetical future requirements. Configuration MUST be flat (environment variables), not layered. Only add error handling at system boundaries (user input, external APIs, network calls).

**Rationale**: Hackathon timeline demands speed. Over-engineering consumes time without delivering points. Simple code is easier to debug under pressure.

### VI. Accessibility & Multilingual Support

The textbook MUST be readable without JavaScript for core content. All images MUST have descriptive alt text. The Urdu translation feature MUST properly handle RTL layout without breaking code blocks. Code blocks, CLI commands, file paths, and technical acronyms MUST NOT be translated. Translated content MUST use formal Urdu suitable for a university textbook. The UI MUST clearly indicate the current language state and provide a toggle to restore original content.

**Rationale**: The hackathon awards 50 bonus points for Urdu translation. Proper RTL support and selective translation are the differentiators between a demo and a polished feature.

### VII. Async-First Backend

All FastAPI route handlers MUST use `async def`. Database connections MUST use async drivers with connection pooling. External API calls (OpenAI, Qdrant) MUST be non-blocking. Streaming responses MUST be used for LLM-generated content (chat, personalization, translation). Error responses MUST return structured JSON with appropriate HTTP status codes.

**Rationale**: The chatbot, personalization, and translation features all involve LLM API calls. Blocking calls would make the system unusable under concurrent load.

### VIII. Docusaurus & MDX Standards

Every chapter file MUST have complete MDX frontmatter: `sidebar_position`, `title`, `description`, `keywords`. Chapters MUST use Mermaid for diagrams (no external image dependencies). Admonitions (`:::tip`, `:::note`, `:::warning`, `:::danger`) MUST be used for callout content. Internal links MUST use relative paths. Custom React components (PersonalizeButton, TranslateButton, ChatWidget) MUST be imported at the top of each chapter that uses them. The book structure MUST follow `docs/<module-folder>/<number>-<slug>.mdx` convention.

**Rationale**: Consistent Docusaurus conventions ensure the book builds cleanly, deploys without broken links, and maintains a professional appearance across all modules.

## Technology Constraints

The following technology choices are mandated by the hackathon requirements and MUST NOT be substituted:

| Layer | Required Technology | Constraint |
|-------|-------------------|------------|
| Book Framework | Docusaurus 3.x | MUST deploy to GitHub Pages |
| Chatbot Backend | FastAPI (Python 3.11+) | MUST be async |
| Vector Database | Qdrant Cloud Free Tier | 1536-dim vectors (text-embedding-3-small) |
| Relational Database | Neon Serverless Postgres | Shared across chatbot, auth, translations |
| Chat/Agent SDK | OpenAI Agents SDK or ChatKit SDK | MUST support selected-text Q&A |
| Authentication | better-auth | MUST collect user background at signup |
| Embeddings | OpenAI text-embedding-3-small | 1536 dimensions, cosine similarity |
| Deployment | GitHub Pages (book) + Cloud host (API) | Book static, API separate |

Technology additions beyond this list are permitted only when justified by a specific feature requirement and documented in the feature plan.

## Development Workflow

### SDD Pipeline (Mandatory for Every Feature)

1. **Specify**: Run `/sp.specify` with feature description → produces `specs/<feature>/spec.md`
2. **Clarify**: (Optional) Run `/sp.clarify` to resolve ambiguities → updates `spec.md`
3. **Plan**: Run `/sp.plan` with tech stack context → produces `plan.md`, `research.md`, `data-model.md`
4. **Tasks**: Run `/sp.tasks` → produces `tasks.md` with phased checklist
5. **Analyze**: (Optional) Run `/sp.analyze` for cross-artifact consistency
6. **Implement**: Run `/sp.implement` → executes tasks phase-by-phase

### Feature Priority Order

| Priority | Feature | Points |
|----------|---------|--------|
| P1 | Docusaurus textbook (4 modules, 13 weeks) | 100 (base) |
| P1 | RAG chatbot with selected-text Q&A | 100 (base) |
| P2 | Claude Code subagents & skills | +50 (bonus) |
| P3 | better-auth signup/signin + background survey | +50 (bonus) |
| P4 | Per-chapter content personalization | +50 (bonus) |
| P5 | Per-chapter Urdu translation | +50 (bonus) |

### Quality Gates

- Every chapter MUST pass content-qa agent review (grade B or above)
- Every API endpoint MUST handle errors with proper HTTP status codes
- Every feature MUST be demonstrated in the 90-second demo video
- The book MUST build successfully (`npm run build`) before deployment

## Governance

This constitution supersedes all other project conventions and practices. All specifications, plans, and implementations MUST be validated against these principles. Violations are permissible only when explicitly justified in the Complexity Tracking section of the relevant plan and approved by the project lead.

Amendments to this constitution MUST follow semantic versioning:
- **MAJOR**: Principle removal or backward-incompatible redefinition
- **MINOR**: New principle added or existing principle materially expanded
- **PATCH**: Clarification, wording improvement, non-semantic refinement

All amendments MUST be documented with rationale and effective date.

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
