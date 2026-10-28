import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../config/appConfig';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import '../../styles/landing.css';

export const PublicHeader: React.FC = () => {
  const { setCurrentView, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogIn = () => {
    if (isAuthenticated) {
      setCurrentView('composer');
    } else {
      setCurrentView('login');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="public-header-root">
      <div className="public-header-container">
        {/* Left: Brand Identity */}
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentView('landing');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          title={`${APP_NAME} Home`}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Sparkles size={16} />
          </div>
          <span
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em'
            }}
          >
            {APP_NAME}
          </span>
        </div>

        {/* Center: Marketing Navigation Links (Desktop) */}
        <nav
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('features')}
          >
            Features
          </button>

          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('solutions')}
          >
            Solutions
          </button>

          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('pricing')}
          >
            Pricing
          </button>
        </nav>

        {/* Right: Shadcn Log In Button */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={handleLogIn}
            className="shadcn-btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              borderRadius: '8px'
            }}
          >
            <span>Log In</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-only-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: '#0f172a'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '68px',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 99
          }}
        >
          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('features')}
            style={{ textAlign: 'left', width: '100%', padding: '10px 12px' }}
          >
            Features
          </button>
          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('solutions')}
            style={{ textAlign: 'left', width: '100%', padding: '10px 12px' }}
          >
            Solutions
          </button>
          <button
            type="button"
            className="shadcn-nav-link"
            onClick={() => scrollToSection('pricing')}
            style={{ textAlign: 'left', width: '100%', padding: '10px 12px' }}
          >
            Pricing
          </button>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

          <button
            type="button"
            onClick={handleLogIn}
            className="shadcn-btn-primary"
            style={{ width: '100%', padding: '10px 0' }}
          >
            <span>Log In</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </header>
  );
};
