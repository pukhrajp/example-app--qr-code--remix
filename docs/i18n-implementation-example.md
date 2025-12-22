# i18n Implementation Example

## 📋 Code Comparison: Before vs After

This document shows exactly how the code will change when we implement i18n.

---

## Example 1: Simple Button Text

### ❌ Before (Hardcoded):
```javascript
<Button variant="primary" onClick={handleSave}>
  Save & Publish
</Button>
```

### ✅ After (Translatable):
```javascript
<Button variant="primary" onClick={handleSave}>
  {t('cursors.buttons.save')}
</Button>
```

**Translation File (`locales/en/cursors.json`):**
```json
{
  "buttons": {
    "save": "Save & Publish"
  }
}
```

**French Translation (`locales/fr/cursors.json`):**
```json
{
  "buttons": {
    "save": "Enregistrer et publier"
  }
}
```

---

## Example 2: Text with Variables

### ❌ Before (Hardcoded):
```javascript
<Text>Current size: {cursorSize}px ({Math.round((cursorSize / 32) * 100)}%)</Text>
```

### ✅ After (Translatable):
```javascript
<Text>
  {t('cursors.settings.size.current', { 
    size: cursorSize, 
    percentage: Math.round((cursorSize / 32) * 100) 
  })}
</Text>
```

**Translation File:**
```json
{
  "settings": {
    "size": {
      "current": "Current size: {{size}}px ({{percentage}}%)"
    }
  }
}
```

**French Translation:**
```json
{
  "settings": {
    "size": {
      "current": "Taille actuelle : {{size}}px ({{percentage}}%)"
    }
  }
}
```

---

## Example 3: Conditional Messages

### ❌ Before (Hardcoded):
```javascript
<Banner
  title="Custom cursor is currently disabled"
  tone="warning"
>
  <p>Your custom cursor settings are saved but not active on your storefront. Enable it to show the custom cursor to your customers.</p>
</Banner>
```

### ✅ After (Translatable):
```javascript
<Banner
  title={t('cursors.banner.disabled.title')}
  tone="warning"
>
  <p>{t('cursors.banner.disabled.description')}</p>
</Banner>
```

**Translation File:**
```json
{
  "banner": {
    "disabled": {
      "title": "Custom cursor is currently disabled",
      "description": "Your custom cursor settings are saved but not active on your storefront. Enable it to show the custom cursor to your customers."
    }
  }
}
```

---

## Example 4: Toast Notifications

### ❌ Before (Hardcoded):
```javascript
shopify.toast.show('Cursor published successfully', {
  duration: 3000,
});
```

### ✅ After (Translatable):
```javascript
shopify.toast.show(t('cursors.toast.success'), {
  duration: 3000,
});
```

**Translation File:**
```json
{
  "toast": {
    "success": "Cursor published successfully",
    "reset": "Cursor reset to default",
    "error": "Failed to save cursor settings. Please try again."
  }
}
```

---

## Example 5: Category Names (Dynamic)

### ❌ Before (Hardcoded):
```javascript
const formatCategoryName = (cat) => {
  return cat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
```

### ✅ After (Translatable):
```javascript
const formatCategoryName = (cat) => {
  // Use translation if available, fallback to formatted version
  const key = `cursors.categories.${cat.toLowerCase()}`;
  return t(key, { defaultValue: cat.replace(/_/g, ' ') });
};
```

**Translation File:**
```json
{
  "categories": {
    "professional": "Professional",
    "fun": "Fun",
    "seasonal": "Seasonal",
    "gaming": "Gaming",
    "fashion": "Fashion",
    "minimal": "Minimal",
    "animated": "Animated"
  }
}
```

**French Translation:**
```json
{
  "categories": {
    "professional": "Professionnel",
    "fun": "Amusant",
    "seasonal": "Saisonnier",
    "gaming": "Jeu",
    "fashion": "Mode",
    "minimal": "Minimaliste",
    "animated": "Animé"
  }
}
```

