import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import shopifyFormat from '@shopify/i18next-shopify';

// Import English translations
import enCommon from './locales/en/common.json';
import enCursors from './locales/en/cursors.json';
import enErrors from './locales/en/errors.json';

// Import French translations
import frCommon from './locales/fr/common.json';
import frCursors from './locales/fr/cursors.json';
import frErrors from './locales/fr/errors.json';

/**
 * i18n Configuration for Custom Cursor App
 * 
 * Uses @shopify/i18next-shopify for Shopify-specific formatting
 * - Supports Shopify's translation format conventions
 * - Handles pluralization and interpolation
 * - Integrates with Shopify App Bridge for locale detection
 * 
 * Supported Languages:
 * - English (en) - Default ✅
 * - French (fr) - Available ✅
 * - Spanish (es) - Coming soon
 * - German (de) - Coming soon
 * - Portuguese (pt) - Coming soon
 */

// Initialize i18next with Shopify formatting plugin
i18n
  .use(shopifyFormat) // Use Shopify's translation format
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Language resources
    resources: {
      en: {
        common: enCommon,
        cursors: enCursors,
        errors: enErrors,
      },
      fr: {
        common: frCommon,
        cursors: frCursors,
        errors: frErrors,
      },
      es: {
        common: {},
        cursors: {},
        errors: {},
      },
      de: {
        common: {},
        cursors: {},
        errors: {},
      },
      pt: {
        common: {},
        cursors: {},
        errors: {},
      },
    },

    // Default language
    lng: 'en',

    // Fallback language when translation is missing
    fallbackLng: 'en',

    // Default namespace (used when no namespace specified)
    defaultNS: 'common',

    // Available namespaces
    ns: ['common', 'cursors', 'errors'],

    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development',

    // React-specific options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },

    // Shopify format options
    // The shopifyFormat plugin handles Shopify's translation conventions
    // including pluralization and variable interpolation
  });

export default i18n;

