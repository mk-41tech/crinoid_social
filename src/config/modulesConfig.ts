import { AppView } from '../context/AppContext';

export type ModuleStatus = 'available' | 'coming-soon';

export interface NavigationItem {
  id: string;
  label: string;
  status: ModuleStatus;
  view?: AppView;
  badge?: string;
  description?: string;
}

export interface ModuleSection {
  id: string;
  title: string;
  iconName: string;
  isCollapsible: boolean;
  defaultExpanded?: boolean;
  items: NavigationItem[];
}

/**
 * Source of truth: SMM Product Full Modules.pdf
 * Exact navigation headers and module order.
 */
export const SIDEBAR_SECTIONS: ModuleSection[] = [
  {
    id: 'home-section',
    title: 'Home',
    iconName: 'Home',
    isCollapsible: false,
    items: [
      {
        id: 'home-main',
        label: 'Home',
        status: 'available',
        view: 'home'
      }
    ]
  },
  {
    id: 'publish',
    title: 'PUBLISH',
    iconName: 'Send',
    isCollapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'composer',
        label: 'Composer',
        status: 'available',
        view: 'composer'
      },
      {
        id: 'calendar',
        label: 'Calendar',
        status: 'available',
        view: 'calendar'
      },
      {
        id: 'posts',
        label: 'Posts',
        status: 'available',
        view: 'posts'
      },
      {
        id: 'content-library',
        label: 'Content Library',
        status: 'available',
        view: 'content-library'
      },
      {
        id: 'approval',
        label: 'Approval',
        status: 'available',
        view: 'approval'
      }
    ]
  },
  {
    id: 'engage',
    title: 'ENGAGE',
    iconName: 'MessageSquare',
    isCollapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'engage-inbox',
        label: 'Inbox',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'engage-comments',
        label: 'Comments',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'engage-messages',
        label: 'Messages',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'engage-mentions',
        label: 'Mentions',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'engage-reviews',
        label: 'Reviews',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'engage-saved-replies',
        label: 'Saved Replies',
        status: 'coming-soon',
        badge: 'Soon'
      }
    ]
  },
  {
    id: 'listen',
    title: 'LISTEN',
    iconName: 'Compass',
    isCollapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'listen-overview',
        label: 'Overview',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-brand-monitoring',
        label: 'Brand Monitoring',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-keywords',
        label: 'Keywords',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-hashtags',
        label: 'Hashtags',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-competitors',
        label: 'Competitors',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-trends',
        label: 'Trends',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'listen-alerts',
        label: 'Alerts',
        status: 'coming-soon',
        badge: 'Soon'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'ANALYTICS',
    iconName: 'BarChart2',
    isCollapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'analytics-overview',
        label: 'Overview',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'analytics-publishing',
        label: 'Publishing',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'analytics-engagement',
        label: 'Engagement',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'analytics-listening',
        label: 'Listening',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'analytics-audience',
        label: 'Audience',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'analytics-reports',
        label: 'Reports',
        status: 'coming-soon',
        badge: 'Soon'
      }
    ]
  },
  {
    id: 'workspace',
    title: 'WORKSPACE',
    iconName: 'FolderKanban',
    isCollapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'workspace-social-accounts',
        label: 'Social Accounts',
        status: 'available',
        view: 'channels'
      },
      {
        id: 'workspace-team',
        label: 'Team',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'workspace-clients',
        label: 'Clients',
        status: 'coming-soon',
        badge: 'Soon'
      },
      {
        id: 'workspace-settings',
        label: 'Settings',
        status: 'coming-soon',
        badge: 'Soon'
      }
    ]
  }
];

// Backward-compatibility export for any existing legacy consumers
export const MODULES_CONFIG = SIDEBAR_SECTIONS.map(s => ({
  id: s.id,
  name: s.title,
  iconName: s.iconName,
  count: s.items.length,
  subItems: s.items.map(i => i.label),
  description: `${s.title} module operations`
}));



