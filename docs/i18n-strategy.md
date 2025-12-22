# Multi-Language (i18n) Implementation Strategy

## 📋 Overview

This document outlines the strategy for implementing internationalization (i18n) in our Custom Cursor Shopify app following Shopify's official guidelines and best practices.

---

## 🎯 Goals

1. **Support multiple languages** for global merchant audience
2. **Follow Shopify's i18n guidelines** and best practices
3. **Maintain code quality** with minimal refactoring
4. **Enable easy translation management** for future languages
5. **Support RTL languages** (Arabic, Hebrew, etc.)

---

## 🔍 Current State Analysis

### What's Already in Place:
- ✅ Polaris UI components (already support i18n)
- ✅ AppProvider from `@shopify/shopify-app-remix` (handles Polaris translations)
- ✅ Existing pattern in `auth.login/route.jsx` loading Polaris locales

### What Needs Translation:
1. **App Dashboard (`app.cursors.jsx`):**
   - Page titles: "Custom Cursor"
   - Banners: Error messages, warning messages
   - Buttons: "Save & Publish", "Reset to default", "Enable", "Disable"
   - Labels: "Cursor Preview", "Cursor Settings", "Cursor Size", "App Status"
   - Empty states: "No cursors uploaded yet", "Coming soon!"
   - Tabs: "Cursor gallery", "Upload your own"
   - Helper text: Size descriptions, instructions
   - Category names: "Professional", "Fun", "Seasonal", etc.
   - Toast notifications: Success/error messages
   - Accessibility labels (ARIA)

2. **Landing Page (`_index/route.jsx`):**
   - Headings, taglines, feature descriptions
   - Form labels

3. **Database Content:**
   - Cursor names and descriptions (from seed data)

---

## 🏗️ Recommended Architecture

### Option A: `@shopify/i18next-shopify` (Recommended by Shopify)
**Pros:**
- Official Shopify package
- Integrates seamlessly with Shopify ecosystem
- Built-in locale detection from App Bridge
- Supports Polaris components out of the box
- Type-safe with TypeScript support

**Cons:**
- Additional dependency
- Requires setup and configuration

### Option B: `react-i18next` + `i18next`
**Pros:**
- Popular in React community
- Extensive features and plugins
- Large ecosystem and community support
- Flexible and powerful

**Cons:**
- More manual setup required
- Need to manually integrate with Shopify patterns
- Slightly larger bundle size

### **Recommendation: Option A** 
Use `@shopify/i18next-shopify` for best alignment with Shopify guidelines.

---

## 📁 Proposed File Structure

```
app/
├── i18n/
│   ├── config.js                    # i18n configuration
│   ├── server.js                    # Server-side i18n setup
│   └── locales/
│       ├── en/
│       │   ├── common.json          # Common translations (buttons, labels)
│       │   ├── cursors.json         # Cursor dashboard translations
│       │   ├── errors.json          # Error messages
│       │   └── landing.json         # Landing page translations
│       ├── fr/
│       │   ├── common.json
│       │   ├── cursors.json
│       │   ├── errors.json
│       │   └── landing.json
│       ├── es/
│       │   └── ... (Spanish)
│       ├── de/
│       │   └── ... (German)
│       ├── pt/
│       │   └── ... (Portuguese)
│       ├── it/
│       │   └── ... (Italian)
│       ├── ja/
│       │   └── ... (Japanese)
│       ├── zh-CN/
│       │   └── ... (Chinese Simplified)
│       └── ar/
│           └── ... (Arabic - RTL)
├── routes/
│   ├── app.jsx                      # Updated with i18n context
│   ├── app.cursors.jsx              # Updated with t() function
│   └── ...
└── utils/
    └── i18n-helpers.js              # Helper functions
```

---

## 🌍 Supported Languages (Initial Phase)

### Priority 1 (Core Markets):
1. **English (en)** - Default
2. **French (fr)** - Canada, France
3. **Spanish (es)** - Spain, Latin America
4. **German (de)** - Germany, Austria, Switzerland
5. **Portuguese (pt)** - Brazil, Portugal

### Priority 2 (Growing Markets):
6. **Italian (it)**
7. **Japanese (ja)**
8. **Chinese Simplified (zh-CN)**

### Priority 3 (Future):
9. **Arabic (ar)** - RTL support
10. **Dutch (nl)**
11. **Polish (pl)**
12. **Swedish (sv)**

---

## 🔧 Implementation Plan

### Phase 1: Setup & Infrastructure (Day 1)
**Tasks:**
1. Install `@shopify/i18next-shopify` and dependencies
2. Create `app/i18n/` directory structure
3. Create configuration file (`config.js`)
4. Set up server-side i18n utilities
5. Create base locale files for English (en)
6. Update `app/routes/app.jsx` to provide i18n context

