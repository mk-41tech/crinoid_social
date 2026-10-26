import React from 'react';
import { CalendarPost } from './types';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Edit3, 
  Copy, 
  Trash2, 
  AlertTriangle,
  User,
  CheckCircle2,
  Clock4,
  ExternalLink
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '../common/SocialIcons';

interface PostDetailDrawerProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (post: CalendarPost) => void;
  onDuplicate: (post: CalendarPost) => void;
  onReschedule: (post: CalendarPost) => void;
  onCancel: (post: CalendarPost) => void;
  onDelete?: (postId: string) => void;
}

export const PostDetailDrawer: React.FC<PostDetailDrawerProps> = ({
  post,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onReschedule,
  onCancel,
  onDelete
}) => {
  if (!isOpen || !post) return null;

  const dateFormatted = new Date(post.scheduledAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = new Date(post.scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s ease-out'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Scheduled Post Details
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              ID: {post.id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Status and Approval Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: post.status === 'scheduled' ? 'var(--color-primary-light)' : '#f1f5f9',
              color: post.status === 'scheduled' ? 'var(--color-primary)' : 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}>
              ● {post.status}
            </span>

            {post.approvalStatus && (
              <span style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: post.approvalStatus === 'approved' ? '#d1fae5' : '#fef3c7',
                color: post.approvalStatus === 'approved' ? '#047857' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {post.approvalStatus === 'approved' ? <CheckCircle2 size={13} /> : <Clock4 size={13} />}
                Approval: {post.approvalStatus.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Schedule Time Card */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarIcon size={18} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {dateFormatted}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Scheduled for {timeFormatted}
              </p>
            </div>
          </div>

          {/* Media / Thumbnail preview */}
          {post.thumbnailUrl && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Attached Media
              </p>
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                maxHeight: '220px',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={post.thumbnailUrl}
                  alt="Post preview"
                  style={{ width: '100%', height: 'auto', maxHeight: '220px', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* Caption text */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Caption Content
            </p>
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13.5px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-primary)'
            }}>
              {post.caption}
            </div>
          </div>

          {/* Target Platforms */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Target Social Accounts
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {post.platforms.map(platform => (
                <div
                  key={platform}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {platform === 'instagram' && <InstagramIcon size={14} color="#E4405F" />}
                  {platform === 'facebook' && <FacebookIcon size={14} color="#1877F2" />}
                  <span>{platform}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Information: Author & Campaign */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Author / Creator</p>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.author?.name || 'Muthukumar'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Campaign</p>
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.campaign || 'General Publishing'}
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Actions Toolbar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {post.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => {
                  onCancel(post);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fff5f5',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <AlertTriangle size={14} />
                Cancel Schedule
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(post.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fff5f5',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                onDuplicate(post);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Copy size={14} />
              Duplicate
            </button>

            <button
              type="button"
              onClick={() => {
                onReschedule(post);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} />
              Reschedule
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
                padding: '8px 16px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit3 size={14} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
