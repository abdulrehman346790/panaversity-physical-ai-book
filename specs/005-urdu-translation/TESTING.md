# E2E Testing Guide: Urdu Translation Feature

**Date**: 2026-02-16 | **Feature**: 005-urdu-translation
**Status**: Manual E2E Testing (TDD not required per hackathon scope)

---

## Test Environment Setup

### Prerequisites
- Node.js 18+ installed
- Docusaurus project running locally: `npm run start` in `physical-ai-book/`
- All translation JSON files in `public/translations/urdu/` directory
- TranslationButton and TranslationProvider components integrated in Root.js

### Test Coverage

- ✅ Browser: Chrome/Edge, Firefox, Safari (desktop)
- ✅ Mobile: iOS Safari (iPhone 12/14), Android Chrome
- ✅ Accessibility: Keyboard navigation, Screen reader (NVDA/JAWS)
- ⚠️ Automated tests: Not required (hackathon scope)

---

## Phase 1: US1 - Translate Chapter to Urdu

### Test Case 1.1: Button Appears on Page Load
**Goal**: Verify translation button is visible on chapter page

**Steps**:
1. Open any chapter in the book
2. Look for translation button
3. Verify button is visible and readable
4. Verify button text says "اردو میں" (Urdu)

**Expected Result**: ✅ Button visible, positioned top-right, no layout shift

**Actual Result**: _______________

---

### Test Case 1.2: Click Button Switches to Urdu
**Goal**: Verify content switches to Urdu on button click

**Steps**:
1. Scroll to page content (skip navigation)
2. Click "اردو میں" button
3. Observe page content
4. Wait up to 500ms for content to load

**Expected Result**: ✅ Content changes to Urdu, button text changes to "English"

**Actual Result**: _______________

---

### Test Case 1.3: RTL Layout Applied
**Goal**: Verify right-to-left layout when displaying Urdu

**Steps**:
1. Ensure chapter is in Urdu (from Test 1.2)
2. Inspect text direction:
   - Paragraph text should start from right
   - Lists should be right-aligned
   - Headings should be right-aligned
3. Check font: Should be Noto Sans Urdu or fallback

**Expected Result**: ✅ All text right-to-left, lists right-aligned, proper font

**Actual Result**: _______________

---

### Test Case 1.4: Code Blocks Remain English
**Goal**: Verify code remains in English and LTR even in Urdu

**Steps**:
1. Ensure chapter is in Urdu
2. Locate any code blocks in the content
3. Verify code is in English
4. Verify code text flows left-to-right
5. Try to copy code from page

**Expected Result**: ✅ Code unchanged, executable, LTR alignment, copyable

**Actual Result**: _______________

---

### Test Case 1.5: Technical Terms Remain English
**Goal**: Verify library names, function names stay in English

**Steps**:
1. Ensure chapter is in Urdu
2. Look for mentions of: ROS 2, rclpy, publish, subscribe, node, etc.
3. Verify these terms appear in English

**Expected Result**: ✅ All technical terms in English (ROS 2, rclpy, etc.)

**Actual Result**: _______________

---

## Phase 2: US2 - Toggle Between Languages

### Test Case 2.1: Toggle Back to English
**Goal**: Verify clicking button again reverts to English

**Steps**:
1. Start with chapter in Urdu (from Test 1.2)
2. Click "English" button
3. Observe content change
4. Verify button text reverts to "اردو میں"

**Expected Result**: ✅ Content reverts to English, button text changes

**Actual Result**: _______________

---

### Test Case 2.2: Multiple Toggles
**Goal**: Verify toggling multiple times works correctly

**Steps**:
1. Click button: English → Urdu
2. Click button: Urdu → English
3. Click button: English → Urdu
4. Click button: Urdu → English
5. Verify content correct at each step

**Expected Result**: ✅ Toggles work 4 times without errors

**Actual Result**: _______________

---

### Test Case 2.3: Preference Persists Across Page Reload
**Goal**: Verify language preference saved in localStorage

