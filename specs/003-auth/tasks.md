# Tasks: Authentication & Background Questionnaire

**Input**: Design documents from `/specs/003-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/openapi.yaml

**Tests**: Not requested in feature specification. Manual E2E testing only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Auth server project initialization and Docusaurus frontend dependencies

- [x] T001 Create auth-server directory structure: `auth-server/src/`, `auth-server/src/routes/`
- [x] T002 Create `auth-server/package.json` with dependencies: `better-auth`, `express`, `pg`, `cors`, `dotenv`
- [x] T003 [P] Create `auth-server/.env.example` with BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, CORS_ORIGINS, PORT
- [x] T004 [P] Create `auth-server/Dockerfile` for Node.js 20 deployment
- [x] T005 Install `better-auth` dependency in `physical-ai-book/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Auth server core — Express app, better-auth instance, database tables. MUST complete before any user story.

- [x] T006 Create better-auth instance with Neon Postgres, email/password enabled, and additionalFields (python_experience, cpp_experience, ros2_experience, robot_hardware_experience, sensor_experience, questionnaire_completed) in `auth-server/src/auth.js`
- [x] T007 Create Express app with CORS (credentials: true), mount better-auth handler at `/api/auth/*`, health endpoint at `/api/health`, and server startup in `auth-server/src/index.js`
- [x] T008 Create auth client with `createAuthClient` pointing to auth server baseURL in `physical-ai-book/src/lib/auth-client.js`
- [x] T009 Create AuthProvider React context component that wraps `authClient.useSession()` and provides session state to children in `physical-ai-book/src/components/AuthProvider/index.js`
- [x] T010 Update `physical-ai-book/src/theme/Root.js` to wrap children with AuthProvider (alongside existing ChatWidget)

**Checkpoint**: Auth server runs, better-auth routes respond, AuthProvider available in Docusaurus. `GET /api/auth/ok` returns 200.

---

## Phase 3: User Story 1 — Sign Up with Email and Password (Priority: P1)

**Goal**: Students can create accounts via a signup modal with email/password validation.

**Independent Test**: Click "Sign Up" on any book page, enter email + password (8+ chars), submit, verify profile indicator appears showing authenticated state.

### Implementation for User Story 1

- [x] T011 [US1] Create AuthButton component in `physical-ai-book/src/components/AuthButton/index.js` — renders "Sign Up" / "Sign In" buttons when unauthenticated, shows user email/avatar when authenticated (fixed top-right position)
- [x] T012 [P] [US1] Create AuthButton styles in `physical-ai-book/src/components/AuthButton/styles.module.css` — fixed top-right positioning, z-index layering, responsive
- [x] T013 [US1] Create SignupModal component in `physical-ai-book/src/components/AuthModals/SignupModal.js` — email input, password input (min 8 chars), name input, inline validation, submit calls `authClient.signUp.email()`, error handling for duplicate emails
- [x] T014 [P] [US1] Create AuthModals shared styles in `physical-ai-book/src/components/AuthModals/styles.module.css` — modal overlay, form layout, input fields, error messages, buttons
- [x] T015 [US1] Wire AuthButton to open SignupModal and update AuthProvider state on successful signup in `physical-ai-book/src/components/AuthButton/index.js`

**Checkpoint**: Students can sign up. AuthButton shows "Sign Up", clicking opens modal, form validates, account created, UI shows authenticated state.

---

## Phase 4: User Story 2 — Sign In and Sign Out (Priority: P1)

**Goal**: Returning students can sign in with existing credentials and sign out. Sessions persist across browser restarts.

**Independent Test**: After signing up (US1), sign out, then sign back in with same credentials. Verify session persists after closing and reopening browser.

### Implementation for User Story 2

- [x] T016 [US2] Create SigninModal component in `physical-ai-book/src/components/AuthModals/SigninModal.js` — email input, password input, submit calls `authClient.signIn.email()`, error handling for invalid credentials ("Invalid email or password")
- [x] T017 [US2] Add Sign In button and Sign Out action to AuthButton in `physical-ai-book/src/components/AuthButton/index.js` — "Sign In" opens SigninModal, authenticated state shows "Sign Out" option, signout calls `authClient.signOut()`
- [x] T018 [US2] Add session persistence check on mount in AuthProvider in `physical-ai-book/src/components/AuthProvider/index.js` — on initial load, check existing session via `authClient.useSession()` to restore auth state

**Checkpoint**: Full auth cycle works: Sign Up -> Sign Out -> Sign In -> session persists across page reload -> Sign Out.

---

## Phase 5: User Story 3 — Background Questionnaire at Signup (Priority: P2)

**Goal**: After signup, students see a questionnaire collecting software and hardware experience levels. Data is stored for personalization.

**Independent Test**: Sign up a new account, verify questionnaire modal appears, fill in all 5 experience ratings, submit, verify data saved. Also test "Skip for now".

### Implementation for User Story 3

