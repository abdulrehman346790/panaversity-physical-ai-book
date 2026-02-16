# Data Model: Content Personalization

**Date**: 2026-02-16 | **Feature**: 004-personalization

## Summary

Content personalization uses two primary data structures: (1) **PersonalizedContentVariant** — metadata for chapter content variants authored by writers, and (2) **PersonalizationPreference** — user's current toggle state persisted in browser.

---

## Entity: PersonalizedContentVariant

Metadata describing a variant of chapter content (explanation, code example, or exercise).

### Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content_id` | String (UUID) | Yes | Unique identifier for this variant (derived from chapter + section hash) |
| `variant_type` | Enum: `explanation` \| `code_example` \| `exercise` | Yes | What type of content this variant adapts |
| `language` | Enum: `python` \| `cpp` \| `ros2` \| `none` | No | Programming language (for code examples); null if not applicable |
| `experience_level` | Enum: `beginner` \| `intermediate` \| `advanced` \| `none` | No | Experience level (for explanations); null if not applicable |
| `hardware_focus` | Enum: `none` \| `sensor` \| `robot` \| `mixed` | No | Hardware focus (for exercises); null if not applicable |
| `content_text` | String | Yes | The actual variant text (markdown/HTML) |
| `chapter_slug` | String | Yes | Which chapter this variant belongs to (e.g., `01-introduction-to-ros2`) |
| `section_key` | String | Yes | Unique key within chapter (e.g., `middleware-concept`) |
| `created_at` | ISO 8601 timestamp | Yes | When this variant was authored |
| `author` | String | No | Content writer who created this variant |

### Validation Rules

- **Exactly one of** `language`, `experience_level`, `hardware_focus` must be non-null:
  - Code examples: `language` must be set, others null
  - Explanations: `experience_level` must be set, others null
  - Exercises: `hardware_focus` must be set, others null
- `content_id` must be stable (same chapter + section = same ID across updates)
- `content_text` must not be empty (min 10 characters)
- `chapter_slug` must match deployed chapter filename (lowercase, hyphens)

### Relationships

- **Belongs to**: Chapter (1:N) — one chapter has many variants across sections
- **Displayed by**: ContentVariant React component — queries variants by chapter_slug + section_key + user profile

### State Transitions

None — variants are immutable once authored. Updates create new variant entries with updated `created_at`.

### Example

```json
{
  "content_id": "ch01-middleware-concept-exp-beginner",
  "variant_type": "explanation",
  "language": null,
  "experience_level": "beginner",
  "hardware_focus": null,
  "content_text": "ROS 2 (Robot Operating System 2) is a middleware that helps robots communicate. Think of it as a translator between different parts of your robot...",
  "chapter_slug": "01-introduction-to-ros2",
  "section_key": "middleware-concept",
  "created_at": "2026-02-15T10:00:00Z",
  "author": "ar525"
}
```

---

## Entity: PersonalizationPreference

User's current personalization toggle state, persisted in browser localStorage.

### Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | String (from session) | Yes | Authenticated user ID (from 003-auth session) |
| `chapter_slug` | String | Yes | Which chapter this preference applies to |
| `personalization_enabled` | Boolean | Yes | Whether personalization is currently on (true) or off (false) |
| `last_toggled_at` | ISO 8601 timestamp | Yes | When user last toggled personalization |
| `last_toggled_value` | Boolean | Yes | Value before last toggle (for potential undo) |

### Storage Location

**Browser localStorage** key: `personalization_pref_${user_id}_${chapter_slug}`

Value (JSON):
```json
{
  "user_id": "user_abc123",
  "chapter_slug": "01-introduction-to-ros2",
  "personalization_enabled": true,
  "last_toggled_at": "2026-02-16T14:30:00Z",
  "last_toggled_value": false
}
```

### Validation Rules

- `user_id` must be non-empty (from authenticated session)
- `chapter_slug` must match a deployed chapter
- `personalization_enabled` is always a boolean
- `last_toggled_at` must be valid ISO 8601 timestamp
- No expiry: persists until user clears browser storage

### State Transitions

```
Initial: No preference recorded (personalization defaults to ON for signed-in users)
         ↓
User Toggles: Update personalization_enabled and last_toggled_at
         ↓
User Navigates: Preference persists (localStorage read on every chapter load)
         ↓
User Clears Storage: Preference deleted (defaults reset to ON)
```

### Fallback Behavior

- **Missing preference**: Default to `personalization_enabled: true` (if user is authenticated and profile available)
- **Missing profile**: Default to `personalization_enabled: false` (no variants to show)
- **Malformed localStorage entry**: Delete and reinitialize

---

## Related Entities (from 003-auth)

### User (from 003-auth, for reference)

The personalization system reads these fields from 003-auth User entity:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | User ID (FK to PersonalizationPreference) |
| `python_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | Select Python code examples |
| `cpp_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | Select C++ code examples |
| `ros2_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | Select ROS 2 explanations |
| `robot_hardware_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | Select robot-focused exercises |
| `sensor_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | Select sensor-focused exercises |

---

## Data Access Patterns

### Pattern 1: Fetch Personalization Preference (on chapter load)

```javascript
const pref = localStorage.getItem(`personalization_pref_${userId}_${chapterSlug}`);
// Parse or initialize to default
```

**Latency**: < 1ms (synchronous)

### Pattern 2: Fetch User Background Profile (on session start)

```javascript
const response = await fetch(`/api/profile/questionnaire`, {
  credentials: 'include',  // Send session cookie
});
const profile = await response.json();
// { python_experience, cpp_experience, ros2_experience, robot_hardware_experience, sensor_experience }
```

**Latency**: 100–500ms (network-dependent)
**Cache**: PersonalizationProvider stores in React state; refetch on explicit user action

### Pattern 3: Query Chapter Variants (on render)

```javascript
// Pseudo-code for ContentVariant component
const variants = mdxChapter.variants.filter(v =>
  v.chapter_slug === currentChapter &&
  (
    (v.variant_type === 'explanation' && v.experience_level === userProfile.ros2_experience) ||
    (v.variant_type === 'code_example' && v.language === userProfile[selectedLanguage]) ||
    (v.variant_type === 'exercise' && v.hardware_focus === userProfile.hardwareFocus)
  )
);
```

**Latency**: < 10ms (in-memory filter)

---

## Consistency & Invariants

| Invariant | Rule | Enforcement |
|-----------|------|-------------|
| Content authored once | PersonalizedContentVariant is immutable | Read-only during rendering; updates create new entries |
| Single preference per user+chapter | Only one PersonalizationPreference per (user_id, chapter_slug) pair | localStorage key structure enforces uniqueness |
| Profile mirrors auth system | User background never duplicated in personalization system | Read-only from 003-auth; no local storage |
| Toggle state always matches localStorage | UI must reflect current localStorage value | PersonalizationProvider syncs state on every render |
| Missing variants degrade gracefully | If variant doesn't exist for user's profile, show standard version | Fallback logic in ContentVariant component |

---

## Future Extensions

- **Variant versions**: Track content_version to support A/B testing different variants
- **User feedback**: Track which variants users prefer (not in scope for MVP)
- **Analytics**: Log personalization toggle rates per chapter (separate feature)
- **Profile-aware defaults**: Adjust default experience levels based on prior performance (out of scope)