**Estimated Time:** 2-3 hours

---

### Phase 2: Extract Strings (Day 2)
**Tasks:**
1. Audit all hardcoded strings in `app.cursors.jsx`
2. Create translation keys with descriptive namespaces
3. Create `locales/en/cursors.json` with all strings
4. Create `locales/en/common.json` for shared strings
5. Create `locales/en/errors.json` for error messages
6. Document translation key naming conventions

**Estimated Time:** 3-4 hours

---

### Phase 3: Implement Translations (Day 3)
**Tasks:**
1. Replace hardcoded strings with `t()` function in `app.cursors.jsx`
2. Update page titles, buttons, labels, and helpers
3. Update banners and toast notifications
4. Update accessibility labels (ARIA)
5. Test all UI components with translations
6. Handle pluralization and variable interpolation

**Estimated Time:** 4-5 hours

---

### Phase 4: Add French Translations (Day 4)
**Tasks:**
1. Create `locales/fr/` directory
2. Translate all English strings to French
3. Test French language in UI
4. Verify layout with longer French text
5. Fix any UI layout issues

**Estimated Time:** 3-4 hours

---

### Phase 5: Language Detection & Switching (Day 5)
**Tasks:**
1. Implement locale detection from Shopify App Bridge
2. Add fallback to browser language
3. Store user's language preference (if needed)
4. Add language switcher in settings (optional)
5. Test language switching functionality

**Estimated Time:** 2-3 hours

---

### Phase 6: Additional Languages (Days 6-10)
**Tasks:**
1. Add Spanish (es) translations
2. Add German (de) translations
3. Add Portuguese (pt) translations
4. Add Italian (it) translations
5. Test all languages
6. Fix layout issues for different text lengths

**Estimated Time:** 1 day per language (5 days total)

---

### Phase 7: RTL Support (Future)
**Tasks:**
1. Update CSS for RTL languages
2. Add Arabic (ar) translations
3. Test RTL layout thoroughly
4. Fix alignment and positioning issues

**Estimated Time:** 2-3 days

---

## 📝 Translation Key Structure

### Naming Convention:
```
{namespace}.{section}.{element}.{variant}
```

### Examples:
```json
{
  "cursors.page.title": "Custom Cursor",
  "cursors.banner.disabled.title": "Custom cursor is currently disabled",
  "cursors.banner.disabled.description": "Your custom cursor settings are saved but not active on your storefront. Enable it to show the custom cursor to your customers.",
  "cursors.banner.error.title": "Error",
  "cursors.buttons.save": "Save & Publish",
  "cursors.buttons.reset": "Reset to default",
  "cursors.buttons.enable": "Enable",
  "cursors.buttons.disable": "Disable",
  "cursors.preview.title": "Cursor Preview",
  "cursors.preview.empty": "Select a cursor from the gallery",
  "cursors.preview.instructions": "Hover over this area to see your custom cursor in action!",
  "cursors.settings.title": "Cursor Settings",
  "cursors.settings.size.label": "Cursor Size",
  "cursors.settings.size.help": "Adjust the size of your custom cursor (16px - 64px)",
  "cursors.settings.status.label": "App Status",
  "cursors.tabs.gallery": "Cursor gallery",
  "cursors.tabs.upload": "Upload your own",
  "cursors.categories.professional": "Professional",
  "cursors.categories.fun": "Fun",
  "cursors.categories.seasonal": "Seasonal",
  "cursors.toast.success": "Cursor published successfully",
  "cursors.toast.reset": "Cursor reset to default",
  "cursors.toast.error": "Failed to save cursor settings. Please try again.",
  "cursors.empty.gallery.title": "No cursors uploaded yet",
  "cursors.empty.gallery.description": "Start by adding cursors to your gallery.",
  "cursors.empty.upload.title": "Upload your own cursor",
  "cursors.empty.upload.description": "Coming soon! You'll be able to upload custom cursor images here.",
  "cursors.aria.selectCursor": "Select {{name}} cursor",
  "cursors.aria.selectCursorActive": "Select {{name}} cursor (currently selected)",
  "cursors.aria.previewRegion": "Preview of {{name}} cursor at {{size}}px",
  "cursors.aria.previewEmpty": "Cursor preview - no cursor selected",
  "cursors.aria.saveButton": "Save and publish {{name}} cursor with size {{size}}px",
  "cursors.aria.resetButton": "Reset all cursor settings to default values"
}
```

---

## 🎨 UI Considerations

### 1. Text Expansion
- **German:** Can be 30% longer than English
- **French:** Can be 20% longer than English
- **Japanese:** Can be much shorter

**Solution:**
- Use flexible layouts (flexbox, grid)
- Avoid fixed widths on text containers
- Test with longest translation
- Consider abbreviations for buttons if needed

