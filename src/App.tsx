import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/layout/LandingPage';
import { LoginView } from './components/auth/LoginView';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomeView } from './components/layout/HomeView';
import { ComposerView } from './components/composer/ComposerView';
import { CreatePostView } from './components/composer/CreatePostView';
import { CalendarView } from './components/calendar/CalendarView';
import { PostsView } from './components/posts/PostsView';
import { ApprovalView } from './components/approval/ApprovalView';
import { ContentLibraryView } from './components/content-library/ContentLibraryView';
import { ConnectedChannelsView } from './components/channels/ConnectedChannelsView';
import { SimulatedAuthView } from './components/channels/SimulatedAuthView';
import { ConnectChannelsModal } from './components/channels/ConnectChannelsModal';
import { AuthCallbackView } from './components/auth/AuthCallbackView';
import { PrivacyPolicyView } from './components/legal/PrivacyPolicyView';
import { TermsOfServiceView } from './components/legal/TermsOfServiceView';
import { ToastContainer } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentView } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // =========================================================================
  // 0. OAUTH CALLBACK (Route '/auth/callback')
  // =========================================================================
  if (currentView === 'auth-callback' || window.location.pathname.includes('/auth/callback')) {
    return <AuthCallbackView />;
  }

  // =========================================================================
  // LEGAL PAGES (Route '/privacy' and '/terms')
  // =========================================================================
  if (currentView === 'privacy' || window.location.pathname.includes('/privacy')) {
    return (
      <>
        <PrivacyPolicyView />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'terms' || window.location.pathname.includes('/terms')) {
    return (
      <>
        <TermsOfServiceView />
        <ToastContainer />
      </>
    );
  }

  // =========================================================================
  // 1. PUBLIC MARKETING LANDING PAGE (Route '/')
  // Full viewport width, zero sidebar, public marketing header, no internal user/brand details
  // =========================================================================
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  // 2. DEDICATED LOGIN SCREEN (Route '/login' or unauthenticated protected access)
  if (currentView === 'login' || !isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // =========================================================================
  // 3. SIMULATED AUTH VIEW (Channel connection flow)
  // =========================================================================
  if (currentView === 'simulated-auth') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
        <Topbar />
        <SimulatedAuthView />
        <ToastContainer />
      </div>
    );
  }

  // =========================================================================
  // 4. AUTHENTICATED APPLICATION WORKSPACE (Composer, Channels, or App Home)
  // Contains authenticated sidebar, brand selector on Composer, user profile, and tools
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top Application Bar */}
      <Topbar onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />

      {/* Main Workspace Layout with Sidebar */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Left Navigation Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        {/* Dynamic Workspace Content */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff', minHeight: 0 }}>
          {currentView === 'composer' && <ComposerView />}
          {currentView === 'create-post' && <CreatePostView />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'posts' && <PostsView />}
          {currentView === 'content-library' && <ContentLibraryView />}
          {currentView === 'approval' && <ApprovalView />}
          {currentView === 'channels' && <ConnectedChannelsView />}
          {(currentView === 'home' || currentView === 'app-home') && <HomeView />}
        </main>
      </div>

      {/* Connect Channels Onboarding / Triggered Dialog */}
      <ConnectChannelsModal />

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;



