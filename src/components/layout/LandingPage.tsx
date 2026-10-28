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
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import '../../styles/landing.css';

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
    <div className="landing-root">
      {/* Public Marketing Header */}
      <PublicHeader />

      {/* =========================================================================
          SECTION 1: HERO SECTION (Full width, Centered, Public)
          ========================================================================= */}
      <section
        className="hero-radial-bg"
        style={{
          padding: '100px 24px 110px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top Feature Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '9999px',
              backgroundColor: '#eef2ff',
              border: '1px solid #c7d2fe',
              color: '#4338ca',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: '28px',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)'
            }}
          >
            <Sparkles size={14} color="#4f46e5" />
            <span>SOCIAL MEDIA MANAGEMENT PLATFORM</span>
          </div>

          {/* Main Heading with Purple Gradient Accent */}
          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              color: '#0f172a',
              margin: '0 auto 24px',
              maxWidth: '880px'
            }}
          >
            Manage Your Social Media{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
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
              fontSize: 'clamp(16px, 2vw, 18px)',
              color: '#475569',
              lineHeight: 1.65,
              maxWidth: '720px',
              margin: '0 auto'
            }}
          >
            {APP_DESCRIPTION}
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 4-STEP WORKFLOW (#solutions)
          ========================================================================= */}
      <section id="solutions" style={{ padding: '96px 24px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="landing-section-eyebrow">
            SIMPLE 4-STEP WORKFLOW
          </div>
          <h2 className="landing-section-title">
            From Content to Results — All in One Place
          </h2>
          <p className="landing-section-subtitle">
            Connect your channels, create content, plan your publishing, and track your results from one organized workspace.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Card 01: Connect Channels */}
          <div className="shadcn-card" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <span
                  className="shadcn-pill-badge"
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #dbeafe'
                  }}
                >
                  01 • CONNECT
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Link2 size={18} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Connect Channels
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                Link Instagram, Facebook, LinkedIn, TikTok, and YouTube. Zero password sharing.
              </p>
            </div>

            {/* Platform Badges */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3', display: 'flex' }}>
                  <InstagramIcon size={16} color="#e1306c" />
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', display: 'flex' }}>
                  <FacebookIcon size={16} color="#1877f2" />
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f0f7ff', border: '1px solid #e0f2fe', display: 'flex' }}>
                  <LinkedinIcon size={16} color="#0a66c2" />
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex' }}>
                  <TiktokIcon size={16} color="#000000" />
                </span>
                <span style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex' }}>
                  <YoutubeIcon size={16} color="#ff0000" />
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#4f46e5' }}>
                  OAuth Simulated
                </span>
              </div>
            </div>
          </div>

          {/* Card 02: Create & Preview */}
          <div
            className="shadcn-card-highlighted"
            style={{
              justifyContent: 'space-between',
              borderColor: '#6366f1'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <span
                  className="shadcn-pill-badge"
                  style={{
                    backgroundColor: '#eef2ff',
                    color: '#4338ca',
                    border: '1px solid #c7d2fe'
                  }}
                >
                  02 • CREATE
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PenSquare size={18} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Create & Preview
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                Draft rich posts, attach media, select accounts, and preview authentic layouts across all platforms.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Rich Composer
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Media Upload
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Live Previews
                </span>
              </div>
            </div>
          </div>

          {/* Card 03: Schedule & Plan */}
          <div className="shadcn-card" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <span
                  className="shadcn-pill-badge"
                  style={{
                    backgroundColor: '#ecfeff',
                    color: '#0891b2',
                    border: '1px solid #cffafe'
                  }}
                >
                  03 • SCHEDULE
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfeff',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Calendar size={18} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Schedule & Plan
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                Pick publishing dates, view your cross-channel calendar, and auto-publish automatically.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  Visual Calendar
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  Auto-Publish
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  Time Slots
                </span>
              </div>
            </div>
          </div>

          {/* Card 04: Collaborate & Track */}
          <div className="shadcn-card" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <span
                  className="shadcn-pill-badge"
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  04 • MANAGE &amp; GROW
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUp size={18} />
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Collaborate & Track
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                Team reviews, client approvals, live publishing, and unified performance analytics.
              </p>
            </div>

            {/* Feature Pills */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  Team Approvals
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  Multi-Brand
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
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
      <section
        id="channels"
        style={{
          padding: '96px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ maxWidth: '1140px', margin: '0 auto', textAlign: 'center' }}>
          <div className="landing-section-eyebrow">
            OUR CHANNELS
          </div>
          <h2 className="landing-section-title">
            All Your Social Channels, One Simple Workflow
          </h2>
          <p className="landing-section-subtitle" style={{ marginBottom: '48px' }}>
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
            <div className="channel-pill-card">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(225, 48, 108, 0.28)'
                }}
              >
                <InstagramIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Instagram</span>
            </div>

            {/* Facebook */}
            <div className="channel-pill-card">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#1877f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(24, 119, 242, 0.28)'
                }}
              >
                <FacebookIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Facebook</span>
            </div>

            {/* LinkedIn */}
            <div className="channel-pill-card">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#0a66c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(10, 102, 194, 0.28)'
                }}
              >
                <LinkedinIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>LinkedIn</span>
            </div>

            {/* TikTok */}
            <div className="channel-pill-card">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.22)'
                }}
              >
                <TiktokIcon size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>TikTok</span>
            </div>

            {/* YouTube */}
            <div className="channel-pill-card">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#ff0000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(255, 0, 0, 0.28)'
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
      <section id="features" style={{ padding: '96px 24px', maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="landing-section-eyebrow">
            THE DIFFERENCE
          </div>
          <h2 className="landing-section-title">
            Turn Social Media Chaos Into Organized Growth
          </h2>
          <p className="landing-section-subtitle">
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
          <div className="shadcn-card" style={{ padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span
                className="shadcn-pill-badge"
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
              >
                WITHOUT CRINOID SOCIAL
              </span>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '22px', letterSpacing: '-0.02em' }}>
              Managing social media separately
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Switching between multiple platforms and tabs constantly',
                'Manually tracking content plans in scattered spreadsheets',
                'Keeping drafts and assets stored in different unorganized places',
                'Limited visibility across client accounts and brand users'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fee2e2',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}
                  >
                    <X size={13} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: With Crinoid Social */}
          <div className="shadcn-card-highlighted" style={{ padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span
                className="shadcn-pill-badge"
                style={{ backgroundColor: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
              >
                WITH CRINOID SOCIAL
              </span>
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', marginBottom: '22px', letterSpacing: '-0.02em' }}>
              Managing with Crinoid Social
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'One rich Composer with live authentic previews for all channels',
                'One single place to manage and simulate connected accounts',
                'Organized brand-based workflows with team role hierarchy',
                'A clean, robust foundation for future scheduling and analytics'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600, lineHeight: 1.5 }}>
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
      <section
        id="pricing"
        style={{
          padding: '96px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div className="landing-section-eyebrow">
              PRICING PLANS
            </div>
            <h2 className="landing-section-title">
              Simple, Transparent Pricing
            </h2>
            <p className="landing-section-subtitle" style={{ marginBottom: '12px' }}>
              Scale your social media operations with predictable pricing. Start free with a 14-day trial.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <Info size={14} />
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
                  className={isRecommended ? 'shadcn-card-highlighted' : 'shadcn-card'}
                  style={{
                    padding: '36px 30px',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Top Recommended Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '26px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span
                          className="shadcn-pill-badge"
                          style={{
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price display */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '40px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                        {plan.period}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '28px' }}>
                      {plan.billingDetail}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={handleGetStarted}
                      className={isRecommended ? 'shadcn-btn-gradient' : 'shadcn-btn-primary'}
                      style={{
                        width: '100%',
                        padding: '11px 0',
                        fontSize: '13.5px',
                        marginBottom: '32px'
                      }}
                    >
                      {plan.ctaText}
                    </button>

                    {/* Feature header */}
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                      What's included
                    </div>

                    {/* Features list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {plan.features.map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <CheckCircle2 size={15} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
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
          padding: '56px 24px',
          color: '#64748b'
        }}
      >
        <div
          style={{
            maxWidth: '1140px',
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
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {APP_NAME}
              </span>
              <span style={{ fontSize: '12.5px', color: '#94a3b8', marginLeft: '10px' }}>
                • Social Media Management Platform
              </span>
            </div>
          </div>

          {/* Marketing Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13.5px', fontWeight: 500 }}>
            <a
              href="#features"
              style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Features
            </a>
            <a
              href="#solutions"
              style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Solutions
            </a>
            <a
              href="#pricing"
              style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Pricing
            </a>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/privacy');
                setCurrentView('privacy');
              }}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0, transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/terms');
                setCurrentView('terms');
              }}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 500, cursor: 'pointer', padding: 0, transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
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
