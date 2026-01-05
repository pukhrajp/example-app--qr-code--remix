import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from './config';
import { mapLocaleToLanguage, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './localeUtils';

/**
 * I18nProvider Component
 * 
 * Wraps the app with i18next context to enable translations
 * 
 * Features:
 * - Initializes i18next with Shopify formatting
 * - Provides translation context to all child components
 * - Loads saved language preference from localStorage
 * - Auto-detects language from shop locale if no manual selection
 * - Handles loading state during initialization
 * - Supports automatic locale detection from Shopify
 * 
 * Priority Order:
 * 1. Manual user selection (localStorage)
 * 2. Auto-detected shop/browser locale
 * 3. Default language (English)
 * 
 * Usage:
 * <I18nProvider detectedLocale="fr">
 *   <YourApp />
 * </I18nProvider>
 */

export function I18nProvider({ children, detectedLocale = null }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Determine which language to use based on priority
    let languageToUse = DEFAULT_LANGUAGE;
    let source = 'default';
    
    // Priority 1: Check for manually selected language in localStorage
    const savedLanguage = localStorage.getItem('cursor-app-language');
    const savedSource = localStorage.getItem('cursor-app-language-source');
    
    if (savedLanguage && savedSource === 'manual' && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      // User has manually selected a language - always respect this
      languageToUse = savedLanguage;
      source = 'manual';
    } else if (detectedLocale) {
      // Priority 2: Use auto-detected locale from shop/browser
      const mappedLanguage = mapLocaleToLanguage(detectedLocale);
      languageToUse = mappedLanguage;
      source = 'auto';
      
      // Save auto-detected language for next time
      localStorage.setItem('cursor-app-language', languageToUse);
      localStorage.setItem('cursor-app-language-source', 'auto');
    } else if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      // Priority 3: Use previously saved language (even if auto-detected)
      languageToUse = savedLanguage;
      source = savedSource || 'auto';
    }
    
    // Set the language in i18next
    if (i18n.language !== languageToUse) {
      i18n.changeLanguage(languageToUse);
    }
    
    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[i18n] Language set to: ${languageToUse} (source: ${source})`);
      if (detectedLocale) {
        console.log(`[i18n] Detected locale: ${detectedLocale}`);
      }
    }
    
    // Mark as ready
    setIsReady(true);
  }, [detectedLocale]);

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

