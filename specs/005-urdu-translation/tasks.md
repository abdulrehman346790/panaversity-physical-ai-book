# Task List: Urdu Translation Feature

**Feature**: 005-urdu-translation | **Branch**: `005-urdu-translation`
**Date**: 2026-02-16 | **Status**: Ready for Implementation
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

---

## Summary

This task list implements the Urdu translation feature across 5 user stories (4 P1 + 1 P2).

- **Total Tasks**: 43
- **Setup & Foundational**: 5 tasks
- **US1 (Translate to Urdu)**: 8 tasks
- **US2 (Toggle Languages)**: 6 tasks
- **US3 (Preserve Formatting)**: 8 tasks
- **US4 (Code Quality)**: 7 tasks
- **US5 (Mobile & Accessibility)**: 6 tasks
- **Polish & Cross-Cutting**: 3 tasks

**Parallel Opportunities**: Tasks marked `[P]` can run in parallel within the same phase.

**MVP Scope**: Phases 1-6 (Setup + US1-US4) deliver core translation functionality. Phase 7 (US5) is P2 and can follow.

**Implementation Strategy**:
1. Setup infrastructure (TranslationProvider, hooks, utilities)
2. Build core components (TranslationButton, context)
3. Implement translation loading and caching
4. Add RTL layout support
5. Create translation JSON files
6. Add mobile and accessibility enhancements
7. Final E2E testing

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize project structure, dependencies, and infrastructure.
**Duration**: ~30 minutes
**Parallel**: Yes, independent file creation tasks can run together.
**Status**: ✅ COMPLETE

- [x] T001 Create TranslationProvider component directory at `physical-ai-book/src/components/TranslationProvider/`
- [x] T002 Create TranslationButton component directory at `physical-ai-book/src/components/TranslationButton/`
- [x] T003 Create hooks directory at `physical-ai-book/src/hooks/` (if not exists)
- [x] T004 Create lib/translation.js utilities file at `physical-ai-book/src/lib/translation.js`
- [x] T005 Create public/translations/urdu directory at `physical-ai-book/public/translations/urdu/`

---

## Phase 2: Foundational Infrastructure

**Goal**: Build core state management and utility layer that all user stories depend on.
**Duration**: ~1 hour
**Blocking**: Must complete before any user story implementation.
**Status**: ✅ COMPLETE

- [x] T006 Implement localStorage utility functions in `physical-ai-book/src/lib/translation.js`: getLanguagePreference(), setLanguagePreference(), clearLanguagePreference()
- [x] T007 Implement translation file loading utility in `physical-ai-book/src/lib/translation.js`: loadTranslation(chapterId) with error handling and fetch fallback
- [x] T008 Create technical terms whitelist in `physical-ai-book/src/lib/technicalTerms.js`: array of ~50-100 terms (ROS 2, rclpy, middleware, publish, subscribe, etc.) with case-sensitive matching
- [x] T009 Create TranslationContext and TranslationProvider component at `physical-ai-book/src/components/TranslationProvider/index.js` with state: language, translation, isLoading, error
- [x] T010 Implement useTranslation hook at `physical-ai-book/src/hooks/useTranslation.js` that returns context with null-check error handling

---

## Phase 3: US1 - Translate Chapter to Urdu

**Goal**: Students can click a button and see chapter content in Urdu with RTL layout.
**User Story**: Translate Chapter to Urdu (P1)
**Test Criteria**:
- Translation button visible on chapter page
- Clicking button switches content to Urdu
- Layout is RTL when displaying Urdu
- Code blocks remain in English
- Technical terms remain in English

**Duration**: ~1.5 hours

- [x] T011 [P] [US1] Create TranslationButton component at `physical-ai-book/src/components/TranslationButton/index.js` with onClick handler calling toggleLanguage()
- [x] T012 [P] [US1] Create TranslationButton styles at `physical-ai-book/src/components/TranslationButton/styles.module.css` with fixed position (top 16px, right 16px), z-index 50, responsive design
- [x] T013 [US1] Implement toggleLanguage() method in TranslationProvider: toggle language state and persist to localStorage
- [x] T014 [US1] Implement loadTranslation(chapterId) in TranslationProvider: fetch JSON, cache, handle 404 gracefully
- [x] T015 [US1] Create RTL content wrapper CSS class in `physical-ai-book/src/theme/DocItem.module.css`: direction: rtl, text-align: auto, font-family: Noto Sans Urdu
- [x] T016 [P] [US1] Add Noto Sans Urdu font import to `physical-ai-book/src/css/custom.css`: @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Urdu:wght@400;700&display=swap')
- [x] T017 [P] [US1] Update Root.js at `physical-ai-book/src/theme/Root.js`: wrap children with TranslationProvider and render TranslationButton
- [x] T018 [US1] Create test chapter translation file at `physical-ai-book/public/translations/urdu/01-introduction-to-ros2.json` with structure: chapter_id, language, title, content (HTML), translation_status, last_updated