- [x] T019 [US3] Create questionnaire CRUD routes in `auth-server/src/routes/profile.js` — GET/POST/PUT `/api/profile/questionnaire`, session validation via `auth.api.getSession()`, input validation for experience levels (none/beginner/intermediate/advanced), direct Postgres queries to update user additional fields
- [x] T020 [US3] Mount profile routes in Express app in `auth-server/src/index.js` — add `express.json()` middleware AFTER better-auth handler, mount profile router at `/api/profile`
- [x] T021 [US3] Create QuestionnaireModal component in `physical-ai-book/src/components/QuestionnaireModal/index.js` — 5 questions (Python, C++, ROS 2, Robot Hardware, Sensors) each with 4 options (None/Beginner/Intermediate/Advanced), "Submit" and "Skip for now" buttons, POST to `/api/profile/questionnaire`
- [x] T022 [P] [US3] Create QuestionnaireModal styles in `physical-ai-book/src/components/QuestionnaireModal/styles.module.css` — modal layout, radio/select groups, progress indication, responsive
- [x] T023 [US3] Trigger QuestionnaireModal after successful signup in `physical-ai-book/src/components/AuthProvider/index.js` — track `showQuestionnaire` state, set true on signup success, set false on submit or skip

**Checkpoint**: New signup triggers questionnaire modal. Student fills 5 experience fields and submits (or skips). Data persists in database.

---

## Phase 6: User Story 4 — View and Edit Profile (Priority: P3)

**Goal**: Signed-in students can view their email and questionnaire responses, and edit their answers.

**Independent Test**: Sign in, click profile indicator, verify email and questionnaire data displayed. Edit an experience level, save, reload page, verify update persisted.

### Implementation for User Story 4

- [x] T024 [US4] Create ProfilePanel component in `physical-ai-book/src/components/ProfilePanel/index.js` — shows user email, displays questionnaire responses (fetched via GET `/api/profile/questionnaire`), editable form with save button (PUT `/api/profile/questionnaire`), "Complete questionnaire" prompt if skipped at signup
- [x] T025 [P] [US4] Create ProfilePanel styles in `physical-ai-book/src/components/ProfilePanel/styles.module.css` — panel layout (dropdown or slide-out from AuthButton), form styling, save confirmation
- [x] T026 [US4] Wire AuthButton to toggle ProfilePanel on authenticated user click in `physical-ai-book/src/components/AuthButton/index.js` — clicking profile indicator opens ProfilePanel, close button/overlay dismiss

**Checkpoint**: Full profile management works: view email, view/edit questionnaire, save persists.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, graceful degradation, build verification

- [x] T027 Add graceful degradation to AuthProvider in `physical-ai-book/src/components/AuthProvider/index.js` — catch connection errors to auth server, set `authAvailable: false` state, hide auth UI when unavailable, book remains fully readable
- [x] T028 [P] Add error states to all modals (SignupModal, SigninModal, QuestionnaireModal) — network errors show "Service unavailable, please try again", form errors show inline messages
- [x] T029 Verify Docusaurus build passes with all new components — run `npm run build` in `physical-ai-book/`
- [x] T030 End-to-end flow validation: signup -> questionnaire -> signout -> signin -> profile edit -> signout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **US1 Sign Up (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 Sign In/Out (Phase 4)**: Depends on Foundational (Phase 2), benefits from US1 being done (needs accounts to sign into)
- **US3 Questionnaire (Phase 5)**: Depends on Foundational (Phase 2) + US1 (triggered after signup)
- **US4 Profile (Phase 6)**: Depends on US3 (displays questionnaire data)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Sign Up)**: After Phase 2 — no other story dependencies
- **US2 (Sign In/Out)**: After Phase 2 — independently testable, but best after US1 (needs existing accounts)
- **US3 (Questionnaire)**: After US1 — triggered by signup success
- **US4 (Profile)**: After US3 — displays questionnaire data

### Within Each User Story

- Backend routes before frontend components (US3)
- Component logic before styles (parallel where possible)
- Core implementation before integration wiring

### Parallel Opportunities

- T003 + T004 can run in parallel (env file + Dockerfile)
- T012 + T014 can run in parallel (AuthButton styles + AuthModals styles)
- T022 + other US3 frontend can run in parallel (questionnaire styles)
- T025 can run in parallel with T024 (ProfilePanel styles + logic)

---

## Parallel Example: Phase 1 Setup

```bash
# Sequential (dependencies):
T001 → T002 → T005

# Parallel (no dependencies):
T003 (env file) || T004 (Dockerfile)
```

## Parallel Example: User Story 1

```bash
# Parallel styles (no dependencies on logic):
T012 (AuthButton styles) || T014 (AuthModals styles)

# Sequential (logic depends on styles being defined):
T011 (AuthButton) → T013 (SignupModal) → T015 (Wire together)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 = Signup + Signin)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010)
3. Complete Phase 3: US1 Sign Up (T011-T015)
4. Complete Phase 4: US2 Sign In/Out (T016-T018)
5. **STOP and VALIDATE**: Full auth cycle works (signup, signout, signin, session persistence)
6. Deploy/demo if ready — delivers core auth value

### Incremental Delivery

1. Setup + Foundational → Auth infrastructure ready
2. Add US1 (Sign Up) → Test → Deploy (accounts work!)
3. Add US2 (Sign In/Out) → Test → Deploy (full auth cycle!)
4. Add US3 (Questionnaire) → Test → Deploy (background data collected!)
5. Add US4 (Profile) → Test → Deploy (profile management!)
6. Polish → Final validation → Complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No test tasks generated (not requested in spec — manual E2E only)
- better-auth handles signup/signin/session internally — custom code only for questionnaire routes
- `express.json()` MUST be mounted AFTER `toNodeHandler(auth)` to avoid hanging
- Total: 30 tasks across 7 phases
