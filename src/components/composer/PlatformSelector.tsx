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
import { Check, Plus } from 'lucide-react';

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
    <div className="composer-channel-row">
      <div className="composer-channel-header">
        <label className="composer-channel-title">
          Publish to
        </label>
        <button
          type="button"
          onClick={() => setCurrentView('channels')}
          className="composer-channel-link"
        >
          <span>Manage Channels &rarr;</span>
        </button>
      </div>

      <div className="composer-channel-pills">
        {connectedPlatforms.map(p => {
          const isSelected = selectedPlatforms.includes(p.id);
          const config = PLATFORM_CONFIG[p.id];

          return (
            <button
              key={p.id}
              type="button"
              className={`composer-channel-pill ${isSelected ? 'is-active' : ''}`}
              onClick={() => onTogglePlatform(p.id)}
              style={{
                borderColor: isSelected ? config.brandColor : undefined,
                backgroundColor: isSelected ? config.bgColor : undefined,
                color: isSelected ? config.brandColor : undefined
              }}
            >
              <div 
                style={{ 
                  color: config.brandColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '15px',
                  height: '15px'
                }}
              >
                {p.icon}
              </div>
              <span style={{ fontWeight: isSelected ? 700 : 500 }}>{p.label}</span>
              {isSelected && <Check size={13} color={config.brandColor} />}
            </button>
          );
        })}

        {/* Action to connect more channels */}
        <button
          type="button"
          onClick={() => setShowConnectModal(true)}
          className="composer-channel-add"
          title="Connect another social channel"
        >
          <Plus size={13} color="var(--color-primary, #4f46e5)" />
          <span>Connect Channel</span>
        </button>
      </div>
    </div>
  );
};
