# Quick Understanding - Shopify App Architecture

## 📋 Overview
This is a **Shopify App Store** application built with **Remix** framework for managing QR codes. The app allows merchants to create QR codes that link to their products, enabling customers to scan and purchase items directly.

## 🏗️ Architecture Stack

### Frontend
- **Framework**: Remix v1.19.1 (React-based full-stack framework)
- **UI Library**: Shopify Polaris v12.0.0 (Shopify's design system)
- **Polaris Icons**: v8.0.0
- **App Bridge Types**: v0.0.3 (For embedded app integration)

### Backend
- **Runtime**: Node.js 18 (Alpine Linux in Docker)
- **API Framework**: Remix server-side loaders and actions
- **Shopify Integration**: 
  - `@shopify/shopify-app-remix` v2.4.0
  - `@shopify/shopify-api` v9.0.2
  - `@shopify/cli` v3.48

### Database
- **ORM**: Prisma v5.8.0
- **Database**: SQLite (file-based: `dev.sqlite`)
- **Session Storage**: Prisma-based session storage
- **Models**:
  - `Session` - OAuth session management
  - `QRCode` - QR code data storage

### Development Tools
- **Shopify CLI**: v3.48 (for app development, deployment, tunneling)
- **Build Tool**: Remix Dev
- **Linting**: ESLint with Remix config
- **Formatting**: Prettier
- **TypeScript**: Configured but using JavaScript (.jsx)

## 📁 Project Structure

```
shopify-example-app-open-source/
├── app/
│   ├── entry.server.jsx          # Server-side entry point
│   ├── root.jsx                  # Root layout component
│   ├── db.server.js              # Prisma client configuration
│   ├── shopify.server.js         # Shopify app configuration & auth
│   ├── models/
│   │   └── QRCode.server.js      # QR code business logic
│   └── routes/
│       ├── _index/               # Public landing page
│       │   ├── route.jsx
│       │   └── style.css
│       ├── app.jsx               # Admin app layout (authenticated)
│       ├── app._index.jsx        # QR codes list page
│       ├── app.qrcodes.$id.jsx   # QR code create/edit form
│       ├── auth.$.jsx            # OAuth callback handler
│       ├── auth.login/           # Login route
│       ├── qrcodes.$id.scan.jsx  # Public QR code scanner endpoint
│       └── webhooks.jsx          # Webhook handlers
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/
│   └── favicon.ico
├── shopify.app.toml              # Shopify app configuration
├── shopify.web.toml              # Web service configuration
├── remix.config.js               # Remix configuration
├── package.json                  # Dependencies & scripts
├── Dockerfile                    # Docker container setup
└── tsconfig.json                 # TypeScript configuration
```

## 🔐 Authentication & Authorization

### OAuth Flow
1. **Entry Point**: `app/routes/_index/route.jsx` - Landing page with shop domain input
2. **Login**: `app/routes/auth.login/route.jsx` - Initiates OAuth flow
3. **Callback**: `app/routes/auth.$.jsx` - Handles OAuth callback
4. **Session Storage**: Prisma-based session storage in SQLite

### Authentication Configuration
Located in `app/shopify.server.js`:
- **API Version**: `LATEST_API_VERSION` (2023-10)
- **Auth Prefix**: `/auth`
- **Distribution**: `AppDistribution.AppStore`
- **Scopes**: `write_products` (from `shopify.app.toml`)
- **Session Storage**: PrismaSessionStorage

### Protected Routes
All routes under `/app/*` are protected using:
```javascript
await authenticate.admin(request);
```

## 🔄 Key Application Flow

### Admin Flow (Embedded in Shopify Admin)
1. **Home Page** (`/app`) → Lists all QR codes
2. **Create QR Code** (`/app/qrcodes/new`) → Form to create new QR code
3. **Edit QR Code** (`/app/qrcodes/:id`) → Form to edit existing QR code
4. **Delete QR Code** → Action in edit form

### Public Flow (Customer-facing)
1. **Scan QR Code** → Redirects to `/qrcodes/:id/scan`
2. **Increment Scan Counter** → Updates database
3. **Redirect** → Either to product page or checkout with product in cart

### Webhook Flow
- **APP_UNINSTALLED** → Deletes all sessions for the shop
- **GDPR Webhooks** → Placeholders for CUSTOMERS_DATA_REQUEST, CUSTOMERS_REDACT, SHOP_REDACT

## 🗄️ Database Schema

### Session Model
```prisma
- id: String (Primary Key)
- shop: String
- state: String
- isOnline: Boolean
- scope: String?
- expires: DateTime?
- accessToken: String
- userId: BigInt?
```

### QRCode Model
```prisma
- id: Int (Auto-increment Primary Key)
- title: String
- shop: String
- productId: String (Shopify Global ID)
- productHandle: String
- productVariantId: String (Shopify Global ID)
- destination: String ('product' or 'cart')
- scans: Int (default: 0)
- createdAt: DateTime
```

## 🔌 API Integration

### GraphQL API
Used for fetching product data:
- Product title
- Product media (images)
- Supplements QR code data with product information

### REST API
Available via `restResources` from `@shopify/shopify-api/rest/admin/2023-10`

## 🚀 Deployment Configuration

### Environment Variables Required
- `SHOPIFY_API_KEY` - App API key from Partners Dashboard
- `SHOPIFY_API_SECRET` - App API secret
- `SCOPES` - Comma-separated OAuth scopes
- `SHOPIFY_APP_URL` - Public URL of the app
- `NODE_ENV` - Set to 'production' for production
- `SHOP_CUSTOM_DOMAIN` (Optional) - Custom shop domain

### Docker Setup
- **Base Image**: node:18-alpine
- **Exposed Port**: 3000
- **Build Process**: npm install → npm run build
- **Start Command**: npm run start (runs remix-serve)

### HMR (Hot Module Reloading)
- **Port**: 8002 (configurable via `HMR_SERVER_PORT`)
- **Health Check**: `/ping` endpoint

## 📦 Key Dependencies

### Production
- `@shopify/shopify-app-remix` - Main Shopify integration
- `@shopify/polaris` - UI components
- `@prisma/client` - Database ORM
- `qrcode` - QR code generation library
- `react` & `react-dom` - v18.2.0

### Development
- `@remix-run/dev` - Remix development tools
- `eslint` - Code linting
- `prettier` - Code formatting

## 🎨 UI Framework

### Polaris Components Used
- `Page`, `Layout`, `Card` - Page structure
- `IndexTable` - Data tables
- `EmptyState` - Empty state UI
- `TextField`, `ChoiceList`, `Button` - Form controls
- `Thumbnail`, `Icon`, `Text` - Display elements
- `PageActions` - Action buttons
- `InlineStack`, `BlockStack` - Layout utilities

### App Bridge Features
- `ui-title-bar` - Title bar component
- `window.shopify.resourcePicker` - Product picker modal

## 📝 Development Scripts

```json
"dev": "shopify app dev"          // Start development server with tunnel
"build": "remix build"             // Build production bundle
"start": "remix-serve build"       // Serve production build
"setup": "prisma generate && prisma migrate deploy"
"deploy": "shopify app deploy"     // Deploy to production
"generate": "shopify app generate" // Generate app components
```

## 🔧 Configuration Files

### shopify.app.toml
- Defines app-level configuration
- Scopes: `write_products`

### shopify.web.toml
- Web service configuration
- Roles: `["frontend", "backend"]`
- Webhooks path: `/webhooks`
- Dev command: `npm exec remix dev`

### remix.config.js
- App directory: `app`
- Server module format: CommonJS
- Future flags enabled (v2 features)
- HMR server configuration

## 🎯 App Capabilities

### Current Features
1. ✅ **QR Code Management** - Create, edit, delete, list QR codes
2. ✅ **Product Linking** - Link QR codes to Shopify products
3. ✅ **Scan Tracking** - Track number of scans per QR code
4. ✅ **Destination Options** - Product page or checkout with cart
5. ✅ **Image Preview** - QR code preview and download
6. ✅ **Embedded Admin UI** - Seamlessly integrated in Shopify Admin

### Extension Points for New Features
- Add new models in `prisma/schema.prisma`
- Create new routes in `app/routes/`
- Add business logic in `app/models/`
- Configure new webhooks in `shopify.server.js`
- Add new scopes in `shopify.app.toml`

## 🔄 Data Flow Example

### Creating a QR Code
1. User navigates to `/app/qrcodes/new`
2. Loader loads empty form state
3. User selects product via App Bridge resource picker
4. User fills title and destination
5. Form submits to action function
6. Action validates data via `validateQRCode()`
7. Action creates record in database via Prisma
8. Redirects to `/app/qrcodes/:id` with new QR code
9. QR code image generated via `qrcode` library
10. Product data fetched via GraphQL

### Scanning a QR Code
1. Customer scans QR code
2. Redirects to `/qrcodes/:id/scan`
3. Loader validates QR code exists
4. Increments scan counter in database
5. Redirects to product page or checkout URL

## 📚 Important Files to Know

| File | Purpose |
|------|---------|
| `app/shopify.server.js` | Central Shopify configuration & auth exports |
| `app/db.server.js` | Prisma client singleton |
| `app/routes/app.jsx` | Root layout for authenticated admin routes |
| `app/models/QRCode.server.js` | QR code business logic & validation |
| `prisma/schema.prisma` | Database schema definition |
| `shopify.app.toml` | App-level Shopify configuration |

---

**Last Updated**: December 2024  
**Framework Version**: Remix v1.19.1  
**Shopify API Version**: 2023-10

