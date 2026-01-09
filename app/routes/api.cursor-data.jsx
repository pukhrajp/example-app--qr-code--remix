import { json } from "@remix-run/node";
import db from "../db.server";

/**
 * API Endpoint: Cursor Data
 * 
 * Public endpoint that serves cursor settings to the storefront.
 * Used by the Theme App Extension to display custom cursors.
 * 
 * @route GET /api/cursor-data
 * @query shop - The shop domain (e.g., example.myshopify.com)
 * @returns JSON with cursor settings or null if disabled/not found
 */

/**
 * Validates shop parameter format
 * @param {string} shop - Shop domain to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateShop(shop) {
  // Check if shop parameter exists
  if (!shop) {
    return {
      valid: false,
      error: "Missing required parameter 'shop'",
    };
  }

  // Check if shop is a string
  if (typeof shop !== "string") {
    return {
      valid: false,
      error: "Parameter 'shop' must be a string",
    };
  }

  // Trim whitespace
  shop = shop.trim();

  // Check if shop is not empty after trimming
  if (shop.length === 0) {
    return {
      valid: false,
      error: "Parameter 'shop' cannot be empty",
    };
  }

  // Validate shop format: should end with .myshopify.com
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  
  if (!shopRegex.test(shop)) {
    return {
      valid: false,
      error: "Invalid shop format. Expected format: 'your-store.myshopify.com'",
    };
  }

  // Additional security: check for suspicious patterns
  if (shop.includes("..") || shop.includes("//")) {
    return {
      valid: false,
      error: "Invalid shop parameter",
    };
  }

  return {
    valid: true,
    shop: shop.toLowerCase(), // Normalize to lowercase
  };
}

export async function loader({ request }) {
  try {
    // Get shop parameter from URL
    const url = new URL(request.url);
    const shopParam = url.searchParams.get("shop");

    // Validate shop parameter
    const validation = validateShop(shopParam);
    
    if (!validation.valid) {
      return json({
        success: false,
        error: validation.error,
      }, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const shop = validation.shop;

    // Fetch cursor settings from database
    const cursorSettings = await db.cursorSettings.findUnique({
      where: {
        shop: shop,
      },
      include: {
        cursor: true, // Include related cursor data
      },
    });

    // If no settings found, return disabled state
    if (!cursorSettings) {
      return json({
        isEnabled: false,
        cursor: null,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // If cursor is disabled, return disabled state
    if (!cursorSettings.isEnabled) {
      return json({
        isEnabled: false,
        cursor: null,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // If no cursor is set (activeCursorId is null), return disabled state
    if (!cursorSettings.cursor) {
      return json({
        isEnabled: false,
        cursor: null,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Return enabled cursor with settings
    return json({
      isEnabled: true,
      cursor: {
        id: cursorSettings.cursor.id,
        name: cursorSettings.cursor.name,
        imageUrl: cursorSettings.cursor.imageUrl,
        hoverImageUrl: cursorSettings.cursor.hoverImageUrl,
        hotspotX: cursorSettings.cursor.hotspotX,
        hotspotY: cursorSettings.cursor.hotspotY,
        size: cursorSettings.cursorSize,
      },
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Cursor API Error:", error);
    
    return json({
      success: false,
      error: "Internal server error",
    }, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

