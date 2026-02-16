/**
 * useTranslation Hook
 * Custom hook for accessing translation context and state
 * Provides access to language preference, translation loading, and toggle functionality
 */

import { useContext } from 'react';
import { TranslationContext } from '../components/TranslationProvider';

/**
 * useTranslation - Hook for accessing translation context
 *
 * @returns {Object} Translation context value with:
 *   - language: 'english' | 'urdu'
 *   - translation: Object | null (current translation)
 *   - isLoading: boolean (loading state)
 *   - error: string | null (error message)
 *   - isAvailable: boolean (translation exists for chapter)
 *   - toggleLanguage: function (toggle language)
 *   - loadChapterTranslation: function (load specific chapter translation)
 *   - checkTranslationAvailability: function (check if translation exists)
 *
 * @throws {Error} If used outside of TranslationProvider
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return context;
}

export default useTranslation;
