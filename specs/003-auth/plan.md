# Implementation Plan: Authentication & Background Questionnaire

**Branch**: `003-auth` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-auth/spec.md`

## Summary

Add user authentication and a background questionnaire to the Physical AI textbook. The auth system uses better-auth (TypeScript framework) running on a Node.js/Express server, with Neon Postgres for storage. After signup, students complete a 5-question experience questionnaire (Python, C++, ROS 2, robot hardware, sensors) whose data enables content personalization (feature 004). React components embedded in Docusaurus provide signup/signin modals, the questionnaire form, and profile management.

## Technical Context

**Language/Version**: Node.js 20+ / TypeScript (auth server), JavaScript/React (frontend components)
**Primary Dependencies**: `better-auth` v1.4+, `express`, `pg`, `cors`, `dotenv`
**Storage**: Neon Serverless Postgres (shared with chatbot — different tables)
**Testing**: Manual E2E testing (hackathon scope)
**Target Platform**: Node.js server (auth API), Browser (React components on GitHub Pages)
**Project Type**: Web application (auth server + frontend components)
**Performance Goals**: Auth operations <2s, widget load <3s
**Constraints**: Free-tier Neon Postgres, CORS for GitHub Pages, HTTP-only cookie sessions
**Scale/Scope**: Single concurrent user (hackathon demo), 5 questionnaire fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Content Accuracy | N/A | Auth feature doesn't affect textbook content |
| II. Spec-Driven Development | PASS | Following SDD: specify -> plan -> tasks -> implement |
| III. Modular Feature Independence | PASS | Book works without auth; auth is independently deployable |
| IV. Security & Secrets | PASS | Secrets in .env, HTTP-only cookies, passwords hashed by better-auth |
| V. Simplicity & YAGNI | PASS | better-auth handles complexity; custom code only for questionnaire |
| VI. Accessibility & Multilingual | N/A | Urdu translation is separate feature (005) |
| VII. Async-First Backend | PASS | Express with async handlers, better-auth is async internally |
| VIII. Docusaurus & MDX Standards | PASS | Components integrate via existing Root.js wrapper pattern |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-auth/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/
│   └── openapi.yaml     # Phase 1: API contract (OpenAPI 3.1)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Actionable task list (via /sp.tasks)
```

### Source Code (repository root)

```text
auth-server/                          # Auth Backend (Node.js/Express + better-auth)
├── src/
│   ├── index.js                     # Express app, CORS, health endpoint, server start
│   ├── auth.js                      # better-auth instance configuration
│   └── routes/
│       └── profile.js               # Questionnaire CRUD routes
├── package.json
├── .env.example
└── Dockerfile

physical-ai-book/                     # Frontend (Docusaurus) — existing project
├── src/
│   ├── lib/
│   │   └── auth-client.js           # better-auth React client
│   ├── components/
│   │   ├── AuthProvider/
│   │   │   └── index.js             # Auth context provider
│   │   ├── AuthButton/
│   │   │   ├── index.js             # Sign Up / Sign In / Profile button
│   │   │   └── styles.module.css
│   │   ├── AuthModals/
│   │   │   ├── SignupModal.js
│   │   │   ├── SigninModal.js
│   │   │   └── styles.module.css
│   │   ├── QuestionnaireModal/
│   │   │   ├── index.js             # Post-signup questionnaire
│   │   │   └── styles.module.css
│   │   └── ProfilePanel/
│   │       ├── index.js             # View/edit profile & questionnaire
│   │       └── styles.module.css
│   └── theme/
│       └── Root.js                  # Updated: wraps with AuthProvider
└── package.json                     # Updated: add better-auth dependency
```

**Structure Decision**: Web application pattern — separate Node.js auth server in `auth-server/` at repo root. Frontend components integrate into existing `physical-ai-book/` Docusaurus project. Auth server and chatbot server are independent services sharing the Neon Postgres database.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Docusaurus Book (GitHub Pages)                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ AuthProvider (React Context)                     │    │
│  │ ├── AuthButton (top-right)                      │    │
│  │ │   ├── SignupModal                             │    │
│  │ │   ├── SigninModal                             │    │
│  │ │   └── ProfilePanel                            │    │
│  │ ├── QuestionnaireModal (post-signup)             │    │
│  │ └── ChatWidget (existing, bottom-right)          │    │
│  └──────────┬───────────────────┬──────────────────┘    │
└─────────────┼───────────────────┼──────────────────────-┘
              │ HTTPS (CORS)      │ HTTPS (CORS)
              ▼                   ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Auth Server         │  │  Chatbot Server      │
