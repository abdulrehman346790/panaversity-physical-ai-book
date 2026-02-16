# Quickstart: Authentication & Background Questionnaire (003-auth)

**Date**: 2026-02-15
**Branch**: `003-auth`

## Prerequisites

- Node.js 20+ (for auth server)
- Neon Postgres database (shared with chatbot)
- API keys: None required (email/password auth is self-hosted)

## 1. Auth Server Setup

```bash
# From repo root
cd auth-server

# Install dependencies
npm install
```

## 2. Environment Configuration

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-32-character-secret-here

# Auth server URL
BETTER_AUTH_URL=http://localhost:3001

# Neon Postgres (same database as chatbot, different tables)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# CORS
CORS_ORIGINS=http://localhost:3000,https://abdulrehman346790.github.io

# Server port
PORT=3001
```

## 3. Initialize Database

```bash
# Run better-auth migrations (creates user, session, account, verification tables)
npx @better-auth/cli migrate
```

## 4. Run Auth Server

```bash
npm run dev
```

Verify: `curl http://localhost:3001/api/health`
Auth check: `curl http://localhost:3001/api/auth/ok`

## 5. Frontend Configuration

The auth client is configured in `physical-ai-book/src/lib/auth-client.js`:

```javascript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "production"
    ? "https://your-auth-server.com"
    : "http://localhost:3001"
});
```

## 6. Run Frontend (Development)

```bash
cd physical-ai-book
npm start
```

Auth UI should appear on every page (top-right: Sign Up / Sign In buttons).

## 7. Test the Full Flow

1. Open `http://localhost:3000`
2. Click "Sign Up" (top-right)
3. Enter email + password (8+ chars)
4. Verify: account created, questionnaire modal appears
5. Fill out experience levels (or skip)
6. Verify: profile indicator shows email
7. Click profile → verify questionnaire data saved
8. Click "Sign Out" → verify buttons revert

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `better-auth` handler hangs | Ensure `express.json()` is AFTER `toNodeHandler(auth)` |
| CORS errors in browser | Add `http://localhost:3000` to `CORS_ORIGINS`, ensure `credentials: true` |
| Database connection failed | Check `DATABASE_URL` in `.env` |
| Session cookies not set | Ensure `credentials: 'include'` in fetch calls |
| Migration fails | Run `npx @better-auth/cli generate` first to preview schema |
