import React, { useState, useEffect } from 'react';
import { PostRecord } from './types';
import { X, Send, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { approvalService } from '../../services/approvalService';
import { BrandUser } from '../../types';

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
  const { currentBrand } = useApp();

  const initialApprovers = currentBrand.users.filter(u => u.role.toLowerCase() === 'approver');
  const [reviewers, setReviewers] = useState<BrandUser[]>(initialApprovers);
  const [selectedReviewerId, setSelectedReviewerId] = useState(initialApprovers[0]?.id || 'u-3');
  const [note, setNote] = useState('Please review this post copy and media before scheduled publishing.');

  useEffect(() => {
    let isMounted = true;
    approvalService.getBrandApprovers(currentBrand.id).then(approverList => {
      if (!isMounted) return;
      if (approverList && approverList.length > 0) {
        setReviewers(approverList);
        if (!selectedReviewerId || !approverList.some(r => r.id === selectedReviewerId)) {
          setSelectedReviewerId(approverList[0].id);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentBrand.id]);

  if (!isOpen || !post) return null;

  const handleSubmit = () => {
    const reviewer = reviewers.find(r => r.id === selectedReviewerId) || reviewers[0];
    if (!reviewer) return;
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
              Select Approver / Reviewer ({currentBrand.name})
            </label>
            {reviewers.length === 0 ? (
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '12px' }}>
                No authorized approver found for {currentBrand.name}.
              </div>
            ) : (
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13.5px',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                {reviewers.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.role} ({r.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Review Instructions / Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={reviewers.length === 0}
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: reviewers.length === 0 ? 'var(--text-light)' : 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: reviewers.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={13} />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
