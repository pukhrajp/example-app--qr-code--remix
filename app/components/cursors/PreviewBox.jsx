import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  BlockStack,
  Box,
  Button,
} from "@shopify/polaris";
import { useCursor } from "../../contexts/CursorContext";

/**
 * PreviewBox Component
 * 
 * Displays an interactive preview area where users can see their selected cursor
 * in action with hover states and real-time size adjustments.
 * 
 * Features:
 * - Shows selected cursor at current size
 * - Custom cursor follows mouse movement
 * - Demonstrates hover state on interactive button
 * - Empty state when no cursor selected
 */
export default function PreviewBox({ selectedCursor }) {
  const { t } = useTranslation('cursors');
  const { cursorSize } = useCursor();
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Track mouse position for custom cursor
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Determine which cursor image to use based on hover state
  const currentCursorImage = isHoveringButton && selectedCursor?.hoverImageUrl 
    ? selectedCursor.hoverImageUrl 
    : selectedCursor?.imageUrl;

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
          {/* Cursor Image Display */}
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

            {/* Interactive Demo Button - Shows hover cursor on button hover */}
            {selectedCursor.hoverImageUrl && (
              <Box paddingBlockStart="400">
                <style>{`
                  .cursor-demo-wrapper,
                  .cursor-demo-wrapper *,
                  .cursor-demo-wrapper button,
                  .cursor-demo-wrapper button *,
                  .cursor-demo-wrapper button:hover,
                  .cursor-demo-wrapper button:hover * {
                    cursor: none !important;
                  }
                `}</style>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    className="cursor-demo-wrapper"
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                  >
                    <Button 
                      variant="primary"
                      id="cursor-demo-button"
                    >
                      {t('preview.demo.button')}
                    </Button>
                  </div>
                </div>
                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                    {t('preview.demo.hint')}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* Grid Pattern Background */}
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

          {/* Custom Cursor Following Mouse */}
          {isHovering && currentCursorImage && (
            <img
              src={currentCursorImage}
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

