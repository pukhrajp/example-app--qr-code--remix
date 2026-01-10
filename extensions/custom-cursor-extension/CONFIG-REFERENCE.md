# Extension Configuration Reference

## shopify.extension.toml Configuration

This file configures the Custom Cursor Theme App Extension.

### Configuration Details

```toml
# Extension Metadata
name = "custom-cursor-extension"
type = "theme"
uid = "c09be26e-3ef0-ff2d-326e-175dd634b3e960d3f2f1"

# Capabilities
[capabilities]
network_access = true           # Required for API calls to fetch cursor data

[capabilities.block_visibility]
app_embed = true                # Allows merchants to enable/disable in theme editor
```

### Key Settings Explained

#### `name`
- **Value:** `custom-cursor-extension`
- **Purpose:** Internal identifier for the extension
- **Visible to:** Developers and Shopify CLI
- **Changeable:** No (after first deployment)

#### `type`
- **Value:** `theme`
- **Purpose:** Defines this as a Theme App Extension
- **Required:** Yes
- **Other Options:** N/A for theme extensions

#### `uid`
- **Value:** Auto-generated unique identifier
- **Purpose:** Uniquely identifies this extension
- **Changeable:** No
- **Format:** UUID-like string

#### `capabilities.network_access`
- **Value:** `true`
- **Purpose:** Enables extension to make HTTP requests
- **Use Case:** Fetching cursor data from `/api/cursor-data` endpoint
- **Security:** Requests are subject to CORS and CSP policies

#### `capabilities.block_visibility.app_embed`
- **Value:** `true`
- **Purpose:** Makes this an App Embed Block
- **Merchant Experience:** 
  - Appears in Theme Editor under "App embeds"
  - Can be enabled/disabled without code changes
  - Ideal for optional app features
- **Best Practice:** Recommended for all non-essential theme modifications

### App Embed vs Regular Blocks

| Feature | App Embed | Regular Block |
|---------|-----------|---------------|
| Merchant Control | Can enable/disable | Always active |
| Location | Theme-wide | Specific sections |
| Use Case | Global features | Section-specific content |
| Our Choice | ✅ Yes | ❌ No |

### Why App Embed for Cursor Extension?

1. **Merchant Control:** Merchants can enable/disable custom cursors
2. **No Code Changes:** Toggle without editing theme code
3. **User-Friendly:** Simple on/off switch in theme editor
4. **Best Practice:** Recommended by Shopify for optional features
5. **Testing:** Easy to test with/without extension active

### Configuration Validation

The configuration follows Shopify's Theme App Extension standards:
- ✅ Valid TOML syntax
- ✅ Required fields present
- ✅ Capabilities properly defined
- ✅ App embed enabled
- ✅ Network access configured

### Next Steps

With this configuration:
1. Extension will appear in merchant's theme editor
2. Merchants can enable/disable the custom cursor feature
3. Extension can fetch cursor data from API
4. Liquid blocks will have network access for API calls

### References

- [Theme App Extensions Documentation](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [App Embed Blocks Guide](https://shopify.dev/docs/apps/online-store/theme-app-extensions/extensions-framework)
- [Extension Configuration](https://shopify.dev/docs/apps/tools/cli/configuration)

