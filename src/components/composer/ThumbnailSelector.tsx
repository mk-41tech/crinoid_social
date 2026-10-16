import React, { useState } from 'react';
import { X, Check, Video, Upload } from 'lucide-react';

interface ThumbnailSelectorProps {
  currentThumbnail: string;
  onSelectThumbnail: (url: string) => void;
  onClose: () => void;
}

const PRESET_THUMBNAILS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'
];

export const ThumbnailSelector: React.FC<ThumbnailSelectorProps> = ({
  currentThumbnail,
  onSelectThumbnail,
  onClose
}) => {
  const [selected, setSelected] = useState(currentThumbnail || PRESET_THUMBNAILS[0]);
  const [customUrl, setCustomUrl] = useState('');

  const handleApply = () => {
    onSelectThumbnail(selected);
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
          maxWidth: '540px',
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
            <Video size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Choose Video Thumbnail (YouTube)
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
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Select an auto-extracted video frame or provide a custom promotional thumbnail image.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {PRESET_THUMBNAILS.map((thumb, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(thumb)}
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selected === thumb ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: selected === thumb ? 'var(--shadow-md)' : 'none'
                }}
              >
                <img src={thumb} alt={`Frame ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 600
                  }}
                >
                  Frame 0{idx + 1}
                </div>
                {selected === thumb && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Or enter custom image URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.example.com/thumbnail.jpg"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrl) setSelected(customUrl);
                }}
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer' }}
              >
                Set
              </button>
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
            onClick={handleApply}
            className="btn btn-primary btn-sm"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={14} />
            <span>Select Thumbnail</span>
          </button>
        </div>
      </div>
    </div>
  );
};
