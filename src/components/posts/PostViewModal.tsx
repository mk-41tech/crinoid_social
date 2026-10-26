import React from 'react';
import { PostRecord } from './types';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Edit3, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Send,
  Terminal,
  Activity
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '../common/SocialIcons';

interface PostViewModalProps {
  post: PostRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (post: PostRecord) => void;
  onDuplicate: (post: PostRecord) => void;
  onReschedule: (post: PostRecord) => void;
  onDelete: (post: PostRecord) => void;
  onRetry: (post: PostRecord) => void;
  onSubmitApproval: (post: PostRecord) => void;
  onViewLogs: (post: PostRecord) => void;
}

export const PostViewModal: React.FC<PostViewModalProps> = ({
  post,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onReschedule,
  onDelete,
  onRetry,
  onSubmitApproval,
  onViewLogs
}) => {
  if (!isOpen || !post) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div 
        className="post-drawer"
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-6px 0 24px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                {post.id}
              </span>
              <span className={`status-badge ${post.status}`}>
                ● {post.status.replace('_', ' ')}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Content Record Details
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Published URL Link Banner (when available) */}
          {post.publishedUrl && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
                <span style={{ fontSize: '12.5px', color: '#065f46', fontWeight: 500 }}>
                  Live Social Media Publication
                </span>
              </div>
              <a
                href={post.publishedUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#047857',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #6ee7b7'
                }}
              >
                <span>View Live Post</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Media preview */}
          {post.thumbnailUrl && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '240px'
              }}>
                <img
                  src={post.thumbnailUrl}
                  alt="Post media"
                  style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* Caption */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Caption & Content
            </label>
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-primary)'
            }}>
              {post.caption}
            </div>
          </div>

          {/* Performance Data (when available) */}
          {post.performanceData && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} /> Performance Analytics
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {post.performanceData.engagementRate} Engagement Rate
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Likes</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.performanceData.likes.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Comments</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.performanceData.comments.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Shares</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.performanceData.shares.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reach</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {post.performanceData.reach.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Target Accounts / Platforms */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Target Accounts
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {post.platforms.map(p => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  {p === 'instagram' && <InstagramIcon size={14} color="#E4405F" />}
                  {p === 'facebook' && <FacebookIcon size={14} color="#1877F2" />}
                  <span style={{ textTransform: 'capitalize' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Author</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.author.name} ({post.author.role})
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Campaign</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.campaign || 'General'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Created Date</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(post.createdDate).toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                {post.status === 'published' ? 'Published Date' : 'Scheduled Date'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {post.publishedDate ? new Date(post.publishedDate).toLocaleString() : post.scheduledDate ? new Date(post.scheduledDate).toLocaleString() : 'Not scheduled'}
              </span>
            </div>
          </div>

          {/* Approval History Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Approval History
              </span>
              {post.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => onSubmitApproval(post)}
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + Submit for Approval
                </button>
              )}
            </div>
            <div style={{
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              padding: '10px 12px'
            }}>
              {post.approvalHistory && post.approvalHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {post.approvalHistory.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                      <CheckCircle2 size={14} style={{ color: item.status === 'approved' ? '#16a34a' : '#d97706', marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.approverName} ({item.status})
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {item.note && (
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '11.5px' }}>
                            "{item.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  No formal approval actions logged for this post yet.
                </div>
              )}
            </div>
          </div>

          {/* Publishing Logs Preview */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={13} /> Publishing Logs
              </span>
              <button
                type="button"
                onClick={() => onViewLogs(post)}
                style={{
                  fontSize: '11.5px',
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View Full Trace →
              </button>
            </div>
            <div style={{
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              padding: '10px 12px',
              lineHeight: '1.4'
            }}>
              <div>&gt; Target: {post.platforms.join(', ')}</div>
              <div>&gt; Status: {post.status.toUpperCase()}</div>
              <div>&gt; Dispatched via Crinoid Graph Gateway v18.0</div>
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
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
          <button
            type="button"
            onClick={() => {
              onDelete(post);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Trash2 size={13} /> Delete
          </button>

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
                gap: '5px',
                padding: '7px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <Copy size={13} /> Duplicate
            </button>

            {post.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => {
                  onReschedule(post);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <Clock size={13} /> Reschedule
              </button>
            )}

            {post.status === 'failed' && (
              <button
                type="button"
                onClick={() => {
                  onRetry(post);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Retry Publishing
              </button>
            )}

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
                padding: '7px 16px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit3 size={13} /> Edit in Composer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
