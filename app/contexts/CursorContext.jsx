import { createContext, useContext, useState, useCallback } from 'react';

/**
 * CursorContext
 * 
 * Global state management for cursor selection, size, and enable/disable status.
 * Eliminates prop drilling by providing direct access to state from any component.
 * 
 * State:
 * - selectedCursorId: Currently selected cursor (React state, not saved until publish)
 * - cursorSize: Current cursor size in pixels (16-64)
 * - isEnabled: Whether custom cursor is active on storefront
 * 
 * Actions:
 * - selectCursor(id): Select a cursor for preview
 * - setCursorSize(size): Update cursor size
 * - setIsEnabled(enabled): Toggle cursor on/off
 * - resetToDefault(): Reset all settings to defaults
 * 
 * Usage:
 * const { selectedCursorId, cursorSize, selectCursor } = useCursor();
 */

const CursorContext = createContext(null);

/**
 * CursorProvider Component
 * 
 * Wraps the cursor UI and provides state management via context.
 * 
 * @param {object} props
 * @param {string|null} props.initialSelectedCursorId - Initial selected cursor from DB
 * @param {number} props.initialCursorSize - Initial cursor size from DB (default: 32)
 * @param {boolean} props.initialIsEnabled - Initial enabled state from DB (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
export function CursorProvider({ 
  children, 
  initialSelectedCursorId = null,
  initialCursorSize = 32,
  initialIsEnabled = true 
}) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  // Selected cursor (React state for preview, not saved until "Save & Publish")
  const [selectedCursorId, setSelectedCursorId] = useState(initialSelectedCursorId);
  
  // Cursor size in pixels (16-64)
  const [cursorSize, setCursorSize] = useState(initialCursorSize);
  
  // Whether cursor is enabled on storefront
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled);

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Select a cursor for preview
   * @param {string|null} cursorId - Cursor ID to select, or null to deselect
   */
  const selectCursor = useCallback((cursorId) => {
    setSelectedCursorId(cursorId);
  }, []);

  /**
   * Update cursor size
   * @param {number} size - New size in pixels (16-64)
   */
  const updateCursorSize = useCallback((size) => {
    setCursorSize(size);
  }, []);

  /**
   * Toggle cursor enabled state
   * @param {boolean} enabled - Whether cursor should be enabled
   */
  const updateIsEnabled = useCallback((enabled) => {
    setIsEnabled(enabled);
  }, []);

  /**
   * Reset all settings to defaults
   * - No cursor selected (null)
   * - Default size (32px)
   * - Enabled (true)
   */
  const resetToDefault = useCallback(() => {
    setSelectedCursorId(null);
    setCursorSize(32);
    setIsEnabled(true);
  }, []);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value = {
    // State
    selectedCursorId,
    cursorSize,
    isEnabled,
    
    // Actions
    selectCursor,
    setCursorSize: updateCursorSize,
    setIsEnabled: updateIsEnabled,
    resetToDefault,
    
    // Initial values (for comparison to detect unsaved changes)
    initialSelectedCursorId,
    initialCursorSize,
    initialIsEnabled,
  };

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
}

/**
 * useCursor Hook
 * 
 * Access cursor context from any component within CursorProvider.
 * 
 * @returns {object} Cursor context value
 * @throws {Error} If used outside of CursorProvider
 * 
 * @example
 * function MyComponent() {
 *   const { selectedCursorId, cursorSize, selectCursor } = useCursor();
 *   return <div onClick={() => selectCursor('cursor-1')}>...</div>;
 * }
 */
export function useCursor() {
  const context = useContext(CursorContext);
  
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  
  return context;
}

export default CursorContext;

