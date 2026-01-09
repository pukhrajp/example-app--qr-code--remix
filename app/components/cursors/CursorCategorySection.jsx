import { useTranslation } from "react-i18next";
import { Text, BlockStack } from "@shopify/polaris";
import { useCursor } from "../../contexts/CursorContext";
import CursorCard from "./CursorCard";

/**
 * CursorCategorySection Component
 * 
 * Displays a category of cursors with:
 * - Category heading
 * - Grid of cursor cards
 */
export default function CursorCategorySection({ category, cursors }) {
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