**Steps**:
1. Switch chapter to Urdu
2. Press F5 to reload page
3. Observe which language is displayed
4. Check localStorage in DevTools: `localStorage.getItem('translation-preference')`

**Expected Result**: ✅ Page reloads in Urdu, localStorage contains preference

**Actual Result**: _______________

---

### Test Case 2.4: Preference Persists Across Chapters
**Goal**: Verify language preference applies to all chapters

**Steps**:
1. Switch to Urdu on Chapter 1
2. Click to Chapter 2 (using sidebar)
3. Verify Chapter 2 is also in Urdu
4. Switch to English on Chapter 2
5. Go back to Chapter 1
6. Verify Chapter 1 is now in English

**Expected Result**: ✅ Preference applies globally across chapters

**Actual Result**: _______________

---

## Phase 3: US3 - Display Translated Content with Formatting

### Test Case 3.1: Headings Preserved
**Goal**: Verify heading hierarchy maintained in Urdu

**Steps**:
1. Switch to Urdu
2. Check h2, h3, h4 headings
3. Verify text size hierarchy correct (h2 > h3 > h4)
4. Verify all headings are right-aligned

**Expected Result**: ✅ All headings visible, correct sizes, right-aligned

**Actual Result**: _______________

---

### Test Case 3.2: Lists Preserved
**Goal**: Verify bullet lists and numbered lists work in RTL

**Steps**:
1. Switch to Urdu
2. Find bullet list
3. Verify bullets appear on right side
4. Find numbered list
5. Verify numbers appear on right side and increment correctly

**Expected Result**: ✅ Lists display correctly in RTL, bullets/numbers on right

**Actual Result**: _______________

---

### Test Case 3.3: Bold and Italic Preserved
**Goal**: Verify text emphasis maintained

**Steps**:
1. Switch to Urdu
2. Locate **bold** text (should be darker/heavier)
3. Locate *italic* text (should be slanted)
4. Verify emphasis visually

**Expected Result**: ✅ Bold darker, italic slanted, emphasis visible

**Actual Result**: _______________

---

### Test Case 3.4: Links Clickable
**Goal**: Verify hyperlinks functional in Urdu

**Steps**:
1. Switch to Urdu
2. Find a hyperlink in the content
3. Click the link
4. Verify it navigates correctly
5. Go back to chapter

**Expected Result**: ✅ Links clickable, navigation works

**Actual Result**: _______________

---

## Phase 4: US4 - Maintain Code Quality

### Test Case 4.1: Code Block Syntax Unchanged
**Goal**: Verify code syntax remains executable

**Steps**:
1. Switch to Urdu
2. Find Python or C++ code block
3. Compare to English version (open in separate tab)
4. Verify code is character-for-character identical
5. Try to copy code from Urdu version

**Expected Result**: ✅ Code identical, executable, copyable

**Actual Result**: _______________

---

### Test Case 4.2: Function Names Unchanged
**Goal**: Verify function names remain English

**Steps**:
1. Switch to Urdu
2. Find function calls like `create_node()`, `rclpy.init()`, etc.
3. Verify function names are in English
4. Verify they match the English version exactly

**Expected Result**: ✅ Function names unchanged, English, executable

**Actual Result**: _______________

---

### Test Case 4.3: Library Imports Unchanged
**Goal**: Verify import statements intact

**Steps**:
1. Switch to Urdu
2. Find import statements: `import rclpy`, `#include <rclcpp/rclcpp.hpp>`, etc.
3. Verify imports unchanged from English version

**Expected Result**: ✅ Imports unchanged, compilable

**Actual Result**: _______________

---

## Phase 5: US5 - Mobile & Accessibility

### Test Case 5.1: Button Visible on Mobile
**Goal**: Verify button accessible on small screens

**Steps**:
1. Open browser DevTools (F12)
2. Enable device emulation (iPhone 12 or smaller)
3. Open any chapter
4. Look for translation button
5. Verify button is visible and tappable (>44x44px)

