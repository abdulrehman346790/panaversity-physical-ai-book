/**
 * TranslationButton Component
 * Toggle button for switching between English and Urdu translations
 * Displays with appropriate text and handles click events
 */

import React, { useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './styles.module.css';

/**
 * TranslationButton - Button to toggle between English and Urdu
 *
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant='default'] - Button variant ('default' | 'minimal')
 * @param {string} [props.position='fixed'] - Button positioning ('fixed' | 'inline')
 * @param {function} [props.onToggle] - Callback when language is toggled
 * @returns {JSX.Element} Translation toggle button
 */
export function TranslationButton({
  className = '',
  variant = 'default',
  position = 'fixed',
  onToggle = null,
} = {}) {
  // Only render on chapter pages (check if we're in a docs page)
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const isChapterPage = path.includes('/docs/') || path.includes('/module-');
    if (!isChapterPage) {
      return null;
    }
  }

  try {
    const { language, toggleLanguage } = useTranslation();

  const handleClick = useCallback(() => {
    toggleLanguage();
    if (onToggle) {
      const newLang = language === 'english' ? 'urdu' : 'english';
      onToggle(newLang);
    }
  }, [language, toggleLanguage, onToggle]);

  // Button text - Urdu text for when currently in English, vice versa
  const buttonText = language === 'english' ? 'اردو میں' : 'English';
  const ariaLabel =
    language === 'english' ? 'Switch to Urdu' : 'Switch to English';

  const combinedClassName = [
    styles.button,
    styles[variant],
    styles[position],
    className,
  ]
    .filter(Boolean)
    .join(' ');

    return (
      <button
        className={combinedClassName}
        onClick={handleClick}
        aria-label={ariaLabel}
        title={ariaLabel}
        type="button"
        aria-pressed={language === 'urdu'}
      >
        <span className={styles.text}>{buttonText}</span>
      </button>
    );
  } catch (error) {
    console.warn('TranslationButton error:', error);
    return null;
  }
}

export default TranslationButton;
