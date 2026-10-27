import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PostRecord, PostTabType, PostRecordStatus } from './types';
import { PostViewModal } from './PostViewModal';
import { PublishingLogsModal } from './PublishingLogsModal';
import { SubmitApprovalModal } from './SubmitApprovalModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { RescheduleModal } from '../calendar/RescheduleModal';
import { InstagramIcon, FacebookIcon } from '../common/SocialIcons';
import '../../styles/posts.css';
import {
  Search,
  Plus,
  Filter,
  Grid,
  List,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Clock,
  RefreshCw,
  Send,
  Terminal,
  ExternalLink,
  ChevronDown,
  Building2,
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Share2
} from 'lucide-react';

const STORAGE_POSTS_DATABASE = 'crinoid_posts_database_v1';

const getInitialMockPostRecords = (brandId: string): PostRecord[] => {
  const now = new Date();
  const formatISO = (offsetDays: number, hour = 11, minute = 0) => {
    const d = new Date(now.getTime() + offsetDays * 86400000);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'CRN-1001',
      brandId,
      caption: '🚀 Excited to introduce our next-generation social suite! Effortless multi-platform publishing is finally here for modern teams. Check out the link in bio for early access! #crinoid #innovation #social',
      mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook'],
      author: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      createdDate: formatISO(-5, 9, 30),
      publishedDate: formatISO(-4, 10, 0),
      status: 'published',
      publishedUrl: 'https://www.instagram.com/p/CRINOID_DEMO_POST1/',
      performanceData: {
        likes: 1420,
        comments: 86,
        shares: 43,
        reach: 12500,
        impressions: 16800,
        engagementRate: '4.8%'
      },
      campaign: 'Product Launch 2026',
      approvalHistory: [
        {
          id: 'appr-1',
          approverName: 'Karthik',
          approverRole: 'Approver',
          status: 'approved',
          note: 'Approved for launch distribution.',
          timestamp: formatISO(-4, 9, 15)
        }
      ],
      publishingLogs: [
        {
          id: 'log-1',
          timestamp: formatISO(-4, 10, 0),
          platform: 'instagram',
          status: 'success',
          statusCode: 200,
          message: 'Instagram Media Container ID 1792837492 published to feed.',
          endpoint: 'POST /v18.0/{ig-user-id}/media_publish'
        },
        {
          id: 'log-2',
          timestamp: formatISO(-4, 10, 0),
          platform: 'facebook',
          status: 'success',
          statusCode: 200,
          message: 'Facebook Page Post published with media attachment.',
          endpoint: 'POST /v18.0/{page-id}/photos'
        }
      ]
    },
    {
      id: 'CRN-1002',
      brandId,
      caption: '💡 5 Quick Tips for high-converting social media creatives in 2026. Swipe through to learn how top creators scale their engagement rate organically! #socialtips #creatives #marketing',
      mediaUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook', 'linkedin'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
      },
      createdDate: formatISO(-2, 11, 0),
      scheduledDate: formatISO(1, 14, 30),
      status: 'scheduled',
      campaign: 'Tech Highlights',
      approvalHistory: [
        {
          id: 'appr-2',
          approverName: 'Karthik',
          approverRole: 'Approver',
          status: 'approved',
          note: 'Creative assets verified.',
          timestamp: formatISO(-1, 16, 0)
        }
      ],
      publishingLogs: [
        {
          id: 'log-3',
          timestamp: formatISO(-1, 16, 0),
          platform: 'instagram',
          status: 'success',
          statusCode: 200,
          message: 'Post queued in dispatch worker for scheduled execution.',
          endpoint: 'CRINOID_DISPATCH_QUEUE'
        }
      ]
    },
    {
      id: 'CRN-1003',
      brandId,
      caption: 'Behind the scenes at our creative studio. Exploring new UI design interactions for our upcoming creator portal! Which color palette do you prefer?',
      mediaUrls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator'
      },
      createdDate: formatISO(-1, 14, 0),
      scheduledDate: formatISO(2, 11, 0),
      status: 'awaiting_approval',
      campaign: 'Brand Awareness',
      approvalHistory: [
        {
          id: 'appr-3',
          approverName: 'Muthukumar',
          approverRole: 'Social Lead',
          status: 'submitted',
          note: 'Submitted for copy review.',
          timestamp: formatISO(-1, 14, 10)
        }
      ],
      publishingLogs: []
    },
    {
      id: 'CRN-1004',
      brandId,
      caption: 'Drafting new interactive poll: What is your #1 social channel priority for Q4? Let us know in the comments!',
      mediaUrls: [],
      mediaType: 'text',
      platforms: ['linkedin'],
      author: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver'
      },
      createdDate: formatISO(-1, 16, 45),
      status: 'draft',
      campaign: 'Brand Awareness',
      approvalHistory: [],
      publishingLogs: []
    },
    {
      id: 'CRN-1005',
      brandId,
      caption: 'Failed scheduled dispatch test: Network timeout connecting to Instagram Graph API container endpoint during token verification.',
      mediaUrls: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram'],
      author: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead'
      },
      createdDate: formatISO(-3, 10, 0),
      scheduledDate: formatISO(-1, 18, 15),
      status: 'failed',
      campaign: 'Tech Highlights',
      approvalHistory: [
        {
          id: 'appr-4',
          approverName: 'Karthik',
          status: 'approved',
          timestamp: formatISO(-2, 12, 0)
        }
      ],
      publishingLogs: [
        {
          id: 'log-err-1',
          timestamp: formatISO(-1, 18, 15),
          platform: 'instagram',
          status: 'failed',
          statusCode: 400,
          message: 'OAuth token expired (Code 190, subcode 463). Session invalidated. Re-auth required.',
          endpoint: 'POST /v18.0/{ig-user-id}/media_publish'
        }
      ]
    },
    {
      id: 'CRN-1006',
      brandId,
      caption: 'Celebrating our 2025 community highlights archive. Over 20,000 teams connected across 4 continents!',
      mediaUrls: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      platforms: ['facebook', 'linkedin', 'youtube'],
      author: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead'
      },
      createdDate: formatISO(-20, 9, 0),
      publishedDate: formatISO(-19, 10, 0),
      status: 'archived',
      publishedUrl: 'https://facebook.com/posts/CRINOID_ARCHIVE_1006',
      performanceData: {
        likes: 3100,
        comments: 184,
        shares: 92,
        reach: 28000,
        impressions: 34500,
        engagementRate: '5.2%'
      },
      campaign: 'Community Spotlight',
      approvalHistory: [],
      publishingLogs: []
    }
  ];
};

