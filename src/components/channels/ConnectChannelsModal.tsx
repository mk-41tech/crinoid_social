import React from 'react';
import { useApp } from '../../context/AppContext';
import { PLATFORM_CONFIG, INITIAL_CONNECT_PLATFORMS, ALL_PLATFORMS } from '../../config/platformsConfig';
import { BRAND_CHANNELS_CATALOG } from '../../config/mockData';
import { SocialPlatform } from '../../types';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { 
  X, 
  Check, 
  Plus, 
  ArrowRight, 
  Radio, 
  ShieldCheck 
} from 'lucide-react';

export const ConnectChannelsModal: React.FC = () => {
  const { 
    showConnectModal, 
    setShowConnectModal, 
    currentBrand, 
    currentBrandAccounts, 
    openSimulatedAuth,
    setCurrentView
  } = useApp();

  if (!showConnectModal) {
    return null;
  }

  const getPlatformIcon = (platform: SocialPlatform, size = 18) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon size={size} color="currentColor" />;
      case 'facebook': return <FacebookIcon size={size} color="currentColor" />;
      case 'linkedin': return <LinkedinIcon size={size} color="currentColor" />;
      case 'youtube': return <YoutubeIcon size={size} color="currentColor" />;
    }
  };

  const isConnected = (platform: SocialPlatform) => {
    return currentBrandAccounts.some(a => a.platform === platform);
  };

  const handleConnectClick = (platform: SocialPlatform) => {
    openSimulatedAuth(platform, 'composer');
  };

  const handleSkip = () => {
    setShowConnectModal(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
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
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Radio size={16} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Connect Channels
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Connect social accounts for <strong>{currentBrand.name}</strong> to begin composing and previewing posts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Channels List */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
            Available Platforms
          </div>

          {ALL_PLATFORMS.map(platform => {
            const config = PLATFORM_CONFIG[platform];
            const connected = isConnected(platform);
            const catalog = (BRAND_CHANNELS_CATALOG[currentBrand.id] || BRAND_CHANNELS_CATALOG['brand-crinoid'])[platform];

            return (
              <div
                key={platform}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: connected ? '1px solid #bbf7d0' : '1px solid var(--border-subtle)',
                  backgroundColor: connected ? '#f0fdf4' : 'var(--bg-subtle)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: config.bgColor,
                      color: config.brandColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getPlatformIcon(platform, 18)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {config.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {catalog?.username || catalog?.name}
                    </div>
                  </div>
                </div>

                <div>
                  {connected ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#15803d',
                        padding: '4px 10px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '999px'
                      }}
                    >
                      <Check size={13} />
                      Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectClick(platform)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: config.brandColor,
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Plus size={13} />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="#3b82f6" />
            <span>Simulated authentication demo</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSkip}
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer', padding: '7px 16px', fontSize: '13px' }}
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConnectModal(false);
                setCurrentView('composer');
              }}
              className="btn btn-primary btn-sm"
              style={{ cursor: 'pointer', padding: '7px 16px', fontSize: '13px' }}
            >
              Go to Composer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