**Expected Result**: ✅ Button visible, tappable, no cutoff

**Actual Result**: _______________

---

### Test Case 5.2: Urdu Content Readable on Mobile
**Goal**: Verify Urdu text readable without scrolling

**Steps**:
1. Mobile emulation: iPhone 12 (390px width)
2. Switch to Urdu
3. Scroll through chapter content
4. Verify text readable
5. Verify no horizontal scroll needed

**Expected Result**: ✅ Text readable, no horizontal scroll, wraps correctly

**Actual Result**: _______________

---

### Test Case 5.3: Keyboard Navigation Works
**Goal**: Verify button accessible via Tab key

**Steps**:
1. Desktop mode
2. Open any chapter
3. Press Tab repeatedly until translation button focused
4. Verify button has focus outline
5. Press Enter to toggle language
6. Verify toggle works

**Expected Result**: ✅ Button reachable via Tab, focusable, Enter toggles

**Actual Result**: _______________

---

### Test Case 5.4: Screen Reader Announcement
**Goal**: Verify button announced correctly by screen reader

**Steps**:
1. Enable screen reader (NVDA on Windows, Voiceover on Mac)
2. Tab to translation button
3. Listen for announcement
4. Verify it says "Switch to Urdu" or "Switch to English"
5. Activate button
6. Listen for content change indication

**Expected Result**: ✅ Button announced, toggle announced, content change clear

**Actual Result**: _______________

---

## Phase 6: Edge Cases & Error Handling

### Test Case 6.1: Missing Translation Handling
**Goal**: Verify graceful fallback when translation not available

**Steps**:
1. If a chapter has no translation JSON:
   - Try switching to Urdu
   - Should show English + "Translation coming soon" message
2. If using DevTools, set Network tab to "Offline"
   - Try switching to Urdu
   - Should fail gracefully

**Expected Result**: ✅ Shows fallback message, no errors, English displayed

**Actual Result**: _______________

---

### Test Case 6.2: Font Fallback
**Goal**: Verify font loads and falls back gracefully

**Steps**:
1. Open DevTools → Network tab
2. Filter by font files
3. Open chapter
4. Switch to Urdu
5. Observe font loads
6. Verify text readable even if font fails

**Expected Result**: ✅ Font loads, fallback font readable if primary fails

**Actual Result**: _______________

---

### Test Case 6.3: Long Chapter Performance
**Goal**: Verify performance on large chapters

**Steps**:
1. Open Chapter 1 (largest chapter with real content)
2. Switch to Urdu
3. Measure time to display (should be <500ms)
4. Scroll through content
5. Verify smooth scrolling, no lag

**Expected Result**: ✅ Switch <500ms, scrolling smooth, no lag

**Actual Result**: _______________

---

## Test Summary

| Phase | Test Cases | Passed | Failed | Notes |
|-------|-----------|--------|--------|-------|
| US1 (Translate) | 5 | ___ | ___ | |
| US2 (Toggle) | 4 | ___ | ___ | |
| US3 (Formatting) | 4 | ___ | ___ | |
| US4 (Code Quality) | 3 | ___ | ___ | |
| US5 (Mobile/A11y) | 4 | ___ | ___ | |
| Edge Cases | 3 | ___ | ___ | |
| **TOTAL** | **23** | ___ | ___ | |

---

## Build & Deployment Verification

### Build Test
```bash
npm run build
# Expected: Build passes with no errors or warnings
```

**Result**: _______________

### Deployment Check
```bash
npm run serve
# Open http://localhost:3000 in browser
# Run Test Case 1.1 - 5.4
```

**Result**: _______________

---

## Sign-Off

- **Tester**: _______________
- **Date**: _______________
- **Status**: ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL

---

## Issues & Recommendations

### Critical Issues (Block Release)
1. _______________
2. _______________

### Minor Issues (Can Follow-Up)
1. _______________
2. _______________

### Recommendations
1. _______________
2. _______________
