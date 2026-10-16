import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../config/appConfig';
import { Avatar } from '../common/Avatar';
import { 
  Sparkles, 
  ChevronDown, 
  Check, 
  LogOut, 
  Menu 
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentBrand,
    brands,
    switchBrand,
    currentUser,
    logout,
    currentView,
    setCurrentView
  } = useApp();

  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Per requirement 3: Show brand selector ONLY on Composer page
  const showBrandSelector = currentView === 'composer';

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}
    >
      {/* Left: Product Logo & Brand Selector (Composer only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu hamburger toggle button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="mobile-only-btn"
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--text-secondary)',
            borderRadius: '6px'
          }}
        >
          <Menu size={20} />
        </button>

        {/* Logo & Product Name */}
        <div
          onClick={() => setCurrentView('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title={`${APP_NAME} Home`}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Sparkles size={18} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {APP_NAME}
          </span>
        </div>

        {/* Brand Selector — Displayed ONLY on Composer page */}
        {showBrandSelector && (
          <>
            <div 
              className="hide-on-mobile"
              style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} 
            />

            <div className="hide-on-mobile" style={{ position: 'relative' }}>
              <button
                type="button"
                className="brand-selector-pill"
                onClick={() => {
                  setIsBrandDropdownOpen(!isBrandDropdownOpen);
                  setIsUserDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <Avatar src={currentBrand.logo} name={currentBrand.name} size={22} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentBrand.name}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {currentBrand.users.length} Brand Users
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {isBrandDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '280px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Switch Brand
                  </div>
                  {brands.map(brand => {
                    const isSelected = brand.id === currentBrand.id;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          switchBrand(brand.id);
                          setIsBrandDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar src={brand.logo} name={brand.name} size={26} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                              {brand.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {brand.users.length} Users &bull; {brand.accounts.length} Channels
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={16} color="var(--color-primary)" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Brand User & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        <button
          type="button"
          onClick={() => {
            setIsUserDropdownOpen(!isUserDropdownOpen);
            setIsBrandDropdownOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Avatar src={currentUser?.avatar} name={currentUser?.name || 'User'} size={32} />
          <div className="hide-on-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser?.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {currentUser?.role}
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {isUserDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '220px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              zIndex: 100
            }}
          >
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {currentUser?.email}
              </div>
              <div style={{ marginTop: '4px', fontSize: '10.5px', color: 'var(--color-primary)', fontWeight: 600 }}>
                {currentUser?.role} &bull; {currentBrand.name}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--status-failed-text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left'
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
