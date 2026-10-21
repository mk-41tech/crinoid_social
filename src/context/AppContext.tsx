import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand, BrandUser, PostDraft, SocialPlatform, SocialAccount } from '../types';
import { MOCK_BRANDS, DUMMY_LOGIN_ACCOUNTS, BRAND_CHANNELS_CATALOG } from '../config/mockData';

interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export type AppView = 'landing' | 'login' | 'composer' | 'home' | 'channels' | 'app-home' | 'simulated-auth' | 'auth-callback' | 'privacy' | 'terms';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: BrandUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  enterDemoWorkspace: () => void;
  currentBrand: Brand;
  brands: Brand[];
  switchBrand: (brandId: string) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  draft: PostDraft;
  updateDraft: (updates: Partial<PostDraft>) => void;
  resetDraft: () => void;
  saveDraftToStorage: () => void;
  lastSavedTime: string | null;
  toasts: ToastItem[];
  showToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
  removeToast: (id: string) => void;
  // Channels and Simulated Auth
  connectedAccounts: Record<string, SocialAccount[]>;
  currentBrandAccounts: SocialAccount[];
  connectAccount: (
    brandId: string, 
    platform: SocialPlatform, 
    customData?: { username?: string; name?: string; avatar?: string; accessToken?: string; channelId?: string; followers?: string | number }
  ) => Promise<SocialAccount>;
  disconnectAccount: (brandId: string, platform: SocialPlatform) => void;
  resetBrandAccounts: (brandId: string, mode: 'clear' | 'load_defaults') => void;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  simulatedAuthPlatform: SocialPlatform | null;
  authReturnView: AppView;
  openSimulatedAuth: (platform: SocialPlatform, returnView?: AppView) => void;
  closeSimulatedAuth: () => void;
}

const STORAGE_KEY_AUTH = 'crinoid_auth_user';
const STORAGE_KEY_DRAFT = 'crinoid_active_draft';
const STORAGE_KEY_BRAND = 'crinoid_selected_brand';
const STORAGE_KEY_ACCOUNTS = 'crinoid_connected_accounts';

