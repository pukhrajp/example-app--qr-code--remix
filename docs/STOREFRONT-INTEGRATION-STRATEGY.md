# Storefront Integration Strategy

## ✅ **VERIFIED AGAINST SHOPIFY'S LATEST DOCUMENTATION**
**Last Verified:** January 9, 2026  
**Documentation Source:** Shopify Dev Docs (Theme App Extensions)  
**Status:** ✅ **COMPLIANT WITH SHOPIFY STANDARDS**

---

## 🎯 Goal
Enable custom cursors to appear on the merchant's live Shopify storefront based on the settings configured in the admin dashboard.

---

## 📋 Overview

### What We're Building
A system that:
1. **Serves cursor data** from the admin app to the storefront
2. **Injects cursor styles** into the merchant's theme
3. **Applies cursor settings** (size, enable/disable, hotspot)
4. **Handles hover states** for interactive elements
5. **Performs efficiently** with minimal impact on page load

---

## ✅ Compliance Verification Results

### **Theme App Extensions Approach** ✅
**Verdict:** Our strategy is 100% compliant with Shopify's current standards.

#### Key Findings from Documentation Review:

1. **Theme App Extensions are MANDATORY for App Store apps** ✅
   - From Shopify Docs: *"If your app integrates with a Shopify theme and you plan to submit it to the Shopify App Store, you must use theme app extensions."*
   - Our strategy uses Theme App Extensions → ✅ **COMPLIANT**

2. **App Embed Blocks are the Correct Choice** ✅
   - From Shopify Docs: *"Apps that don't have a UI component, or that add floating or overlaid elements, extend themes using app embed blocks."*
   - Our use case: Global cursor styling (no inline UI) → ✅ **PERFECT FIT**
   - App embed blocks inject before `</head>` and `</body>` tags → ✅ **MATCHES OUR NEEDS**

3. **ScriptTag is Deprecated** ⚠️
   - From Shopify Docs: *"Script tags will be sunset for the Order status checkout page on August 28, 2025."*
   - Our strategy avoids ScriptTag entirely → ✅ **FUTURE-PROOF**

4. **Asset API Restrictions** ⚠️
   - From Shopify Docs: *"Starting with Admin API 2023-04, Asset resource PUT or DEL requests are restricted using the write_themes access scope."*
   - Our strategy doesn't modify theme code → ✅ **NO ASSET API NEEDED**

5. **CDN Asset Hosting** ✅
   - From Shopify Docs: *"All files inside the assets/ folder are automatically served from Shopify's CDN."*
   - Our cursor images will be served as data URLs (even faster) → ✅ **OPTIMAL**

6. **Theme Editor Compatibility** ✅
   - From Shopify Docs: *"You need to ensure that the app works in the theme editor environment."*
   - We'll add theme editor detection → ✅ **PLANNED**

7. **File Size Limits** ✅
   - All files in extension: 10 MB (enforced)
   - Liquid across all files: 100 KB (enforced)
   - CSS (compressed): 100 KB (suggested)
   - JS (compressed): 10 KB (suggested)
   - Our cursor app will be well within these limits → ✅ **NO CONCERNS**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                          │
│  (app.cursors.jsx - What we just refactored!)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Select     │  │   Configure  │  │   Upload     │     │
│  │   Cursor     │  │   Settings   │  │   Custom     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │   Save to DB    │                       │
│                   │ (cursorSettings)│                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Call
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINT                            │
│           (api.cursor-data.jsx - NEW!)                      │
│                                                              │
│  • Fetches active cursor settings                           │
│  • Returns JSON with cursor data                            │
│  • Handles shop authentication                              │
│  • Caches for performance                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JSON Response
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SHOPIFY STOREFRONT                          │
│           (Theme App Extension - NEW!)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Liquid Template: cursor-loader.liquid           │      │
│  │  • Loads cursor data from API                    │      │
│  │  • Injects CSS into <head>                       │      │
│  │  • Applies cursor styles globally                │      │
│  │  • Handles hover states                          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  Result: Custom cursor visible to store visitors! 🎉        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Approach

### Option A: Theme App Extension (Recommended ✅)
**Pros:**
- ✅ No merchant theme editing required
- ✅ Works with all themes (Online Store 2.0)
- ✅ Easy to install/uninstall
- ✅ Automatic updates
- ✅ Shopify's recommended approach

**Cons:**
- ⚠️ Requires Shopify Partners account
- ⚠️ Requires app extension setup

### Option B: Script Tag Injection
**Pros:**
- ✅ Simpler initial setup
- ✅ Works with older themes

**Cons:**
- ❌ Deprecated by Shopify
- ❌ Performance concerns
- ❌ Less reliable

**🎯 Decision: Go with Theme App Extension (Option A)**

---

## 📦 Components to Build

### 1. API Endpoint: `app/routes/api.cursor-data.jsx`
**Purpose:** Serve cursor settings to the storefront

