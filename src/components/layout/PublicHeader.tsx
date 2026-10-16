import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../config/appConfig';
import { Sparkles, Menu, X } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const { setCurrentView } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogIn = () => {
    setMobileMenuOpen(false);
    setCurrentView('login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px'
      }}
    >
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
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)'
          }}
        >
          <Sparkles size={18} />
        </div>
        <span
          style={{
            fontSize: '18px',
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
          gap: '32px'
        }}
      >
        <button
          type="button"
          onClick={() => scrollToSection('features')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: '#475569',
            cursor: 'pointer',
            padding: '6px 2px',
            transition: 'color 150ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
        >
          Features
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('solutions')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: '#475569',
            cursor: 'pointer',
            padding: '6px 2px',
            transition: 'color 150ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
        >
          Solutions
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('pricing')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: '#475569',
            cursor: 'pointer',
            padding: '6px 2px',
            transition: 'color 150ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
        >
          Pricing
        </button>
      </nav>

      {/* Right: Redesigned Rounded Purple-Gradient Log In Button */}
      <div
        className="hide-on-mobile"
        style={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <button
          type="button"
          onClick={handleLogIn}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.35)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
          }}
        >
          <span>Log In</span>
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
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Collapsible Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 99
          }}
        >
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('solutions')}
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            Solutions
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('pricing')}
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            Pricing
          </button>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

          <button
            type="button"
            onClick={handleLogIn}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 24px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            <span>Log In</span>
          </button>
        </div>
      )}
    </header>
  );
};
