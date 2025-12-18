# Development Instructions - Shopify Admin App

## 🎯 Goal
This guide provides step-by-step instructions to develop a Shopify Admin app for the Shopify App Store using the existing Remix-based architecture.

---

## 📋 Prerequisites

### 1. System Requirements
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **Package Manager**: npm, yarn, or pnpm
- **Git**: For version control
- **Code Editor**: VS Code recommended
- **Operating System**: Windows, macOS, or Linux

### 2. Shopify Requirements
- **Shopify Partner Account**: [Sign up here](https://partners.shopify.com/signup)
- **Development Store**: Create a development store in your Partners Dashboard
  - OR use a Shopify Plus sandbox store
- **Ngrok or Cloudflare Tunnel**: For local development (handled by Shopify CLI)

### 3. Knowledge Requirements
- JavaScript/TypeScript basics
- React fundamentals
- Understanding of REST/GraphQL APIs
- Basic understanding of OAuth 2.0
- Familiarity with Remix framework (helpful but not required)

---

## 🚀 Initial Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd shopify-example-app-open-source

# Install dependencies (choose one)
npm install
# OR
yarn install
# OR
pnpm install
```

### Step 2: Setup Database

```bash
# Generate Prisma client and run migrations
npm run setup

# This runs:
# - prisma generate (generates Prisma client)
# - prisma migrate deploy (applies database migrations)
```

### Step 3: Configure Shopify App

```bash
# Link to existing app or create new one
npm run config:link

# Follow prompts to:
# 1. Select your Partner organization
# 2. Choose existing app or create new one
# 3. Link to development store
```

### Step 4: Start Development Server

```bash
# Start development server with tunnel
npm run dev

# The Shopify CLI will:
# - Start Remix development server
# - Create a secure tunnel (ngrok/cloudflare)
# - Set up environment variables
# - Open browser to install app
```

**Press 'P'** to open the installation URL in your browser.

---

## 🏗️ Development Workflow

### Understanding the Route Structure

Remix uses **file-based routing**. Routes are defined in the `app/routes/` directory:

```
app/routes/
├── _index/                    # Public landing page (/)
│   └── route.jsx
├── app.jsx                    # Layout for admin routes (/app)
├── app._index.jsx             # Admin home (/app)
├── app.qrcodes.$id.jsx        # QR code form (/app/qrcodes/:id)
├── auth.$.jsx                 # OAuth callback (/auth/*)
├── auth.login/                # Login route (/auth/login)
├── qrcodes.$id.scan.jsx       # Public scan endpoint (/qrcodes/:id/scan)
└── webhooks.jsx               # Webhook endpoint (/webhooks)
```

### Route Naming Convention

| Pattern | Example | Route |
|---------|---------|-------|
| `route.jsx` | `_index/route.jsx` | `/` |
| `name.jsx` | `app.jsx` | `/app` |
| `parent.child.jsx` | `app._index.jsx` | `/app` (nested) |
| `name.$param.jsx` | `app.qrcodes.$id.jsx` | `/app/qrcodes/:id` |
| `name.$.jsx` | `auth.$.jsx` | `/auth/*` (splat) |

---

## 🛠️ Creating New Features

### Feature 1: Add a New Database Model

#### Step 1: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
model YourNewModel {
  id        Int      @id @default(autoincrement())
  shop      String
  title     String
  data      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_your_new_model

# This will:
# 1. Generate SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma client
```

#### Step 3: Create Model File

Create `app/models/YourNewModel.server.js`:

```javascript
import db from "../db.server";

export async function getItems(shop) {
  return await db.yourNewModel.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });
}

export async function getItem(id) {
  return await db.yourNewModel.findFirst({ where: { id } });
}

export async function createItem(data) {
  return await db.yourNewModel.create({ data });
}

export async function updateItem(id, data) {
  return await db.yourNewModel.update({ where: { id }, data });
}

export async function deleteItem(id) {
  return await db.yourNewModel.delete({ where: { id } });
}

export function validateItem(data) {
  const errors = {};
  
  if (!data.title) {
    errors.title = "Title is required";
  }
  
  if (Object.keys(errors).length) {
    return errors;
  }
}
```

---

### Feature 2: Create Admin Page

#### Step 1: Create List Page

Create `app/routes/app.items._index.jsx`:

```javascript
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  EmptyState,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { getItems } from "../models/YourNewModel.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const items = await getItems(session.shop);

  return json({ items });
}

export default function ItemsIndex() {
  const { items } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page>
      <ui-title-bar title="Items">
        <button 
          variant="primary" 
          onClick={() => navigate("/app/items/new")}
        >
          Create Item
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {items.length === 0 ? (
              <EmptyState
                heading="Create your first item"
                action={{
                  content: "Create Item",
                  onAction: () => navigate("/app/items/new"),
                }}
              >
                <p>Start by creating your first item.</p>
              </EmptyState>
            ) : (
              <IndexTable
                resourceName={{
                  singular: "item",
                  plural: "items",
                }}
                itemCount={items.length}
                headings={[
                  { title: "Title" },
                  { title: "Created" },
                ]}
                selectable={false}
              >
                {items.map((item) => (
                  <IndexTable.Row key={item.id} id={item.id}>
                    <IndexTable.Cell>
                      <a href={`/app/items/${item.id}`}>
                        {item.title}
                      </a>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

#### Step 2: Create Form Page

Create `app/routes/app.items.$id.jsx`:

```javascript
import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSubmit,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  TextField,
  BlockStack,
  PageActions,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import {
  getItem,
  createItem,
  updateItem,
  deleteItem,
  validateItem,
} from "../models/YourNewModel.server";

export async function loader({ request, params }) {
  await authenticate.admin(request);

  if (params.id === "new") {
    return json({ title: "" });
  }

  return json(await getItem(Number(params.id)));
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop: session.shop,
  };

  if (data.action === "delete") {
    await deleteItem(Number(params.id));
    return redirect("/app/items");
  }

  const errors = validateItem(data);
  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const item =
    params.id === "new"
      ? await createItem(data)
      : await updateItem(Number(params.id), data);

  return redirect(`/app/items/${item.id}`);
}

export default function ItemForm() {
  const item = useLoaderData();
  const errors = useActionData()?.errors || {};
  const [formState, setFormState] = useState(item);
  const [cleanFormState, setCleanFormState] = useState(item);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();

  const isSaving = nav.state === "submitting" && nav.formData?.get("action") !== "delete";
  const isDeleting = nav.state === "submitting" && nav.formData?.get("action") === "delete";

  function handleSave() {
    setCleanFormState({ ...formState });
    submit(formState, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title={item.id ? "Edit Item" : "Create Item"}>
        <button variant="breadcrumb" onClick={() => navigate("/app/items")}>
          Items
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <TextField
                label="Title"
                value={formState.title}
                onChange={(title) => setFormState({ ...formState, title })}
                error={errors.title}
                autoComplete="off"
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !item.id || isSaving || isDeleting,
                destructive: true,
                onAction: () => submit({ action: "delete" }, { method: "post" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

### Feature 3: Add GraphQL API Integration

#### Step 1: Create API Helper

Create `app/utils/shopify-graphql.server.js`:

```javascript
export async function fetchProductsByIds(graphql, productIds) {
  const query = `
    query getProducts($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          handle
          status
          variants(first: 1) {
            edges {
              node {
                id
                price
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  const response = await graphql(query, {
    variables: { ids: productIds },
  });

  const { data } = await response.json();
  return data.nodes;
}

export async function fetchCustomers(graphql, limit = 10) {
  const query = `
    query getCustomers($first: Int!) {
      customers(first: $first) {
        edges {
          node {
            id
            email
            firstName
            lastName
            ordersCount
          }
        }
      }
    }
  `;

  const response = await graphql(query, {
    variables: { first: limit },
  });

  const { data } = await response.json();
  return data.customers.edges.map(edge => edge.node);
}
```

#### Step 2: Use in Route

```javascript
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { fetchCustomers } from "../utils/shopify-graphql.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const customers = await fetchCustomers(admin.graphql);

  return json({ customers });
}

export default function CustomersPage() {
  const { customers } = useLoaderData();
  
  // Render customers...
}
```

---

### Feature 4: Add Webhooks

#### Step 1: Register Webhook in Configuration

Edit `app/shopify.server.js`:

```javascript
const shopify = shopifyApp({
  // ... existing config
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    // Add new webhook
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  // ... rest of config
});
```

#### Step 2: Handle Webhook

Edit `app/routes/webhooks.jsx`:

```javascript
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;

    case "PRODUCTS_CREATE":
      // Handle product creation
      console.log("Product created:", payload);
      // Store in database, send notifications, etc.
      break;

    case "PRODUCTS_UPDATE":
      // Handle product update
      console.log("Product updated:", payload);
      // Update your records
      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // Handle GDPR webhooks
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
```

#### Step 3: Add Required Scopes

Edit `shopify.app.toml`:

```toml
# Add scopes as needed
scopes = "write_products,read_products,read_customers"
```

After changing scopes:
```bash
npm run dev
# Reinstall app in development store to grant new permissions
```

---

### Feature 5: Add App Extensions

#### Step 1: Generate Extension

```bash
npm run generate extension

# Follow prompts to select extension type:
# - Product subscription
# - Checkout UI extension
# - Theme app extension
# - Function
# etc.
```

#### Step 2: Develop Extension

Extensions are created in the `extensions/` directory:

```
extensions/
└── your-extension-name/
    ├── src/
    │   └── index.jsx
    ├── shopify.extension.toml
    └── package.json
```

#### Step 3: Configure Extension

Edit `extensions/your-extension-name/shopify.extension.toml`:

```toml
api_version = "2023-10"

[[extensions]]
type = "checkout_ui_extension"
name = "Your Extension"
handle = "your-extension-handle"

[extensions.settings]
# Extension-specific settings
```

---

## 🎨 UI Development Best Practices

### Use Polaris Components

Always use Shopify Polaris components for consistent UI:

```javascript
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Select,
  Checkbox,
  Banner,
  Modal,
  Toast,
  Frame,
  Loading,
  EmptyState,
  IndexTable,
  Tabs,
  Badge,
  Stack,
  TextStyle,
} from "@shopify/polaris";
```

### Common Patterns

#### Loading State

```javascript
import { useNavigation } from "@remix-run/react";

export default function MyPage() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";

  return (
    <Page>
      {isLoading && <Loading />}
      {/* Page content */}
    </Page>
  );
}
```

#### Toast Notifications

```javascript
import { useState } from "react";
import { Frame, Toast } from "@shopify/polaris";