---

## Example 6: Accessibility Labels

### ❌ Before (Hardcoded):
```javascript
<Button
  accessibilityLabel={`Save and publish ${selectedCursor.name} cursor with size ${cursorSize}px`}
>
  Save & Publish
</Button>
```

### ✅ After (Translatable):
```javascript
<Button
  accessibilityLabel={t('cursors.aria.saveButton', { 
    name: selectedCursor.name, 
    size: cursorSize 
  })}
>
  {t('cursors.buttons.save')}
</Button>
```

**Translation File:**
```json
{
  "aria": {
    "saveButton": "Save and publish {{name}} cursor with size {{size}}px",
    "resetButton": "Reset all cursor settings to default values",
    "selectCursor": "Select {{name}} cursor",
    "selectCursorActive": "Select {{name}} cursor (currently selected)"
  }
}
```

---

## Full Component Setup

### Step 1: Loader (Provide translations to component)

```javascript
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getI18n } from "../i18n/server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get i18n instance with merchant's locale
    const i18n = await getI18n(request);

    // ... existing loader code ...

    return json({
      cursorsByCategory,
      cursors,
      activeCursorId: cursorSettings.activeCursorId,
      activeCursor: cursorSettings.activeCursor,
      savedCursorSize,
      isEnabled: cursorSettings.isEnabled,
      locale: i18n.language, // Pass current locale
      translations: i18n.getResourceBundle(i18n.language, 'cursors'), // Pass translations
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

### Step 2: Component (Use translations)

```javascript
import { useTranslation } from 'react-i18next';

