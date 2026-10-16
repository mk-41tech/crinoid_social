import React from 'react';
import { SocialPlatform, PostDraft } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { useApp } from '../../context/AppContext';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MediaValidationNoticeProps {
  draft: PostDraft;
  selectedPlatforms: SocialPlatform[];
}

export const MediaValidationNotice: React.FC<MediaValidationNoticeProps> = ({
  draft,
  selectedPlatforms
}) => {
  const { currentBrand } = useApp();
  const issues: { platform: SocialPlatform; message: string; severity: 'error' | 'warning' }[] = [];

  const hasMedia = draft.mediaUrls.length > 0;
  const isVideo = draft.mediaType === 'video' || draft.mediaUrls.some(u => u.endsWith('.mp4'));

  selectedPlatforms.forEach(p => {
    const config = PLATFORM_CONFIG[p];
    const variant = draft.platformVariants[p];
    const caption = (variant?.caption !== undefined && variant.caption !== '')
      ? variant.caption
      : draft.commonCaption;

    // Check if channel is disconnected
    const isConnected = currentBrand.accounts.some(a => a.platform === p);
    if (!isConnected) {
      issues.push({
        platform: p,
        message: `${config.name} is currently disconnected for ${currentBrand.name}. Reconnect this channel or deselect it.`,
        severity: 'warning'
      });
    }

    // Check character count
    if (caption.length > config.charLimit) {
      issues.push({
        platform: p,
        message: `${config.name} caption exceeds maximum limit (${caption.length}/${config.charLimit} chars).`,
        severity: 'error'
      });
    }

    // Platform requirements
    if (p === 'youtube') {
      const ytTitle = variant?.title;
      if (!ytTitle || ytTitle.trim() === '') {
        issues.push({
          platform: p,
          message: 'YouTube requires a Video Title.',
          severity: 'error'
        });
      }
      if (!hasMedia || !isVideo) {
        issues.push({
          platform: p,
          message: 'YouTube requires a video attachment.',
          severity: 'error'
        });
      }
    }

    if (p === 'instagram') {
      if (!hasMedia) {
        issues.push({
          platform: p,
          message: 'Instagram posts require at least one photo or video.',
          severity: 'warning'
        });
      }
    }
  });

  if (issues.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
        <AlertTriangle size={14} />
        <span>Publishing Requirements</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {issues.map((issue, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: issue.severity === 'error' ? '#b91c1c' : '#92400e'
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: issue.severity === 'error' ? '#ef4444' : '#f59e0b',
                flexShrink: 0
              }}
            />
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
