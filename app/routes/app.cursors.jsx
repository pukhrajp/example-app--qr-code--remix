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
import LanguageSwitcher from "../components/LanguageSwitcher";
import { CursorProvider, useCursor } from "../contexts/CursorContext";

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
          messageKey: 'errors:sizeRange'
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
            messageKey: 'errors:notFound'
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
        messageKey: cursorId ? 'cursors:toast.success' : 'cursors:toast.reset'
      });
    }

    return json({ 
      success: false, 
      messageKey: 'errors:invalidAction'
    });
  } catch (error) {
    console.error('Error saving cursor settings:', error);
    return json({ 
      success: false, 
      messageKey: 'errors:saveFailed'
    }, { status: 500 });
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CursorsPage() {
  const loaderData = useLoaderData();
  const { cursorsByCategory, cursors, activeCursorId, activeCursor, savedCursorSize, isEnabled: savedIsEnabled, error } = loaderData;

  // Wrap entire page with CursorProvider to eliminate prop drilling
  return (
    <CursorProvider
      initialSelectedCursorId={activeCursorId}
      initialCursorSize={savedCursorSize}
      initialIsEnabled={savedIsEnabled}
    >
      <CursorsPageContent 
        cursorsByCategory={cursorsByCategory}
        cursors={cursors}
        activeCursorId={activeCursorId}
        activeCursor={activeCursor}
        savedCursorSize={savedCursorSize}
        savedIsEnabled={savedIsEnabled}
        error={error}
      />
    </CursorProvider>
  );
}

// ============================================================================
// CURSORS PAGE CONTENT (uses CursorContext)
// ============================================================================

function CursorsPageContent({ cursorsByCategory, cursors, activeCursorId, savedCursorSize, savedIsEnabled, error }) {
  const { t } = useTranslation('cursors');
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  
  // Access cursor state from context (no more local state!)
  const {
    selectedCursorId,
    cursorSize,
    isEnabled,
    selectCursor,
    resetToDefault,
  } = useCursor();

  // Derive selected cursor object from ID
  const selectedCursor = selectedCursorId 
    ? cursors.find(cursor => cursor.id === selectedCursorId) 
    : null;

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  const isLoading = navigation.state === "submitting" || navigation.state === "loading";

  // ========================================================================
  // TOAST NOTIFICATION WITH i18n
  // ========================================================================
  useEffect(() => {
    if (actionData?.success) {
      const messageKey = actionData.messageKey || 'cursors:toast.success';
      const [namespace, key] = messageKey.includes(':') 
        ? messageKey.split(':') 
        : ['cursors', messageKey];
      
      shopify.toast.show(t(key, { ns: namespace }), {
        duration: 3000,
      });
    } else if (actionData?.success === false && actionData?.messageKey) {
      // Show error toast for failures
      const [namespace, key] = actionData.messageKey.includes(':')
        ? actionData.messageKey.split(':')
        : ['cursors', actionData.messageKey];
      
      shopify.toast.show(t(key, { ns: namespace }), {
        duration: 5000,
        isError: true,
      });
    }
  }, [actionData, t]);

  // ========================================================================
  // SYNC WITH DATABASE AFTER SAVE
  // ========================================================================
  // After successful save, context state is automatically synced because
  // the provider re-initializes with new DB values on page reload/navigation
  // No manual sync needed - Remix handles this!

  // ========================================================================
  // UNSAVED CHANGES DETECTION
  // ========================================================================
  // Compare current context state with initial DB values
  const hasUnsavedChanges = 
    selectedCursorId !== activeCursorId || 
    cursorSize !== savedCursorSize ||
    isEnabled !== savedIsEnabled;

  // ========================================================================
  // SAVE & PUBLISH HANDLER
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
    <Page 
      title={t('page.title')}
      secondaryActions={[
        {
          content: <LanguageSwitcher />,
          plain: true,
        }
      ]}
    >
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
                // Context action is already available
                // Will be handled by PreviewPanel component
              },
            }}
          >
            <p>{t('banner.disabled.description')}</p>
          </Banner>
        </Box>
      )}

      <Layout>
        {/* LEFT COLUMN - Cursor Gallery (NO PROPS!) */}
        <Layout.Section variant="oneThird">
          <CursorGalleryPanel 
            cursorsByCategory={cursorsByCategory}
            cursors={cursors}
          />
        </Layout.Section>

        {/* RIGHT COLUMN - Preview & Settings (NO PROPS!) */}
        <Layout.Section variant="oneThird">
          <PreviewPanel selectedCursor={selectedCursor} />
        </Layout.Section>
      </Layout>

      {/* ACTION BUTTONS */}
      <Box paddingBlockStart="400">
        <InlineStack align="space-between">
          {/* Left: Reset Button */}
          <Button
            tone="critical"
            disabled={!hasUnsavedChanges || isLoading}
            onClick={resetToDefault}
            accessibilityLabel={t('aria.resetButton')}
          >
            {t('buttons.reset')}
          </Button>

          {/* Right: Save & Publish Button */}
          <Button
            variant="primary"
            disabled={!hasUnsavedChanges || isLoading}
            loading={isLoading}
            onClick={handleSaveAndPublish}
            accessibilityLabel={t('aria.saveButton', { 
              name: selectedCursor ? selectedCursor.name : 'default',
              size: cursorSize 
            })}
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