export default function MyPage() {
  const [showToast, setShowToast] = useState(false);

  return (
    <Frame>
      {showToast && (
        <Toast
          content="Changes saved"
          onDismiss={() => setShowToast(false)}
        />
      )}
      {/* Page content */}
    </Frame>
  );
}
```

#### Modal Dialog

```javascript
import { useState } from "react";
import { Modal, TextContainer } from "@shopify/polaris";

export default function MyComponent() {
  const [modalActive, setModalActive] = useState(false);

  return (
    <>
      <Button onClick={() => setModalActive(true)}>
        Open Modal
      </Button>
      
      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Confirmation"
        primaryAction={{
          content: "Confirm",
          onAction: () => {
            // Handle confirmation
            setModalActive(false);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>Are you sure you want to proceed?</p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </>
  );
}
```

---

## 🧪 Testing

### Manual Testing

1. **Install App in Development Store**:
   ```bash
   npm run dev
   # Press 'P' to open installation URL
   ```

2. **Test Features**:
   - Navigate through all pages
   - Test create, edit, delete operations
   - Verify data persistence
   - Check error handling

3. **Test Webhooks**:
   - Trigger events in Shopify Admin
   - Check webhook delivery in Partners Dashboard
   - Verify webhook handlers work correctly

### API Testing with Shopify CLI

```bash
# Test GraphQL queries
shopify app graphql

# View app info
shopify app info

# View app config
shopify app config show
```

---

## 🚀 Deployment

### Step 1: Prepare for Production

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=write_products,read_customers
   SHOPIFY_APP_URL=https://your-app-url.com
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Test Production Build**:
   ```bash
   npm run start
   ```

### Step 2: Choose Hosting Provider

#### Option A: Fly.io (Recommended)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy

# Set secrets
fly secrets set SHOPIFY_API_KEY=xxx SHOPIFY_API_SECRET=xxx
```

#### Option B: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SHOPIFY_API_KEY=xxx
heroku config:set SHOPIFY_API_SECRET=xxx
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Option C: Docker (Any Provider)

```bash
# Build image
docker build -t shopify-app .

# Run container
docker run -p 3000:3000 \
  -e SHOPIFY_API_KEY=xxx \
  -e SHOPIFY_API_SECRET=xxx \
  -e NODE_ENV=production \
  shopify-app
```

### Step 3: Update App URLs

```bash
# Push configuration to Shopify
npm run config:push
```

Update in Partners Dashboard:
- **App URL**: `https://your-app-url.com`
- **Allowed redirection URL(s)**: `https://your-app-url.com/auth/callback`

### Step 4: Submit to App Store

1. **Complete App Listing**:
   - App name and description
   - Screenshots and demo video
   - Pricing plan
   - Support contact

2. **Complete Compliance Requirements**:
   - Privacy policy
   - GDPR compliance
   - Data handling documentation

3. **Submit for Review**:
   ```bash
   # In Partners Dashboard
   # Apps > [Your App] > Distribution > Shopify App Store
   # Click "Create App Listing"
   ```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Authentication failed"
**Solution**: Check that API credentials are correct and app is installed

#### Issue: "Webhook not received"
**Solution**: 
- Check webhook registration: `npm run dev` → view logs
- Verify webhook URL is publicly accessible
- Check Partners Dashboard for delivery attempts

#### Issue: "Database locked" (SQLite)
**Solution**: 
- Use PostgreSQL for production
- Update `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

#### Issue: "Scope changes not applied"
**Solution**: Reinstall app in development store after changing scopes

### Debug Mode

Enable detailed logging:

```javascript
// app/shopify.server.js
const shopify = shopifyApp({
  // ... other config
  logger: {
    level: 'debug', // 'debug', 'info', 'warn', 'error'
  },
});
```

---

## 📚 Resources

### Official Documentation
- [Shopify App Development](https://shopify.dev/docs/apps)
- [Remix Documentation](https://remix.run/docs)
- [Shopify Polaris](https://polaris.shopify.com/)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)

### Code Examples
- [Shopify App Examples](https://github.com/Shopify/shopify-app-examples)
- [Remix Examples](https://github.com/remix-run/examples)

### Community
- [Shopify Community Forums](https://community.shopify.com/)
- [Shopify Partners Slack](https://shopifypartners.slack.com/)
- [Remix Discord](https://rmx.as/discord)

---

## ✅ Development Checklist

### Before Starting
- [ ] Node.js 18+ installed
- [ ] Shopify Partner account created
- [ ] Development store created
- [ ] Code editor configured

### Setup
- [ ] Dependencies installed
- [ ] Database setup completed
- [ ] App linked to Shopify
- [ ] Development server running
- [ ] App installed in dev store

### Feature Development
- [ ] Database schema updated
- [ ] Model functions created
- [ ] Routes created
- [ ] UI components implemented
- [ ] Forms validated
- [ ] Error handling added
- [ ] Authentication implemented

### Testing
- [ ] Manual testing completed
- [ ] All features working
- [ ] Error scenarios tested
- [ ] Webhooks tested

### Deployment
- [ ] Environment variables set
- [ ] Production build tested
- [ ] Hosting provider configured
- [ ] App URLs updated
- [ ] SSL certificate configured
- [ ] Database migrated

### App Store Submission
- [ ] App listing created
- [ ] Screenshots added
- [ ] Privacy policy linked
- [ ] Pricing configured
- [ ] Support contact provided
- [ ] Compliance requirements met
- [ ] App submitted for review

---

**Good luck with your Shopify app development! 🎉**

For questions or issues, refer to the [Shopify Community Forums](https://community.shopify.com/) or the official documentation.