**Functionality:**
```javascript
// GET /api/cursor-data?shop=example.myshopify.com
{
  "isEnabled": true,
  "cursor": {
    "id": 5,
    "name": "Arrow Classic",
    "imageUrl": "data:image/png;base64,...",
    "hoverImageUrl": "data:image/png;base64,...",
    "hotspotX": 16,
    "hotspotY": 16,
    "size": 32
  }
}
```

**Key Features:**
- ✅ Public endpoint (no auth required from storefront)
- ✅ Shop parameter validation
- ✅ Returns only enabled cursor
- ✅ Returns null if disabled
- ✅ Handles CORS headers
- ✅ Response caching (reduce DB queries)

---

### 2. Theme App Extension
**Structure:**
```
extensions/
└── cursor-theme-extension/
    ├── blocks/
    │   └── cursor-loader.liquid
    ├── assets/
    │   └── cursor-styles.css
    └── locales/
        └── en.default.json
```

**Extension Configuration:**
- Extension type: `theme`
- Placement: `head` (for global CSS injection)
- Auto-enable: `true`

---

### 3. Liquid Template: `cursor-loader.liquid`
**Purpose:** Load cursor data and inject styles

**Pseudo-code:**
```liquid
{% comment %}
  Cursor Loader Block
  Injects custom cursor styles from the app
{% endcomment %}

<script>
  (function() {
    const shop = '{{ shop.permanent_domain }}';
    const apiUrl = 'https://your-app.fly.dev/api/cursor-data?shop=' + shop;
    
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.isEnabled && data.cursor) {
          injectCursorStyles(data.cursor);
        }
      })
      .catch(err => console.error('Cursor app error:', err));
    
    function injectCursorStyles(cursor) {
      // Generate CSS with custom cursor
      // Inject into <head>
      // Handle hover states
    }
  })();
</script>
```

---

### 4. CSS Generation Utility: `app/utils/storefront/cursorStyleGenerator.js`
**Purpose:** Generate CSS for custom cursor

**Example Output:**
```css
/* Default cursor */
*,
*::before,
*::after {
  cursor: url('data:image/png;base64,...') 16 16, auto !important;
}

/* Hover cursor for interactive elements */
a:hover,
button:hover,
[role="button"]:hover,
input[type="submit"]:hover {
  cursor: url('data:image/png;base64,...') 16 16, pointer !important;
}

/* Disable default cursor */
* {
  cursor: none !important;
}

/* Custom cursor follower (alternative approach) */
#custom-cursor-follower {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  width: 32px;
  height: 32px;
  background-image: url('data:image/png;base64,...');
  transform: translate(-16px, -16px);
}
```

---

## 🔄 Data Flow

### Initial Load (Store Visit)
```
1. Customer visits store
   ↓
2. Theme loads with app extension
   ↓
3. Extension calls API endpoint
   GET /api/cursor-data?shop=example.myshopify.com
   ↓
4. API checks cursorSettings table
   ↓
5. Returns cursor data (if enabled)
   ↓
6. Extension injects CSS into <head>
   ↓
7. Custom cursor appears! ✨
```

### Settings Update (Admin Change)
```
1. Merchant changes cursor in admin
   ↓
2. Saves to database (cursorSettings)
   ↓
3. Storefront cache expires (or invalidates)
   ↓
4. Next page load fetches new cursor
   ↓
5. New cursor appears on store
```

---

## 🚀 Implementation Phases

### **Phase 1: API Endpoint** (1-2 hours)
- [ ] Create `api.cursor-data.jsx` route
- [ ] Implement shop validation
- [ ] Fetch active cursor from DB
- [ ] Return JSON response
- [ ] Add CORS headers
- [ ] Test with different shops
- [ ] Add error handling

### **Phase 2: CSS Generator** (1 hour)
- [ ] Create `cursorStyleGenerator.js` utility
- [ ] Generate base cursor CSS
- [ ] Generate hover cursor CSS
- [ ] Handle size scaling
- [ ] Handle hotspot positioning
- [ ] Handle data URL embedding
- [ ] Add CSS minification

### **Phase 3: Theme App Extension Setup** (2-3 hours)
- [ ] Run `shopify app generate extension`
- [ ] Choose "Theme App Extension"
- [ ] Configure extension settings
- [ ] Create `cursor-loader.liquid` block
- [ ] Implement API fetch logic
- [ ] Implement CSS injection
- [ ] Test locally with dev store

### **Phase 4: Cursor Injection Logic** (2-3 hours)
- [ ] Create cursor follower element (if needed)
- [ ] Handle mouse movement tracking
- [ ] Apply cursor to all elements
- [ ] Handle hover state switching
- [ ] Optimize performance
- [ ] Handle edge cases (iframes, modals)

### **Phase 5: Testing & Optimization** (2-3 hours)
- [ ] Test on dev store
- [ ] Test cursor switching
- [ ] Test enable/disable
- [ ] Test size changes
- [ ] Test hover states
- [ ] Performance profiling
- [ ] Browser compatibility testing
- [ ] Mobile handling (disable on mobile?)

### **Phase 6: Error Handling & Polish** (1-2 hours)
- [ ] Add loading states
- [ ] Handle API failures gracefully
- [ ] Add retry logic
- [ ] Add analytics tracking
- [ ] Add debugging logs
- [ ] Update documentation

