/**
 * Cursor Style Generator
 * 
 * Utility for generating CSS styles for custom cursors to be injected
 * into Shopify storefronts via Theme App Extensions.
 * 
 * This module generates optimized CSS that:
 * - Applies custom cursor images to the storefront
 * - Handles cursor hotspot positioning
 * - Supports cursor size scaling
 * - Manages hover states for interactive elements
 * - Provides fallbacks for unsupported scenarios
 * 
 * @module cursorStyleGenerator
 */

/**
 * Validates and sanitizes a URL for use in CSS
 * Prevents CSS injection attacks and ensures URL is safe
 * 
 * @param {string} url - URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Trim whitespace
  url = url.trim();

  // Check for empty string
  if (url.length === 0) {
    return null;
  }

  // Allow only http, https, and data URLs
  const allowedProtocols = /^(https?:\/\/|data:image\/)/i;
  if (!allowedProtocols.test(url)) {
    return null;
  }

  // Check for dangerous patterns that could break out of CSS url()
  // We're specifically looking for unescaped quotes and closing parentheses
  const dangerousPatterns = /['"\)]/;
  
  // For data URLs, only check the part before the base64 data
  if (url.startsWith('data:')) {
    const commaIndex = url.indexOf(',');
    if (commaIndex > -1) {
      const dataPrefix = url.substring(0, commaIndex + 1);
      if (dangerousPatterns.test(dataPrefix)) {
        return null;
      }
    }
  } else {
    // For regular URLs, check for dangerous chars that could break CSS
    if (dangerousPatterns.test(url)) {
      return null;
    }
  }

  // Additional security: prevent javascript: protocol (case-insensitive)
  if (/javascript:/i.test(url)) {
    return null;
  }

  return url;
}

/**
 * Validates and clamps hotspot coordinate
 * Ensures coordinate is a safe number within reasonable bounds
 * 
 * @param {number} value - Coordinate value
 * @param {number} defaultValue - Default value if invalid
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Validated and clamped coordinate
 */
function validateHotspot(value, defaultValue = 0, min = 0, max = 128) {
  // Check if value is a number
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }

  // Clamp to reasonable bounds (cursors shouldn't be larger than 128x128 px)
  return Math.max(min, Math.min(max, Math.floor(value)));
}

/**
 * Validates cursor size parameter
 * Ensures size is within reasonable bounds
 * 
 * @param {number} size - Size percentage
 * @returns {number} Validated size between 25 and 300
 */
function validateSize(size) {
  // Check if size is a valid number
  if (typeof size !== 'number' || isNaN(size) || !isFinite(size) || size <= 0) {
    return 100; // Default to 100%
  }

  // Clamp between 25% and 300% for reasonable limits
  return Math.max(25, Math.min(300, Math.floor(size)));
}

/**
 * Generates CSS styles for custom cursors
 * 
 * Takes cursor data from the API endpoint and generates CSS code
 * that can be injected into a Shopify storefront theme.
 * 
 * @param {Object} cursorData - Cursor configuration data
 * @param {boolean} cursorData.isEnabled - Whether cursor is enabled
 * @param {Object|null} cursorData.cursor - Cursor details
 * @param {number} cursorData.cursor.id - Cursor ID
 * @param {string} cursorData.cursor.name - Cursor name
 * @param {string} cursorData.cursor.imageUrl - Default cursor image URL
 * @param {string} cursorData.cursor.hoverImageUrl - Hover state cursor image URL
 * @param {number} cursorData.cursor.hotspotX - X coordinate of cursor hotspot
 * @param {number} cursorData.cursor.hotspotY - Y coordinate of cursor hotspot
 * @param {number} cursorData.cursor.size - Cursor size (percentage, 100 = normal)
 * 
 * @returns {string|null} Generated CSS string, or null if cursor is disabled/invalid
 * 
 * @example
 * const cursorData = {
 *   isEnabled: true,
 *   cursor: {
 *     id: 1,
 *     name: "Arrow Pointer",
 *     imageUrl: "https://example.com/cursor.png",
 *     hoverImageUrl: "https://example.com/cursor-hover.png",
 *     hotspotX: 0,
 *     hotspotY: 0,
 *     size: 100
 *   }
 * };
 * 
 * const css = generateCursorCSS(cursorData);
 * // Returns: CSS string ready for injection
 */
export function generateCursorCSS(cursorData) {
  // Early return if cursor is disabled or not provided
  if (!cursorData || !cursorData.isEnabled) {
    return null;
  }

  // Early return if cursor data is missing
  if (!cursorData.cursor || !cursorData.cursor.imageUrl) {
    return null;
  }

  const { imageUrl, hoverImageUrl, hotspotX, hotspotY, size } = cursorData.cursor;

  // Sanitize and validate imageUrl
  const sanitizedImageUrl = sanitizeURL(imageUrl);
  if (!sanitizedImageUrl) {
    console.warn('Invalid or unsafe imageUrl provided:', imageUrl);
    return null;
  }

  // Sanitize and validate hoverImageUrl (optional)
  const sanitizedHoverImageUrl = hoverImageUrl ? sanitizeURL(hoverImageUrl) : null;

  // Validate hotspot coordinates with reasonable bounds
  const hsX = validateHotspot(hotspotX, 0, 0, 128);
  const hsY = validateHotspot(hotspotY, 0, 0, 128);

  // Validate cursor size (25% - 300%)
  const cursorSize = validateSize(size);
  
  // Calculate size multiplier for scaling (e.g., 150% = 1.5x)
  const sizeMultiplier = cursorSize / 100;

  // Build cursor CSS value with hotspot coordinates
  // Format: cursor: url('image.png') X Y, auto;
  const cursorValue = `url('${sanitizedImageUrl}') ${hsX} ${hsY}, auto`;

  // Build hover cursor value if hoverImageUrl is provided and valid
  const hasHoverCursor = sanitizedHoverImageUrl !== null;
  const hoverCursorValue = hasHoverCursor 
    ? `url('${sanitizedHoverImageUrl}') ${hsX} ${hsY}, auto`
    : cursorValue; // Fallback to default cursor if no hover image

  // Generate CSS with cursor URL, hotspot positioning, and size variables
  // Apply to body and all elements for comprehensive coverage
  // 
  // Note: Native CSS cursor property doesn't support scaling.
  // The --cursor-size variable is provided for custom JavaScript implementations
  // that might create a cursor follower element for enhanced cursor effects.
  
  // Build hover state CSS rules if hover cursor is available
  const hoverStateCSS = hasHoverCursor ? `

/* Hover state cursor for interactive elements */
a:hover,
button:hover,
[role="button"]:hover,
input[type="submit"]:hover,
input[type="button"]:hover,
select:hover,
.button:hover,
.btn:hover,
[data-clickable]:hover {
  cursor: ${hoverCursorValue} !important;
}` : '';

  const css = `
/* Custom Cursor Styles - Generated by Shopify Cursor App */

/* CSS Variables for cursor configuration */
:root {
  --cursor-size: ${cursorSize};
  --cursor-size-multiplier: ${sizeMultiplier};
}

/* Apply custom cursor to all elements */
*, *::before, *::after {
  cursor: ${cursorValue} !important;
}

/* Ensure cursor applies to body and html */
html, body {
  cursor: ${cursorValue} !important;
}${hoverStateCSS}
`.trim();

  return css;
}

