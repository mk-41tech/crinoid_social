import { SocialPlatform } from '../types';

export interface PlatformRules {
  name: string;
  charLimit: number;
  brandColor: string;
  bgColor: string;
  supportedMedia: ('image' | 'video' | 'carousel' | 'link')[];
  supportsFirstComment: boolean;
  supportsLinkAttachment: boolean;
  supportsTitle: boolean;
  supportsAltText: boolean;
  requiresMedia: boolean;
  requiresVideo: boolean;
  requiresTitle: boolean;
  titleLimit?: number;
  description: string;
  supportsImages: boolean;
  supportsVideos: boolean;
  maxVideoSizeMB: number;
  mediaTypeLabel: string;
  mediaUploadNotice: string;
}

export const PLATFORM_CONFIG: Record<SocialPlatform, PlatformRules> = {
  instagram: {
    name: 'Instagram',
    charLimit: 2200,
    brandColor: '#E1306C',
    bgColor: '#FDF2F8',
    supportedMedia: ['image', 'carousel', 'video'],
    supportsFirstComment: true,
    supportsLinkAttachment: false,
    supportsTitle: false,
    supportsAltText: true,
    requiresMedia: true,
    requiresVideo: false,
    requiresTitle: false,
    supportsImages: true,
    supportsVideos: true,
    maxVideoSizeMB: 100,
    mediaTypeLabel: 'Photo or Reel',
    mediaUploadNotice: 'Supports JPG, PNG up to 8MB or MP4 videos up to 100MB (large videos not supported on Instagram)',
    description: 'Photo and Reel posts with high visual emphasis and hashtag reach.'
  },
  facebook: {
    name: 'Facebook',
    charLimit: 63206,
    brandColor: '#1877F2',
    bgColor: '#EFF6FF',
    supportedMedia: ['image', 'video', 'carousel', 'link'],
    supportsFirstComment: true,
    supportsLinkAttachment: true,
    supportsTitle: false,
    supportsAltText: true,
    requiresMedia: false,
    requiresVideo: false,
    requiresTitle: false,
    supportsImages: true,
    supportsVideos: true,
    maxVideoSizeMB: 512,
    mediaTypeLabel: 'Photo or Video',
    mediaUploadNotice: 'Supports JPG, PNG up to 30MB or MP4 videos up to 512MB',
    description: 'Versatile posts supporting links, media carousels, and rich discussion.'
  },
  linkedin: {
    name: 'LinkedIn',
    charLimit: 3000,
    brandColor: '#0A66C2',
    bgColor: '#F0F7FF',
    supportedMedia: ['image', 'video', 'carousel', 'link'],
    supportsFirstComment: true,
    supportsLinkAttachment: true,
    supportsTitle: false,
    supportsAltText: true,
    requiresMedia: false,
    requiresVideo: false,
    requiresTitle: false,
    supportsImages: true,
    supportsVideos: true,
    maxVideoSizeMB: 200,
    mediaTypeLabel: 'Photo or Video',
    mediaUploadNotice: 'Supports JPG, PNG up to 10MB or MP4 videos up to 200MB',
    description: 'Thought leadership and industry insights with business audience reach.'
  },
  youtube: {
    name: 'YouTube',
    charLimit: 5000,
    titleLimit: 100,
    brandColor: '#FF0000',
    bgColor: '#FEF2F2',
    supportedMedia: ['video'],
    supportsFirstComment: false,
    supportsLinkAttachment: false,
    supportsTitle: true,
    supportsAltText: false,
    requiresMedia: true,
    requiresVideo: true,
    requiresTitle: true,
    supportsImages: false,
    supportsVideos: true,
    maxVideoSizeMB: 2048,
    mediaTypeLabel: 'Video Only',
    mediaUploadNotice: 'Supports MP4, MOV video files only (photos not supported on YouTube)',
    description: 'Long-form and Short video publishing with metadata, titles, and thumbnails.'
  }
};

export const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'youtube'];
export const INITIAL_CONNECT_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'youtube', 'linkedin'];
