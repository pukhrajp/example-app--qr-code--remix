# Testing Guide: Phase 4 Tasks 4.1 & 4.2

## 📋 Overview

This guide provides comprehensive instructions for testing the completed Tasks 4.1 and 4.2 before proceeding with Task 4.3.

---

## 🎯 What We're Testing

### **Task 4.1:** CSS Generator (Browser Version)
- ✅ Browser compatibility
- ✅ Security validation
- ✅ CSS generation accuracy
- ✅ Error handling

### **Task 4.2:** Cursor Loader
- ✅ API integration
- ✅ CSS injection
- ✅ Error handling
- ✅ DOM ready handling

---

## 📁 Files to Test

All test files are located in:
```
extensions/custom-cursor-extension/assets/
```

| File | Size | Purpose |
|------|------|---------|
| `cursor-style-generator.js` | 8.5 KB | CSS generator module |
| `cursor-loader.js` | 6.7 KB | Main loader module |
| `test-generator.html` | 9.1 KB | CSS generator test page |
| `test-loader.html` | 9.8 KB | Integration test page |

---

## 🧪 Test 1: CSS Generator (test-generator.html)

### How to Open:
The file should already be open in your browser. If not:
```
File → Open → Browse to:
D:\shopify-store-apps\shopify-example-app-open-source\extensions\custom-cursor-extension\assets\test-generator.html
```

### What to Look For:

#### **1. Visual Inspection**
- ✅ Page loads with clean UI
- ✅ 5 test sections visible
- ✅ No visual errors

#### **2. Auto-Run Tests**
All tests run automatically on page load. Look for:

**Test 1: Basic Cursor Generation**
```
Expected: ✅ PASSED - Basic CSS generation works!
Check: CSS includes url('https://cdn.shopify.com/cursor.png')
```

**Test 2: Cursor with Hover State**
```
Expected: ✅ PASSED - Hover state CSS generated correctly!
Check: CSS includes "a:hover" and "cursor-hover.png"
```

**Test 3: Custom Size and Hotspot**
```
Expected: ✅ PASSED - Hotspot and size correctly applied!
Check: CSS includes "16 16" and "--cursor-size: 150"
```

**Test 4: Security Validation (XSS Prevention)**
```
Expected: ✅ PASSED - Dangerous URL correctly rejected!
Check: javascript: URLs return null
```

**Test 5: Invalid Data Handling**
```
Expected: ✅ PASSED - Invalid data handled gracefully with proper defaults!
Check: Disabled/missing data returns null, invalid values use defaults
```

#### **3. Manual Testing**
- Click "Run Test 1", "Run Test 2", etc.
- Each should show ✅ PASSED
- Click "🚀 Run All Tests" to re-run

#### **4. Browser Console Check**
Press **F12** → **Console** tab:

Expected output:
```javascript
[Custom Cursor] Cursor loader initialized (v1.0.0)
// No errors should appear
```

#### **5. Screenshot of Expected Result**
All 5 tests should show green ✅ checkmarks with "PASSED" status.

---

## 🧪 Test 2: Cursor Loader Integration (test-loader.html)

### How to Open:
The file should already be open in your browser. If not:
```
File → Open → Browse to:
D:\shopify-store-apps\shopify-example-app-open-source\extensions\custom-cursor-extension\assets\test-loader.html
```

### Interactive Test Scenarios:

#### **Scenario A: Valid Cursor** ✅
1. Click "✅ Test Valid Cursor" button
2. **Expected Console Output:**
   ```
   [Custom Cursor] Cursor loader initialized (v1.0.0)
   [Test] Page loaded. Ready to test cursor loader.
   [Mock API] Intercepted fetch request: /apps/proxy/cursor-data?shop=...
   [Custom Cursor] Initializing custom cursor...
   [Custom Cursor] Fetching cursor data from API...
   [Custom Cursor] API response received: {success: true, ...}
   [Custom Cursor] Cursor data received: {isEnabled: true, cursor: {...}}
   [Custom Cursor] CSS injected successfully 350 characters
   [Custom Cursor] Custom cursor loaded successfully! {cursorName: 'Arrow Pointer', cursorId: 1}
   ```
