import { SocialPlatform } from '../../types';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'list';

export type PostCalendarStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'published' | 'failed';
export type ApprovalState = 'approved' | 'in_review' | 'rejected' | 'draft';

export interface CalendarPost {
  id: string;
  brandId: string;
  brandName?: string;
  caption: string;
  platforms: SocialPlatform[];
  status: PostCalendarStatus;
  approvalStatus?: ApprovalState;
  scheduledAt: string; // ISO date-time or parseable string
  thumbnailUrl?: string;
  mediaType?: 'image' | 'video' | 'text' | 'link';
  author?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  campaign?: string;
  errorDetails?: string;
  createdAt: string;
}

export interface CalendarFilterState {
  searchQuery: string;
  brandId: string;
  socialAccountId: string;
  platform: SocialPlatform | 'all';
  status: PostCalendarStatus | 'all';
  campaign: string;
  authorId: string;
  approverId: string;
}
