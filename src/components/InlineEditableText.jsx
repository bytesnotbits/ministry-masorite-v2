import { useState, useRef, useEffect } from 'react';
import './InlineEditableText.css';

function InlineEditableText({
  value,
  onSave,
  as = 'span',
  className = '',
  placeholder = 'Click to edit',
  multiline = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovering, setIsHovering] = useState(false);
  const pressTimerRef = useRef(null);
  const inputRef = useRef(null);
  const clickTimerRef = useRef(null);
  const clickCountRef = useRef(0);

  const LONG_PRESS_DURATION = 500; // milliseconds
  const DOUBLE_CLICK_DELAY = 300; // milliseconds

  useEffect(() => {
    // Update local state when prop changes
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    // Focus the input when entering edit mode
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // For text inputs, select all text
      if (!multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const startLongPress = () => {
    pressTimerRef.current = setTimeout(() => {
      setIsEditing(true);
    }, LONG_PRESS_DURATION);
  };

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // First click - start timer
      clickTimerRef.current = setTimeout(() => {
        // Single click timeout - reset counter
        clickCountRef.current = 0;
      }, DOUBLE_CLICK_DELAY);
    } else if (clickCountRef.current === 2) {
      // Double click detected!
      clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      cancelLongPress();
      setIsEditing(true);
    }
  };

  const handleMouseDown = (e) => {
    // Only trigger on left click
    if (e.button === 0) {
      startLongPress();
    }
  };

  const handleMouseUp = () => {
    cancelLongPress();
  };

  const handleMouseLeave = () => {
    cancelLongPress();
    setIsHovering(false);
  };

  const handleTouchStart = () => {
    startLongPress();
  };

  const handleTouchEnd = () => {
    cancelLongPress();
  };

  const handleBlur = () => {
    // Auto-save when clicking away
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      // Cancel editing
      setEditValue(value);
      setIsEditing(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && !multiline) {
      // Save on Enter for single-line inputs
      handleBlur();
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  // Determine which HTML element to render
  const Component = as;

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef}
        className={`inline-editable-input inline-editable-textarea ${className}`}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows="4"
      />
    ) : (
      <input
        ref={inputRef}
        type="text"
        className={`inline-editable-input ${className}`}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <Component
      className={`inline-editable-text ${isEmpty ? 'inline-editable-empty' : ''} ${isHovering ? 'inline-editable-hover' : ''} ${className}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title="Double-click or long-press to edit"
    >
      {displayValue}
    </Component>
  );
}

export default InlineEditableText;
