import React, { useState } from 'react';
import { ApprovalRule } from './types';
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  Settings2, 
  Layers, 
  Users, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ApprovalRulesTabProps {
  rules: ApprovalRule[];
  onToggleRule: (ruleId: string) => void;
  onUpdateRule: (updatedRule: ApprovalRule) => void;
}

export const ApprovalRulesTab: React.FC<ApprovalRulesTabProps> = ({
  rules,
  onToggleRule,
  onUpdateRule
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro banner */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--color-primary-light)',
        border: '1px solid var(--color-primary-border)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)' }}>
              Approval Workflows & Governance
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Enforce multi-step verification and external client sign-offs before posts can be published or scheduled.
            </p>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rules.map(rule => (
          <div
            key={rule.id}
            style={{
              borderRadius: '10px',
              border: `1px solid ${rule.enabled ? 'var(--color-primary-border)' : 'var(--border-subtle)'}`,
              backgroundColor: '#ffffff',
              padding: '18px 20px',
              boxShadow: rule.enabled ? '0 2px 8px rgba(79, 70, 229, 0.04)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rule.name}
                  </h4>
                  {rule.requiresClient && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#f5f3ff',
                      color: '#7c3aed',
                      border: '1px solid #ddd6fe'
                    }}>
                      Client Sign-Off Required
                    </span>
                  )}
                  {rule.autoPublishOnApproval && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#d1fae5',
                      color: '#047857'
                    }}>
                      Auto-Publish on Approval
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {rule.description}
                </p>
              </div>

              {/* Enable / Disable toggle switch */}
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: rule.enabled ? 'var(--color-primary)' : 'var(--text-light)' }}>
                  {rule.enabled ? 'Active' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => onToggleRule(rule.id)}
                  style={{
                    width: '38px',
                    height: '22px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-primary)'
                  }}
                />
              </label>
            </div>

            {/* Visual Step Pipeline */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Approval Chain:
              </span>

              {rule.steps.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10.5px',
                      fontWeight: 700
                    }}>
                      {st.order}
                    </span>
                    <span>{st.role}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>({st.approverName})</span>
                  </div>

                  {idx < rule.steps.length - 1 && (
                    <ArrowRight size={13} style={{ color: 'var(--text-light)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
