# Developer Quickstart: Urdu Translation

**Date**: 2026-02-16 | **Feature**: 005-urdu-translation | **Difficulty**: Medium (React + CSS RTL)

---

## Overview

This feature adds a language toggle button to each chapter that switches content between English and Urdu with right-to-left (RTL) layout support. Translations are pre-stored as JSON files. Everything is client-side with localStorage persistence.

**Tech Stack**:
- Frontend: React 19, Docusaurus 3.9.x
- State Management: React Context API
- Storage: browser localStorage
- Layout: CSS RTL (direction property)
- Fonts: Noto Sans Urdu (Google Fonts)

**Time Estimate**: 2–3 hours for experienced React developer; 3–4 hours if learning RTL

---

## Prerequisites

1. **Docusaurus project running**: `npm run start` in `physical-ai-book/` works
2. **Node.js 18+** and npm installed
3. **16 Urdu translation JSON files ready** or plan to create placeholders
4. **Urdu font**: Google Fonts Noto Sans Urdu (auto-loaded via CSS @import)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  TranslationProvider (React Context)                        │
│  - Manages language preference (localStorage)               │
│  - Loads translation JSON files on demand                   │
│  - Provides useTranslation() hook                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ wraps app in Root.js
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Chapter Component (MDX)                                    │
│  - TranslationButton: Toggle English ↔ Urdu                │
│  - RTL wrapper: Applies direction: rtl for Urdu           │
│  - Content rendering: Urdu or English based on preference  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
physical-ai-book/
├── src/
│   ├── components/
│   │   ├── TranslationButton/
│   │   │   ├── index.js           (Toggle button component)
│   │   │   └── styles.module.css  (Button styling + RTL)
│   │   └── TranslationProvider/
│   │       └── index.js           (React context provider)
│   ├── hooks/
│   │   └── useTranslation.js      (Custom hook for accessing context)
│   ├── lib/
│   │   ├── translation.js         (Utility functions)
│   │   └── technicalTerms.js      (Whitelist of terms never translated)
│   └── theme/
│       └── Root.js                (Updated to include TranslationProvider)
├── public/
│   └── translations/
│       └── urdu/                  (NEW - Store Urdu JSON files)
│           ├── 01-introduction-to-ros2.json
│           ├── 02-rclpy-basics.json
│           └── ... (16 total)
└── package.json                   (No new dependencies needed)
```

---

## Implementation Phases

### Phase 1: Infrastructure (1–1.5 hours)

**Goal**: Set up React context, hooks, localStorage, and translation loading

**Tasks**:
1. Create `TranslationProvider` component
   - useEffect: Load language preference from localStorage on mount
   - useState: language, translation (current chapter), isLoading, error
   - loadTranslation(chapterId) function: fetch JSON and cache

2. Create `useTranslation()` hook
   - Return: { language, translation, toggleLanguage, isAvailable, isLoading, error }

3. Create utility functions in `translation.js`
   - `getLanguagePreference()`: Read from localStorage
   - `setLanguagePreference()`: Write to localStorage
   - `loadTranslation(chapterId)`: Fetch JSON file
   - `shouldTranslateTerm(word)`: Check whitelist

4. Create `technicalTerms.js` whitelist
   - Array of terms: ROS 2, rclpy, rclcpp, middleware, publish, subscribe, etc.
   - ~50-100 terms, case-insensitive matching

**Duration**: 1–1.5 hours

---

### Phase 2: UI Components (1 hour)

**Goal**: Build visible button and RTL layout support

**Tasks**:
1. Create `TranslationButton` component
   - Show text: "اردو میں" (Urdu) or "English"
   - Show icon: flag or language symbol
   - Click handler: call `toggleLanguage()`
   - Positioning: fixed top-right, responsive for mobile

2. Create `TranslationButton` styles
   - Button: blue background, white text, padding, border-radius
   - Fixed positioning: top 16px, right 16px, z-index: 50
   - Mobile: responsive font size, padding
   - RTL awareness: mirror padding in RTL mode

3. Create RTL layout utilities
   - CSS class `rtl-content`: direction: rtl, text-align: auto, Urdu font
   - Exception for code blocks: direction: ltr, text-align: left

**Duration**: ~1 hour

---

### Phase 3: Integration (0.5 hours)

**Goal**: Wire components into Docusaurus app

**Tasks**:
1. Update `Root.js` to wrap app with `TranslationProvider`
   - Place alongside AuthProvider, PersonalizationProvider, ChatWidget

2. Update chapter layout to include `TranslationButton`
   - Add to chapter header or docusaurus-theme component
   - Make sure it's visible above content

3. Update chapter rendering logic
   - If language === 'urdu' and translation exists: render Urdu content with RTL
   - Else: render English content

**Duration**: ~0.5 hours

---

### Phase 4: Content & Testing (1–1.5 hours)

**Goal**: Create Urdu translation files and verify functionality

**Tasks**:
1. Create Urdu translation JSON files
   - For each of 16 chapters: `{chapter_id}.json`
   - Structure: title, content (HTML), sections, status, metadata
   - Can be machine-generated initially, then reviewed

2. Manual E2E testing
   - [ ] Button appears on chapter page
   - [ ] Toggle English ↔ Urdu works
   - [ ] Content switches correctly
   - [ ] RTL layout applies (text right-aligned, lists RTL)
   - [ ] Code blocks remain LTR (unchanged)
   - [ ] Preference persists on page reload
   - [ ] Preference persists across chapters
   - [ ] Missing translation shows fallback message

3. Mobile testing
   - [ ] Button visible on mobile
   - [ ] Urdu text readable (no horizontal scroll)
   - [ ] Toggle works on tap

4. Accessibility testing
   - [ ] Button keyboard-navigable (Tab, Enter)
   - [ ] Screen reader reads button correctly
   - [ ] Urdu text readable by screen reader

**Duration**: 1–1.5 hours

---

## Code Snippets

### TranslationProvider

```jsx
// src/components/TranslationProvider/index.js
import React, { createContext, useState, useEffect } from 'react';