---

## Phase 4: US2 - Toggle Between Languages

**Goal**: Students can seamlessly switch between Urdu and English views.
**User Story**: Toggle Between Languages (P1)
**Test Criteria**:
- Toggle switches language immediately (<500ms)
- Button text changes (اردو میں ↔ English)
- Content changes on toggle
- Preference persists across page reloads
- Preference applies to all chapters in session

**Duration**: ~1 hour

- [x] T019 [US2] Implement button text logic in TranslationButton: display "اردو میں" when English, "English" when Urdu
- [x] T020 [US2] Implement aria-label in TranslationButton for accessibility: "Switch to Urdu" / "Switch to English"
- [x] T021 [US2] Add useEffect to TranslationProvider: load language preference from localStorage on mount
- [x] T022 [US2] Add session persistence logic: save last toggled language to localStorage with timestamp
- [x] T023 [US2] Implement global language preference application: chapter context reads preference on load, applies RTL/translation automatically
- [x] T024 [US2] Create integration test scenarios: verify toggle works on multiple chapters, preference persists across navigations

---

## Phase 5: US3 - Display Translated Content with Preserved Formatting

**Goal**: Translated paragraphs, lists, headings, and links appear correctly with preserved structure.
**User Story**: Display Translated Content with Preserved Formatting (P1)
**Test Criteria**:
- Headings are translated and maintain hierarchy
- Lists preserve structure (bullets, numbering, indentation)
- Bold/italic emphasis preserved in translation
- Links remain clickable and functional
- Multi-line content doesn't break

**Duration**: ~1.5 hours

- [x] T025 [P] [US3] Create translation JSON structure template in `physical-ai-book/public/translations/urdu/template.json`: title, content (HTML), sections array with heading and content fields
- [x] T026 [P] [US3] Create 02-rclpy-basics.json at `physical-ai-book/public/translations/urdu/02-rclpy-basics.json` with proper heading hierarchy and list structure
- [x] T027 [P] [US3] Create 03-rclcpp-cpp-client-library.json at `physical-ai-book/public/translations/urdu/03-rclcpp-cpp-client-library.json`
- [x] T028 [P] [US3] Create remaining translation files (04-16) at `physical-ai-book/public/translations/urdu/{chapter-slug}.json`: 8-10 chapters total as placeholders
- [x] T029 [US3] Implement RTL content rendering in chapter component: conditionally apply RTL class based on language state
- [x] T030 [US3] Implement dangerouslySetInnerHTML handling for translated HTML content: render translation.content as HTML
- [x] T031 [US3] Add HTML sanitization check: verify translation JSON contains valid HTML (no script tags, safe markup only)
- [x] T032 [US3] Implement fallback message: if translation unavailable, show banner "Translation coming soon" above English content

---

## Phase 6: US4 - Maintain Code Quality and Technical Accuracy

**Goal**: Code blocks and technical terms remain in English and unchanged.
**User Story**: Maintain Code Quality and Technical Accuracy (P1)
**Test Criteria**:
- Code blocks remain English and unchanged
- Function/variable names in text remain English
- Library names (rclpy, rclcpp) remain unchanged
- Imports remain in English
- Code is executable as-is

**Duration**: ~1 hour

- [x] T033 [US4] Implement code block override: add CSS rule for `code`, `pre` elements in RTL context: direction: ltr, text-align: left
- [x] T034 [US4] Create technical terms sanitization in translation loading: verify translation doesn't contain translated versions of whitelisted terms
- [x] T035 [US4] Add validation for code blocks in translation JSON: ensure code examples are NOT translated (remain English)
- [x] T036 [US4] Implement code block detection: mark `<pre>` and `<code>` tags with data-lang attribute to prevent translation
- [x] T037 [US4] Create validation test for executable code: verify Python/C++ code in translated chapters matches original syntax
- [x] T038 [US4] Add edge case handling: if translated content contains translated code keywords, revert to English + error message
- [x] T039 [US4] Document whitelisted terms in `physical-ai-book/public/translations/urdu/WHITELIST.md`: list of ~50-100 terms that should never be translated

---

## Phase 7: US5 - Support Mobile and Accessibility

**Goal**: Feature works on mobile and is accessible via keyboard and screen readers.
**User Story**: Support Mobile and Accessibility (P2)
**Test Criteria**:
- Button visible and tappable on mobile (<480px, >44px height)
- Urdu text readable without horizontal scroll
- Keyboard navigation works (Tab, Enter)
- Screen reader announces button correctly
- Touch events work on mobile

