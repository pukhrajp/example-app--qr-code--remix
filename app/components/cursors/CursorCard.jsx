import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import {
  Text,
  Box,
  Badge,
  Icon,
  Button,
  Modal,
  BlockStack,
  Banner,
} from "@shopify/polaris";
import { CheckSmallIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useCursor } from "../../contexts/CursorContext";

/**
 * CursorCard Component
 * 
 * Displays an individual cursor in the gallery with:
 * - Cursor preview image
 * - Selection state
 * - Custom badge for uploaded cursors
 * - Delete functionality for custom cursors
 * - Hover preview with actual size
 */
export default function CursorCard({ cursor, isSelected, onClick }) {
  const { t } = useTranslation('cursors');
  const { cursorSize } = useCursor();
  const submit = useSubmit();
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isCustomCursor = cursor.type === 'custom';

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

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    const formData = new FormData();
    formData.append('action', 'deleteCustomCursor');
    formData.append('cursorId', cursor.id.toString());
    submit(formData, { method: 'post' });
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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

      {/* Delete Button (only for custom cursors) */}
      {isCustomCursor && !isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
          }}
        >
          <Button
            icon={DeleteIcon}
            onClick={handleDeleteClick}
            tone="critical"
            variant="plain"
            size="slim"
            accessibilityLabel={t('aria.deleteCursor', { name: cursor.name })}
          />
        </div>
      )}

      {/* Custom Badge */}
      {isCustomCursor && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
          }}
        >
          <Badge tone="success">{t('badge.custom')}</Badge>
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

      {/* Custom Cursor Following Mouse */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={handleCancelDelete}
        title={t('delete.modal.title')}
        primaryAction={{
          content: t('delete.modal.confirm'),
          onAction: handleConfirmDelete,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: t('delete.modal.cancel'),
            onAction: handleCancelDelete,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p">
              {t('delete.modal.message', { name: cursor.name })}
            </Text>
            <Banner tone="warning">
              <p>{t('delete.modal.warning')}</p>
            </Banner>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}

