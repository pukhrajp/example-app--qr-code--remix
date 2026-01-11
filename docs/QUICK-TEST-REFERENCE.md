# Quick Test Reference Card - Phase 4 (Tasks 4.1 & 4.2)

## 🚀 Quick Start

**Both test files should be open in your browser!**

If not, run this in PowerShell:
```powershell
cd D:\shopify-store-apps\shopify-example-app-open-source\extensions\custom-cursor-extension\assets
start test-generator.html
start test-loader.html
```

---

## ✅ Quick Checklist

### Test File 1: `test-generator.html`
- [ ] Page loads without errors
- [ ] All 5 tests show "✅ PASSED"
- [ ] No console errors (F12 → Console)
- [ ] "Run All Tests" button works

**Expected: 5/5 tests passing**

---

### Test File 2: `test-loader.html`
- [ ] Click "✅ Test Valid Cursor" → Green status
- [ ] Click "🎨 Test Hover State" → Green status
- [ ] Click "❌ Test Disabled" → Green status
- [ ] Click "⚠️ Test Invalid Data" → Red status (expected)
- [ ] Click "🧹 Remove Cursor" → Blue status
- [ ] Console shows proper logging
- [ ] No JavaScript errors

**Expected: All 5 scenarios working**

---

## 🔍 Quick Console Tests

Open browser console (F12) and test:

### On test-generator.html:
```javascript
// Should return valid CSS
CustomCursorStyleGenerator.generateCursorCSS({
  isEnabled: true,
  cursor: { imageUrl: 'https://example.com/cursor.png', hotspotX: 0, hotspotY: 0, size: 100 }
});

// Should return null (security)
CustomCursorStyleGenerator.sanitizeURL("javascript:alert('XSS')");
```

### On test-loader.html:
```javascript
// Should return "1.0.0"
CustomCursorLoader.version

// Should be functions
typeof CustomCursorLoader.init
typeof CustomCursorLoader.load
typeof CustomCursorLoader.remove
```

---

## ✅ Success Indicators

### Visual:
- ✅ Green checkmarks on all tests
- ✅ Status updates correctly
- ✅ No red error messages (except in error test)

### Console (F12):
- ✅ `[Custom Cursor]` prefixed logs
- ✅ No uncaught errors
- ✅ Version: 1.0.0 logged

### DOM (F12 → Elements):
- ✅ `<style id="custom-cursor-styles">` appears when cursor loads
- ✅ Style tag contains CSS with cursor URLs
- ✅ Style tag removes when cursor disabled

---

## 📊 Quick Status

**Files Created:**
- ✅ cursor-style-generator.js (8.5 KB)
- ✅ cursor-loader.js (6.7 KB)
- ✅ test-generator.html (9.1 KB)
- ✅ test-loader.html (9.8 KB)

**Tests:**
- ✅ 5 CSS generator tests
- ✅ 5 integration tests
- ✅ 10/10 scenarios covered

**Status:** READY FOR REVIEW

---

## 🐛 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Tests don't run | Refresh page (Ctrl+F5) |
| Console errors | Check if files loaded in correct order |
| Style not appearing | Check DevTools → Elements for style tag |
| Mock API not working | Check for "[Mock API]" in console |

---

## 📝 Quick Report Template

```
✅ test-generator.html: [ PASS / FAIL ]
✅ test-loader.html: [ PASS / FAIL ]
✅ Console clean: [ YES / NO ]
✅ All scenarios work: [ YES / NO ]

Issues found: [describe any issues]

Status: [ READY / NEEDS FIX ]
```

---

## 🚀 When Ready

After testing is complete and all checks pass:

**Say: "proceed"** to start Task 4.3: Add Mobile Detection

---

**Need detailed testing instructions?** 
See: `docs/TESTING-GUIDE-PHASE4-TASKS-1-2.md`