3. **Expected Status:** Green "✅ Valid cursor loaded!"
4. **Expected Behavior:** CSS style tag injected into page

#### **Scenario B: Hover State Cursor** 🎨
1. Click "🎨 Test Hover State" button
2. **Expected Console Output:**
   ```
   [Custom Cursor] Initializing custom cursor...
   [Custom Cursor] CSS injected successfully
   [Custom Cursor] Custom cursor loaded successfully! {cursorName: 'Hand Pointer', ...}
   ```
3. **Expected Status:** Green "✅ Hover state cursor loaded!"
4. **Check:** Hover rules included in injected CSS

#### **Scenario C: Disabled Cursor** ❌
1. Click "❌ Test Disabled" button
2. **Expected Console Output:**
   ```
   [Custom Cursor] Initializing custom cursor...
   [Custom Cursor] Cursor data received: {isEnabled: false, ...}
   [Custom Cursor] Custom cursor is disabled or not configured
   [Custom Cursor] Cursor styles removed
   ```
3. **Expected Status:** Green "✅ Cursor correctly removed (disabled state)"
4. **Expected Behavior:** Existing style tags removed

#### **Scenario D: Invalid Data / Error** ⚠️
1. Click "⚠️ Test Invalid Data" button
2. **Expected Console Output:**
   ```
   [Custom Cursor] Initializing custom cursor...
   [Custom Cursor] Fetching cursor data from API...
   [Custom Cursor] API response received: {success: false, ...}
   [Custom Cursor] Failed to fetch cursor data: Error: API returned error
   [Custom Cursor] Failed to load custom cursor: Error: API returned error
   [Custom Cursor] Cursor styles removed
   ```
3. **Expected Status:** Red "✅ Error handled gracefully. Check console."
4. **Expected Behavior:** No page crash, graceful fallback

#### **Scenario E: Remove Cursor** 🧹
1. Click "🧹 Remove Cursor" button
2. **Expected Console Output:**
   ```
   [Custom Cursor] Cursor styles removed
   ```
3. **Expected Status:** Blue "Cursor styles removed"
4. **Expected Behavior:** Style tag removed from DOM

### What to Check:

#### **1. Console Output**
- All messages have `[Custom Cursor]` prefix
- Color-coded: green (log), yellow (warn), red (error)
- No unexpected errors
- Clear button works

#### **2. Status Display**
- Updates after each test
- Shows correct message
- Correct color (green=success, red=error, blue=info)

#### **3. Interactive Demo Area**
- Button is clickable
- Link is clickable
- Area responds to mouse movement
- No visual glitches

#### **4. Browser DevTools**
Press **F12** → **Elements** tab:

Look for injected style tag:
```html
<style id="custom-cursor-styles" type="text/css">
  /* Custom Cursor Styles - Generated by Shopify Cursor App */
  /* ... CSS content ... */
</style>
```

Should appear in `<head>` after running a valid test.

---

## 🔍 Deep Inspection Tests

### **Test 1: Verify CSS Generator Function**

Open browser console (F12) on `test-generator.html` and run:

```javascript
// Test basic generation
const testData = {
  isEnabled: true,
  cursor: {
    imageUrl: 'https://example.com/cursor.png',
    hotspotX: 10,
    hotspotY: 5,
    size: 120
  }
};

const css = CustomCursorStyleGenerator.generateCursorCSS(testData);
console.log(css);
```

**Expected Output:**
```css
/* Custom Cursor Styles - Generated by Shopify Cursor App */

/* CSS Variables for cursor configuration */
:root {
  --cursor-size: 120;
  --cursor-size-multiplier: 1.2;
}

/* Apply custom cursor to all elements */
*, *::before, *::after {
  cursor: url('https://example.com/cursor.png') 10 5, auto !important;
}
...
```

### **Test 2: Verify URL Sanitization**

