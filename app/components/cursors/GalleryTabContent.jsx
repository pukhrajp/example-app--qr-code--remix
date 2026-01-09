import { useTranslation } from "react-i18next";
import { EmptyState, BlockStack } from "@shopify/polaris";
import CursorCategorySection from "./CursorCategorySection";

/**
 * GalleryTabContent Component
 * 
 * Displays the gallery tab with all available cursors organized by category
 */
export default function GalleryTabContent({ cursorsByCategory, cursors }) {
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

