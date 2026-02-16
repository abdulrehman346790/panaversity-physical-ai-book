# Tasks: Content Personalization

**Input**: Design documents from `/specs/004-personalization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/personalization.api.md, quickstart.md

**Tests**: Manual E2E testing only (no automated test suite per hackathon scope).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Infrastructure

**Purpose**: Core state management, hooks, and auth integration

- [x] T001 Create PersonalizationProvider context component in `physical-ai-book/src/components/PersonalizationProvider/index.js` with useState for userProfile, personalizationEnabled, personalizationAvailable
- [x] T002 [P] Add useEffect to PersonalizationProvider to fetch user profile from `/api/profile/questionnaire` on mount with credentials: 'include'
- [x] T003 [P] Add error handling to PersonalizationProvider: catch fetch errors, set personalizationAvailable=false, console.warn message
- [x] T004 Implement usePersonalization hook in `physical-ai-book/src/hooks/usePersonalization.js` that returns context value from PersonalizationProvider
- [x] T005 [P] Create localStorage utilities in `physical-ai-book/src/lib/personalization.js` with functions: getToggleState(userId, chapterSlug), setToggleState(userId, chapterSlug, enabled)
- [x] T006 [P] Add togglePersonalization method to PersonalizationProvider that updates localStorage key `personalization_pref_${userId}_${chapterSlug}`
- [x] T007 Add refreshProfile async function to PersonalizationProvider for manual profile refresh (called if user updates background in auth system)
- [x] T008 Add localStorage read on PersonalizationProvider mount to restore toggle state for current chapter

**Checkpoint**: PersonalizationProvider functional, usePersonalization hook available, localStorage persists toggle state, graceful degradation when auth unavailable

---

## Phase 2: UI Components

**Purpose**: Visual button and content variant renderer

- [x] T009 Create PersonalizationButton component in `physical-ai-book/src/components/PersonalizationButton/index.js` with onClick handler calling togglePersonalization()
- [x] T010 [P] Create PersonalizationButton styles in `physical-ai-book/src/components/PersonalizationButton/styles.module.css` — fixed top-right positioning (top: 16px, right: 16px, z-index: 50), responsive for mobile
- [x] T011 Add conditional rendering to PersonalizationButton: show button if personalizationAvailable=true, hide if false
- [x] T012 [P] Add button text logic: display "✓ Personalized" when personalizationEnabled=true, "Personalize Content" when false
- [x] T013 Add ARIA label to PersonalizationButton for accessibility: aria-label="Toggle content personalization"
- [x] T014 Create ContentVariant component in `physical-ai-book/src/components/ContentVariant/index.js` that accepts props: type (explanation|code_example|exercise), level|language|hardware, children
- [x] T015 Implement ContentVariant rendering logic: if personalizationEnabled=false, render nothing (show default). If userProfile matches variant, render children.
- [x] T016 [P] Add variant matching logic to ContentVariant: compare userProfile experience levels to variant props (e.g., userProfile.ros2_experience === level)
- [x] T017 Add fallback handling to ContentVariant: if user profile doesn't match any variant, render nothing (show default version instead)

**Checkpoint**: PersonalizationButton appears on page, ContentVariant component ready, both responsive on mobile

---

## Phase 3: User Story 1 — Trigger Content Personalization (Priority: P1)

**Goal**: Students can see and click "Personalize Content" button; content adapts based on profile.

**Independent Test**: Sign in → open chapter → verify button appears → click button → verify content adapts immediately.

### Implementation for User Story 1

- [x] T018 [US1] Add PersonalizationButton to chapter header layout by creating/updating Docusaurus swizzle or theme component that includes the button
- [x] T019 [US1] Add button positioning CSS to prevent overlap with chapter title or TOC
- [x] T020 [US1] Test button visibility: sign in with complete profile → open chapter → verify button appears with correct text
- [x] T021 [US1] Test button click handler: click button → verify togglePersonalization() called → verify personalizationEnabled state flips
- [x] T022 [US1] Test unauthenticated state: log out → open chapter → verify button does not appear
- [x] T023 [US1] Test incomplete profile: sign in, skip questionnaire → open chapter → verify button appears but disabled or shows info message
- [x] T024 [US1] Test state persistence: toggle button → navigate to another chapter → navigate back → verify toggle state is remembered

**Checkpoint**: Full User Story 1 works. Students can click button to toggle personalization. State persists across navigation.

---

## Phase 4: User Story 2 — Adapt Explanations by Experience Level (Priority: P1)

**Goal**: Explanation content shows appropriate variant for user's experience level.

**Independent Test**: Sign in as beginner → view chapter → verify explanation is detailed. Sign in as advanced → same chapter → verify explanation is concise.

### Implementation for User Story 2

- [x] T025 [US2] Create example chapter file `physical-ai-book/docs/test-chapter-explanations.mdx` with at least 3 ContentVariant explanation blocks (beginner, intermediate, advanced levels)
- [x] T026 [US2] Add example beginner explanation variant: detailed, foundational concepts explained in simple language
- [x] T027 [US2] Add example intermediate explanation variant: balanced detail, assumes some knowledge
- [x] T028 [US2] Add example advanced explanation variant: concise, assumes prior knowledge, focuses on implementation
- [x] T029 [US2] Test explanation adaptation: set user profile to beginner ros2_experience → open test chapter → verify beginner variant displayed
- [x] T030 [US2] Test explanation adaptation: change profile to advanced → reload → verify advanced variant displayed
- [x] T031 [US2] Test explanation fallback: personalization toggled off → verify all students see standard version (first variant or default content)
- [x] T032 [US2] Test incomplete profile: user profile missing ros2_experience field → verify shows default content instead of error

**Checkpoint**: User Story 2 works. Explanation variants render based on user experience level. Toggle on/off hides/shows variants.

---

## Phase 5: User Story 3 — Adapt Code Examples by Language Experience (Priority: P1)

**Goal**: Code examples show language variant matching user's experience (Python, C++, ROS 2).

**Independent Test**: Sign in with Python experience → see Python code. Sign in with C++ experience → see C++ code.

### Implementation for User Story 3

- [x] T033 [US3] Extend test chapter `physical-ai-book/docs/test-chapter-explanations.mdx` with at least 3 ContentVariant code example blocks (python, cpp, ros2 languages)
- [x] T034 [US3] Add example Python code variant: syntactically correct, shows concept in Python
- [x] T035 [US3] Add example C++ code variant: syntactically correct, shows same concept in C++
- [x] T036 [US3] Add example ROS 2 code variant: uses ROS 2 APIs, shows concept with ROS 2
- [x] T037 [US3] Test code example adaptation: set python_experience=intermediate → verify Python code shown
- [x] T038 [US3] Test code example adaptation: set cpp_experience=advanced → verify C++ code shown
- [x] T039 [US3] Test code example fallback: no language experience set → verify defaults to Python code with optional note
- [x] T040 [US3] Test code example matching: verify different language variants show same concept but in different syntax

**Checkpoint**: User Story 3 works. Code examples render based on user language experience. Language variants are semantically equivalent.

---

## Phase 6: User Story 4 — Adapt Exercises by Hardware Background (Priority: P2)

**Goal**: Exercises show variant relevant to user's hardware experience (robot, sensor, mixed).

**Independent Test**: Sign in with robot background → see robot exercises. Sign in with sensor background → see sensor exercises.

### Implementation for User Story 4

- [x] T041 [US4] Extend test chapter with at least 3 ContentVariant exercise blocks (robot-focused, sensor-focused, no-hardware)
- [x] T042 [US4] Add example robot-focused exercise: involves robot simulation or control tasks
- [x] T043 [US4] Add example sensor-focused exercise: focuses on sensor interfacing and data reading
- [x] T044 [US4] Add example no-hardware exercise: guided task for students without hardware experience
- [x] T045 [US4] Test exercise adaptation: set robot_hardware_experience=intermediate → verify robot-focused exercise shown
- [x] T046 [US4] Test exercise adaptation: set sensor_experience=beginner → verify sensor-focused exercise shown
- [x] T047 [US4] Test exercise fallback: no hardware experience → verify defaults to sensor exercise with instructions
- [x] T048 [US4] Test exercise relevance: verify different hardware variants are contextually appropriate for their audience

**Checkpoint**: User Story 4 works. Exercise variants render based on user hardware background. All variants are pedagogically appropriate.

---

## Phase 7: User Story 5 — Toggle Personalization On and Off (Priority: P2)

**Goal**: Students can toggle personalization button to switch between personalized and standard views.

**Independent Test**: Toggle on → content personalizes. Toggle off → content reverts to default. Toggle again → content personalizes again. State persists.

### Implementation for User Story 5

- [x] T049 [US5] Verify togglePersonalization() method in PersonalizationProvider correctly flips personalizationEnabled state
- [x] T050 [US5] Verify button text updates: toggle on → show "✓ Personalized", toggle off → show "Personalize Content"
- [x] T051 [US5] Verify ContentVariant respects personalizationEnabled flag: when false, nothing renders; when true, matching variants render
- [x] T052 [US5] Verify toggle state persists across page reload: toggle off → reload → still off. Toggle on → reload → still on.
- [x] T053 [US5] Verify toggle state is per-chapter: toggle off in chapter 1 → open chapter 2 → should be off there too (global per session)
- [x] T054 [US5] Test multiple toggles: toggle on → off → on → off → on → verify content correctly adapts each time
- [x] T055 [US5] Test toggle with incomplete profile: toggle on when user has incomplete profile → should show default content (no error)

**Checkpoint**: User Story 5 works. Toggle on/off functions correctly. State persists and is consistent across chapters.

---

## Phase 8: Integration

**Purpose**: Wire all components into Docusaurus app and chapters.

- [x] T056 Update `physical-ai-book/src/theme/Root.js` to wrap children with PersonalizationProvider (alongside AuthProvider and ChatWidget)
- [x] T057 [P] Verify PersonalizationProvider is highest in component tree (so usePersonalization hook accessible to all descendants)
- [x] T058 [P] Import PersonalizationButton in chapter layout component (or Docusaurus theme swizzle)
- [x] T059 Import ContentVariant component so MDX chapters can use `<ContentVariant>` tags
- [x] T060 Test integration: entire app wrapped with PersonalizationProvider → usePersonalization hook available in all components
- [x] T061 Test Docusaurus build passes: run `npm run build` in `physical-ai-book/` → no errors, no warnings
- [x] T062 [P] Verify no layout shift when PersonalizationButton appears/disappears (fixed positioning, proper z-index)

**Checkpoint**: All components integrated. Docusaurus builds successfully. No console errors.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: E2E testing, accessibility, mobile, performance verification.

- [ ] T063 Manual E2E test: sign up new account → complete questionnaire → open chapter with personalization → toggle on/off → navigate chapters → sign out → verify all flows work
- [ ] T064 Accessibility test: keyboard navigate to PersonalizationButton → Tab focus visible → Space/Enter activates toggle → ARIA labels present
- [ ] T065 Mobile test: open chapter on mobile (iPhone, Android) → verify PersonalizationButton visible and clickable → no horizontal scroll → button doesn't overlap content
- [ ] T066 Performance test: measure time from button click to content adaptation → verify <500ms latency
- [ ] T067 Error scenario test: kill auth-server → try to personalize → verify graceful degradation, helpful message shown
- [ ] T068 Profile update test: edit background in auth system ProfilePanel → refresh personalization → verify profile changes reflected immediately
- [ ] T069 Private browsing test: open chapter in private/incognito → verify button appears → toggle state doesn't persist (acceptable)
- [ ] T070 Verify console has no warnings or errors related to personalization
- [ ] T071 Test variant content is readable: verify text contrast, font sizes, line spacing meet accessibility standards

**Checkpoint**: All E2E tests pass. Mobile responsive. Accessible. Performance targets met. No console errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (UI)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 1 + Phase 2 — BLOCKS US2-US5 visibility
- **Phase 4 (US2)**: Depends on Phase 1 + Phase 2 + Phase 3 — independent test
- **Phase 5 (US3)**: Depends on Phase 1 + Phase 2 + Phase 3 — independent test
- **Phase 6 (US4)**: Depends on Phase 1 + Phase 2 + Phase 3 — independent test
- **Phase 7 (US5)**: Depends on Phase 1 + Phase 2 + Phase 3 — independent test
- **Phase 8 (Integration)**: Depends on Phase 1-7 — BLOCKS delivery
- **Phase 9 (Polish)**: Depends on Phase 8 — final validation

### User Story Dependencies

- **US1 (Button)**: After Phase 2 — no other story dependencies
- **US2 (Explanations)**: After Phase 3 — independently testable
- **US3 (Code)**: After Phase 3 — independently testable
- **US4 (Exercises)**: After Phase 3 — independently testable (P2 priority)
- **US5 (Toggle)**: After Phase 3 — independently testable (P2 priority)

### Within Each Phase

- Backend setup before frontend (T001-T008 before T009+)
- Component logic before styling (T009 before T010)
- Core feature before integration (US1-US5 before Phase 8)

### Parallel Opportunities

**Phase 1 Setup**:
- T002 + T003 can run in parallel (both modify PersonalizationProvider)
- T005 + T006 can run in parallel (utils + method)

**Phase 2 UI**:
- T010 can run in parallel with T009 (styles don't block component creation)
- T016 can run in parallel with T014 (matching logic separate from rendering)

**Phase 3+ User Stories**:
- T025-T032 (US2) can start in parallel after T024 (US1 checkpoint)
- T033-T040 (US3) can start in parallel after T024 (US1 checkpoint)
- T041-T048 (US4) can start in parallel after T024 (US1 checkpoint)
- T049-T055 (US5) can start in parallel after T024 (US1 checkpoint)

---

## Parallel Example: Phase 1 Setup

```bash
# Sequential (dependencies):
T001 → T002/T003 (parallel) → T004 → T005/T006 (parallel) → T007 → T008

