import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SIDEBAR_SECTIONS, NavigationItem } from '../../config/modulesConfig';
import { 
  Home, 
  Send, 
  MessageSquare, 
  Compass, 
  BarChart2, 
  FolderKanban, 
  ChevronDown, 
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentView, setCurrentView, showToast, currentBrand } = useApp();

  // Track section currently hovered on desktop
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Track sections explicitly pinned open by user click
  const [pinnedModules, setPinnedModules] = useState<Record<string, boolean>>({
    publish: true
  });

  // Automatically keep parent section pinned when active page changes
  useEffect(() => {
    if (currentView === 'composer' || currentView === 'create-post' || currentView === 'calendar' || currentView === 'posts' || currentView === 'approval') {
      setPinnedModules(prev => ({ ...prev, publish: true }));
    } else if (currentView === 'channels') {
      setPinnedModules(prev => ({ ...prev, workspace: true }));
    }
  }, [currentView]);

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home size={16} />;
      case 'Send': return <Send size={16} />;
      case 'MessageSquare': return <MessageSquare size={16} />;
      case 'Compass': return <Compass size={16} />;
      case 'BarChart2': return <BarChart2 size={16} />;
      case 'FolderKanban': return <FolderKanban size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  // Determine if a section is required by the active page (cannot be closed while active)
  const isRequiredByActivePage = (sectionId: string): boolean => {
    if (sectionId === 'publish' && (currentView === 'composer' || currentView === 'create-post' || currentView === 'calendar' || currentView === 'posts' || currentView === 'approval')) return true;
    if (sectionId === 'workspace' && currentView === 'channels') return true;
    return false;
  };

  // Determine if a section should be expanded
  const isSectionExpanded = (sectionId: string): boolean => {
    // 1. Active page requirement takes precedence
    if (isRequiredByActivePage(sectionId)) return true;

    // 2. Hover opens the submenu dynamically
    if (hoveredModule === sectionId) return true;

    // 3. User clicked/pinned state
    return !!pinnedModules[sectionId];
  };

  const handleSectionHeaderClick = (sectionId: string, isCollapsible: boolean) => {
    if (!isCollapsible) {
      // Direct navigation for non-collapsible sections like Home
      setCurrentView('home');
      if (onCloseMobile) onCloseMobile();
      return;
    }

    // If required by active page, preserve open state
    if (isRequiredByActivePage(sectionId)) {
      return;
    }

    // Toggle pinned state independently of hover
    setPinnedModules(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string, isCollapsible: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSectionHeaderClick(sectionId, isCollapsible);
    }
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.status === 'available') {
      if (item.view) {
        setCurrentView(item.view);
        if (onCloseMobile) onCloseMobile();
      }
    } else {
      showToast('info', `${item.label} is planned for an upcoming release.`);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 95
          }}
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--topbar-height))',
          position: 'sticky',
          top: 'var(--topbar-height)',
          zIndex: 80,
          flexShrink: 0
        }}
      >
        {/* Mobile Header with Close button */}
        {isMobileOpen && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Navigation Modules Scroll Container */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px 12px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px' 
          }}
        >
          {SIDEBAR_SECTIONS.map((section) => {
            const isExpanded = isSectionExpanded(section.id);
            const isHome = section.id === 'home-section';
            const isCurrentHomeActive = isHome && currentView === 'home';

            return (
              <div
                key={section.id}
                onMouseEnter={() => setHoveredModule(section.id)}
                onMouseLeave={() => setHoveredModule(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {/* Section Header Button */}
                <button
                  type="button"
                  onClick={() => handleSectionHeaderClick(section.id, section.isCollapsible)}
                  onKeyDown={(e) => handleKeyDown(e, section.id, section.isCollapsible)}
                  aria-expanded={section.isCollapsible ? isExpanded : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isCurrentHomeActive
                      ? 'var(--color-primary-light)'
                      : hoveredModule === section.id
                        ? '#f8fafc'
                        : 'transparent',
                    color: isCurrentHomeActive
                      ? 'var(--color-primary)'
                      : 'var(--text-primary)',
                    fontWeight: isCurrentHomeActive ? 700 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 150ms ease',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span 
                      style={{ 
                        color: isCurrentHomeActive 
                          ? 'var(--color-primary)' 
                          : 'var(--color-primary-mid)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {getSectionIcon(section.iconName)}
                    </span>
                    <span style={{ letterSpacing: section.isCollapsible ? '0.02em' : 'normal' }}>
                      {section.title}
                    </span>
                  </div>

                  {section.isCollapsible && (
                    <ChevronDown
                      size={14}
                      style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 200ms ease',
                        color: 'var(--text-light)'
                      }}
                    />
                  )}
                </button>

                {/* Submenu Accordion Container */}
                {section.isCollapsible && (
                  <div
                    style={{
                      maxHeight: isExpanded ? '400px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      paddingLeft: '14px',
                      marginLeft: '12px',
                      borderLeft: '1px solid #e2e8f0',
                      marginTop: isExpanded ? '2px' : '0px',
                      marginBottom: isExpanded ? '4px' : '0px'
                    }}
                  >
                    {section.items.map((item) => {
                      const isItemActive = 
                        (item.view === currentView) ||
                        (item.view === 'composer' && (currentView === 'composer' || currentView === 'create-post')) ||
                        (item.view === 'channels' && currentView === 'channels') ||
                        (item.view === 'home' && currentView === 'home');

                      const isAvailable = item.status === 'available';

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          disabled={!isAvailable}
                          title={!isAvailable ? `${item.label} (Coming soon)` : item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isItemActive
                              ? 'var(--color-primary-light)'
                              : 'transparent',
                            color: isItemActive
                              ? 'var(--color-primary)'
                              : isAvailable
                                ? 'var(--text-secondary)'
                                : 'var(--text-light)',
                            fontWeight: isItemActive ? 600 : 500,
                            fontSize: '12.5px',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 120ms ease',
                            opacity: isAvailable ? 1 : 0.75
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>

                          {!isAvailable && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#94a3b8',
                                letterSpacing: '0.02em',
                                flexShrink: 0
                              }}
                            >
                              Soon
                            </span>
                          )}

                          {isItemActive && (
                            <span 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--color-primary)',
                                flexShrink: 0 
                              }} 
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {currentBrand.name}
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontWeight: 600
              }}
            >
              Active Brand
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
            {currentBrand.accounts.length} Connected {currentBrand.accounts.length === 1 ? 'Channel' : 'Channels'}
          </span>
        </div>
      </aside>
    </>
  );
};



