# Implementation Plan: Content Personalization

**Branch**: `004-personalization` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-personalization/spec.md`

## Summary

Add a per-chapter "Personalize Content" button that adapts explanations, code examples, and exercises based on the student's background profile (collected during auth signup). Implementation is entirely client-side (React/MDX) — fetches user profile from 003-auth, renders appropriate content variants based on experience levels, and persists personalization state in localStorage.

## Technical Context

**Language/Version**: JavaScript/React (frontend); Node.js runtime (no backend services needed)
**Primary Dependencies**: React (19.0+), Docusaurus (3.9.x), better-auth client (already installed), localStorage API
**Storage**: localStorage for personalization toggle state; user profile fetched from 003-auth backend
**Testing**: Manual E2E testing (no automated test suite required per hackathon scope)
**Target Platform**: Browser (MDX/React rendered by Docusaurus)
**Project Type**: Frontend-only (single SPA — no separate backend for this feature)
**Performance Goals**: Button click → content adaptation <500ms, zero layout shift on toggle
**Constraints**: Must not break existing chapter layout, graceful degradation when auth unavailable, mobile-responsive
**Scale/Scope**: 16 existing chapters, 5 experience dimensions (Python, C++, ROS 2, robot hardware, sensors), 3 experience levels per dimension

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. Content Accuracy | ✅ PASS | Feature displays pre-authored variants, doesn't generate content. Accuracy depends on content writers, not implementation. |
| II. Spec-Driven Development | ✅ PASS | Following SDD pipeline: spec → plan → tasks → implement. This plan artifact demonstrates adherence. |
| III. Modular Feature Independence | ✅ PASS | Personalization is independent feature. Gracefully degrades if 003-auth unavailable. Book fully functional without it. |
| IV. Security & Secrets | ✅ PASS | No secrets in this feature. User background fetched from 003-auth (already secure). localStorage used for non-sensitive toggle state. |
| V. Simplicity & YAGNI | ✅ PASS | Pure content switching via conditional rendering. No ML, no complex algorithms, no premature abstractions. localStorage for state. |
| VI. Accessibility & Multilingual | ✅ PASS | Button accessible (keyboard, ARIA labels). Content variants authored by content writers (separate from this feature). |

**Gate result**: PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-personalization/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── personalization.api.md  # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
physical-ai-book/
├── src/
│   ├── components/
│   │   ├── PersonalizationButton/        # NEW - Toggle button component
│   │   │   ├── index.js
│   │   │   └── styles.module.css
│   │   ├── PersonalizationProvider/       # NEW - React context for personalization state
│   │   │   └── index.js
│   │   └── ContentVariant/               # NEW - Conditional renderer for variants
│   │       └── index.js
│   ├── lib/
│   │   └── personalization.js            # NEW - Personalization logic (fetch profile, match variants)
│   ├── hooks/
│   │   └── usePersonalization.js         # NEW - Hook for accessing personalization state
│   └── theme/
│       └── Root.js                       # MODIFY - Wrap with PersonalizationProvider
├── docs/                                  # EXISTING - Chapters contain variant metadata
│   └── *.mdx                             # Content writers add variant tags here
└── package.json                          # MODIFY - no new dependencies needed
```

**Structure Decision**: Frontend-only feature. Personalization button + state management in React components. Chapters (MDX files) are marked by content writers with variant metadata (e.g., `{personalization.explanation.beginner}...{/personalization}`). No backend services needed — all logic is client-side conditional rendering.

## Key Design Decisions

### D1: Client-Side Content Switching (vs. Backend Rendering)

**Decision**: Implement personalization entirely on the client (React). Chapters contain all variants; client selects which to display.

**Rationale**:
- Zero backend overhead (no API calls per chapter load after initial profile fetch)
- Works offline after first load (localStorage-based state)
- Faster UX (no server round-trip for personalization decisions)
- Simpler deployment (no new backend services to manage)
- Aligns with Docusaurus static site approach

**Alternatives considered**:
- **Backend rendering**: Server sends pre-personalized HTML. Rejected: adds backend load, slower UX, requires managing multiple rendered variants per chapter.
- **API-driven personalization**: Each chapter load fetches adaptation rules from API. Rejected: network latency, complexity, not needed for static content.

