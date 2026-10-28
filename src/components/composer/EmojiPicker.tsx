import React, { useEffect, useRef } from 'react';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  placement?: 'bottom' | 'top';
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onSelect, 
  onClose,
  placement = 'bottom' 
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (panelRef.current.contains(e.target as Node) || path.includes(panelRef.current)) {
        return;
      }
      // If clicking on the trigger button itself, let the button's toggle handle it
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest('button[aria-label="Insert emoji"]')) {
        return;
      }
      onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="emoji-picker-panel"
      style={{
        position: 'absolute',
        top: placement === 'bottom' ? 'calc(100% + 6px)' : undefined,
        bottom: placement === 'top' ? 'calc(100% + 6px)' : undefined,
        left: 0,
        zIndex: 9999,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        overflow: 'hidden'
      }}
    >
      <Picker
        data={emojiData}
        theme="light"
        previewPosition="bottom"
        skinTonePosition="preview"
        navPosition="top"
        onEmojiSelect={(emoji: { native: string }) => {
          if (emoji && emoji.native) {
            onSelect(emoji.native);
          }
        }}
      />
    </div>
  );
};

export default EmojiPicker;
