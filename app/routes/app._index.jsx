import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";

export async function loader({ request }) {
  await authenticate.admin(request);
  
  return json({
    message: "Custom Cursor App - Coming Soon!",
  });
}

export default function Index() {
  const { message } = useLoaderData();

  return (
    <Page>
      <ui-title-bar title="Custom Cursor" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Welcome to Custom Cursor App! 🎨
              </Text>
              <EmptyState
                heading="Your cursor customization dashboard"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Personalize your store with custom mouse cursors. Stand out from
                  competitors and create a memorable brand experience.
                </p>
                <p style={{ marginTop: "1rem" }}>
                  <strong>Coming in Step 2:</strong> Browse gallery, upload custom
                  cursors, and more!
                </p>
              </EmptyState>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

