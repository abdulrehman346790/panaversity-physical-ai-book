# API Contracts: Content Personalization

**Date**: 2026-02-16 | **Feature**: 004-personalization

## Summary

The personalization feature is primarily client-side (React). It reads user background from 003-auth (`/api/profile/questionnaire`) and renders content variants based on user profile. No new backend API endpoints are required.

---

## Endpoint 1: Fetch User Background Profile

**Purpose**: PersonalizationProvider fetches authenticated user's background profile on session start.

### Request

```http
GET /api/profile/questionnaire
Host: auth-server:3001
Cookie: better-auth-session=<session_token>
```

**Authentication**: Session cookie (HTTP-only, from 003-auth)

**Headers**:
```
Host: auth-server:3001
Cookie: better-auth-session=<session_token>
```

### Response: 200 OK

```json
{
  "user_id": "user_abc123",
  "python_experience": "intermediate",
  "cpp_experience": "beginner",
  "ros2_experience": "advanced",
  "robot_hardware_experience": "intermediate",
  "sensor_experience": "beginner",
  "questionnaire_completed": true
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | String | Authenticated user ID |
| `python_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | User's Python background |
| `cpp_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | User's C++ background |
| `ros2_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | User's ROS 2 background |
| `robot_hardware_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | User's robot hardware background |
| `sensor_experience` | Enum: `none` \| `beginner` \| `intermediate` \| `advanced` | User's sensor/microcontroller background |
| `questionnaire_completed` | Boolean | Whether user completed the signup questionnaire |

### Response: 401 Unauthorized

```json
{
  "error": "Not authenticated"
}
```

**Trigger**: Session cookie missing or invalid

### Response: 500 Internal Server Error

```json
{
  "error": "Failed to fetch profile"
}
```

**Trigger**: Database connection error

---

## Usage Pattern: PersonalizationProvider

### On Mount

```javascript
// src/components/PersonalizationProvider/index.js
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/profile/questionnaire`, {
        credentials: 'include',  // Include session cookie
      });
      if (response.status === 401) {
        setPersonalizationAvailable(false);
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch profile');

      const profile = await response.json();
      setUserProfile(profile);
      setPersonalizationAvailable(true);
    } catch (error) {
      console.warn('Personalization unavailable:', error);
      setPersonalizationAvailable(false);
    }
  };

  fetchProfile();
}, []);
```

### Caching Strategy

- **Frequency**: Fetch once per session (on PersonalizationProvider mount)
- **Invalidation**: Manual via `refreshProfile()` function (called if user edits profile in 003-auth)
- **Fallback**: If fetch fails, use localStorage fallback or show standard content

---

## Local Storage API

**No backend API calls required.** Toggle state persists in browser localStorage.

### Interface

```javascript
// Read preference
const pref = localStorage.getItem(`personalization_pref_${userId}_${chapterSlug}`);

// Write preference
localStorage.setItem(
  `personalization_pref_${userId}_${chapterSlug}`,
  JSON.stringify({
    personalization_enabled: true,
    last_toggled_at: new Date().toISOString(),
    last_toggled_value: false
  })
);
```

---

## MDX Component API (Client-Side)

### ContentVariant Component

```jsx
import { ContentVariant } from '@/components/ContentVariant';

// Usage in MDX chapter
<ContentVariant type="explanation" level="beginner">
  ROS 2 is a middleware...
</ContentVariant>

<ContentVariant type="explanation" level="advanced">
  ROS 2 middleware enables...
</ContentVariant>

<ContentVariant type="code_example" language="python">
  import rclpy
  ...
</ContentVariant>

<ContentVariant type="code_example" language="cpp">
  #include <rclcpp/rclcpp.hpp>
  ...
</ContentVariant>

<ContentVariant type="exercise" hardware="robot">
  Simulate a robot arm...
</ContentVariant>
```

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `"explanation"` \| `"code_example"` \| `"exercise"` | Yes | Content type |
| `level` | `"beginner"` \| `"intermediate"` \| `"advanced"` | Conditional* | For explanations |
| `language` | `"python"` \| `"cpp"` \| `"ros2"` | Conditional* | For code examples |
| `hardware` | `"sensor"` \| `"robot"` \| `"mixed"` | Conditional* | For exercises |
| `children` | React.ReactNode | Yes | Variant content (markdown/JSX) |

