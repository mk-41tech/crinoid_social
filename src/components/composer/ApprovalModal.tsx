import React, { useState, useEffect } from 'react';
import { CheckSquare, X, Send, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common/Avatar';
import { BrandUser } from '../../types';
import { approvalService } from '../../services/approvalService';

interface ApprovalModalProps {
  onSubmitApproval: (reviewerId: string, note: string) => void;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  onSubmitApproval,
  onClose
}) => {
  const { currentBrand, showToast } = useApp();

  // Filter currentBrand users to strictly authorized approvers
  const initialApprovers = currentBrand.users.filter(u => u.role.toLowerCase() === 'approver');
  const [approvers, setApprovers] = useState<BrandUser[]>(initialApprovers);
  const [selectedReviewerId, setSelectedReviewerId] = useState(initialApprovers[0]?.id || '');
  const [note, setNote] = useState('');

  // Synchronize with authoritative backend approver list
  useEffect(() => {
    let isMounted = true;
    approvalService.getBrandApprovers(currentBrand.id).then(backendApprovers => {
      if (!isMounted) return;
      if (backendApprovers && backendApprovers.length > 0) {
        setApprovers(backendApprovers);
        if (!selectedReviewerId || !backendApprovers.some(a => a.id === selectedReviewerId)) {
          setSelectedReviewerId(backendApprovers[0].id);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentBrand.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewerId) {
      showToast('error', 'Please select an authorized brand approver.');
      return;
    }
    onSubmitApproval(selectedReviewerId, note);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Submit for Approval
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Assign Brand Approver ({currentBrand.name})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {approvers.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '12px' }}>
                  <AlertCircle size={16} />
                  <span>No authorized approver found for {currentBrand.name}.</span>
                </div>
              ) : (
                approvers.map(user => {
                  const isSelected = user.id === selectedReviewerId;

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedReviewerId(user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar src={user.avatar} name={user.name} size={32} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.role} &bull; {user.email}</div>
                        </div>
                      </div>
                      {isSelected && <UserCheck size={16} color="var(--color-primary)" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Editorial Note or Instructions (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please verify product pricing copy before approving for Instagram Reel..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={approvers.length === 0}
              className="btn btn-primary btn-sm"
              style={{ cursor: approvers.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} />
              <span>Submit for Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
