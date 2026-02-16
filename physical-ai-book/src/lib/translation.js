/**
 * Translation Utility Functions
 * Handles localStorage persistence, translation loading, and language preference management
 */

const LANGUAGE_PREF_KEY = 'translation-preference';
const TRANSLATION_CACHE = new Map(); // In-memory cache for loaded translations

/**
 * Get current language preference from localStorage
 * @returns {'english' | 'urdu'} Current language preference, defaults to 'english'
 */
export function getLanguagePreference() {
  try {
    const pref = localStorage.getItem(LANGUAGE_PREF_KEY);
    if (pref) {
      const { language } = JSON.parse(pref);
      return language || 'english';
    }
  } catch (error) {
    console.warn('Failed to read language preference:', error);
  }
  return 'english';
}

/**
 * Set language preference in localStorage
 * @param {'english' | 'urdu'} language - The language to set
 */
export function setLanguagePreference(language) {
  try {
    localStorage.setItem(
      LANGUAGE_PREF_KEY,
      JSON.stringify({
        language,
        last_set_at: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
}

/**
 * Clear language preference from localStorage
 */
export function clearLanguagePreference() {
  try {
    localStorage.removeItem(LANGUAGE_PREF_KEY);
    TRANSLATION_CACHE.clear();
  } catch (error) {
    console.warn('Failed to clear language preference:', error);
  }
}

/**
 * Load translation for a specific chapter
 * @param {string} chapterId - Chapter identifier (e.g., '01-introduction-to-ros2')
 * @returns {Promise<Object|null>} Translation object or null if not found
 */
export async function loadTranslation(chapterId) {
  try {
    // Check cache first
    if (TRANSLATION_CACHE.has(chapterId)) {
      return TRANSLATION_CACHE.get(chapterId);
    }

    // Fetch from public directory
    const response = await fetch(`/translations/urdu/${chapterId}.json`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Translation not found for chapter: ${chapterId}`);
      } else {
        console.warn(`Failed to load translation for ${chapterId}: HTTP ${response.status}`);
      }
      return null;
    }

    const translation = await response.json();

    // Validate translation structure
    if (!translation.chapter_id || !translation.language) {
      console.warn(`Invalid translation structure for ${chapterId}`);
      return null;
    }

    // Cache the translation
    TRANSLATION_CACHE.set(chapterId, translation);
    return translation;
  } catch (error) {
    console.warn(`Error loading translation for ${chapterId}:`, error);
    return null;
  }
}

/**
 * Check if a word should be translated based on technical terms whitelist
 * @param {string} word - Word to check
 * @param {Array<Object>} whitelist - Array of whitelisted terms
 * @returns {boolean} True if word should be translated, false if it's whitelisted
 */
export function shouldTranslateTerm(word, whitelist) {
  if (!whitelist || whitelist.length === 0) {
    return true;
  }

  return !whitelist.some((item) => {
    if (item.case_sensitive) {
      return word === item.term;
    }
    return word.toLowerCase() === item.term.toLowerCase();
  });
}

/**
 * Clear all cached translations
 */
export function clearTranslationCache() {
  TRANSLATION_CACHE.clear();
}

/**
 * Get translation from cache without fetching
 * @param {string} chapterId - Chapter identifier
 * @returns {Object|null} Translation object or null
 */
export function getCachedTranslation(chapterId) {
  return TRANSLATION_CACHE.get(chapterId) || null;
}
