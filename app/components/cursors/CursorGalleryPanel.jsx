import { useState, useCallback, useEffect } from "react";
import { useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Card, Tabs } from "@shopify/polaris";
import GalleryTabContent from "./GalleryTabContent";
import UploadTabContent from "./UploadTabContent";

/**
 * CursorGalleryPanel Component
 * 
 * Left column panel with tabs for:
 * - Gallery: Browse and select pre-made cursors
 * - Upload: Upload custom cursor images
 */
export default function CursorGalleryPanel({ cursorsByCategory, cursors }) {
  const { t } = useTranslation('cursors');
  const [selectedTab, setSelectedTab] = useState(0);
  const actionData = useActionData();

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  }, []);
  
  // Switch to gallery tab after successful upload
  useEffect(() => {
    if (actionData?.success && actionData?.action === 'uploadCustomCursor') {
      setSelectedTab(0); // Switch to gallery tab
    }
  }, [actionData]);

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

