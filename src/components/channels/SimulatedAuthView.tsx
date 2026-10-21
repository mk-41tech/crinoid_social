import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { BRAND_CHANNELS_CATALOG } from '../../config/mockData';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Sparkles,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  isYoutubeConfigured, 
  connectYoutubeWithPopup, 
  fetchMyYoutubeChannel 
} from '../../services/youtube';

export const SimulatedAuthView: React.FC = () => {
  const { 
    currentBrand, 
    simulatedAuthPlatform, 
    closeSimulatedAuth, 
    connectAccount, 
    showToast 
  } = useApp();

  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  if (!simulatedAuthPlatform) {
    return null;
  }

  const platform = simulatedAuthPlatform;
  const config = PLATFORM_CONFIG[platform];
  const catalog = (BRAND_CHANNELS_CATALOG[currentBrand.id] || BRAND_CHANNELS_CATALOG['brand-crinoid'])[platform];

  const getPlatformIcon = (size = 28) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon size={size} color="#ffffff" />;
      case 'facebook': return <FacebookIcon size={size} color="#ffffff" />;
      case 'linkedin': return <LinkedinIcon size={size} color="#ffffff" />;
      case 'youtube': return <YoutubeIcon size={size} color="#ffffff" />;
    }
  };

  const handleAuthorize = async () => {
    // Live Google OAuth 2.0 flow for YouTube if configured
    if (platform === 'youtube' && isYoutubeConfigured()) {
      setIsAuthorizing(true);
      try {
        const accessToken = await connectYoutubeWithPopup(currentBrand.id);
        const channel = await fetchMyYoutubeChannel(accessToken);
        await connectAccount(currentBrand.id, 'youtube', {
          username: channel.customUrl || `@${channel.title.toLowerCase().replace(/\s+/g, '')}`,
          name: channel.title,
          avatar: channel.avatarUrl,
          accessToken,
          channelId: channel.id,
          followers: channel.subscriberCount
        });
        showToast('success', `Connected live YouTube channel "${channel.title}"!`);
        closeSimulatedAuth();
      } catch (err: any) {
        showToast('error', err.message || 'YouTube connection failed.');
      } finally {
        setIsAuthorizing(false);
      }
      return;
    }

    // Simulated flow
    setIsAuthorizing(true);
    setTimeout(async () => {
      await connectAccount(currentBrand.id, platform);
      setIsAuthorizing(false);
      showToast('success', `${config.name} connected successfully.`);
      closeSimulatedAuth();
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Platform Branded Header */}
        <div
          style={{
            backgroundColor: config.brandColor,
            color: '#ffffff',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getPlatformIcon(24)}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
                Simulated OAuth 2.0 Authorization
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', letterSpacing: '-0.01em' }}>
                Connect {config.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSimulatedAuth}
            disabled={isAuthorizing}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Channel Mode Banner */}
          {platform === 'youtube' ? (
            isYoutubeConfigured() ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0'
                }}
              >
                <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12.5px', color: '#166534', lineHeight: 1.45 }}>
                  <strong>Live Google OAuth 2.0 Ready:</strong> Click <strong>"Sign in with Google"</strong> below to securely connect your YouTube channel.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '12.5px' }}>
                  <Sparkles size={15} />
                  <span>Live YouTube Ready &bull; Simulated Demo Mode</span>
                </div>
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.45 }}>
                  Credentials are blank in <code>.env</code>. You can click <strong>Authorize Simulation</strong> to test, or add your <code>VITE_YOUTUBE_CLIENT_ID</code> to <code>.env</code> anytime for real Google publishing.
                </div>
              </div>
            )
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe'
              }}
            >
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12.5px', color: '#1e40af', lineHeight: 1.45 }}>
                <strong>Simulated Authentication Demo:</strong> This flow demonstrates the full channel connection workflow. No real passwords or external OAuth credentials are required.
              </div>
            </div>
          )}

          {/* Account to Connect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account to Authorize
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={catalog.avatar}
                alt={catalog.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ffffff',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {catalog.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {catalog.username} &bull; {catalog.description}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                  Target Brand: {currentBrand.name}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions / Scopes List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Permissions Requested by Crinoid Social
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                fontSize: '12.5px',
                color: 'var(--text-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#16a34a" />
                <span>Read basic account profile and identity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#16a34a" />
                <span>Publish and schedule social media posts (Simulated)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#16a34a" />
                <span>Upload images, carousels, and video media</span>
              </div>
            </div>
          </div>

          {/* Identity Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <Lock size={13} />
            <span>Authorized on behalf of {catalog.authProfileName}</span>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={closeSimulatedAuth}
              disabled={isAuthorizing}
              className="btn btn-secondary"
              style={{ padding: '9px 18px', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="btn btn-primary"
              style={{
                backgroundColor: config.brandColor,
                borderColor: config.brandColor,
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isAuthorizing ? 'wait' : 'pointer'
              }}
            >
              {isAuthorizing ? (
                <>
                  <Loader2 size={15} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>
                    {platform === 'youtube'
                      ? (isYoutubeConfigured() ? 'Sign in with Google' : 'Authorize (Simulated)')
                      : 'Authorize and Connect'}
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
