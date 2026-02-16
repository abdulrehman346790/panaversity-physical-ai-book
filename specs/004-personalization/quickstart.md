# Developer Quickstart: Content Personalization

**Date**: 2026-02-16 | **Feature**: 004-personalization | **Difficulty**: Medium (intermediate React)

---

## Overview

This feature adds a **per-chapter "Personalize Content" button** that adapts explanations, code examples, and exercises based on a student's background profile (collected during 003-auth signup).

**Tech Stack**:
- Frontend: React 19, Docusaurus 3.9.x
- State Management: React Context API (PersonalizationProvider)
- Storage: Browser localStorage
- Auth Integration: better-auth (from 003-auth feature)

**Time Estimate**: 2–4 hours for experienced React developer; 4–6 hours if learning MDX components

---

## Prerequisites

1. **Feature 003-auth is complete**: User profiles stored in 003-auth with background fields (python_experience, cpp_experience, ros2_experience, robot_hardware_experience, sensor_experience)
2. **Docusaurus project running**: `npm run start` in `physical-ai-book/` works
3. **Auth server running**: `npm run dev` in `auth-server/` works (port 3001)
4. **Node.js 18+** and npm installed

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  PersonalizationProvider (React Context)                │
│  - Fetches user profile from 003-auth on mount          │
│  - Stores personalization toggle state in localStorage  │
│  - Provides usePersonalization() hook                   │
└──────────────┬──────────────────────────────────────────┘
               │ wraps app in Root.js
               ▼
┌─────────────────────────────────────────────────────────┐
│  Chapter Component (MDX)                                │
│  - PersonalizationButton: Toggle on/off                 │
│  - ContentVariant: Render appropriate variant           │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
physical-ai-book/
├── src/
│   ├── components/
│   │   ├── PersonalizationButton/
│   │   │   ├── index.js           (Toggle button component)
│   │   │   └── styles.module.css  (Button styling)
│   │   ├── PersonalizationProvider/
│   │   │   └── index.js           (React context provider)
│   │   └── ContentVariant/
│   │       └── index.js           (Render variant based on profile)
│   ├── hooks/
│   │   └── usePersonalization.js  (Custom hook for consuming context)
│   ├── lib/
│   │   └── personalization.js     (Utility functions)
│   └── theme/
│       └── Root.js                (Updated to include PersonalizationProvider)
└── docs/
    └── *.mdx                      (Chapters contain <ContentVariant> tags)
```

---

## Implementation Phases

### Phase 1: Infrastructure

**Goal**: Set up React context, hooks, and state management

**Tasks**:
1. Create `PersonalizationProvider` component
   - useEffect: fetch user profile from `/api/profile/questionnaire`
   - useState: personalizationEnabled, userProfile, personalizationAvailable
   - Error handling: graceful degradation when auth unavailable

2. Create `usePersonalization()` hook
   - Return: { userProfile, personalizationEnabled, togglePersonalization, personalizationAvailable, refreshProfile }

3. Create utility functions in `personalization.js`
   - `getExperienceLevel(field)`: Extract level for given field
   - `shouldRenderVariant(variantProfile, userProfile)`: Compare profiles

**Duration**: 1–1.5 hours

---

### Phase 2: UI Components

**Goal**: Build visible button and variant renderer

**Tasks**:
1. Create `PersonalizationButton` component
   - Show text: "Personalize Content" or "Restore Default"
   - Show icon: checkmark when enabled
   - Click handler: call `togglePersonalization()`
   - Positioning: fixed top-right of chapter (z-index 50)

2. Create `ContentVariant` wrapper component
   - Props: type (explanation|code_example|exercise), level|language|hardware, children
   - Render logic:
     - If personalization disabled → render nothing (show default)
     - If user profile matches → render children
     - Else → render nothing (show default)

3. Styling: Use CSS modules for component styles
   - PersonalizationButton: button styles, fixed positioning, hover states
   - ContentVariant: no visible styling (conditional rendering only)

**Duration**: 1–1.5 hours

---

### Phase 3: Integration

**Goal**: Wire components into Docusaurus app and chapters

**Tasks**:
1. Update `Root.js` to wrap app with `PersonalizationProvider`
   ```jsx
   <PersonalizationProvider>
     <ChatWidget/>
     <AuthButton/>
     {children}
   </PersonalizationProvider>
   ```

2. Update chapter layouts to include `PersonalizationButton`
   - Add to chapter header or docusaurus-theme component

3. Update chapter MDX files to use `ContentVariant` tags
   - Example:
     ```mdx
     ## Understanding ROS 2

     <ContentVariant type="explanation" level="beginner">
     ROS 2 is a middleware that helps robots communicate...
     </ContentVariant>

     <ContentVariant type="explanation" level="advanced">
     ROS 2 middleware enables asynchronous pub/sub communication...
     </ContentVariant>
     ```

**Duration**: 0.5–1 hour

---

### Phase 4: Testing & Polish

**Goal**: Manual E2E testing and refinement

**Tasks**:
1. Test as unauthenticated user
   - Button should not appear (or be disabled)
   - Personalization should be unavailable

2. Test as authenticated user (complete profile)
   - Button appears
   - Toggle works (state persists on page reload)
   - Variants render correctly for each profile

3. Test as authenticated user (incomplete profile)
   - Default to non-personalized content
   - No errors in console

4. Test on mobile
   - Button visible and clickable
   - No horizontal scroll
   - Content readable

5. Test error scenarios
   - Auth server unreachable → graceful degradation
   - localStorage disabled (private browsing) → in-memory state only
   - Malformed profile data → use defaults

**Duration**: 0.5–1 hour

---

## Code Snippets

### PersonalizationProvider Component

```jsx
// src/components/PersonalizationProvider/index.js
import React, { createContext, useState, useEffect } from 'react';

