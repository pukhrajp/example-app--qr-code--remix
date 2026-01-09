import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Page,
  Layout,
  Box,
  Button,
  InlineStack,
  Banner,
  DropZone,
  Thumbnail,
  InlineError,
  TextField,
  Text,
  BlockStack,
  Card,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { CursorProvider, useCursor } from "../contexts/CursorContext";
import CursorGalleryPanel from "../components/cursors/CursorGalleryPanel";
import PreviewPanel from "../components/cursors/PreviewPanel";

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

    if (action === 'uploadCustomCursor') {
      // Extract form data
      const name = formData.get('name');
      const description = formData.get('description') || '';
      const imageUrl = formData.get('imageUrl'); // Data URL
      const hoverImageUrl = formData.get('hoverImageUrl'); // Data URL (optional)
      const width = parseInt(formData.get('width'), 10);
      const height = parseInt(formData.get('height'), 10);
      const fileSize = parseInt(formData.get('fileSize'), 10);
      const hotspotX = parseInt(formData.get('hotspotX'), 10);
      const hotspotY = parseInt(formData.get('hotspotY'), 10);

      // Validate required fields
      if (!name || !imageUrl) {
        return json({ 
          success: false, 
          action: 'uploadCustomCursor',
          messageKey: 'errors:missingFields'
        });
      }

      // Create custom cursor in database
      const newCursor = await db.cursor.create({
        data: {
          shop,
          name: name.trim(),
          description: description.trim(),
          category: 'CUSTOM',
          type: 'custom',
          imageUrl,
          hoverImageUrl: hoverImageUrl || null,
          hotspotX,
          hotspotY,
          width,
          height,
          fileSize,
          isPublished: true,
          isActive: false,
        },
      });

      return json({ 
        success: true, 
        action: 'uploadCustomCursor',
        cursorId: newCursor.id,
        messageKey: 'cursors:toast.uploadSuccess'
      });
    }

    if (action === 'deleteCustomCursor') {
      const cursorIdRaw = formData.get('cursorId');
      const cursorId = cursorIdRaw ? parseInt(cursorIdRaw, 10) : null;

      if (!cursorId) {
        return json({ 
          success: false, 
          action: 'deleteCustomCursor',
          messageKey: 'errors:invalidCursorId'
        });
      }

      // Find the cursor to delete
      const cursorToDelete = await db.cursor.findUnique({
        where: { id: cursorId },
      });

      // Validate cursor exists
      if (!cursorToDelete) {
        return json({ 
          success: false, 
          action: 'deleteCustomCursor',
          messageKey: 'errors:notFound'
        });
      }

      // Validate cursor belongs to this shop (security check)
      if (cursorToDelete.shop !== shop) {
        return json({ 
          success: false, 
          action: 'deleteCustomCursor',
          messageKey: 'errors:unauthorized'
        });
      }

      // Validate cursor is custom type (can't delete gallery cursors)
      if (cursorToDelete.type !== 'custom') {
        return json({ 
          success: false, 
          action: 'deleteCustomCursor',
          messageKey: 'errors:cannotDeleteGallery'
        });
      }

      // Check if this cursor is currently active
      const settings = await db.cursorSettings.findUnique({
        where: { shop },
      });

      const isActive = settings?.activeCursorId === cursorId;

      // Delete the cursor
      await db.cursor.delete({
        where: { id: cursorId },
      });

      // If this was the active cursor, clear the active cursor setting
      if (isActive && settings) {
        await db.cursorSettings.update({
          where: { shop },
          data: {
            activeCursorId: null,
          },
        });
      }

      return json({ 
        success: true, 
        action: 'deleteCustomCursor',
        wasActive: isActive,
        messageKey: isActive ? 'cursors:toast.deleteSuccessActive' : 'cursors:toast.deleteSuccess'
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
  
  // Track previous actionData to prevent duplicate toasts
  const prevActionDataRef = useRef(null);
  
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
    // Only show toast if actionData has actually changed (not just dependencies)
    if (actionData && actionData !== prevActionDataRef.current) {
      prevActionDataRef.current = actionData;
      
      if (actionData.success) {
        const messageKey = actionData.messageKey || 'cursors:toast.success';
        const [namespace, key] = messageKey.includes(':') 
          ? messageKey.split(':') 
          : ['cursors', messageKey];
        
        shopify.toast.show(t(key, { ns: namespace }), {
          duration: 3000,
        });
        
        // If a cursor was deleted and it was selected, reset selection
        if (actionData.action === 'deleteCustomCursor' && selectedCursor && !cursors.find(c => c.id === selectedCursorId)) {
          resetToDefault();
        }
      } else if (actionData.success === false && actionData.messageKey) {
        // Show error toast for failures
        const [namespace, key] = actionData.messageKey.includes(':')
          ? actionData.messageKey.split(':')
          : ['cursors', actionData.messageKey];
        
        shopify.toast.show(t(key, { ns: namespace }), {
          duration: 5000,
          isError: true,
        });
      }
    }
  }, [actionData, t, selectedCursor, selectedCursorId, cursors, resetToDefault]);

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

      {/* RIGHT COLUMN - Preview & Settings */}
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

