import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand, BrandUser, PostDraft, SocialPlatform, SocialAccount } from '../types';
import { MOCK_BRANDS, DUMMY_LOGIN_ACCOUNTS, BRAND_CHANNELS_CATALOG } from '../config/mockData';
import { supabase } from '../services/supabase';

interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export type AppView = 'landing' | 'login' | 'register' | 'invite' | 'composer' | 'create-post' | 'calendar' | 'posts' | 'approval' | 'content-library' | 'home' | 'channels' | 'app-home' | 'simulated-auth' | 'auth-callback' | 'privacy' | 'terms';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: BrandUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithRealUser: (user: BrandUser, initialBrands?: Brand[]) => void;
  logout: () => void;
  enterDemoWorkspace: () => void;
  currentBrand: Brand;
  brands: Brand[];
  switchBrand: (brandId: string) => void;
  addBrand: (newBrand: Brand) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  inviteToken: string;
  setInviteToken: (token: string) => void;
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
    youtube: { title: '', caption: '', youtubeCategory: 'Technology' },
    x: { caption: '' }
  },
  mediaUrls: [],
  mediaType: 'image',
  altTexts: {},
  thumbnailUrl: '',
  status: 'draft',
  updatedAt: new Date().toISOString()
});

const DEFAULT_FALLBACK_BRAND: Brand = {
  id: 'no-brand',
  name: 'No Brand Selected',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  tagline: 'Social Media Management',
  color: '#4F46E5',
  users: [],
  accounts: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [currentBrandId, setCurrentBrandId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BRAND);
    if (saved && (saved.startsWith('brand-crinoid') || saved.startsWith('brand-nexus') || saved.startsWith('brand-horizon'))) {
      localStorage.removeItem(STORAGE_KEY_BRAND);
      return '';
    }
    return saved || '';
  });

  // Connected accounts per brand persisted to localStorage
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, SocialAccount[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Save connected accounts whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(connectedAccounts));
  }, [connectedAccounts]);

  // Dynamic accounts for active brand
  const currentBrandAccounts = connectedAccounts[currentBrandId] || [];

  // Active brand with dynamic accounts injected
  const rawBrand = brands.find(b => b.id === currentBrandId) || brands[0] || DEFAULT_FALLBACK_BRAND;
  const currentBrand: Brand = {
    ...rawBrand,
    accounts: currentBrandAccounts
  };

  // Auth state
  const [currentUser, setCurrentUser] = useState<BrandUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if user id is a valid Supabase UUID
        if (parsed?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id)) {
          return parsed;
        } else {
          localStorage.removeItem(STORAGE_KEY_AUTH);
          localStorage.removeItem(STORAGE_KEY_BRAND);
          return null;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [inviteToken, setInviteToken] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token') || '';
    } catch {
      return '';
    }
  });

  const isAuthenticated = !!currentUser;
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (search.includes('token=') || path.includes('invite')) return 'invite';
    if (path.includes('register') || hash.includes('register')) return 'register';
    if (path.includes('privacy') || hash.includes('privacy')) return 'privacy';
    if (path.includes('terms') || hash.includes('terms')) return 'terms';
    if (path.includes('auth/callback') || path.includes('callback') || hash.includes('access_token')) return 'auth-callback';
    if (path.includes('composer') || hash.includes('composer')) return 'composer';
    if (path.includes('calendar') || hash.includes('calendar')) return 'calendar';
    if (path.includes('posts') || hash.includes('posts')) return 'posts';
    if (path.includes('approval') || hash.includes('approval')) return 'approval';
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
      else if (currentView === 'calendar') targetPath = '/calendar';
      else if (currentView === 'posts') targetPath = '/posts';
      else if (currentView === 'approval') targetPath = '/approval';
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
    const brandCatalog = BRAND_CHANNELS_CATALOG[brandId];
    const catalogItem = brandCatalog?.[platform] || {
      platform,
      name: `${currentBrand.name} ${platform.toUpperCase()}`,
      username: `@${currentBrand.name.toLowerCase().replace(/\s+/g, '')}.${platform}`,
      avatar: currentBrand.logo,
      authProfileName: currentUser?.name || 'User',
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
      const brandCatalog = BRAND_CHANNELS_CATALOG[brandId];
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

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || 'Invalid credentials. Please verify your email and password.' };
      }

      // Fetch user profile from public.users
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      const isOrgAdmin = userProfile?.is_org_admin === true;

      // Fetch user's permitted brands strictly from Supabase
      let userBrands: Brand[] = [];
      let assignedRole = isOrgAdmin ? 'Brand Director' : 'Content Creator';

      if (isOrgAdmin) {
        const { data: allDbBrands } = await supabase
          .from('brands')
          .select('*, brand_members(*)')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        userBrands = (allDbBrands || []).map(b => ({
          id: b.id,
          name: b.name,
          logo: b.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          tagline: b.brand_description || 'Active Brand',
          color: b.brand_color || '#4f46e5',
          users: (b.brand_members || []).map((m: any) => ({
            id: m.user_id,
            name: m.role,
            email: '',
            role: m.role,
            avatar: '',
            brandId: b.id
          })),
          accounts: []
        }));
      } else {
        const { data: memberships } = await supabase
          .from('brand_members')
          .select('brand_id, role, brands(*)')
          .eq('user_id', authData.user.id)
          .eq('status', 'active');

        if (memberships && memberships.length > 0) {
          assignedRole = memberships[0].role;
          userBrands = memberships
            .map((m: any) => m.brands)
            .filter(Boolean)
            .map((b: any) => ({
              id: b.id,
              name: b.name,
              logo: b.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
              tagline: b.brand_description || 'Active Brand',
              color: b.brand_color || '#4f46e5',
              users: [],
              accounts: []
            }));
        } else {
          // Check if user has a pending join request awaiting admin approval
          const { data: pendingRequests } = await supabase
            .from('brand_members')
            .select('brand_id, role, brands(name)')
            .eq('user_id', authData.user.id)
            .eq('status', 'pending_approval');

          // Log out immediately
          await supabase.auth.signOut();

          if (pendingRequests && pendingRequests.length > 0) {
            const requestedBrand = (pendingRequests[0].brands as any)?.name || 'the brand';
            return {
              success: false,
              error: `Your request to join "${requestedBrand}" is pending Admin approval. You will be able to log in once an administrator assigns your role and approves your access.`
            };
          }
          return {
            success: false,
            error: 'Access restricted: You do not currently belong to any active brand. Please contact your administrator.'
          };
        }
      }

      const primaryBrand = userBrands[0] || null;

      loginWithRealUser({
        id: authData.user.id,
        name: userProfile?.full_name || authData.user.email?.split('@')[0] || 'User',
        email: authData.user.email || cleanEmail,
        role: assignedRole as any,
        avatar: userProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        brandId: primaryBrand?.id || ''
      }, userBrands);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  const loginWithRealUser = (user: BrandUser, initialBrands?: Brand[]) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));

    if (initialBrands && initialBrands.length > 0) {
      setBrands(initialBrands);
      setCurrentBrandId(initialBrands[0].id);
      localStorage.setItem(STORAGE_KEY_BRAND, initialBrands[0].id);
    }

    setCurrentView('composer');
    showToast('success', `Welcome, ${user.name}!`);
  };

  const enterDemoWorkspace = () => {
    showToast('info', 'Please sign up or log in with your Supabase credentials.');
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_BRAND);
    setBrands([]);
    setCurrentBrandId('');
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

  const addBrand = (newBrand: Brand) => {
    setBrands((prev: Brand[]) => {
      if (prev.some((b: Brand) => b.id === newBrand.id)) return prev;
      return [newBrand, ...prev];
    });
    setCurrentBrandId(newBrand.id);
    localStorage.setItem(STORAGE_KEY_BRAND, newBrand.id);
    updateDraft({
      brandId: newBrand.id,
      platforms: []
    });
    showToast('success', `Active brand set to "${newBrand.name}"`);
  };

  // Automatically load database brands strictly for the authenticated user
  useEffect(() => {
    const loadUserBrandsFromDb = async () => {
      if (!currentUser?.id) {
        setBrands([]);
        return;
      }

      // Check if user ID is a valid Supabase UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
      if (!isUuid) {
        console.warn('Stale non-UUID session detected, resetting:', currentUser.id);
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEY_AUTH);
        localStorage.removeItem(STORAGE_KEY_BRAND);
        setBrands([]);
        return;
      }

      try {
        // 1. Check if user is Org Admin
        const { data: userProfile } = await supabase
          .from('users')
          .select('is_org_admin')
          .eq('id', currentUser.id)
          .maybeSingle();

        const isOrgAdmin = userProfile?.is_org_admin === true || (currentUser as any)?.is_org_admin === true;

        let userBrands: Brand[] = [];

        if (isOrgAdmin) {
          // Org Admin sees all active database brands
          const { data: allBrands } = await supabase
            .from('brands')
            .select('*, brand_members(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          userBrands = (allBrands || []).map(b => ({
            id: b.id,
            name: b.name,
            logo: b.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            tagline: b.brand_description || 'Active Brand',
            color: b.brand_color || '#4f46e5',
            users: (b.brand_members || []).map((m: any) => ({
              id: m.user_id,
              name: m.role,
              email: '',
              role: m.role,
              avatar: '',
              brandId: b.id
            })),
            accounts: []
          }));
        } else {
          // Regular user / Brand Admin: STRICTLY only brands they belong to in brand_members
          const { data: memberships } = await supabase
            .from('brand_members')
            .select('brand_id, role, brands(*, brand_members(*))')
            .eq('user_id', currentUser.id)
            .eq('status', 'active');

          if (memberships && memberships.length > 0) {
            userBrands = memberships
              .map((m: any) => m.brands)
              .filter(Boolean)
              .map((b: any) => ({
                id: b.id,
                name: b.name,
                logo: b.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
                tagline: b.brand_description || 'Active Brand',
                color: b.brand_color || '#4f46e5',
                users: (b.brand_members || []).map((m: any) => ({
                  id: m.user_id,
                  name: m.role,
                  email: '',
                  role: m.role,
                  avatar: '',
                  brandId: b.id
                })),
                accounts: []
              }));
          }
        }

        setBrands(userBrands);

        // Ensure active brand is valid for this user
        if (userBrands.length > 0) {
          if (!userBrands.some(b => b.id === currentBrandId)) {
            setCurrentBrandId(userBrands[0].id);
            localStorage.setItem(STORAGE_KEY_BRAND, userBrands[0].id);
          }
        } else if (!isOrgAdmin) {
          // If a non-org admin user has 0 active brands, log them out completely
          const { data: pending } = await supabase
            .from('brand_members')
            .select('id, brand_id, brands(name)')
            .eq('user_id', currentUser.id)
            .eq('status', 'pending_approval');

          try {
            await supabase.auth.signOut();
          } catch {}
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEY_AUTH);
          localStorage.removeItem(STORAGE_KEY_BRAND);
          setBrands([]);
          setCurrentBrandId('');
          setCurrentView('login');
          if (pending && pending.length > 0) {
            showToast('error', `Your join request for "${(pending[0].brands as any)?.name || 'the brand'}" is awaiting Admin approval.`);
          } else {
            showToast('error', 'Access restricted: You do not have access to any active brand.');
          }
          return;
        } else {
          setCurrentBrandId('');
          localStorage.removeItem(STORAGE_KEY_BRAND);
        }
      } catch (err) {
        console.warn('Error loading user brands from Supabase:', err);
      }
    };

    loadUserBrandsFromDb();
  }, [currentUser?.id]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        loginWithRealUser,
        logout,
        enterDemoWorkspace,
        currentBrand,
        brands,
        switchBrand,
        addBrand,
        currentView,
        setCurrentView,
        inviteToken,
        setInviteToken,
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