export const PersonalizationContext = createContext();

export function PersonalizationProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [personalizationAvailable, setPersonalizationAvailable] = useState(true);

  // Determine auth server URL
  const AUTH_SERVER_URL = typeof window !== 'undefined'
    ? window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://auth.your-domain.com'
    : '';

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${AUTH_SERVER_URL}/api/profile/questionnaire`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          setPersonalizationAvailable(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch profile');

        const profile = await response.json();
        setUserProfile(profile);
        setPersonalizationAvailable(true);

        // Load toggle preference from localStorage
        const userId = profile.user_id;
        const chapterSlug = getCurrentChapterSlug(); // TODO: implement
        const pref = localStorage.getItem(
          `personalization_pref_${userId}_${chapterSlug}`
        );

        if (pref) {
          const { personalization_enabled } = JSON.parse(pref);
          setPersonalizationEnabled(personalization_enabled);
        } else {
          setPersonalizationEnabled(true); // Default to on for authenticated users
        }
      } catch (error) {
        console.warn('Personalization unavailable:', error);
        setPersonalizationAvailable(false);
      }
    };

    fetchProfile();
  }, []);

  const togglePersonalization = () => {
    const newState = !personalizationEnabled;
    setPersonalizationEnabled(newState);

    // Persist to localStorage
    if (userProfile) {
      const chapterSlug = getCurrentChapterSlug(); // TODO: implement
      localStorage.setItem(
        `personalization_pref_${userProfile.user_id}_${chapterSlug}`,
        JSON.stringify({
          personalization_enabled: newState,
          last_toggled_at: new Date().toISOString(),
          last_toggled_value: !newState,
        })
      );
    }
  };

  const refreshProfile = async () => {
    // Re-fetch profile (called if user edits profile in auth system)
    // Same logic as above
  };

  return (
    <PersonalizationContext.Provider
      value={{
        userProfile,
        personalizationEnabled,
        personalizationAvailable,
        togglePersonalization,
        refreshProfile,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}
```

### usePersonalization Hook

```javascript
// src/hooks/usePersonalization.js
import { useContext } from 'react';
import { PersonalizationContext } from '@/components/PersonalizationProvider';

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
}
```

### ContentVariant Component

