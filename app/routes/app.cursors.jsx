import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
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
  Button,
  InlineStack,
  RangeSlider,
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
        settings: JSON.stringify({ cursorSize: 32 }), // Default cursor size (Task 9)
      },
      include: {
        activeCursor: true,
      },
    });
  }

  // Parse settings JSON (Task 9)
  // Prisma may return JSON as string or object depending on database
  const settings = typeof cursorSettings.settings === 'string'
    ? JSON.parse(cursorSettings.settings)
    : (cursorSettings.settings || {});
  const savedCursorSize = settings.cursorSize || 32; // Default to 32px

  return json({
    cursorsByCategory,
    cursors,
    activeCursorId: cursorSettings.activeCursorId,
    activeCursor: cursorSettings.activeCursor,
    savedCursorSize, // Task 9
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
    const cursorIdRaw = formData.get('cursorId');
    const cursorSizeRaw = formData.get('cursorSize'); // Task 9
    
    // Handle null/empty (reset to default) - Task 6F
    const cursorId = cursorIdRaw && cursorIdRaw !== '' 
      ? parseInt(cursorIdRaw, 10) 
      : null;

    // Parse cursor size (Task 9)
    const cursorSize = cursorSizeRaw ? parseInt(cursorSizeRaw, 10) : 32;

    // Get existing settings to preserve other values (Task 9)
    const existingSettings = await db.cursorSettings.findUnique({
      where: { shop },
    });

    // Parse existing settings (Prisma returns JSON as object)
    const currentSettings = typeof existingSettings?.settings === 'string'
      ? JSON.parse(existingSettings.settings)
      : (existingSettings?.settings || {});
    
    const newSettings = {
      ...currentSettings,
      cursorSize, // Update cursor size (Task 9)
    };

    // Update or create cursor settings (Task 6E-6F-9)
    // Note: Prisma Json fields expect stringified JSON
    await db.cursorSettings.upsert({
      where: { shop },
      update: {
        activeCursorId: cursorId,
        settings: JSON.stringify(newSettings), // Stringify for JSON field
      },
      create: {
        shop,
        activeCursorId: cursorId,
        isEnabled: true,
        settings: JSON.stringify(newSettings), // Stringify for JSON field
      },
    });

    return json({ 
      success: true, 
      message: cursorId ? 'Cursor published successfully' : 'Cursor reset to default' 
    });
  }

  return json({ 
    success: false, 
    message: 'Failed to save cursor' 
  });
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CursorsPage() {
  const { cursorsByCategory, cursors, activeCursorId, activeCursor, savedCursorSize } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();

  // ========================================================================
  // STATE MANAGEMENT: Selected vs Active Cursor
  // ========================================================================
  // - selectedCursorId: React state for preview (before save)
  // - activeCursorId: Database state (after save)
  // - Initialize selected with active cursor from DB
  // ========================================================================
  const [selectedCursorId, setSelectedCursorId] = useState(activeCursorId);

  // Derive selected cursor object from ID
  const selectedCursor = selectedCursorId 
    ? cursors.find(cursor => cursor.id === selectedCursorId) 
    : null;

  // ========================================================================
  // CURSOR SIZE STATE (Task 7-9)
  // ========================================================================
  // Size range: 16px (50%) to 64px (200%)
  // Default: 32px (100%)
  // Initialize with saved value from database (Task 9)
  // ========================================================================
  const [cursorSize, setCursorSize] = useState(savedCursorSize);

  // ========================================================================
  // LOADING STATE (Task 6E)
  // ========================================================================
  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  // ========================================================================
  // TOAST NOTIFICATION (Task 6E)
  // ========================================================================
  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.message || "Cursor published successfully", {
        duration: 3000,
      });
      console.log('✅ Cursor saved to database!');
    }
  }, [actionData]);

  // ========================================================================
  // SYNC SELECTED WITH ACTIVE AFTER SAVE (Task 6E-9)
  // ========================================================================
  useEffect(() => {
    // After successful save, sync selected cursor with active cursor from DB
    if (actionData?.success && activeCursorId !== selectedCursorId) {
      console.log('🔄 Syncing selected cursor with database after save');
      setSelectedCursorId(activeCursorId);
    }
  }, [activeCursorId, actionData]);

  useEffect(() => {
    // After successful save, sync cursor size with saved value from DB (Task 9)
    if (actionData?.success && savedCursorSize !== cursorSize) {
      console.log('🔄 Syncing cursor size with database after save');
      setCursorSize(savedCursorSize);
    }
  }, [savedCursorSize, actionData]);

  // Debug logging (Tasks 6A-6B-9)
  useEffect(() => {
    console.log('=== Cursor State (Task 9) ===');
    console.log('Active Cursor ID (from DB):', activeCursorId);
    console.log('Selected Cursor ID (React state):', selectedCursorId);
    console.log('Selected Cursor Object:', selectedCursor);
    console.log('Saved Cursor Size (from DB):', savedCursorSize);
    console.log('Current Cursor Size (React state):', cursorSize);
    console.log('Cursor Changed:', selectedCursorId !== activeCursorId);
    console.log('Size Changed:', cursorSize !== savedCursorSize);
    console.log('Has Unsaved Changes:', selectedCursorId !== activeCursorId || cursorSize !== savedCursorSize);
    console.log('Is Loading:', isLoading);
    console.log('================================');
  }, [selectedCursorId, activeCursorId, selectedCursor, cursorSize, savedCursorSize, isLoading]);

  // ========================================================================
  // CURSOR SELECTION HANDLER (Task 6B)
  // ========================================================================
  // Updates React state only - NO database write until "Save & Publish"
  // ========================================================================
  const handleCursorSelect = useCallback((cursorId) => {
    console.log('👉 Cursor selected (preview mode):', cursorId);
    setSelectedCursorId(cursorId);
  }, []);

  // ========================================================================
  // UNSAVED CHANGES DETECTION (Task 6D-9)
  // ========================================================================
  // Check both cursor selection AND cursor size changes
  const hasUnsavedChanges = 
    selectedCursorId !== activeCursorId || 
    cursorSize !== savedCursorSize;

  // ========================================================================
  // RESET TO DEFAULT HANDLER (Task 6F)
  // ========================================================================
  const handleResetToDefault = useCallback(() => {
    console.log('🔄 Reset to default - clearing cursor selection');
    setSelectedCursorId(null);
  }, []);

  // ========================================================================
  // SAVE & PUBLISH HANDLER (Task 6E-9)
  // ========================================================================
  const handleSaveAndPublish = useCallback(() => {
    console.log('💾 Saving cursor to database:', selectedCursorId, 'Size:', cursorSize);
    
    const formData = new FormData();
    formData.append('action', 'setActiveCursor');
    formData.append('cursorId', selectedCursorId || ''); // Handle null
    formData.append('cursorSize', cursorSize); // Task 9
    
    submit(formData, { method: 'post' });
  }, [selectedCursorId, cursorSize, submit]);

  return (
    <Page title="Custom Cursor">
      <Layout>
        {/* LEFT COLUMN - Cursor Gallery */}
        <Layout.Section variant="oneThird">
          <CursorGalleryPanel 
            cursorsByCategory={cursorsByCategory}
            cursors={cursors}
            selectedCursorId={selectedCursorId}
            onCursorSelect={handleCursorSelect}
            cursorSize={cursorSize}
          />
        </Layout.Section>

        {/* RIGHT COLUMN - Preview & Settings */}
        <Layout.Section variant="oneThird">
          <PreviewPanel 
            selectedCursor={selectedCursor}
            cursorSize={cursorSize}
            onCursorSizeChange={setCursorSize}
          />
        </Layout.Section>
      </Layout>

      {/* ACTION BUTTONS (Task 6D-6E-6F) */}
      <Box paddingBlockStart="400">
        <InlineStack align="space-between">
          {/* Left: Reset Button */}
          <Button
            tone="critical"
            disabled={selectedCursorId === null || isLoading}
            onClick={handleResetToDefault}
          >
            Reset to default
          </Button>

          {/* Right: Save & Publish Button */}
          <Button
            variant="primary"
            disabled={!hasUnsavedChanges || isLoading}
            loading={isLoading}
            onClick={handleSaveAndPublish}
          >
            Save & Publish
          </Button>
        </InlineStack>
      </Box>
    </Page>
  );
}

