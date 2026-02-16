import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import styles from './styles.module.css';

/**
 * PersonalizationButton - Toggle button for content personalization
 *
 * Appears on chapter pages for authenticated users
 * - "Personalize Content" when off
 * - "✓ Personalized" when on
 * - Hides when auth unavailable or user unauthenticated
 */
export function PersonalizationButton() {
  const { personalizationEnabled, personalizationAvailable, togglePersonalization } =
    usePersonalization();

  // Don't show button if personalization not available
  if (!personalizationAvailable) {
    return null;
  }

  const buttonText = personalizationEnabled ? '✓ Personalized' : 'Personalize Content';
  const ariaLabel = personalizationEnabled
    ? 'Click to restore default content'
    : 'Click to personalize content based on your background';

  return (
    <button
      className={styles.button}
      onClick={togglePersonalization}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {buttonText}
    </button>
  );
}
