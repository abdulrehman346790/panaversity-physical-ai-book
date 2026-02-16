# Research: Authentication & Background Questionnaire (003-auth)

**Date**: 2026-02-15
**Branch**: `003-auth`

## R1: better-auth Library

**Decision**: Use `better-auth` v1.4.x — a TypeScript authentication framework

**Rationale**:
- Constitution mandates better-auth as the auth library
- Comprehensive auth framework: email/password, sessions, social login (if needed later)
- Framework-agnostic client: `createAuthClient` works with React (Docusaurus)
- Built-in database adapters for PostgreSQL (Neon compatible)
- CLI for schema migrations: `npx @better-auth/cli migrate`
- HTTP-only cookie sessions by default (matches FR-015)
- `additionalFields` API allows extending user table for questionnaire data

**Key fact**: better-auth is a **JavaScript/TypeScript** library. It requires a Node.js server (Express, Hono, etc.) — it does NOT run on Python/FastAPI.

**Alternatives considered**:
- **Custom FastAPI auth**: Would avoid a second server but violates constitution mandate for better-auth
- **Auth.js/NextAuth**: Competitor library, not mandated by constitution

**Verified API patterns**:
```typescript
// Server setup (auth.ts)
import { betterAuth } from "better-auth";
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      pythonExperience: { type: "string", required: false },
      // ... more fields
    }
  }
});

// Express handler
import { toNodeHandler } from "better-auth/node";
app.all("/api/auth/*", toNodeHandler(auth));

// Client (React)
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({ baseURL: "http://localhost:3001" });

// Signup
await authClient.signUp.email({ email, password, name });

// Signin
await authClient.signIn.email({ email, password });

// Session hook
const { data: session } = authClient.useSession();

// Signout
await authClient.signOut();
```

## R2: Auth Server Architecture

**Decision**: Separate Node.js/Express auth server alongside existing Python/FastAPI chatbot server

**Rationale**:
- better-auth is TypeScript-only — cannot run inside FastAPI
- Auth server handles ONLY authentication (signup, signin, session, profile)
- Chatbot server (FastAPI) continues handling chat/ingestion independently
- Both services share Neon Postgres but use different tables
- Auth server is lightweight — Express + better-auth + pg adapter
- Both can be deployed to the same hosting platform (Railway/Render)

**Architecture**:
```
Docusaurus (GitHub Pages)
  ├── Auth requests → Node.js/Express auth server (:3001)
  └── Chat requests → Python/FastAPI chatbot server (:8000)
```

**Alternatives considered**:
- **Single FastAPI server with custom auth**: Violates better-auth mandate
- **Replace FastAPI with Express**: Too much rework on chatbot; violates modularity principle
- **better-auth as middleware in Docusaurus**: Docusaurus is static (GitHub Pages), no server-side

## R3: Database Schema for Auth

**Decision**: Use better-auth's core tables + `additionalFields` for questionnaire data

**Rationale**:
- better-auth auto-creates 4 tables: `user`, `session`, `account`, `verification`
- `additionalFields` on user table stores questionnaire responses directly — no join table needed
- 5 questionnaire fields added as nullable strings on user table
- Simpler than a separate `background_profile` table — fewer queries, no joins
- better-auth CLI handles migrations: `npx @better-auth/cli migrate`

**Core tables** (auto-created by better-auth):
- `user`: id, name, email, emailVerified, image, createdAt, updatedAt + custom fields
- `session`: id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt
- `account`: id, userId, accountId, providerId, password, createdAt, updatedAt
- `verification`: id, identifier, value, expiresAt, createdAt, updatedAt

**Custom fields on user table**:
- `python_experience`: string (none/beginner/intermediate/advanced)
- `cpp_experience`: string
- `ros2_experience`: string
- `robot_hardware_experience`: string
- `sensor_experience`: string
- `questionnaire_completed`: boolean (default false)

## R4: Frontend Auth Components

**Decision**: React components integrated into Docusaurus via Root.js wrapper

**Rationale**:
- better-auth provides `createAuthClient` with React hooks (`useSession`)
- Auth UI (AuthButton, SignupModal, SigninModal, QuestionnaireModal, ProfilePanel) are React components
- Injected globally via existing `Root.js` pattern (alongside ChatWidget)
- AuthButton shows in navbar-like position (top-right) — doesn't conflict with ChatWidget (bottom-right)
- `useSession` hook provides reactive auth state across all components

**Component hierarchy**:
```
Root.js
├── AuthProvider (context wrapper)
│   ├── AuthButton (top-right: "Sign Up" / "Sign In" / profile avatar)
│   ├── SignupModal
│   ├── SigninModal
│   ├── QuestionnaireModal (shown after signup)
│   └── ProfilePanel (shown on avatar click)
├── ChatWidget (existing, bottom-right)
└── {children} (book content)
```

## R5: CORS & Cross-Origin Configuration

**Decision**: Auth server configured with explicit CORS for GitHub Pages domain

**Rationale**:
- GitHub Pages (static) → Auth server (separate host) requires CORS
- `credentials: true` required for HTTP-only cookie sessions
- Auth server CORS: `origin: ["https://abdulrehman346790.github.io", "http://localhost:3000"]`
- Cookies need `SameSite: None; Secure` for cross-origin in production
- better-auth handles cookie configuration internally; CORS is on Express level

**Configuration**:
```typescript
import cors from "cors";
app.use(cors({
  origin: ["https://abdulrehman346790.github.io", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
```

## R6: Questionnaire API

**Decision**: Custom Express routes for questionnaire CRUD (outside better-auth handler)

**Rationale**:
- better-auth handles signup/signin/session — not custom profile data
- Questionnaire save/update needs custom endpoints:
  - `POST /api/profile/questionnaire` — save questionnaire responses
  - `GET /api/profile/questionnaire` — get current responses
  - `PUT /api/profile/questionnaire` — update responses
- These routes use `auth.api.getSession()` to verify the user is authenticated
- Direct Postgres queries update the user table's additional fields

**Pattern**:
```typescript
import { fromNodeHeaders } from "better-auth/node";

app.post("/api/profile/questionnaire", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  // Update user's questionnaire fields in database
});
```
