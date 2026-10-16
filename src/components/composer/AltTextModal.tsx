import React, { useState } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';

interface AltTextModalProps {
  mediaUrl: string;
  mediaIndex: number;
  initialAltText: string;
  onSave: (altText: string) => void;
  onClose: () => void;
}

export const AltTextModal: React.FC<AltTextModalProps> = ({
  mediaUrl,
  mediaIndex,
  initialAltText,
  onSave,
  onClose
}) => {
  const [altText, setAltText] = useState(initialAltText);

  const handleSave = () => {
    onSave(altText);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Edit Alt Text (Image {mediaIndex + 1})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img
              src={mediaUrl}
              alt="Preview"
              style={{
                width: '90px',
                height: '90px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                border: '1px solid var(--border-subtle)'
              }}
            />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Describe what is in the image for screen readers and accessibility.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Enter image description..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13.5px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {altText.length} / 1000 characters
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={14} />
            <span>Save Alt Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
