# API Contracts: Urdu Translation

**Date**: 2026-02-16 | **Feature**: 005-urdu-translation

## Summary

The Urdu translation feature is entirely client-side. It reads pre-translated JSON files from the public directory, manages language preference in localStorage, and renders content using React components. No backend API endpoints are required.

---

## Static Asset: TranslationFile (JSON)

### Request (Browser Loading)

```
GET /translations/urdu/{chapter_id}.json
```

**Example**:
```
GET /translations/urdu/01-introduction-to-ros2.json
```

### Response: 200 OK

```json
{
  "chapter_id": "01-introduction-to-ros2",
  "language": "urdu",
  "title": "ROS 2 میں تعارف",
  "content": "<h1>ROS 2 کیا ہے؟</h1><p>ROS 2 ایک middleware ہے جو روبوٹ کے مختلف حصوں کے درمیان رابطہ قائم کرتا ہے...</p>",
  "sections": [
    {
      "heading": "بنیادی تصورات",
      "content": "<p>ROS 2 کے کچھ اہم تصورات...</p>"
    }
  ],
  "translation_status": "complete",
  "last_updated": "2026-02-16T10:00:00Z",
  "translator": "Urdu Localization Team",
  "whitelist_applied": true
}
```

### Response: 404 Not Found

```json
{
  "error": "Translation not found"
}
```

**Trigger**: Translation file doesn't exist for this chapter (graceful fallback to English)

---

## React Component API: TranslationProvider

### Props

```typescript
interface TranslationProviderProps {
  children: React.ReactNode;
  initialLanguage?: 'english' | 'urdu';
  onLanguageChange?: (language: 'english' | 'urdu') => void;
}
```

### Context Value

```typescript
interface TranslationContextValue {
  // Current language selection
  language: 'english' | 'urdu';

  // Fetch translation for chapter
  getTranslation: (chapterId: string) => Promise<TranslationFile | null>;

  // Toggle language
  toggleLanguage: () => void;

  // Check if translation available
  isTranslationAvailable: (chapterId: string) => Promise<boolean>;

  // Get loading state
  isLoading: boolean;

  // Error state
  error: string | null;
}
```

### Usage

```jsx
<TranslationProvider initialLanguage="english">
  <App />
</TranslationProvider>

// Inside component:
const { language, toggleLanguage } = useTranslation();

if (language === 'urdu') {
  // Render Urdu content with RTL
} else {
  // Render English content
}
```

---

## React Hook API: useTranslation

### Return Value

```typescript
function useTranslation() {
  return {
    language: 'urdu' | 'english';
    translation: TranslationFile | null;
    toggleLanguage: () => void;
    isAvailable: boolean;
    isLoading: boolean;
    error: string | null;
  }
}
```

### Example

```jsx
import { useTranslation } from '@/hooks/useTranslation';

export function ChapterContent({ chapterId }) {
  const { language, translation, toggleLanguage, isLoading } = useTranslation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <button onClick={toggleLanguage}>
        {language === 'english' ? 'اردو میں' : 'English'}
      </button>

      {language === 'urdu' && translation ? (
        <div dir="rtl" className="urdu-content">
          <h1>{translation.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: translation.content }} />
        </div>
      ) : (
        <div className="english-content">
          {/* Original English content */}
        </div>
      )}
    </>
  );
}
```

---

## React Component API: TranslationButton

### Props

```typescript
interface TranslationButtonProps {
  className?: string;
  variant?: 'default' | 'minimal';
  position?: 'fixed' | 'inline';
  onToggle?: (newLanguage: 'english' | 'urdu') => void;
}
```

### Example

```jsx
import { TranslationButton } from '@/components/TranslationButton';

export function ChapterHeader() {
  return (
    <header>
      <h1>Chapter Title</h1>
      <TranslationButton position="fixed" variant="default" />
    </header>
  );
}
```

---

## Browser localStorage API

### Key Format

```
translation-preference
```

### Value Format

```json
{
  "language": "urdu",
  "last_set_at": "2026-02-16T14:30:00Z"
}
```

### Read

```javascript
const pref = localStorage.getItem('translation-preference');
const { language } = JSON.parse(pref || '{"language":"english"}');
```

### Write

```javascript
localStorage.setItem('translation-preference', JSON.stringify({
  language: 'urdu',
  last_set_at: new Date().toISOString()
}));
```

---

## JavaScript Utility API: Translation Functions

### Function: loadTranslation

```typescript
async function loadTranslation(chapterId: string): Promise<TranslationFile | null> {
  try {
    const response = await fetch(`/translations/urdu/${chapterId}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`Failed to load translation for ${chapterId}:`, error);
    return null;
  }
}
```

### Function: getLanguagePreference

```typescript
function getLanguagePreference(): 'english' | 'urdu' {
  const pref = localStorage.getItem('translation-preference');
  if (pref) {
    const { language } = JSON.parse(pref);
    return language || 'english';
  }
  return 'english';
}
```

### Function: setLanguagePreference

```typescript
function setLanguagePreference(language: 'english' | 'urdu'): void {
  localStorage.setItem('translation-preference', JSON.stringify({
    language,
    last_set_at: new Date().toISOString()
  }));
}
```

### Function: shouldTranslateTerm

```typescript
function shouldTranslateTerm(word: string): boolean {
  return !TECHNICAL_WHITELIST.some(item =>
    item.case_sensitive
      ? word === item.term
      : word.toLowerCase() === item.term.toLowerCase()
  );
}
```

---

## CSS API: RTL Layout Utilities

### Class: `rtl-content`

Applies RTL layout to content.

```css
.rtl-content {
  direction: rtl;
  text-align: auto;
  font-family: 'Noto Sans Urdu', 'Urdu Typesetting', sans-serif;
}

.rtl-content code,
.rtl-content pre {
  direction: ltr;
  text-align: left;
}

.rtl-content a,
.rtl-content button {
  margin-left: 8px;  /* becomes right margin in RTL */
}
```

### Usage

```jsx
{language === 'urdu' && translation && (
  <div className="rtl-content">
    <div dangerouslySetInnerHTML={{ __html: translation.content }} />
  </div>
)}
```

---

## Performance Characteristics

| Operation | Latency | Target | Notes |
|-----------|---------|--------|-------|
| Load translation JSON | <100ms | <200ms | Cached by browser |
| Toggle language | <1ms | <10ms | Synchronous localStorage |
| Render RTL layout | <50ms | <100ms | CSS layout recalc |
| Total language switch | <100ms | <500ms | As per spec |

---

## Error Handling

### Missing Translation

**Scenario**: User selects Urdu but translation file doesn't exist

**Behavior**: Show English content + banner message "Translation coming soon"

**Implementation**:
```javascript
const translation = await loadTranslation(chapterId);
if (!translation) {
  return <Banner message="This chapter is not yet available in Urdu." />;
}
```

### Font Unavailable

**Scenario**: Urdu font fails to load

**Behavior**: Fall back to system Urdu fonts

**CSS**:
```css
font-family: 'Noto Sans Urdu', 'Urdu Typesetting', system-ui, sans-serif;
```

### localStorage Disabled

**Scenario**: User has localStorage disabled (private browsing)

**Behavior**: Language preference not persisted (session only)

**Detection**:
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  storageAvailable = true;
} catch {
  storageAvailable = false;
}
```

---

## Future Extensions (Out of Scope)

- **Server-side API**: POST endpoint to save preference in 003-auth user profile
- **Translation update endpoint**: Admin API to push new translation versions
- **Language detection**: Detect browser language and auto-select Urdu if available
- **Multiple languages**: GET /translations/{language}/{chapterId}.json for other languages
