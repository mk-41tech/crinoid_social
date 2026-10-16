import React, { useState } from 'react';
import { Link2, X, ExternalLink, Globe } from 'lucide-react';

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
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Link2 size={14} color="var(--color-primary)" />
            <span>Attach Link</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination URL</label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/article"
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Card Title</label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Article or page title"
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button type="button" onClick={onRemove} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
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
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{ position: 'relative', height: '140px', backgroundColor: 'var(--bg-muted)' }}>
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
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Remove attached link"
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <Globe size={12} />
          <span>{domain || 'crinoid.social'}</span>
        </div>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {description}
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            alignSelf: 'flex-start',
            fontSize: '11px',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 600,
            marginTop: '4px'
          }}
        >
          Edit Link Metadata
        </button>
      </div>
    </div>
  );
};