**Mapping to spec requirements**: FR-001 (fetch profile) happens once per session; FR-003-005 (adapt content) happen via client-side React conditional rendering.

### D2: localStorage for Personalization Toggle State

**Decision**: Persist personalization on/off toggle in browser localStorage, scoped per session/device.

**Rationale**:
- Simple, no backend required
- Fast (synchronous access)
- Works across page navigations (same browser/device)
- Auto-cleared when browser data is cleared (user expectation)
- Acceptable UX: state resets across devices/browsers (not a requirement)

**Alternatives considered**:
- **Server-side session storage via 003-auth**: Adds backend complexity, slower UX, overkill for simple on/off toggle. Rejected.
- **In-memory only**: State lost on page refresh (bad UX). Rejected.
- **IndexedDB**: Overkill for simple boolean toggle. Rejected.

**Mapping to spec**: FR-006 (persist toggle state across navigations) implemented via localStorage with session scope.

### D3: Content Variant Metadata in MDX

**Decision**: Content writers manually mark variant sections in MDX using custom component syntax (e.g., `<Variant level="beginner">...</Variant>`). React renders appropriate variant based on personalization state.

**Rationale**:
- Separates content authoring from feature implementation
- Explicit, readable, maintains authorship control
- No need for complex NLP/ML to identify variants
- Reusable component pattern for future enhancements

**Alternatives considered**:
- **Separate variant files per chapter**: 3x file count, fragmented content, maintenance nightmare. Rejected.
- **AI-generated variants**: Out of scope, resource-intensive, accuracy concerns. Rejected.
- **Content-only, no metadata**: Requires complex logic to infer variants (brittle). Rejected.

**Note**: Variant tagging is handled separately by content writers. This feature implements the **rendering logic** for tagged variants.

### D4: React Context for Personalization State

**Decision**: Use React Context (PersonalizationProvider) to make personalization state (user profile, toggle state, experience levels) available to all components via custom hooks.

**Rationale**:
- Avoids prop drilling (personalization data doesn't travel through deep component trees)
- Clean separation of concerns (state management separate from rendering)
- Compatible with existing Docusaurus architecture (already uses React context for theming)
- Enables easy testing (mock context for different user profiles)

**Alternatives considered**:
- **Redux**: Overkill for single boolean toggle + user profile. Rejected.
- **Props drilling**: Messy for deeply nested MDX content. Rejected.
- **Global variables**: Brittle, hard to test, bad practice. Rejected.

### D5: Graceful Degradation When Auth Unavailable

**Decision**: If fetching user profile fails, disable personalization and show standard content with informational message.

**Rationale**:
- User experience not degraded (book fully readable)
- Clear feedback ("Personalization unavailable" message)
- Aligns with Constitution Principle III (modular independence)

**Alternatives considered**:
- **Fail loudly**: Error modal blocks book. Bad UX. Rejected.
- **Retry indefinitely**: Could hang UI. Rejected.
- **Assume default profile**: Wrong assumptions could frustrate users. Rejected.

## Implementation Phases

### Phase 1: Personalization Infrastructure
- PersonalizationProvider context component
- usePersonalization() hook
- localStorage state management
- Fetch user profile from 003-auth backend
- Error handling & graceful degradation

### Phase 2: UI Components
- PersonalizationButton (toggle, status indicator)
- ContentVariant wrapper component
- Button styling & positioning
- Mobile responsiveness

### Phase 3: Integration
- Update Root.js to wrap app with PersonalizationProvider
- Integrate PersonalizationButton into chapter layouts
- Integrate ContentVariant into MDX components

### Phase 4: Polish & Testing
- E2E testing (manual)
- Mobile testing
- Accessibility testing
- Performance optimization

## Complexity Tracking

No constitution violations. All decisions align with principles:
- **Simplicity (V)**: Pure React context + conditional rendering. No external services, no complex algorithms.
- **Modular independence (III)**: Feature fully independent. Gracefully degrades when 003-auth unavailable. Book works without personalization.
- **Security (IV)**: No secrets. User profile fetched securely from 003-auth. localStorage used for non-sensitive toggle state.
