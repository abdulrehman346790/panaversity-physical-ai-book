# Data Model: Urdu Translation

**Date**: 2026-02-16 | **Feature**: 005-urdu-translation

## Summary

Urdu translation system uses two primary data structures: (1) **TranslationFile** — pre-translated chapter content with technical terms preserved, and (2) **LanguagePreference** — user's current language selection persisted in localStorage.

---

## Entity: TranslationFile

Pre-translated Urdu content for a chapter, stored as JSON file.

### Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chapter_id` | String (slug) | Yes | Chapter identifier (e.g., `01-introduction-to-ros2`) |
| `language` | Enum: `urdu` | Yes | Always "urdu" for this entity |
| `title` | String | Yes | Translated chapter title in Urdu |
| `content` | String (HTML) | Yes | Full chapter content translated to Urdu (formatted HTML preserving structure) |
| `sections` | Array of Section | No | Optional: chapter broken into sections for granular updates |
| `translation_status` | Enum: `complete` \| `pending` \| `unavailable` | Yes | Status of translation (complete = ready, pending = in progress, unavailable = will not translate) |
| `last_updated` | ISO 8601 timestamp | Yes | When this translation was last updated |
| `translator` | String | No | Name or team that created translation |
| `whitelist_applied` | Boolean | Yes | Whether technical terms whitelist was applied to this translation |

### Validation Rules

- `chapter_id` must match an existing chapter in the book
- `content` must not be empty (min 100 characters)
- `language` is always "urdu" (not configurable)
- `translation_status` must be one of: complete, pending, unavailable
- `last_updated` must be valid ISO 8601 timestamp
- `sections` (if present) must have matching structure to original chapter

### Example Structure (JSON)

```json
{
  "chapter_id": "01-introduction-to-ros2",
  "language": "urdu",
  "title": "ROS 2 میں تعارف",
  "content": "<h2>یہ کیا ہے؟</h2><p>ROS 2 ایک middleware ہے...</p>",
  "sections": [
    {
      "heading": "بنیادی تصورات",
      "content": "<p>ROS 2 کے اہم تصورات...</p>"
    }
  ],
  "translation_status": "complete",
  "last_updated": "2026-02-16T10:00:00Z",
  "translator": "Urdu Localization Team",
  "whitelist_applied": true
}
```

### Storage Location

**Directory**: `physical-ai-book/public/translations/urdu/`
**File naming**: `{chapter_id}.json` (e.g., `01-introduction-to-ros2.json`)
**Total files**: 16 (one per chapter)

---

## Entity: LanguagePreference

User's current language preference, persisted in browser localStorage.

### Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | String | No | User ID (if authenticated via 003-auth); null for anonymous users |
| `session_id` | String | No | Browser session identifier; null if not tracked |
| `chapter_id` | String | No | Optional: if different chapters have different preference; usually global |
| `preferred_language` | Enum: `english` \| `urdu` | Yes | Currently selected language |
| `last_set_at` | ISO 8601 timestamp | Yes | When preference was last changed |

### Storage Location

**Storage**: Browser localStorage (client-side only)
**Key format**: `translation-preference` (global) or `translation-preference-${chapterId}` (per-chapter)
**Value**: JSON string
**Scope**: Session (cleared when browser data cleared)

### Example Entry

```json
{
  "user_id": null,
  "session_id": "sess-abc123xyz",
  "chapter_id": null,
  "preferred_language": "urdu",
  "last_set_at": "2026-02-16T14:30:00Z"
}
```

### State Transitions

```
Initial State: No preference recorded
   ↓
First Toggle: User clicks button → preference set to "urdu"
   ↓
Page Reload: localStorage read → preference restored
   ↓
Navigate Chapter: Preference persists
   ↓
Clear Browser Data: localStorage cleared → reset to initial state
   ↓
Logout: localStorage remains (or cleared if feature integrated with auth)
```

---

## Entity: TechnicalTermsWhitelist

Predefined list of terms that should never be translated.

### Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `term` | String | Yes | English term to preserve (e.g., "ROS 2", "rclpy", "middleware") |
| `category` | Enum: `library` \| `function` \| `concept` \| `api` | Yes | Category for context |
| `context` | String | No | Optional explanation (e.g., "library name, do not translate") |
| `case_sensitive` | Boolean | Yes | Whether matching is case-sensitive (usually false) |

### Storage Location

**File**: `physical-ai-book/src/lib/technicalTerms.js`
**Format**: JavaScript array of objects
**Size**: ~50-100 terms

### Example

```javascript
export const TECHNICAL_WHITELIST = [
  { term: "ROS 2", category: "library", context: "main framework", case_sensitive: true },
  { term: "rclpy", category: "library", context: "Python client library", case_sensitive: true },
  { term: "middleware", category: "concept", context: "architecture pattern", case_sensitive: false },
  { term: "publish", category: "function", context: "messaging API", case_sensitive: false },
  { term: "subscribe", category: "function", context: "messaging API", case_sensitive: false },
  { term: "Gazebo", category: "library", context: "simulation tool", case_sensitive: true },
];
```

---

## Data Access Patterns

### Pattern 1: Load Translation File on Chapter Load

```javascript
// 1. Check localStorage for language preference
const lang = localStorage.getItem('translation-preference');

// 2. If Urdu, fetch translation JSON
if (lang === 'urdu') {
  const translation = await fetch(`/translations/urdu/${chapter_id}.json`).then(r => r.json());
  // 3. Render content from translation.content
}
```

**Latency**: <100ms (cached by browser)
**Cache**: Browser automatic HTTP cache

### Pattern 2: Toggle Language

```javascript
// 1. Get current preference
const current = localStorage.getItem('translation-preference');

// 2. Toggle
const newLang = current === 'urdu' ? 'english' : 'urdu';

// 3. Save to localStorage
localStorage.setItem('translation-preference', newLang);

// 4. Re-render with new language
// React state update triggers re-render
```

**Latency**: <1ms (synchronous localStorage)

### Pattern 3: Apply Whitelist During Translation

```javascript
// Before translating, check if term is in whitelist
function shouldTranslate(word) {
  return !TECHNICAL_WHITELIST.some(item =>
    item.case_sensitive
      ? word === item.term
      : word.toLowerCase() === item.term.toLowerCase()
  );
}
```

**Latency**: <5ms (array lookup)

---

## Consistency & Invariants

| Invariant | Rule | Enforcement |
|-----------|------|-------------|
| Translation immutability | TranslationFile is read-only at runtime | Files are static JSON, no runtime modification |
| Single preference per session | Only one LanguagePreference active per session | localStorage key structure enforces uniqueness |
| Technical terms preserved | Whitelist terms never translated | Code checks whitelist before rendering translation |
| Language consistency | All chapter content in same language | No mix of Urdu and English in same view |
| Graceful unavailability | Missing translation shows English + message | Fetch with fallback to English content |

---

## Future Extensions (Out of Scope for MVP)

- **Server-side preference storage**: Save language choice to user profile in 003-auth (cross-device sync)
- **Multiple languages**: Support Spanish, French, etc. (just add more TranslationFile entities)
- **Variant translations**: A/B test different translation approaches
- **Community translations**: Allow users to suggest/vote on translation improvements
- **Analytics**: Track which language students prefer
