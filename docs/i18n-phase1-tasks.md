# Phase 1: Setup & Infrastructure - Task Breakdown

## 📋 Overview
Breaking down Phase 1 into small, testable increments for safe implementation.

**Total Estimated Time:** 2-3 hours  
**Number of Tasks:** 7 tasks

---

## Task 1.1: Install i18n Dependencies ⏱️ 10 minutes

### What We'll Do:
- Install `@shopify/i18next-shopify` (official Shopify i18n package)
- This package includes `i18next` and `react-i18next` as dependencies
- Update `package.json`
- Verify installation

### Commands:
```bash
npm install @shopify/i18next-shopify
```

### Why @shopify/i18next-shopify?
- ✅ Official Shopify package (maintained by Shopify)
- ✅ Built-in App Bridge integration
- ✅ Automatic locale detection from Shopify
- ✅ Optimized for Shopify apps
- ✅ Includes i18next and react-i18next
- ✅ Type-safe with TypeScript support

### Files Changed:
- `package.json` (dependencies added)
- `package-lock.json` (updated)

### Testing:
1. ✅ Run `npm install` successfully
2. ✅ Check `node_modules` for new packages
3. ✅ Run `npm run dev` to ensure no conflicts
4. ✅ Verify app still runs without errors

### Success Criteria:
- No installation errors
- App still runs normally
- Dependencies appear in `package.json`

**Status:** Ready to implement  
**Risk Level:** Low (just adding packages)

---

## Task 1.2: Create Directory Structure ⏱️ 5 minutes

### What We'll Do:
- Create `app/i18n/` folder
- Create `app/i18n/locales/` folder
- Create `app/i18n/locales/en/` folder (English - default)
- Create placeholder folders for future languages

### New Directory Structure:
```
app/
└── i18n/
    └── locales/
        ├── en/
        │   ├── common.json (will create in Task 1.4)
        │   ├── cursors.json (will create in Task 1.4)
        │   └── errors.json (will create in Task 1.4)
        ├── fr/  (empty for now)
        ├── es/  (empty for now)
        ├── de/  (empty for now)
        └── pt/  (empty for now)
```

### Files Changed:
- New folders created (no code changes)

### Testing:
1. ✅ Verify folders exist in correct structure
2. ✅ Run `npm run dev` (should still work)
3. ✅ No build errors

### Success Criteria:
- All folders created successfully
- App still runs normally

**Status:** Ready to implement  
**Risk Level:** Zero (just creating empty folders)

---

## Task 1.3: Create i18n Configuration File ⏱️ 20 minutes

### What We'll Do:
- Create `app/i18n/config.js`
- Configure i18next with basic settings
- Set up English as default language
- Configure fallback behavior

### New Files:
- `app/i18n/config.js`

### File Content Preview:
```javascript
// Configuration using @shopify/i18next-shopify
// - Integrates with Shopify App Bridge
// - Default language: English (en)
// - Fallback language: English
// - Namespaces: common, cursors, errors
// - Auto-detects locale from Shopify session
// - No translations yet (will add in Task 1.4)
```

### Testing:
1. ✅ File created successfully
2. ✅ No syntax errors (run ESLint)
3. ✅ Run `npm run dev` (should work)
4. ✅ Import the config in a test file to verify it loads

### Success Criteria:
- Configuration file created
- No syntax/import errors
- App still runs normally
- ESLint passes

**Status:** Ready to implement  
**Risk Level:** Low (config file only, not used yet)

---

## Task 1.4: Create English Translation Files ⏱️ 30 minutes

### What We'll Do:
- Create `app/i18n/locales/en/common.json` with basic shared translations
- Create `app/i18n/locales/en/cursors.json` with ALL cursor dashboard strings
- Create `app/i18n/locales/en/errors.json` with error messages
- Extract ~50-60 strings from `app.cursors.jsx`

### New Files:
- `app/i18n/locales/en/common.json` (~10 strings)
- `app/i18n/locales/en/cursors.json` (~40-50 strings)
- `app/i18n/locales/en/errors.json` (~5-10 strings)

### Content Preview:
**common.json:**
```json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "status": {
    "enabled": "Enabled",
    "disabled": "Disabled"
  }
}
```

**cursors.json:**
```json
{
  "page": {
    "title": "Custom Cursor"
  },
  "buttons": {
    "save": "Save & Publish",
    "reset": "Reset to default"
  },
  "preview": {
    "title": "Cursor Preview"
  }
  // ... and ~40 more strings
}
```

### Testing:
1. ✅ All JSON files are valid (no syntax errors)
2. ✅ Run JSON validator/linter
3. ✅ Import files in config to verify they load
4. ✅ App still runs (files not used yet, just exist)

### Success Criteria:
- All translation files created
- Valid JSON syntax
- All current UI strings documented
- No runtime errors

**Status:** Ready to implement  
**Risk Level:** Low (just creating JSON files)

---

## Task 1.5: Create i18n Provider Component ⏱️ 20 minutes

### What We'll Do:
- Create `app/i18n/I18nProvider.jsx` component
- Wrap i18next initialization
- Handle loading states
- Provide translations to child components

### New Files:
- `app/i18n/I18nProvider.jsx`

### File Content Preview:
```javascript
// React component using @shopify/i18next-shopify that:
// - Initializes i18next with Shopify integration
// - Loads translation resources
// - Provides i18n context to children
// - Handles language switching
// - Auto-detects locale from Shopify App Bridge
```