```jsx
// src/components/ContentVariant/index.js
import React from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';

export function ContentVariant({ type, level, language, hardware, children }) {
  const { userProfile, personalizationEnabled, personalizationAvailable } = usePersonalization();

  // If personalization is off or unavailable, don't render
  if (!personalizationEnabled || !personalizationAvailable || !userProfile) {
    return null;
  }

  // Check if this variant matches user's profile
  let matches = false;

  if (type === 'explanation' && level) {
    // Get experience level for the relevant field (inferred from context)
    // This is simplified; full implementation would infer field from content
    matches = userProfile.ros2_experience === level;
  } else if (type === 'code_example' && language) {
    const fieldName = {
      python: 'python_experience',
      cpp: 'cpp_experience',
      ros2: 'ros2_experience',
    }[language];
    matches = userProfile[fieldName] === getExperienceMapping(level);
  } else if (type === 'exercise' && hardware) {
    const fieldName = {
      robot: 'robot_hardware_experience',
      sensor: 'sensor_experience',
    }[hardware];
    matches = userProfile[fieldName] === getExperienceMapping(level);
  }

  return matches ? <>{children}</> : null;
}

function getExperienceMapping(level) {
  // Map hardware/exercise level to experience field value
  const mapping = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced',
    sensor: 'beginner', // sensor-focused exercises = beginner hardware experience
    robot: 'intermediate', // robot-focused exercises = intermediate+ hardware
  };
  return mapping[level];
}
```

### PersonalizationButton Component

```jsx
// src/components/PersonalizationButton/index.js
import React from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import styles from './styles.module.css';

export function PersonalizationButton() {
  const { personalizationEnabled, personalizationAvailable, togglePersonalization } = usePersonalization();

  if (!personalizationAvailable) {
    return null; // Don't show button if auth unavailable
  }

  return (
    <button
      className={styles.button}
      onClick={togglePersonalization}
      title={personalizationEnabled ? 'Click to restore default content' : 'Click to personalize content'}
    >
      {personalizationEnabled ? '✓ Personalized' : 'Personalize Content'}
    </button>
  );
}
```

### Button Styling

```css
/* src/components/PersonalizationButton/styles.module.css */
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

---

## Integration Checklist

- [ ] PersonalizationProvider created and tested in isolation
- [ ] usePersonalization hook created and tested
- [ ] ContentVariant component renders correctly
- [ ] PersonalizationButton integrated into chapter layout
- [ ] Root.js wrapped with PersonalizationProvider
- [ ] At least 2 chapters updated with ContentVariant tags
- [ ] localStorage persists toggle state across page reloads
- [ ] Auth unavailable → graceful degradation (no errors)
- [ ] Mobile testing: button visible, responsive
- [ ] Accessibility: button keyboard navigable, ARIA labels added
- [ ] Build passes: `npm run build` in physical-ai-book/

---

## Common Issues & Fixes

### Issue: "usePersonalization must be used within PersonalizationProvider"

**Cause**: Component using hook is not wrapped by PersonalizationProvider

**Fix**: Ensure Root.js wraps all children with PersonalizationProvider

### Issue: Profile fetched but toggle state not persisting

**Cause**: localStorage.setItem failed silently (private browsing)

**Fix**: Add try/catch around localStorage calls; fallback to in-memory state

### Issue: CORS error when fetching /api/profile/questionnaire

**Cause**: auth-server not configured for Docusaurus origin

**Fix**: Ensure auth-server CORS_ORIGINS includes http://localhost:3000 and GitHub Pages domain

### Issue: ContentVariant not showing expected content

**Cause**: User profile field doesn't match variant level

**Fix**: Verify user's background profile is correct in 003-auth ProfilePanel

---

## Performance Tips

1. **Cache profile fetch**: PersonalizationProvider stores in state; don't re-fetch on every chapter load
2. **Lazy load chapters**: Docusaurus lazy-loads MDX; personalization state loads immediately
3. **localStorage is synchronous**: Reading/writing toggle is <1ms; no performance concern
4. **ContentVariant filtering is O(n)**: For 100 variants per chapter, filter is <10ms

---

## Testing Recommendations

### Manual E2E Flow

1. Sign up new account with complete background profile
2. Open any chapter
3. Verify "Personalize Content" button appears
4. Toggle on → verify content changes
5. Reload page → verify toggle state persists
6. Toggle off → verify content reverts to default
7. Sign out → verify button disappears

### Edge Cases

1. **Incomplete profile**: Skip some questionnaire fields
   - Expected: Show defaults for missing fields, no errors
2. **Auth server down**: Kill auth-server process
   - Expected: Button doesn't appear, chapter loads normally with standard content
3. **Private browsing**: Open in incognito/private window
   - Expected: Button appears but toggle doesn't persist across reloads (okay)

---

## Next Steps (Iterative Improvements)

- **Phase 2**: Add analytics to track personalization usage
- **Phase 3**: Implement variant versioning for A/B testing
- **Phase 4**: Add admin UI to manage content variants
- **Phase 5**: Implement server-side profile caching (if user base grows)