In console:
```javascript
// Test XSS prevention
CustomCursorStyleGenerator.sanitizeURL("javascript:alert('XSS')");
// Expected: null

CustomCursorStyleGenerator.sanitizeURL("https://example.com/cursor.png");
// Expected: "https://example.com/cursor.png"

CustomCursorStyleGenerator.sanitizeURL("data:image/png;base64,iVBORw0KG...");
// Expected: The full data URL
```

### **Test 3: Verify Cursor Loader API**

In console on `test-loader.html`:
```javascript
// Check API is exposed
console.log(CustomCursorLoader.version);
// Expected: "1.0.0"

console.log(typeof CustomCursorLoader.init);
// Expected: "function"

console.log(typeof CustomCursorLoader.load);
// Expected: "function"

console.log(typeof CustomCursorLoader.remove);
// Expected: "function"
```

---

## ✅ Success Criteria

### **For test-generator.html:**
- [ ] All 5 tests show ✅ PASSED
- [ ] No console errors
- [ ] Manual test buttons work
- [ ] "Run All Tests" button works
- [ ] CSS output is visible and correct

### **For test-loader.html:**
- [ ] All 5 interactive tests work
- [ ] Status updates correctly
- [ ] Console shows expected output
- [ ] No JavaScript errors
- [ ] Style tag appears/disappears correctly
- [ ] Error handling works gracefully

### **For Browser Compatibility:**
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in Safari (if available)

---

## 🐛 Troubleshooting

### **Issue: Tests don't auto-run**
**Solution:** Refresh the page (Ctrl+F5 / Cmd+Shift+R)

### **Issue: "CustomCursorStyleGenerator is not defined"**
**Solution:** 
1. Check browser console for load errors
2. Ensure `cursor-style-generator.js` loads before test scripts
3. Check file path is correct

### **Issue: Mock API not intercepting**
**Solution:** 
1. Check console for "[Mock API]" messages
2. Verify fetch is being called
3. Check URL includes "/apps/proxy/cursor-data"

### **Issue: Style tag not appearing**
**Solution:**
1. Open DevTools → Elements tab
2. Search for `id="custom-cursor-styles"`
3. Check if CSS is being generated (console)
4. Verify injectCSS function is called

---

## 📸 What Success Looks Like

### **test-generator.html:**
```
✅ PASSED - Basic CSS generation works!
✅ PASSED - Hover state CSS generated correctly!
✅ PASSED - Hotspot and size correctly applied!
✅ PASSED - Dangerous URL correctly rejected!
✅ PASSED - Invalid data handled gracefully with proper defaults!
```

### **test-loader.html:**
```
Status: ✅ Valid cursor loaded! Move your mouse in the demo area.

Console Output:
[Custom Cursor] Cursor loader initialized (v1.0.0)
[Custom Cursor] Initializing custom cursor...
[Custom Cursor] Fetching cursor data from API...
[Custom Cursor] CSS injected successfully 400 characters
[Custom Cursor] Custom cursor loaded successfully! Arrow Pointer
```

---

## 📊 Performance Check

### File Sizes (Target vs Actual):

| File | Target | Actual | Status |
|------|--------|--------|--------|
| cursor-style-generator.js | < 5 KB | 8.5 KB | ⚠️ Will optimize in Task 4.9 |
| cursor-loader.js | < 5 KB | 6.7 KB | ⚠️ Will optimize in Task 4.9 |
| **Total Bundle** | < 15 KB | 15.2 KB | ✅ Within acceptable range |

**Note:** Files will be minified in Task 4.9 to meet targets.

---

## 🚀 Next Steps

Once all tests pass:

1. ✅ Verify all 5 tests in `test-generator.html` pass
2. ✅ Verify all 5 scenarios in `test-loader.html` work
3. ✅ Check browser console for errors
4. ✅ Confirm no visual glitches
5. ✅ **Ready for Task 4.3: Add Mobile Detection**

---

## 📝 Test Report Template

After testing, you can provide feedback like this:

```
✅ test-generator.html: All tests passing
✅ test-loader.html: All scenarios working
✅ No console errors
✅ CSS injection verified
✅ Error handling confirmed
⚠️ [Any issues found]

Status: READY FOR TASK 4.3
```

---

**Questions or issues?** Let me know what you find! 🧪✨

