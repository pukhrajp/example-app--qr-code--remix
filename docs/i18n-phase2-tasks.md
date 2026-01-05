# Phase 2: Replace All Hardcoded Strings - Task Breakdown

## 📋 Overview
Replace all remaining hardcoded strings in `app.cursors.jsx` with translation keys.

**Total Estimated Time:** 4-5 hours  
**Number of Tasks:** 6 batches (10 strings each)  
**File to Update:** `app/routes/app.cursors.jsx`

---

## Task 2.1: Translate Error & Warning Banners ⏱️ 30 minutes

### Strings to Replace (6 strings):
1. Error banner title: "Error"
2. Error banner default message
3. Disabled banner title
4. Disabled banner description
5. Disabled banner action button: "Enable cursor"
6. (Already done in Task 1.7: Page title)

### Locations:
- Lines ~326-350 in `app.cursors.jsx`
- Error banner section
- Disabled banner section

### Translation Keys:
- `cursors.banner.error.title`
- `cursors.banner.error.default`
- `cursors.banner.disabled.title`
- `cursors.banner.disabled.description`
- `cursors.banner.disabled.action`

### Testing:
- ✅ Error banner displays correctly
- ✅ Disabled banner displays correctly
- ✅ Action button text correct
- ✅ No console errors

**Status:** Ready to implement  
**Risk Level:** Low

---

## Task 2.2: Translate Action Buttons ⏱️ 30 minutes

### Strings to Replace (4 strings):
1. "Save & Publish" button
2. "Reset to default" button
3. "Enable" button text
4. "Disable" button text

### Locations:
- Lines ~380-400 (bottom action buttons)
- Lines ~700-720 (settings card toggle button)

### Translation Keys:
- `cursors.buttons.save`
- `cursors.buttons.reset`
- `cursors.buttons.enable`
- `cursors.buttons.disable`

### Testing:
- ✅ All buttons display correct text
- ✅ Buttons still functional
- ✅ No layout issues

**Status:** Pending  
**Risk Level:** Low

---

## Task 2.3: Translate Preview Panel ⏱️ 45 minutes

### Strings to Replace (9 strings):
1. Preview card title: "Cursor Preview"
2. Empty state heading: "Select a cursor from the gallery"
3. Empty state description: "Click any cursor on the left..."
4. Preview instructions: "✨ Hover over this area..."
5. Current size text (with variables)
6. Preview region ARIA label (with variables)
7. Empty preview ARIA label
8. Category badge text (need formatCategoryName function)

### Locations:
- Lines ~660-850 (PreviewPanel component)
- Lines ~755-890 (PreviewBox component)

### Translation Keys:
- `cursors.preview.title`
- `cursors.preview.empty.heading`
- `cursors.preview.empty.description`
- `cursors.preview.instructions`
- `cursors.preview.currentSize`
- `cursors.aria.previewRegion`
- `cursors.aria.previewEmpty`
- `cursors.categories.*`

### Testing:
- ✅ Preview panel displays correctly
- ✅ Empty state shows correct text
- ✅ Variables (size, percentage) interpolate correctly
- ✅ ARIA labels working
- ✅ Category names translated

**Status:** Pending  
**Risk Level:** Medium (variable interpolation)

---

## Task 2.4: Translate Settings Panel ⏱️ 45 minutes

### Strings to Replace (8 strings):
1. "Cursor Settings" title
2. "App Status" label
3. Enabled status description
4. Disabled status description
5. "Cursor Size" label
6. Size help text
7. Size ARIA labels
8. Range slider label

### Locations:
- Lines ~695-750 (Settings card in PreviewPanel)

### Translation Keys:
- `cursors.settings.title`
- `cursors.settings.appStatus.label`
- `cursors.settings.appStatus.enabled`
- `cursors.settings.appStatus.disabled`
- `cursors.settings.size.label`
- `cursors.settings.size.help`
- `cursors.settings.size.current`

### Testing:
- ✅ Settings panel displays correctly
- ✅ All labels and help text correct
- ✅ Variable interpolation working (size values)
- ✅ ARIA labels working

**Status:** Pending  
**Risk Level:** Low

---

## Task 2.5: Translate Gallery & Tabs ⏱️ 45 minutes

### Strings to Replace (8 strings):
1. Tab: "Cursor gallery"
2. Tab: "Upload your own"
3. Empty gallery title: "No cursors uploaded yet"
4. Empty gallery description
5. Upload empty title
6. Upload empty description
7. Selected badge: "Selected"
8. Category names (7 categories)

### Locations:
- Lines ~410-450 (CursorGalleryPanel - tabs)
- Lines ~453-480 (GalleryTabContent - empty states)
- Lines ~550-570 (CursorCard - badge)
- Lines ~490-520 (CursorCategorySection - category names)

