import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Box,
  EmptyState,
  Tabs,
  Badge,
  Icon,
} from "@shopify/polaris";
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import db from "../db.server";

// ============================================================================
// LOADER - Data Fetching
// ============================================================================

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Fetch all published cursors from database
  const cursors = await db.cursor.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  // Group cursors by category
  const cursorsByCategory = cursors.reduce((acc, cursor) => {
    if (!acc[cursor.category]) {
      acc[cursor.category] = [];
    }
    acc[cursor.category].push(cursor);
    return acc;
  }, {});

  // Get or create cursor settings for this shop
  let cursorSettings = await db.cursorSettings.findUnique({
    where: { shop },
    include: {
      activeCursor: true,
    },
  });

  // If no settings exist, create default settings
  if (!cursorSettings) {
    cursorSettings = await db.cursorSettings.create({
      data: {
        shop,
        isEnabled: true,
      },
      include: {
        activeCursor: true,
      },
    });
  }

  return json({
    cursorsByCategory,
    cursors,
    activeCursorId: cursorSettings.activeCursorId,
    activeCursor: cursorSettings.activeCursor,
  });
}

// ============================================================================
// ACTION - Handle Form Submissions
// ============================================================================

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'setActiveCursor') {
    const cursorId = parseInt(formData.get('cursorId'), 10);

    // Update or create cursor settings
    await db.cursorSettings.upsert({
      where: { shop },
      update: {
        activeCursorId: cursorId,
      },
      create: {
        shop,
        activeCursorId: cursorId,
        isEnabled: true,
      },
    });

    return json({ success: true });
  }

  return json({ success: false });
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CursorsPage() {
  const { cursorsByCategory, cursors, activeCursorId, activeCursor } = useLoaderData();
  const submit = useSubmit();

  const handleCursorSelect = useCallback((cursorId) => {
    const formData = new FormData();
    formData.append('action', 'setActiveCursor');
    formData.append('cursorId', cursorId);
    submit(formData, { method: 'post' });
  }, [submit]);

  return (
    <Page title="Custom Cursor">
      <Layout>
        {/* LEFT COLUMN - Cursor Gallery */}
        <Layout.Section variant="oneThird">
          <CursorGalleryPanel 
            cursorsByCategory={cursorsByCategory}
            cursors={cursors}
            activeCursorId={activeCursorId}
            onCursorSelect={handleCursorSelect}
          />
        </Layout.Section>

        {/* RIGHT COLUMN - Preview & Settings */}
        <Layout.Section variant="oneThird">
          <PreviewPanel activeCursor={activeCursor} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// ============================================================================
// LEFT COLUMN - CURSOR GALLERY PANEL
// ============================================================================

function CursorGalleryPanel({ cursorsByCategory, cursors, activeCursorId, onCursorSelect }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const tabs = [
    {
      id: 'gallery',
      content: 'Cursor gallery',
    },
    {
      id: 'upload',
      content: 'Upload your own',
    },
  ];

  return (
    <Card>
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
        <div style={{ padding: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
          {selectedTab === 0 ? (
            <GalleryTabContent 
              cursorsByCategory={cursorsByCategory}
              cursors={cursors}
              activeCursorId={activeCursorId}
              onCursorSelect={onCursorSelect}
            />
          ) : (
            <UploadTabContent />
          )}
        </div>
      </Tabs>
    </Card>
  );
}

// ============================================================================
// GALLERY TAB CONTENT
// ============================================================================

function GalleryTabContent({ cursorsByCategory, cursors, activeCursorId, onCursorSelect }) {
  if (cursors.length === 0) {
    return (
      <EmptyState
        heading="No cursors uploaded yet"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>Start by adding cursors to your gallery.</p>
      </EmptyState>
    );
  }

  const categories = Object.keys(cursorsByCategory);

  return (
    <BlockStack gap="600">
      {categories.map((category) => (
        <CursorCategorySection
          key={category}
          category={category}
          cursors={cursorsByCategory[category]}
          activeCursorId={activeCursorId}
          onCursorSelect={onCursorSelect}
        />
      ))}
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CATEGORY SECTION
// ============================================================================

function CursorCategorySection({ category, cursors, activeCursorId, onCursorSelect }) {
  return (
    <BlockStack gap="400">
      {/* Category Header */}
      <Text as="h3" variant="headingSm" fontWeight="semibold">
        {category.replace(/_/g, ' ')}
      </Text>

      {/* Cursor Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '12px',
        }}
      >
        {cursors.map((cursor) => (
          <CursorCard 
            key={cursor.id} 
            cursor={cursor}
            isActive={cursor.id === activeCursorId}
            onClick={() => onCursorSelect(cursor.id)}
          />
        ))}
      </div>
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CARD COMPONENT
// ============================================================================

function CursorCard({ cursor, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: isActive ? '2px solid #005BD3' : '1px solid #E1E3E5',
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isActive ? '#F6F6F7' : '#fff',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#005BD3';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#E1E3E5';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Active Badge */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
          }}
        >
          <Badge tone="success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon source={CheckSmallIcon} tone="success" />
              Active
            </div>
          </Badge>
        </div>
      )}

      <Box paddingBlockEnd="200">
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isActive ? '#E3F3E8' : '#F6F6F7',
            borderRadius: '4px',
          }}
        >
          <img
            src={cursor.imageUrl}
            alt={cursor.name}
            style={{
              maxWidth: '48px',
              maxHeight: '48px',
              objectFit: 'contain',
            }}
          />
        </div>
      </Box>
      <Text as="p" variant="bodySm" alignment="center" fontWeight={isActive ? "semibold" : "regular"}>
        {cursor.name}
      </Text>
    </div>
  );
}

// ============================================================================
// UPLOAD TAB CONTENT
// ============================================================================

function UploadTabContent() {
  return (
    <EmptyState
      heading="Upload your own cursor"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Coming soon! You'll be able to upload custom cursor images here.</p>
    </EmptyState>
  );
}

// ============================================================================
// RIGHT COLUMN - PREVIEW PANEL
// ============================================================================

function PreviewPanel({ activeCursor }) {
  return (
    <BlockStack gap="400">
      {/* Preview Card */}
      <Card>
        <BlockStack gap="400">
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Text as="h2" variant="headingMd">
              Cursor Preview
            </Text>
            {activeCursor && (
              <Badge tone="info">{activeCursor.category.replace(/_/g, ' ')}</Badge>
            )}
          </div>

          {/* Preview Box */}
          <PreviewBox activeCursor={activeCursor} />

          {/* Cursor Name */}
          {activeCursor && (
            <div style={{ textAlign: 'center' }}>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                {activeCursor.name}
              </Text>
              {activeCursor.description && (
                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    {activeCursor.description}
                  </Text>
                </Box>
              )}
            </div>
          )}
        </BlockStack>
      </Card>

      {/* Settings Card - Placeholder for Tasks 7-9 */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            Cursor Settings
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Settings controls will appear here (Tasks 7-9)
          </Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ============================================================================
// PREVIEW BOX COMPONENT
// ============================================================================

function PreviewBox({ activeCursor }) {
  const [isHovering, setIsHovering] = useState(false);

  // Generate custom cursor CSS
  const customCursorStyle = activeCursor
    ? {
        cursor: `url("${activeCursor.imageUrl}") ${activeCursor.hotspotX} ${activeCursor.hotspotY}, auto`,
      }
    : {};

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        width: '100%',
        height: '300px',
        border: isHovering && activeCursor ? '2px solid #005BD3' : '2px dashed #C9CCCF',
        borderRadius: '8px',
        backgroundColor: isHovering && activeCursor ? '#FFFFFF' : '#F6F6F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        ...customCursorStyle,
      }}
    >
      {activeCursor ? (
        <>
          {/* Cursor Image Display */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img
              src={activeCursor.imageUrl}
              alt={activeCursor.name}
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Preview Instructions */}
          <Box paddingBlockStart="400">
            <Text as="p" variant="bodySm" alignment="center" tone="subdued">
              ✨ Hover over this area to see your custom cursor in action!
            </Text>
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                Move your mouse around to test the cursor behavior
              </Text>
            </Box>
          </Box>

          {/* Grid Pattern Background (Optional Visual Enhancement) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />
        </>
      ) : (
        <BlockStack gap="300">
          <div style={{ textAlign: 'center' }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.3 }}
            >
              <path
                d="M32 8L24 24H16L32 56L48 24H40L32 8Z"
                fill="#8C9196"
              />
            </svg>
          </div>
          <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
            Select a cursor from the gallery
          </Text>
          <Text as="p" variant="bodySm" alignment="center" tone="subdued">
            Click any cursor on the left to see a preview here
          </Text>
        </BlockStack>
      )}
    </div>
  );
}
