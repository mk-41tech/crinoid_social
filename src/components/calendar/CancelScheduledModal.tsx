import React from 'react';
import { CalendarPost } from './types';
import { AlertTriangle, X, FileEdit } from 'lucide-react';

interface CancelScheduledModalProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (postId: string, revertToDraft: boolean) => void;
}

export const CancelScheduledModal: React.FC<CancelScheduledModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirmCancel
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Cancel Scheduled Post
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Are you sure you want to cancel the scheduled publication for this post?
          </p>

          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Scheduled Time</p>
            <p style={{ margin: '0 0 8px', fontSize: '12.5px' }}>{new Date(post.scheduledAt).toLocaleString()}</p>
            <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{post.caption || 'No caption'}"
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontSize: '12px'
          }}>
            <FileEdit size={14} style={{ flexShrink: 0 }} />
            <span>This post will be reverted to a <strong>Draft</strong> so you will not lose any written content or media.</span>
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
            Keep Scheduled
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCancel(post.id, true);
              onClose();
            }}
            style={{
              padding: '7px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Revert to Draft
          </button>
        </div>
      </div>
    </div>
  );
};
