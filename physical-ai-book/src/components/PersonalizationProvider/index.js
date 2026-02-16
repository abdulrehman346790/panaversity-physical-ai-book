import React, { createContext, useState, useEffect } from 'react';

export const PersonalizationContext = createContext();

export function PersonalizationProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [personalizationAvailable, setPersonalizationAvailable] = useState(true);

  // Determine auth server URL (localhost in dev, production domain in prod)
  const getAuthServerUrl = () => {
    if (typeof window === 'undefined') return '';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // In production, auth server is on same domain
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  };

  const AUTH_SERVER_URL = getAuthServerUrl();

  // Fetch user profile on mount (T002, T003)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${AUTH_SERVER_URL}/api/profile/questionnaire`, {
          credentials: 'include', // Include session cookie for auth
        });

        // Handle 401 Unauthorized (not authenticated)
        if (response.status === 401) {
          setPersonalizationAvailable(false);
          setUserProfile(null);
          setPersonalizationEnabled(false);
          return;
        }

        // Handle other errors (T003 - error handling)
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const profile = await response.json();
        setUserProfile(profile);
        setPersonalizationAvailable(true);

        // Load toggle preference from localStorage (T008)
        const userId = profile.user_id;
        const chapterSlug = getCurrentChapterSlug();
        const prefKey = `personalization_pref_${userId}_${chapterSlug}`;
        const savedPref = localStorage.getItem(prefKey);

        if (savedPref) {
          try {
            const { personalization_enabled } = JSON.parse(savedPref);
            setPersonalizationEnabled(personalization_enabled);
          } catch (e) {
            console.warn('Failed to parse personalization preference:', e);
            setPersonalizationEnabled(true);
          }
        } else {
          // Default to on for authenticated users
          setPersonalizationEnabled(true);
        }
      } catch (error) {
        // T003: Graceful degradation when auth unavailable
        console.warn('Personalization unavailable:', error.message);
        setPersonalizationAvailable(false);
        setUserProfile(null);
        setPersonalizationEnabled(false);
      }
    };

    if (AUTH_SERVER_URL) {
      fetchProfile();
    }
  }, [AUTH_SERVER_URL]);

  // Toggle personalization and persist to localStorage (T006)
  const togglePersonalization = () => {
    const newState = !personalizationEnabled;
    setPersonalizationEnabled(newState);

    // Persist to localStorage
    if (userProfile) {
      const chapterSlug = getCurrentChapterSlug();
      const prefKey = `personalization_pref_${userProfile.user_id}_${chapterSlug}`;
      try {
        localStorage.setItem(
          prefKey,
          JSON.stringify({
            personalization_enabled: newState,
            last_toggled_at: new Date().toISOString(),
            last_toggled_value: !newState,
          })
        );
      } catch (e) {
        console.warn('Failed to save personalization preference:', e);
        // In-memory state persists even if localStorage fails (private browsing)
      }
    }
  };

  // Refresh user profile from server (T007)
  const refreshProfile = async () => {
    if (!AUTH_SERVER_URL) return;
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/profile/questionnaire`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        setPersonalizationAvailable(false);
        setUserProfile(null);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch profile');

      const profile = await response.json();
      setUserProfile(profile);
      setPersonalizationAvailable(true);
    } catch (error) {
      console.warn('Failed to refresh profile:', error.message);
      setPersonalizationAvailable(false);
    }
  };

  // Helper to get current chapter slug from URL
  function getCurrentChapterSlug() {
    if (typeof window === 'undefined') return 'default';
    const path = window.location.pathname;
    // Extract slug from path like /docs/01-introduction-to-ros2
    const match = path.match(/\/docs\/([^/]+)/);
    return match ? match[1] : 'default';
  }

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
