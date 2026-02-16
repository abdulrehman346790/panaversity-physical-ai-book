# Implementation Plan: Urdu Translation

**Branch**: `005-urdu-translation` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-urdu-translation/spec.md`

## Summary

Add a per-chapter "Translate to Urdu" / "View in English" toggle button that displays translated chapter content with right-to-left (RTL) layout support, while preserving code blocks, technical terms, and formatting. Implementation is entirely client-side (React/MDX) — stores language preference in localStorage, renders content variants based on availability, and gracefully handles missing translations.

---

## Technical Context

**Language/Version**: JavaScript/React (frontend); Node.js runtime (no backend services needed)
**Primary Dependencies**: React (19.0+), Docusaurus (3.9.x), CSS-in-JS for RTL, Urdu fonts (web fonts)
**Storage**: localStorage for language preference; translated chapter content pre-stored in MDX/JSON
**Testing**: Manual E2E testing (no automated test suite required per hackathon scope)
**Target Platform**: Browser (MDX/React rendered by Docusaurus)
**Project Type**: Frontend-only (single SPA — no separate backend for this feature)
**Performance Goals**: Language toggle <500ms, RTL layout renders without reflow, zero layout shift
**Constraints**: Must not break existing chapter layout, graceful degradation when translation unavailable, mobile-responsive
**Scale/Scope**: 16 existing chapters, 2 languages (English + Urdu), predefined technical terms list (~50 terms)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. Content Accuracy | ✅ PASS | Feature displays pre-translated content; accuracy depends on translation quality (external responsibility). Feature itself doesn't modify content. |
| II. Spec-Driven Development | ✅ PASS | Following SDD pipeline: spec → plan → tasks → implement. This plan artifact demonstrates adherence. |
| III. Modular Feature Independence | ✅ PASS | Translation is independent feature. Works without auth (uses localStorage). Book fully functional without translations. |
| IV. Security & Secrets | ✅ PASS | No secrets in feature. Language preference stored in localStorage (non-sensitive). Translations are static content. |
| V. Simplicity & YAGNI | ✅ PASS | Pure content switching via conditional rendering. No ML, no complex algorithms. RTL via standard CSS. |
| VI. Accessibility & Multilingual | ✅ PASS | Translation IS accessibility feature. RTL support, Urdu fonts, keyboard navigation included. |

**Gate result**: PASS — no violations. Proceed to Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-urdu-translation/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── translation.api.md  # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
physical-ai-book/
├── src/
│   ├── components/
│   │   ├── TranslationButton/       # NEW - Toggle button component
│   │   │   ├── index.js
│   │   │   └── styles.module.css
│   │   └── TranslationProvider/      # NEW - React context for translation state
│   │       └── index.js
│   ├── hooks/
│   │   └── useTranslation.js         # NEW - Hook for accessing translation state
│   ├── lib/
│   │   └── translation.js            # NEW - Utility functions (fetch translations, RTL logic)
│   └── theme/
│       └── Root.js                   # MODIFY - Add TranslationProvider
├── docs/
│   └── *.mdx                         # MODIFY - Add alternate language versions (Urdu)
├── public/
│   └── translations/                 # NEW - Store Urdu translations (JSON or compiled)
│       └── urdu/
│           ├── 01-introduction.json
│           ├── 02-rclpy-basics.json
│           └── ... (16 total)
└── package.json                      # MODIFY - no new dependencies needed
```

**Structure Decision**: Frontend-only feature. Translation button + state management in React components. Chapters have companion translation files (JSON) with Urdu content. No backend services needed — all logic is client-side conditional rendering with localStorage persistence.

---

## Key Design Decisions

### D1: Pre-Translated Content Storage (vs. API-Driven Translation)

**Decision**: Store pre-translated chapters as static JSON files (not fetched from API).

**Rationale**:
- Zero latency for translation toggle (<10ms load from JSON)
- Works offline after first app load
- No dependency on translation service availability
- Matches Docusaurus static site philosophy
- Content updates only on app rebuild

