import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { PlatformSelector } from './PlatformSelector';
import { PlatformPreviews } from './PlatformPreviews';
import { EmojiPicker } from './EmojiPicker';
import { ContentLibraryMediaModal } from './ContentLibraryMediaModal';
import { AltTextModal } from './AltTextModal';
import { ThumbnailSelector } from './ThumbnailSelector';
import { LinkAttachmentCard } from './LinkAttachmentCard';
import { ScheduleModal } from './ScheduleModal';
import { ApprovalModal } from './ApprovalModal';
import { PublishResultModal } from './PublishResultModal';
import { uploadVideoToYoutube } from '../../services/youtube';
import { publishToFacebookPage, publishToInstagram } from '../../services/meta';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { 
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Radio,
  Plus,
  FolderKanban,
  Upload,
  Loader2
} from 'lucide-react';

export interface ComposerViewProps {
  onClose?: () => void;
  onPostScheduled?: (newPost?: any) => void;
  isInPageTab?: boolean;
}

export const ComposerView: React.FC<ComposerViewProps> = ({
  onClose,
  onPostScheduled,
  isInPageTab = false
}) => {
  const {
    currentBrand,
    draft,
    updateDraft,
    resetDraft,
    saveDraftToStorage,
    lastSavedTime,
    showToast,
    setCurrentView,
    setShowConnectModal,
    currentUser
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

  // Real YouTube Live Publishing State
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [isPublishingReal, setIsPublishingReal] = useState<boolean>(false);
  const [realPublishUrls, setRealPublishUrls] = useState<Record<string, string>>({});
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const mediaDropdownRef = useRef<HTMLDivElement>(null);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [isContentLibraryModalOpen, setIsContentLibraryModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutsideMediaDropdown = (e: MouseEvent) => {
      if (mediaDropdownRef.current && !mediaDropdownRef.current.contains(e.target as Node)) {
        setShowMediaDropdown(false);
      }
    };
    if (showMediaDropdown) {
      document.addEventListener('mousedown', handleClickOutsideMediaDropdown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMediaDropdown);
    };
  }, [showMediaDropdown]);

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
        setUploadedVideoFile(file);
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

  const handleAttachContentLibraryMedia = (selectedUrls: string[], detectedType: 'image' | 'video' | 'carousel') => {
    const isYouTubeOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube';
    const hasYouTube = selectedPlatforms.includes('youtube');

    const combinedUrls = [...draft.mediaUrls];
    selectedUrls.forEach(url => {
      if (!combinedUrls.includes(url)) {
        combinedUrls.push(url);
      }
    });

    const isVideo = detectedType === 'video' || draft.mediaType === 'video' || combinedUrls.some(u => u.endsWith('.mp4'));
    const finalMediaType = isVideo ? 'video' : combinedUrls.length > 1 ? 'carousel' : 'image';

    updateDraft({
      mediaUrls: combinedUrls,
      mediaType: finalMediaType
    });

    if (hasYouTube && !isYouTubeOnly && combinedUrls.some(u => !u.endsWith('.mp4'))) {
      showToast('info', 'Note: Photos cannot be published to YouTube and will be omitted for YouTube.');
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

  const handlePublishNow = async () => {
    const { valid, errors } = validateBeforePublish();
    if (!valid) {
      showToast('error', errors[0]);
      return;
    }

    // Check if YouTube, Facebook, or Instagram are connected with real tokens
    const ytAccount = currentBrand.accounts.find(a => a.platform === 'youtube');
    const fbAccount = currentBrand.accounts.find(a => a.platform === 'facebook');
    const igAccount = currentBrand.accounts.find(a => a.platform === 'instagram');

    const isLiveYouTubePublish = selectedPlatforms.includes('youtube') && Boolean(ytAccount?.accessToken);
    const isLiveFacebookPublish = selectedPlatforms.includes('facebook') && Boolean(fbAccount?.accessToken);
    const isLiveInstagramPublish = selectedPlatforms.includes('instagram') && Boolean(igAccount?.accessToken);

    if (isLiveYouTubePublish || isLiveFacebookPublish || isLiveInstagramPublish) {
      setIsPublishingReal(true);
      setUploadProgressPercent(0);
      const urls: Record<string, string> = {};

      try {
        // 1. Live YouTube Video Upload
        if (isLiveYouTubePublish) {
          if (!uploadedVideoFile) {
            showToast('error', 'Please attach a real MP4 or MOV video file to upload to YouTube.');
            setIsPublishingReal(false);
            return;
          }

          const ytTitle = draft.platformVariants.youtube?.title || draft.commonCaption.slice(0, 70) || 'New YouTube Video';
          const ytDescription = draft.platformVariants.youtube?.caption || draft.commonCaption;

          showToast('info', 'Uploading directly to your YouTube channel...');
          const ytResult = await uploadVideoToYoutube({
            file: uploadedVideoFile,
            accessToken: ytAccount!.accessToken!,
            title: ytTitle,
            description: ytDescription,
            privacyStatus: 'public',
            onProgress: (percent) => setUploadProgressPercent(percent)
          });
          urls.youtube = ytResult.url;
          showToast('success', `Live on YouTube: ${ytResult.url}`);
        }

        // 2. Live Facebook Page Publish
        if (isLiveFacebookPublish) {
          const fbCaption = draft.platformVariants?.facebook?.caption || draft.commonCaption;
          const fbImage = draft.mediaUrls.length > 0 ? draft.mediaUrls[0] : undefined;

          showToast('info', 'Publishing to your Facebook Page...');
          const fbResult = await publishToFacebookPage({
            pageId: fbAccount!.channelId!,
            pageAccessToken: fbAccount!.accessToken!,
            message: fbCaption,
            imageUrl: fbImage,
            linkUrl: draft.linkUrl
          });
          urls.facebook = fbResult.url;
          showToast('success', `Live on Facebook: ${fbResult.url}`);
        }

        // 3. Live Instagram Professional Publish
        if (isLiveInstagramPublish) {
          const igCaption = draft.platformVariants?.instagram?.caption || draft.commonCaption;
          const igImage = draft.mediaUrls.length > 0 ? draft.mediaUrls[0] : undefined;

          if (!igImage) {
            showToast('error', 'Instagram requires at least one image or video to publish.');
          } else {
            showToast('info', 'Publishing to your Instagram Professional account...');
            const igResult = await publishToInstagram({
              igUserId: igAccount!.channelId!,
              pageAccessToken: igAccount!.accessToken!,
              caption: igCaption,
              imageUrl: igImage
            });
            urls.instagram = igResult.url;
            showToast('success', `Live on Instagram: ${igResult.url}`);
          }
        }

        setRealPublishUrls(urls);
        updateDraft({
          status: 'published',
          publishedUrl: urls.facebook || urls.instagram || urls.youtube
        });
        setShowPublishModal(true);
      } catch (err: any) {
        showToast('error', `Live publishing error: ${err.message}`);
      } finally {
        setIsPublishingReal(false);
      }
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

    const newPost = {
      id: `cal-post-${Date.now()}`,
      brandId: currentBrand.id,
      caption: draft.commonCaption || 'Scheduled post',
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['linkedin'],
      status: 'scheduled',
      approvalStatus: 'approved',
      scheduledAt: scheduledDateTime.includes('T') ? scheduledDateTime : `${scheduledDateTime}T10:00:00`,
      thumbnailUrl: draft.thumbnailUrl || (draft.mediaUrls && draft.mediaUrls[0]) || '',
      mediaType: draft.mediaType || 'image',
      author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
      campaign: 'Social Campaign',
      createdAt: new Date().toISOString()
    };

    // Also persist into calendar posts storage so it is immediately visible on the Content Calendar
    try {
      const STORAGE_CALENDAR_POSTS = 'crinoid_calendar_posts_v1';
      const existing = localStorage.getItem(STORAGE_CALENDAR_POSTS);
      const posts: any[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem(STORAGE_CALENDAR_POSTS, JSON.stringify([newPost, ...posts]));
    } catch (e) {
      console.warn('Failed to save to calendar posts', e);
    }

    showToast('success', `Post scheduled for ${scheduledDateTime} (${tz}).`);
    if (onPostScheduled) {
      onPostScheduled(newPost);
    }
  };

  const handleApprovalSubmit = (reviewerId: string, note: string) => {
    updateDraft({
      status: 'pending_approval',
      assignedReviewerId: reviewerId
    });

    const approvalPost = {
      id: `cal-post-${Date.now()}`,
      brandId: currentBrand.id,
      caption: draft.commonCaption || 'Post pending approval',
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['linkedin'],
      status: 'scheduled',
      approvalStatus: 'in_review',
      scheduledAt: draft.scheduledAt?.includes('T') ? draft.scheduledAt.split(' ')[0] : (draft.scheduledAt || new Date().toISOString()),
      thumbnailUrl: draft.thumbnailUrl || (draft.mediaUrls && draft.mediaUrls[0]) || '',
      mediaType: draft.mediaType || 'image',
      author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
      campaign: 'Social Campaign',
      createdAt: new Date().toISOString()
    };

    try {
      const STORAGE_CALENDAR_POSTS = 'crinoid_calendar_posts_v1';
      const existing = localStorage.getItem(STORAGE_CALENDAR_POSTS);
      const posts: any[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem(STORAGE_CALENDAR_POSTS, JSON.stringify([approvalPost, ...posts]));

      // Also persist to Approval workflow queue
      const STORAGE_APPROVAL_POSTS = 'crinoid_approval_posts_v1';
      const existingApproval = localStorage.getItem(STORAGE_APPROVAL_POSTS);
      const approvalItems: any[] = existingApproval ? JSON.parse(existingApproval) : [];
      const reviewer = currentBrand.users.find(u => u.id === reviewerId) || { id: 'u-3', name: 'Karthik', role: 'Approver' as const, avatar: '' };
      const authorUser = currentUser || { id: 'u-2', name: 'Priya', role: 'Content Creator' as const, avatar: '' };
      const nowIso = new Date().toISOString();

      const newAppItem = {
        id: `APP-${Math.floor(100 + Math.random() * 900)}`,
        brandId: currentBrand.id,
        caption: draft.commonCaption || 'New submitted post',
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['linkedin'],
        mediaUrls: draft.mediaUrls || [],
        mediaType: draft.mediaType || 'image',
        thumbnailUrl: draft.thumbnailUrl || (draft.mediaUrls && draft.mediaUrls[0]) || '',
        author: {
          id: authorUser.id,
          name: authorUser.name,
          role: authorUser.role,
          avatar: authorUser.avatar
        },
        assignedApprover: {
          id: reviewer.id,
          name: reviewer.name,
          role: reviewer.role,
          avatar: reviewer.avatar
        },
        status: 'in_review',
        submittedAt: nowIso,
        version: 1,
        requiresClientApproval: false,
        steps: [
          {
            stepNumber: 1,
            title: 'Review & Sign-Off',
            assignedRole: reviewer.role,
            assignedApproverName: reviewer.name,
            status: 'pending'
          }
        ],
        history: [
          {
            id: `hist-${Date.now()}`,
            type: 'submission',
            action: 'Submitted for Approval',
            user: { id: authorUser.id, name: authorUser.name, role: authorUser.role, avatar: authorUser.avatar },
            timestamp: nowIso,
            note: note || 'Submitted post for approval review.'
          }
        ],
        comments: note ? [
          {
            id: `comm-${Date.now()}`,
            authorId: authorUser.id,
            authorName: authorUser.name,
            authorRole: authorUser.role,
            content: note,
            timestamp: nowIso,
            type: 'comment'
          }
        ] : []
      };
      localStorage.setItem(STORAGE_APPROVAL_POSTS, JSON.stringify([newAppItem, ...approvalItems]));
    } catch (e) {
      console.warn('Failed to save to calendar/approval posts', e);
    }

    showToast('info', 'Submitted for demo approval.');
    if (isInPageTab && onPostScheduled) {
      onPostScheduled(approvalPost);
    }
  };

  // Compute character limit indicator
  const activeCharLimit = activeEditorTab === 'common'
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_CONFIG[p].charLimit))
    : PLATFORM_CONFIG[activeEditorTab].charLimit;

  const isOverLimit = currentText.length > activeCharLimit;

  return (
    <div className="composer-view-root" style={{
      height: isInPageTab ? '100%' : 'calc(100vh - var(--topbar-height, 56px))',
      minHeight: isInPageTab ? 'calc(100vh - 120px)' : undefined
    }}>
      {/* Composer Top Toolbar */}
      <div className="composer-topbar">
        <div className="composer-topbar-left">
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                draft.scheduledAt ? setCurrentView('calendar') : setCurrentView('home');
              }
            }}
            className="c-btn c-btn-outline c-btn-sm"
          >
            {isInPageTab ? (
              <>
                <X size={14} />
                <span>Close</span>
              </>
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Back</span>
              </>
            )}
          </button>

          <div className="composer-topbar-divider" />

          <span className="composer-page-title">
            Composer
          </span>

          {/* Autosave status indicator */}
          <div className="composer-status-badge saved">
            <Clock size={12} color="#15803d" />
            <span>{lastSavedTime ? `Saved at ${lastSavedTime}` : 'Saved'}</span>
          </div>

          {/* Intended Post Date indicator from Calendar */}
          {draft.scheduledAt && (() => {
            let label = draft.scheduledAt;
            try {
              const isoPart = draft.scheduledAt.split(' ')[0];
              const dateObj = new Date(isoPart);
              if (!isNaN(dateObj.getTime())) {
                label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
            } catch {
              label = draft.scheduledAt;
            }
            return (
              <div
                onClick={() => setShowScheduleModal(true)}
                title="Click to adjust scheduled date"
                className="composer-status-badge scheduled"
              >
                <Calendar size={12} />
                <span>Scheduled: {label}</span>
              </div>
            );
          })()}
        </div>

        {/* Action Buttons */}
        <div className="composer-topbar-right">
          <button
            type="button"
            onClick={resetDraft}
            className="c-btn c-btn-ghost c-btn-sm"
            title="Reset to blank template"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={saveDraftToStorage}
            className="c-btn c-btn-outline c-btn-sm"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowApprovalModal(true)}
            className="c-btn c-btn-outline c-btn-sm"
          >
            <CheckSquare size={13} />
            <span>Submit for Approval</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="c-btn c-btn-outline c-btn-sm"
          >
            <Calendar size={13} />
            <span>Schedule</span>
          </button>

          <button
            type="button"
            onClick={handlePublishNow}
            disabled={currentBrand.accounts.length === 0 || isPublishingReal}
            className="c-btn c-btn-primary c-btn-sm"
          >
            {isPublishingReal ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Uploading {uploadProgressPercent > 0 ? `${uploadProgressPercent}%` : 'to YouTube...'}</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Publish Now</span>
              </>
            )}
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
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #c7d2fe'
            }}
          >
            <Radio size={30} />
          </div>

          <div style={{ maxWidth: '460px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              No Channels Connected
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '8px', lineHeight: 1.55 }}>
              Connect your social media accounts for <strong>{currentBrand.name}</strong> to start creating, customizing, and previewing posts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="c-btn c-btn-primary"
            >
              <Plus size={15} />
              <span>Connect Channels</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('channels')}
              className="c-btn c-btn-outline"
            >
              Manage Channels
            </button>
          </div>
        </div>
      ) : (
        /* Main Composer Two-Column Grid */
        <div className="composer-workspace-grid">
          {/* Left Panel: Content Creation Editor */}
          <div className="composer-editor-pane">
            {/* Channel Selector */}
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={handleTogglePlatform}
            />

            {/* Editor Tabs (Common Post vs Platform Variants) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="composer-tabs-track">
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('common')}
                  className={`composer-tab-btn ${activeEditorTab === 'common' ? 'is-active' : ''}`}
                >
                  <span>Common Post</span>
                </button>

                {selectedPlatforms.map(p => {
                  const config = PLATFORM_CONFIG[p];
                  const isTabActive = activeEditorTab === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActiveEditorTab(p)}
                      className={`composer-tab-btn ${isTabActive ? 'is-active' : ''}`}
                      style={{
                        color: isTabActive ? config.brandColor : undefined
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '13px', height: '13px' }}>
                        {p === 'instagram' && <InstagramIcon size={13} color={isTabActive ? config.brandColor : '#64748b'} />}
                        {p === 'facebook' && <FacebookIcon size={13} color={isTabActive ? config.brandColor : '#64748b'} />}
                        {p === 'linkedin' && <LinkedinIcon size={13} color={isTabActive ? config.brandColor : '#64748b'} />}
                        {p === 'youtube' && <YoutubeIcon size={13} color={isTabActive ? config.brandColor : '#64748b'} />}
                      </div>
                      <span>{config.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* YouTube Title & Category fields */}
              {activeEditorTab === 'youtube' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="composer-form-label">
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
                      className="composer-form-input"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      {(draft.platformVariants.youtube?.title || '').length} / 100
                    </div>
                  </div>

                  <div>
                    <label className="composer-form-label">
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
                      className="composer-form-select"
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
              <div className={`composer-editor-box ${isOverLimit ? 'limit-error' : ''}`}>
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
                  className="composer-textarea-field"
                />

                {/* Formatting & insertion toolbar */}
                <div className="composer-editor-actions-bar">
                  <div className="composer-tool-group">
                    {/* Platform-specific Media Button with Content Library / Device Menu */}
                    <div style={{ position: 'relative' }} ref={mediaDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowMediaDropdown(prev => !prev)}
                        className={`composer-tool-button ${showMediaDropdown || isContentLibraryModalOpen ? 'is-active' : ''}`}
                        title={
                          activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube')
                            ? 'Attach video from Content Library or Device'
                            : 'Attach media from Content Library or Device'
                        }
                        aria-label="Attach media"
                        aria-expanded={showMediaDropdown}
                      >
                        {activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube') ? (
                          <Video size={14} color="#ef4444" />
                        ) : (
                          <ImageIcon size={14} color="#4f46e5" />
                        )}
                        <span>
                          {activeEditorTab === 'youtube' || (selectedPlatforms.length === 1 && selectedPlatforms[0] === 'youtube')
                            ? 'Video'
                            : 'Media'}
                        </span>
                        <ChevronDown size={12} style={{ opacity: 0.7, marginLeft: -1 }} />
                      </button>

                      {showMediaDropdown && (
                        <div
                          className="composer-media-menu"
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            zIndex: 80,
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            padding: '6px',
                            minWidth: '230px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowMediaDropdown(false);
                              setIsContentLibraryModalOpen(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              fontSize: '12.5px',
                              fontWeight: 500,
                              color: '#0f172a',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              transition: 'background-color 150ms ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <FolderKanban size={16} color="#4f46e5" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>Choose from Content Library</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Select existing assets & brand media</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMediaDropdown(false);
                              fileInputRef.current?.click();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              fontSize: '12.5px',
                              fontWeight: 500,
                              color: '#0f172a',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                              transition: 'background-color 150ms ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Upload size={16} color="#0284c7" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>Upload from Computer</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Directly upload files from device</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Emoji Button with Popover */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={handleToggleEmojiPicker}
                        className={`composer-tool-button ${showEmojiPicker ? 'is-active' : ''}`}
                        title="Insert emoji"
                        aria-label="Insert emoji"
                        aria-expanded={showEmojiPicker}
                      >
                        <Smile size={14} color="#4f46e5" />
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
                      className="composer-tool-button"
                      title="Insert hashtag"
                    >
                      <Hash size={14} color="#0284c7" />
                      <span>Hashtag</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertMention}
                      className="composer-tool-button"
                      title="Insert mention"
                    >
                      <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '13px', lineHeight: 1 }}>@</span>
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
                      className={`composer-tool-button ${draft.linkUrl ? 'is-active' : ''}`}
                      title="Toggle link preview card"
                    >
                      <Link2 size={14} color={draft.linkUrl ? '#4f46e5' : '#64748b'} />
                      <span>Link Card</span>
                    </button>
                  </div>

                  {/* Character Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className={`composer-char-limit-badge ${isOverLimit ? 'exceeded' : ''}`}>
                      <span>{currentText.length} / {activeCharLimit} chars</span>
                      {isOverLimit && (
                        <AlertCircle size={13} style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline' }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Hashtags field */}
              {activeEditorTab === 'instagram' && (
                <div>
                  <label className="composer-form-label">
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
                    className="composer-form-input"
                  />
                </div>
              )}

              {/* Platform-specific options: First Comment */}
              {(activeEditorTab === 'instagram' || activeEditorTab === 'facebook' || activeEditorTab === 'linkedin') && (
                <div>
                  <label className="composer-form-label">
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
                    className="composer-form-input"
                  />
                </div>
              )}
            </div>

            {/* Hidden File Input for Toolbar */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {/* Media Error Message Banner */}
            {mediaErrorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                  lineHeight: 1.4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>{mediaErrorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaErrorMessage(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: '2px', display: 'flex' }}
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Attached Media Strip (only shown when media is attached) */}
            {draft.mediaUrls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Attached Media ({draft.mediaUrls.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsContentLibraryModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11.5px',
                      color: '#4f46e5',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Add media from Content Library or Device"
                  >
                    <Plus size={13} />
                    <span>Add more</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {draft.mediaUrls.map((url, index) => (
                    <div key={index} className="composer-media-card">
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
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={11} />
                        </button>

                        <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Media Actions */}
                      <div style={{ padding: '5px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          onClick={() => setEditingAltTextIndex(index)}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Alt Text
                        </button>

                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveMedia(index, index - 1)}
                            style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1, padding: '2px', display: 'flex' }}
                            title="Move left"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={index === draft.mediaUrls.length - 1}
                            onClick={() => handleMoveMedia(index, index + 1)}
                            style={{ background: 'none', border: 'none', cursor: index === draft.mediaUrls.length - 1 ? 'default' : 'pointer', opacity: index === draft.mediaUrls.length - 1 ? 0.3 : 1, padding: '2px', display: 'flex' }}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                      <Video size={14} color="#4f46e5" />
                      <span>Video Thumbnail</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowThumbnailSelector(true)}
                      className="c-btn c-btn-outline c-btn-sm"
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
          <div className="composer-preview-pane">
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
          initialScheduledAt={draft.scheduledAt}
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
          liveUrls={realPublishUrls}
          isRealPublish={Boolean(realPublishUrls.youtube)}
          onClose={() => {
            setShowPublishModal(false);
            setRealPublishUrls({});
            if (isInPageTab && onPostScheduled) {
              const pubPost = {
                id: `cal-post-${Date.now()}`,
                brandId: currentBrand.id,
                caption: draft.commonCaption || 'Published post',
                platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['linkedin'],
                status: 'published',
                approvalStatus: 'approved',
                scheduledAt: new Date().toISOString(),
                thumbnailUrl: draft.thumbnailUrl || (draft.mediaUrls && draft.mediaUrls[0]) || '',
                mediaType: draft.mediaType || 'image',
                author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
                campaign: 'Social Campaign',
                createdAt: new Date().toISOString()
              };
              try {
                const STORAGE_CALENDAR_POSTS = 'crinoid_calendar_posts_v1';
                const existing = localStorage.getItem(STORAGE_CALENDAR_POSTS);
                const posts: any[] = existing ? JSON.parse(existing) : [];
                localStorage.setItem(STORAGE_CALENDAR_POSTS, JSON.stringify([pubPost, ...posts]));
              } catch (e) {
                console.warn('Failed to save to calendar posts', e);
              }
              onPostScheduled(pubPost);
            }
          }}
        />
      )}

      {/* Content Library Media Selection Modal */}
      <ContentLibraryMediaModal
        isOpen={isContentLibraryModalOpen}
        onClose={() => setIsContentLibraryModalOpen(false)}
        onAttachMedia={handleAttachContentLibraryMedia}
        onUploadFromDevice={() => fileInputRef.current?.click()}
        selectedPlatforms={selectedPlatforms}
        currentAttachedUrls={draft.mediaUrls}
        brandId={currentBrand?.id || 'brand-crinoid'}
        brandName={currentBrand?.name || 'Crinoid Social'}
        showToast={showToast}
      />
    </div>
  );
};