│  (Node.js/Express)   │  │  (Python/FastAPI)     │
│                      │  │                      │
│  /api/auth/*         │  │  /api/chat/*         │
│  (better-auth)       │  │  /api/ingest         │
│                      │  │  /api/health         │
│  /api/profile/*      │  │                      │
│  (custom routes)     │  │                      │
│                      │  │                      │
│  /api/health         │  │                      │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           ▼                         ▼
    ┌────────────────┐        ┌────────────┐
    │ Neon Postgres  │        │ Qdrant     │
    │ (user, session │        │ Cloud      │
    │  account,      │        │ (vectors)  │
    │  verification) │        │            │
    └────────────────┘        └────────────┘
```

## Key Design Decisions

### D1: Separate Auth Server (Node.js/Express)

better-auth is a TypeScript-only library. It cannot run inside Python/FastAPI. A lightweight Node.js/Express server handles all auth operations. This aligns with Constitution Principle III (Modular Feature Independence) — auth is independently deployable.

**Mapping to spec requirements**:
- FR-001 (signup) → `POST /api/auth/sign-up/email` (better-auth route)
- FR-002 (signin) → `POST /api/auth/sign-in/email` (better-auth route)
- FR-003 (signout) → `POST /api/auth/sign-out` (better-auth route)
- FR-004 (session persistence) → better-auth session management with HTTP-only cookies
- FR-015 (secure sessions) → better-auth default: HTTP-only, Secure, SameSite cookies

### D2: Questionnaire as User Additional Fields

Store questionnaire responses as additional columns on better-auth's `user` table using `additionalFields` configuration. This avoids a separate table and eliminates join queries.

**Mapping to spec requirements**:
- FR-005 (questionnaire after signup) → QuestionnaireModal triggered by signup success
- FR-006 (software ratings) → `python_experience`, `cpp_experience`, `ros2_experience` fields
- FR-007 (hardware ratings) → `robot_hardware_experience`, `sensor_experience` fields
- FR-008 (skip questionnaire) → `questionnaire_completed` boolean, skip button in modal
- FR-009 (store for personalization) → Data in user table, readable by feature 004

### D3: React Component Architecture

All auth UI is React components, injected globally via Docusaurus Root.js wrapper. AuthProvider context makes session state available to all components. AuthButton is positioned top-right (navbar area) to avoid conflicting with ChatWidget (bottom-right).

**Mapping to spec requirements**:
- FR-010 (validation) → Client-side validation in SignupModal (email format, password length)
- FR-011 (auth state display) → AuthButton component with conditional rendering
- FR-012 (view/edit profile) → ProfilePanel component with questionnaire form
- FR-013 (graceful degradation) → AuthProvider catches connection errors, shows "unavailable" state
- FR-014 (cross-origin) → better-auth client `baseURL` points to auth server, `credentials: 'include'`

### D4: CORS with Credentials

Cross-origin cookies require `credentials: true` on Express CORS and `credentials: 'include'` on fetch calls. In production, cookies need `SameSite: None; Secure` attributes. better-auth handles cookie attributes; Express handles CORS headers.

### D5: Shared Database, Separate Tables

Auth server and chatbot server both connect to Neon Postgres but use completely separate tables. Auth tables (user, session, account, verification) are managed by better-auth CLI migrations. Chatbot tables (ingestion_records) are managed by its own setup script. No schema conflicts.

## Implementation Phases

### Phase 1: Auth Server Scaffolding
- Project structure (`auth-server/` directory)
- `package.json` with dependencies
- `.env.example` with all required variables
- Express app with CORS, health endpoint
- better-auth instance with Neon Postgres + email/password + additionalFields
- better-auth CLI migration (creates tables)
- Dockerfile for deployment

### Phase 2: Questionnaire API
- Custom Express routes for questionnaire CRUD
- Session validation via `auth.api.getSession()`
- Direct Postgres queries to update user additional fields
- Input validation for experience level values

### Phase 3: Frontend Auth Client & Provider
- Install `better-auth` in Docusaurus project
- Create auth client (`src/lib/auth-client.js`)
- Create AuthProvider context component
- Update Root.js to wrap with AuthProvider

### Phase 4: Auth UI Components
- AuthButton (top-right: Sign Up / Sign In / profile avatar)
- SignupModal (email + password form with validation)
- SigninModal (email + password form)
- CSS styling for all modals

### Phase 5: Questionnaire & Profile
- QuestionnaireModal (5 questions, skip button, shown after signup)
- ProfilePanel (view email, view/edit questionnaire responses)
- API integration for questionnaire save/update/fetch

### Phase 6: Integration & Polish
- End-to-end flow testing (signup → questionnaire → signin → profile)
- Error handling (backend down, invalid input, session expired)
- Graceful degradation (auth unavailable → book still works)
- Build verification (Docusaurus still builds)

## Complexity Tracking

No constitution violations. All decisions align with principles:
- Simplicity (V): better-auth handles auth complexity; custom code only for 3 questionnaire routes
- Modular independence (III): Auth server fully separate from chatbot; book works without either
- Security (IV): HTTP-only cookies, hashed passwords, CORS configured, secrets in .env
