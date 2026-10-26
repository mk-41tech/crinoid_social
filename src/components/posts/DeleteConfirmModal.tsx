import React from 'react';
import { PostRecord } from './types';
import { AlertTriangle, X, Archive, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  post: PostRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (postId: string) => void;
  onConfirmArchive: (postId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmArchive
}) => {
  if (!isOpen || !post) return null;

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
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Delete or Archive Post
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Are you sure you want to remove post <strong>{post.id}</strong>? You can permanently delete it or move it to the <strong>Archived</strong> tab to preserve performance analytics.
          </p>

          <div style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            "{post.caption}"
          </div>
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                onConfirmArchive(post.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Archive size={13} /> Archive
            </button>

            <button
              type="button"
              onClick={() => {
                onConfirmDelete(post.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
