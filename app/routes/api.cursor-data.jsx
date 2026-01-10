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
 * 
 * Response Format:
 * {
 *   isEnabled: boolean,
 *   cursor: {
 *     id: number,
 *     name: string,
 *     imageUrl: string,
 *     hoverImageUrl: string,
 *     hotspotX: number,
 *     hotspotY: number,
 *     size: number
 *   } | null
 * }
 * 
 * Error Response:
 * {
 *   success: false,
 *   error: string,
 *   code?: string
 * }
 */

/**
 * CORS and Cache Headers for API responses
 */
const API_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Allow all origins for public API
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=60", // 5 min cache
};

/**
 * Error codes for better client-side error handling
 */
const ERROR_CODES = {
  MISSING_SHOP: "MISSING_SHOP",
  INVALID_SHOP_FORMAT: "INVALID_SHOP_FORMAT",
  INVALID_SHOP_PARAM: "INVALID_SHOP_PARAM",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

/**
 * Creates a standardized error response
 */
function createErrorResponse(error, code, status = 500) {
  return json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  }, {
    status,
    headers: API_HEADERS,
  });
}

/**
 * Creates a standardized success response
 */
function createSuccessResponse(data) {
  return json({
    success: true,
    timestamp: new Date().toISOString(),
    ...data,
  }, {
    headers: API_HEADERS,
  });
}

/**
 * Validates shop parameter format
 * @param {string} shop - Shop domain to validate
 * @returns {Object} { valid: boolean, error?: string, code?: string, shop?: string }
 */
function validateShop(shop) {
  // Check if shop parameter exists
  if (!shop) {
    return {
      valid: false,
      error: "Missing required parameter 'shop'",
      code: ERROR_CODES.MISSING_SHOP,
    };
  }

  // Check if shop is a string
  if (typeof shop !== "string") {
    return {
      valid: false,
      error: "Parameter 'shop' must be a string",
      code: ERROR_CODES.INVALID_SHOP_PARAM,
    };
  }

  // Trim whitespace
  shop = shop.trim();

  // Check if shop is not empty after trimming
  if (shop.length === 0) {
    return {
      valid: false,
      error: "Parameter 'shop' cannot be empty",
      code: ERROR_CODES.MISSING_SHOP,
    };
  }

  // Validate shop format: should end with .myshopify.com
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  
  if (!shopRegex.test(shop)) {
    return {
      valid: false,
      error: "Invalid shop format. Expected format: 'your-store.myshopify.com'",
      code: ERROR_CODES.INVALID_SHOP_FORMAT,
    };
  }

  // Additional security: check for suspicious patterns
  if (shop.includes("..") || shop.includes("//")) {
    return {
      valid: false,
      error: "Invalid shop parameter",
      code: ERROR_CODES.INVALID_SHOP_PARAM,
    };
  }

  return {
    valid: true,
    shop: shop.toLowerCase(), // Normalize to lowercase
  };
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function options() {
  return new Response(null, {
    status: 204,
    headers: API_HEADERS,
  });
}

export async function loader({ request }) {
  try {
    // Get shop parameter from URL
    const url = new URL(request.url);
    const shopParam = url.searchParams.get("shop");

    // Validate shop parameter
    const validation = validateShop(shopParam);
    
    if (!validation.valid) {
      return createErrorResponse(
        validation.error,
        validation.code,
        400
      );
    }

    const shop = validation.shop;

    // Fetch cursor settings from database
    const cursorSettings = await db.cursorSettings.findUnique({
      where: {
        shop: shop,
      },
      include: {
        activeCursor: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            hoverImageUrl: true,
            hotspotX: true,
            hotspotY: true,
          },
        },
      },
    });

    // If no settings found, return disabled state
    if (!cursorSettings) {
      return createSuccessResponse({
        isEnabled: false,
        cursor: null,
        message: "No cursor settings found for this shop",
      });
    }

    // If cursor is disabled, return disabled state
    if (!cursorSettings.isEnabled) {
      return createSuccessResponse({
        isEnabled: false,
        cursor: null,
        message: "Custom cursor is disabled",
      });
    }

    // If no cursor is set (activeCursorId is null), return disabled state
    if (!cursorSettings.activeCursor) {
      return createSuccessResponse({
        isEnabled: false,
        cursor: null,
        message: "No active cursor selected",
      });
    }

    // Parse settings JSON safely
    let parsedSettings = { cursorSize: 100 }; // Default size
    if (cursorSettings.settings) {
      try {
        parsedSettings = typeof cursorSettings.settings === 'string' 
          ? JSON.parse(cursorSettings.settings) 
          : cursorSettings.settings;
      } catch (parseError) {
        console.warn("Failed to parse cursor settings JSON:", parseError);
      }
    }

    // Return enabled cursor with settings
    return createSuccessResponse({
      isEnabled: true,
      cursor: {
        id: cursorSettings.activeCursor.id,
        name: cursorSettings.activeCursor.name,
        imageUrl: cursorSettings.activeCursor.imageUrl,
        hoverImageUrl: cursorSettings.activeCursor.hoverImageUrl,
        hotspotX: cursorSettings.activeCursor.hotspotX,
        hotspotY: cursorSettings.activeCursor.hotspotY,
        size: parsedSettings.cursorSize || 100,
      },
      message: "Cursor data retrieved successfully",
    });

  } catch (error) {
    // Log detailed error for debugging
    console.error("Cursor API Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
    
    // Check if it's a database error
    const isDatabaseError = error.name?.includes('Prisma');
    
    return createErrorResponse(
      isDatabaseError 
        ? "Database error occurred. Please try again later."
        : "Internal server error. Please try again later.",
      isDatabaseError ? ERROR_CODES.DATABASE_ERROR : ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

