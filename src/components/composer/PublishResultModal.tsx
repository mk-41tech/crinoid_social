import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, ExternalLink, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { SocialPlatform, PostDraft } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';

interface PublishResultModalProps {
  draft: PostDraft;
  selectedPlatforms: SocialPlatform[];
  liveUrls?: Record<string, string>;
  isRealPublish?: boolean;
  onClose: () => void;
}

export const PublishResultModal: React.FC<PublishResultModalProps> = ({
  draft,
  selectedPlatforms,
  liveUrls = {},
  isRealPublish = false,
  onClose
}) => {
  const [step, setStep] = useState<number>(isRealPublish ? 4 : 1);

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

              {selectedPlatforms.map(p => {
                const liveUrl = liveUrls[p] || (p === 'youtube' ? draft.publishedUrl : undefined);

                return (
                  <div
                    key={p}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: PLATFORM_CONFIG[p].brandColor }}>
                      {PLATFORM_CONFIG[p].name}
                    </span>

                    {liveUrl ? (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12.5px',
                          color: p === 'youtube' ? '#dc2626' : p === 'facebook' ? '#1877f2' : p === 'instagram' ? '#db2777' : '#2563eb',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none',
                          backgroundColor: p === 'youtube' ? '#fee2e2' : p === 'facebook' ? '#eff6ff' : p === 'instagram' ? '#fdf2f8' : '#eff6ff',
                          padding: '4px 10px',
                          borderRadius: '6px'
                        }}
                      >
                        <span>View Live on {PLATFORM_CONFIG[p].name}</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                        Published (Simulated)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isRealPublish ? '#f0fdf4' : '#eff6ff',
              border: isRealPublish ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {isRealPublish ? (
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            ) : (
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            )}
            <div style={{ fontSize: '12px', color: isRealPublish ? '#15803d' : '#1e40af', lineHeight: 1.4 }}>
              {isRealPublish ? (
                <span><strong>Live Upload:</strong> Successfully dispatched to your authorized YouTube channel via YouTube Data API v3.</span>
              ) : (
                <span><strong>Notice:</strong> This is a frontend demonstration. Content was not sent to external social networks.</span>
              )}
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
