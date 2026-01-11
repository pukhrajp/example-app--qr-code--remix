# Phase 4: Cursor Injection (Liquid & JavaScript) - Task Breakdown

## Overview
Implement the JavaScript functionality for the Theme App Extension to load custom cursors on merchant storefronts with full feature support from Phase 2's CSS generator.

---

## 📋 **Phase 4 Tasks**

### **Task 4.1: Port CSS Generator to Extension Assets**
**Goal:** Copy and adapt the CSS generator from Phase 2 for browser use

**Actions:**
- Copy `cursorStyleGenerator.js` from `app/utils/storefront/`
- Adapt for browser environment (remove Node.js specific code)
- Update export format for browser modules
- Test in browser console
- Verify all functions work

**Testable:** Generator functions work in browser  
**Verifiable:** Can generate CSS from sample cursor data

---

### **Task 4.2: Implement Basic Cursor Loader**
**Goal:** Create main JavaScript file that fetches and applies cursors

**Actions:**
- Replace placeholder in `cursor-loader.js`
- Implement API data fetching
- Import CSS generator
- Basic CSS injection
- Error handling
- Console logging for debugging

**Testable:** API call works and CSS is injected  
**Verifiable:** Cursor appears on test page

---

### **Task 4.3: Add Mobile Detection**
**Goal:** Enhance mobile device detection

**Actions:**
- Implement robust mobile detection
- Check for touch capability
- Handle tablet detection
- Respect merchant settings
- Early exit on mobile if disabled

**Testable:** Correctly identifies mobile devices  
**Verifiable:** Cursor disabled on mobile when setting is on

---

### **Task 4.4: Update Liquid Block to Use External JS**
**Goal:** Replace inline JavaScript with external file references

**Actions:**
- Update `cursor-loader.liquid`
- Reference external `cursor-loader.js`
- Use Liquid asset filters
- Remove inline script
- Keep settings integration
- Test with `shopify app dev`

**Testable:** Extension loads external JS correctly  
**Verifiable:** Cursor still works after change

---

### **Task 4.5: Add Caching and Performance Optimization**
**Goal:** Optimize performance with caching

**Actions:**
- Cache API responses (localStorage)
- Add cache expiration
- Debounce/throttle if needed
- Minimize DOM operations
- Add loading states

**Testable:** API called only when cache expires  
**Verifiable:** Performance metrics improved

---

### **Task 4.6: Implement Error Handling and Recovery**
**Goal:** Robust error handling for production

**Actions:**
- Comprehensive try-catch blocks
- Network error handling
- API error responses
- Fallback to default cursor
- User-friendly error messages
- Retry logic

**Testable:** Handles all error scenarios gracefully  
**Verifiable:** No console errors in failure cases

---

### **Task 4.7: Add Cursor Follower Element (Optional)**
**Goal:** Create custom cursor element for size scaling

**Actions:**
- Create cursor follower DOM element
- Follow mouse position
- Apply size scaling (CSS variables)
- Smooth animations
- Hide default cursor
- Performance optimize with RAF

**Testable:** Cursor follows mouse smoothly  
**Verifiable:** Size scaling works correctly

---

### **Task 4.8: Test Extension Build and Preview**
**Goal:** Verify extension works end-to-end

**Actions:**
- Run `shopify app build`
- Test with `shopify app dev`
- Preview in development store
- Test all cursor types
- Test all settings
- Verify mobile behavior

**Testable:** Extension builds and runs  
**Verifiable:** All features work in preview

---

### **Task 4.9: Optimize and Minify Assets**
**Goal:** Prepare JavaScript for production

**Actions:**
- Review code for optimization
- Add comments and documentation
- Consider minification strategy
- Check file sizes vs budget
- Test minified version

**Testable:** Code is optimized  
**Verifiable:** Meets performance budgets

---

### **Task 4.10: Update Documentation**
**Goal:** Document Phase 4 implementation

**Actions:**
- Update THEME-EXTENSION-DOCUMENTATION.md
- Document JavaScript implementation
- Add API usage examples
- Update troubleshooting section
- Add Phase 4 changelog

**Testable:** Documentation complete  
**Verifiable:** All functions documented

---

### **Task 4.11: Commit & Push Phase 4**
**Goal:** Save Phase 4 progress to repository

**Actions:**
- Stage all changes
- Create detailed commit message
- Push to remote
- Update project documentation

**Testable:** Commit successful  
**Verifiable:** Changes pushed to GitHub

---

## 📊 **Estimated Tasks:** 11 focused tasks

Each task is:
- ✅ Small and independently completable
- ✅ Testable with clear verification steps
- ✅ Follows Shopify and React best practices
- ✅ Requires approval before next task

---

## 🎯 **Success Criteria for Phase 4:**

1. ✅ CSS generator ported and working in browser
2. ✅ Cursor loader fetches and applies cursor data
3. ✅ Mobile detection working correctly
4. ✅ Liquid block uses external JavaScript files
5. ✅ Performance optimized with caching
6. ✅ Comprehensive error handling
7. ✅ Extension builds and previews successfully
8. ✅ All features tested end-to-end
9. ✅ Assets optimized for production
10. ✅ Documentation updated
11. ✅ All changes committed and pushed

---

## 🔧 **Key Technologies:**

- **JavaScript ES6+** - Modern browser JavaScript
- **Fetch API** - API data fetching
- **CSS Injection** - Dynamic style application
- **Liquid Filters** - Asset URL generation
- **LocalStorage** - Client-side caching
- **RequestAnimationFrame** - Smooth animations (if cursor follower)

---

## 📝 **Notes:**

- Task 4.7 (Cursor Follower) is optional based on testing
- May decide to skip if native cursor works well enough
- Focus on performance and user experience
- Test thoroughly on different browsers
- Ensure mobile experience is good

---

**Ready to proceed?** Phase 4 will bring the extension to life with full JavaScript implementation!

