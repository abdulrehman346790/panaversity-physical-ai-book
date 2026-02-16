---
id: "0002"
title: Auth Implementation Plan
stage: plan
date: 2026-02-15
surface: agent
model: claude-opus-4-6
feature: 003-auth
branch: 003-auth
user: ar525
command: /sp.plan
labels: ["auth", "better-auth", "express", "questionnaire", "architecture"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/plan.md
  - specs/003-auth/research.md
  - specs/003-auth/data-model.md
  - specs/003-auth/contracts/openapi.yaml
  - specs/003-auth/quickstart.md
tests:
  - null
---

## Prompt

/sp.plan 003-auth

## Response snapshot

Created implementation plan for 003-auth with 6 research items and 6 implementation phases:
- R1: better-auth is TypeScript-only, requires Node.js/Express server
- R2: Separate auth server architecture (Node.js alongside Python/FastAPI chatbot)
- R3: User table additionalFields for questionnaire data (no separate table)
- R4: React components via Docusaurus Root.js wrapper
- R5: CORS with credentials for cross-origin cookies
- R6: Custom Express routes for questionnaire CRUD

5 key design decisions (D1-D5), constitution check PASS on all applicable principles. Generated data-model.md (4 entities), openapi.yaml (7 endpoints), quickstart.md.

## Outcome

- Impact: Complete architecture plan for auth feature with better-auth + Express
- Tests: N/A (planning phase)
- Files: 5 files created (plan.md, research.md, data-model.md, openapi.yaml, quickstart.md)
- Next prompts: /sp.tasks 003-auth
- Reflection: Key insight — better-auth is TypeScript-only, requiring a separate Node.js server. This adds a second service but maintains modularity.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
