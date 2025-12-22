import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  Banner,
} from "@shopify/polaris";
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import db from "../db.server";

// ============================================================================
// LOADER - Data Fetching
// ============================================================================

export async function loader({ request }) {
  try {
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
          settings: JSON.stringify({ cursorSize: 32 }),
        },
        include: {
          activeCursor: true,
        },
      });
    }

    // Parse settings JSON safely
    let settings = { cursorSize: 32 };
    try {
      settings = typeof cursorSettings.settings === 'string'
        ? JSON.parse(cursorSettings.settings)
        : (cursorSettings.settings || { cursorSize: 32 });
    } catch (parseError) {
      console.error('Error parsing cursor settings:', parseError);
    }
    
    const savedCursorSize = settings.cursorSize || 32;

    return json({
      cursorsByCategory,
      cursors,
      activeCursorId: cursorSettings.activeCursorId,
      activeCursor: cursorSettings.activeCursor,
      savedCursorSize,
      isEnabled: cursorSettings.isEnabled,
    });
  } catch (error) {
    console.error('Error loading cursor data:', error);
    return json({
      cursorsByCategory: {},
      cursors: [],
      activeCursorId: null,
      activeCursor: null,
      savedCursorSize: 32,
      isEnabled: true,
      error: 'Failed to load cursor data',
    }, { status: 500 });
  }
}

