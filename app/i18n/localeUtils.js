/**
 * Locale Mapping Utility
 * 
 * Maps Shopify/browser locales to app's supported languages.
 * Handles locale variants and fallbacks.
 * 
 * Example:
 * - en-US, en-GB, en-CA → en
 * - fr-FR, fr-CA → fr
 * - es-ES, es-MX → es
 */

/**
 * Supported language codes in our app
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'];

/**
 * Default language when no match is found
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Locale mapping: maps Shopify/browser locale codes to our app languages
 */
const LOCALE_MAP = {
  // English variants
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  'en-NZ': 'en',
  'en-IE': 'en',
  'en-ZA': 'en',
  
  // French variants
  fr: 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'fr-LU': 'fr',
  
  // Spanish variants
  es: 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  'es-PE': 'es',
  'es-VE': 'es',
  'es-UY': 'es',
  'es-PY': 'es',
  'es-BO': 'es',
  'es-EC': 'es',
  'es-GT': 'es',
  'es-CU': 'es',
  'es-DO': 'es',
  'es-HN': 'es',
  'es-SV': 'es',
  'es-NI': 'es',
  'es-CR': 'es',
  'es-PA': 'es',
  
  // German variants (future support)
  de: 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'de-LU': 'de',
  'de-LI': 'de',
  
  // Portuguese variants (future support)
  pt: 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
};

/**
 * Maps a locale code to an app language
 * 
 * @param {string} locale - Locale code (e.g., 'en-US', 'fr-CA', 'es')
 * @returns {string} App language code ('en', 'fr', 'es') or default
 * 
 * @example
 * mapLocaleToLanguage('en-US') // returns 'en'
 * mapLocaleToLanguage('fr-CA') // returns 'fr'
 * mapLocaleToLanguage('de-DE') // returns 'en' (not yet supported, falls back)
 * mapLocaleToLanguage('invalid') // returns 'en' (default)
 */
export function mapLocaleToLanguage(locale) {
  if (!locale || typeof locale !== 'string') {
    return DEFAULT_LANGUAGE;
  }

  // Normalize locale (lowercase)
  const normalizedLocale = locale.trim().toLowerCase();
  
  // Try exact match first
  if (LOCALE_MAP[normalizedLocale]) {
    const mappedLanguage = LOCALE_MAP[normalizedLocale];
    
    // Only return if language is currently supported
    if (SUPPORTED_LANGUAGES.includes(mappedLanguage)) {
      return mappedLanguage;
    }
  }
  
  // Try matching just the language part (before hyphen)
  const languageCode = normalizedLocale.split('-')[0];
  if (LOCALE_MAP[languageCode]) {
    const mappedLanguage = LOCALE_MAP[languageCode];
    
    // Only return if language is currently supported
    if (SUPPORTED_LANGUAGES.includes(mappedLanguage)) {
      return mappedLanguage;
    }
  }
  
  // If language code itself is supported (e.g., 'en', 'fr', 'es')
  if (SUPPORTED_LANGUAGES.includes(languageCode)) {
    return languageCode;
  }
  
  // Fallback to default language
  return DEFAULT_LANGUAGE;
}

/**
 * Gets the language name in its native form
 * 
 * @param {string} languageCode - Language code ('en', 'fr', 'es')
 * @returns {string} Native language name
 */
export function getLanguageName(languageCode) {
  const names = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    pt: 'Português',
  };
  
  return names[languageCode] || names[DEFAULT_LANGUAGE];
}

/**
 * Gets the flag emoji for a language
 * 
 * @param {string} languageCode - Language code ('en', 'fr', 'es')
 * @returns {string} Flag emoji
 */
export function getLanguageFlag(languageCode) {
  const flags = {
    en: '🇬🇧',
    fr: '🇫🇷',
    es: '🇪🇸',
    de: '🇩🇪',
    pt: '🇧🇷',
  };
  
  return flags[languageCode] || flags[DEFAULT_LANGUAGE];
}

