import React, { useState } from 'react';
import { PostRecord } from './types';
import { X, Send, UserCheck, AlertCircle } from 'lucide-react';

interface SubmitApprovalModalProps {
  post: PostRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postId: string, reviewerId: string, reviewerName: string, note: string) => void;
}

export const SubmitApprovalModal: React.FC<SubmitApprovalModalProps> = ({
  post,
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen || !post) return null;

  const reviewers = [
    { id: 'u-3', name: 'Karthik', role: 'Approver' },
    { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' }
  ];

  const [selectedReviewerId, setSelectedReviewerId] = useState(reviewers[0].id);
  const [note, setNote] = useState('Please review this post copy and media before scheduled publishing.');

  const handleSubmit = () => {
    const reviewer = reviewers.find(r => r.id === selectedReviewerId) || reviewers[0];
    onSubmit(post.id, reviewer.id, reviewer.name, note);
    onClose();
  };

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
        maxWidth: '460px',
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
            <UserCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Submit for Approval
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Post: {post.id}
            </p>
            <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.caption}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Select Approver / Reviewer
            </label>
            <select
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px'
              }}
            >
              {reviewers.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Review Note for Approver
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any specific context or review instructions..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                resize: 'none'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '6px',
            color: 'var(--color-primary)',
            fontSize: '12px'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>The approver will be notified and this post status will update to <strong>Awaiting Approval</strong>.</span>
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
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
            <Send size={13} /> Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
};
