import { Brand, BrandUser, SocialAccount, SocialPlatform } from '../types';

export const DUMMY_LOGIN_ACCOUNTS = [
  {
    email: 'muthu@crinoid.social',
    password: 'crinoid2025',
    name: 'Muthukumar',
    role: 'Social Lead',
    brandName: 'Crinoid Tech'
  },
  {
    email: 'priya@crinoid.social',
    password: 'crinoid2025',
    name: 'Priya',
    role: 'Content Creator',
    brandName: 'Crinoid Tech'
  },
  {
    email: 'karthik@crinoid.social',
    password: 'crinoid2025',
    name: 'Karthik',
    role: 'Approver',
    brandName: 'Crinoid Tech'
  }
];

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'brand-crinoid',
    name: 'Crinoid Tech',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    tagline: 'Multi-Channel Social Management',
    color: '#4F46E5',
    users: [
      {
        id: 'u-1',
        name: 'Muthukumar',
        email: 'muthu@crinoid.social',
        role: 'Social Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-crinoid'
      },
      {
        id: 'u-2',
        name: 'Priya',
        email: 'priya@crinoid.social',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-crinoid'
      },
      {
        id: 'u-3',
        name: 'Karthik',
        email: 'karthik@crinoid.social',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-crinoid'
      }
    ],
    accounts: []
  },
  {
    id: 'brand-nexus',
    name: 'Nexus Lifestyle',
    logo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    tagline: 'Athletics, Wellness & Everyday Apparel',
    color: '#0D9488',
    users: [
      {
        id: 'u-4',
        name: 'Kavitha',
        email: 'kavitha@nexuslife.io',
        role: 'Brand Manager',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus'
      },
      {
        id: 'u-5',
        name: 'Arun',
        email: 'arun@nexuslife.io',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus'
      }
    ],
    accounts: [
      {
        id: 'acc-ig-2',
        platform: 'instagram',
        name: 'Nexus Active',
        username: '@nexus.activewear',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus',
        status: 'connected'
      },
      {
        id: 'acc-fb-2',
        platform: 'facebook',
        name: 'Nexus Lifestyle Co.',
        username: 'nexuslifestyle',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus',
        status: 'connected'
      },
      {
        id: 'acc-li-2',
        platform: 'linkedin',
        name: 'Nexus Lifestyle Enterprises',
        username: 'nexus-lifestyle',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus',
        status: 'connected'
      },
      {
        id: 'acc-yt-2',
        platform: 'youtube',
        name: 'Nexus Fit TV',
        username: '@nexusfitnesstv',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-nexus',
        status: 'connected'
      }
    ]
  },
  {
    id: 'brand-horizon',
    name: 'Horizon Studio',
    logo: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
    tagline: 'Architectural Design & Brand Stories',
    color: '#8B5CF6',
    users: [
      {
        id: 'u-6',
        name: 'Nithya',
        email: 'nithya@horizon.agency',
        role: 'Copywriter',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-horizon'
      },
      {
        id: 'u-7',
        name: 'Karthik',
        email: 'karthik@horizon.agency',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        brandId: 'brand-horizon'
      }
    ],
    accounts: [
      {
        id: 'acc-ig-3',
        platform: 'instagram',
        name: 'Horizon Visuals',
        username: '@horizon.studio',
        avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-horizon',
        followers: '14.2K',
        status: 'connected'
      },
      {
        id: 'acc-li-3',
        platform: 'linkedin',
        name: 'Horizon Creative Studio',
        username: 'horizon-creative',
        avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-horizon',
        followers: '24.1K',
        status: 'connected'
      },
      {
        id: 'acc-yt-3',
        platform: 'youtube',
        name: 'Horizon Design Films',
        username: '@horizondesign',
        avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
        brandId: 'brand-horizon',
        followers: '9.8K',
        status: 'connected'
      }
    ]
  }
];

export const SAMPLE_MEDIA_LIBRARY = [
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    type: 'image' as const,
    name: 'Abstract Gradient Wave.jpg',
    size: '1.2 MB'
  },
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
    type: 'image' as const,
    name: 'SaaS Analytics Dashboard.png',
    size: '980 KB'
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    type: 'image' as const,
    name: 'Design Team Collaboration.jpg',
    size: '2.4 MB'
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    type: 'image' as const,
    name: 'Growth Metrics Chart.png',
    size: '1.1 MB'
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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

export const BRAND_CHANNELS_CATALOG: Record<string, Record<SocialPlatform, MockChannelCatalogItem>> = {
  'brand-crinoid': {
    instagram: {
      platform: 'instagram',
      name: 'Crinoid Tech',
      username: '@crinoid.social',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Muthukumar (Social Lead)',
      authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      description: 'Instagram Professional Business Profile'
    },
    facebook: {
      platform: 'facebook',
      name: 'Crinoid Technologies',
      username: 'crinoidsocial',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Muthukumar',
      authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      description: 'Facebook Verified Business Page'
    },
    linkedin: {
      platform: 'linkedin',
      name: 'Crinoid Social Enterprise',
      username: 'crinoid-social',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Muthukumar',
      authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      description: 'LinkedIn Company & Showcase Page'
    },
    youtube: {
      platform: 'youtube',
      name: 'Crinoid Tech Official',
      username: '@crinoidofficial',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Muthukumar',
      authProfileAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      description: 'YouTube Brand Channel'
    }
  },
  'brand-nexus': {
    instagram: {
      platform: 'instagram',
      name: 'Nexus Active',
      username: '@nexus.activewear',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Kavitha (Brand Manager)',
      authProfileAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      description: 'Instagram Lifestyle Profile'
    },
    facebook: {
      platform: 'facebook',
      name: 'Nexus Lifestyle Co.',
      username: 'nexuslifestyle',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Kavitha',
      authProfileAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      description: 'Facebook Brand Page'
    },
    linkedin: {
      platform: 'linkedin',
      name: 'Nexus Lifestyle Enterprises',
      username: 'nexus-lifestyle',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Arun',
      authProfileAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      description: 'LinkedIn Corporate Page'
    },
    youtube: {
      platform: 'youtube',
      name: 'Nexus Fit TV',
      username: '@nexusfitnesstv',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Arun',
      authProfileAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      description: 'YouTube Channel'
    }
  },
  'brand-horizon': {
    instagram: {
      platform: 'instagram',
      name: 'Horizon Visuals',
      username: '@horizon.studio',
      avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Karthik (Approver)',
      authProfileAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      description: 'Instagram Studio Gallery'
    },
    facebook: {
      platform: 'facebook',
      name: 'Horizon Creative Studio',
      username: 'horizonstudio',
      avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Karthik',
      authProfileAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      description: 'Facebook Agency Page'
    },
    linkedin: {
      platform: 'linkedin',
      name: 'Horizon Creative Studio',
      username: 'horizon-creative',
      avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Karthik',
      authProfileAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      description: 'LinkedIn Business Profile'
    },
    youtube: {
      platform: 'youtube',
      name: 'Horizon Design Films',
      username: '@horizondesign',
      avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
      authProfileName: 'Karthik',
      authProfileAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      description: 'YouTube Showcase Channel'
    }
  }
};
