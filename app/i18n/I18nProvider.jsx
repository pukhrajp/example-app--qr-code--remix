import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from './config';

/**
 * I18nProvider Component
 * 
 * Wraps the app with i18next context to enable translations
 * 
 * Features:
 * - Initializes i18next with Shopify formatting
 * - Provides translation context to all child components
 * - Loads saved language preference from localStorage
 * - Handles loading state during initialization
 * - Supports automatic locale detection from Shopify
 * 
 * Usage:
 * <I18nProvider>
 *   <YourApp />
 * </I18nProvider>
 */

export function I18nProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('cursor-app-language');
    
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      // Set the saved language
      i18n.changeLanguage(savedLanguage);
    }
    
    // Mark as ready
    setIsReady(true);
  }, []);

  // Show nothing while initializing (very fast, usually instant)
  if (!isReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export default I18nProvider;

