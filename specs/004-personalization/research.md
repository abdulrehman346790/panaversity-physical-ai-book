# Research: Content Personalization Feature

**Date**: 2026-02-16 | **Feature**: 004-personalization | **Branch**: 004-personalization

## Summary

This document consolidates research findings on content personalization strategy, technical approach, and integration with existing infrastructure.

---

## R1: Client-Side vs Backend-Driven Personalization

**Decision**: Implement **client-side content switching** via React conditional rendering.

**Rationale**:
- Zero additional backend load (no new API calls per chapter after initial profile fetch)
- Works offline after first load (state persisted in localStorage)
- Faster UX (no server round-trip for personalization decisions)
- Simpler deployment (no backend service orchestration)
- Aligns with Docusaurus static site philosophy
- Proven pattern in educational platforms (Coursera, Udemy client-side adaptive UX)

**Alternatives Considered**:
- **Backend rendering**: Server sends pre-personalized HTML per user profile
  - ❌ Rejected: Adds backend load, slower UX, requires managing multiple rendered variants
- **API-driven personalization**: Each chapter load fetches adaptation rules from API
  - ❌ Rejected: Network latency, complexity, overcomplicated for static variants

**Verification**: Docusaurus pre-builds all chapters as static HTML + React components. Personalization can happen at component render time without backend involvement.

---

## R2: State Persistence Strategy

**Decision**: Use **browser localStorage** for personalization toggle state (on/off), scoped per device/session.

**Rationale**:
- Simplest implementation (synchronous, zero latency)
- Works across page navigations and chapter changes within same browser session
- Auto-cleared when user clears browser data (aligns with user expectation)
- No backend storage required
- Gracefully degrades: if unavailable, personalization defaults to off

**Alternatives Considered**:
- **Server-side session storage via 003-auth**
  - ❌ Rejected: Adds backend complexity, slower UX, overkill for simple boolean
- **IndexedDB**
  - ❌ Rejected: Unnecessary complexity for single toggle value
- **In-memory only**
  - ❌ Rejected: State lost on page refresh (bad UX)

**Verification**: Tested pattern in Docusaurus instances; localStorage reliable for persisting UI preferences across navigations.

---

## R3: Content Variant Metadata Format

**Decision**: Content writers manually mark variant sections in MDX using **custom component tags** (e.g., `<Variant level="beginner">...</Variant>`).

**Rationale**:
- Separates content authoring from feature implementation
- Explicit and readable (non-developers can understand structure)
- Maintains clear authorship control (writers decide what variants exist)
- No NLP/ML needed (eliminates accuracy risk)
- Reusable for future content personalization enhancements
- Mirrors established MDX patterns (Docusaurus docusaurus-theme-mermaid uses components)

**Alternatives Considered**:
- **Separate variant files per chapter** (chapter.beginner.mdx, chapter.advanced.mdx)
  - ❌ Rejected: 3x file proliferation, fragmented content, maintenance nightmare
- **AI-generated variants** (LLM-based content generation)
  - ❌ Rejected: Out of scope, resource-intensive, accuracy concerns
- **No metadata, infer variants via NLP**
  - ❌ Rejected: Brittle, requires ML pipeline, accuracy unpredictable

**Verification**: MDX components are first-class in Docusaurus; custom components can be injected via swizzling or direct imports. This is the documented pattern for extensibility.

---

## R4: React Context for Global State

**Decision**: Use **React Context + custom hooks** (PersonalizationProvider, usePersonalization) for managing personalization state across all chapters.

**Rationale**:
- Avoids prop drilling through deeply nested MDX component trees
- Clean separation of concerns (state management separate from rendering)
- Compatible with Docusaurus architecture (already uses React context for theming)
- Enables easy testing (mock context for different user profiles)
- Standard React pattern; no external dependencies needed

**Alternatives Considered**:
- **Redux**
  - ❌ Rejected: Overkill for single boolean + user profile (adds unnecessary complexity)
- **Props drilling**
  - ❌ Rejected: MDX components are deeply nested; messy and unmaintainable
- **Global variables**
  - ❌ Rejected: Brittle, hard to test, violates React best practices

**Verification**: Docusaurus uses context for theme provider; PersonalizationProvider follows the same pattern and integrates alongside existing providers.

---

## R5: Graceful Degradation When Auth Unavailable

**Decision**: If fetching user profile from 003-auth fails, **disable personalization and show standard content** with informational message.

**Rationale**:
- User experience not degraded (book fully readable without personalization)
- Clear feedback to user (optional feature, not critical path)
- Aligns with Constitution Principle III (modular independence)
- Personalization is a nice-to-have enhancement, not core functionality

**Alternatives Considered**:
- **Fail loudly**: Error modal blocks book access
  - ❌ Rejected: Unacceptable UX; prevents student learning
- **Retry indefinitely**: Automatic polling for auth availability
  - ❌ Rejected: Could hang UI, waste resources
- **Assume default profile**: Show personalization for assumed experience levels
  - ❌ Rejected: Wrong assumptions frustrate students more than no personalization

**Verification**: 003-auth already has error handling; PersonalizationProvider catches fetch errors and sets `personalizationAvailable: false` state.

---

## R6: Integration with 003-Auth User Profile

**Decision**: Fetch user background profile from 003-auth backend via `/api/profile/questionnaire` endpoint, using session cookie for authentication.

**Rationale**:
- User background data already collected and stored in 003-auth system
- No duplicate data storage needed (single source of truth)
- Session-based auth with HTTP-only cookies provides security
- Profile data structure already defined in 003-auth (python_experience, cpp_experience, ros2_experience, robot_hardware_experience, sensor_experience)

**Verification**: 003-auth spec defines `/api/profile/questionnaire` GET endpoint returning experience levels; PersonalizationProvider calls this on mount.

---

## R7: Accessibility Considerations

**Decision**: Implement accessible personalization UI following WCAG 2.1 AA standards:
- Keyboard navigable (button, tab focus)
- ARIA labels on button (indicates toggle state)
- Content variants must be semantic (don't hide content from screen readers)

**Rationale**:
- Students with disabilities must have equal access
- Personalization button should be discoverable
- Content variants should preserve semantic meaning (just different wording, not different DOM structure)

**Verification**: ContentVariant component uses conditional rendering (not display:none), preserves all text content in DOM, associates button state with ARIA attributes.

---

## R8: Mobile Responsiveness

**Decision**: Personalization button and adapted content must render correctly on mobile (phones, tablets) with no horizontal scroll.

**Rationale**:
- Students access learning materials on various devices
- Button must not obscure content on small screens
- Content variants must not introduce layout shift or overflow

**Verification**: PersonalizationButton uses responsive positioning (flexbox, media queries); ContentVariant doesn't change layout structure, only text content.

---

## Conclusion

All research items are resolved. Technical approach is clear, low-risk, and aligns with existing infrastructure (003-auth, Docusaurus, React). Proceed to Phase 1 design.
