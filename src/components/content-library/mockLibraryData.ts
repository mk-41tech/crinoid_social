import { LibraryAsset, LibraryFolder } from './types';

export const DEFAULT_LIBRARY_FOLDERS: LibraryFolder[] = [
  {
    id: 'folder-brand',
    name: 'Brand Assets',
    brandId: 'brand-crinoid',
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'folder-campaigns',
    name: 'Campaign Creatives',
    brandId: 'brand-crinoid',
    createdAt: '2026-10-05T09:30:00.000Z'
  },
  {
    id: 'folder-logos',
    name: 'Logos',
    brandId: 'brand-crinoid',
    createdAt: '2026-10-10T11:00:00.000Z'
  },
  {
    id: 'folder-social',
    name: 'Social Promos',
    brandId: 'brand-crinoid',
    createdAt: '2026-10-15T14:15:00.000Z'
  }
];

export const getInitialMockAssets = (brandId: string, brandName: string): LibraryAsset[] => [
  {
    id: 'AST-1001',
    fileName: 'product_suite_launch_hero.jpg',
    fileType: 'image/jpeg',
    category: 'image',
    fileSize: 1420500, // 1.42 MB
    dimensions: '1920 x 1080 px',
    uploadDate: '2026-10-22T09:30:00.000Z',
    uploader: {
      id: 'u-1',
      name: 'Muthukumar',
      role: 'Social Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Campaign Creatives',
    tags: ['Product Launch', 'Hero', 'Q4 Campaign', 'Banner'],
    usageReferences: ['CRN-1001'],
    storageKey: 'obj-ast-1001',
    storageProvider: 'remote-url',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'AST-1002',
    fileName: 'creative_conversion_tips.png',
    fileType: 'image/png',
    category: 'campaign_creative',
    fileSize: 2240100, // 2.24 MB
    dimensions: '1080 x 1080 px',
    uploadDate: '2026-10-25T11:15:00.000Z',
    uploader: {
      id: 'u-2',
      name: 'Priya',
      role: 'Content Creator',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Social Promos',
    tags: ['Tips', 'Infographic', 'Instagram', 'Carousel'],
    usageReferences: ['CRN-1002'],
    storageKey: 'obj-ast-1002',
    storageProvider: 'remote-url',
    previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'AST-1003',
    fileName: 'studio_design_behind_the_scenes.jpg',
    fileType: 'image/jpeg',
    category: 'brand_asset',
    fileSize: 1870400, // 1.87 MB
    dimensions: '1920 x 1280 px',
    uploadDate: '2026-10-26T14:00:00.000Z',
    uploader: {
      id: 'u-2',
      name: 'Priya',
      role: 'Content Creator',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Brand Assets',
    tags: ['Culture', 'BTS', 'Workspace', 'Studio'],
    usageReferences: ['CRN-1003'],
    storageKey: 'obj-ast-1003',
    storageProvider: 'remote-url',
    previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'AST-1004',
    fileName: 'crinoid_official_emblem_logo.svg',
    fileType: 'image/svg+xml',
    category: 'logo',
    fileSize: 45200, // 45.2 KB
    dimensions: '512 x 512 px',
    uploadDate: '2026-10-10T10:00:00.000Z',
    uploader: {
      id: 'u-1',
      name: 'Muthukumar',
      role: 'Social Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Logos',
    tags: ['Logo', 'Brand Mark', 'Official', 'Vector'],
    usageReferences: [],
    storageKey: 'obj-ast-1004',
    storageProvider: 'remote-url',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'AST-1005',
    fileName: 'interactive_demo_teaser.mp4',
    fileType: 'video/mp4',
    category: 'video',
    fileSize: 18450000, // 18.45 MB
    dimensions: '1920 x 1080 px',
    duration: '00:38',
    uploadDate: '2026-10-27T16:20:00.000Z',
    uploader: {
      id: 'u-1',
      name: 'Muthukumar',
      role: 'Social Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Campaign Creatives',
    tags: ['Video', 'Demo', 'Teaser', 'Reels', 'YouTube'],
    usageReferences: [],
    storageKey: 'obj-ast-1005',
    storageProvider: 'remote-url',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'AST-1006',
    fileName: 'sparkle_engagement_reaction.gif',
    fileType: 'image/gif',
    category: 'gif',
    fileSize: 3120000, // 3.12 MB
    dimensions: '600 x 600 px',
    uploadDate: '2026-10-27T17:45:00.000Z',
    uploader: {
      id: 'u-2',
      name: 'Priya',
      role: 'Content Creator',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Social Promos',
    tags: ['Reaction', 'GIF', 'Sticker', 'Community'],
    usageReferences: [],
    storageKey: 'obj-ast-1006',
    storageProvider: 'remote-url',
    previewUrl: 'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif'
  },
  {
    id: 'AST-1007',
    fileName: 'crinoid_brand_palette_guide.pdf',
    fileType: 'application/pdf',
    category: 'other',
    fileSize: 4890000, // 4.89 MB
    uploadDate: '2026-10-15T12:00:00.000Z',
    uploader: {
      id: 'u-1',
      name: 'Muthukumar',
      role: 'Social Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    workspace: brandName || 'Crinoid Social',
    folder: 'Brand Assets',
    tags: ['Guide', 'Palette', 'Specs', 'Design System'],
    usageReferences: [],
    storageKey: 'obj-ast-1007',
    storageProvider: 'remote-url',
    previewUrl: ''
  }
];

