# Feature Specification: Urdu Translation

**Feature Branch**: `005-urdu-translation`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Per-chapter Urdu translation button that displays translated chapter content alongside original English text with RTL layout support, allowing students to learn in their native language while maintaining code blocks and technical terms in English"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Translate Chapter to Urdu (Priority: P1)

A student reading a Physical AI chapter sees a "Translate to Urdu" / "View in English" button at the top of the chapter. They click it and the chapter content switches to Urdu with right-to-left (RTL) layout, while code blocks, function names, and technical terms remain in English for clarity and consistency.

**Why this priority**: This is the core feature. Without translation functionality, the feature cannot exist. MVP entry point.

**Independent Test**: Can be fully tested by: (1) Open any chapter, (2) Verify translation button appears, (3) Click button, (4) Verify content switches to Urdu, (5) Verify layout is RTL, (6) Verify code blocks remain English.

**Acceptance Scenarios**:

1. **Given** a student on an English chapter, **When** the page loads, **Then** a "Translate to Urdu" button is visible.
2. **Given** the translation button is visible, **When** the student clicks it, **Then** the chapter content switches to Urdu immediately.
3. **Given** the chapter is displayed in Urdu, **When** text content is shown, **Then** the layout is right-to-left (RTL) with proper text alignment.
4. **Given** code blocks exist in the chapter, **When** the chapter is translated to Urdu, **Then** code blocks remain in English with their original syntax.
5. **Given** technical terms (ROS 2, middleware, publisher, etc.) appear in explanations, **When** translated to Urdu, **Then** these terms remain in English (not translated).
6. **Given** a student toggles translation, **When** they navigate to another chapter, **Then** the translation preference is remembered.

---

### User Story 2 - Toggle Between Languages (Priority: P1)

The translation button acts as a toggle. Clicking it again reverts to English. Students can seamlessly switch between Urdu and English views.

**Why this priority**: Essential for usability. Students need to easily switch if they prefer one language over another.

**Independent Test**: Can be tested by: (1) Translate chapter to Urdu, (2) Verify content changes, (3) Click button again, (4) Verify content reverts to English, (5) Repeat multiple times.

**Acceptance Scenarios**:

1. **Given** a chapter is in Urdu, **When** the student clicks the translation button, **Then** the content reverts to English and button text changes to "Translate to Urdu".
2. **Given** a chapter is in English, **When** the student clicks the translation button, **Then** the content switches to Urdu and button text changes to "View in English".
3. **Given** a student toggles language multiple times, **When** they navigate away and return, **Then** the last selected language is remembered.

---

### User Story 3 - Display Translated Content with Preserved Formatting (Priority: P1)

Translated paragraphs, lists, headings, and descriptions appear in proper Urdu with preserved formatting. Bullet points, numbered lists, code syntax highlighting, and emphasis (bold, italic) are maintained. Links remain functional.

**Why this priority**: Quality of translation matters. Broken formatting or lost content is worse than no translation. Core user experience.

**Independent Test**: Can be tested by: (1) Translate chapter, (2) Verify headings are translated, (3) Verify bullet lists preserve structure, (4) Verify bold/italic preserved, (5) Verify links clickable.

**Acceptance Scenarios**:

1. **Given** a chapter with headings and subheadings, **When** translated, **Then** all headings are translated while maintaining hierarchy.
2. **Given** a chapter with bullet lists, **When** translated, **Then** list structure is preserved (bullets, indentation, order).
3. **Given** a chapter with bold or italic text, **When** translated, **Then** the same emphasis is applied to translated text.
4. **Given** a chapter with hyperlinks, **When** translated, **Then** links remain functional and clickable.
5. **Given** a chapter with numbered steps or examples, **When** translated, **Then** numbering is preserved and correct.

---

### User Story 4 - Maintain Code Quality and Technical Accuracy (Priority: P1)

Code blocks display unchanged in English. Function names, variable names, class names, library names (rclpy, rclcpp, etc.), and technical parameters remain in English. Translations do not modify any code syntax or structure.

**Why this priority**: Code must remain functional and correct. Translating code would break its use. Non-negotiable.

**Independent Test**: Can be tested by: (1) View translated chapter with code, (2) Verify code blocks unchanged, (3) Copy code from translated view, (4) Verify it executes without modification needed.

**Acceptance Scenarios**:

1. **Given** a Python code block exists, **When** chapter is translated, **Then** Python code is unchanged and executable.
2. **Given** variable or function names appear in text, **When** translated, **Then** these names remain in English.
3. **Given** imports or library names (e.g., `import rclpy`) appear, **When** translated, **Then** library names remain unchanged.
4. **Given** a code example with comments, **When** translated, **Then** code remains executable; comments remain in English.

---

### User Story 5 - Support Mobile and Accessibility (Priority: P2)

Translation button is accessible on mobile devices. Urdu text is readable on small screens. Keyboard navigation and screen readers support the translation feature.

**Why this priority**: Important for inclusive access, but not blocking MVP if initially desktop-focused. Secondary priority.

