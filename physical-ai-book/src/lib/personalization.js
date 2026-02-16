/**
 * Personalization utility functions for localStorage management
 */

/**
 * Get personalization toggle state from localStorage
 * @param {string} userId - Authenticated user ID
 * @param {string} chapterSlug - Current chapter slug
 * @returns {boolean | null} Toggle state or null if not found
 */
export function getToggleState(userId, chapterSlug) {
  if (typeof window === 'undefined') return null;

  try {
    const key = `personalization_pref_${userId}_${chapterSlug}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    return data.personalization_enabled ?? null;
  } catch (error) {
    console.warn('Failed to read personalization preference:', error);
    return null;
  }
}

/**
 * Set personalization toggle state in localStorage
 * @param {string} userId - Authenticated user ID
 * @param {string} chapterSlug - Current chapter slug
 * @param {boolean} enabled - Toggle state
 * @returns {boolean} Success flag
 */
export function setToggleState(userId, chapterSlug, enabled) {
  if (typeof window === 'undefined') return false;

  try {
    const key = `personalization_pref_${userId}_${chapterSlug}`;
    const data = {
      personalization_enabled: enabled,
      last_toggled_at: new Date().toISOString(),
      last_toggled_value: !enabled,
    };
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save personalization preference:', error);
    // In private browsing mode, localStorage may not be available
    return false;
  }
}

/**
 * Clear personalization preferences for a user (e.g., on logout)
 * @param {string} userId - Authenticated user ID
 * @returns {number} Number of preferences cleared
 */
export function clearUserPreferences(userId) {
  if (typeof window === 'undefined') return 0;

  let cleared = 0;
  try {
    const keys = Object.keys(localStorage);
    const pattern = new RegExp(`^personalization_pref_${userId}_`);

    keys.forEach((key) => {
      if (pattern.test(key)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
  } catch (error) {
    console.warn('Failed to clear preferences:', error);
  }

  return cleared;
}

/**
 * Get all personalization preferences for debugging/admin purposes
 * @returns {Object} Map of all stored preferences
 */
export function getAllPreferences() {
  if (typeof window === 'undefined') return {};

  try {
    const prefs = {};
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('personalization_pref_')) {
        const stored = localStorage.getItem(key);
        prefs[key] = JSON.parse(stored);
      }
    });
    return prefs;
  } catch (error) {
    console.warn('Failed to read preferences:', error);
    return {};
  }
}