**Duration**: ~1.5 hours

- [x] T040 [P] [US5] Add responsive design to TranslationButton styles: media query for tablets (768px) and mobile (480px), adjust padding and font size
- [x] T041 [P] [US5] Add mobile touch optimization: active states for buttons, reduce button gap on mobile
- [x] T042 [US5] Implement keyboard navigation: ensure button is focusable (tabindex or native button), responds to Enter/Space
- [x] T043 [US5] Add ARIA labels and roles: button role (or native button element), aria-label for screen readers, aria-pressed for toggle state
- [x] T044 [US5] Test with screen reader: verify Urdu content read aloud correctly, button announcement clear ("Switch to Urdu" / "Switch to English")
- [x] T045 [US5] Verify Urdu font rendering on mobile: test on iOS and Android devices, ensure text legible without zoom

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final validation, documentation, and E2E testing.
**Duration**: ~1 hour

- [x] T046 [P] Create E2E test scenarios document in `specs/005-urdu-translation/testing.md`: manual test steps for all 5 user stories
- [x] T047 [P] Update Root.js integration checklist in `specs/005-urdu-translation/checklists/integration.md`: verify all components properly wired
- [x] T048 Run build verification: `npm run build` in `physical-ai-book/` passes without errors or warnings
- [x] T049 Run manual E2E test: verify toggle works on 3 chapters, RTL renders correctly, code blocks unchanged, mobile responsive
- [x] T050 Create PHR for task completion: document all tasks completed, branch ready for PR

---

## Task Dependencies & Execution Order

```
Phase 1 (Setup) → Phase 2 (Foundational)
                 ↓
        Phase 3 (US1) ─→ Phase 4 (US2)
        Phase 5 (US3)
        Phase 6 (US4)
        Phase 7 (US5) [P2, can follow Phase 6]
                 ↓
        Phase 8 (Polish)
```

**Dependency Rules**:
- Phase 1 must complete before Phase 2
- Phase 2 must complete before any user story (Phase 3-7)
- User stories can run in parallel if preferred (no cross-dependencies)
- Phase 8 requires all story phases complete

**Parallel Execution Example** (if running in parallel):
- Phase 3 & 4 (US1 & US2): Independent but related; suggest sequential for testing
- Phase 5 & 6 (US3 & US4): Can run parallel; different concerns (formatting vs. code)
- Phase 7 (US5): Can start after Phase 6 completes; P2 priority

---

## MVP Scope Recommendation

**For minimum viable product, implement in this order**:

1. ✅ Phase 1 (Setup)
2. ✅ Phase 2 (Foundational Infrastructure)
3. ✅ Phase 3 (US1 - Core Translation)
4. ✅ Phase 4 (US2 - Toggle)
5. ✅ Phase 6 (US4 - Code Quality)
6. ⚠️ Phase 5 (US3 - Formatting) - Important but can defer
7. ⚠️ Phase 7 (US5 - Mobile/Accessibility) - P2, defer if time limited
8. ✅ Phase 8 (Polish)

**MVP Tasks**: T001-T010, T011-T024, T033-T039 (27 tasks, ~3-4 hours)

**Full Implementation**: All 50 tasks (~5-6 hours total)

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- TaskID: T001-T050 (sequential)
- [P] marker: Present only on parallelizable tasks (different files, no blocking dependencies)
- [Story] label: Present on Phase 3-7 tasks, identifies user story (US1-US5)
- Description: Clear action with exact file paths
- Format check: All tasks have checkbox, ID, conditional labels, and paths

---

## Next Steps

1. ✅ **Review this task list** — Verify all tasks make sense and are achievable
2. 🚀 **Execute Phase 1** — Start with setup tasks (T001-T005)
3. 🚀 **Execute Phase 2** — Build foundational layer (T006-T010)
4. 🚀 **Execute user story phases** — Complete US1-US5 in priority order
5. ✅ **Create PHR** — Document task generation
6. 🎯 **Submit PR** — When all tasks complete, create pull request to main

---

## Related Artifacts

- **Specification**: `specs/005-urdu-translation/spec.md` (5 user stories, 12 functional requirements)
- **Implementation Plan**: `specs/005-urdu-translation/plan.md` (5 design decisions, 4 implementation phases)
- **Data Model**: `specs/005-urdu-translation/data-model.md` (TranslationFile, LanguagePreference entities)
- **API Contracts**: `specs/005-urdu-translation/contracts/translation.api.md` (component APIs, hooks, utilities)
- **Quickstart**: `specs/005-urdu-translation/quickstart.md` (developer setup with code snippets)
- **Research**: `specs/005-urdu-translation/research.md` (design decision rationale)
- **Quality Checklist**: `specs/005-urdu-translation/checklists/requirements.md` (specification validation)