export const PostsView: React.FC = () => {
  const { currentBrand, currentBrandAccounts, setCurrentView, updateDraft, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<PostTabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'scheduled' | 'performance'>('newest');
  const [viewStyle, setViewStyle] = useState<'grid' | 'table'>('grid');

  // Posts State with localStorage persistence
  const [posts, setPosts] = useState<PostRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_POSTS_DATABASE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached posts database', e);
    }
    return getInitialMockPostRecords(currentBrand.id);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POSTS_DATABASE, JSON.stringify(posts));
    } catch (e) {
      console.warn('Failed to persist posts database', e);
    }
  }, [posts]);

  // Modal Targets
  const [viewModalPost, setViewModalPost] = useState<PostRecord | null>(null);
  const [sidePanelMode, setSidePanelMode] = useState<'view' | 'edit'>('view');
  const [logsModalPost, setLogsModalPost] = useState<PostRecord | null>(null);
  const [approvalModalPost, setApprovalModalPost] = useState<PostRecord | null>(null);
  const [deleteModalPost, setDeleteModalPost] = useState<PostRecord | null>(null);
  const [rescheduleModalPost, setRescheduleModalPost] = useState<PostRecord | null>(null);

  // Tab Count Calculations
  const tabCounts = useMemo(() => {
    const counts: Record<PostTabType, number> = {
      all: posts.length,
      draft: 0,
      scheduled: 0,
      published: 0,
      awaiting_approval: 0,
      failed: 0,
      archived: 0
    };
    posts.forEach(p => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [posts]);

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tab filter
      if (activeTab !== 'all' && post.status !== activeTab) {
        return false;
      }
      // Platform filter
      if (platformFilter !== 'all' && !post.platforms.includes(platformFilter as any)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCaption = post.caption.toLowerCase().includes(q);
        const matchId = post.id.toLowerCase().includes(q);
        const matchAuthor = post.author.name.toLowerCase().includes(q);
        const matchCampaign = post.campaign?.toLowerCase().includes(q);
        if (!matchCaption && !matchId && !matchAuthor && !matchCampaign) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }
      if (sortBy === 'scheduled') {
        const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return bTime - aTime;
      }
      if (sortBy === 'performance') {
        const aLikes = a.performanceData?.likes || 0;
        const bLikes = b.performanceData?.likes || 0;
        return bLikes - aLikes;
      }
      return 0;
    });
  }, [posts, activeTab, platformFilter, searchQuery, sortBy]);

  // Actions
  const handleCreatePost = () => {
    updateDraft({
      brandId: currentBrand.id,
      commonCaption: '',
      mediaUrls: []
    });
    setCurrentView('composer');
  };

  const handleView = (post: PostRecord) => {
    setViewModalPost(post);
    setSidePanelMode('view');
  };

  const handleEdit = (post: PostRecord) => {
    setViewModalPost(post);
    setSidePanelMode('edit');
  };

  const handleSavePost = async (updatedPost: PostRecord) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setViewModalPost(updatedPost);
    showToast('success', `Post ${updatedPost.id} updated successfully.`);
  };

  const handleDuplicate = (post: PostRecord) => {
    const dup: PostRecord = {
      ...post,
      id: `CRN-${Math.floor(1000 + Math.random() * 9000)}`,
      caption: `[Copy] ${post.caption}`,
      status: 'draft',
      createdDate: new Date().toISOString(),
      scheduledDate: undefined,
      publishedDate: undefined,
      publishedUrl: undefined,
      performanceData: undefined,
      approvalHistory: [],
      publishingLogs: []
    };
    setPosts(prev => [dup, ...prev]);
    showToast('success', `Duplicated as draft ${dup.id}`);
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('info', `Post ${postId} permanently deleted.`);
  };

  const handleArchive = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, status: 'archived' };
      }
      return p;
    }));
    showToast('info', `Post ${postId} moved to Archived.`);
  };

  const handleReschedule = (postId: string, newDateTime: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          scheduledDate: newDateTime,
          status: 'scheduled'
        };
      }
      return p;
    }));
    showToast('success', `Post rescheduled to ${new Date(newDateTime).toLocaleString()}`);
  };

  const handleRetry = (post: PostRecord) => {
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          status: 'published',
          publishedDate: new Date().toISOString(),
          publishingLogs: [
            ...p.publishingLogs,
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              platform: p.platforms[0] || 'instagram',
              status: 'success',
              statusCode: 200,
              message: 'Retry publish succeeded via Crinoid Graph Gateway.'
            }
          ]
        };
      }
      return p;
    }));
    showToast('success', `Post ${post.id} published successfully!`);
  };

  const handleSubmitApproval = (postId: string, reviewerId: string, reviewerName: string, note: string) => {
    const target = posts.find(p => p.id === postId);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: 'awaiting_approval',
          approvalHistory: [
            ...p.approvalHistory,
            {
              id: `appr-${Date.now()}`,
              approverName: reviewerName,
              status: 'submitted',
              note,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    }));

    if (target) {
      try {
        const STORAGE_APPROVAL_POSTS = 'crinoid_approval_posts_v1';
        const existing = localStorage.getItem(STORAGE_APPROVAL_POSTS);
        const appItems: any[] = existing ? JSON.parse(existing) : [];
        const nowIso = new Date().toISOString();
        const newAppItem = {
          id: target.id,
          brandId: target.brandId,
          caption: target.caption,
          platforms: target.platforms,
          mediaUrls: target.mediaUrls || [],
          mediaType: target.mediaType || 'image',
          thumbnailUrl: target.thumbnailUrl || (target.mediaUrls && target.mediaUrls[0]) || '',
          author: target.author,
          assignedApprover: {
            id: reviewerId,
            name: reviewerName,
            role: reviewerName.includes('Karthik') ? 'Approver' : 'Social Lead'
          },
          status: 'in_review',
          submittedAt: nowIso,
          version: 1,
          requiresClientApproval: false,
          steps: [
            {
              stepNumber: 1,
              title: 'Review & Sign-Off',
              assignedRole: reviewerName.includes('Karthik') ? 'Approver' : 'Social Lead',
              assignedApproverName: reviewerName,
              status: 'pending'
            }
          ],
          history: [
            {
              id: `hist-${Date.now()}`,
              type: 'submission',
              action: 'Submitted for Approval',
              user: target.author,
              timestamp: nowIso,
              note
            }
          ],
          comments: note ? [
            {
              id: `comm-${Date.now()}`,
              authorId: target.author.id,
              authorName: target.author.name,
              authorRole: target.author.role,
              content: note,
              timestamp: nowIso,
              type: 'comment'
            }
          ] : []
        };
        localStorage.setItem(STORAGE_APPROVAL_POSTS, JSON.stringify([newAppItem, ...appItems.filter(i => i.id !== target.id)]));
      } catch (e) {
        console.warn('Failed to sync to approval items', e);
      }
    }

    showToast('success', `Post submitted for approval to ${reviewerName}`);
  };

  const renderPlatformIcons = (platforms: string[]) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {platforms.map(p => {
        if (p === 'instagram') return <InstagramIcon key={p} size={13} color="#E4405F" />;
        if (p === 'facebook') return <FacebookIcon key={p} size={13} color="#1877F2" />;
        return (
          <span key={p} style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {p[0]}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="posts-container">
      {/* 1. Header Area */}
      <div className="posts-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Posts
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            This is the searchable database of all content across your social channels.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Phase 2 Bulk Actions Badge */}
          <button
            type="button"
            disabled
            title="Bulk edit, CSV import, and bulk scheduling will be introduced in Phase 2 according to scope."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px dashed var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-light)',
              cursor: 'not-allowed'
            }}
          >
            <FileSpreadsheet size={14} />
            <span>Bulk / CSV Import</span>
            <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#64748b' }}>
              Phase 2
            </span>
          </button>
        </div>
      </div>

      {/* 2. Recommended Tabs */}
      <div className="posts-tabs-nav">
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'draft', label: 'Drafts' },
          { key: 'scheduled', label: 'Scheduled' },
          { key: 'published', label: 'Published' },
          { key: 'awaiting_approval', label: 'Awaiting Approval' },
          { key: 'failed', label: 'Failed' },
          { key: 'archived', label: 'Archived' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`posts-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as PostTabType)}
          >
            <span>{tab.label}</span>
            <span className="posts-tab-count">
              {tabCounts[tab.key as PostTabType]}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="posts-controls-bar">
        {/* Search */}
        <div className="posts-search-box">
          <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            className="posts-search-input"
            placeholder="Search by caption, post ID, author, or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '7px 10px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Sort: Newest Created</option>
            <option value="oldest">Sort: Oldest Created</option>
            <option value="scheduled">Sort: Scheduled Date</option>
            <option value="performance">Sort: Highest Engagement</option>
          </select>

          {/* View Toggle (Grid / Table) */}
          <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewStyle('grid')}
              style={{
                padding: '6px 10px',
                border: 'none',
                backgroundColor: viewStyle === 'grid' ? 'var(--bg-muted)' : '#ffffff',
                color: viewStyle === 'grid' ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('table')}
              style={{
                padding: '6px 10px',
                border: 'none',
                backgroundColor: viewStyle === 'table' ? 'var(--bg-muted)' : '#ffffff',
                color: viewStyle === 'table' ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Empty State */}
      {filteredPosts.length === 0 && (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '12px',
          border: '1px dashed var(--border-subtle)',
          margin: '20px 0'
        }}>
          <Calendar size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--text-primary)' }}>
            No posts found in this tab
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            {searchQuery ? `No posts matched "${searchQuery}"` : `There are currently no posts with status "${activeTab.replace('_', ' ')}"`}
          </p>
        </div>
      )}

      {/* 5. Grid View */}
      {filteredPosts.length > 0 && viewStyle === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="post-grid-card">
              {/* Top thumbnail or placeholder */}
              {post.thumbnailUrl ? (
                <img src={post.thumbnailUrl} alt="post media" className="post-grid-thumb" />
              ) : (
                <div style={{
                  height: '80px',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-light)'
                }}>
                  <Share2 size={24} />
                </div>
              )}

              <div className="post-grid-content">
                {/* Meta Bar: ID, Platforms, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--bg-muted)', padding: '1px 5px', borderRadius: '4px' }}>
                      {post.id}
                    </span>
                    {renderPlatformIcons(post.platforms)}
                  </div>
                  <span className={`status-badge ${post.status}`}>
                    ● {post.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Caption */}
                <p style={{
                  margin: '0 0 12px',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {post.caption}
                </p>

                {/* Performance or Date info */}
                {post.performanceData ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '10px'
                  }}>
                    <span>❤️ {post.performanceData.likes}</span>
                    <span>💬 {post.performanceData.comments}</span>
                    <span>🔄 {post.performanceData.shares}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      📈 {post.performanceData.engagementRate}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-light)', marginBottom: '10px' }}>
                    {post.scheduledDate ? (
                      <span>Scheduled for {new Date(post.scheduledDate).toLocaleDateString()}</span>
                    ) : (
                      <span>Created {new Date(post.createdDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {/* Author & Campaign */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>{post.author.name}</span>
                  {post.campaign && <span>{post.campaign}</span>}
                </div>

                {/* Action Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      title="View Post Details"
                      onClick={() => handleView(post)}
                      style={{ padding: '5px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      title="Edit Post"
                      onClick={() => handleEdit(post)}
                      style={{ padding: '5px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      title="Duplicate"
                      onClick={() => handleDuplicate(post)}
                      style={{ padding: '5px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      title="View Publishing Logs"
                      onClick={() => setLogsModalPost(post)}
                      style={{ padding: '5px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <Terminal size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {post.status === 'scheduled' && (
                      <button
                        title="Reschedule"
                        onClick={() => setRescheduleModalPost(post)}
                        style={{ padding: '5px 8px', fontSize: '11px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Clock size={12} /> Reschedule
                      </button>
                    )}
                    {post.status === 'failed' && (
                      <button
                        title="Retry Publishing"
                        onClick={() => handleRetry(post)}
                        style={{ padding: '5px 8px', fontSize: '11px', border: 'none', borderRadius: '4px', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                    )}
                    {post.status === 'draft' && (
                      <button
                        title="Submit for Approval"
                        onClick={() => setApprovalModalPost(post)}
                        style={{ padding: '5px 8px', fontSize: '11px', border: 'none', borderRadius: '4px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Send size={12} /> Approve
                      </button>
                    )}
                    <button
                      title="Delete or Archive"
                      onClick={() => setDeleteModalPost(post)}
                      style={{ padding: '5px', border: 'none', borderRadius: '4px', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Table View */}
      {filteredPosts.length > 0 && viewStyle === 'table' && (
        <div className="posts-table-wrap">
          <div className="posts-table-row posts-table-header">
            <div>Post ID</div>
            <div>Platform</div>
            <div>Content</div>
            <div>Author</div>
            <div>Status</div>
            <div>Schedule / Date</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="posts-table-row"
              onClick={() => handleView(post)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {post.id}
              </div>

              <div>{renderPlatformIcons(post.platforms)}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
                {post.thumbnailUrl && (
                  <img src={post.thumbnailUrl} alt="thumb" style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.caption}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {post.author.name}
              </div>

              <div>
                <span className={`status-badge ${post.status}`}>
                  ● {post.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString() : new Date(post.createdDate).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  title="View"
                  onClick={() => handleView(post)}
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Eye size={14} />
                </button>
                <button
                  title="Edit"
                  onClick={() => handleEdit(post)}
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  title="Duplicate"
                  onClick={() => handleDuplicate(post)}
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Copy size={14} />
                </button>
                <button
                  title="Delete"
                  onClick={() => setDeleteModalPost(post)}
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. All Action Modals */}
      <PostViewModal
        post={viewModalPost}
        isOpen={!!viewModalPost}
        initialMode={sidePanelMode}
        onClose={() => setViewModalPost(null)}
        onEdit={handleEdit}
        onSave={handleSavePost}
        onDuplicate={handleDuplicate}
        onReschedule={(p) => setRescheduleModalPost(p)}
        onDelete={(p) => setDeleteModalPost(p)}
        onRetry={handleRetry}
        onSubmitApproval={(p) => setApprovalModalPost(p)}
        onViewLogs={(p) => setLogsModalPost(p)}
      />

      <PublishingLogsModal
        post={logsModalPost}
        isOpen={!!logsModalPost}
        onClose={() => setLogsModalPost(null)}
        onRetry={handleRetry}
      />

      <SubmitApprovalModal
        post={approvalModalPost}
        isOpen={!!approvalModalPost}
        onClose={() => setApprovalModalPost(null)}
        onSubmit={handleSubmitApproval}
      />

      <DeleteConfirmModal
        post={deleteModalPost}
        isOpen={!!deleteModalPost}
        onClose={() => setDeleteModalPost(null)}
        onConfirmDelete={handleDelete}
        onConfirmArchive={handleArchive}
      />

      {rescheduleModalPost && (
        <RescheduleModal
          post={{
            id: rescheduleModalPost.id,
            brandId: rescheduleModalPost.brandId,
            caption: rescheduleModalPost.caption,
            platforms: rescheduleModalPost.platforms,
            status: rescheduleModalPost.status as any,
            scheduledAt: rescheduleModalPost.scheduledDate || new Date().toISOString(),
            createdAt: rescheduleModalPost.createdDate
          }}
          isOpen={!!rescheduleModalPost}
          onClose={() => setRescheduleModalPost(null)}
          onConfirm={(postId, newDateTime) => {
            handleReschedule(postId, newDateTime);
          }}
        />
      )}
    </div>
  );
};
