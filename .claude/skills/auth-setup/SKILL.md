---
name: auth-setup
description: Implements signup/signin authentication using better-auth with user background questionnaire. Use when setting up authentication, user registration, or the background survey flow.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Authentication Setup with better-auth

You are an expert in implementing authentication using better-auth (https://www.better-auth.com/). You implement the signup/signin system with user background questionnaire for the Physical AI textbook.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Auth Library | better-auth |
| Database | Neon Serverless Postgres (shared with chatbot) |
| Frontend | React components in Docusaurus |
| Session | Cookie-based with better-auth defaults |

## Architecture

```
User → Docusaurus App
  ├── /signup → SignupForm + BackgroundQuestionnaire
  ├── /signin → SigninForm
  └── Protected Routes → Auth middleware check
         │
         ▼
    FastAPI Backend
    ├── better-auth endpoints
    ├── /api/auth/* (handled by better-auth)
    └── /api/user/profile (background data)
         │
         ▼
    Neon Postgres
    ├── users table (better-auth)
    ├── sessions table (better-auth)
    └── user_profiles table (background data)
```

## User Background Questionnaire

At signup, collect the following to enable personalization:

```typescript
interface UserBackground {
  // Software Experience
  programmingLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  knownLanguages: string[]; // ['Python', 'C++', 'JavaScript', etc.]
  linuxExperience: 'none' | 'basic' | 'intermediate' | 'advanced';
  aiMlExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';

  // Hardware Experience
  roboticsExperience: 'none' | 'hobbyist' | 'academic' | 'professional';
  hasNvidiaGpu: boolean;
  gpuModel?: string; // 'RTX 3090', 'RTX 4070 Ti', etc.
  hasJetson: boolean;
  jetsonModel?: string;
  hasRobotHardware: boolean;
  robotDescription?: string;

  // Learning Goals
  primaryGoal: 'career' | 'research' | 'hobby' | 'startup';
  interestAreas: string[]; // ['ROS 2', 'Simulation', 'Isaac', 'VLA']
}
```

## Database Schema

```sql
-- Extends better-auth's default tables
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  -- Software background
  programming_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
  known_languages TEXT[] DEFAULT '{}',
  linux_experience VARCHAR(20) NOT NULL DEFAULT 'none',
  ai_ml_experience VARCHAR(20) NOT NULL DEFAULT 'none',

  -- Hardware background
  robotics_experience VARCHAR(20) NOT NULL DEFAULT 'none',
  has_nvidia_gpu BOOLEAN DEFAULT false,
  gpu_model VARCHAR(100),
  has_jetson BOOLEAN DEFAULT false,
  jetson_model VARCHAR(100),
  has_robot_hardware BOOLEAN DEFAULT false,
  robot_description TEXT,

  -- Learning goals
  primary_goal VARCHAR(20) NOT NULL DEFAULT 'career',
  interest_areas TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);
```

## better-auth Server Setup

```typescript
// auth.ts
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

## better-auth Client Setup

```typescript
// auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

## Signup Flow

1. User fills in email + password
2. User completes background questionnaire (multi-step form)
3. Account created via better-auth
4. Background data stored in `user_profiles` table
5. Redirect to book with session active

## React Components Needed

```
src/components/
├── Auth/
│   ├── SignupForm.tsx           # Email + password form
│   ├── SigninForm.tsx           # Login form
│   ├── BackgroundSurvey.tsx     # Multi-step questionnaire
│   ├── AuthProvider.tsx         # Context provider for auth state
│   ├── ProtectedRoute.tsx       # Wrapper for auth-required pages
│   └── UserMenu.tsx             # Dropdown with profile, signout
```

## Integration with Docusaurus

Since Docusaurus is a static site, auth state is managed client-side:

1. Auth API calls go to the FastAPI backend
2. Session token stored in HTTP-only cookie
3. Client checks session on page load
4. Protected features (personalization, translation) check auth state
5. Unauthenticated users see default content

## Security Checklist

- [ ] Passwords hashed with bcrypt (better-auth default)
- [ ] HTTP-only cookies for session tokens
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all form fields
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS properly configured
- [ ] Environment variables for all secrets
