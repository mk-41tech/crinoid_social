import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { PlatformSelector } from './PlatformSelector';
import { PlatformPreviews } from './PlatformPreviews';
import { EmojiPicker } from './EmojiPicker';
import { AltTextModal } from './AltTextModal';
import { ThumbnailSelector } from './ThumbnailSelector';
import { LinkAttachmentCard } from './LinkAttachmentCard';
import { ScheduleModal } from './ScheduleModal';
import { ApprovalModal } from './ApprovalModal';
import { PublishResultModal } from './PublishResultModal';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Hash, 
  Smile, 
  Link2, 
  X, 
  Send, 
  Calendar, 
  CheckSquare, 
  Save, 
  RotateCcw, 
  Clock, 
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sparkles,
  Radio,
  Plus
} from 'lucide-react';

export const ComposerView: React.FC = () => {
  const {
    currentBrand,
    draft,
    updateDraft,
    resetDraft,
    saveDraftToStorage,
    lastSavedTime,
    showToast,
    setCurrentView,
    setShowConnectModal
  } = useApp();

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(draft.platforms || []);
  const [activeEditorTab, setActiveEditorTab] = useState<'common' | SocialPlatform>('common');

  // Keep selectedPlatforms synchronized when draft.platforms changes (e.g. connecting/disconnecting channels)
  React.useEffect(() => {
    setSelectedPlatforms(draft.platforms || []);
  }, [draft.platforms]);
  
  // Popups & modals
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaErrorMessage, setMediaErrorMessage] = useState<string | null>(null);
  const [editingAltTextIndex, setEditingAltTextIndex] = useState<number | null>(null);
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Synchronize platforms
  const handleTogglePlatform = (platform: SocialPlatform) => {
    let updated: SocialPlatform[];
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length === 1) {
        showToast('warning', 'At least one social channel must remain selected.');
        return;
      }
      updated = selectedPlatforms.filter(p => p !== platform);
      if (activeEditorTab === platform) {
        setActiveEditorTab('common');
      }
    } else {
      updated = [...selectedPlatforms, platform];
    }
    setSelectedPlatforms(updated);
    updateDraft({ platforms: updated });
  };

  // Get active text and handler for active editor tab
  const activeVariant = activeEditorTab !== 'common' ? draft.platformVariants[activeEditorTab] : null;
  const currentText = activeEditorTab === 'common' 
    ? draft.commonCaption 
    : (activeVariant?.caption !== undefined ? activeVariant.caption : draft.commonCaption);

  const handleTextChange = (text: string) => {
    if (activeEditorTab === 'common') {
      updateDraft({ commonCaption: text });
    } else {
      updateDraft({
        platformVariants: {
          ...draft.platformVariants,
          [activeEditorTab]: {
            ...draft.platformVariants[activeEditorTab],
            caption: text
          }
        }
      });
    }
  };

  // Insertion helpers
  const handleToggleEmojiPicker = () => {
    if (captionTextareaRef.current) {
      savedSelectionRef.current = {
        start: captionTextareaRef.current.selectionStart ?? currentText.length,
        end: captionTextareaRef.current.selectionEnd ?? currentText.length
      };
    }
    setShowEmojiPicker(prev => !prev);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = captionTextareaRef.current;
    const start = savedSelectionRef.current.start ?? currentText.length;
    const end = savedSelectionRef.current.end ?? start;

    // Replace selected text range or insert at saved cursor position
    const updated = currentText.slice(0, start) + emoji + currentText.slice(end);
    handleTextChange(updated);

    const nextCursor = start + emoji.length;
    savedSelectionRef.current = { start: nextCursor, end: nextCursor };
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      }
    });
  };

  const handleInsertHashtag = () => {
    const space = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
    handleTextChange(currentText + space + '#');
  };

  const handleInsertMention = () => {
    const space = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
    handleTextChange(currentText + space + '@');
  };

  // Media handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    let detectedType: 'image' | 'video' = draft.mediaType === 'video' ? 'video' : 'image';
    const isYouTubeOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube';
    const hasYouTube = selectedPlatforms.includes('youtube');
    const hasInstagram = selectedPlatforms.includes('instagram');
    const hasLinkedIn = selectedPlatforms.includes('linkedin');
    const hasFacebook = selectedPlatforms.includes('facebook');

    let errorMessage: string | null = null;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const fileSizeMB = file.size / (1024 * 1024);

      // 1. Format validation: must be image or video
      if (!isImage && !isVideo) {
        const fileExt = file.name.split('.').pop()?.toUpperCase() || 'unknown';
        errorMessage = `Unsupported file format (.${fileExt}). Social media channels only accept JPG, PNG, WEBP images or MP4, MOV videos.`;
        return;
      }

      // 2. YouTube validation: does not accept photos
      if (isYouTubeOnly && isImage) {
        errorMessage = `YouTube does not accept image formats (${file.name}). YouTube requires MP4 or MOV video uploads.`;
        return;
      }

      // 3. Instagram validation: does not accept large videos (>100MB)
      if (hasInstagram && isVideo && fileSizeMB > 100) {
        errorMessage = `Instagram does not accept videos larger than 100MB (${file.name} is ${fileSizeMB.toFixed(1)}MB). Please upload a compressed video under 100MB for Instagram.`;
        if (selectedPlatforms.length === 1) return;
      }

      // 4. Instagram image limit (>8MB)
      if (hasInstagram && isImage && fileSizeMB > 8) {
        errorMessage = `Instagram does not accept image files exceeding 8MB (${file.name} is ${fileSizeMB.toFixed(1)}MB).`;
        if (selectedPlatforms.length === 1) return;
      }

      // 5. LinkedIn limits: video max 200MB, image max 10MB
      if (hasLinkedIn && isVideo && fileSizeMB > 200) {
        errorMessage = `LinkedIn does not accept video files exceeding 200MB (${file.name} is ${fileSizeMB.toFixed(1)}MB).`;
        if (selectedPlatforms.length === 1) return;
      }
      if (hasLinkedIn && isImage && fileSizeMB > 10) {
        errorMessage = `LinkedIn does not accept image files exceeding 10MB (${file.name} is ${fileSizeMB.toFixed(1)}MB).`;
        if (selectedPlatforms.length === 1) return;
      }

      // 6. Facebook limits: video max 512MB, image max 30MB
      if (hasFacebook && isVideo && fileSizeMB > 512) {
        errorMessage = `Facebook does not accept video files exceeding 512MB (${file.name} is ${fileSizeMB.toFixed(1)}MB).`;
        if (selectedPlatforms.length === 1) return;
      }

      // 7. General max video size (>2GB)
      if (isVideo && fileSizeMB > 2048) {
        errorMessage = `Video file exceeds maximum allowable 2GB limit (${fileSizeMB.toFixed(1)}MB).`;
        return;
      }

      if (isVideo) {
        detectedType = 'video';
      }
      const fakeUrl = URL.createObjectURL(file);
      newUrls.push(fakeUrl);
    });

    if (errorMessage) {
      setMediaErrorMessage(errorMessage);
      showToast('error', errorMessage);
    } else {
      setMediaErrorMessage(null);
    }

    if (newUrls.length > 0) {
      const combinedUrls = [...draft.mediaUrls, ...newUrls];
      updateDraft({
        mediaUrls: combinedUrls,
        mediaType: detectedType === 'video' ? 'video' : combinedUrls.length > 1 ? 'carousel' : 'image'
      });
      showToast('success', `Added ${newUrls.length} file(s) to composer draft.`);

      if (hasYouTube && !isYouTubeOnly && newUrls.some(u => !u.endsWith('.mp4'))) {
        showToast('info', 'Note: Photos cannot be published to YouTube and will be omitted for YouTube.');
      }
    }

    // Reset file input so user can re-select same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updated = draft.mediaUrls.filter((_, i) => i !== index);
    updateDraft({
      mediaUrls: updated,
      mediaType: updated.length > 1 ? 'carousel' : updated.length === 1 ? 'image' : 'text'
    });
  };

  const handleMoveMedia = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draft.mediaUrls.length) return;
    const reordered = [...draft.mediaUrls];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    updateDraft({ mediaUrls: reordered });
  };

  // Validation before publishing actions
  const validateBeforePublish = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Caption check
    if (!draft.commonCaption.trim() && Object.values(draft.platformVariants).every(v => !v?.caption?.trim())) {
      errors.push('Please enter a caption or message before publishing.');
    }

    selectedPlatforms.forEach(p => {
      const config = PLATFORM_CONFIG[p];
      const variant = draft.platformVariants[p];
      const text = variant?.caption !== undefined ? variant.caption : draft.commonCaption;

      if (text.length > config.charLimit) {
        errors.push(`${config.name} exceeds character limit (${text.length}/${config.charLimit}).`);
      }

      if (p === 'youtube') {
        if (!variant?.title || !variant.title.trim()) {
          errors.push('YouTube requires a Video Title.');
        }
        if (draft.mediaUrls.length === 0 || draft.mediaType !== 'video') {
          errors.push('YouTube requires a video attachment.');
        }
      }

      if (p === 'instagram') {
        if (draft.mediaUrls.length === 0) {
          errors.push('Instagram requires at least one image or video.');
        }
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handlePublishNow = () => {
    const check = validateBeforePublish();
    if (!check.valid) {
      showToast('error', check.errors[0]);
      return;
    }
    setShowPublishModal(true);
    updateDraft({ status: 'published' });
  };

  const handleScheduleConfirm = (scheduledDateTime: string, tz: string) => {
    updateDraft({
      status: 'scheduled',
      scheduledAt: `${scheduledDateTime} (${tz})`
    });
    showToast('success', `Demo post scheduled for ${scheduledDateTime} (${tz}).`);
  };

  const handleApprovalSubmit = (reviewerId: string, note: string) => {
    updateDraft({
      status: 'pending_approval',
      assignedReviewerId: reviewerId
    });
    showToast('info', 'Submitted for demo approval.');
  };

  // Compute character limit indicator
  const activeCharLimit = activeEditorTab === 'common'
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_CONFIG[p].charLimit))
    : PLATFORM_CONFIG[activeEditorTab].charLimit;

  const isOverLimit = currentText.length > activeCharLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height))', backgroundColor: '#ffffff' }}>
      {/* Composer Top Toolbar */}
      <div
        style={{
          height: '56px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            &larr; Back
          </button>

          <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Composer
            </span>
          </div>

          {/* Autosave status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <Clock size={13} color="#10b981" />
            <span>{lastSavedTime ? `Saved at ${lastSavedTime}` : 'Saved'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={resetDraft}
            className="btn btn-ghost btn-sm"
            title="Reset to blank template"
            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={saveDraftToStorage}
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowApprovalModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckSquare size={14} />
            <span>Submit for Approval</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={14} />
            <span>Schedule</span>
          </button>

          <button
            type="button"
            onClick={handlePublishNow}
            disabled={currentBrand.accounts.length === 0}
            className="btn btn-primary btn-sm"
            style={{ 
              cursor: currentBrand.accounts.length === 0 ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontWeight: 600,
              opacity: currentBrand.accounts.length === 0 ? 0.6 : 1
            }}
          >
            <Send size={14} />
            <span>Publish Now</span>
          </button>
        </div>
      </div>

      {/* Main Composer Area: Empty State vs Two-Column Editor */}
      {currentBrand.accounts.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Radio size={28} />
          </div>

          <div style={{ maxWidth: '460px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              No Channels Connected
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              Connect your social media accounts for <strong>{currentBrand.name}</strong> to start creating, customizing, and previewing posts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="btn btn-primary"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '13.5px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Connect Channels</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('channels')}
              className="btn btn-secondary"
              style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '13.5px' }}
            >
              Manage Channels
            </button>
          </div>
        </div>
      ) : (
        /* Main Composer Two-Column Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
        {/* Left Panel: Content Creation Editor */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Channel Selector */}
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={handleTogglePlatform}
          />

          {/* Editor Tabs (Common Post vs Platform Variants) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => setActiveEditorTab('common')}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  border: 'none',
                  borderBottom: activeEditorTab === 'common' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  backgroundColor: activeEditorTab === 'common' ? 'var(--bg-subtle)' : 'transparent',
                  color: activeEditorTab === 'common' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: activeEditorTab === 'common' ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Common Post
              </button>

              {selectedPlatforms.map(p => {
                const config = PLATFORM_CONFIG[p];
                const isTabActive = activeEditorTab === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActiveEditorTab(p)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      border: 'none',
                      borderBottom: isTabActive ? `2px solid ${config.brandColor}` : '2px solid transparent',
                      backgroundColor: isTabActive ? config.bgColor : 'transparent',
                      color: isTabActive ? config.brandColor : 'var(--text-secondary)',
                      fontWeight: isTabActive ? 700 : 500,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    {config.name}
                  </button>
                );
              })}
            </div>

            {/* YouTube Title & Category fields */}
            {activeEditorTab === 'youtube' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={draft.platformVariants.youtube?.title || ''}
                    onChange={(e) => updateDraft({
                      platformVariants: {
                        ...draft.platformVariants,
                        youtube: {
                          ...draft.platformVariants.youtube,
                          title: e.target.value
                        }
                      }
                    })}
                    placeholder="Enter YouTube video title..."
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13.5px'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(draft.platformVariants.youtube?.title || '').length} / 100
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={draft.platformVariants.youtube?.youtubeCategory || 'Technology'}
                    onChange={(e) => updateDraft({
                      platformVariants: {
                        ...draft.platformVariants,
                        youtube: {
                          ...draft.platformVariants.youtube,
                          youtubeCategory: e.target.value
                        }
                      }
                    })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Howto & Style">How-to & Style</option>
                    <option value="Film & Animation">Film & Animation</option>
                    <option value="People & Blogs">People & Blogs</option>
                    <option value="Science & Technology">Science & Tech</option>
                  </select>
                </div>
              </div>
            )}

            {/* Textarea Input Wrap */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-lg)',
                border: isOverLimit ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                position: 'relative'
              }}
            >
              <textarea
                ref={captionTextareaRef}
                value={currentText}
                onChange={(e) => {
                  savedSelectionRef.current = {
                    start: e.target.selectionStart,
                    end: e.target.selectionEnd
                  };
                  handleTextChange(e.target.value);
                }}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  savedSelectionRef.current = {
                    start: target.selectionStart,
                    end: target.selectionEnd
                  };
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  savedSelectionRef.current = {
                    start: target.selectionStart,
                    end: target.selectionEnd
                  };
                }}
                onClick={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  savedSelectionRef.current = {
                    start: target.selectionStart,
                    end: target.selectionEnd
                  };
                }}
                placeholder={
                  activeEditorTab === 'common'
                    ? "Write your caption..."
                    : `Customize caption for ${PLATFORM_CONFIG[activeEditorTab].name}...`
                }
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                }}
              />

              {/* Formatting & insertion toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  position: 'relative',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Platform-specific Media Upload Button in Toolbar */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}
                    title={
                      activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube')
                        ? 'Upload video for YouTube (photos not supported)'
                        : activeEditorTab === 'instagram'
                        ? 'Upload photo or Reel (max 100MB)'
                        : 'Upload photo or video'
                    }
                    aria-label="Upload media"
                  >
                    {activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube') ? (
                      <Video size={15} color="#FF0000" />
                    ) : (
                      <ImageIcon size={15} color="var(--color-primary)" />
                    )}
                    <span>
                      {activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube')
                        ? 'Video'
                        : 'Media'}
                    </span>
                  </button>

                  {/* Emoji Button with Popover */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={handleToggleEmojiPicker}
                      style={{ 
                        background: showEmojiPicker ? 'var(--color-primary-light, #eef2ff)' : 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '12px', 
                        color: showEmojiPicker ? 'var(--color-primary)' : 'var(--text-secondary)' 
                      }}
                      title="Insert emoji"
                      aria-label="Insert emoji"
                      aria-expanded={showEmojiPicker}
                    >
                      <Smile size={15} color="var(--color-primary)" />
                      <span>Emoji</span>
                    </button>

                    {/* Popover Emoji Picker */}
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={handleInsertEmoji}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleInsertHashtag}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}
                    title="Insert hashtag"
                  >
                    <Hash size={15} color="#0284c7" />
                    <span>Hashtag</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertMention}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}
                    title="Insert mention"
                  >
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>@</span>
                    <span>Mention</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!draft.linkUrl) {
                        updateDraft({
                          linkUrl: 'https://crinoid.social',
                          linkTitle: 'Crinoid Social — Multi-Channel Publishing SaaS',
                          linkDomain: 'crinoid.social',
                          linkDescription: 'Unify your social publishing workflow with platform-native adaptations and live previews.'
                        });
                      } else {
                        updateDraft({ linkUrl: undefined });
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: draft.linkUrl ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: draft.linkUrl ? 700 : 400
                    }}
                    title="Toggle link preview card"
                  >
                    <Link2 size={15} />
                    <span>Link Card</span>
                  </button>
                </div>

                {/* Character Counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isOverLimit ? '#dc2626' : 'var(--text-muted)'
                    }}
                  >
                    {currentText.length} / {activeCharLimit} chars
                  </span>
                  {isOverLimit && (
                    <span title="Exceeds platform limit">
                      <AlertCircle size={14} color="#dc2626" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Instagram Hashtags field */}
            {activeEditorTab === 'instagram' && (
              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Instagram Hashtags
                </label>
                <input
                  type="text"
                  value={draft.platformVariants.instagram?.hashtags || ''}
                  onChange={(e) => updateDraft({
                    platformVariants: {
                      ...draft.platformVariants,
                      instagram: {
                        ...draft.platformVariants.instagram,
                        hashtags: e.target.value
                      }
                    }
                  })}
                  placeholder="#crinoid #branding #design #social"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            {/* Platform-specific options: First Comment */}
            {(activeEditorTab === 'instagram' || activeEditorTab === 'facebook' || activeEditorTab === 'linkedin') && (
              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  First Comment ({PLATFORM_CONFIG[activeEditorTab].name})
                </label>
                <input
                  type="text"
                  value={draft.platformVariants[activeEditorTab]?.firstComment || ''}
                  onChange={(e) => updateDraft({
                    platformVariants: {
                      ...draft.platformVariants,
                      [activeEditorTab]: {
                        ...draft.platformVariants[activeEditorTab],
                        firstComment: e.target.value
                      }
                    }
                  })}
                  placeholder={`Add a first comment on ${PLATFORM_CONFIG[activeEditorTab].name}...`}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Hidden File Input for Toolbar */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={
              activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube')
                ? 'video/mp4,video/quicktime,video/webm'
                : 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime'
            }
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Media Rejection / Format Error Notice */}
          {mediaErrorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12.5px',
                lineHeight: 1.4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{mediaErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setMediaErrorMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: '2px', display: 'flex' }}
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          )}



          {/* Attached Media Strip (only shown when media is attached) */}
          {draft.mediaUrls.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Attached Media ({draft.mediaUrls.length})
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11.5px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={13} />
                  <span>Add more</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {draft.mediaUrls.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      width: '120px',
                      flexShrink: 0,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-muted)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ position: 'relative', height: '90px' }}>
                      <img src={url} alt={`Attachment ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={12} />
                      </button>

                      <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Media Actions */}
                    <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setEditingAltTextIndex(index)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Alt Text
                      </button>

                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveMedia(index, index - 1)}
                          style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1, padding: '2px' }}
                          title="Move left"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={index === draft.mediaUrls.length - 1}
                          onClick={() => handleMoveMedia(index, index + 1)}
                          style={{ background: 'none', border: 'none', cursor: index === draft.mediaUrls.length - 1 ? 'default' : 'pointer', opacity: index === draft.mediaUrls.length - 1 ? 0.3 : 1, padding: '2px' }}
                          title="Move right"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Thumbnail Selector Trigger */}
              {(draft.mediaType === 'video' || draft.mediaUrls.some(u => u.endsWith('.mp4'))) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <Video size={15} color="var(--color-primary)" />
                    <span>Video Thumbnail</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowThumbnailSelector(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    Change Thumbnail
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Attached Link Card (if enabled) */}
          {draft.linkUrl && (
            <LinkAttachmentCard
              url={draft.linkUrl}
              title={draft.linkTitle}
              domain={draft.linkDomain}
              description={draft.linkDescription}
              image={draft.linkImage}
              onUpdate={(data) => updateDraft({
                linkUrl: data.url,
                linkTitle: data.title,
                linkDomain: data.domain,
                linkDescription: data.description,
                linkImage: data.image
              })}
              onRemove={() => updateDraft({ linkUrl: undefined })}
            />
          )}

        </div>

        {/* Right Panel: Interactive Live Previews */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <PlatformPreviews
            draft={draft}
            selectedPlatforms={selectedPlatforms}
          />
        </div>
      </div>
    )}

      {/* Modals */}
      {editingAltTextIndex !== null && (
        <AltTextModal
          mediaUrl={draft.mediaUrls[editingAltTextIndex]}
          mediaIndex={editingAltTextIndex}
          initialAltText={draft.altTexts[editingAltTextIndex] || ''}
          onSave={(text) => {
            updateDraft({
              altTexts: {
                ...draft.altTexts,
                [editingAltTextIndex]: text
              }
            });
            showToast('success', 'Alt text saved successfully.');
          }}
          onClose={() => setEditingAltTextIndex(null)}
        />
      )}

      {showThumbnailSelector && (
        <ThumbnailSelector
          currentThumbnail={draft.thumbnailUrl}
          onSelectThumbnail={(url) => {
            updateDraft({ thumbnailUrl: url });
            showToast('success', 'Cover thumbnail updated.');
          }}
          onClose={() => setShowThumbnailSelector(false)}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal
          selectedPlatforms={selectedPlatforms}
          onConfirmSchedule={handleScheduleConfirm}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {showApprovalModal && (
        <ApprovalModal
          onSubmitApproval={handleApprovalSubmit}
          onClose={() => setShowApprovalModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishResultModal
          draft={draft}
          selectedPlatforms={selectedPlatforms}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
};
