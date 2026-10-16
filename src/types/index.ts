export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'youtube';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  name: string;
  username: string;
  avatar: string;
  brandId: string;
  followers?: string;
  status: 'connected' | 'disconnected' | 'needs_reauth';
  connectedAt?: string;
}

export interface BrandUser {
  id: string;
  name: string;
  email: string;
  role: 'Social Lead' | 'Content Creator' | 'Copywriter' | 'Approver' | 'Brand Manager';
  avatar: string;
  brandId: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  color: string;
  users: BrandUser[];
  accounts: SocialAccount[];
}

export interface PlatformVariant {
  caption?: string;
  hashtags?: string;
  title?: string; // YouTube video title
  firstComment?: string; // Instagram / LinkedIn / Facebook
  linkUrl?: string;
  linkTitle?: string;
  linkDomain?: string;
  youtubeCategory?: string;
}

export interface PostDraft {
  id: string;
  brandId: string;
  platforms: SocialPlatform[];
  commonCaption: string;
  platformVariants: Partial<Record<SocialPlatform, PlatformVariant>>;
  mediaUrls: string[];
  mediaType: 'text' | 'image' | 'video' | 'carousel' | 'link';
  altTexts: Record<string, string>;
  thumbnailUrl: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDomain?: string;
  linkDescription?: string;
  linkImage?: string;
  status: 'draft' | 'pending_approval' | 'scheduled' | 'published';
  scheduledAt?: string;
  assignedReviewerId?: string;
  updatedAt: string;
}

export interface NavModule {
  id: string;
  name: string;
  iconName: string;
  count: number;
  subItems: string[];
  activeSubItem?: string;
  description: string;
}