### 2. Button Text
**Current:**
- "Save & Publish" (short)
- "Reset to default" (medium)

**Potential Issues:**
- German: "Speichern & Veröffentlichen" (longer)
- French: "Enregistrer et publier" (longer)

**Solution:**
- Use `InlineStack` with wrap
- Increase button min-width if needed
- Test all languages for button overflow

### 3. RTL Support (Arabic, Hebrew)
**Required Changes:**
- Mirror layout direction
- Flip icons and arrows
- Adjust padding/margins
- Test thoroughly with RTL locale

---

## 🧪 Testing Strategy

### 1. Automated Testing
- Add unit tests for translation functions
- Test fallback to default language
- Test missing translation keys

### 2. Manual Testing
- Test each language in browser
- Verify layout with different text lengths
- Check for truncated text
- Verify pluralization and interpolation
- Test accessibility in each language

### 3. QA Checklist
- [ ] All text is translatable (no hardcoded strings)
- [ ] Layout works with longest translations
- [ ] Buttons don't overflow
- [ ] Empty states are translated
- [ ] Error messages are translated
- [ ] Toast notifications are translated
- [ ] ARIA labels are translated
- [ ] Categories are translated
- [ ] Help text is translated
- [ ] Placeholder text is translated

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@shopify/i18next-shopify": "^1.x.x",
    "i18next": "^23.x.x",
    "react-i18next": "^14.x.x"
  }
}
```

---

## 🔑 Key Decisions Needed

### 1. Translation Approach
- **Option A:** Use professional translation service (Recommended)
  - Cost: ~$100-300 per language
  - Quality: High, culturally appropriate
  - Time: 3-5 days per language
  
- **Option B:** Use automated translation (Google Translate API)
  - Cost: Low (~$20 per 1M characters)
  - Quality: Medium, may lack nuance
  - Time: Immediate
  - **Note:** Review and edit required

- **Option C:** Community translations
  - Cost: Free
  - Quality: Variable
  - Time: Depends on community

**Recommendation:** Option A for initial languages, then Option C for additional languages.

### 2. Cursor Names & Descriptions
- **Option A:** Translate cursor names/descriptions
  - Pro: Fully localized experience
  - Con: More work, database changes needed
  
- **Option B:** Keep cursor names in English
  - Pro: Simpler implementation
  - Con: Partially localized experience

**Recommendation:** Option B initially (English names are recognizable), Option A for Phase 2.

### 3. Language Switcher
- **Option A:** Auto-detect from Shopify (Recommended)
  - Pro: Seamless experience
  - Con: No manual override
  
- **Option B:** Add language switcher in settings
  - Pro: User control
  - Con: Extra UI complexity

**Recommendation:** Option A initially, add Option B if requested.

---

## 💰 Estimated Effort

### Development Time:
- **Phase 1 (Setup):** 2-3 hours
- **Phase 2 (Extract):** 3-4 hours
- **Phase 3 (Implement):** 4-5 hours
- **Phase 4 (French):** 3-4 hours
- **Phase 5 (Detection):** 2-3 hours
- **Phase 6 (4 languages):** 4 days
- **Total:** ~6-7 days of development

### Translation Costs:
- **Professional:** $100-300 per language × 5 languages = $500-1500
- **Automated + Review:** $50-100 per language × 5 languages = $250-500

### Total Investment:
- **Time:** 6-7 days
- **Cost:** $250-1500 (depending on approach)

---

## ✅ Success Criteria

1. ✅ All UI text is translatable
2. ✅ Support for 5+ languages
3. ✅ No layout issues with any language
4. ✅ Automatic language detection works
5. ✅ Fallback to English for missing translations
6. ✅ Accessibility labels translated
7. ✅ Error messages translated
8. ✅ Toast notifications translated
9. ✅ Zero hardcoded strings in components
10. ✅ Translation files are well-organized

---

## 📚 Resources

- [Shopify i18n Best Practices](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
- [Polaris i18n Guide](https://polaris.shopify.com/foundations/internationalization)
- [@shopify/i18next-shopify Package](https://www.npmjs.com/package/@shopify/i18next-shopify)
- [React i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)

---

## 🚀 Next Steps

1. **Review this strategy** and provide feedback
2. **Make key decisions** (translation approach, cursor names, etc.)
3. **Approve implementation** plan
4. **Begin Phase 1** setup

---

## 📝 Notes

- This strategy assumes the app is currently English-only
- Database changes needed for translatable cursor content (Phase 2)
- Consider hiring a native speaker to review translations
- Plan for ongoing translation management as features are added
- Consider using a translation management platform (e.g., Lokalise, Crowdin) for larger scale

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Status:** Awaiting Approval

