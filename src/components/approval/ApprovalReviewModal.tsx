import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalPostItem, ApprovalHistoryEvent, PostVersion } from './types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  Send, 
  ShieldCheck, 
  Check, 
  Edit3,
  Calendar,
  History,
  CalendarCheck,
  Eye,
  GitCompare,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XIcon } from '../common/SocialIcons';
import { Avatar } from '../common/Avatar';
import { format12Hour } from '../../utils/dateValidation';

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
  const [activeAction, setActiveAction] = useState<'idle' | 'reject' | 'changes' | 'resubmit' | 'edit'>('idle');
  const [viewMode, setViewMode] = useState<'preview' | 'versions'>('preview');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
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
      if (post.platforms && post.platforms.length > 0) {
        setSelectedPlatform(post.platforms[0]);
      }
    }
  }, [post?.id, post?.version]);

  if (!isOpen || !post) return null;

  // Authorization check
  const isApproverRole = !currentUser || ['approver', 'social lead', 'brand manager', 'admin', 'brand approver', 'client approver', 'brand director', 'compliance lead'].includes((currentUser.role || '').toLowerCase());
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
    } else if (activeAction === 'edit') {
      // Authoritative direct edit
      onResubmit(post.id, editedCaption);
      setActiveAction('idle');
    }
  };

  // Active step in the workflow chain
  const currentStep = post.steps[post.currentStepIndex || 0] || post.steps[0];
  const pendingStep = post.steps.find(s => s.status === 'pending' || s.status === 'in_progress' || s.status === 'changes_requested');
  const isMultiStep = post.steps.length > 1;

  const renderPlatformIcon = (platform: string, size = 14) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon size={size} color="#E4405F" />;
      case 'facebook': return <FacebookIcon size={size} color="#1877F2" />;
      case 'linkedin': return <LinkedinIcon size={size} color="#0A66C2" />;
      case 'youtube': return <YoutubeIcon size={size} color="#FF0000" />;
      case 'x': return <XIcon size={size} color="#0f1419" />;
      default: return null;
    }
  };

  // Helper to format ISO to readable IST string
  const formatScheduledTime = (iso?: string) => {
    if (!iso) return 'Not scheduled';
    try {
      const d = new Date(iso);
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${format12Hour(timeStr)} (IST)`;
    } catch {
      return iso;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(3px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Top Bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569' }}>
              {post.id}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#4338ca' }}>
              v{post.version}
            </span>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'capitalize',
              backgroundColor: post.status === 'approved' ? '#dcfce7' : post.status === 'rejected' ? '#fee2e2' : post.status === 'changes_requested' ? '#fef3c7' : '#eff6ff',
              color: post.status === 'approved' ? '#15803d' : post.status === 'rejected' ? '#b91c1c' : post.status === 'changes_requested' ? '#b45309' : '#1d4ed8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              {post.status.replace('_', ' ')}
            </span>

            {post.requiresClientApproval && (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: post.clientApprovalStatus === 'approved' ? '#ecfdf5' : '#f5f3ff',
                color: post.clientApprovalStatus === 'approved' ? '#059669' : '#7c3aed',
                border: `1px solid ${post.clientApprovalStatus === 'approved' ? '#a7f3d0' : '#ddd6fe'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={13} /> {post.clientApprovalStatus === 'approved' ? 'Client Approved' : 'Client Review Required'}
              </span>
            )}

            <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <Clock size={13} /> Scheduled: {formatScheduledTime(post.scheduledAt)}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Industry Standard Multi-Stage Stepper Header */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Approval Chain:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-start', minWidth: '400px' }}>
            {post.steps.map((step, idx) => {
              const isStepDone = step.status === 'approved';
              const isStepCurrent = (step.status === 'pending' || step.status === 'in_progress') && (idx === post.currentStepIndex || idx === 0);
              const isStepChanges = step.status === 'changes_requested';
              const isStepRejected = step.status === 'rejected';

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: isStepDone ? '#ecfdf5' : isStepCurrent ? '#eff6ff' : isStepChanges ? '#fffbeb' : '#ffffff',
                    border: `1px solid ${isStepDone ? '#a7f3d0' : isStepCurrent ? '#93c5fd' : isStepChanges ? '#fde68a' : '#e2e8f0'}`,
                    boxShadow: isStepCurrent ? '0 1px 3px rgba(37, 99, 235, 0.1)' : 'none'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isStepDone ? '#10b981' : isStepCurrent ? '#2563eb' : isStepChanges ? '#f59e0b' : isStepRejected ? '#ef4444' : '#94a3b8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {isStepDone ? <Check size={12} /> : step.stepNumber}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isStepDone ? '#065f46' : isStepCurrent ? '#1e40af' : '#1e293b' }}>
                        {step.title}
                      </span>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {step.assignedRole} • {step.assignedApproverName}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      backgroundColor: isStepDone ? '#d1fae5' : isStepCurrent ? '#dbeafe' : isStepChanges ? '#fef3c7' : '#f1f5f9',
                      color: isStepDone ? '#047857' : isStepCurrent ? '#1d4ed8' : isStepChanges ? '#b45309' : '#64748b',
                      marginLeft: '4px'
                    }}>
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>

                  {idx < post.steps.length - 1 && (
                    <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* View Mode Toggle: Preview vs Version Diff */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              style={{
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'preview' ? '#ffffff' : 'transparent',
                color: viewMode === 'preview' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Eye size={12} /> Live Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('versions')}
              style={{
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'versions' ? '#ffffff' : 'transparent',
                color: viewMode === 'versions' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <GitCompare size={12} /> Versions ({post.versions?.length ? post.versions.length + 1 : 1})
            </button>
          </div>
        </div>

        {/* Modal 2-Column Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden' }}>
          
          {/* Left Column: Post Previews & Versions */}
          <div style={{ padding: '20px', borderRight: '1px solid var(--border-subtle, #e2e8f0)', overflowY: 'auto', backgroundColor: '#fafafa' }}>
            
            {viewMode === 'preview' ? (
              <div>
                {/* Platform Switcher Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
                    Preview Platform:
                  </span>
                  {post.platforms.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlatform(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: `1px solid ${selectedPlatform === p ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: selectedPlatform === p ? '#eff6ff' : '#ffffff',
                        color: selectedPlatform === p ? '#1d4ed8' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {renderPlatformIcon(p, 13)}
                      <span style={{ textTransform: 'capitalize' }}>{p}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated Social Post Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden'
                }}>
                  {/* Card Header */}
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <Avatar src={currentBrand.logo} name={currentBrand.name} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{currentBrand.name}</span>
                        {renderPlatformIcon(selectedPlatform, 13)}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Author: {post.author.name} ({post.author.role})
                      </span>
                    </div>
                  </div>

                  {/* Media Display */}
                  {post.thumbnailUrl && (
                    <div style={{
                      backgroundColor: '#0f172a',
                      maxHeight: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={post.thumbnailUrl}
                        alt="Post media"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  {/* Caption Text */}
                  <div style={{ padding: '14px' }}>
                    {activeAction === 'edit' ? (
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                          Edit Caption as Reviewer (Updates v{post.version}):
                        </label>
                        <textarea
                          value={editedCaption}
                          onChange={(e) => setEditedCaption(e.target.value)}
                          rows={5}
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '13px',
                            borderRadius: '6px',
                            border: '1px solid #2563eb',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditedCaption(post.caption);
                              setActiveAction('idle');
                            }}
                            style={{ padding: '4px 8px', fontSize: '11.5px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDecisionSubmit}
                            style={{ padding: '4px 12px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff' }}
                          >
                            Save Direct Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                          {post.caption}
                        </p>
                        {canReview && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditedCaption(post.caption);
                                setActiveAction('edit');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                color: '#2563eb',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: 0
                              }}
                            >
                              <Edit3 size={12} /> Edit Copy Directly
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Version History & Diff View */
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Version History & Revisions (Current: v{post.version})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Current Active Version */}
                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #93c5fd',
                    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>
                        Version {post.version} (Active / Current)
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {post.resubmittedAt ? new Date(post.resubmittedAt).toLocaleString() : new Date(post.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#0f172a', whiteSpace: 'pre-wrap' }}>
                      {post.caption}
                    </p>
                  </div>

                  {/* Previous Versions */}
                  {post.versions && post.versions.length > 0 ? (
                    post.versions.map((ver, idx) => (
                      <div key={idx} style={{
                        padding: '14px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                            Version {ver.version} (Archived)
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {new Date(ver.changedAt).toLocaleString()} by {ver.changedBy.name}
                          </span>
                        </div>
                        {ver.changeNote && (
                          <div style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic', marginBottom: '6px' }}>
                            Note: "{ver.changeNote}"
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.45, color: '#475569', textDecoration: 'line-through', opacity: 0.8 }}>
                          {ver.caption}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      This post is currently at initial Version 1. When changes are requested and the author resubmits, previous versions will be archived here with side-by-side comparison.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Author Resubmit Box when Changes Requested */}
            {post.status === 'changes_requested' && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                  <AlertTriangle size={15} />
                  <span>Changes Requested: Address Feedback & Resubmit (v{post.version + 1})</span>
                </div>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  rows={4}
                  placeholder="Update your caption copy here..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #d97706',
                    fontFamily: 'inherit',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onResubmit(post.id, editedCaption);
                      onClose();
                    }}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#b45309',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Resubmit for Approval (v{post.version + 1})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Review Details, Comments & Audit Trail */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            
            {/* Tab Selector */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle, #e2e8f0)', backgroundColor: '#ffffff' }}>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'comments' ? '#2563eb' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  color: activeTab === 'comments' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} /> Review Discussion ({post.comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'history' ? '#2563eb' : 'transparent'}`,
                  backgroundColor: 'transparent',
                  color: activeTab === 'history' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <History size={14} /> Audit Trail ({post.history.length})
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {activeTab === 'comments' ? (
                <>
                  {/* Comments Thread */}
                  {post.comments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', padding: '30px 10px' }}>
                      No comments yet. Reviewers and authors can collaborate and mention colleagues here.
                    </div>
                  ) : (
                    post.comments.map(c => {
                      const isDecision = c.type === 'decision';
                      return (
                        <div
                          key={c.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: isDecision ? '#f8fafc' : '#ffffff',
                            border: `1px solid ${isDecision ? '#cbd5e1' : '#e2e8f0'}`,
                            fontSize: '12.5px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Avatar src={c.authorAvatar} name={c.authorName} size={22} />
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.authorName}</span>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>({c.authorRole})</span>
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#334155', lineHeight: 1.4 }}>
                            {c.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (
                /* Audit Trail Events */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {post.history.map(h => (
                    <div
                      key={h.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{h.action}</span>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          {new Date(h.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11.5px' }}>
                        By <strong>{h.user.name}</strong> ({h.user.role})
                      </div>
                      {h.note && (
                        <div style={{ marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #cbd5e1', color: '#475569', fontSize: '11.5px' }}>
                          "{h.note}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Composer Bar */}
            {activeTab === 'comments' && (
              <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle, #e2e8f0)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginRight: '4px' }}>Mention:</span>
                  {availableMentions.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleInsertMention(m)}
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9',
                        color: '#2563eb',
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    placeholder="Add a reviewer note or question..."
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePostComment}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          backgroundColor: '#ffffff',
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
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          {/* Decision Actions Area */}
          {(post.status === 'in_review' || post.status === 'submitted' || post.status === 'resubmitted') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {!canReview ? (
                <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  {isAuthor ? 'Authors cannot approve their own submissions.' : `Review actions restricted for ${currentUser?.role || 'this role'}.`}
                </span>
              ) : activeAction === 'reject' ? (
                /* Inline Reject Reason Input */
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide reason for rejecting..."
                    style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #ef4444', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleDecisionSubmit}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction('idle')}
                    style={{ padding: '6px 10px', fontSize: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : activeAction === 'changes' ? (
                /* Inline Request Changes Feedback Input */
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Specify changes needed by author..."
                    style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #f59e0b', outline: 'none', width: '220px' }}
                  />
                  <button
                    type="button"
                    onClick={handleDecisionSubmit}
                    style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Send to Author
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction('idle')}
                    style={{ padding: '6px 10px', fontSize: '12px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Standard Decision Buttons */
                <>
                  <button
                    type="button"
                    onClick={() => setActiveAction('reject')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fff5f5',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={15} /> Reject Post
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAction('changes')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #fde68a',
                      backgroundColor: '#fffbeb',
                      color: '#b45309',
                      cursor: 'pointer'
                    }}
                  >
                    <AlertTriangle size={15} /> Request Changes
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
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {pendingStep && isMultiStep 
                        ? `Approve Step ${pendingStep.stepNumber}: ${pendingStep.title}` 
                        : 'Approve & Clear Post'}
                    </span>
                  </button>
                </>
              )}
            </div>
          ) : post.status === 'changes_requested' ? (
            <span style={{ fontSize: '12.5px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={15} /> Awaiting updates and resubmission from author
            </span>
          ) : post.status === 'approved' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12.5px', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={15} /> Approved & cleared for publication
              </span>
              {onScheduleOrPublish && (
                <button
                  type="button"
                  onClick={() => onScheduleOrPublish(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary, #2563eb)',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <CalendarCheck size={14} /> Schedule / Publish
                </button>
              )}
            </div>
          ) : post.status === 'rejected' ? (
            <span style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <XCircle size={15} /> Post permanently rejected
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