// ============================================================================
// LEFT COLUMN - CURSOR GALLERY PANEL
// ============================================================================

function CursorGalleryPanel({ cursorsByCategory, cursors, selectedCursorId, onCursorSelect, cursorSize }) {
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
              selectedCursorId={selectedCursorId}
              onCursorSelect={onCursorSelect}
              cursorSize={cursorSize}
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

function GalleryTabContent({ cursorsByCategory, cursors, selectedCursorId, onCursorSelect, cursorSize }) {
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
          selectedCursorId={selectedCursorId}
          onCursorSelect={onCursorSelect}
          cursorSize={cursorSize}
        />
      ))}
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CATEGORY SECTION
// ============================================================================

function CursorCategorySection({ category, cursors, selectedCursorId, onCursorSelect, cursorSize }) {
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
            isSelected={cursor.id === selectedCursorId}
            onClick={() => onCursorSelect(cursor.id)}
            cursorSize={cursorSize}
          />
        ))}
      </div>
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CARD COMPONENT
// ============================================================================

function CursorCard({ cursor, isSelected, onClick, cursorSize }) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for hover preview (Task 10)
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{
        border: isSelected ? '2px solid #005BD3' : (isHovering ? '2px solid #005BD3' : '1px solid #E1E3E5'),
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
        cursor: isHovering ? 'none' : 'pointer', // Hide default cursor on hover (Task 10)
        transition: 'all 0.2s ease',
        backgroundColor: isSelected ? '#F6F6F7' : '#fff',
        position: 'relative',
        boxShadow: isHovering && !isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {/* Selected Badge (Task 6B - Preview Mode) */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
          }}
        >
          <Badge tone="info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Icon source={CheckSmallIcon} tone="info" />
              Selected
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
            background: isSelected ? '#E3F3E8' : '#F6F6F7',
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
      <Text as="p" variant="bodySm" alignment="center" fontWeight={isSelected ? "semibold" : "regular"}>
        {cursor.name}
      </Text>

      {/* Custom Cursor Following Mouse (Task 10 - Hover Preview) */}
      {isHovering && cursorSize && (
        <img
          src={cursor.imageUrl}
          alt="Cursor preview"
          style={{
            position: 'absolute',
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            width: `${cursorSize}px`,
            height: `${cursorSize}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            transform: `translate(-${cursor.hotspotX}px, -${cursor.hotspotY}px)`,
            zIndex: 9999,
            transition: 'width 0.2s ease, height 0.2s ease',
          }}
        />
      )}
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

function PreviewPanel({ selectedCursor, cursorSize, onCursorSizeChange }) {
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
            {selectedCursor && (
              <Badge tone="info">{selectedCursor.category.replace(/_/g, ' ')}</Badge>
            )}
          </div>

          {/* Preview Box (Task 6C-8 - Shows Selected Cursor with Size) */}
          <PreviewBox selectedCursor={selectedCursor} cursorSize={cursorSize} />

          {/* Cursor Name */}
          {selectedCursor && (
            <div style={{ textAlign: 'center' }}>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                {selectedCursor.name}
              </Text>
              {selectedCursor.description && (
                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    {selectedCursor.description}
                  </Text>
                </Box>
              )}
            </div>
          )}
        </BlockStack>
      </Card>

      {/* Settings Card (Task 7 - Cursor Size Slider) */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            Cursor Settings
          </Text>

          {/* Cursor Size Slider */}
          <BlockStack gap="200">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text as="p" variant="bodyMd">
                Cursor Size
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {cursorSize}px ({Math.round((cursorSize / 32) * 100)}%)
              </Text>
            </div>
            <RangeSlider
              label="Cursor size"
              labelHidden
              value={cursorSize}
              onChange={onCursorSizeChange}
              min={16}
              max={64}
              step={1}
              output
            />
            <Text as="p" variant="bodySm" tone="subdued">
              Adjust the size of your custom cursor (16px - 64px)
            </Text>
          </BlockStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ============================================================================
// PREVIEW BOX COMPONENT
// ============================================================================

function PreviewBox({ selectedCursor, cursorSize }) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for custom cursor (Task 8A)
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        height: '300px',
        border: isHovering && selectedCursor ? '2px solid #005BD3' : '2px dashed #C9CCCF',
        borderRadius: '8px',
        backgroundColor: isHovering && selectedCursor ? '#FFFFFF' : '#F6F6F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: selectedCursor && isHovering ? 'none' : 'default', // Hide default cursor (Task 8A)
      }}
    >
      {selectedCursor ? (
        <>
          {/* Cursor Image Display (Task 8 - Scaled by cursorSize) */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img
              src={selectedCursor.imageUrl}
              alt={selectedCursor.name}
              style={{
                width: `${cursorSize}px`,
                height: `${cursorSize}px`,
                objectFit: 'contain',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          {/* Preview Instructions (Task 8 - Shows Size) */}
          <Box paddingBlockStart="400">
            <Text as="p" variant="bodySm" alignment="center" tone="subdued">
              ✨ Hover over this area to see your custom cursor in action!
            </Text>
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                Current size: {cursorSize}px ({Math.round((cursorSize / 32) * 100)}%)
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

          {/* Custom Cursor Following Mouse (Task 8A) */}
          {isHovering && (
            <img
              src={selectedCursor.imageUrl}
              alt="Custom cursor"
              style={{
                position: 'absolute',
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
                width: `${cursorSize}px`,
                height: `${cursorSize}px`,
                objectFit: 'contain',
                pointerEvents: 'none',
                transform: `translate(-${selectedCursor.hotspotX}px, -${selectedCursor.hotspotY}px)`,
                zIndex: 9999,
                transition: 'width 0.2s ease, height 0.2s ease',
              }}
            />
          )}
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