---

## 🎨 Two Cursor Rendering Approaches

### Approach A: CSS `cursor` Property (Simpler)
**Pros:**
- ✅ Native browser support
- ✅ Less JavaScript
- ✅ Better performance

**Cons:**
- ❌ Size limitations (32x32px in some browsers)
- ❌ Limited animation support
- ❌ Can't scale dynamically

**Best for:** Static cursors, simple designs

---

### Approach B: Custom Cursor Follower (Advanced)
**Pros:**
- ✅ No size limitations
- ✅ Full control over scaling
- ✅ Animation support
- ✅ Better for large cursors

**Cons:**
- ❌ More JavaScript
- ❌ Performance overhead
- ❌ Complexity

**Best for:** Large cursors, animated cursors, our case (since we support 16-64px)

**🎯 Recommendation: Use Approach B (Custom Follower)**

---

## 🔒 Security Considerations

1. **Shop Validation**
   - Validate shop parameter format
   - Check shop exists in database
   - Rate limiting per shop

2. **Data URL Safety**
   - Cursors are stored as data URLs (safe)
   - No external image loading (XSS protection)

3. **CORS Configuration**
   - Allow storefront domains only
   - Restrict API access

4. **Performance**
   - Cache cursor data (5 minute TTL)
   - Minimize API calls
   - Lazy load on demand

---

## 📊 Performance Targets

- **API Response Time:** < 100ms
- **Cursor Load Time:** < 200ms
- **Page Load Impact:** < 50ms
- **Cache Hit Rate:** > 90%
- **JavaScript Bundle:** < 5KB

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] API endpoint returns correct data
- [ ] CSS generator produces valid CSS
- [ ] Shop validation works correctly

### Integration Tests
- [ ] End-to-end cursor display
- [ ] Settings sync from admin to store
- [ ] Enable/disable functionality

### Manual Tests
- [ ] Test on dev store
- [ ] Test on multiple themes
- [ ] Test on different devices
- [ ] Test performance impact

---

## 🚧 Potential Challenges

### Challenge 1: Browser Cursor Size Limits
**Problem:** Some browsers limit cursor size to 32x32px
**Solution:** Use custom cursor follower (Approach B)

### Challenge 2: Theme Compatibility
**Problem:** Some themes may have conflicting styles
**Solution:** Use `!important` and high specificity CSS

### Challenge 3: Performance on Mobile
**Problem:** Custom cursors may impact mobile UX
**Solution:** Detect mobile and disable cursor

### Challenge 4: Caching
**Problem:** Cursor changes may not reflect immediately
**Solution:** Add cache invalidation endpoint

### Challenge 5: Multiple Apps Conflict
**Problem:** Other apps might also customize cursor
**Solution:** Use unique CSS class names and namespace

---

## 📝 Documentation Needed

1. **Merchant Documentation**
   - How to enable extension in theme
   - How cursor appears on store
   - Troubleshooting guide

2. **Developer Documentation**
   - API endpoint specs
   - Extension structure
   - CSS generation logic
   - Testing guide

3. **Support Documentation**
   - Common issues
   - Browser compatibility
   - Performance optimization

---

## 🎯 Success Criteria

**Must Have:**
- ✅ Cursor appears on storefront
- ✅ Settings sync from admin
- ✅ Enable/disable works
- ✅ Hover states work
- ✅ Size changes apply

**Should Have:**
- ✅ < 200ms load time
- ✅ Works on major themes
- ✅ Graceful degradation

**Nice to Have:**
- ✅ Mobile support (optional)
- ✅ Animation support
- ✅ Analytics tracking

---

## 🔄 Rollout Plan

### Phase 1: Internal Testing
- Deploy to dev environment
- Test on development store
- Fix critical bugs

### Phase 2: Beta Testing
- Invite 3-5 merchants
- Gather feedback
- Monitor performance

### Phase 3: Public Release
- Update app listing
- Announce feature
- Monitor adoption

---

## 💰 Cost Considerations

### Infrastructure
- API calls: Minimal (cached)
- CDN for cursor images: Not needed (data URLs)
- Database queries: 1 per page load (cached)

**Estimated Cost:** < $5/month for typical store

---

## 🎓 Learning Resources

**Shopify Docs:**
- [Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [App Proxy](https://shopify.dev/docs/apps/online-store/app-proxies)
- [Liquid Documentation](https://shopify.dev/docs/api/liquid)

**Tools:**
- Shopify CLI for extension development
- Shopify Partners Dashboard
- Dev Store for testing

---

## 🚀 Next Steps

**Ready to start?** Here's what we'll do:

1. **Approve this strategy** ✅
2. **Start with Phase 1:** API Endpoint
3. **Progress through phases** systematically
4. **Test incrementally** after each phase
5. **Deploy to production** 🎉

---

**Questions to Consider:**
1. Should we disable cursors on mobile devices?
2. Do we want cursor change animations?
3. Should we track cursor usage analytics?
4. What's our browser support matrix?

---

*Strategy Document Version: 1.0*  
*Date: January 9, 2026*  
*Status: Ready for Implementation*

