import { useState, useCallback, useEffect } from "react";
import { useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import {
  BlockStack,
  Banner,
  Card,
  Text,
  Badge,
  DropZone,
  InlineStack,
  Thumbnail,
  Button,
  InlineError,
  TextField,
} from "@shopify/polaris";
import { useCursor } from "../../contexts/CursorContext";

/**
 * UploadTabContent Component
 * 
 * Handles custom cursor upload with:
 * - Default and hover image uploads
 * - Visual hotspot picker
 * - Metadata form (name, description)
 * - File validation
 * - Form submission
 */
export default function UploadTabContent() {
  const { t } = useTranslation('cursors');
  const submit = useSubmit();
  const navigation = useNavigation();
  const { selectCursor } = useCursor();
  
  // Default cursor state
  const [defaultFile, setDefaultFile] = useState(null);
  const [defaultFilePreview, setDefaultFilePreview] = useState(null);
  const [defaultValidationError, setDefaultValidationError] = useState(null);
  const [defaultDimensions, setDefaultDimensions] = useState({ width: 0, height: 0 });
  
  // Hover cursor state
  const [hoverFile, setHoverFile] = useState(null);
  const [hoverFilePreview, setHoverFilePreview] = useState(null);
  const [hoverValidationError, setHoverValidationError] = useState(null);
  const [hoverDimensions, setHoverDimensions] = useState({ width: 0, height: 0 });
  
  // Hotspot state
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  const [useCustomHotspot, setUseCustomHotspot] = useState(false);
  
  // Metadata state
  const [cursorName, setCursorName] = useState('');
  const [cursorDescription, setCursorDescription] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Loading state
  const isUploading = navigation.state === "submitting";
  const actionData = useActionData();
  
  // Allowed file types
  const ALLOWED_TYPES = ['image/png', 'image/svg+xml', 'image/x-icon', '.cur'];
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  
  // File validation
  const validateFile = useCallback((file) => {
    const isValidType = ALLOWED_TYPES.some(type => 
      file.type === type || file.name.toLowerCase().endsWith('.cur')
    );
    
    if (!isValidType) {
      return t('upload.validation.invalidType');
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return t('upload.validation.tooLarge');
    }
    
    return null;
  }, [t]);
  
  // Handle default cursor upload
  const handleDefaultDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) {
      setDefaultValidationError(t('upload.validation.noFile'));
      return;
    }
    
    const error = validateFile(selectedFile);
    if (error) {
      setDefaultValidationError(error);
      setDefaultFile(null);
      setDefaultFilePreview(null);
      return;
    }
    
    setDefaultValidationError(null);
    setDefaultFile(selectedFile);
    
    // Generate preview and extract dimensions
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setDefaultFilePreview(dataUrl);
      
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        setDefaultDimensions({ width, height });
        
        if (!useCustomHotspot) {
          setHotspot({
            x: Math.floor(width / 2),
            y: Math.floor(height / 2)
          });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(selectedFile);
  }, [validateFile, t, useCustomHotspot]);
  
  // Handle hover cursor upload
  const handleHoverDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) {
      setHoverValidationError(t('upload.validation.noFile'));
      return;
    }
    
    const error = validateFile(selectedFile);
    if (error) {
      setHoverValidationError(error);
      setHoverFile(null);
      setHoverFilePreview(null);
      return;
    }
    
    setHoverValidationError(null);
    setHoverFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setHoverFilePreview(dataUrl);
      
      const img = new Image();
      img.onload = () => {
        setHoverDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(selectedFile);
  }, [validateFile, t]);
  
  // Remove files
  const handleRemoveDefaultFile = useCallback(() => {
    setDefaultFile(null);
    setDefaultFilePreview(null);
    setDefaultValidationError(null);
    setDefaultDimensions({ width: 0, height: 0 });
    setHotspot({ x: 0, y: 0 });
    setUseCustomHotspot(false);
  }, []);
  
  const handleRemoveHoverFile = useCallback(() => {
    setHoverFile(null);
    setHoverFilePreview(null);
    setHoverValidationError(null);
    setHoverDimensions({ width: 0, height: 0 });
  }, []);
  
  // Form validation
  const validateForm = useCallback(() => {
    let isValid = true;
    
    if (!cursorName || cursorName.trim() === '') {
      setNameError(t('upload.validation.nameRequired'));
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!defaultFile) {
      setDefaultValidationError(t('upload.validation.defaultImageRequired'));
      isValid = false;
    }
    
    return isValid;
  }, [cursorName, defaultFile, t]);
  
  // Handle upload
  const handleUpload = useCallback(() => {
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData();
    formData.append('action', 'uploadCustomCursor');
    formData.append('name', cursorName.trim());
    formData.append('description', cursorDescription.trim());
    formData.append('imageUrl', defaultFilePreview);
    formData.append('width', defaultDimensions.width.toString());
    formData.append('height', defaultDimensions.height.toString());
    formData.append('fileSize', defaultFile.size.toString());
    formData.append('hotspotX', hotspot.x.toString());
    formData.append('hotspotY', hotspot.y.toString());
    
    if (hoverFile && hoverFilePreview) {
      formData.append('hoverImageUrl', hoverFilePreview);
    }
    
    submit(formData, { method: 'post' });
  }, [validateForm, cursorName, cursorDescription, defaultFilePreview, defaultDimensions, defaultFile, hoverFile, hoverFilePreview, hotspot, submit]);
  
  const canUpload = defaultFile && cursorName.trim() !== '' && !isUploading;
  
  // Handle successful upload
  useEffect(() => {
    if (actionData?.success && actionData?.action === 'uploadCustomCursor' && actionData?.cursorId) {
      selectCursor(actionData.cursorId);
      
      // Clear form
      setDefaultFile(null);
      setDefaultFilePreview(null);
      setDefaultValidationError(null);
      setDefaultDimensions({ width: 0, height: 0 });
      setHoverFile(null);
      setHoverFilePreview(null);
      setHoverValidationError(null);
      setHoverDimensions({ width: 0, height: 0 });
      setCursorName('');
      setCursorDescription('');
      setNameError('');
      setHotspot({ x: 0, y: 0 });
      setUseCustomHotspot(false);
    }
  }, [actionData, selectCursor]);
  
  // File upload markups
  const defaultFileUpload = !defaultFile && (
    <DropZone.FileUpload actionHint={t('upload.dropzone.hint')} />
  );
  
  const hoverFileUpload = !hoverFile && (
    <DropZone.FileUpload actionHint={t('upload.dropzone.hint')} />
  );
  
  const uploadedDefaultFile = defaultFile && (
    <InlineStack gap="400" align="space-between" blockAlign="center">
      <InlineStack gap="400" blockAlign="center">
        <Thumbnail
          size="large"
          alt={defaultFile.name}
          source={defaultFilePreview || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
        />
        <div>
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {defaultFile.name}
          </Text>
          <Text variant="bodySm" as="p" tone="subdued">
            {(defaultFile.size / 1024).toFixed(2)} KB
          </Text>
        </div>
      </InlineStack>
      <Button onClick={handleRemoveDefaultFile} tone="critical" variant="plain">
        {t('upload.buttons.remove')}
      </Button>
    </InlineStack>
  );
  
  const uploadedHoverFile = hoverFile && (
    <InlineStack gap="400" align="space-between" blockAlign="center">
      <InlineStack gap="400" blockAlign="center">
        <Thumbnail
          size="large"
          alt={hoverFile.name}
          source={hoverFilePreview || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
        />
        <div>
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {hoverFile.name}
          </Text>
          <Text variant="bodySm" as="p" tone="subdued">
            {(hoverFile.size / 1024).toFixed(2)} KB
          </Text>
        </div>
      </InlineStack>
      <Button onClick={handleRemoveHoverFile} tone="critical" variant="plain">
        {t('upload.buttons.remove')}
      </Button>
    </InlineStack>
  );
  
  return (
    <BlockStack gap="400">
      <Banner tone="info">
        <p>{t('upload.instructions')}</p>
      </Banner>
      
      {/* Default Cursor Upload */}
      <Card>
        <BlockStack gap="400">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text variant="headingSm" as="h3" fontWeight="semibold">
              {t('upload.defaultCursor.label')}
            </Text>
            <Badge tone="attention">{t('upload.defaultCursor.required')}</Badge>
          </div>
          <Text variant="bodySm" as="p" tone="subdued">
            {t('upload.defaultCursor.description')}
          </Text>
          
          <DropZone
            accept="image/png,image/svg+xml,image/x-icon,.cur"
            type="image"
            onDrop={handleDefaultDropZoneDrop}
            allowMultiple={false}
            errorOverlayText={t('upload.dropzone.error')}
            label={t('upload.dropzone.labelDefault')}
          >
            {uploadedDefaultFile}
            {defaultFileUpload}
          </DropZone>
          
          {defaultValidationError && (
            <InlineError message={defaultValidationError} fieldID="default-file-upload" />
          )}
          
          {defaultFile && defaultFilePreview && (
            <div
              style={{
                width: '100%',
                minHeight: '100px',
                border: '2px dashed #C9CCCF',
                borderRadius: '8px',
                backgroundColor: '#F6F6F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <img
                src={defaultFilePreview}
                alt={t('upload.preview.altDefault')}
                style={{
                  maxWidth: '48px',
                  maxHeight: '48px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </BlockStack>
      </Card>
      
      {/* Hover Cursor Upload */}
      <Card>
        <BlockStack gap="400">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text variant="headingSm" as="h3" fontWeight="semibold">
              {t('upload.hoverCursor.label')}
            </Text>
            <Badge tone="info">{t('upload.hoverCursor.optional')}</Badge>
          </div>
          <Text variant="bodySm" as="p" tone="subdued">
            {t('upload.hoverCursor.description')}
          </Text>
          
          <DropZone
            accept="image/png,image/svg+xml,image/x-icon,.cur"
            type="image"
            onDrop={handleHoverDropZoneDrop}
            allowMultiple={false}
            errorOverlayText={t('upload.dropzone.error')}
            label={t('upload.dropzone.labelHover')}
          >
            {uploadedHoverFile}
            {hoverFileUpload}
          </DropZone>
          
          {hoverValidationError && (
            <InlineError message={hoverValidationError} fieldID="hover-file-upload" />
          )}
          
          {hoverFile && hoverFilePreview && (
            <div
              style={{
                width: '100%',
                minHeight: '100px',
                border: '2px dashed #C9CCCF',
                borderRadius: '8px',
                backgroundColor: '#F6F6F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <img
                src={hoverFilePreview}
                alt={t('upload.preview.altHover')}
                style={{
                  maxWidth: '48px',
                  maxHeight: '48px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </BlockStack>
      </Card>
      
      {/* Both Files Preview */}
      {defaultFile && defaultFilePreview && hoverFile && hoverFilePreview && (
        <Card>
          <BlockStack gap="400">
            <Text variant="headingSm" as="h3">
              {t('upload.preview.titleBoth')}
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <BlockStack gap="200">
                  <Text variant="bodySm" as="p" fontWeight="semibold" alignment="center">
                    {t('upload.preview.defaultLabel')}
                  </Text>
                  <div
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      border: '2px solid #005BD3',
                      borderRadius: '8px',
                      backgroundColor: '#F6F6F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                  >
                    <img
                      src={defaultFilePreview}
                      alt={t('upload.preview.altDefault')}
                      style={{
                        maxWidth: '48px',
                        maxHeight: '48px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </BlockStack>
              </div>
              
              <div>
                <BlockStack gap="200">
                  <Text variant="bodySm" as="p" fontWeight="semibold" alignment="center">
                    {t('upload.preview.hoverLabel')}
                  </Text>
                  <div
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      border: '2px solid #8C9196',
                      borderRadius: '8px',
                      backgroundColor: '#F6F6F7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                  >
                    <img
                      src={hoverFilePreview}
                      alt={t('upload.preview.altHover')}
                      style={{
                        maxWidth: '48px',
                        maxHeight: '48px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </BlockStack>
              </div>
            </div>
            <Text variant="bodySm" as="p" tone="subdued" alignment="center">
              {t('upload.preview.bothHint')}
            </Text>
          </BlockStack>
        </Card>
      )}
      
      {/* Hotspot Picker */}
      {defaultFile && defaultFilePreview && defaultDimensions.width > 0 && (
        <Card>
          <BlockStack gap="400">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="headingSm" as="h3" fontWeight="semibold">
                {t('upload.hotspot.title')}
              </Text>
              <Button
                variant="plain"
                onClick={() => {
                  setHotspot({
                    x: Math.floor(defaultDimensions.width / 2),
                    y: Math.floor(defaultDimensions.height / 2)
                  });
                  setUseCustomHotspot(false);
                }}
              >
                {t('upload.hotspot.resetToCenter')}
              </Button>
            </div>
            
            <Text variant="bodySm" as="p" tone="subdued">
              {t('upload.hotspot.description')}
            </Text>
            
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                border: '2px solid #005BD3',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'crosshair',
                maxWidth: '100%',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const img = e.currentTarget.querySelector('img');
                if (!img) return;
                
                const imgRect = img.getBoundingClientRect();
                const scaleX = defaultDimensions.width / imgRect.width;
                const scaleY = defaultDimensions.height / imgRect.height;
                
                const x = Math.round((e.clientX - imgRect.left) * scaleX);
                const y = Math.round((e.clientY - imgRect.top) * scaleY);
                
                const clampedX = Math.max(0, Math.min(x, defaultDimensions.width));
                const clampedY = Math.max(0, Math.min(y, defaultDimensions.height));
                
                setHotspot({ x: clampedX, y: clampedY });
                setUseCustomHotspot(true);
              }}
            >
              <img
                src={defaultFilePreview}
                alt={t('upload.hotspot.imageAlt')}
                style={{
                  display: 'block',
                  maxWidth: '400px',
                  maxHeight: '400px',
                  width: 'auto',
                  height: 'auto',
                }}
              />
              
              {hotspot.x > 0 && hotspot.y > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(hotspot.x / defaultDimensions.width) * 100}%`,
                    top: `${(hotspot.y / defaultDimensions.height) * 100}%`,
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '0',
                      width: '2px',
                      height: '100%',
                      backgroundColor: '#FF0000',
                      transform: 'translateX(-50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '0',
                      top: '50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#FF0000',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FF0000',
                      border: '2px solid white',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              )}
            </div>
            
            <InlineStack gap="400" align="space-between">
              <Text variant="bodySm" as="p">
                {t('upload.hotspot.coordinates', { x: hotspot.x, y: hotspot.y })}
              </Text>
              {useCustomHotspot && (
                <Badge tone="success">{t('upload.hotspot.custom')}</Badge>
              )}
              {!useCustomHotspot && hotspot.x > 0 && (
                <Badge tone="info">{t('upload.hotspot.default')}</Badge>
              )}
            </InlineStack>
            
            <Banner tone="info">
              <p>{t('upload.hotspot.hint')}</p>
            </Banner>
          </BlockStack>
        </Card>
      )}
      
      {/* Metadata Form */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingSm" as="h3" fontWeight="semibold">
            {t('upload.metadata.title')}
          </Text>
          
          <TextField
            label={t('upload.metadata.name.label')}
            value={cursorName}
            onChange={setCursorName}
            placeholder={t('upload.metadata.name.placeholder')}
            helpText={t('upload.metadata.name.help')}
            error={nameError}
            autoComplete="off"
            requiredIndicator
          />
          
          <TextField
            label={t('upload.metadata.description.label')}
            value={cursorDescription}
            onChange={setCursorDescription}
            placeholder={t('upload.metadata.description.placeholder')}
            helpText={t('upload.metadata.description.help')}
            autoComplete="off"
            multiline={3}
          />
        </BlockStack>
      </Card>
      
      {/* Upload Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="primary"
          size="large"
          onClick={handleUpload}
          disabled={!canUpload}
          loading={isUploading}
        >
          {t('upload.buttons.upload')}
        </Button>
      </div>
      
      {/* Requirements */}
      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">
            {t('upload.requirements.title')}
          </Text>
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="start">
              <Text variant="bodySm" as="span">•</Text>
              <Text variant="bodySm" as="p">
                {t('upload.requirements.formats')}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="start">
              <Text variant="bodySm" as="span">•</Text>
              <Text variant="bodySm" as="p">
                {t('upload.requirements.size')}
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="start">
              <Text variant="bodySm" as="span">•</Text>
              <Text variant="bodySm" as="p">
                {t('upload.requirements.hover')}
              </Text>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

