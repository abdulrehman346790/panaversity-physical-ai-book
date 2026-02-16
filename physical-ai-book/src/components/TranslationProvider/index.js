/**
 * TranslationProvider Component
 * Provides translation state management and context for all child components
 * Manages language preference, translation loading, and caching
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getLanguagePreference, setLanguagePreference, loadTranslation } from '../../lib/translation';

export const TranslationContext = createContext();

/**
 * TranslationProvider - Context provider for translation feature
 * Wraps application to provide language state and translation utilities
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider wrapper
 */
export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('english');
  const [translation, setTranslation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Load language preference on mount
  useEffect(() => {
    try {
      const pref = getLanguagePreference();
      setLanguage(pref);
    } catch (err) {
      console.warn('Failed to load language preference:', err);
      setLanguage('english');
    }
  }, []);

  /**
   * Toggle between English and Urdu
   * Persists preference to localStorage
   */
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'english' ? 'urdu' : 'english';
    setLanguage(newLang);
    setTranslation(null); // Clear translation when toggling back to English
    try {
      setLanguagePreference(newLang);
    } catch (err) {
      console.warn('Failed to save language preference:', err);
    }
  }, [language]);

  /**
   * Load translation for a specific chapter
   * Handles caching and error states
   *
   * @param {string} chapterId - Chapter identifier
   * @returns {Promise<Object|null>} Translation object or null
   */
  const loadChapterTranslation = useCallback(async (chapterId) => {
    setIsLoading(true);
    setError(null);

    try {
      const trans = await loadTranslation(chapterId);

      if (trans) {
        setTranslation(trans);
        setIsAvailable(true);
        return trans;
      } else {
        setTranslation(null);
        setIsAvailable(false);
        return null;
      }
    } catch (err) {
      console.warn(`Error loading translation for ${chapterId}:`, err);
      setError('Failed to load translation');
      setTranslation(null);
      setIsAvailable(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if translation is available for a chapter
   * Makes a request to check without fully loading
   *
   * @param {string} chapterId - Chapter identifier
   * @returns {Promise<boolean>} True if translation available
   */
  const checkTranslationAvailability = useCallback(async (chapterId) => {
    try {
      const response = await fetch(`/translations/urdu/${chapterId}.json`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch (err) {
      console.warn(`Failed to check translation availability for ${chapterId}:`, err);
      return false;
    }
  }, []);

  const value = {
    // State
    language,
    translation,
    isLoading,
    error,
    isAvailable,

    // Methods
    toggleLanguage,
    loadChapterTranslation,
    checkTranslationAvailability,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export default TranslationProvider;
