import { json } from "@remix-run/node";

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

export async function loader({ request }) {
  try {
    // Get shop parameter from URL
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    // Basic response for now
    return json({
      success: true,
      shop: shop,
      message: "Cursor API endpoint is working!",
      timestamp: new Date().toISOString(),
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

