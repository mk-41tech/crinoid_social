import React, { useState, useEffect, useRef } from 'react';
import { PostRecord, PostRecordStatus } from './types';
import { SocialPlatform } from '../../types';
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
  Activity,
  Save,
  Upload,
  Image as ImageIcon,
  Hash,
  Smile,
  Check,
  Loader2
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XIcon } from '../common/SocialIcons';

export interface PostViewModalProps {
  post: PostRecord | null;
  isOpen: boolean;
  initialMode?: 'view' | 'edit';
  onClose: () => void;
  onEdit?: (post: PostRecord) => void;
  onSave?: (updatedPost: PostRecord) => Promise<void> | void;
  onDuplicate: (post: PostRecord) => void;
  onReschedule: (post: PostRecord) => void;
  onDelete: (post: PostRecord) => void;
  onRetry: (post: PostRecord) => void;
  onSubmitApproval: (post: PostRecord) => void;
  onViewLogs: (post: PostRecord) => void;
}

const ALL_PLATFORMS: { id: SocialPlatform; name: string }[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'x', name: 'X (Twitter)' }
];

const renderPlatformIcon = (platform: SocialPlatform, size = 14) => {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon size={size} color="#E4405F" />;
    case 'facebook':
      return <FacebookIcon size={size} color="#1877F2" />;
    case 'linkedin':
      return <LinkedinIcon size={size} color="#0A66C2" />;
    case 'youtube':
      return <YoutubeIcon size={size} color="#FF0000" />;
    case 'x':
      return <XIcon size={size} color="#0f1419" />;
    default:
      return null;
  }
};

const getStatusEditRestriction = (status: PostRecordStatus): { canEdit: boolean; message?: string } => {
  if (status === 'published') {
    return {
      canEdit: false,
      message: 'Published posts cannot be edited because they are already live on social networks. You can duplicate this post as a new draft to make revisions.'
    };
  }
  if (status === 'archived') {
    return {
      canEdit: false,
      message: 'Archived posts are in read-only storage and cannot be edited.'
    };
  }
  return { canEdit: true };
};