# Parallel (no dependencies):
T005 (utils) || T006 (method)
T002 (fetch) || T003 (error handling)
```

---

## Parallel Example: Phase 3+ User Stories

```bash
# After checkpoint T024 (US1 complete), start all user stories in parallel:
T025-T032 (US2 explanations) || T033-T040 (US3 code) || T041-T048 (US4 exercises) || T049-T055 (US5 toggle)

# Then integrate all (Phase 8):
T056-T062 (Integration)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 = P1 Features)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: UI Components (T009-T017)
3. Complete Phase 3: US1 Button (T018-T024)
4. Complete Phase 4: US2 Explanations (T025-T032)
5. Complete Phase 5: US3 Code Examples (T033-T040)
6. **STOP and VALIDATE**: Core personalization works (explanation + code examples adapt correctly)
7. Deploy/demo if ready — delivers core feature value

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Add Phase 3 (US1) → Test → Deploy (button works!)
3. Add Phase 4 (US2) → Test → Deploy (explanations personalize!)
4. Add Phase 5 (US3) → Test → Deploy (code examples personalize!)
5. Add Phase 6 (US4) → Test → Deploy (exercises personalize — P2 bonus)
6. Add Phase 7 (US5) → Test → Deploy (toggle works — P2 bonus)
7. Phase 8 (Integration) → Full wiring
8. Phase 9 (Polish) → Final validation

---

## Notes

- [P] tasks = different files, no dependencies (can run in parallel after prerequisites)
- [Story] label maps task to specific user story (US1-US5)
- No automated test suite (manual E2E only, per hackathon scope)
- Total: 71 tasks across 9 phases
- MVP scope (P1 features): Phases 1-5 + Phase 8 = ~51 tasks (2–3 days for experienced React developer)
- Full scope (P1+P2): All 9 phases = 71 tasks (3–4 days)

