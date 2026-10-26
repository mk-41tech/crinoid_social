import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { CalendarViewMode, CalendarPost, CalendarFilterState } from './types';
import { CalendarFilters } from './CalendarFilters';
import { RescheduleModal } from './RescheduleModal';
import { CancelScheduledModal } from './CancelScheduledModal';
import { PublishErrorModal } from './PublishErrorModal';
import { PostDetailDrawer } from './PostDetailDrawer';
import { InstagramIcon, FacebookIcon } from '../common/SocialIcons';
import { ComposerView } from '../composer/ComposerView';
import '../../styles/calendar.css';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Edit3,
  Copy,
  Trash2,
  AlertCircle,
  Clock4,
  Share2,
  Check,
  X
} from 'lucide-react';

const STORAGE_CALENDAR_POSTS = 'crinoid_calendar_posts_v1';

const getInitialMockPosts = (brandId: string): CalendarPost[] => {
  const today = new Date();
  const formatISO = (d: Date, hour = 10, minute = 30) => {
    const copy = new Date(d);
    copy.setHours(hour, minute, 0, 0);
    return copy.toISOString();
  };

  const dayOffsets = [-3, -1, 0, 1, 2, 4, 7, 10, 14];

  return [
    {
      id: 'cal-post-1',
      brandId,
      caption: '🚀 Excited to announce our next-generation social suite! Effortless multi-platform publishing is finally here.',
      platforms: ['instagram', 'facebook'],
      status: 'published',
      approvalStatus: 'approved',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[0] * 86400000), 9, 0),
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
      campaign: 'Product Launch 2026',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-post-2',
      brandId,
      caption: '💡 5 Quick Tips for high-converting social media creatives in 2026. Bookmark this for your team!',
      platforms: ['instagram', 'facebook', 'linkedin'],
      status: 'scheduled',
      approvalStatus: 'approved',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[2] * 86400000), 14, 30),
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      author: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
      campaign: 'Tech Highlights',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-post-3',
      brandId,
      caption: 'Behind the scenes at our creative studio. Swipe through to see how our brand aesthetic comes to life. ✨',
      platforms: ['instagram'],
      status: 'scheduled',
      approvalStatus: 'in_review',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[3] * 86400000), 11, 0),
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      author: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
      campaign: 'Brand Awareness',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-post-4',
      brandId,
      caption: 'Special community milestone! We just hit 50,000 active creators worldwide. Thank you for building with us! 🎉',
      platforms: ['facebook', 'linkedin', 'youtube'],
      status: 'scheduled',
      approvalStatus: 'approved',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[4] * 86400000), 16, 45),
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
      campaign: 'Community Spotlight',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-post-5',
      brandId,
      caption: 'Failed scheduled dispatch test: Network timeout connecting to Instagram Graph API container endpoint.',
      platforms: ['instagram'],
      status: 'failed',
      approvalStatus: 'approved',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[1] * 86400000), 18, 15),
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
      mediaType: 'image',
      errorDetails: 'Graph API Error (Code 190): Invalid OAuth access token signature. Token must be re-authenticated.',
      author: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
      campaign: 'Tech Highlights',
      createdAt: new Date().toISOString()
    },
    {
      id: 'cal-post-6',
      brandId,
      caption: 'Drafting new weekend interactive poll: What is your #1 social channel priority for Q4?',
      platforms: ['linkedin'],
      status: 'draft',
      approvalStatus: 'draft',
      scheduledAt: formatISO(new Date(today.getTime() + dayOffsets[5] * 86400000), 10, 0),
      mediaType: 'text',
      author: { id: 'u-3', name: 'Karthik', role: 'Approver' },
      campaign: 'Brand Awareness',
      createdAt: new Date().toISOString()
    }
  ];
};

