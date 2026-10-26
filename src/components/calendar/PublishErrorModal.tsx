import React from 'react';
import { CalendarPost } from './types';
import { AlertCircle, X, RefreshCw, Edit3 } from 'lucide-react';

interface PublishErrorModalProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (post: CalendarPost) => void;
  onEdit: (post: CalendarPost) => void;
}

export const PublishErrorModal: React.FC<PublishErrorModalProps> = ({
  post,
  isOpen,
  onClose,
  onRetry,
  onEdit
}) => {
  if (!isOpen || !post) return null;

  const errorMessage = post.errorDetails || 
    'OAuth token expired or insufficient permissions for target social channel. Graph API returned (400) Bad Request.';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fef2f2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#991b1b' }}>
              Publishing Error Details
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Target Platforms
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {post.platforms.map(p => (
                <span key={p} style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Error Diagnostic Log
            </p>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#f87171',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '12px',
              borderRadius: '6px',
              lineHeight: '1.4',
              wordBreak: 'break-word',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {errorMessage}
            </div>
          </div>

          <div style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <strong>Recommendation:</strong> Verify account connection permissions under Workspace &gt; Social Accounts, or edit the post media and caption in Composer.
          </div>
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(post);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Edit3 size={14} />
            Edit in Composer
          </button>
          <button
            type="button"
            onClick={() => {
              onRetry(post);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            Retry Publishing
          </button>
        </div>
      </div>
    </div>
  );
};
