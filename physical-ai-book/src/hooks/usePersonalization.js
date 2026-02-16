import { useContext } from 'react';
import { PersonalizationContext } from '../components/PersonalizationProvider';

/**
 * Hook to access personalization state and controls
 * Must be used within PersonalizationProvider
 *
 * Returns: {
 *   userProfile: Object | null,           // User background from 003-auth (null if unavailable)
 *   personalizationEnabled: Boolean,      // Current toggle state
 *   personalizationAvailable: Boolean,    // Whether auth service is reachable
 *   togglePersonalization: Function,      // Flip toggle and persist to localStorage
 *   refreshProfile: Function,             // Async function to re-fetch user profile
 * }
 */
export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return context;
}
