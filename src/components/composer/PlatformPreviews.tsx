import React, { useState } from 'react';
import { SocialPlatform, PostDraft } from '../../types';
import { useApp } from '../../context/AppContext';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { Avatar } from '../common/Avatar';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon,
  XIcon
} from '../common/SocialIcons';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  Share2, 
  Repeat, 
  Play,
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ThumbsDown,
  Info,
  AlertTriangle,
  Music2
} from 'lucide-react';

interface PlatformPreviewsProps {
  draft: PostDraft;
  selectedPlatforms: SocialPlatform[];
}

export const PlatformPreviews: React.FC<PlatformPreviewsProps> = ({
  draft,
  selectedPlatforms
}) => {
  const { currentBrand } = useApp();

  const [activeTab, setActiveTab] = useState<SocialPlatform>(() => {
    return selectedPlatforms[0] || 'instagram';
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fallback if current activeTab is deselected
  const currentPlatform = selectedPlatforms.includes(activeTab)
    ? activeTab
    : selectedPlatforms[0] || 'instagram';

  const config = PLATFORM_CONFIG[currentPlatform];
  const variant = draft.platformVariants[currentPlatform];

  // Resolve content: variant caption overrides common caption
  const rawCaption = (variant?.caption !== undefined && variant.caption !== '')
    ? variant.caption
    : draft.commonCaption;

  const captionText = rawCaption.trim()
    ? rawCaption
    : 'Write your caption in the editor to see the live multi-platform preview...';

  // Matched account
  const account = currentBrand.accounts.find(a => a.platform === currentPlatform) || {
    name: currentBrand.name,
    username: `@${currentBrand.name.toLowerCase().replace(/\s+/g, '')}`,
    avatar: currentBrand.logo,
    followers: '25K'
  };

  // Media
  const hasMedia = draft.mediaUrls.length > 0;
  const currentMediaUrl = hasMedia
    ? (draft.mediaUrls[activeSlideIndex] || draft.mediaUrls[0])
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  const isVideo = draft.mediaType === 'video' || (hasMedia && currentMediaUrl.endsWith('.mp4'));
  const displayThumbnail = (isVideo && draft.thumbnailUrl) ? draft.thumbnailUrl : currentMediaUrl;

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideIndex(prev => (prev > 0 ? prev - 1 : draft.mediaUrls.length - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlideIndex(prev => (prev < draft.mediaUrls.length - 1 ? prev + 1 : 0));
  };

  // Helper for styling #hashtags and @mentions
  const renderFormattedText = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        return <span key={index} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{part}</span>;
      }
      if (part.startsWith('@') && part.length > 1) {
        return <span key={index} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{part}</span>;
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return <span key={index} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Platform Switcher Tabs for Previews */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {selectedPlatforms.map(p => {
            const pConfig = PLATFORM_CONFIG[p];
            const isTabActive = p === currentPlatform;

            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setActiveTab(p);
                  setActiveSlideIndex(0);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isTabActive ? `1px solid ${pConfig.brandColor}` : '1px solid var(--border-subtle)',
                  backgroundColor: isTabActive ? pConfig.bgColor : '#ffffff',
                  color: isTabActive ? pConfig.brandColor : 'var(--text-secondary)',
                  fontSize: '12.5px',
                  fontWeight: isTabActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {p === 'instagram' && <InstagramIcon size={14} color={pConfig.brandColor} />}
                {p === 'facebook' && <FacebookIcon size={14} color={pConfig.brandColor} />}
                {p === 'linkedin' && <LinkedinIcon size={14} color={pConfig.brandColor} />}
                {p === 'youtube' && <YoutubeIcon size={14} color={pConfig.brandColor} />}
                {p === 'x' && <XIcon size={14} color={pConfig.brandColor} />}
                <span>{pConfig.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Info size={13} />
          <span>Approximate live preview</span>
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 16px',
          border: '1px solid var(--border-subtle)',
          minHeight: '440px'
        }}
      >
        {/* INSTAGRAM PREVIEW */}
        {currentPlatform === 'instagram' && (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #dbdbdb',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* IG Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '2px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                  <Avatar src={account.avatar} name={account.name} size={30} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#262626', lineHeight: 1.2 }}>
                    {account.username.replace('@', '')}
                  </div>
                </div>
              </div>
              <MoreHorizontal size={18} color="#262626" />
            </div>

            {/* IG Media */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#000000', overflow: 'hidden' }}>
              {isVideo ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img src={displayThumbnail} alt="Reel frame" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Play size={22} style={{ marginLeft: '3px' }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    Reel
                  </div>
                </div>
              ) : (
                <img src={currentMediaUrl} alt="Post content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* Carousel navigation */}
              {draft.mediaUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                    {activeSlideIndex + 1}/{draft.mediaUrls.length}
                  </div>
                </>
              )}
            </div>

            {/* IG Actions Bar */}
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Heart size={20} color="#262626" style={{ cursor: 'pointer' }} />
                  <MessageCircle size={20} color="#262626" style={{ cursor: 'pointer' }} />
                  <Send size={20} color="#262626" style={{ cursor: 'pointer' }} />
                </div>
                <Bookmark size={20} color="#262626" style={{ cursor: 'pointer' }} />
              </div>

              {/* Caption */}
              <div style={{ fontSize: '13px', color: '#262626', lineHeight: 1.45 }}>
                <strong style={{ marginRight: '6px' }}>{account.username.replace('@', '')}</strong>
                <span>
                  {isExpanded || captionText.length < 130
                    ? renderFormattedText(captionText)
                    : renderFormattedText(captionText.slice(0, 130))}
                </span>
                {captionText.length >= 130 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ background: 'none', border: 'none', padding: '0 4px', fontSize: '12px', color: '#8e8e8e', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {isExpanded ? 'less' : '...more'}
                  </button>
                )}
                {variant?.hashtags && (
                  <div style={{ color: '#00376b', marginTop: '6px', fontSize: '12px', fontWeight: 500 }}>
                    {variant.hashtags}
                  </div>
                )}
              </div>

              {/* First comment if provided */}
              {variant?.firstComment && (
                <div style={{ fontSize: '12px', color: '#262626', backgroundColor: '#fafafa', padding: '6px 8px', borderRadius: '4px', borderLeft: '2px solid var(--color-primary)' }}>
                  <span style={{ fontWeight: 700, marginRight: '4px' }}>{account.username.replace('@', '')}:</span>
                  <span style={{ color: '#555' }}>{variant.firstComment}</span>
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#8e8e8e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Just now
              </div>
            </div>
          </div>
        )}

        {/* FACEBOOK PREVIEW */}
        {currentPlatform === 'facebook' && (
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #ced0d4',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* FB Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar src={account.avatar} name={account.name} size={40} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#050505' }}>{account.name}</div>
                  <div style={{ fontSize: '12px', color: '#65676b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Just now</span>
                    <span>&bull;</span>
                    <Globe size={12} />
                  </div>
                </div>
              </div>
              <MoreHorizontal size={20} color="#65676b" />
            </div>

            {/* FB Caption */}
            <div style={{ padding: '0 16px 12px 16px', fontSize: '14px', color: '#050505', lineHeight: 1.45 }}>
              {renderFormattedText(captionText)}
            </div>

            {/* FB Media or Link Preview */}
            {draft.linkUrl ? (
              <div style={{ borderTop: '1px solid #e4e6eb', borderBottom: '1px solid #e4e6eb', backgroundColor: '#f0f2f5' }}>
                {draft.linkImage && (
                  <img src={draft.linkImage} alt="Link preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#65676b', textTransform: 'uppercase' }}>
                    {draft.linkDomain || 'CRINOID.SOCIAL'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#050505', marginTop: '2px' }}>
                    {draft.linkTitle || 'Explore Crinoid Social Solutions'}
                  </div>
                  {draft.linkDescription && (
                    <div style={{ fontSize: '12px', color: '#65676b', marginTop: '2px' }}>
                      {draft.linkDescription}
                    </div>
                  )}
                </div>
              </div>
            ) : hasMedia ? (
              <div style={{ width: '100%', height: '240px', backgroundColor: '#000000', overflow: 'hidden' }}>
                <img src={currentMediaUrl} alt="FB Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}

            {/* FB Action Bar */}
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid #ced0d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#65676b', cursor: 'pointer' }}>
                <ThumbsUp size={16} /> <span>Like</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#65676b', cursor: 'pointer' }}>
                <MessageCircle size={16} /> <span>Comment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#65676b', cursor: 'pointer' }}>
                <Share2 size={16} /> <span>Share</span>
              </div>
            </div>
          </div>
        )}

        {/* LINKEDIN PREVIEW */}
        {currentPlatform === 'linkedin' && (
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* LinkedIn Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 8px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar src={account.avatar} name={account.name} size={44} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(0,0,0,0.9)' }}>{account.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Crinoid Social &bull; Technology</div>
                  <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <span>Just now &bull;</span>
                    <Globe size={11} />
                  </div>
                </div>
              </div>
              <MoreHorizontal size={20} color="rgba(0,0,0,0.6)" />
            </div>

            {/* LinkedIn Copy */}
            <div style={{ padding: '0 16px 12px 16px', fontSize: '13.5px', color: 'rgba(0,0,0,0.9)', lineHeight: 1.5 }}>
              {renderFormattedText(captionText)}
            </div>

            {/* LinkedIn Media or Link */}
            {draft.linkUrl ? (
              <div style={{ borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f3f2ef' }}>
                {draft.linkImage && (
                  <img src={draft.linkImage} alt="Link card" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>
                    {draft.linkTitle || 'Strategic Social Distribution Playbook'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', marginTop: '2px' }}>
                    {draft.linkDomain || 'crinoid.social'}
                  </div>
                </div>
              </div>
            ) : hasMedia ? (
              <div style={{ width: '100%', height: '220px', backgroundColor: '#000000', overflow: 'hidden' }}>
                <img src={currentMediaUrl} alt="LinkedIn media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}

            {/* LinkedIn Action Bar */}
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
                <ThumbsUp size={16} /> <span>Like</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
                <MessageCircle size={16} /> <span>Comment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
                <Repeat size={16} /> <span>Repost</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
                <Send size={16} /> <span>Send</span>
              </div>
            </div>
          </div>
        )}

        {/* X (TWITTER) PREVIEW */}
        {currentPlatform === 'x' && (
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e7e7e7',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* X Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 16px 10px 16px' }}>
              <Avatar src={account.avatar} name={account.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f1419' }}>{account.name}</span>
                  <span style={{ fontSize: '13px', color: '#536471' }}>{account.username}</span>
                  <span style={{ fontSize: '13px', color: '#536471' }}>&middot; Just now</span>
                </div>
                {/* X Post Text */}
                <div style={{ fontSize: '14px', color: '#0f1419', lineHeight: 1.45, marginTop: '8px' }}>
                  {renderFormattedText(captionText)}
                </div>

                {/* X Media */}
                {hasMedia && (
                  <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e7e7e7' }}>
                    <img src={currentMediaUrl} alt="X media" style={{ width: '100%', maxHeight: '260px', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Link card */}
                {draft.linkUrl && (
                  <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e7e7e7' }}>
                    {draft.linkImage && (
                      <img src={draft.linkImage} alt="Link" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: '8px 12px', backgroundColor: '#f7f9f9' }}>
                      <div style={{ fontSize: '11px', color: '#536471' }}>{draft.linkDomain || 'crinoid.social'}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f1419', marginTop: '2px' }}>{draft.linkTitle || 'Read on Crinoid Social'}</div>
                    </div>
                  </div>
                )}

                {/* X Action Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#536471', fontSize: '12.5px', cursor: 'pointer' }}>
                    <MessageCircle size={16} /><span>24</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#536471', fontSize: '12.5px', cursor: 'pointer' }}>
                    <Repeat size={16} /><span>12</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#536471', fontSize: '12.5px', cursor: 'pointer' }}>
                    <Heart size={16} /><span>183</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#536471', fontSize: '12.5px', cursor: 'pointer' }}>
                    <ExternalLink size={16} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#536471', fontSize: '12.5px', cursor: 'pointer' }}>
                    <Share2 size={16} />
                  </div>
                </div>
              </div>
              <XIcon size={18} color="#0f1419" />
            </div>
          </div>
        )}

        {/* YOUTUBE PREVIEW */}
        {currentPlatform === 'youtube' && (
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Video Player Mockup */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000000', overflow: 'hidden' }}>
              <img src={displayThumbnail} alt="YouTube Video" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(255,0,0,0.4)' }}>
                  <Play size={26} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            </div>

            {/* Video Details */}
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f0f0f', lineHeight: 1.3 }}>
                {variant?.title || 'Video Title'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar src={account.avatar} name={account.name} size={36} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f0f0f' }}>{account.name}</div>
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    backgroundColor: '#0f0f0f',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Subscribe
                </button>
              </div>

              {/* Action Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f2f2f2', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                  <ThumbsUp size={14} /> <span>Like</span>
                  <span style={{ color: '#ccc' }}>|</span>
                  <ThumbsDown size={14} />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f2f2f2', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                  <Share2 size={14} /> <span>Share</span>
                </div>
              </div>

              {/* Description Box */}
              <div style={{ backgroundColor: '#f2f2f2', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#0f0f0f', lineHeight: 1.45 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, color: '#606060', marginBottom: '4px', fontSize: '11px' }}>
                  <span>Just now</span>
                  {variant?.youtubeCategory && (
                    <span style={{ backgroundColor: '#e5e7eb', padding: '1px 6px', borderRadius: '4px', color: '#374151' }}>
                      {variant.youtubeCategory}
                    </span>
                  )}
                </div>
                <div>{renderFormattedText(captionText)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