export default function CursorsPage() {
  const { t } = useTranslation('cursors'); // Load 'cursors' namespace
  const loaderData = useLoaderData();
  // ... rest of component code ...

  return (
    <Page title={t('page.title')}>
      {/* Error Banner */}
      {(error || (actionData && !actionData.success)) && (
        <Box paddingBlockEnd="400">
          <Banner title={t('banner.error.title')} tone="critical">
            <p>{error || actionData?.message || t('banner.error.default')}</p>
          </Banner>
        </Box>
      )}

      {/* Disabled Banner */}
      {!isEnabled && !error && (
        <Box paddingBlockEnd="400">
          <Banner
            title={t('banner.disabled.title')}
            tone="warning"
            action={{
              content: t('buttons.enable'),
              onAction: () => setIsEnabled(true),
            }}
          >
            <p>{t('banner.disabled.description')}</p>
          </Banner>
        </Box>
      )}

      {/* ... rest of component ... */}

      <Button variant="primary" onClick={handleSave}>
        {t('buttons.save')}
      </Button>
    </Page>
  );
}
```

---

## Complete Translation File Example

### `app/i18n/locales/en/cursors.json`

```json
{
  "page": {
    "title": "Custom Cursor"
  },
  "banner": {
    "error": {
      "title": "Error",
      "default": "An unexpected error occurred. Please try again."
    },
    "disabled": {
      "title": "Custom cursor is currently disabled",
      "description": "Your custom cursor settings are saved but not active on your storefront. Enable it to show the custom cursor to your customers."
    }
  },
  "buttons": {
    "save": "Save & Publish",
    "reset": "Reset to default",
    "enable": "Enable",
    "disable": "Disable"
  },
  "preview": {
    "title": "Cursor Preview",
    "empty": {
      "heading": "Select a cursor from the gallery",
      "description": "Click any cursor on the left to see a preview here"
    },
    "instructions": "✨ Hover over this area to see your custom cursor in action!",
    "currentSize": "Current size: {{size}}px ({{percentage}}%)"
  },
  "settings": {
    "title": "Cursor Settings",
    "appStatus": {
      "label": "App Status",
      "enabled": "Your custom cursor is active and will be displayed on your storefront.",
      "disabled": "Your custom cursor is disabled. Click \"Enable\" above to activate it."
    },
    "size": {
      "label": "Cursor Size",
      "current": "{{size}}px ({{percentage}}%)",
      "help": "Adjust the size of your custom cursor (16px - 64px)"
    }
  },
  "tabs": {
    "gallery": "Cursor gallery",
    "upload": "Upload your own"
  },
  "categories": {
    "professional": "Professional",
    "fun": "Fun",
    "seasonal": "Seasonal",
    "gaming": "Gaming",
    "fashion": "Fashion",
    "minimal": "Minimal",
    "animated": "Animated"
  },
  "empty": {
    "gallery": {
      "title": "No cursors uploaded yet",
      "description": "Start by adding cursors to your gallery."
    },
    "upload": {
      "title": "Upload your own cursor",
      "description": "Coming soon! You'll be able to upload custom cursor images here."
    }
  },
  "toast": {
    "success": "Cursor published successfully",
    "reset": "Cursor reset to default",
    "error": "Failed to save cursor settings. Please try again.",
    "enableSuccess": "Custom cursor enabled",
    "disableSuccess": "Custom cursor disabled"
  },
  "aria": {
    "saveButton": "Save and publish {{name}} cursor with size {{size}}px",
    "resetButton": "Reset all cursor settings to default values",
    "selectCursor": "Select {{name}} cursor{{status}}",
    "previewRegion": "Preview of {{name}} cursor at {{size}}px",
    "previewEmpty": "Cursor preview - no cursor selected"
  },
  "errors": {
    "sizeRange": "Cursor size must be between 16px and 64px",
    "notFound": "Selected cursor not found",
    "saveFailed": "Failed to save cursor settings. Please try again.",
    "loadFailed": "Failed to load cursor data"
  }
}
```

### `app/i18n/locales/fr/cursors.json` (French)

```json
{
  "page": {
    "title": "Curseur personnalisé"
  },
  "banner": {
    "error": {
      "title": "Erreur",
      "default": "Une erreur inattendue s'est produite. Veuillez réessayer."
    },
    "disabled": {
      "title": "Le curseur personnalisé est actuellement désactivé",
      "description": "Vos paramètres de curseur personnalisé sont enregistrés mais non actifs sur votre boutique. Activez-le pour afficher le curseur personnalisé à vos clients."
    }
  },
  "buttons": {
    "save": "Enregistrer et publier",
    "reset": "Réinitialiser par défaut",
    "enable": "Activer",
    "disable": "Désactiver"
  },
  "preview": {
    "title": "Aperçu du curseur",
    "empty": {
      "heading": "Sélectionnez un curseur dans la galerie",
      "description": "Cliquez sur n'importe quel curseur à gauche pour voir un aperçu ici"
    },
    "instructions": "✨ Survolez cette zone pour voir votre curseur personnalisé en action !",
    "currentSize": "Taille actuelle : {{size}}px ({{percentage}}%)"
  },
  "settings": {
    "title": "Paramètres du curseur",
    "appStatus": {
      "label": "Statut de l'application",
      "enabled": "Votre curseur personnalisé est actif et sera affiché sur votre boutique.",
      "disabled": "Votre curseur personnalisé est désactivé. Cliquez sur \"Activer\" ci-dessus pour l'activer."
    },
    "size": {
      "label": "Taille du curseur",
      "current": "{{size}}px ({{percentage}}%)",
      "help": "Ajustez la taille de votre curseur personnalisé (16px - 64px)"
    }
  },
  "tabs": {
    "gallery": "Galerie de curseurs",
    "upload": "Télécharger le vôtre"
  },
  "categories": {
    "professional": "Professionnel",
    "fun": "Amusant",
    "seasonal": "Saisonnier",
    "gaming": "Jeu",
    "fashion": "Mode",
    "minimal": "Minimaliste",
    "animated": "Animé"
  },
  "empty": {
    "gallery": {
      "title": "Aucun curseur téléchargé pour le moment",
      "description": "Commencez par ajouter des curseurs à votre galerie."
    },
    "upload": {
      "title": "Téléchargez votre propre curseur",
      "description": "Bientôt disponible ! Vous pourrez télécharger des images de curseur personnalisées ici."
    }
  },
  "toast": {
    "success": "Curseur publié avec succès",
    "reset": "Curseur réinitialisé par défaut",
    "error": "Échec de l'enregistrement des paramètres du curseur. Veuillez réessayer.",
    "enableSuccess": "Curseur personnalisé activé",
    "disableSuccess": "Curseur personnalisé désactivé"
  },
  "aria": {
    "saveButton": "Enregistrer et publier le curseur {{name}} avec une taille de {{size}}px",
    "resetButton": "Réinitialiser tous les paramètres du curseur aux valeurs par défaut",
    "selectCursor": "Sélectionner le curseur {{name}}{{status}}",
    "previewRegion": "Aperçu du curseur {{name}} à {{size}}px",
    "previewEmpty": "Aperçu du curseur - aucun curseur sélectionné"
  },
  "errors": {
    "sizeRange": "La taille du curseur doit être comprise entre 16px et 64px",
    "notFound": "Curseur sélectionné introuvable",
    "saveFailed": "Échec de l'enregistrement des paramètres du curseur. Veuillez réessayer.",
    "loadFailed": "Échec du chargement des données du curseur"
  }
}
```

---

## Setup Files

### `app/i18n/config.js`

```javascript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import en_common from './locales/en/common.json';
import en_cursors from './locales/en/cursors.json';
import en_errors from './locales/en/errors.json';

