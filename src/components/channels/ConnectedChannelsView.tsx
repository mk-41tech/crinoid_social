import React from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_PLATFORMS, PLATFORM_CONFIG } from '../../config/platformsConfig';
import { BRAND_CHANNELS_CATALOG } from '../../config/mockData';
import { SocialPlatform } from '../../types';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { 
  Radio, 
  Check, 
  Plus, 
  Trash2, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  ExternalLink,
  PenSquare
} from 'lucide-react';
import { isYoutubeConfigured } from '../../services/youtube';

export const ConnectedChannelsView: React.FC = () => {
  const { 
    currentBrand, 
    currentBrandAccounts, 
    disconnectAccount, 
    openSimulatedAuth, 
    resetBrandAccounts, 
    setCurrentView, 
    showToast 
  } = useApp();

  const getPlatformIcon = (platform: SocialPlatform, size = 20) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon size={size} color="currentColor" />;
      case 'facebook': return <FacebookIcon size={size} color="currentColor" />;
      case 'linkedin': return <LinkedinIcon size={size} color="currentColor" />;
      case 'youtube': return <YoutubeIcon size={size} color="currentColor" />;
    }
  };

  const handleConnect = (platform: SocialPlatform) => {
    openSimulatedAuth(platform, 'channels');
  };

  const handleDisconnect = (platform: SocialPlatform) => {
    const config = PLATFORM_CONFIG[platform];
    disconnectAccount(currentBrand.id, platform);
    showToast('info', `${config.name} account disconnected.`);
  };

  const totalConnected = currentBrandAccounts.length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Connected Channels
            </h1>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '999px',
                backgroundColor: totalConnected > 0 ? 'var(--color-primary-light)' : 'var(--bg-muted)',
                color: totalConnected > 0 ? 'var(--color-primary)' : 'var(--text-secondary)'
              }}
            >
              {totalConnected} of {ALL_PLATFORMS.length} Connected
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Manage social media channels authorized for <strong>{currentBrand.name}</strong>. Connected accounts are selectable in the Composer.
          </p>
        </div>

        {/* Quick Nav to Composer */}
        <button
          type="button"
          onClick={() => setCurrentView('composer')}
          className="btn btn-primary"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '13px' }}
        >
          <PenSquare size={15} />
          <span>Open Composer</span>
        </button>
      </div>

      {/* Demo Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} color="#2563eb" />
          <span>
            <strong>Simulated OAuth Environment:</strong> Accounts use mock authentication with Indian / Tamil identities.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => resetBrandAccounts(currentBrand.id, 'load_defaults')}
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Connect initial demo channels (Instagram, Facebook, LinkedIn, YouTube)"
          >
            <RotateCcw size={12} />
            <span>Load Demo Channels</span>
          </button>
          <button
            type="button"
            onClick={() => resetBrandAccounts(currentBrand.id, 'clear')}
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', fontSize: '12px', padding: '6px 12px', color: '#dc2626', borderColor: '#fca5a5' }}
            title="Disconnect all channels to test the zero-channel onboarding dialog"
          >
            <span>Disconnect All</span>
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {ALL_PLATFORMS.map(platform => {
          const config = PLATFORM_CONFIG[platform];
          const connectedAccount = currentBrandAccounts.find(a => a.platform === platform);
          const isConnected = !!connectedAccount;
          const catalog = (BRAND_CHANNELS_CATALOG[currentBrand.id] || BRAND_CHANNELS_CATALOG['brand-crinoid'])[platform];

          return (
            <div
              key={platform}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                border: isConnected ? `1.5px solid ${config.brandColor}33` : '1px solid var(--border-subtle)',
                boxShadow: isConnected ? 'var(--shadow-sm)' : 'none',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: config.bgColor,
                      color: config.brandColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getPlatformIcon(platform, 22)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {config.name}
                      </h3>
                      {platform === 'youtube' && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: isYoutubeConfigured() ? '#dcfce7' : '#f1f5f9',
                            color: isYoutubeConfigured() ? '#15803d' : '#64748b',
                            border: `1px solid ${isYoutubeConfigured() ? '#86efac' : '#cbd5e1'}`
                          }}
                        >
                          {isYoutubeConfigured() ? 'Live OAuth Ready' : 'YouTube Ready'}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Char Limit: {config.charLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Connection Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isConnected && connectedAccount?.accessToken && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      }}
                      title="Authenticated with live Google OAuth 2.0"
                    >
                      Live OAuth
                    </span>
                  )}
                  {isConnected ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '3px 9px',
                        borderRadius: '999px'
                      }}
                    >
                      <Check size={12} /> Connected
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-muted)',
                        padding: '3px 9px',
                        borderRadius: '999px'
                      }}
                    >
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Account Identity Details */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isConnected ? 'var(--bg-subtle)' : '#f9fafb',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <img
                  src={connectedAccount?.avatar || catalog?.avatar}
                  alt={config.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    opacity: isConnected ? 1 : 0.6
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isConnected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {connectedAccount?.name || catalog?.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {connectedAccount?.username || catalog?.username}
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '4px' }}>
                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(platform)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#dc2626',
                      borderColor: '#fecaca'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(platform)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: config.brandColor,
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '7px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={14} />
                    <span>Connect {config.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
