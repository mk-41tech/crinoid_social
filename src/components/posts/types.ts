import { SocialPlatform } from '../../types';

export type PostTabType = 
  | 'all'
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'awaiting_approval'
  | 'failed'
  | 'archived';

export type PostRecordStatus = 
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'awaiting_approval'
  | 'failed'
  | 'archived';

export interface ApprovalHistoryItem {
  id: string;
  approverName: string;
  approverRole?: string;
  status: 'approved' | 'rejected' | 'pending' | 'submitted';
  note?: string;
  timestamp: string;
}

export interface PublishingLogItem {
  id: string;
  timestamp: string;
  platform: SocialPlatform;
  status: 'success' | 'failed' | 'retry';
  statusCode: number;
  message: string;
  endpoint?: string;
}

export interface PostPerformanceData {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  clicks?: number;
  engagementRate: string;
}

export interface TargetAccountInfo {
  platform: SocialPlatform;
  name: string;
  username: string;
  avatar?: string;
}

export interface PostRecord {
  id: string; // Post ID e.g. "CRN-9281"
  brandId: string;
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'text' | 'link';
  thumbnailUrl?: string;
  platforms: SocialPlatform[];
  targetAccounts?: TargetAccountInfo[];
  author: {
    id: string;
    name: string;
    email?: string;
    role: string;
    avatar?: string;
  };
  createdDate: string; // ISO
  scheduledDate?: string; // ISO
  publishedDate?: string; // ISO
  status: PostRecordStatus;
  approvalHistory: ApprovalHistoryItem[];
  publishingLogs: PublishingLogItem[];
  publishedUrl?: string; // live social media link e.g. https://instagram.com/p/...
  performanceData?: PostPerformanceData;
  campaign?: string;
  tags?: string[];
}
