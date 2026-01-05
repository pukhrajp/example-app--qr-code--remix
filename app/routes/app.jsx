import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";

import { authenticate } from "../shopify.server";
import { I18nProvider } from "../i18n/I18nProvider";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  // Fetch shop's primary locale for auto-language detection
  let shopLocale = null;
  try {
    const response = await admin.graphql(
      `#graphql
      query {
        shop {
          primaryDomain {
            host
          }
          currencyCode
          ianaTimezone
          enabledPresentmentCurrencies
        }
      }`
    );
    const data = await response.json();
    
    // Get browser locale from request headers as fallback
    const acceptLanguage = request.headers.get('accept-language');
    const browserLocale = acceptLanguage?.split(',')[0]?.split('-')[0] || 'en';
    
    // Use browser locale as detected locale (Shopify GraphQL doesn't expose shop locale directly)
    // In a production app, you might use shop.billingAddress.country or other indicators
    shopLocale = browserLocale;
  } catch (error) {
    console.error('Error fetching shop locale:', error);
    shopLocale = 'en'; // Fallback to English
  }

  return json({ 
    apiKey: process.env.SHOPIFY_API_KEY,
    detectedLocale: shopLocale 
  });
}

export default function App() {
  const { apiKey, detectedLocale } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <I18nProvider detectedLocale={detectedLocale}>
        <Outlet />
      </I18nProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

