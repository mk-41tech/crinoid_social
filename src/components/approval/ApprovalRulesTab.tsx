import React, { useState } from 'react';
import { ApprovalRule } from './types';
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  Layers, 
  Users, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  Globe,
  Lock,
  X
} from 'lucide-react';

interface ApprovalRulesTabProps {
  rules: ApprovalRule[];
  onToggleRule: (ruleId: string) => void;
  onUpdateRule: (updatedRule: ApprovalRule) => void;
  onAddRule?: (rule: ApprovalRule) => void;
}

export const ApprovalRulesTab: React.FC<ApprovalRulesTabProps> = ({
  rules,
  onToggleRule,
  onUpdateRule,
  onAddRule
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'agency_client' | 'enterprise_multi'>('agency_client');
  const [ruleName, setRuleName] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [requiresClient, setRequiresClient] = useState(true);
  const [autoPublish, setAutoPublish] = useState(true);

  const handleCreateRule = () => {
    if (!ruleName.trim()) return;

    let steps: { order: number; title: string; role: string; approverName: string; isClientStep?: boolean }[] = [
      { order: 1, title: 'Internal Content Check', role: 'Social Lead', approverName: 'Muthukumar' }
    ];

    if (selectedTemplate === 'agency_client') {
      steps = [
        { order: 1, title: 'Agency Lead Review', role: 'Social Lead', approverName: 'Muthukumar' },
        { order: 2, title: 'Client Sign-Off', role: 'Brand Director', approverName: 'Nexus Brand Client', isClientStep: true }
      ];
    } else if (selectedTemplate === 'enterprise_multi') {
      steps = [
        { order: 1, title: 'Copy & Media Verification', role: 'Content Editor', approverName: 'Priya' },
        { order: 2, title: 'Legal & Brand Guidelines', role: 'Compliance Lead', approverName: 'Karthik' },
        { order: 3, title: 'Executive Approval', role: 'Social Lead', approverName: 'Muthukumar' }
      ];
    }

    const newRule: ApprovalRule = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      description: ruleDesc.trim() || 'Custom workflow rule for social media publishing.',
      enabled: true,
      requiresClient: requiresClient || selectedTemplate === 'agency_client',
      autoPublishOnApproval: autoPublish,
      workflowType: selectedTemplate,
      steps,
      appliesTo: 'all'
    };

    if (onAddRule) {
      onAddRule(newRule);
    }
    setShowAddModal(false);
    setRuleName('');
    setRuleDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro banner */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.15)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e40af' }}>
              Industry Standard Approval Workflows & Governance
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#475569' }}>
              Define multi-step sign-offs, external client approval portals, and auto-publishing policies as used in FS Poster, Planable & Sprout Social.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={15} />
          <span>New Approval Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rules.map(rule => (
          <div
            key={rule.id}
            style={{
              borderRadius: '10px',
              border: `1px solid ${rule.enabled ? '#93c5fd' : '#e2e8f0'}`,
              backgroundColor: '#ffffff',
              padding: '18px 20px',
              boxShadow: rule.enabled ? '0 2px 8px rgba(37, 99, 235, 0.05)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
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
                      backgroundColor: '#dcfce7',
                      color: '#15803d'
                    }}>
                      Auto-Publish on Approval
                    </span>
                  )}
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    textTransform: 'uppercase'
                  }}>
                    {rule.workflowType ? rule.workflowType.replace('_', ' ') : 'Standard'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  {rule.description}
                </p>
              </div>

              {/* Enable / Disable toggle switch */}
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: rule.enabled ? '#2563eb' : '#94a3b8' }}>
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
                    accentColor: '#2563eb'
                  }}
                />
              </label>
            </div>

            {/* Visual Step Pipeline */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Sequential Chain:
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
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: st.isClientStep ? '#ede9fe' : '#dbeafe',
                      color: st.isClientStep ? '#7c3aed' : '#2563eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10.5px',
                      fontWeight: 700
                    }}>
                      {st.order}
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{st.title}</span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>({st.role}: {st.approverName})</span>
                  </div>

                  {idx < rule.steps.length - 1 && (
                    <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Approval Rule Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Create Approval Workflow Rule
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Workflow Template
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'standard', title: '1-Step Standard', desc: 'Creator ➔ Approver' },
                    { id: 'agency_client', title: 'Agency + Client', desc: 'Internal ➔ Client Sign-off' },
                    { id: 'enterprise_multi', title: 'Enterprise 3-Step', desc: 'Editor ➔ Legal ➔ Exec' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${selectedTemplate === tmpl.id ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: selectedTemplate === tmpl.id ? '#eff6ff' : '#ffffff',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: selectedTemplate === tmpl.id ? '#1d4ed8' : '#0f172a' }}>
                        {tmpl.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        {tmpl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Rule Name
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Client Sign-Off for Campaigns"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={ruleDesc}
                  onChange={(e) => setRuleDesc(e.target.value)}
                  placeholder="Briefly state when this approval applies..."
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={requiresClient}
                    onChange={(e) => setRequiresClient(e.target.checked)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>Enforce external client sign-off step</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoPublish}
                    onChange={(e) => setAutoPublish(e.target.checked)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>Auto-schedule and publish immediately upon final approval</span>
                </label>
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRule}
                disabled={!ruleName.trim()}
                style={{
                  padding: '7px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  cursor: ruleName.trim() ? 'pointer' : 'not-allowed',
                  opacity: ruleName.trim() ? 1 : 0.6
                }}
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
