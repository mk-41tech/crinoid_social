import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ApprovalTab, 
  ApprovalStatus, 
  ApprovalPostItem, 
  ApprovalRule, 
  ApprovalComment,
  ApprovalHistoryEvent 
} from './types';
import { ApprovalReviewModal } from './ApprovalReviewModal';
import { ApprovalRulesTab } from './ApprovalRulesTab';
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XIcon } from '../common/SocialIcons';
import '../../styles/approval.css';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Layers,
  Clock,
  History
} from 'lucide-react';

const STORAGE_APPROVAL_POSTS = 'crinoid_approval_posts_v1';
const STORAGE_APPROVAL_RULES = 'crinoid_approval_rules_v1';

const getInitialApprovalItems = (brandId: string): ApprovalPostItem[] => {
  const now = new Date();
  const formatISO = (offsetHours: number) => {
    return new Date(now.getTime() + offsetHours * 3600000).toISOString();
  };

  return [
    {
      id: 'APP-501',
      brandId,
      caption: '✨ Launching our new high-performance activewear line this Friday! Breathable, sustainable, and designed to move with you everywhere. Pre-order link in bio! #NexusLife #Activewear',
      mediaUrls: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver'
      },
      status: 'in_review',
      submittedAt: formatISO(-3),
      reviewedAt: formatISO(-2),
      scheduledAt: formatISO(48),
      campaign: 'Spring Active 2026',
      version: 1,
      requiresClientApproval: true,
      clientName: 'Nexus Brand Director',
      steps: [
        {
          stepNumber: 1,
          title: 'Copy & Media Verification',
          assignedRole: 'Social Lead',
          assignedApproverName: 'Muthukumar',
          status: 'approved',
          completedAt: formatISO(-2)
        },
        {
          stepNumber: 2,
          title: 'Client Sign-Off',
          assignedRole: 'Brand Client',
          assignedApproverName: 'Nexus Brand Director',
          status: 'pending',
          isClientStep: true
        }
      ],
      history: [
        {
          id: 'hist-501-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-3),
          note: 'Submitted post copy and high-res apparel media for client campaign review.'
        },
        {
          id: 'hist-501-2',
          type: 'decision',
          action: 'Step 1 Approved: Copy & Media Verification',
          user: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
          timestamp: formatISO(-2),
          stepNumber: 1,
          stepTitle: 'Copy & Media Verification',
          note: 'Step 1 copy and hashtags look solid. Approved and routed to Client review.'
        }
      ],
      comments: [
        {
          id: 'comm-1',
          authorId: 'u-2',
          authorName: 'Priya',
          authorRole: 'Content Creator',
          content: 'Submitted post copy and high-res apparel media for client campaign review. @Karthik @Muthukumar',
          timestamp: formatISO(-3),
          type: 'comment'
        },
        {
          id: 'comm-2',
          authorId: 'u-1',
          authorName: 'Muthukumar',
          authorRole: 'Social Lead',
          content: 'Step 1 copy and hashtags look solid. Approved and routed to Client review.',
          timestamp: formatISO(-2),
          type: 'decision',
          decision: 'approved'
        }
      ]
    },
    {
      id: 'APP-502',
      brandId,
      caption: '💡 5 Quick Tips for high-converting social media creatives in 2026. Bookmark this carousel for your marketing team!',
      mediaUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook', 'linkedin'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver'
      },
      status: 'in_review',
      submittedAt: formatISO(-1),
      scheduledAt: formatISO(72),
      campaign: 'Tech Highlights',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Peer Review',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'pending'
        }
      ],
      history: [
        {
          id: 'hist-502-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-1),
          note: 'Ready for quick approval review before weekend scheduling.'
        }
      ],
      comments: [
        {
          id: 'comm-3',
          authorId: 'u-2',
          authorName: 'Priya',
          authorRole: 'Content Creator',
          content: 'Ready for quick approval review before weekend scheduling. @Karthik',
          timestamp: formatISO(-1),
          type: 'comment'
        }
      ]
    },
    {
      id: 'APP-503',
      brandId,
      caption: 'Behind the scenes at our creative studio. Swipe through to see how our brand aesthetic comes to life. ✨ [Draft v1]',
      mediaUrls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator'
      },
      assignedApprover: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead'
      },
      status: 'changes_requested',
      submittedAt: formatISO(-12),
      reviewedAt: formatISO(-10),
      campaign: 'Brand Awareness',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Creative Lead Sign-off',
          assignedRole: 'Social Lead',
          assignedApproverName: 'Muthukumar',
          status: 'changes_requested'
        }
      ],
      history: [
        {
          id: 'hist-503-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-12),
          note: 'Submitted creative studio carousel.'
        },
        {
          id: 'hist-503-2',
          type: 'changes_requested',
          action: 'Changes Requested',
          user: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
          timestamp: formatISO(-10),
          note: 'Please adjust the color grading on slide 2 and add official brand hashtags before we approve.'
        }
      ],
      comments: [
        {
          id: 'comm-4',
          authorId: 'u-1',
          authorName: 'Muthukumar',
          authorRole: 'Social Lead',
          content: 'Please adjust the color grading on slide 2 and add official brand hashtags before we approve. @Priya',
          timestamp: formatISO(-10),
          type: 'decision',
          decision: 'changes_requested'
        }
      ]
    },
    {
      id: 'APP-504',
      brandId,
      caption: '🚀 Excited to announce our next-generation social suite! Multi-platform publishing is finally here.',
      mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook'],
      author: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver'
      },
      status: 'approved',
      submittedAt: formatISO(-24),
      reviewedAt: formatISO(-20),
      scheduledAt: formatISO(-18),
      campaign: 'Product Launch 2026',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Internal Review',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'approved',
          completedAt: formatISO(-20)
        }
      ],
      history: [
        {
          id: 'hist-504-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
          timestamp: formatISO(-24),
          note: 'Product launch announcement copy submitted.'
        },
        {
          id: 'hist-504-2',
          type: 'decision',
          action: 'Approved (Final Sign-off)',
          user: { id: 'u-3', name: 'Karthik', role: 'Approver' },
          timestamp: formatISO(-20),
          note: 'Looks great! Approved for automated distribution.'
        }
      ],
      comments: [
        {
          id: 'comm-5',
          authorId: 'u-3',
          authorName: 'Karthik',
          authorRole: 'Approver',
          content: 'Looks great! Approved for automated distribution.',
          timestamp: formatISO(-20),
          type: 'decision',
          decision: 'approved'
        }
      ]
    },
    {
      id: 'APP-505',
      brandId,
      caption: 'Unverified coupon discount code flash sale: Get 70% off with coupon code CRN70 today only!',
      mediaUrls: [],
      mediaType: 'text',
      platforms: ['facebook'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator'
      },
      assignedApprover: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead'
      },
      status: 'rejected',
      submittedAt: formatISO(-30),
      reviewedAt: formatISO(-28),
      campaign: 'Promotions',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Compliance Check',
          assignedRole: 'Social Lead',
          assignedApproverName: 'Muthukumar',
          status: 'rejected',
          completedAt: formatISO(-28)
        }
      ],
      history: [
        {
          id: 'hist-505-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-30),
          note: 'Flash sale copy submitted for compliance check.'
        },
        {
          id: 'hist-505-2',
          type: 'decision',
          action: 'Rejected',
          user: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
          timestamp: formatISO(-28),
          note: 'Discount codes above 50% violate marketing guidelines without finance sign-off.'
        }
      ],
      comments: [
        {
          id: 'comm-6',
          authorId: 'u-1',
          authorName: 'Muthukumar',
          authorRole: 'Social Lead',
          content: 'Rejected: Discount codes above 50% violate marketing guidelines without finance sign-off.',
          timestamp: formatISO(-28),
          type: 'decision',
          decision: 'rejected'
        }
      ]
    }
  ];
};