// ============================================================================
// ACTION - Handle Form Submissions
// ============================================================================

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'setActiveCursor') {
      const cursorIdRaw = formData.get('cursorId');
      const cursorSizeRaw = formData.get('cursorSize');
      const isEnabledRaw = formData.get('isEnabled');
      
      // Handle null/empty (reset to default)
      const cursorId = cursorIdRaw && cursorIdRaw !== '' 
        ? parseInt(cursorIdRaw, 10) 
        : null;

      // Validate cursor size range
      const cursorSize = cursorSizeRaw ? parseInt(cursorSizeRaw, 10) : 32;
      if (cursorSize < 16 || cursorSize > 64) {
        return json({ 
          success: false, 
          message: 'Cursor size must be between 16px and 64px' 
        });
      }

      // Parse isEnabled
      const isEnabled = isEnabledRaw === 'true';

      // If cursorId is provided, validate it exists
      if (cursorId) {
        const cursorExists = await db.cursor.findUnique({
          where: { id: cursorId },
        });

        if (!cursorExists) {
          return json({ 
            success: false, 
            message: 'Selected cursor not found' 
          });
        }
      }

      // Get existing settings to preserve other values
      const existingSettings = await db.cursorSettings.findUnique({
        where: { shop },
      });

      // Parse existing settings (Prisma returns JSON as object)
      const currentSettings = typeof existingSettings?.settings === 'string'
        ? JSON.parse(existingSettings.settings)
        : (existingSettings?.settings || {});
      
      const newSettings = {
        ...currentSettings,
        cursorSize,
      };

      // Update or create cursor settings
      await db.cursorSettings.upsert({
        where: { shop },
        update: {
          activeCursorId: cursorId,
          isEnabled,
          settings: JSON.stringify(newSettings),
        },
        create: {
          shop,
          activeCursorId: cursorId,
          isEnabled,
          settings: JSON.stringify(newSettings),
        },
      });

      return json({ 
        success: true, 
        message: cursorId ? 'Cursor published successfully' : 'Cursor reset to default' 
      });
    }

    return json({ 
      success: false, 
      message: 'Invalid action' 
    });
  } catch (error) {
    console.error('Error saving cursor settings:', error);
    return json({ 
      success: false, 
      message: 'Failed to save cursor settings. Please try again.' 
    }, { status: 500 });
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CursorsPage() {
  const { t } = useTranslation('cursors');
  const loaderData = useLoaderData();
  const { cursorsByCategory, cursors, activeCursorId, activeCursor, savedCursorSize, isEnabled: savedIsEnabled, error } = loaderData;
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
  // ENABLE/DISABLE STATE (Task 12)
  // ========================================================================
  // Controls whether custom cursor is active on storefront
  // ========================================================================
  const [isEnabled, setIsEnabled] = useState(savedIsEnabled);

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
    }
  }, [actionData]);

  // ========================================================================
  // SYNC SELECTED WITH ACTIVE AFTER SAVE (Task 6E-9)
  // ========================================================================
  useEffect(() => {
    // After successful save, sync selected cursor with active cursor from DB
    if (actionData?.success && activeCursorId !== selectedCursorId) {
      setSelectedCursorId(activeCursorId);
    }
  }, [activeCursorId, actionData, selectedCursorId]);

  useEffect(() => {
    // After successful save, sync cursor size with saved value from DB
    if (actionData?.success && savedCursorSize !== cursorSize) {
      setCursorSize(savedCursorSize);
    }
  }, [savedCursorSize, actionData, cursorSize]);

  // ========================================================================
  // CURSOR SELECTION HANDLER (Task 6B)
  // ========================================================================
  // Updates React state only - NO database write until "Save & Publish"
  // ========================================================================
  const handleCursorSelect = useCallback((cursorId) => {
    setSelectedCursorId(cursorId);
  }, []);

  // ========================================================================
  // UNSAVED CHANGES DETECTION (Task 6D-9-12)
  // ========================================================================
  // Check cursor selection, cursor size, AND enabled state changes
  const hasUnsavedChanges = 
    selectedCursorId !== activeCursorId || 
    cursorSize !== savedCursorSize ||
    isEnabled !== savedIsEnabled;

  // ========================================================================
  // RESET TO DEFAULT HANDLER (Task 6F)
  // ========================================================================
  const handleResetToDefault = useCallback(() => {
    setSelectedCursorId(null);
    setCursorSize(32);
    setIsEnabled(true);
  }, []);

  // ========================================================================
  // SAVE & PUBLISH HANDLER (Task 6E-9-12)
  // ========================================================================
  const handleSaveAndPublish = useCallback(() => {
    const formData = new FormData();
    formData.append('action', 'setActiveCursor');
    formData.append('cursorId', selectedCursorId || ''); // Handle null
    formData.append('cursorSize', cursorSize);
    formData.append('isEnabled', isEnabled.toString());
    
    submit(formData, { method: 'post' });
  }, [selectedCursorId, cursorSize, isEnabled, submit]);

  return (
    <Page title={t('page.title')}>
      {/* Error Banner */}
      {(error || (actionData && !actionData.success)) && (
        <Box paddingBlockEnd="400">
          <Banner
            title={t('banner.error.title')}
            tone="critical"
          >
            <p>{error || actionData?.message || t('banner.error.default')}</p>
          </Banner>
        </Box>
      )}

      {/* Disabled Banner */}
      {!isEnabled && !error && (
        <Box paddingBlockEnd="400">
          <Banner
            title={t('banner.disabled.title')}
            tone="warning"
            action={{
              content: t('banner.disabled.action'),
              onAction: () => {
                setIsEnabled(true);
              },
            }}
          >
            <p>{t('banner.disabled.description')}</p>
          </Banner>
        </Box>
      )}

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
            isEnabled={isEnabled}
            onToggleEnabled={setIsEnabled}
          />
        </Layout.Section>
      </Layout>

      {/* ACTION BUTTONS */}
      <Box paddingBlockStart="400">
        <InlineStack align="space-between">
          {/* Left: Reset Button */}
          <Button
            tone="critical"
            disabled={!hasUnsavedChanges || isLoading}
            onClick={handleResetToDefault}
            accessibilityLabel="Reset all cursor settings to default values"
          >
            {t('buttons.reset')}
          </Button>

          {/* Right: Save & Publish Button */}
          <Button
            variant="primary"
            disabled={!hasUnsavedChanges || isLoading}
            loading={isLoading}
            onClick={handleSaveAndPublish}
            accessibilityLabel={`Save and publish ${selectedCursor ? selectedCursor.name : 'default'} cursor with size ${cursorSize}px`}
          >
            {t('buttons.save')}
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
  // Format category name: PROFESSIONAL -> Professional
  const formatCategoryName = (cat) => {
    return cat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <BlockStack gap="400">
      {/* Category Header */}
      <Text as="h3" variant="headingSm" fontWeight="semibold">
        {formatCategoryName(category)}
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${cursor.name} cursor${isSelected ? ' (currently selected)' : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{
        border: isSelected ? '2px solid #005BD3' : (isHovering ? '2px solid #005BD3' : '1px solid #E1E3E5'),
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
        cursor: isHovering ? 'none' : 'pointer',
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

function PreviewPanel({ selectedCursor, cursorSize, onCursorSizeChange, isEnabled, onToggleEnabled }) {
  const { t } = useTranslation('cursors');
  
  // Format category name: PROFESSIONAL -> Professional
  const formatCategoryName = (cat) => {
    return cat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

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
              <Badge tone="info">{formatCategoryName(selectedCursor.category)}</Badge>
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

          {/* Enable/Disable Toggle (Task 12) */}
          <BlockStack gap="200">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text as="p" variant="bodyMd">
                Custom Cursor Status
              </Text>
              <Button
                variant={isEnabled ? "primary" : "plain"}
                tone={isEnabled ? "success" : "critical"}
                onClick={() => onToggleEnabled(!isEnabled)}
                size="slim"
              >
                {isEnabled ? t('buttons.enable') : t('buttons.disable')}
              </Button>
            </div>
            <Text as="p" variant="bodySm" tone="subdued">
              {isEnabled 
                ? 'Your custom cursor is active and will be displayed on your storefront.' 
                : 'Your custom cursor is disabled. Click "Enable" above to activate it.'}
            </Text>
          </BlockStack>

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
              label={`Cursor size: ${cursorSize}px (${Math.round((cursorSize / 32) * 100)}%)`}
              labelHidden
              value={cursorSize}
              onChange={onCursorSizeChange}
              min={16}
              max={64}
              step={1}
              output
              helpText={`Adjust the size of your custom cursor between 16px and 64px. Current size: ${cursorSize}px`}
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
      role="region"
      aria-label={selectedCursor ? `Preview of ${selectedCursor.name} cursor at ${cursorSize}px` : 'Cursor preview - no cursor selected'}
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
        cursor: selectedCursor && isHovering ? 'none' : 'default',
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
