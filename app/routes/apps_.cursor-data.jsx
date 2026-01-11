import { json } from "@remix-run/node";
import db from "../db.server";

// --- Constants for API Responses ---
const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
};

const ERROR_CODES = {
  MISSING_SHOP: "MISSING_SHOP",
  INVALID_SHOP_FORMAT: "INVALID_SHOP_FORMAT",
  INVALID_SHOP_PARAM: "INVALID_SHOP_PARAM",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

// --- Helper Functions ---
function createSuccessResponse(data, message = "Success", status = 200) {
  return json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  }, { status, headers: API_HEADERS });
}

function createErrorResponse(error, code = ERROR_CODES.INTERNAL_ERROR, status = 500) {
  console.error("API Error:", {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code,
  });
  return json({
    success: false,
    error: error.message || "Internal server error",
    code,
    timestamp: new Date().toISOString(),
  }, { status, headers: API_HEADERS });
}

function validateShop(shop) {
  if (!shop) {
    return { valid: false, error: 'Missing shop parameter', code: ERROR_CODES.MISSING_SHOP };
  }

  if (typeof shop !== 'string' || shop.trim() === '') {
    return { valid: false, error: 'Invalid shop parameter format', code: ERROR_CODES.INVALID_SHOP_PARAM };
  }

  const shopDomain = shop.trim();
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  
  if (!shopRegex.test(shopDomain)) {
    return { valid: false, error: 'Shop must be a valid .myshopify.com domain', code: ERROR_CODES.INVALID_SHOP_FORMAT };
  }

  return { valid: true, shop: shopDomain };
}

/**
 * App Proxy Route - No Authentication
 * 
 * File: app/routes/apps_.cursor-data.jsx
 * Route: /apps/cursor-data
 * 
 * The underscore after 'apps' (apps_) tells Remix to skip the parent app.jsx layout,
 * which means this route bypasses authentication middleware.
 * 
 * This is required because:
 * 1. App proxy requests come from the storefront (not admin)
 * 2. Shopify validates the request signature automatically
 * 3. The shop parameter is verified in the query string
 */
export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const shopParam = url.searchParams.get("shop");

    console.log(`[App Proxy] Request from: ${url.href}`);
    console.log(`[App Proxy] Shop param: ${shopParam}`);

    const validation = validateShop(shopParam);
    if (!validation.valid) {
      return createErrorResponse(new Error(validation.error), validation.code, 400);
    }
    const shop = validation.shop;

    const cursorSettings = await db.cursorSettings.findUnique({
      where: { shop },
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

    if (!cursorSettings) {
      return createSuccessResponse({ isEnabled: false, cursor: null }, "No cursor settings found for this shop");
    }

    if (!cursorSettings.isEnabled) {
      return createSuccessResponse({ isEnabled: false, cursor: null }, "Custom cursor is disabled");
    }

    if (!cursorSettings.activeCursor) {
      return createSuccessResponse({ isEnabled: false, cursor: null }, "No active cursor selected");
    }

    // Safely parse settings JSON
    let parsedSettings = {};
    if (cursorSettings.settings) {
      try {
        parsedSettings = typeof cursorSettings.settings === 'string'
          ? JSON.parse(cursorSettings.settings)
          : cursorSettings.settings;
      } catch (parseError) {
        console.warn(`[App Proxy] Failed to parse cursor settings for shop ${shop}:`, parseError);
      }
    }
    const cursorSize = parsedSettings.cursorSize || 100;

    console.log(`[App Proxy] Returning cursor data for shop ${shop}`);

    return createSuccessResponse({
      isEnabled: true,
      cursor: {
        id: cursorSettings.activeCursor.id,
        name: cursorSettings.activeCursor.name,
        imageUrl: cursorSettings.activeCursor.imageUrl,
        hoverImageUrl: cursorSettings.activeCursor.hoverImageUrl,
        hotspotX: cursorSettings.activeCursor.hotspotX,
        hotspotY: cursorSettings.activeCursor.hotspotY,
        size: cursorSize,
      },
    }, "Cursor data retrieved successfully");

  } catch (error) {
    console.error("[App Proxy] Database error:", error);
    return createErrorResponse(error, ERROR_CODES.DATABASE_ERROR);
  }
}

export async function options() {
  return new Response(null, { status: 204, headers: API_HEADERS });
}

