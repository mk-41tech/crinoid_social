import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalPostItem, ApprovalHistoryEvent } from './types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Clock, 
  Send, 
  ShieldCheck, 
  Check, 
  Edit3,
  Calendar,
  History,
  UserCheck,
  CalendarCheck,
  Tag
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XIcon } from '../common/SocialIcons';
import { Avatar } from '../common/Avatar';

interface ApprovalReviewModalProps {
  post: ApprovalPostItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (postId: string, note?: string) => void;
  onReject: (postId: string, reason: string) => void;
  onRequestChanges: (postId: string, feedback: string) => void;
  onResubmit: (postId: string, newCaption?: string) => void;
  onAddComment: (postId: string, commentText: string, mentions: string[]) => void;
  onAssignApprover: (postId: string, user: { id: string; name: string; role: string; avatar?: string }) => void;
  onScheduleOrPublish?: (postId: string) => void;
}

export const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  post,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
  onResubmit,
  onAddComment,
  onAssignApprover,
  onScheduleOrPublish
}) => {
  const { currentBrand, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [activeAction, setActiveAction] = useState<'idle' | 'reject' | 'changes' | 'resubmit'>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [editedCaption, setEditedCaption] = useState(post?.caption || '');

  // Synchronize caption when post changes
  React.useEffect(() => {
    if (post) {
      setEditedCaption(post.caption);
      setActiveAction('idle');
      setFeedbackText('');
      setCommentInput('');
    }
  }, [post?.id, post?.version]);

  if (!isOpen || !post) return null;

  // Authorization check
  const isApproverRole = !currentUser || ['approver', 'social lead', 'brand manager', 'admin'].includes((currentUser.role || '').toLowerCase());
  const isAuthor = !!(currentUser && currentUser.id === post.author.id);
  const canReview = isApproverRole && !isAuthor;

  // Dynamic @mentions list from current brand users
  const availableMentions = currentBrand.users.map(u => `@${u.name.replace(/\s+/g, '')}`);
  if (post.requiresClientApproval && !availableMentions.includes('@Client')) {
    availableMentions.push('@Client');
  }

  const handleInsertMention = (mention: string) => {
    setCommentInput(prev => (prev ? `${prev} ${mention} ` : `${mention} `));
  };

  const handlePostComment = () => {
    if (!commentInput.trim()) return;
    const detectedMentions = availableMentions.filter(m => commentInput.includes(m));
    onAddComment(post.id, commentInput.trim(), detectedMentions);
    setCommentInput('');
  };

  const handleDecisionSubmit = () => {
    if (activeAction === 'reject') {
      if (!feedbackText.trim()) return;
      onReject(post.id, feedbackText.trim());
      setActiveAction('idle');
      setFeedbackText('');
      onClose();
    } else if (activeAction === 'changes') {
      if (!feedbackText.trim()) return;
      onRequestChanges(post.id, feedbackText.trim());
      setActiveAction('idle');
      setFeedbackText('');
      onClose();
    } else if (activeAction === 'resubmit') {
      onResubmit(post.id, editedCaption);
      setActiveAction('idle');
      onClose();
    }
  };

  // Find next pending step for multi-step workflow
  const pendingStep = post.steps.find(s => s.status === 'pending' || s.status === 'changes_requested');
  const isMultiStep = post.steps.length > 1;

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon size={12} color="#E4405F" />;
      case 'facebook': return <FacebookIcon size={12} color="#1877F2" />;
      case 'linkedin': return <LinkedinIcon size={12} color="#0A66C2" />;
      case 'youtube': return <YoutubeIcon size={12} color="#FF0000" />;
      case 'x': return <XIcon size={12} color="#0f1419" />;
      default: return null;
    }
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
        className="approval-drawer"
        style={{
          width: '100%',
          maxWidth: '580px',
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
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'capitalize',
                backgroundColor: post.status === 'approved' ? '#d1fae5' : post.status === 'rejected' ? '#fee2e2' : post.status === 'changes_requested' ? '#fef3c7' : 'var(--color-primary-light)',
                color: post.status === 'approved' ? '#047857' : post.status === 'rejected' ? '#dc2626' : post.status === 'changes_requested' ? '#b45309' : 'var(--color-primary)'
              }}>
                ● {post.status.replace('_', ' ')}
              </span>
              {post.requiresClientApproval && (
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: post.clientApprovalStatus === 'approved' ? '#ecfdf5' : '#f5f3ff',
                  color: post.clientApprovalStatus === 'approved' ? '#059669' : '#7c3aed',
                  border: `1px solid ${post.clientApprovalStatus === 'approved' ? '#a7f3d0' : '#ddd6fe'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <ShieldCheck size={12} /> {post.clientApprovalStatus === 'approved' ? 'Client Approved' : 'Client Review'}
                </span>
              )}
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Content Review & Decision
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Multi-Step Approval Progress Tracker */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Multi-Step Approval Workflow:</span>
              <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                {post.steps.filter(s => s.status === 'approved').length} of {post.steps.length} Steps Complete
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {post.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11.5px'
                  }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: step.status === 'approved' ? '#10b981' : step.status === 'rejected' ? '#ef4444' : step.status === 'changes_requested' ? '#f59e0b' : '#64748b',
                      color: '#ffffff'
                    }}>
                      {step.status === 'approved' ? <Check size={11} /> : step.stepNumber}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {step.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ({step.assignedApproverName})
                    </span>
                  </div>
                  {idx < post.steps.length - 1 && (
                    <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Approver & Workflow Timestamps Box */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* Assigned Approver with Selection */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Assigned Approver
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  src={post.assignedApprover.avatar} 
                  name={post.assignedApprover.name} 
                  size={26} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <select
                    value={post.assignedApprover.id}
                    onChange={(e) => {
                      const selected = currentBrand.users.find(u => u.id === e.target.value);
                      if (selected) {
                        onAssignApprover(post.id, {
                          id: selected.id,
                          name: selected.name,
                          role: selected.role,
                          avatar: selected.avatar
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {currentBrand.users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Post Author
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  src={post.author.avatar} 
                  name={post.author.name} 
                  size={26} 
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {post.author.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({post.author.role})</span>
                </span>
              </div>
            </div>

            {/* Workflow Timestamps Grid */}
            <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '2px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px' }}>Submitted:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {new Date(post.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px' }}>Reviewed / Decided:</span>
                  <span style={{ fontWeight: 500, color: post.reviewedAt ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {post.reviewedAt ? new Date(post.reviewedAt).toLocaleString() : 'Pending'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px' }}>Resubmitted:</span>
                  <span style={{ fontWeight: 500, color: post.resubmittedAt ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {post.resubmittedAt ? new Date(post.resubmittedAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Media Preview */}
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
                maxHeight: '220px'
              }}>
                <img
                  src={post.thumbnailUrl}
                  alt="Post preview"
                  style={{ width: '100%', height: 'auto', maxHeight: '220px', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* Caption / Content with Version History */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Post Caption (v{post.version})
              </label>
              {post.status === 'changes_requested' && activeAction !== 'resubmit' && (
                <button
                  type="button"
                  onClick={() => setActiveAction('resubmit')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={12} /> Edit & Resubmit
                </button>
              )}
            </div>

            {activeAction === 'resubmit' ? (
              <div>
                <textarea
                  rows={4}
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveAction('idle')}
                    style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: '#fff', cursor: 'pointer' }}
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDecisionSubmit}
                    style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer' }}
                  >
                    Save & Resubmit for Review
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Target Platforms */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Targeting:</span>
            {post.platforms.map(p => (
              <span
                key={p}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}
              >
                {renderPlatformIcon(p)}
                {p}
              </span>
            ))}
          </div>

          {/* Decision Feedback Form when Action is Active */}
          {activeAction !== 'idle' && activeAction !== 'resubmit' && (
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: activeAction === 'reject' ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${activeAction === 'reject' ? '#fecaca' : '#fde68a'}`,
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: activeAction === 'reject' ? '#991b1b' : '#92400e' }}>
                {activeAction === 'reject' ? 'Rejection Reason (Required)' : 'Feedback / Required Changes'}
              </h4>
              <textarea
                rows={3}
                placeholder={activeAction === 'reject' ? 'Explain why this post is rejected...' : 'List the exact edits requested...'}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12.5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction('idle');
                    setFeedbackText('');
                  }}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDecisionSubmit}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: activeAction === 'reject' ? '#dc2626' : '#d97706',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {activeAction === 'reject' ? 'Confirm Rejection' : 'Send Changes Request'}
                </button>
              </div>
            </div>
          )}

          {/* Sub-Navigation: Reviewer Comments & @Mentions vs. Approval History */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '14px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'comments' ? 600 : 500,
                color: activeTab === 'comments' ? 'var(--color-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'comments' ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={13} />
              <span>Reviewer Comments ({post.comments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'history' ? 600 : 500,
                color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <History size={13} />
              <span>Approval History ({post.history?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: COMMENTS & @MENTIONS */}
          {activeTab === 'comments' && (
            <div>
              {/* Comment Thread */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {post.comments.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    No comments recorded for this post yet.
                  </div>
                ) : (
                  post.comments.map(c => (
                    <div
                      key={c.id}
                      className={`comment-bubble ${c.decision ? `decision-${c.decision}` : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.authorName}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                            ({c.authorRole})
                          </span>
                          {c.decision && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: c.decision === 'approved' ? '#dcfce7' : c.decision === 'rejected' ? '#fee2e2' : '#fef3c7',
                              color: c.decision === 'approved' ? '#15803d' : c.decision === 'rejected' ? '#b91c1c' : '#b45309',
                              textTransform: 'uppercase'
                            }}>
                              {c.decision.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                          {new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input & @Mention quick chips */}
              <div style={{
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick @mention:</span>
                  {availableMentions.map(mention => (
                    <button
                      key={mention}
                      type="button"
                      onClick={() => handleInsertMention(mention)}
                      className="mention-chip"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {mention}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add a reviewer note or tag team member..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    style={{
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Send size={12} /> Post
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT & APPROVAL HISTORY */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!post.history || post.history.length === 0) ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No historical events logged yet for this post record.
                </div>
              ) : (
                post.history.map((h: ApprovalHistoryEvent) => (
                  <div
                    key={h.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          backgroundColor: h.action.toLowerCase().includes('approved') ? '#dcfce7' : h.action.toLowerCase().includes('rejected') ? '#fee2e2' : h.action.toLowerCase().includes('changes') ? '#fef3c7' : '#eff6ff',
                          color: h.action.toLowerCase().includes('approved') ? '#15803d' : h.action.toLowerCase().includes('rejected') ? '#b91c1c' : h.action.toLowerCase().includes('changes') ? '#b45309' : '#1d4ed8'
                        }}>
                          {h.action}
                        </span>
                        {h.isClientApproval && (
                          <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 600 }}>[Client Review]</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      <strong>{h.user.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({h.user.role})</span>
                    </div>

                    {h.note && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '8px', borderLeft: '2px solid var(--border-subtle)', marginTop: '2px' }}>
                        "{h.note}"
                      </div>
                    )}
                  </div>
                ))
              )}
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
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          {/* Decision Buttons — only shown when post is actively reviewable */}
          {(post.status === 'in_review' || post.status === 'submitted' || post.status === 'resubmitted') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {!canReview ? (
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {isAuthor ? 'Authors cannot approve their own posts.' : `Review actions restricted for ${currentUser?.role || 'this role'}.`}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveAction('reject')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fff5f5',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAction('changes')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid #fde68a',
                      backgroundColor: '#fffbeb',
                      color: '#b45309',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <AlertTriangle size={14} /> Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onApprove(post.id);
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
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>
                      {pendingStep && isMultiStep 
                        ? `Approve Step ${pendingStep.stepNumber}: ${pendingStep.title}` 
                        : 'Approve Post'}
                    </span>
                  </button>
                </>
              )}
            </div>
          ) : post.status === 'changes_requested' ? (
            <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={13} /> Awaiting edits and resubmission from author
            </span>
          ) : post.status === 'approved' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#047857', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Post approved — ready to schedule or publish
              </span>
              {onScheduleOrPublish && (
                <button
                  type="button"
                  onClick={() => onScheduleOrPublish(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <CalendarCheck size={13} /> Schedule / Publish
                </button>
              )}
            </div>
          ) : post.status === 'rejected' ? (
            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={13} /> Post rejected
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