### Testing:
1. ✅ Component renders without errors
2. ✅ i18next initializes correctly
3. ✅ Console shows no i18n errors
4. ✅ Can access `t` function from useTranslation hook (test in isolation)

### Success Criteria:
- Provider component created
- i18next initializes successfully
- No console errors
- App still runs

**Status:** Ready to implement  
**Risk Level:** Medium (involves React context, but isolated)

---

## Task 1.6: Update app.jsx with i18n Provider ⏱️ 15 minutes

### What We'll Do:
- Import I18nProvider in `app/routes/app.jsx`
- Wrap the Outlet with I18nProvider
- Keep existing AppProvider from Shopify
- Test nested providers work correctly

### Files Changed:
- `app/routes/app.jsx` (add I18nProvider wrapper)

### Code Change Preview:
```javascript
// Before:
<AppProvider isEmbeddedApp apiKey={apiKey}>
  <Outlet />
</AppProvider>

// After:
<AppProvider isEmbeddedApp apiKey={apiKey}>
  <I18nProvider>
    <Outlet />
  </I18nProvider>
</AppProvider>
```

### Testing:
1. ✅ App runs without errors
2. ✅ Dashboard loads correctly
3. ✅ No console errors or warnings
4. ✅ i18n context is available (check React DevTools)
5. ✅ All existing functionality still works

### Success Criteria:
- App runs with i18n provider
- No visual changes (UI looks the same)
- No functionality broken
- i18n ready for use (but not used yet)

**Status:** Ready to implement  
**Risk Level:** Medium (modifies main app layout)

---

## Task 1.7: Create Test Translation Hook ⏱️ 20 minutes

### What We'll Do:
- Add ONE test translation in `app.cursors.jsx`
- Replace "Custom Cursor" page title with `t('cursors.page.title')`
- Verify translations work end-to-end
- Keep all other strings as-is (won't change yet)

### Files Changed:
- `app/routes/app.cursors.jsx` (ONE line changed as test)

### Code Change Preview:
```javascript
// Before:
export default function CursorsPage() {
  // ...
  return (
    <Page title="Custom Cursor">

// After:
import { useTranslation } from 'react-i18next';

export default function CursorsPage() {
  const { t } = useTranslation('cursors');
  // ...
  return (
    <Page title={t('page.title')}>
```

### Testing:
1. ✅ Page title displays "Custom Cursor" (from translation)
2. ✅ No console errors
3. ✅ Change translation in JSON to verify it updates
4. ✅ Verify fallback works (delete translation, should show key)
5. ✅ All other functionality still works

### Success Criteria:
- ONE translation working
- Proof of concept successful
- No side effects
- Ready to translate remaining strings

**Status:** Ready to implement  
**Risk Level:** Medium (first actual code change using i18n)

---

## 📊 Task Summary

| Task | Description | Time | Risk | Status |
|------|-------------|------|------|--------|
| 1.1 | Install Dependencies | 10 min | Low | Ready |
| 1.2 | Create Directories | 5 min | Zero | Ready |
| 1.3 | Create Config File | 20 min | Low | Ready |
| 1.4 | Create Translation Files | 30 min | Low | Ready |
| 1.5 | Create i18n Provider | 20 min | Medium | Ready |
| 1.6 | Update app.jsx | 15 min | Medium | Ready |
| 1.7 | Test Translation Hook | 20 min | Medium | Ready |
| **Total** | | **~2 hours** | | |

---

## 🎯 Testing Checklist (After Each Task)

After completing each task, verify:
- [ ] No build errors (`npm run dev` works)
- [ ] No console errors or warnings
- [ ] No ESLint errors
- [ ] App loads in browser
- [ ] Dashboard is accessible
- [ ] All existing features work
- [ ] No visual regressions

---

## 🚦 Stop Points

We'll pause and review after:
1. **Task 1.4** - Review translation files (you can edit/improve strings)
2. **Task 1.6** - Review integration (ensure app still works)
3. **Task 1.7** - Review proof of concept (ONE translation working)

---

## 🔄 Rollback Plan

If anything goes wrong:
- **Tasks 1.1-1.4:** Just delete files/folders (zero risk)
- **Task 1.5:** Delete `I18nProvider.jsx` (no impact)
- **Task 1.6-1.7:** Use git to revert changes to `app.jsx` and `app.cursors.jsx`

---

## ✅ Phase 1 Completion Criteria

At the end of Task 1.7:
- ✅ i18n infrastructure is set up
- ✅ English translations are documented
- ✅ ONE test translation is working
- ✅ App runs without errors
- ✅ Zero visual changes (except test translation)
- ✅ Ready for Phase 2 (extract all strings)

---

## 📝 What Happens Next (Phase 2 Preview)

Once Phase 1 is complete:
- **Phase 2:** Replace ALL remaining hardcoded strings (40-50 more)
- We'll do this in batches of 10 strings at a time
- Test after each batch
- No rush, we'll go step by step

---

## 🤔 Questions Before We Start?

1. Does this task breakdown look good?
2. Are you comfortable with the testing approach?
3. Any concerns about risk levels?
4. Want to adjust any task scope?

---

**Once you approve, I'll start with Task 1.1! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Status:** Awaiting Approval