export const PostViewModal: React.FC<PostViewModalProps> = ({
  post,
  isOpen,
  initialMode = 'view',
  onClose,
  onEdit,
  onSave,
  onDuplicate,
  onReschedule,
  onDelete,
  onRetry,
  onSubmitApproval,
  onViewLogs
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);

  // Form states for Edit Mode
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [campaign, setCampaign] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize mode whenever initialMode or active post changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, post?.id]);

  // Synchronize form values whenever active post changes
  useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setPlatforms(post.platforms ? [...post.platforms] : []);
      setMediaUrl(post.thumbnailUrl || (post.mediaUrls && post.mediaUrls[0]) || '');
      setCampaign(post.campaign || '');
      if (post.scheduledDate) {
        try {
          const d = new Date(post.scheduledDate);
          const pad = (n: number) => (n < 10 ? '0' + n : n);
          const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setScheduledDate(formatted);
        } catch {
          setScheduledDate('');
        }
      } else {
        setScheduledDate('');
      }
      setValidationError(null);
      setShowEmojiPicker(false);
    }
  }, [post, isOpen, mode]);

  if (!isOpen || !post) return null;

  const restriction = getStatusEditRestriction(post.status);
  const canEdit = restriction.canEdit;

  const handleTogglePlatform = (p: SocialPlatform) => {
    if (!canEdit) return;
    setPlatforms(prev => {
      if (prev.includes(p)) {
        if (prev.length === 1) {
          setValidationError('At least one social platform must remain selected.');
          return prev;
        }
        setValidationError(null);
        return prev.filter(item => item !== p);
      } else {
        setValidationError(null);
        return [...prev, p];
      }
    });
  };

  const handleInsertEmoji = (emoji: string) => {
    if (!canEdit) return;
    const textarea = captionTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || caption.length;
      const end = textarea.selectionEnd || caption.length;
      const updated = caption.slice(0, start) + emoji + caption.slice(end);
      setCaption(updated);
      setValidationError(null);
      const nextPos = start + emoji.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      });
    } else {
      setCaption(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleInsertHashtag = () => {
    if (!canEdit) return;
    const space = caption.length > 0 && !caption.endsWith(' ') ? ' ' : '';
    setCaption(prev => prev + space + '#');
    setValidationError(null);
    if (captionTextareaRef.current) {
      captionTextareaRef.current.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setValidationError('Media size cannot exceed 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
        setValidationError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!canEdit) return;

    if (!caption.trim()) {
      setValidationError('Caption cannot be empty.');
      return;
    }

    if (platforms.length === 0) {
      setValidationError('Please select at least one target social channel.');
      return;
    }

    if (post.status === 'scheduled' && !scheduledDate) {
      setValidationError('Scheduled posts must specify a valid schedule date and time.');
      return;
    }

    setValidationError(null);
    setIsSaving(true);

    try {
      const trimmedMedia = mediaUrl.trim();
      const updatedPost: PostRecord = {
        ...post,
        caption: caption.trim(),
        platforms,
        campaign: campaign.trim() || undefined,
        thumbnailUrl: trimmedMedia || undefined,
        mediaUrls: trimmedMedia ? [trimmedMedia] : [],
        mediaType: trimmedMedia 
          ? (trimmedMedia.includes('.mp4') || trimmedMedia.startsWith('data:video') ? 'video' : 'image') 
          : 'text',
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : post.scheduledDate
      };

      if (onSave) {
        await onSave(updatedPost);
      }
      setMode('view');
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to save post changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Revert form state to active post
    setCaption(post.caption || '');
    setPlatforms(post.platforms ? [...post.platforms] : []);
    setMediaUrl(post.thumbnailUrl || (post.mediaUrls && post.mediaUrls[0]) || '');
    setCampaign(post.campaign || '');
    setValidationError(null);
    setShowEmojiPicker(false);
    setMode('view');
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                {post.id}
              </span>
              <span className={`status-badge ${post.status}`}>
                ● {post.status.replace('_', ' ')}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {mode === 'edit' ? 'Edit Post Record' : 'Content Record Details'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View / Edit Mode Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-subtle)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setMode('view')}
                title="Switch to View Mode"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontWeight: mode === 'view' ? 600 : 500,
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: mode === 'view' ? '#ffffff' : 'transparent',
                  color: mode === 'view' ? 'var(--color-primary)' : 'var(--text-muted)',
                  boxShadow: mode === 'view' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <Eye size={12} />
                <span>View</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                title={canEdit ? 'Switch to Edit Mode' : restriction.message}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontWeight: mode === 'edit' ? 600 : 500,
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: mode === 'edit' ? '#ffffff' : 'transparent',
                  color: mode === 'edit' ? 'var(--color-primary)' : (canEdit ? 'var(--text-muted)' : '#94a3b8'),
                  boxShadow: mode === 'edit' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </div>

            <button
              onClick={onClose}
              title="Close panel"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* ========================================================== */}
          {/* VIEW MODE                                                  */}
          {/* ========================================================== */}
          {mode === 'view' && (
            <>
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
                        fontWeight: 500,
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {renderPlatformIcon(p, 14)}
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
            </>
          )}

          {/* ========================================================== */}
          {/* EDIT MODE                                                  */}
          {/* ========================================================== */}
          {mode === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status Restriction Notice if not editable */}
              {!canEdit && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>Editing Restricted</div>
                    <div>{restriction.message}</div>
                  </div>
                </div>
              )}

              {/* Status-specific contextual notes */}
              {canEdit && post.status === 'awaiting_approval' && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>This post is awaiting approval. Saving edits will update the content under review.</span>
                </div>
              )}

              {canEdit && post.status === 'failed' && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>Update caption or platforms to address the publishing error before retrying.</span>
                </div>
              )}

              {/* Validation Error Banner */}
              {validationError && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={14} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. Caption & Content Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Caption & Content <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: caption.length > 2000 ? '#dc2626' : 'var(--text-light)' }}>
                    {caption.length} characters
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <textarea
                    ref={captionTextareaRef}
                    disabled={!canEdit || isSaving}
                    value={caption}
                    onChange={(e) => {
                      setCaption(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Write the post caption or content..."
                    rows={5}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: canEdit ? '#ffffff' : 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />

                  {/* Toolbar helpers under textarea */}
                  {canEdit && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={handleInsertHashtag}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '4px 8px',
                            fontSize: '11.5px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          <Hash size={12} />
                          <span>Hashtag</span>
                        </button>

                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(prev => !prev)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-subtle)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <Smile size={12} />
                            <span>Emoji</span>
                          </button>

                          {showEmojiPicker && (
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: '100%',
                              marginTop: '4px',
                              padding: '8px',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(5, 1fr)',
                              gap: '6px',
                              zIndex: 10
                            }}>
                              {['🚀', '💡', '✨', '🔥', '🎉', '👍', '❤️', '👏', '📈', '🤝'].map(em => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => handleInsertEmoji(em)}
                                  style={{
                                    fontSize: '18px',
                                    padding: '4px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['🚀', '💡', '✨'].map(em => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleInsertEmoji(em)}
                            style={{
                              fontSize: '13px',
                              padding: '3px 6px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-subtle)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Target Platforms Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Target Channels <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ALL_PLATFORMS.map(({ id: platId, name: platName }) => {
                    const isSelected = platforms.includes(platId);
                    return (
                      <button
                        key={platId}
                        type="button"
                        disabled={!canEdit || isSaving}
                        onClick={() => handleTogglePlatform(platId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: canEdit ? 'pointer' : 'not-allowed',
                          border: isSelected 
                            ? '1.5px solid var(--color-primary)' 
                            : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected 
                            ? 'var(--color-primary-light)' 
                            : (canEdit ? '#ffffff' : 'var(--bg-subtle)'),
                          color: isSelected 
                            ? 'var(--color-primary)' 
                            : 'var(--text-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {renderPlatformIcon(platId, 14)}
                        <span>{platName}</span>
                        {isSelected && <Check size={12} style={{ color: 'var(--color-primary)', marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Media & Visual Attachment */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Media Attachment (Optional)
                  </label>
                  {mediaUrl && canEdit && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Trash2 size={11} />
                      <span>Remove Media</span>
                    </button>
                  )}
                </div>

                {/* Media Preview Box */}
                {mediaUrl ? (
                  <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#0f172a',
                    position: 'relative',
                    marginBottom: '8px',
                    maxHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={mediaUrl}
                      alt="Media preview"
                      style={{ width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    textAlign: 'center',
                    marginBottom: '8px',
                    color: 'var(--text-muted)'
                  }}>
                    <ImageIcon size={22} style={{ margin: '0 auto 4px', color: 'var(--text-light)' }} />
                    <div style={{ fontSize: '12px' }}>No media attached to this post.</div>
                  </div>
                )}

                {/* Media Inputs (URL or Upload) */}
                {canEdit && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      disabled={isSaving}
                      placeholder="Paste image or video URL (https://...)"
                      value={mediaUrl.startsWith('data:') ? '[Uploaded Local Media]' : mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Upload size={13} />
                      <span>Upload</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Campaign Information */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Campaign (Optional)
                </label>
                <input
                  type="text"
                  disabled={!canEdit || isSaving}
                  placeholder="e.g. Product Launch 2026, Brand Awareness"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: canEdit ? '#ffffff' : 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
                {canEdit && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['Product Launch 2026', 'Brand Awareness', 'Tech Highlights', 'Community Spotlight'].map(camp => (
                      <button
                        key={camp}
                        type="button"
                        onClick={() => setCampaign(camp)}
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: campaign === camp ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
                          color: campaign === camp ? 'var(--color-primary)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {camp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Schedule Date & Time (if post is scheduled or user wants to schedule) */}
              {(post.status === 'scheduled' || scheduledDate) && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Schedule Date & Time
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: 'var(--text-light)' }} />
                    <input
                      type="datetime-local"
                      disabled={!canEdit || isSaving}
                      value={scheduledDate}
                      onChange={(e) => {
                        setScheduledDate(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      style={{
                        padding: '7px 10px',
                        fontSize: '12.5px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: canEdit ? '#ffffff' : 'var(--bg-subtle)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Read-Only Context Information */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Author</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{post.author.name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Status</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {post.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Created Date</span>
                  <span>{new Date(post.createdDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Post ID</span>
                  <span>{post.id}</span>
                </div>
              </div>
            </div>
          )}
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
          {mode === 'view' ? (
            <>
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  onClick={() => setMode('edit')}
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
                  <Edit3 size={13} /> Edit Post
                </button>
              </div>
            </>
          ) : (
            <>
              {/* EDIT MODE FOOTER */}
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCancelEdit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-secondary)',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!canEdit ? (
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
                      padding: '7px 14px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={13} /> Duplicate as Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 18px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
