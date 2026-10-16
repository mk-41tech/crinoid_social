import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, ExternalLink, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { SocialPlatform, PostDraft } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';

interface PublishResultModalProps {
  draft: PostDraft;
  selectedPlatforms: SocialPlatform[];
  onClose: () => void;
}

export const PublishResultModal: React.FC<PublishResultModalProps> = ({
  draft,
  selectedPlatforms,
  onClose
}) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 700);
    const timer2 = setTimeout(() => setStep(3), 1400);
    const timer3 = setTimeout(() => setStep(4), 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
          maxWidth: '520px',
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
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: step === 4 ? '#ecfdf5' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step === 4 ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <RefreshCw size={18} color="var(--color-primary)" className="animate-spin" />
            )}
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {step === 4 ? 'Publishing Completed' : 'Publishing...'}
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

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Progress sequence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 1, label: 'Checking content and platform limits' },
              { id: 2, label: 'Formatting media and captions' },
              { id: 3, label: 'Publishing to selected channels' },
              { id: 4, label: 'Published successfully' }
            ].map(item => {
              const isFinished = step >= item.id;
              const isCurrent = step === item.id;

              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isFinished ? '#10b981' : isCurrent ? 'var(--color-primary)' : 'var(--border-subtle)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {isFinished ? '✓' : item.id}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      color: isFinished ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isFinished ? 600 : 400
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Results list when complete */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Published Channels
              </div>

              {selectedPlatforms.map(p => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: PLATFORM_CONFIG[p].brandColor }}>
                    {PLATFORM_CONFIG[p].name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                    Published (Simulated)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.4 }}>
              <strong>Notice:</strong> This is a frontend demonstration. Content was not sent to external social networks.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-md"
            style={{ cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