*Conditional: Exactly one of `level`, `language`, `hardware` must be provided based on `type`.

**Behavior**:
- If personalization is ON and user profile matches, render this variant
- If personalization is OFF, don't render (show default/non-personalized version)
- If user profile doesn't match any variant, render default version

---

## usePersonalization Hook API

```javascript
import { usePersonalization } from '@/hooks/usePersonalization';

function MyComponent() {
  const {
    userProfile,           // { python_experience, cpp_experience, ... }
    personalizationEnabled, // boolean
    togglePersonalization, // () => void
    personalizationAvailable, // boolean
    refreshProfile,        // () => Promise<void>
  } = usePersonalization();

  return (
    <>
      <button onClick={togglePersonalization}>
        {personalizationEnabled ? 'Disable' : 'Enable'} Personalization
      </button>
      {!personalizationAvailable && <p>Personalization unavailable</p>}
    </>
  );
}
```

**Return Values**:

| Property | Type | Description |
|----------|------|-------------|
| `userProfile` | Object \| null | User background from 003-auth profile (null if unavailable) |
| `personalizationEnabled` | Boolean | Current toggle state |
| `togglePersonalization` | Function | Flip toggle and save to localStorage |
| `personalizationAvailable` | Boolean | Whether auth service is reachable |
| `refreshProfile` | Function | Async function to re-fetch user profile from server |

---

## Error Handling

### AuthError: User Not Authenticated

```
Trigger: User visits chapter without signing in
Response: 401 Unauthorized from /api/profile/questionnaire
Behavior: PersonalizationProvider sets personalizationAvailable=false, book shows standard (non-personalized) content
UI Message: Optional badge on button: "Sign in to personalize"
```

### NetworkError: Auth Server Unreachable

```
Trigger: auth-server not running or network issue
Response: Fetch fails (timeout or connection refused)
Behavior: Catch error, set personalizationAvailable=false, book shows standard content
UI Message: Optional badge: "Personalization unavailable"
```

### DataError: Malformed Profile

```
Trigger: /api/profile/questionnaire returns invalid JSON or missing fields
Response: JSON.parse fails or field validation fails
Behavior: Catch error, set personalizationAvailable=false
Fallback: Use default experience levels (none/beginner) for missing fields
```

### LocalStorageError: Browser Storage Disabled

```
Trigger: User has localStorage disabled (private browsing, privacy settings)
Response: localStorage.setItem throws
Behavior: Catch error, personalization toggle not persisted (resets on page reload)
UI Message: Optional warning: "Toggle state not saved" (if we want to be explicit)
Fallback: In-memory state only (persists within page session)
```

---

## Rate Limiting & Performance

### Expected Latencies

| Operation | Expected | Target |
|-----------|----------|--------|
| Fetch user profile (network) | 100–500ms | <500ms |
| Toggle personalization (localStorage) | <1ms | <10ms |
| Render content variant (in-memory filter) | <10ms | <50ms |
| Full personalization update on chapter load | 100–500ms total | <1s |

### Caching Strategy

- **User profile**: Cached in React state for entire session (refetch only on explicit user action)
- **Toggle preference**: Cached in localStorage (read on every chapter load)
- **Content variants**: Embedded in MDX (no network call; static)

---

## Future API Extensions (Out of Scope)

- Analytics endpoint: `POST /api/personalization/analytics` to log toggle events
- Preferences endpoint: `POST /api/personalization/preferences` to persist toggle server-side
- Admin endpoint: `GET /api/admin/personalization/usage` to analyze personalization adoption
- Variant management API: Admin endpoint to create/update variants programmatically

