import { Select } from '@shopify/polaris';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';

/**
 * LanguageSwitcher Component
 * 
 * Allows users to switch between available languages.
 * - Persists language preference to localStorage
 * - Updates entire app instantly on change
 * - Shows flag emoji + native language name
 * 
 * Supported Languages:
 * - English (en) 🇬🇧
 * - French (fr) 🇫🇷
 * - Spanish (es) 🇪🇸
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  // Available language options
  const languageOptions = [
    { label: '🇬🇧 English', value: 'en' },
    { label: '🇫🇷 Français', value: 'fr' },
    { label: '🇪🇸 Español', value: 'es' },
  ];

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('cursor-app-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Handle language change
  const handleLanguageChange = useCallback(
    (newLanguage) => {
      // Change language in i18next
      i18n.changeLanguage(newLanguage);
      
      // Persist to localStorage
      localStorage.setItem('cursor-app-language', newLanguage);
    },
    [i18n]
  );

  return (
    <Select
      label={t('language.label')}
      labelHidden
      options={languageOptions}
      value={i18n.language}
      onChange={handleLanguageChange}
    />
  );
}