**Alternatives considered**:
- **API-driven**: Fetch translation from backend on demand. Rejected: adds latency, requires backend service, slower UX.
- **Machine translation on-demand**: Generate translations at runtime. Rejected: quality concerns, computational cost, out of scope.

**Mapping to spec requirements**: FR-002 (switch within 500ms) easily achieved with static JSON.

---

### D2: Client-Side RTL Rendering (vs. Server-Side Rendering)

**Decision**: Use CSS `direction: rtl` and `text-align: auto` for RTL layout. No server-side rendering needed.

**Rationale**:
- Browser natively handles RTL text layout
- Standard CSS approach, no special libraries needed
- Works across all modern browsers
- Simple to toggle with class name or style prop

**Alternatives considered**:
- **Custom RTL component library**: Overkill, adds complexity. Rejected.
- **Server-side rendering**: Not needed for static content. Rejected.

**Verification**: RTL support verified against modern browsers (Chrome, Firefox, Safari, Edge).

---

### D3: Technical Terms Whitelist (vs. Selective Translation)

**Decision**: Maintain a predefined list of technical terms (ROS 2, rclpy, middleware, etc.) that are NEVER translated.

**Rationale**:
- Ensures code and technical accuracy
- Prevents confusion from translated library names
- Students expect technical terms in English
- Easy to maintain and extend

**Alternatives considered**:
- **Auto-detect code**: Complex NLP, brittle. Rejected.
- **Translate everything**: Breaks code and technical accuracy. Rejected.
- **Manual tagging in content**: Possible but more work. Rejected in favor of whitelist.

**Mapping to spec**: FR-005 (keep technical terms in English) implemented via whitelist.

---

### D4: localStorage for Language Preference (vs. Server-Side)

**Decision**: Persist language preference in browser localStorage, session-scoped.

**Rationale**:
- Simple, no backend required
- Fast (synchronous access)
- Works across page navigations
- Auto-cleared when browser data cleared (expected behavior)

**Alternatives considered**:
- **Server-side session via 003-auth**: Adds backend complexity. Rejected.
- **In-memory only**: State lost on refresh. Rejected.

**Mapping to spec**: FR-006 (remember preference) implemented via localStorage.

---

### D5: Graceful Degradation for Missing Translations

**Decision**: If translation file not available, show English content with message "Translation coming soon".

**Rationale**:
- Feature is enhancement, not blocking functionality
- Clear feedback to user
- Aligns with Constitution Principle III (modular independence)

**Alternatives considered**:
- **Error modal**: Blocks reading. Bad UX. Rejected.
- **Silently default**: Confusing. Rejected.

---

## Implementation Phases

### Phase 1: Translation Infrastructure
- TranslationProvider context component (fetch & manage Urdu translations)
- useTranslation() hook
- localStorage state management (language preference)
- RTL CSS utilities
- Graceful degradation for missing translations

### Phase 2: UI Components
- TranslationButton (toggle, status indicator)
- RTL layout wrapper
- Button styling & positioning
- Mobile responsiveness

### Phase 3: Integration
- Update Root.js with TranslationProvider
- Integrate TranslationButton into chapter layouts
- Integrate RTL wrapper for Urdu content

### Phase 4: Content & Testing
- Create Urdu translation files for all 16 chapters
- Manual E2E testing (toggle, persistence, RTL rendering)
- Mobile testing
- Accessibility testing (screen readers, keyboard)
- Performance verification (<500ms toggle)

---

## Complexity Tracking

No constitution violations. All decisions align with principles:
- **Simplicity (V)**: Pure React context + conditional rendering. No external APIs, no complex algorithms. CSS RTL via standard properties.
- **Modular independence (III)**: Translation fully independent. Gracefully degrades when translations unavailable. Book works without translations.
- **Security (IV)**: No secrets. Translations are static content. localStorage for non-sensitive preference.

---

## Next Phase: Phase 0 & Phase 1 Design

Will generate:
- **research.md**: Design decision rationale
- **data-model.md**: TranslationFile and LanguagePreference entities
- **contracts/translation.api.md**: Component and hook interfaces
- **quickstart.md**: Developer setup guide
- **Agent context update**: Add React + RTL to project context