export const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('english');
  const [translation, setTranslation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load language preference on mount
  useEffect(() => {
    const pref = localStorage.getItem('translation-preference');
    if (pref) {
      const { language: savedLang } = JSON.parse(pref);
      setLanguage(savedLang || 'english');
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'english' ? 'urdu' : 'english';
    setLanguage(newLang);
    localStorage.setItem('translation-preference', JSON.stringify({
      language: newLang,
      last_set_at: new Date().toISOString()
    }));
  };

  const loadTranslation = async (chapterId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/translations/urdu/${chapterId}.json`);
      if (!response.ok) {
        setTranslation(null);
        return null;
      }
      const data = await response.json();
      setTranslation(data);
      return data;
    } catch (err) {
      console.warn('Failed to load translation:', err);
      setError('Translation unavailable');
      setTranslation(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      language,
      translation,
      toggleLanguage,
      loadTranslation,
      isLoading,
      error
    }}>
      {children}
    </TranslationContext.Provider>
  );
}
```

### useTranslation Hook

```javascript
// src/hooks/useTranslation.js
import { useContext } from 'react';
import { TranslationContext } from '@/components/TranslationProvider';

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
```

### TranslationButton

```jsx
// src/components/TranslationButton/index.js
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './styles.module.css';

export function TranslationButton() {
  const { language, toggleLanguage } = useTranslation();

  const buttonText = language === 'english' ? 'اردو میں' : 'English';
  const ariaLabel = language === 'english'
    ? 'Switch to Urdu'
    : 'Switch to English';

  return (
    <button
      className={styles.button}
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {buttonText}
    </button>
  );
}
```

### TranslationButton Styles

```css
/* src/components/TranslationButton/styles.module.css */
.button {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Noto Sans Urdu', sans-serif;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #0056b3;
}

.button:focus {
  outline: 2px solid #0056b3;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
```

### RTL Content Wrapper

```jsx
// In chapter component
import { useTranslation } from '@/hooks/useTranslation';

export function ChapterContent({ chapterId, englishContent }) {
  const { language, translation, loadTranslation, isLoading } = useTranslation();

  useEffect(() => {
    if (language === 'urdu') {
      loadTranslation(chapterId);
    }
  }, [language, chapterId]);

  if (language === 'urdu' && !translation && isLoading) {
    return <div>Loading translation...</div>;
  }

  if (language === 'urdu' && !translation) {
    return (
      <>
        <div className="alert">Translation coming soon</div>
        <div>{englishContent}</div>
      </>
    );
  }

  if (language === 'urdu' && translation) {
    return (
      <div style={{ direction: 'rtl', textAlign: 'auto' }} className="rtl-content">
        <h1>{translation.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: translation.content }} />
      </div>
    );
  }

  return <div>{englishContent}</div>;
}
```

---

## Integration Checklist

- [ ] TranslationProvider created and tested in isolation
- [ ] useTranslation hook created and tested
- [ ] TranslationButton component renders correctly
- [ ] RTL CSS utilities created
- [ ] Root.js wrapped with TranslationProvider
- [ ] TranslationButton added to chapter layout
- [ ] At least 2 chapters have Urdu translation JSON files
- [ ] Build passes: `npm run build` in `physical-ai-book/`
- [ ] Manual E2E testing complete
- [ ] Mobile responsive testing complete
- [ ] Accessibility testing complete

---

## Common Issues & Fixes

### Issue: "useTranslation must be used within TranslationProvider"

**Cause**: Component using hook is not wrapped by TranslationProvider

**Fix**: Ensure Root.js wraps all children with TranslationProvider

### Issue: RTL not applying

**Cause**: Missing `direction: rtl` CSS or container not using it

**Fix**: Check className, ensure CSS is loaded, verify direction property in styles

### Issue: Code blocks right-aligned in Urdu

**Cause**: RTL applies to code blocks

**Fix**: Add `direction: ltr` and `text-align: left` explicitly to `<pre>` and `<code>` tags

### Issue: Urdu font not loading

**Cause**: Google Fonts not reachable or font name misspelled

**Fix**: Verify @import in CSS, check network tab, use fallback font stack

---

## Performance Tips

1. **Lazy load translations**: Only fetch when user selects Urdu (not on page load)
2. **Cache translations**: Store in memory after first fetch
3. **localStorage is fast**: No latency for preference read/write
4. **RTL is CSS**: No JavaScript performance impact
5. **JSON files are small**: ~50-100 KB per translation

---

## Testing Recommendations

### Manual E2E Flow

1. Open app, navigate to chapter
2. Click TranslationButton ("اردو میں")
3. Verify content switches to Urdu with RTL layout
4. Verify code blocks remain English and left-aligned
5. Verify technical terms remain in English
6. Reload page → verify preference persists
7. Navigate to different chapter → verify language preference applies
8. Click button again ("English") → verify content reverts

### Edge Cases

1. **Missing translation**: Try a chapter without Urdu translation
   - Expected: Show English + "Translation coming soon" message
2. **Mobile**: Test on phone or mobile emulator
   - Expected: Button visible, Urdu text readable, no horizontal scroll
3. **Accessibility**: Use keyboard (Tab, Enter) and screen reader
   - Expected: Button reachable, button label read aloud, Urdu text read aloud

---

## Next Steps (Iterative Improvements)

- **Phase 2**: Add support for more languages (Spanish, French, etc.)
- **Phase 3**: Server-side language preference storage (if 003-auth available)
- **Phase 4**: Community translation contributions
- **Phase 5**: Analytics on language usage and satisfaction
