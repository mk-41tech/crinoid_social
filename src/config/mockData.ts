import { Brand, BrandUser, SocialAccount, SocialPlatform } from '../types';

export const DUMMY_LOGIN_ACCOUNTS: any[] = [];

export const MOCK_BRANDS: Brand[] = [];

export const MOCK_LIBRARY_ITEMS = [
  {
    id: 'lib-1',
    type: 'image' as const,
    name: 'Brand Hero Showcase.jpg',
    size: '2.4 MB'
  },
  {
    id: 'lib-2',
    type: 'image' as const,
    name: 'Product Feature Highlight.png',
    size: '1.8 MB'
  },
  {
    id: 'lib-3',
    type: 'video' as const,
    name: 'Product Teaser Reel.mp4',
    size: '8.4 MB'
  }
];

export interface MockChannelCatalogItem {
  platform: SocialPlatform;
  name: string;
  username: string;
  avatar: string;
  authProfileName: string;
  authProfileAvatar: string;
  description: string;
}

export const DEFAULT_CHANNEL_CATALOG: Record<SocialPlatform, MockChannelCatalogItem> = {
  instagram: {
    platform: 'instagram',
    name: 'Instagram Profile',
    username: '@brand.social',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    authProfileName: 'Brand Admin',
    authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Instagram Professional Business Profile'
  },
  facebook: {
    platform: 'facebook',
    name: 'Facebook Page',
    username: 'brandpage',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    authProfileName: 'Brand Admin',
    authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Facebook Verified Business Page'
  },
  linkedin: {
    platform: 'linkedin',
    name: 'LinkedIn Company',
    username: 'company-brand',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    authProfileName: 'Brand Admin',
    authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'LinkedIn Verified Organization'
  },
  youtube: {
    platform: 'youtube',
    name: 'YouTube Channel',
    username: '@brand.official',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    authProfileName: 'Brand Admin',
    authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Official YouTube Channel'
  },
  x: {
    platform: 'x',
    name: 'X Account',
    username: '@brand_x',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    authProfileName: 'Brand Admin',
    authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Official X (Twitter) Account'
  }
};

export const BRAND_CHANNELS_CATALOG: Record<string, Record<SocialPlatform, MockChannelCatalogItem>> = new Proxy(
  {},
  {
    get: (_target, _prop) => {
      return DEFAULT_CHANNEL_CATALOG;
    }
  }
);
