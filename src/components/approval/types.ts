import { SocialPlatform } from '../../types';

export type ApprovalTab =
  | 'pending'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'all'
  | 'rules';

export type ApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected';

export interface ApprovalComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  mentions?: string[]; // e.g. ["@Muthukumar", "@Priya"]
  timestamp: string;
  type: 'comment' | 'decision';
  decision?: 'approved' | 'rejected' | 'changes_requested' | 'resubmitted';
}

export interface ApprovalStep {
  stepNumber: number;
  title: string;
  assignedRole: string;
  assignedApproverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  completedAt?: string;
  isClientStep?: boolean;
}

export interface ApprovalHistoryEvent {
  id: string;
  type: 'submission' | 'in_review' | 'decision' | 'changes_requested' | 'resubmission' | 'comment' | 'assignment';
  action: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: string;
  note?: string;
  stepNumber?: number;
  stepTitle?: string;
  isClientApproval?: boolean;
  version?: number;
}

export interface ApprovalPostItem {
  id: string; // e.g. "APP-821"
  brandId: string;
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'text';
  thumbnailUrl?: string;
  platforms: SocialPlatform[];
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  assignedApprover: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  status: ApprovalStatus;
  submittedAt: string;
  resubmittedAt?: string;
  reviewedAt?: string;
  scheduledAt?: string;
  campaign?: string;
  comments: ApprovalComment[];
  steps: ApprovalStep[];
  history: ApprovalHistoryEvent[];
  requiresClientApproval: boolean;
  clientApprovalStatus?: 'pending' | 'approved' | 'rejected';
  clientName?: string;
  version: number;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresClient: boolean;
  autoPublishOnApproval: boolean;
  steps: {
    order: number;
    role: string;
    approverName: string;
  }[];
  appliesTo: 'all' | 'campaigns' | 'videos';
}