function CursorGalleryPanel({ cursorsByCategory, cursors }) {
  const { t } = useTranslation('cursors');
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);

  const tabs = [
    {
      id: 'gallery',
      content: t('tabs.gallery'),
    },
    {
      id: 'upload',
      content: t('tabs.upload'),
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

function GalleryTabContent({ cursorsByCategory, cursors }) {
  const { t } = useTranslation('cursors');
  
  if (cursors.length === 0) {
    return (
      <EmptyState
        heading={t('empty.gallery.title')}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>{t('empty.gallery.description')}</p>
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
        />
      ))}
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CATEGORY SECTION
// ============================================================================

function CursorCategorySection({ category, cursors }) {
  const { t } = useTranslation('cursors');
  const { selectedCursorId, selectCursor } = useCursor();
  
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
        {t(`categories.${category.toLowerCase()}`, formatCategoryName(category))}
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
            onClick={() => selectCursor(cursor.id)}
          />
        ))}
      </div>
    </BlockStack>
  );
}

// ============================================================================
// CURSOR CARD COMPONENT
// ============================================================================

function CursorCard({ cursor, isSelected, onClick }) {
  const { t } = useTranslation('cursors');
  const { cursorSize } = useCursor(); // Get cursorSize from context!
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
      aria-label={t('aria.selectCursor', { 
        name: cursor.name, 
        status: isSelected ? ' (currently selected)' : '' 
      })}
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
      {/* Selected Badge */}
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
              {t('badge.selected')}
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
  const { t } = useTranslation('cursors');
  
  return (
    <EmptyState
      heading={t('empty.upload.title')}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>{t('empty.upload.description')}</p>
    </EmptyState>
  );
}

// ============================================================================
// RIGHT COLUMN - PREVIEW PANEL
// ============================================================================

function PreviewPanel({ selectedCursor }) {
  const { t } = useTranslation('cursors');
  const { cursorSize, setCursorSize, isEnabled, setIsEnabled } = useCursor();
  
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
              {t('preview.title')}
            </Text>
            {selectedCursor && (
              <Badge tone="info">{formatCategoryName(selectedCursor.category)}</Badge>
            )}
          </div>

          {/* Preview Box (Task 6C-8 - Shows Selected Cursor with Size) */}
          <PreviewBox selectedCursor={selectedCursor} />

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

      {/* Settings Card */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            {t('settings.title')}
          </Text>

          {/* Enable/Disable Toggle */}
          <BlockStack gap="200">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text as="p" variant="bodyMd">
                {t('settings.appStatus.label')}
              </Text>
              <Button
                variant={isEnabled ? "primary" : "plain"}
                tone={isEnabled ? "success" : "critical"}
                onClick={() => setIsEnabled(!isEnabled)}
                size="slim"
              >
                {isEnabled ? t('buttons.enable') : t('buttons.disable')}
              </Button>
            </div>
            <Text as="p" variant="bodySm" tone="subdued">
              {isEnabled 
                ? t('settings.appStatus.enabled')
                : t('settings.appStatus.disabled')}
            </Text>
          </BlockStack>

          {/* Cursor Size Slider */}
          <BlockStack gap="200">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text as="p" variant="bodyMd">
                {t('settings.size.label')}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {t('settings.size.current', { size: cursorSize, percentage: Math.round((cursorSize / 32) * 100) })}
              </Text>
            </div>
            <RangeSlider
              label={t('settings.size.current', { size: cursorSize, percentage: Math.round((cursorSize / 32) * 100) })}
              labelHidden
              value={cursorSize}
              onChange={setCursorSize}
              min={16}
              max={64}
              step={1}
              output
              helpText={t('settings.size.help')}
            />
            <Text as="p" variant="bodySm" tone="subdued">
              {t('settings.size.help')}
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

function PreviewBox({ selectedCursor }) {
  const { t } = useTranslation('cursors');
  const { cursorSize } = useCursor(); // Get cursorSize from context!
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
      aria-label={selectedCursor ? t('aria.previewRegion', { name: selectedCursor.name, size: cursorSize }) : t('aria.previewEmpty')}
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

          {/* Preview Instructions */}
          <Box paddingBlockStart="400">
            <Text as="p" variant="bodySm" alignment="center" tone="subdued">
              {t('preview.instructions')}
            </Text>
            <Box paddingBlockStart="100">
              <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                {t('preview.currentSize', { size: cursorSize, percentage: Math.round((cursorSize / 32) * 100) })}
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
            {t('preview.empty.heading')}
          </Text>
          <Text as="p" variant="bodySm" alignment="center" tone="subdued">
            {t('preview.empty.description')}
          </Text>
        </BlockStack>
      )}
    </div>
  );
}