export const CalendarView: React.FC = () => {
  const { currentBrand, currentBrandAccounts, setCurrentView, draft, updateDraft, resetDraft, showToast } = useApp();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // In-Page Module Tab State
  const [activeTab, setActiveTab] = useState<'calendar' | 'composer'>('calendar');
  const [isComposerTabOpen, setIsComposerTabOpen] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);

  // Date cell "+" popover state — stores the date AND pixel coordinates for portal rendering
  const [popoverState, setPopoverState] = useState<{
    dateStr: string;
    left: number;
    top?: number;
    bottom?: number;
    openAbove: boolean;
  } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverCloseTimerRef = useRef<number | null>(null);

  const closePopover = useCallback(() => {
    if (popoverCloseTimerRef.current) {
      window.clearTimeout(popoverCloseTimerRef.current);
      popoverCloseTimerRef.current = null;
    }
    setPopoverState(null);
  }, []);

  const handleButtonMouseEnter = (e: React.MouseEvent, dateStr: string) => {
    if (popoverCloseTimerRef.current) {
      window.clearTimeout(popoverCloseTimerRef.current);
      popoverCloseTimerRef.current = null;
    }
    openPopover(e, dateStr);
  };

  const handleButtonMouseLeave = () => {
    popoverCloseTimerRef.current = window.setTimeout(() => {
      closePopover();
    }, 280);
  };

  const handlePopoverMouseEnter = () => {
    if (popoverCloseTimerRef.current) {
      window.clearTimeout(popoverCloseTimerRef.current);
      popoverCloseTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    popoverCloseTimerRef.current = window.setTimeout(() => {
      closePopover();
    }, 200);
  };

  // Open popover at the correct viewport position relative to the clicked (+) button
  const openPopover = useCallback((e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    e.preventDefault();

    // If same date is already open, toggle it closed
    if (popoverState?.dateStr === dateStr) {
      closePopover();
      return;
    }

    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const DROPDOWN_WIDTH = 148;
    const DROPDOWN_HEIGHT = 42; // single option button + padding + border
    const MARGIN = 6;

    // Decide whether to open above or below
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < (DROPDOWN_HEIGHT + MARGIN + 12) && spaceAbove > (DROPDOWN_HEIGHT + MARGIN + 12);

    // Horizontal positioning:
    // Prefer aligning right edge of dropdown with right edge of button
    let left = rect.right - DROPDOWN_WIDTH;
    if (left < 10) {
      // If aligns off-screen to the left, align with left edge of button
      left = rect.left;
    }
    // Clamp within viewport
    left = Math.max(10, Math.min(window.innerWidth - DROPDOWN_WIDTH - 10, left));

    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;

    if (openAbove) {
      bottom = window.innerHeight - rect.top + MARGIN;
    } else {
      top = rect.bottom + MARGIN;
    }

    setPopoverState({ dateStr, left, top, bottom, openAbove });
  }, [popoverState, closePopover]);

  // Close popover when clicking outside, pressing Escape, or scrolling
  useEffect(() => {
    if (!popoverState) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopover();
    };
    const handleScrollOrResize = () => closePopover();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [popoverState, closePopover]);

  // Post records state initialized from storage
  const [posts, setPosts] = useState<CalendarPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CALENDAR_POSTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached calendar posts', e);
    }
    return getInitialMockPosts(currentBrand.id);
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CALENDAR_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to save calendar posts', e);
    }
  }, [posts]);

  // Filters State
  const [filters, setFilters] = useState<CalendarFilterState>({
    searchQuery: '',
    brandId: 'all',
    socialAccountId: 'all',
    platform: 'all',
    status: 'all',
    campaign: 'all',
    authorId: 'all',
    approverId: 'all'
  });

  // Modals / Drawers state
  const [rescheduleTarget, setRescheduleTarget] = useState<CalendarPost | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CalendarPost | null>(null);
  const [errorTarget, setErrorTarget] = useState<CalendarPost | null>(null);
  const [detailTarget, setDetailTarget] = useState<CalendarPost | null>(null);

  // Drag and drop state
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Filter handlers
  const handleFilterChange = (updates: Partial<CalendarFilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      brandId: 'all',
      socialAccountId: 'all',
      platform: 'all',
      status: 'all',
      campaign: 'all',
      authorId: 'all',
      approverId: 'all'
    });
  };

  // Date Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else if (viewMode === 'day') {
      next.setDate(next.getDate() - 1);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else if (viewMode === 'day') {
      next.setDate(next.getDate() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Date Label
  const headerDateLabel = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startMonth} – ${endMonth}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode]);

  // Today's date string for past-date comparisons (YYYY-MM-DD, local day level)
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const isPastDate = (dateStr: string): boolean => {
    return dateStr < todayStr;
  };

  // Calendar Actions
  const refreshPosts = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CALENDAR_POSTS);
      if (saved) {
        setPosts(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse cached calendar posts', e);
    }
  }, []);

  const formatDateBadge = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {}
    return dateStr;
  };

  const hasUnsavedChanges = useCallback(() => {
    const hasCaption = Boolean(draft.commonCaption && draft.commonCaption.trim().length > 0);
    const hasMedia = Boolean(draft.mediaUrls && draft.mediaUrls.length > 0);
    const hasVariantCaption = Object.values(draft.platformVariants || {}).some(
      v => Boolean(v?.caption && v.caption.trim().length > 0)
    );
    return hasCaption || hasMedia || hasVariantCaption;
  }, [draft]);

  const handleRequestCloseComposer = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowUnsavedModal(true);
    } else {
      setIsComposerTabOpen(false);
      setActiveTab('calendar');
    }
  }, [hasUnsavedChanges]);

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    resetDraft();
    setIsComposerTabOpen(false);
    setActiveTab('calendar');
  };

  const handlePostScheduled = (newPost?: CalendarPost) => {
    refreshPosts();
    if (newPost) {
      setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
    }
    setIsComposerTabOpen(false);
    setActiveTab('calendar');
  };

  const handleCreatePost = (targetDate?: string) => {
    const chosenDate = targetDate || todayStr;
    const scheduledAt = `${chosenDate}T10:00:00`;

    // Prevent duplicate tabs: if already open, focus it
    if (isComposerTabOpen) {
      if (!hasUnsavedChanges()) {
        updateDraft({
          scheduledAt,
          commonCaption: ''
        });
        setSelectedCalendarDate(chosenDate);
      }
      setActiveTab('composer');
      return;
    }

    updateDraft({
      brandId: currentBrand.id,
      scheduledAt,
      commonCaption: '',
      mediaUrls: [],
      mediaType: 'image',
      platforms: currentBrandAccounts.length > 0 
        ? currentBrandAccounts.map(a => a.platform) 
        : draft.platforms
    });
    setSelectedCalendarDate(chosenDate);
    setIsComposerTabOpen(true);
    setActiveTab('composer');
  };

  const handleEditPost = (post: CalendarPost) => {
    updateDraft({
      brandId: post.brandId,
      commonCaption: post.caption,
      scheduledAt: post.scheduledAt,
      thumbnailUrl: post.thumbnailUrl || '',
      platforms: post.platforms
    });
    const dateStr = post.scheduledAt ? post.scheduledAt.split('T')[0] : null;
    setSelectedCalendarDate(dateStr);
    setIsComposerTabOpen(true);
    setActiveTab('composer');
  };

  const handleDuplicatePost = (post: CalendarPost) => {
    const newPost: CalendarPost = {
      ...post,
      id: `cal-dup-${Date.now()}`,
      caption: `[Copy] ${post.caption}`,
      status: 'draft',
      approvalStatus: 'draft',
      createdAt: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
    showToast('success', 'Duplicated post as a new draft');
  };

  const handleRescheduleConfirm = (postId: string, newDateTime: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          scheduledAt: newDateTime,
          status: p.status === 'draft' ? 'draft' : 'scheduled'
        };
      }
      return p;
    }));
    showToast('success', `Post rescheduled to ${new Date(newDateTime).toLocaleString()}`);
  };

  const handleCancelConfirm = (postId: string, revertToDraft: boolean) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: revertToDraft ? 'draft' : 'failed',
          approvalStatus: 'draft'
        };
      }
      return p;
    }));
    showToast('info', revertToDraft ? 'Scheduled post cancelled and moved to Drafts' : 'Post cancelled');
  };

  const handleRetryPublish = (post: CalendarPost) => {
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          status: 'published',
          errorDetails: undefined
        };
      }
      return p;
    }));
    showToast('success', 'Post published successfully to connected channels!');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (detailTarget?.id === postId) {
      setDetailTarget(null);
    }
    showToast('info', 'Post deleted');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, post: CalendarPost) => {
    e.dataTransfer.setData('text/plain', post.id);
    setDraggedPostId(post.id);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    // Block drag-over on past dates
    if (isPastDate(dateStr)) {
      // Don't call e.preventDefault() so the drop is blocked
      setDragOverDate(null);
      return;
    }
    e.preventDefault();
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
    setDragOverDate(null);
    setDraggedPostId(null);

    // Block drops on past dates
    if (isPastDate(targetDateStr)) {
      showToast('warning', 'Cannot schedule posts in the past. Please select today or a future date.');
      return;
    }

    if (!postId) return;

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    // Keep existing hour/min if available
    let timePart = '10:00:00';
    if (targetPost.scheduledAt && targetPost.scheduledAt.includes('T')) {
      timePart = targetPost.scheduledAt.split('T')[1];
    }
    const newDateTime = `${targetDateStr}T${timePart}`;

    handleRescheduleConfirm(postId, newDateTime);
  };

  // Parse ISO or Date string into 'YYYY-MM-DD'
  const getDateKey = (dateStr: string): string => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Set of all dates (YYYY-MM-DD) containing at least one post in the actual calendar data.
  // Determines (+) icon visibility: applies to all statuses (published, scheduled, failed, draft, pending, etc.)
  // and stays updated whenever posts are added, removed, or rescheduled.
  const datesWithPosts = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(post => {
      if (filters.brandId !== 'all' && post.brandId && post.brandId !== filters.brandId) {
        return;
      }
      const key = getDateKey(post.scheduledAt);
      if (key) {
        set.add(key);
      }
    });
    return set;
  }, [posts, filters.brandId]);

  const dateHasPosts = (dateStr: string): boolean => {
    return datesWithPosts.has(dateStr);
  };

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchCaption = post.caption.toLowerCase().includes(q);
        const matchAuthor = post.author?.name.toLowerCase().includes(q);
        if (!matchCaption && !matchAuthor) return false;
      }
      // Brand
      if (filters.brandId !== 'all' && post.brandId !== filters.brandId) {
        return false;
      }
      // Platform
      if (filters.platform !== 'all' && !post.platforms.includes(filters.platform)) {
        return false;
      }
      // Status
      if (filters.status !== 'all' && post.status !== filters.status) {
        return false;
      }
      // Campaign
      if (filters.campaign !== 'all' && post.campaign !== filters.campaign) {
        return false;
      }
      // Author
      if (filters.authorId !== 'all' && post.author?.id !== filters.authorId) {
        return false;
      }
      return true;
    });
  }, [posts, filters]);

  // Group posts by YYYY-MM-DD
  const postsByDate = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    filteredPosts.forEach(post => {
      const key = getDateKey(post.scheduledAt);
      if (!key) return;
      const list = map.get(key) || [];
      list.push(post);
      map.set(key, list);
    });
    return map;
  }, [filteredPosts]);

  // Platform icon helper
  const renderPlatformIcons = (platforms: string[]) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {platforms.map(p => {
        if (p === 'instagram') return <InstagramIcon key={p} size={12} color="#E4405F" />;
        if (p === 'facebook') return <FacebookIcon key={p} size={12} color="#1877F2" />;
        return (
          <span key={p} style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {p[0]}
          </span>
        );
      })}
    </div>
  );

  // Status Badge
  const renderStatusBadge = (status: string) => {
    let bg = '#f1f5f9';
    let color = '#475569';
    if (status === 'scheduled') {
      bg = 'var(--color-primary-light)';
      color = 'var(--color-primary)';
    } else if (status === 'published') {
      bg = '#d1fae5';
      color = '#047857';
    } else if (status === 'failed') {
      bg = '#fee2e2';
      color = '#dc2626';
    } else if (status === 'pending') {
      bg = '#fef3c7';
      color = '#b45309';
    }
    return (
      <span style={{
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    );
  };

  // Render Post Card (Compact, Responsive, Full Info)
  const renderPostCard = (post: CalendarPost, compact = false) => {
    const timeFormatted = new Date(post.scheduledAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div
        key={post.id}
        draggable
        onDragStart={(e) => handleDragStart(e, post)}
        className="cal-post-card"
        onClick={() => setDetailTarget(post)}
        style={{
          position: 'relative',
          padding: compact ? '6px 8px' : '10px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          backgroundColor: '#ffffff',
          marginBottom: '6px',
          cursor: 'grab',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Top Card Row: Platforms, Time, Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {renderPlatformIcons(post.platforms)}
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {timeFormatted}
            </span>
          </div>
          {renderStatusBadge(post.status)}
        </div>

        {/* Thumbnail & Caption preview */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt="thumb"
              style={{
                width: compact ? '28px' : '36px',
                height: compact ? '28px' : '36px',
                borderRadius: '4px',
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          )}
          <p style={{
            margin: 0,
            fontSize: '11.5px',
            color: 'var(--text-primary)',
            lineHeight: '1.35',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {post.caption}
          </p>
        </div>

        {/* Footer info: Approval + Author */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '10.5px', color: 'var(--text-light)' }}>
          <span>{post.author?.name || 'Creator'}</span>
          {post.approvalStatus === 'approved' && (
            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <Check size={11} /> Approved
            </span>
          )}
          {post.approvalStatus === 'in_review' && (
            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <Clock4 size={11} /> Review
            </span>
          )}
        </div>

        {/* Quick Action Overlay Buttons on Card Hover */}
        <div
          className="cal-card-actions"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: '6px',
            bottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ffffff',
            padding: '2px 4px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <button
            title="Edit in Composer"
            onClick={() => handleEditPost(post)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-secondary)' }}
          >
            <Edit3 size={12} />
          </button>
          <button
            title="Reschedule"
            onClick={() => setRescheduleTarget(post)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-secondary)' }}
          >
            <Clock size={12} />
          </button>
          <button
            title="Duplicate"
            onClick={() => handleDuplicatePost(post)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-secondary)' }}
          >
            <Copy size={12} />
          </button>
          {post.status === 'failed' && (
            <button
              title="View Error Details"
              onClick={() => setErrorTarget(post)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: '#dc2626' }}
            >
              <AlertCircle size={12} />
            </button>
          )}
          {post.status === 'scheduled' && (
            <button
              title="Cancel Scheduled Post"
              onClick={() => setCancelTarget(post)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: '#dc2626' }}
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            title="Delete Post"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePost(post.id);
            }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', color: '#dc2626' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  // Portal-based popover — rendered at document.body to escape overflow:hidden parents
  const renderPortalPopover = () => {
    if (!popoverState) return null;
    const { dateStr, left, top, bottom } = popoverState;

    return createPortal(
      <div
        ref={popoverRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
        style={{
          position: 'fixed',
          top: top !== undefined ? `${top}px` : 'auto',
          bottom: bottom !== undefined ? `${bottom}px` : 'auto',
          left: `${left}px`,
          zIndex: 999999,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          padding: '4px',
          width: '150px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
          animation: 'fadeInPop 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Single option: Create a Post */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            closePopover();
            handleCreatePost(dateStr);
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            boxSizing: 'border-box',
            transition: 'background-color 0.12s, color 0.12s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#1e293b';
          }}
        >
          <Plus size={15} color="var(--color-primary)" strokeWidth={2.4} />
          <span style={{ fontWeight: 600 }}>Create a Post</span>
        </button>
      </div>,
      document.body
    );
  };

  // Month Grid Calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayStr = getDateKey(new Date().toISOString());

    // Padding from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const str = getDateKey(prevDate.toISOString());
      days.push({
        dateStr: str,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: str === todayStr
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      const str = getDateKey(currDate.toISOString());
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: str === todayStr
      });
    }

    // Trailing days from next month to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const str = getDateKey(nextDate.toISOString());
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: str === todayStr
      });
    }

    return days;
  }, [currentDate]);

  // Week View Days Calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days: { dateStr: string; dayNumber: number; weekday: string; isToday: boolean }[] = [];
    const todayStr = getDateKey(new Date().toISOString());

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dateStr = getDateKey(d.toISOString());
      days.push({
        dateStr,
        dayNumber: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateStr === todayStr
      });
    }
    return days;
  }, [currentDate]);

  // Day View Posts
  const dayDateStr = getDateKey(currentDate.toISOString());
  const dayPosts = postsByDate.get(dayDateStr) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', minHeight: 0 }}>
      {/* In-Page Module Tab Bar */}
      <div className="cal-module-tab-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Calendar Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`cal-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          >
            <CalendarIcon size={14} color={activeTab === 'calendar' ? 'var(--color-primary)' : 'var(--text-muted)'} />
            <span>Calendar</span>
          </button>

          {/* Create a Post Tab */}
          {isComposerTabOpen && (
            <div
              onClick={() => setActiveTab('composer')}
              className={`cal-tab-btn ${activeTab === 'composer' ? 'active' : ''}`}
            >
              <Edit3 size={13} color={activeTab === 'composer' ? 'var(--color-primary)' : 'var(--text-muted)'} />
              <span>Create a Post</span>
              {selectedCalendarDate && (
                <span className="cal-tab-date-badge">
                  {formatDateBadge(selectedCalendarDate)}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestCloseComposer();
                }}
                title="Close tab"
                className="cal-tab-close-btn"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Brand context indicator on the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)'
            }}
          >
            {currentBrand.name}
          </span>
        </div>
      </div>

      {/* Tab Body 1: Main Calendar Area */}
      <div
        style={{
          display: activeTab === 'calendar' ? 'flex' : 'none',
          flexDirection: 'column',
          flex: 1,
          padding: '24px',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          minHeight: 0
        }}
      >
      {/* 1. Header Area */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Calendar
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Plan, organize, and manage your scheduled social media posts.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Today Button */}
          <button
            type="button"
            onClick={handleToday}
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Today
          </button>

          {/* Prev / Next controls */}
          <div style={{ display: 'flex', alignItems: 'center', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{ padding: '7px 10px', border: 'none', backgroundColor: '#ffffff', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', minWidth: '130px', textAlign: 'center' }}>
              {headerDateLabel}
            </span>
            <button
              type="button"
              onClick={handleNext}
              style={{ padding: '7px 10px', border: 'none', backgroundColor: '#ffffff', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Mode Toggle: Month, Week, Day, List */}
          <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)', padding: '2px' }}>
            {(['month', 'week', 'day', 'list'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12.5px',
                  fontWeight: viewMode === mode ? 600 : 500,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: viewMode === mode ? '#ffffff' : 'transparent',
                  color: viewMode === mode ? 'var(--color-primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === mode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Create Post Button */}
          <button
            type="button"
            onClick={() => handleCreatePost()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* 2. No Connected Accounts Banner */}
      {currentBrandAccounts.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          fontSize: '13px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={16} />
            <span>No social accounts connected for <strong>{currentBrand.name}</strong>. Connect Instagram, Facebook, LinkedIn, or YouTube to enable automated publishing.</span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('channels')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: '1px solid #93c5fd',
              backgroundColor: '#ffffff',
              color: '#1d4ed8',
              cursor: 'pointer'
            }}
          >
            Connect Account
          </button>
        </div>
      )}

      {/* 3. Filters Bar */}
      <CalendarFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* 4. Empty State if filtering matches 0 posts */}
      {filteredPosts.length === 0 && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '12px',
          border: '1px dashed var(--border-subtle)',
          margin: '20px 0'
        }}>
          <CalendarIcon size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--text-primary)' }}>No posts found</h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            No scheduled or draft posts match your current filter selection.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={handleClearFilters}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
            <button
              onClick={() => handleCreatePost()}
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Create Post
            </button>
          </div>
        </div>
      )}

      {/* 5. Calendar Views Grid */}
      {filteredPosts.length > 0 && viewMode === 'month' && (
        <div className="cal-month-container" style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Weekday Names Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: '10px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '620px' }}>
            {monthDays.map((cell, idx) => {
              const dayPosts = postsByDate.get(cell.dateStr) || [];
              const isDragTarget = dragOverDate === cell.dateStr;
              const isPast = isPastDate(cell.dateStr);

              return (
                <div
                  key={cell.dateStr + '-' + idx}
                  onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                  onDrop={(e) => handleDrop(e, cell.dateStr)}
                  className={`calendar-day-cell ${isDragTarget ? 'drag-over' : ''} ${isPast ? 'cal-past-day' : ''}`}
                  style={{
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '8px',
                    backgroundColor: isDragTarget
                      ? 'var(--color-primary-light)'
                      : isPast
                      ? '#f8fafc'
                      : cell.isCurrentMonth ? '#ffffff' : '#fafafa',
                    minHeight: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: isPast ? 0.62 : 1,
                    cursor: isPast ? 'default' : undefined
                  }}
                >
                  {/* Day number header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: cell.isToday ? 700 : 500,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cell.isToday ? 'var(--color-primary)' : 'transparent',
                      color: cell.isToday
                        ? '#ffffff'
                        : isPast
                        ? '#94a3b8'
                        : cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-light)'
                    }}>
                      {cell.dayNumber}
                    </span>

                    {/* Quick + button on future/today dates */}
                    {!isPast && (
                      <button
                        className={`cal-day-quick-add ${popoverState?.dateStr === cell.dateStr ? 'active' : ''}`}
                        onClick={(e) => openPopover(e, cell.dateStr)}
                        onMouseEnter={(e) => handleButtonMouseEnter(e, cell.dateStr)}
                        onMouseLeave={handleButtonMouseLeave}
                        title={`Schedule post on ${cell.dateStr}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: popoverState?.dateStr === cell.dateStr ? 'var(--color-primary)' : 'var(--text-light)',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {/* Day Posts List */}
                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: '140px' }}>
                    {dayPosts.map(post => renderPostCard(post, true))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {filteredPosts.length > 0 && viewMode === 'week' && (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', minHeight: '540px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            {weekDays.map(day => (
              <div key={day.dateStr} style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>{day.weekday}</div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  marginTop: '4px',
                  fontSize: '13px',
                  fontWeight: day.isToday ? 700 : 500,
                  backgroundColor: day.isToday ? 'var(--color-primary)' : 'transparent',
                  color: day.isToday ? '#ffffff' : 'var(--text-primary)'
                }}>
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '480px' }}>
            {weekDays.map(day => {
              const dayPosts = postsByDate.get(day.dateStr) || [];
              const isDragTarget = dragOverDate === day.dateStr;
              const isPast = isPastDate(day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  onDragOver={(e) => handleDragOver(e, day.dateStr)}
                  onDrop={(e) => handleDrop(e, day.dateStr)}
                  style={{
                    padding: '10px 8px',
                    borderRight: '1px solid var(--border-subtle)',
                    backgroundColor: isDragTarget
                      ? 'var(--color-primary-light)'
                      : isPast ? '#f8fafc' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isPast ? 0.65 : 1
                  }}
                >
                  {!isPast && (
                    <button
                      type="button"
                      onClick={(e) => openPopover(e, day.dateStr)}
                      onMouseEnter={(e) => handleButtonMouseEnter(e, day.dateStr)}
                      onMouseLeave={handleButtonMouseLeave}
                      style={{
                        width: '100%',
                        padding: '5px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px dashed var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        marginBottom: '8px'
                      }}
                    >
                      <Plus size={12} /> Add Post
                    </button>
                  )}
                  {isPast && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', padding: '4px 0 6px', fontStyle: 'italic' }}>
                      Past date
                    </div>
                  )}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {dayPosts.map(post => renderPostCard(post, false))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {filteredPosts.length > 0 && viewMode === 'day' && (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', minHeight: '400px', backgroundColor: isPastDate(dayDateStr) ? '#f8fafc' : '#ffffff', opacity: isPastDate(dayDateStr) ? 0.75 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: isPastDate(dayDateStr) ? '#94a3b8' : 'var(--text-primary)' }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {isPastDate(dayDateStr)
                  ? 'Past date — scheduling disabled'
                  : `${dayPosts.length} posts scheduled for this day`}
              </p>
            </div>
            {!isPastDate(dayDateStr) && (
              <button
                type="button"
                onClick={(e) => openPopover(e, dayDateStr)}
                onMouseEnter={(e) => handleButtonMouseEnter(e, dayDateStr)}
                onMouseLeave={handleButtonMouseLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Post
              </button>
            )}
          </div>

          {dayPosts.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {isPastDate(dayDateStr)
                ? 'No posts were scheduled for this past date.'
                : 'No scheduled posts for this date. Click "+ Add Post" to schedule one.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {dayPosts.map(post => renderPostCard(post, false))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {filteredPosts.length > 0 && viewMode === 'list' && (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 80px 1fr 140px 110px 100px 120px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            <div>Scheduled</div>
            <div>Platform</div>
            <div>Post Content</div>
            <div>Campaign</div>
            <div>Status</div>
            <div>Approval</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          <div>
            {filteredPosts.map(post => {
              const d = new Date(post.scheduledAt);
              return (
                <div
                  key={post.id}
                  onClick={() => setDetailTarget(post)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 80px 1fr 140px 110px 100px 120px',
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    transition: 'background-color 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>{renderPlatformIcons(post.platforms)}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
                    {post.thumbnailUrl && (
                      <img src={post.thumbnailUrl} alt="thumb" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.caption}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {post.campaign || 'General'}
                  </div>

                  <div>{renderStatusBadge(post.status)}</div>

                  <div>
                    {post.approvalStatus === 'approved' && (
                      <span style={{ color: '#059669', fontSize: '11px', fontWeight: 600 }}>Approved</span>
                    )}
                    {post.approvalStatus === 'in_review' && (
                      <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 600 }}>In Review</span>
                    )}
                    {(!post.approvalStatus || post.approvalStatus === 'draft') && (
                      <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>—</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Edit in Composer"
                      onClick={() => handleEditPost(post)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      title="Reschedule"
                      onClick={() => setRescheduleTarget(post)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <Clock size={14} />
                    </button>
                    <button
                      title="Duplicate"
                      onClick={() => handleDuplicatePost(post)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      title="Delete Post"
                      onClick={() => handleDeletePost(post.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#dc2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      </div>

      {/* Tab Body 2: In-Page Composer Tab */}
      {isComposerTabOpen && (
        <div
          style={{
            display: activeTab === 'composer' ? 'flex' : 'none',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflowY: 'hidden'
          }}
        >
          <ComposerView
            isInPageTab={true}
            onClose={handleRequestCloseComposer}
            onPostScheduled={handlePostScheduled}
          />
        </div>
      )}

      {/* Date Cell (+) Dropdown Popover */}
      {renderPortalPopover()}

      {/* 6. Modals & Drawers */}
      <RescheduleModal
        post={rescheduleTarget}
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={handleRescheduleConfirm}
      />

      <CancelScheduledModal
        post={cancelTarget}
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirmCancel={handleCancelConfirm}
      />

      <PublishErrorModal
        post={errorTarget}
        isOpen={!!errorTarget}
        onClose={() => setErrorTarget(null)}
        onRetry={handleRetryPublish}
        onEdit={handleEditPost}
      />

      <PostDetailDrawer
        post={detailTarget}
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={handleEditPost}
        onDuplicate={handleDuplicatePost}
        onReschedule={(post) => setRescheduleTarget(post)}
        onCancel={(post) => setCancelTarget(post)}
        onDelete={handleDeletePost}
      />

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Discard Unsaved Changes?
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  You have unsaved edits in your post. Closing this tab will discard them.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