### Translation Keys:
- `cursors.tabs.gallery`
- `cursors.tabs.upload`
- `cursors.empty.gallery.title`
- `cursors.empty.gallery.description`
- `cursors.empty.upload.title`
- `cursors.empty.upload.description`
- `cursors.categories.*` (7 categories)

### Testing:
- ✅ Tabs display correct text
- ✅ Empty states show correct messages
- ✅ Selected badge displays
- ✅ Category names properly formatted

**Status:** Pending  
**Risk Level:** Low

---

## Task 2.6: Translate ARIA Labels & Accessibility ⏱️ 30 minutes

### Strings to Replace (6 strings):
1. Save button ARIA label (with variables)
2. Reset button ARIA label
3. Select cursor ARIA label (with variables)
4. Cursor card ARIA label (with variables)
5. Range slider ARIA label
6. Toggle button ARIA label

### Locations:
- Lines ~380-400 (Action buttons)
- Lines ~530-570 (CursorCard component)
- Lines ~730-745 (Range slider)
- Lines ~700-715 (Toggle button)

### Translation Keys:
- `cursors.aria.saveButton`
- `cursors.aria.resetButton`
- `cursors.aria.selectCursor`

### Testing:
- ✅ All ARIA labels working
- ✅ Screen reader friendly
- ✅ Variable interpolation correct
- ✅ Accessibility not broken

**Status:** Pending  
**Risk Level:** Low

---

## Task 2.7: Translate Toast Notifications ⏱️ 20 minutes

### Strings to Replace (5 strings):
1. Success toast: "Cursor published successfully"
2. Reset toast: "Cursor reset to default"
3. Error toast message
4. Enable success toast
5. Disable success toast

### Locations:
- Lines ~205-220 (Toast notification effect)
- Backend action handler (returns messages)

### Translation Keys:
- `cursors.toast.success`
- `cursors.toast.reset`
- `cursors.toast.error`
- `cursors.toast.enableSuccess`
- `cursors.toast.disableSuccess`

### Testing:
- ✅ Toast messages display correctly
- ✅ All actions show appropriate toasts
- ✅ No console errors

**Status:** Pending  
**Risk Level:** Low

---

## Task 2.8: Translate Action Handler Messages ⏱️ 20 minutes

### Strings to Replace (4 strings):
1. "Cursor published successfully"
2. "Cursor reset to default"
3. "Invalid action"
4. Error messages from action handler

### Locations:
- Lines ~95-210 (action function)
- Error messages in try-catch blocks

### Translation Keys:
- Use `errors` namespace
- `errors.sizeRange`
- `errors.notFound`
- `errors.saveFailed`
- `errors.invalidAction`

### Testing:
- ✅ Action responses correct
- ✅ Error messages display properly
- ✅ Toast notifications work

**Status:** Pending  
**Risk Level:** Low

---

## 📊 Task Summary

| Task | Description | Strings | Time | Risk |
|------|-------------|---------|------|------|
| 2.1 | Error & Warning Banners | 6 | 30 min | Low |
| 2.2 | Action Buttons | 4 | 30 min | Low |
| 2.3 | Preview Panel | 9 | 45 min | Medium |
| 2.4 | Settings Panel | 8 | 45 min | Low |
| 2.5 | Gallery & Tabs | 8 | 45 min | Low |
| 2.6 | ARIA Labels | 6 | 30 min | Low |
| 2.7 | Toast Notifications | 5 | 20 min | Low |
| 2.8 | Action Handler | 4 | 20 min | Low |
| **Total** | | **50** | **~4.5 hours** | |

---

## 🧪 Testing Checklist (After Each Task)

After completing each task, verify:
- [ ] Translations display correctly
- [ ] No hardcoded strings remain in that section
- [ ] Variables interpolate properly ({{size}}, {{name}}, etc.)
- [ ] No console errors or warnings
- [ ] No layout issues
- [ ] All functionality still works
- [ ] ARIA labels working (for accessibility tasks)

---

## 🚦 Stop Points for Review

We'll pause and get your approval after each task:
1. After Task 2.1 - Review banner translations
2. After Task 2.2 - Review button translations
3. After Task 2.3 - Review preview panel
4. After Task 2.4 - Review settings panel
5. After Task 2.5 - Review gallery/tabs
6. After Task 2.6 - Review ARIA labels
7. After Task 2.7 - Review toasts
8. After Task 2.8 - Review action messages

---

## ✅ Phase 2 Completion Criteria

At the end of Task 2.8:
- ✅ ZERO hardcoded strings in `app.cursors.jsx`
- ✅ All UI text translatable
- ✅ All variables properly interpolated
- ✅ All ARIA labels translated
- ✅ All toast messages translated
- ✅ App fully functional
- ✅ Ready for Phase 3 (add French translations)

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2025  
**Status:** Awaiting Task 2.1 Approval