const createDefaultDraft = (brandId: string, initialPlatforms: SocialPlatform[] = []): PostDraft => ({
  id: 'draft-' + Date.now(),
  brandId,
  platforms: initialPlatforms,
  commonCaption: '',
  platformVariants: {
    instagram: { caption: '', hashtags: '#crinoid #innovation #social' },
    facebook: { caption: '' },
    linkedin: { caption: '' },
    youtube: { title: '', caption: '', youtubeCategory: 'Technology' }
  },
  mediaUrls: [],
  mediaType: 'image',
  altTexts: {},
  thumbnailUrl: '',
  status: 'draft',
  updatedAt: new Date().toISOString()
});

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands] = useState<Brand[]>(MOCK_BRANDS);
  
  const [currentBrandId, setCurrentBrandId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_BRAND) || MOCK_BRANDS[0].id;
  });

  // Connected accounts per brand persisted to localStorage
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, SocialAccount[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial mock brands structure
      }
    }
    // Default initial state: brand-crinoid starts with [] to demonstrate connection flow
    const initial: Record<string, SocialAccount[]> = {};
    MOCK_BRANDS.forEach(b => {
      initial[b.id] = b.accounts;
    });
    return initial;
  });

  // Save connected accounts whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  // Dynamic accounts for active brand
  const currentBrandAccounts = connectedAccounts[currentBrandId] || [];

  // Active brand with dynamic accounts injected
  const rawBrand = brands.find(b => b.id === currentBrandId) || brands[0];
  const currentBrand: Brand = {
    ...rawBrand,
    accounts: currentBrandAccounts
  };

  // Auth state
  const [currentUser, setCurrentUser] = useState<BrandUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!currentUser;
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('privacy') || hash.includes('privacy')) return 'privacy';
    if (path.includes('terms') || hash.includes('terms')) return 'terms';
    if (path.includes('auth/callback') || path.includes('callback') || hash.includes('access_token')) return 'auth-callback';
    if (path.includes('composer') || hash.includes('composer')) return 'composer';
    if (path.includes('channels') || hash.includes('channels')) return 'channels';
    if (path.includes('login') || hash.includes('login')) return 'login';
    if (path.includes('app') || hash.includes('app')) return 'app-home';
    return 'landing';
  });

  // Keep browser URL synchronized with currentView for refresh support
  useEffect(() => {
    try {
      let targetPath = '/';
      if (currentView === 'privacy') targetPath = '/privacy';
      else if (currentView === 'terms') targetPath = '/terms';
      else if (currentView === 'login') targetPath = '/login';
      else if (currentView === 'composer') targetPath = '/composer';
      else if (currentView === 'channels') targetPath = '/channels';
      else if (currentView === 'app-home') targetPath = '/app';
      else if (currentView === 'landing' || currentView === 'home') targetPath = '/';

      if (window.location.pathname !== targetPath && !window.location.pathname.startsWith('/src')) {
        window.history.replaceState({ view: currentView }, '', targetPath);
      }
    } catch {
      // Ignore in non-standard history environments
    }
  }, [currentView]);

  // Simulated Auth Navigation & Modal State
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [simulatedAuthPlatform, setSimulatedAuthPlatform] = useState<SocialPlatform | null>(null);
  const [authReturnView, setAuthReturnView] = useState<AppView>('composer');

  const openSimulatedAuth = (platform: SocialPlatform, returnView: AppView = 'composer') => {
    setSimulatedAuthPlatform(platform);
    setAuthReturnView(returnView);
    setShowConnectModal(false);
    setCurrentView('simulated-auth');
  };

  const closeSimulatedAuth = () => {
    setSimulatedAuthPlatform(null);
    setCurrentView(authReturnView);
  };

  // Draft state with local storage persistence
  const [draft, setDraft] = useState<PostDraft>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        // Fallback
      }
    }
    const initialPlatforms = currentBrandAccounts.map(a => a.platform);
    return createDefaultDraft(currentBrand.id, initialPlatforms);
  });

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Draft autosave effect (debounced 800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 800);

    return () => clearTimeout(timer);
  }, [draft]);

  const updateDraft = (updates: Partial<PostDraft>) => {
    setDraft(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const resetDraft = () => {
    const validPlatforms = currentBrandAccounts.map(a => a.platform);
    const fresh = createDefaultDraft(currentBrand.id, validPlatforms.slice(0, 2));
    setDraft(fresh);
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(fresh));
    showToast('info', 'New blank composer draft loaded');
  };

  const saveDraftToStorage = () => {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    showToast('success', 'Draft saved locally');
  };

  // Channel Connection Actions
  const connectAccount = async (
    brandId: string, 
    platform: SocialPlatform,
    customData?: { username?: string; name?: string; avatar?: string; accessToken?: string; channelId?: string; followers?: string | number }
  ): Promise<SocialAccount> => {
    const brandCatalog = BRAND_CHANNELS_CATALOG[brandId] || BRAND_CHANNELS_CATALOG['brand-crinoid'];
    const catalogItem = brandCatalog?.[platform] || {
      platform,
      name: `${currentBrand.name} ${platform.toUpperCase()}`,
      username: `@${currentBrand.name.toLowerCase().replace(/\s+/g, '')}.${platform}`,
      avatar: currentBrand.logo,
      authProfileName: currentUser?.name || 'Muthukumar',
      authProfileAvatar: currentUser?.avatar || currentBrand.logo,
      description: `${platform} Social Account`
    };

    const newAccount: SocialAccount = {
      id: `acc-${platform}-${Date.now()}`,
      platform,
      name: customData?.name || catalogItem.name,
      username: customData?.username || catalogItem.username,
      avatar: customData?.avatar || catalogItem.avatar,
      brandId,
      followers: customData?.followers !== undefined ? customData.followers : (platform === 'youtube' ? '12.4K' : undefined),
      accessToken: customData?.accessToken,
      channelId: customData?.channelId,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };

    setConnectedAccounts(prev => {
      const existing = prev[brandId] || [];
      const filtered = existing.filter(a => a.platform !== platform);
      const updated = [...filtered, newAccount];
      return {
        ...prev,
        [brandId]: updated
      };
    });

    // Make account immediately available in Composer and add to selected platforms if not present
    setDraft(prev => {
      const currentPlatforms = prev.platforms || [];
      if (!currentPlatforms.includes(platform)) {
        return {
          ...prev,
          platforms: [...currentPlatforms, platform],
          updatedAt: new Date().toISOString()
        };
      }
      return prev;
    });

    return newAccount;
  };

  const disconnectAccount = (brandId: string, platform: SocialPlatform) => {
    setConnectedAccounts(prev => {
      const existing = prev[brandId] || [];
      const updated = existing.filter(a => a.platform !== platform);
      return {
        ...prev,
        [brandId]: updated
      };
    });

    // If disconnected account was selected in Composer, remove it
    setDraft(prev => {
      const updatedPlatforms = (prev.platforms || []).filter(p => p !== platform);
      return {
        ...prev,
        platforms: updatedPlatforms,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const resetBrandAccounts = (brandId: string, mode: 'clear' | 'load_defaults') => {
    if (mode === 'clear') {
      setConnectedAccounts(prev => ({
        ...prev,
        [brandId]: []
      }));
      setDraft(prev => ({
        ...prev,
        platforms: []
      }));
      showToast('info', 'All channels disconnected for ' + currentBrand.name);
    } else {
      const brandCatalog = BRAND_CHANNELS_CATALOG[brandId] || BRAND_CHANNELS_CATALOG['brand-crinoid'];
      const defaultPlatforms: SocialPlatform[] = ['instagram', 'facebook', 'linkedin', 'youtube'];
      const newAccounts: SocialAccount[] = defaultPlatforms.map(p => {
        const item = brandCatalog[p];
        return {
          id: `acc-${p}-${Date.now()}`,
          platform: p,
          name: item.name,
          username: item.username,
          avatar: item.avatar,
          brandId,
          status: 'connected',
          connectedAt: new Date().toISOString()
        };
      });
      setConnectedAccounts(prev => ({
        ...prev,
        [brandId]: newAccounts
      }));
      setDraft(prev => ({
        ...prev,
        platforms: ['instagram', 'facebook']
      }));
      showToast('success', 'Default demo accounts loaded for ' + currentBrand.name);
    }
  };

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const matched = DUMMY_LOGIN_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPassword
    );

    if (!matched) {
      return {
        success: false,
        error: 'Invalid credentials. Please use the documented dummy credentials provided.'
      };
    }

    const user: BrandUser = {
      id: 'usr-' + matched.name.toLowerCase().replace(/\s+/g, '-'),
      name: matched.name,
      email: matched.email,
      role: matched.role as BrandUser['role'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      brandId: currentBrand.id
    };

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));

    // Check if the current brand has connected accounts
    const brandAccounts = connectedAccounts[currentBrand.id] || [];
    if (brandAccounts.length === 0) {
      // Per requirement 2: If the current brand has no connected accounts, display a simple Connect Channels dialog
      setShowConnectModal(true);
    }

    setCurrentView('composer');
    showToast('success', `Welcome back, ${user.name}!`);
    return { success: true };
  };

  const enterDemoWorkspace = () => {
    const demo = DUMMY_LOGIN_ACCOUNTS[0]; // Muthukumar
    login(demo.email, demo.password);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentView('landing');
    showToast('info', 'You have been logged out.');
  };

  const switchBrand = (brandId: string) => {
    setCurrentBrandId(brandId);
    localStorage.setItem(STORAGE_KEY_BRAND, brandId);
    const targetBrand = brands.find(b => b.id === brandId);
    if (targetBrand) {
      const targetAccounts = connectedAccounts[brandId] || [];
      const validPlatforms = targetAccounts.map(a => a.platform);
      updateDraft({ 
        brandId: targetBrand.id,
        platforms: validPlatforms.slice(0, 2)
      });
      showToast('info', `Switched active brand context to "${targetBrand.name}"`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        enterDemoWorkspace,
        currentBrand,
        brands,
        switchBrand,
        currentView,
        setCurrentView,
        draft,
        updateDraft,
        resetDraft,
        saveDraftToStorage,
        lastSavedTime,
        toasts,
        showToast,
        removeToast,
        connectedAccounts,
        currentBrandAccounts,
        connectAccount,
        disconnectAccount,
        resetBrandAccounts,
        showConnectModal,
        setShowConnectModal,
        simulatedAuthPlatform,
        authReturnView,
        openSimulatedAuth,
        closeSimulatedAuth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
