import React from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME, APP_DESCRIPTION } from '../../config/appConfig';
import { PRICING_PLANS } from '../../config/pricingConfig';
import { PublicHeader } from './PublicHeader';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  TiktokIcon, 
  YoutubeIcon 
} from '../common/SocialIcons';
import { 
  Sparkles, 
  Link2, 
  PenSquare, 
  Calendar, 
  TrendingUp, 
  Check, 
  X, 
  Info,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, enterDemoWorkspace, isAuthenticated } = useApp();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView('composer');
    } else {
      enterDemoWorkspace();
    }
  };

  const handleLogIn = () => {
    if (isAuthenticated) {
      setCurrentView('composer');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Public Marketing Header */}
      <PublicHeader />

      {/* =========================================================================
          SECTION 1: HERO SECTION (Full width, Centered, Public)
          ========================================================================= */}
      <section
        style={{
          padding: '80px 24px 88px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(238, 242, 255, 0.8) 0%, rgba(255, 255, 255, 1) 75%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        {/* Top Feature Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            color: '#6366f1',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '26px',
            boxShadow: '0 1px 3px rgba(99, 102, 241, 0.08)'
          }}
        >
          <Sparkles size={14} color="#6366f1" />
          <span>SOCIAL MEDIA MANAGEMENT PLATFORM</span>
        </div>

        {/* Main Heading with Purple Gradient Accent */}
        <h1
          style={{
            fontSize: 'clamp(34px, 5.5vw, 60px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: '#0f172a',
            margin: '0 auto 20px',
            maxWidth: '860px'
          }}
        >
          Manage Your Social Media{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            From One Simple Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 17.5px)',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '700px',
            margin: '0 auto'
          }}
        >
          {APP_DESCRIPTION}
        </p>
      </section>


      {/* =========================================================================
          SECTION 2: 4-STEP WORKFLOW (#solutions)
          ========================================================================= */}
      <section id="solutions" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#6366f1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            SIMPLE 4-STEP WORKFLOW
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0f172a',
              margin: '0 0 12px'
            }}
          >
            From Content to Results — All in One Place
          </h2>
          <p style={{ fontSize: '15.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
            Connect your channels, create content, plan your publishing, and track your results from one organized workspace.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Card 01: Connect Channels */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb'
                  }}
                >
                  01 &bull; CONNECT
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Link2 size={16} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Connect Channels
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Link Instagram, Facebook, LinkedIn, TikTok, and YouTube. Zero password sharing.
              </p>
            </div>

            {/* Platform Badges */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '5px', borderRadius: '6px', backgroundColor: '#fdf2f8', display: 'flex' }}>
                  <InstagramIcon size={15} color="#e1306c" />
                </span>
                <span style={{ padding: '5px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex' }}>
                  <FacebookIcon size={15} color="#1877f2" />
                </span>
                <span style={{ padding: '5px', borderRadius: '6px', backgroundColor: '#f0f7ff', display: 'flex' }}>
                  <LinkedinIcon size={15} color="#0a66c2" />
                </span>
                <span style={{ padding: '5px', borderRadius: '6px', backgroundColor: '#f4f4f5', display: 'flex' }}>
                  <TiktokIcon size={15} color="#000000" />
                </span>
                <span style={{ padding: '5px', borderRadius: '6px', backgroundColor: '#fef2f2', display: 'flex' }}>
                  <YoutubeIcon size={15} color="#ff0000" />
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#6366f1' }}>
                  OAuth Simulated
                </span>
              </div>
            </div>
          </div>

          {/* Card 02: Create & Preview */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #818cf8',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.12)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5'
                  }}
                >
                  02 &bull; CREATE
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PenSquare size={16} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Create & Preview
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Draft rich posts, attach media, select accounts, and preview authentic layouts across all platforms.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Rich Composer
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Media Upload
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Live Previews
                </span>
              </div>
            </div>
          </div>

          {/* Card 03: Schedule & Plan */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#ecfeff',
                    color: '#0891b2'
                  }}
                >
                  03 &bull; SCHEDULE
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfeff',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Calendar size={16} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Schedule & Plan
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Pick publishing dates, view your cross-channel calendar, and auto-publish automatically.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Visual Calendar
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Auto-Publish
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Time Slots
                </span>
              </div>
            </div>
          </div>

          {/* Card 04: Collaborate & Track */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669'
                  }}
                >
                  04 &bull; MANAGE &amp; GROW
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUp size={16} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Collaborate & Track
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Team reviews, client approvals, live publishing, and unified performance analytics.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Team Approvals
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Multi-Brand
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                  Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 3: SUPPORTED SOCIAL CHANNELS (#channels)
          ========================================================================= */}
      <section id="channels" style={{ padding: '80px 24px', backgroundColor: '#fbfbfe', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#6366f1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            OUR CHANNELS
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0f172a',
              margin: '0 0 12px'
            }}
          >
            All Your Social Channels, One Simple Workflow
          </h2>
          <p style={{ fontSize: '15.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto 44px' }}>
            Connect the platforms that matter most and manage them all from a single unified dashboard.
          </p>

          {/* 5 Channel Cards */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            {/* Instagram */}
            <div
              style={{
                width: '160px',
                padding: '28px 18px',
                borderRadius: '16px',
                backgroundColor: '#fdf2f8',
                border: '1px solid #fce7f3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(225, 48, 108, 0.05)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)'
                }}
              >
                <InstagramIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Instagram</span>
            </div>

            {/* Facebook */}
            <div
              style={{
                width: '160px',
                padding: '28px 18px',
                borderRadius: '16px',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(24, 119, 242, 0.05)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#1877f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
                }}
              >
                <FacebookIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Facebook</span>
            </div>

            {/* LinkedIn */}
            <div
              style={{
                width: '160px',
                padding: '28px 18px',
                borderRadius: '16px',
                backgroundColor: '#f0f7ff',
                border: '1px solid #e0f2fe',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(10, 102, 194, 0.05)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#0a66c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(10, 102, 194, 0.3)'
                }}
              >
                <LinkedinIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>LinkedIn</span>
            </div>

            {/* TikTok */}
            <div
              style={{
                width: '160px',
                padding: '28px 18px',
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <TiktokIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>TikTok</span>
            </div>

            {/* YouTube */}
            <div
              style={{
                width: '160px',
                padding: '28px 18px',
                borderRadius: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 6px rgba(255, 0, 0, 0.05)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#ff0000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
                }}
              >
                <YoutubeIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>YouTube</span>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 4: THE DIFFERENCE / BENEFITS (#features)
          ========================================================================= */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#6366f1',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            THE DIFFERENCE
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0f172a',
              margin: '0 0 12px'
            }}
          >
            Turn Social Media Chaos Into Organized Growth
          </h2>
          <p style={{ fontSize: '15.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
            See how Crinoid Social replaces fragmented tools with one structured, reliable command center.
          </p>
        </div>

        {/* Two-Column Comparison */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Left Column: Without Crinoid Social */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '32px 28px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                WITHOUT CRINOID SOCIAL
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>
              Managing social media separately
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Switching between multiple platforms and tabs constantly',
                'Manually tracking content plans in scattered spreadsheets',
                'Keeping drafts and assets stored in different unorganized places',
                'Limited visibility across client accounts and brand users'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.45 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: With Crinoid Social */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #818cf8',
              padding: '32px 28px',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.12)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                WITH CRINOID SOCIAL
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '18px' }}>
              Managing with Crinoid Social
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'One rich Composer with live authentic previews for all channels',
                'One single place to manage and simulate connected accounts',
                'Organized brand-based workflows with team role hierarchy',
                'A clean, robust foundation for future scheduling and analytics'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500, lineHeight: 1.45 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 5: PRICING PLANS (#pricing)
          ========================================================================= */}
      <section id="pricing" style={{ padding: '80px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#6366f1',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              PRICING PLANS
            </div>
            <h2
              style={{
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0f172a',
                margin: '0 0 12px'
              }}
            >
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '15.5px', color: '#64748b', maxWidth: '640px', margin: '0 auto 12px' }}>
              Scale your social media operations with predictable pricing. Start free with a 14-day trial.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <Info size={13} />
              <span>Sample pricing — demo only. Fully configurable plans.</span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'stretch'
            }}
          >
            {PRICING_PLANS.map((plan) => {
              const isRecommended = plan.highlighted;

              return (
                <div
                  key={plan.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: isRecommended ? '2px solid #818cf8' : '1px solid #e2e8f0',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isRecommended 
                      ? '0 10px 25px -5px rgba(99, 102, 241, 0.15)' 
                      : '0 2px 8px rgba(15, 23, 42, 0.04)',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Top Recommended Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '26px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669'
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price display */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '38px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                        {plan.period}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>
                      {plan.billingDetail}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleGetStarted}
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '28px',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {plan.ctaText}
                    </button>

                    {/* Feature header */}
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px' }}>
                      What's included
                    </div>

                    {/* Features list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {plan.features.map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#6366f1', flexShrink: 0 }} />
                          <span style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PUBLIC MARKETING FOOTER
          ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '48px 24px',
          color: '#64748b'
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}
        >
          {/* Logo & Product info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {APP_NAME}
              </span>
              <span style={{ fontSize: '12.5px', color: '#94a3b8', marginLeft: '10px' }}>
                &bull; Social Media Management Platform
              </span>
            </div>
          </div>

          {/* Marketing Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', fontSize: '13.5px', fontWeight: 500 }}>
            <a
              href="#features"
              style={{ color: '#475569', textDecoration: 'none' }}
            >
              Features
            </a>
            <a
              href="#solutions"
              style={{ color: '#475569', textDecoration: 'none' }}
            >
              Solutions
            </a>
            <a
              href="#pricing"
              style={{ color: '#475569', textDecoration: 'none' }}
            >
              Pricing
            </a>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/privacy');
                setCurrentView('privacy');
              }}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0 }}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/terms');
                setCurrentView('terms');
              }}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0 }}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={handleLogIn}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Log In
            </button>
          </div>

          {/* Dynamic Copyright */}
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