const getInitialApprovalRules = (): ApprovalRule[] => [
  {
    id: 'rule-standard',
    name: 'Standard Two-Step Publishing Approval',
    description: 'Requires Content Creator draft verification by Social Lead before scheduling.',
    enabled: true,
    requiresClient: false,
    autoPublishOnApproval: true,
    appliesTo: 'all',
    steps: [
      { order: 1, role: 'Content Creator', approverName: 'Priya' },
      { order: 2, role: 'Social Lead', approverName: 'Muthukumar' }
    ]
  },
  {
    id: 'rule-client',
    name: 'External Brand Client Sign-Off',
    description: 'Mandatory client review for sponsored content and official brand product campaigns.',
    enabled: true,
    requiresClient: true,
    autoPublishOnApproval: false,
    appliesTo: 'campaigns',
    steps: [
      { order: 1, role: 'Social Lead', approverName: 'Muthukumar' },
      { order: 2, role: 'Brand Client', approverName: 'Nexus Brand Director' }
    ]
  }
];

export const ApprovalView: React.FC = () => {
  const { currentBrand, currentUser, setCurrentView, updateDraft, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<boolean | 'all'>('all');

  // Persistence with backwards-compatible history upgrade
  const [items, setItems] = useState<ApprovalPostItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_APPROVAL_POSTS);
      if (saved) {
        const parsed: ApprovalPostItem[] = JSON.parse(saved);
        return parsed.map(item => ({
          ...item,
          history: item.history || (item.comments ? item.comments.map(c => ({
            id: `hist-${c.id}`,
            type: c.type === 'decision' ? 'decision' : 'comment',
            action: c.decision ? c.decision.toUpperCase() : 'Reviewer Note',
            user: { id: c.authorId, name: c.authorName, role: c.authorRole },
            timestamp: c.timestamp,
            note: c.content
          })) : [])
        }));
      }
    } catch (e) {
      console.warn('Failed to parse cached approval items', e);
    }
    return getInitialApprovalItems(currentBrand.id);
  });

  const [rules, setRules] = useState<ApprovalRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_APPROVAL_RULES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached approval rules', e);
    }
    return getInitialApprovalRules();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPROVAL_POSTS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save approval items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPROVAL_RULES, JSON.stringify(rules));
    } catch (e) {
      console.warn('Failed to save approval rules', e);
    }
  }, [rules]);

  // Selected item for review modal
  const [reviewTarget, setReviewTarget] = useState<ApprovalPostItem | null>(null);

  // Synchronize reviewTarget live with state
  const activeReviewItem = useMemo(() => {
    if (!reviewTarget) return null;
    return items.find(i => i.id === reviewTarget.id) || reviewTarget;
  }, [items, reviewTarget]);

  // Tab Counts: include in_review, submitted, resubmitted in pending
  const tabCounts = useMemo(() => {
    return {
      pending: items.filter(i => i.status === 'in_review' || i.status === 'resubmitted' || i.status === 'submitted' || i.status === 'draft').length,
      changes_requested: items.filter(i => i.status === 'changes_requested').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      all: items.length,
      rules: rules.filter(r => r.enabled).length
    };
  }, [items, rules]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Tab filter
      if (activeTab === 'pending') {
        if (item.status !== 'in_review' && item.status !== 'resubmitted' && item.status !== 'submitted' && item.status !== 'draft') return false;
      } else if (activeTab === 'changes_requested') {
        if (item.status !== 'changes_requested') return false;
      } else if (activeTab === 'approved') {
        if (item.status !== 'approved') return false;
      } else if (activeTab === 'rejected') {
        if (item.status !== 'rejected') return false;
      }

      // Platform filter
      if (platformFilter !== 'all' && !item.platforms.includes(platformFilter as any)) {
        return false;
      }

      // Client Approval filter
      if (clientFilter !== 'all' && item.requiresClientApproval !== clientFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCaption = item.caption.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchAuthor = item.author.name.toLowerCase().includes(q);
        if (!matchCaption && !matchId && !matchAuthor) return false;
      }

      return true;
    });
  }, [items, activeTab, platformFilter, clientFilter, searchQuery]);

  // Review Decisions with multi-step enforcement, timestamps, and history logging
  const handleApprove = (postId: string, note = 'Approved post for scheduling and publishing.') => {
    const actor = currentUser || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        // Multi-step rule enforcement: find first pending or changes_requested step
        const stepIdx = item.steps.findIndex(s => s.status === 'pending' || s.status === 'changes_requested');
        const updatedSteps = [...item.steps];

        let isFinalStep = true;
        let approvedStepTitle = 'Final Approval';
        let isClient = false;

        if (stepIdx !== -1) {
          const currentStep = updatedSteps[stepIdx];
          approvedStepTitle = currentStep.title;
          isClient = !!currentStep.isClientStep;

          updatedSteps[stepIdx] = {
            ...currentStep,
            status: 'approved',
            completedAt: nowIso
          };

          // Check if there are further pending steps
          if (stepIdx + 1 < updatedSteps.length) {
            isFinalStep = false;
            updatedSteps[stepIdx + 1] = {
              ...updatedSteps[stepIdx + 1],
              status: 'pending'
            };
          }
        }

        const newStatus: ApprovalStatus = isFinalStep ? 'approved' : 'in_review';
        const newClientStatus = isClient ? 'approved' : item.clientApprovalStatus;

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'decision',
          action: isFinalStep ? 'Approved (Final Sign-off)' : `Step ${stepIdx + 1} Approved: ${approvedStepTitle}`,
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note,
          stepNumber: stepIdx !== -1 ? stepIdx + 1 : undefined,
          stepTitle: approvedStepTitle,
          isClientApproval: isClient
        };

        const commentItem: ApprovalComment = {
          id: `comm-${Date.now()}`,
          authorId: actor.id,
          authorName: actor.name,
          authorRole: actor.role,
          authorAvatar: actor.avatar,
          content: note,
          timestamp: nowIso,
          type: 'decision',
          decision: 'approved'
        };

        return {
          ...item,
          status: newStatus,
          reviewedAt: nowIso,
          clientApprovalStatus: newClientStatus,
          steps: updatedSteps,
          history: [...(item.history || []), historyEvent],
          comments: [...item.comments, commentItem]
        };
      }
      return item;
    }));

    showToast('success', `Approval saved.`);
  };

  const handleReject = (postId: string, reason: string) => {
    const actor = currentUser || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        const stepIdx = item.steps.findIndex(s => s.status === 'pending' || s.status === 'changes_requested');
        const updatedSteps = [...item.steps];
        if (stepIdx !== -1) {
          updatedSteps[stepIdx] = {
            ...updatedSteps[stepIdx],
            status: 'rejected',
            completedAt: nowIso
          };
        }

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'decision',
          action: 'Rejected',
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note: reason
        };

        return {
          ...item,
          status: 'rejected',
          reviewedAt: nowIso,
          steps: updatedSteps,
          history: [...(item.history || []), historyEvent],
          comments: [
            ...item.comments,
            {
              id: `comm-${Date.now()}`,
              authorId: actor.id,
              authorName: actor.name,
              authorRole: actor.role,
              authorAvatar: actor.avatar,
              content: `Rejected: ${reason}`,
              timestamp: nowIso,
              type: 'decision',
              decision: 'rejected'
            }
          ]
        };
      }
      return item;
    }));

    showToast('error', `Post ${postId} rejected.`);
  };

  const handleRequestChanges = (postId: string, feedback: string) => {
    const actor = currentUser || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        const stepIdx = item.steps.findIndex(s => s.status === 'pending' || s.status === 'changes_requested');
        const updatedSteps = [...item.steps];
        if (stepIdx !== -1) {
          updatedSteps[stepIdx] = {
            ...updatedSteps[stepIdx],
            status: 'changes_requested'
          };
        }

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'changes_requested',
          action: 'Changes Requested',
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note: feedback
        };

        return {
          ...item,
          status: 'changes_requested',
          reviewedAt: nowIso,
          steps: updatedSteps,
          history: [...(item.history || []), historyEvent],
          comments: [
            ...item.comments,
            {
              id: `comm-${Date.now()}`,
              authorId: actor.id,
              authorName: actor.name,
              authorRole: actor.role,
              authorAvatar: actor.avatar,
              content: `Changes Requested: ${feedback}`,
              timestamp: nowIso,
              type: 'decision',
              decision: 'changes_requested'
            }
          ]
        };
      }
      return item;
    }));

    showToast('warning', `Changes requested for post ${postId}.`);
  };

  const handleResubmit = (postId: string, newCaption?: string) => {
    const actor = currentUser || { id: 'u-2', name: 'Priya', role: 'Content Creator' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        const newVersion = item.version + 1;
        // Reset steps to pending for re-evaluation
        const updatedSteps = item.steps.map(s => ({ ...s, status: 'pending' as const }));

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'resubmission',
          action: `Resubmitted for Approval (v${newVersion})`,
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note: `Post edited and resubmitted for approval review.`,
          version: newVersion
        };

        return {
          ...item,
          caption: newCaption || item.caption,
          status: 'resubmitted',
          version: newVersion,
          resubmittedAt: nowIso,
          steps: updatedSteps,
          history: [...(item.history || []), historyEvent],
          comments: [
            ...item.comments,
            {
              id: `comm-${Date.now()}`,
              authorId: actor.id,
              authorName: actor.name,
              authorRole: actor.role,
              authorAvatar: actor.avatar,
              content: `Edited and resubmitted (v${newVersion}) for approval.`,
              timestamp: nowIso,
              type: 'decision',
              decision: 'resubmitted'
            }
          ]
        };
      }
      return item;
    }));

    showToast('success', `Post ${postId} resubmitted for approval.`);
  };

  const handleAssignApprover = (postId: string, user: { id: string; name: string; role: string; avatar?: string }) => {
    const actor = currentUser || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        // Also update current pending step's approver
        const updatedSteps = item.steps.map(s => 
          (s.status === 'pending' || s.status === 'changes_requested')
            ? { ...s, assignedApproverName: user.name, assignedRole: user.role }
            : s
        );

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'assignment',
          action: 'Approver Assigned',
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note: `Assigned review to ${user.name} (${user.role})`
        };

        return {
          ...item,
          assignedApprover: user,
          steps: updatedSteps,
          history: [...(item.history || []), historyEvent]
        };
      }
      return item;
    }));

    showToast('info', `Assigned approver updated to ${user.name}.`);
  };

  const handleAddComment = (postId: string, commentText: string, mentions: string[]) => {
    const actor = currentUser || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' as const, avatar: '' };
    const nowIso = new Date().toISOString();

    setItems(prev => prev.map(item => {
      if (item.id === postId) {
        const newComment: ApprovalComment = {
          id: `comm-${Date.now()}`,
          authorId: actor.id,
          authorName: actor.name,
          authorRole: actor.role,
          authorAvatar: actor.avatar,
          content: commentText,
          mentions,
          timestamp: nowIso,
          type: 'comment'
        };

        const historyEvent: ApprovalHistoryEvent = {
          id: `hist-${Date.now()}`,
          type: 'comment',
          action: mentions.length > 0 ? `Comment with @mentions (${mentions.join(', ')})` : 'Reviewer Note',
          user: { id: actor.id, name: actor.name, role: actor.role, avatar: actor.avatar },
          timestamp: nowIso,
          note: commentText
        };

        return {
          ...item,
          comments: [...item.comments, newComment],
          history: [...(item.history || []), historyEvent]
        };
      }
      return item;
    }));

    showToast('info', 'Comment added with @mentions.');
  };

  const handleScheduleOrPublish = (postId: string) => {
    const post = items.find(i => i.id === postId);
    if (post) {
      updateDraft({
        brandId: post.brandId,
        commonCaption: post.caption,
        platforms: post.platforms,
        mediaUrls: post.mediaUrls,
        mediaType: post.mediaType,
        thumbnailUrl: post.thumbnailUrl || ''
      });
      showToast('success', `Post loaded into Composer for scheduling / publishing.`);
      setCurrentView('composer');
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    showToast('info', 'Approval rule status updated.');
  };

  const renderPlatformIcons = (platforms: string[]) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {platforms.map(p => {
        if (p === 'instagram') return <InstagramIcon key={p} size={12} color="#E4405F" />;
        if (p === 'facebook') return <FacebookIcon key={p} size={12} color="#1877F2" />;
        if (p === 'linkedin') return <LinkedinIcon key={p} size={12} color="#0A66C2" />;
        if (p === 'youtube') return <YoutubeIcon key={p} size={12} color="#FF0000" />;
        if (p === 'x') return <XIcon key={p} size={12} color="#0f1419" />;
        return (
          <span key={p} style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {p[0]}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="approval-container">
      {/* 1. Header Area */}
      <div className="approval-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Approval
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            The Approval section controls the multi-step review process and client sign-offs before publication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            updateDraft({ brandId: currentBrand.id });
            setCurrentView('composer');
          }}
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
          <span>New Post for Approval</span>
        </button>
      </div>

      {/* 2. Recommended Workflow Tabs */}
      <div className="approval-tabs-nav">
        {[
          { key: 'pending', label: 'Pending Approvals' },
          { key: 'changes_requested', label: 'Changes Requested' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all', label: 'All Requests' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`approval-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as ApprovalTab)}
          >
            <span>{tab.label}</span>
            <span className="approval-tab-count">
              {tabCounts[tab.key as keyof typeof tabCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Controls & Filter Bar (Shown on posts tabs) */}
      {activeTab !== 'rules' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search approval queue by caption, ID, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{
                padding: '6px 10px',
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
            </select>

            {/* Client Approval filter */}
            <select
              value={String(clientFilter)}
              onChange={(e) => {
                const val = e.target.value;
                setClientFilter(val === 'all' ? 'all' : val === 'true');
              }}
              style={{
                padding: '6px 10px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Workflows</option>
              <option value="true">Client Sign-Off Required</option>
              <option value="false">Internal Team Only</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Tab Content: Approval Rules Tab (if active) */}
      {activeTab === 'rules' && (
        <ApprovalRulesTab
          rules={rules}
          onToggleRule={handleToggleRule}
          onUpdateRule={(updated) => {
            setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
        />
      )}

      {/* 5. Tab Content: Post List (Cards Grid) */}
      {activeTab !== 'rules' && (
        <>
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '60px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '12px',
              border: '1px dashed var(--border-subtle)',
              margin: '20px 0'
            }}>
              <ShieldCheck size={36} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--text-primary)' }}>
                No posts in "{activeTab.replace('_', ' ')}"
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                All pending approval requests have been reviewed or match zero filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => (
                <div key={item.id} className="approval-card">
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                        {item.id}
                      </span>
                      {renderPlatformIcons(item.platforms)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.requiresClientApproval && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: item.clientApprovalStatus === 'approved' ? '#ecfdf5' : '#f5f3ff',
                          color: item.clientApprovalStatus === 'approved' ? '#059669' : '#7c3aed',
                          border: `1px solid ${item.clientApprovalStatus === 'approved' ? '#a7f3d0' : '#ddd6fe'}`
                        }}>
                          {item.clientApprovalStatus === 'approved' ? 'Client Approved' : 'Client Review'}
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                        backgroundColor: item.status === 'approved' ? '#d1fae5' : item.status === 'rejected' ? '#fee2e2' : item.status === 'changes_requested' ? '#fef3c7' : 'var(--color-primary-light)',
                        color: item.status === 'approved' ? '#047857' : item.status === 'rejected' ? '#dc2626' : item.status === 'changes_requested' ? '#b45309' : 'var(--color-primary)'
                      }}>
                        ● {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail & Caption */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt="media"
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <p style={{
                      margin: 0,
                      fontSize: '12.5px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.caption}
                    </p>
                  </div>

                  {/* Multi-Step Pipeline Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Workflow:</span>
                    {item.steps.map((st, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: 700,
                          backgroundColor: st.status === 'approved' ? '#10b981' : st.status === 'rejected' ? '#ef4444' : st.status === 'changes_requested' ? '#f59e0b' : '#94a3b8',
                          color: '#ffffff'
                        }}>
                          {st.status === 'approved' ? '✓' : st.stepNumber}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{st.title}</span>
                        {idx < item.steps.length - 1 && <span style={{ color: 'var(--text-light)' }}>→</span>}
                      </div>
                    ))}
                  </div>

                  {/* Creator and Approver details */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>By: <strong>{item.author.name}</strong></span>
                    <span>Reviewer: <strong>{item.assignedApprover.name}</strong></span>
                  </div>

                  {/* Timestamps row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    color: 'var(--text-light)',
                    paddingTop: '2px'
                  }}>
                    <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                    {item.reviewedAt ? (
                      <span>Decision: {new Date(item.reviewedAt).toLocaleDateString()}</span>
                    ) : item.resubmittedAt ? (
                      <span>Resubmitted: {new Date(item.resubmittedAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>

                  {/* Comments count indicator & History counter */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                    {item.comments.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                        <MessageSquare size={12} />
                        <span>{item.comments.length} notes</span>
                      </div>
                    ) : <span />}
                    {item.history && item.history.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                        <History size={11} />
                        <span>{item.history.length} log events</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: 'auto'
                  }}>
                    <button
                      type="button"
                      onClick={() => setReviewTarget(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={13} /> Review Details
                    </button>

                    {item.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleScheduleOrPublish(item.id)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Publish →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 6. Review Dialog Drawer */}
      <ApprovalReviewModal
        post={activeReviewItem}
        isOpen={!!activeReviewItem}
        onClose={() => setReviewTarget(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestChanges={handleRequestChanges}
        onResubmit={handleResubmit}
        onAddComment={handleAddComment}
        onAssignApprover={handleAssignApprover}
        onScheduleOrPublish={handleScheduleOrPublish}
      />
    </div>
  );
};
