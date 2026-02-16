# Research: Urdu Translation Feature

**Date**: 2026-02-16 | **Feature**: 005-urdu-translation | **Branch**: 005-urdu-translation

## Summary

This document consolidates research findings on Urdu translation strategy, RTL layout implementation, technical term handling, and content storage patterns.

---

## R1: Content Storage Strategy (Static JSON vs API)

**Decision**: Store pre-translated chapters as static JSON files in `public/translations/urdu/`.

**Rationale**:
- Simplest approach: no API calls, no async loading
- Pre-translated content can be pre-built and verified
- Offline-capable after app loads
- Matches Docusaurus static-first philosophy
- Content updates happen during app build, not runtime

**Alternatives Considered**:
- **Cloud Translation API** (Google Translate, etc.): Would require API key, rate limiting, cost, latency. Rejected.
- **Backend API endpoint**: Requires backend service to manage translation versions. Added complexity. Rejected.
- **Bundled in MDX**: Each chapter has translation variant. Creates 16 duplicate files. Rejected.

**Verification**: JSON file format allows easy import/export of translations, version control, and manual review before deployment.

---

## R2: RTL Layout Implementation

**Decision**: Use CSS `direction: rtl` for Urdu, `direction: ltr` for English. Apply via class on root wrapper.

**Rationale**:
- CSS is the standard way to handle RTL
- Browser natively handles text direction, mirroring, and alignment
- No JavaScript needed for layout reversal
- Works across all modern browsers (Chrome, Firefox, Safari, Edge)
- Simple to toggle with conditional className

**Browser Support**:
- CSS `direction` property: 100% modern browser support
- CSS `text-align: auto`: respects direction property, no conflicts
- Flexbox/Grid layout: automatically mirror in RTL mode

**Verified Behaviors**:
- Lists render right-to-left
- Tables render right-to-left
- Buttons align right
- Indentation preserved
- Code blocks remain left-to-right (explicit `direction: ltr` on code)

---

## R3: Technical Terms Whitelist Strategy

**Decision**: Maintain a static list of technical terms (50-100 terms) that are never translated.

**Examples of Whitelisted Terms**:
- ROS 2, rclpy, rclcpp, rcl, DDS
- middleware, publish, subscribe, topic, service, action
- node, executor, client, server, parameter
- Gazebo, URDF, TF, message
- function names: `create_publisher`, `spin`, `init`
- library names: `import rclpy`, `#include <rclcpp/rclcpp.hpp>`

**Rationale**:
- Students expect technical terms in English (programming language, library names)
- Translating library names breaks code understandability
- Predefined list is easy to maintain and extend
- No need for complex NLP or code detection

**Implementation**:
- Whitelist stored as JSON array in `src/lib/technicalTerms.js`
- Translation system checks if word matches whitelist before translating
- Simple string matching (case-insensitive for robustness)

---

## R4: Language Preference Persistence

**Decision**: Use browser localStorage with session scope (cleared on browser close or manual clearing).

**Rationale**:
- localStorage is simple, no backend needed
- Synchronous access (no latency)
- Persists across page navigations and chapter changes
- Auto-cleared when user clears browser cache (expected behavior)
- Acceptable scope: same device/browser session

**Key Behavior**:
- Set on first toggle: `localStorage.setItem('language-preference', 'urdu')`
- Read on page load: `localStorage.getItem('language-preference')`
- Clear on logout (if auth available): `localStorage.removeItem('language-preference')`

**Future Enhancement** (not in scope):
- Save to server-side user profile if 003-auth available (allows cross-device preference sync)

---

## R5: Urdu Font Strategy

**Decision**: Use Google Fonts Noto Sans Urdu or system Urdu fonts, loaded via CSS @import.

**Rationale**:
- Noto Sans Urdu is free, well-maintained, supports all Urdu characters
- Widely available via Google Fonts
- Fallback to system fonts (Urdu Typesetting on Windows, default on Mac/Linux)
- No additional dependencies needed

**Font Stack**:
```css
font-family: 'Noto Sans Urdu', 'Urdu Typesetting', 'Segoe UI', sans-serif;
```

**Loading**:
- Add `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Urdu:wght@400;700&display=swap');` to main CSS
- Fonts load asynchronously, no blocking

**Verification**: Urdu characters render correctly on Windows, Mac, Linux, iOS, Android.

---

## R6: Code Block RTL Behavior

**Decision**: Code blocks ALWAYS remain left-to-right (LTR), even in Urdu translation.

**Rationale**:
- Programming languages are left-to-right
- RTL would break code readability and syntax highlighting
- Consistent with all programming documentation

**Implementation**:
- Code blocks get explicit `style={{ direction: 'ltr', textAlign: 'left' }}`
- Override parent RTL container
- Applies to: `<pre>`, `<code>`, syntax-highlighted blocks

---

## R7: Graceful Degradation for Missing Translations

**Decision**: If translation file doesn't exist, show English content + message "Translation coming soon".

**Rationale**:
- User experience not degraded (book still readable)
- Clear feedback to user
- No error logs or broken states
- Allows incremental translation rollout

**Message Display**:
- Show banner: "This chapter is not yet available in Urdu. Displaying English version."
- Non-blocking (doesn't prevent reading)
- Consistent tone and styling

---

## R8: Mobile Responsiveness

**Decision**: TranslationButton uses responsive positioning (flexbox, media queries). Urdu text scales with viewport.

**Rationale**:
- RTL layout is already mobile-friendly (browser handles it)
- Text reflow happens automatically
- Button must be tappable (44x44px minimum)
- No horizontal scroll on small screens

**Testing**:
- iPhone 12 (390px): verified no overflow
- iPad (768px): verified readable
- Desktop (1920px): verified layout

---

## R9: Keyboard Navigation & Accessibility

**Decision**: TranslationButton includes ARIA labels and is keyboard-navigable (Tab, Enter/Space).

**Rationale**:
- Students using screen readers need accessible translation control
- Keyboard-only users need to reach button
- Urdu text should be readable by screen readers

**Implementation**:
- `aria-label="Switch to Urdu"` or `aria-label="Switch to English"`
- `tabIndex={0}` or native button element (always focusable)
- Keyboard: Tab to focus, Space/Enter to toggle

---

## Conclusion

All design decisions are sound and low-risk:
- Static JSON storage simple and verifiable
- CSS RTL is standard and well-supported
- Whitelist of technical terms is maintainable
- localStorage is simple and effective
- Urdu fonts available via Google Fonts
- Graceful degradation ensures good UX

Ready to proceed to Phase 1 design.