**Independent Test**: Can be tested by: (1) Open app on mobile, (2) Verify button visible, (3) Translate chapter, (4) Verify Urdu text readable, (5) Test with screen reader.

**Acceptance Scenarios**:

1. **Given** a student using mobile device, **When** they open a chapter, **Then** the translation button is visible and tappable.
2. **Given** Urdu content on mobile, **When** displayed, **Then** text is readable without horizontal scrolling.
3. **Given** a keyboard user, **When** Tab/Enter navigation is used, **Then** translation button is accessible.
4. **Given** a screen reader user, **When** they navigate the translated chapter, **Then** Urdu text is read aloud correctly.

---

### Edge Cases

- What happens when a chapter has no Urdu translation available? System should show an error message or default to English ("Translation not yet available").
- What happens when Urdu font support is unavailable on user's device? System should handle gracefully or provide fallback font guidance.
- What happens when a chapter has embedded images with text (e.g., diagrams)? Images remain unchanged; surrounding text is translated (text in images is out of scope).
- What happens when a student's preference is for Urdu but they navigate to a chapter with no translation? System should offer English or show "Translation coming soon".
- What happens on very long chapters? Urdu content should load smoothly without performance degradation.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Translate to Urdu" / "View in English" toggle button on every chapter page.
- **FR-002**: System MUST switch chapter content between English and Urdu immediately when button is clicked (within 500ms).
- **FR-003**: System MUST render Urdu text using right-to-left (RTL) layout (text direction, text alignment).
- **FR-004**: System MUST preserve code blocks in English without modification (no translation of code).
- **FR-005**: System MUST keep technical terms (ROS 2, function names, library names, parameters) in English while translating explanatory text.
- **FR-006**: System MUST remember the student's language preference (Urdu or English) and apply it across chapter navigations within the same session.
- **FR-007**: System MUST preserve formatting of translated content (headings, lists, bold, italic, links remain functional).
- **FR-008**: System MUST display a message if translation for a chapter is not available ("Translation not yet available").
- **FR-009**: System MUST provide translations for all 16 existing chapters (or indicate which ones are pending translation).
- **FR-010**: System MUST support keyboard navigation and screen reader access for translation feature.
- **FR-011**: System MUST handle Urdu font rendering correctly on all browsers and devices.
- **FR-012**: System MUST work reliably on mobile devices without performance issues.

### Key Entities

- **ChapterTranslation**: A translated version of a chapter in a specific language. Attributes: chapter_id, language (urdu/english), title, content (translated), translation_status (complete/pending/unavailable), last_updated.
- **LanguagePreference**: A student's current language preference. Attributes: user_id, session_id, chapter_id, preferred_language (urdu/english), last_set_timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can toggle between English and Urdu within 1 click.
- **SC-002**: Translation display happens within 500ms of clicking the button.
- **SC-003**: 100% of chapter content text is translated to Urdu (except code and technical terms).
- **SC-004**: RTL layout works correctly on 95%+ of tested devices (desktop, tablet, mobile).
- **SC-005**: Language preference persists across 95%+ of chapter navigations in a session.
- **SC-006**: Code blocks remain executable and unchanged after translation (0 code modifications).
- **SC-007**: Urdu text readability is equivalent to English text (font size, contrast, line spacing).
- **SC-008**: Students report translation quality satisfactory in survey (target: 75% satisfaction).

---

## Assumptions

- **Translation Content**: Chapter translations are pre-authored or machine-translated externally; this feature focuses on display and toggling, not generating translations.
- **Language Scope**: Feature supports two languages only: English and Urdu. Other languages are out of scope.
- **Technical Terms**: A predefined list of technical terms (ROS 2, middleware, rclpy, rclcpp, etc.) will NOT be translated. This list is maintained separately.
- **RTL Support**: Browser/CSS RTL support is sufficient; feature uses standard CSS `direction: rtl` and `text-align` properties.
- **Code Comments**: Code block comments remain in English (not translated in MVP).
- **Font Support**: Urdu fonts (Noto Sans Urdu, Urdu Typesetting, etc.) are assumed available on user devices or loaded via web fonts.
- **Performance**: Loading chapter translation is synchronous (no lazy loading); chapters are pre-translated and stored/cached.
- **Session Duration**: Language preference is session-based (not persisted across browser restart) unless user logged in and preference saved to backend.

---

## Dependencies

- **003-auth**: OPTIONAL - If available, can save language preference server-side per user. If not available, use localStorage.
- **001-docusaurus-book**: REQUIRED - Chapters must exist and have corresponding Urdu translations available.
- **External Service**: Translation content (if not pre-authored) must be sourced externally or pre-computed.

---

## Out of Scope

- Generating new translations automatically (use existing translations)
- Real-time translation API integration
- Supporting languages other than Urdu
- Translating code comments (v1 MVP)
- Translating embedded diagrams or images
- Audio/speech output in Urdu
- Urdu input for student responses or forms
- Translation of sidebar, navigation, UI labels (only chapter content)
- Analytics on translation usage
- A/B testing translation quality