import fr_common from './locales/fr/common.json';
import fr_cursors from './locales/fr/cursors.json';
import fr_errors from './locales/fr/errors.json';

// Configure i18next
i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en_common,
        cursors: en_cursors,
        errors: en_errors,
      },
      fr: {
        common: fr_common,
        cursors: fr_cursors,
        errors: fr_errors,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18next;
```

### `app/i18n/server.js`

```javascript
import { authenticate } from "../shopify.server";
import i18next from './config';

/**
 * Get i18n instance with the correct locale for the current request
 * Detects locale from Shopify session or falls back to browser language
 */
export async function getI18n(request) {
  try {
    const { session } = await authenticate.admin(request);
    
    // Try to get locale from Shopify session/shop settings
    // You can query this from Shopify Admin API if needed
    const shopLocale = 'en'; // Default, or fetch from shop settings
    
    // Clone i18next instance and set language
    const i18n = i18next.cloneInstance();
    await i18n.changeLanguage(shopLocale);
    
    return i18n;
  } catch (error) {
    // Fallback to English on error
    const i18n = i18next.cloneInstance();
    await i18n.changeLanguage('en');
    return i18n;
  }
}
```

---

## Testing Example

```javascript
// Test translations are working
import { renderWithI18n } from '../test-utils';
import CursorsPage from '../app/routes/app.cursors';

test('renders save button in English', () => {
  const { getByText } = renderWithI18n(<CursorsPage />, { locale: 'en' });
  expect(getByText('Save & Publish')).toBeInTheDocument();
});

test('renders save button in French', () => {
  const { getByText } = renderWithI18n(<CursorsPage />, { locale: 'fr' });
  expect(getByText('Enregistrer et publier')).toBeInTheDocument();
});
```

---

## Migration Checklist

- [ ] Install dependencies
- [ ] Create folder structure
- [ ] Set up i18n configuration
- [ ] Create English translation files
- [ ] Update app.jsx with i18n provider
- [ ] Replace hardcoded strings in app.cursors.jsx
- [ ] Test English translations
- [ ] Add French translations
- [ ] Test French translations
- [ ] Add remaining languages
- [ ] Test all languages
- [ ] Fix layout issues
- [ ] Test accessibility in all languages
- [ ] Update documentation

---

**This shows exactly how clean and maintainable the i18n implementation will be!** 🎯

