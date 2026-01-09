import { useTranslation } from "react-i18next";
import {
  Card,
  Text,
  BlockStack,
  Box,
  Badge,
  Button,
  RangeSlider,
} from "@shopify/polaris";
import { useCursor } from "../../contexts/CursorContext";
import PreviewBox from "./PreviewBox";

/**
 * PreviewPanel Component
 * 
 * Displays the right column of the cursor dashboard with:
 * - Interactive cursor preview
 * - Cursor settings (size slider, enable/disable toggle)
 * - Selected cursor information
 */
export default function PreviewPanel({ selectedCursor }) {
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

          {/* Preview Box */}
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

