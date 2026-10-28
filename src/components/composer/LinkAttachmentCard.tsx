import React, { useState } from 'react';
import { Link2, X, ExternalLink, Globe, Edit3 } from 'lucide-react';

interface LinkAttachmentCardProps {
  url?: string;
  title?: string;
  domain?: string;
  description?: string;
  image?: string;
  onUpdate: (data: { url: string; title: string; domain: string; description: string; image: string }) => void;
  onRemove: () => void;
}

export const LinkAttachmentCard: React.FC<LinkAttachmentCardProps> = ({
  url = '',
  title = '',
  domain = '',
  description = '',
  image = '',
  onUpdate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(!url);
  const [inputUrl, setInputUrl] = useState(url || 'https://crinoid.social/blog/ai-growth-workflows');
  const [inputTitle, setInputTitle] = useState(title || 'The Future of AI-Powered Multi-Platform Publishing');
  const [inputDesc, setInputDesc] = useState(description || 'How automated cross-channel distribution elevates SaaS reach without duplicate manual labor.');
  const [inputImage, setInputImage] = useState(image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    let extractedDomain = '';
    try {
      extractedDomain = new URL(inputUrl).hostname.replace('www.', '');
    } catch {
      extractedDomain = 'crinoid.social';
    }

    onUpdate({
      url: inputUrl,
      title: inputTitle,
      domain: extractedDomain,
      description: inputDesc,
      image: inputImage
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
            <Link2 size={14} color="#4f46e5" />
            <span>Attach Link</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', display: 'flex' }}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Destination URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/article"
              required
              className="composer-form-input"
              style={{ fontSize: '13px', padding: '7px 10px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
              Card Title
            </label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Article or page title"
              required
              className="composer-form-input"
              style={{ fontSize: '13px', padding: '7px 10px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onRemove}
              className="c-btn c-btn-outline c-btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="c-btn c-btn-primary c-btn-sm"
            >
              Attach Link
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div style={{ position: 'relative', height: '140px', backgroundColor: '#f1f5f9' }}>
        {image && (
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 150ms ease'
          }}
          title="Remove attached link"
        >
          <X size={13} />
        </button>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            <Globe size={11} />
            <span>{domain || 'crinoid.social'}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11.5px',
              color: '#4f46e5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontWeight: 500,
              padding: 0
            }}
          >
            <Edit3 size={11} />
            <span>Edit</span>
          </button>
        </div>

        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>
          {title}
        </div>

        {description && (
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};
