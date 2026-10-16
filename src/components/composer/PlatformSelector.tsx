import React from 'react';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { useApp } from '../../context/AppContext';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { Check, Plus, Settings } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onTogglePlatform: (platform: SocialPlatform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onTogglePlatform
}) => {
  const { currentBrand, setShowConnectModal, setCurrentView } = useApp();

  const allAvailablePlatforms: { id: SocialPlatform; label: string; icon: React.ReactNode }[] = [
    { id: 'instagram', label: 'Instagram', icon: <InstagramIcon size={14} /> },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon size={14} /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <LinkedinIcon size={14} /> },
    { id: 'youtube', label: 'YouTube', icon: <YoutubeIcon size={14} /> }
  ];

  // Only show accounts that are connected to the active brand
  const connectedPlatforms = allAvailablePlatforms.filter(p => 
    currentBrand.accounts.some(a => a.platform === p.id)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Publish to
        </label>
        <button
          type="button"
          onClick={() => setCurrentView('channels')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '11.5px',
            color: 'var(--color-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0
          }}
        >
          Manage Channels &rarr;
        </button>
      </div>

      <div className="platform-selector-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {connectedPlatforms.map(p => {
          const isSelected = selectedPlatforms.includes(p.id);
          const config = PLATFORM_CONFIG[p.id];

          return (
            <button
              key={p.id}
              type="button"
              className={`platform-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => onTogglePlatform(p.id)}
              style={{
                borderColor: isSelected ? config.brandColor : 'var(--border-subtle)',
                backgroundColor: isSelected ? config.bgColor : '#ffffff',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <div 
                className="platform-chip-icon"
                style={{ color: config.brandColor }}
              >
                {p.icon}
              </div>
              <span style={{ fontWeight: isSelected ? 700 : 500 }}>{p.label}</span>
              {isSelected && <Check size={14} color={config.brandColor} />}
            </button>
          );
        })}

        {/* Action to connect more channels */}
        <button
          type="button"
          onClick={() => setShowConnectModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            backgroundColor: '#ffffff',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          title="Connect another social channel"
        >
          <Plus size={13} color="var(--color-primary)" />
          <span>Connect Channel</span>
        </button>
      </div>
    </div>
  );
};
