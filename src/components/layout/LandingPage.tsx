import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME, APP_DESCRIPTION } from '../../config/appConfig';
import { PRICING_PLANS } from '../../config/pricingConfig';
import { PublicHeader } from './PublicHeader';
import { 
  InstagramIcon, 
  FacebookIcon, 
  LinkedinIcon, 
  TiktokIcon, 
  YoutubeIcon,
  XIcon
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
  CheckCircle2,
  Play,
  PenTool,
  Users,
  BarChart2,
  Folder,
  Send,
  MousePointer2
} from 'lucide-react';
import '../../styles/landing.css';

export const LandingPage: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    if (isDemoModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsDemoModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isDemoModalOpen]);
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
          SECTION 1: HERO SECTION (ani.jpeg inspired with smooth ambient animations)
          ========================================================================= */}
      <section
        className="hero-radial-bg"
        style={{
          padding: '70px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Ambient Gradient Orbs */}
        <div className="hero-ambient-container" aria-hidden="true">
          <div className="hero-ambient-blob hero-blob-purple" />
          <div className="hero-ambient-blob hero-blob-blue" />
          <div className="hero-ambient-blob hero-blob-pink" />
        </div>

        {/* Hero Main Content Container */}
        <div style={{ maxWidth: '1320px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div 
            className="hero-two-column-layout"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '48px'
            }}
          >
            {/* Left Column: Hero Copy & Actions */}
            <div className="hero-left-col" style={{ flex: '1 1 500px', maxWidth: '580px' }}>
              {/* Top Feature Pill */}
              <div
                className="hero-pill-badge"
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
                  marginBottom: '24px',
                  boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)'
                }}
              >
                <Sparkles size={14} color="#4f46e5" />
                <span>SOCIAL MEDIA MANAGEMENT PLATFORM</span>
              </div>

              {/* Main Heading */}
              <h1
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 58px)',
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.14,
                  color: '#0f172a',
                  margin: '0 0 20px'
                }}
              >
                Manage Your Social Media{' '}
                <span style={{ color: '#2563eb' }}>
                  in One Place
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '16.5px',
                  color: '#475569',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  margin: '0 0 32px'
                }}
              >
                Plan, create, schedule, collaborate and analyze your content across all your social media channels with Crinoid Social.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="shadcn-btn-primary"
                  style={{
                    padding: '12px 28px',
                    fontSize: '15px'
                  }}
                >
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="shadcn-btn-outline"
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px'
                  }}
                  title="Watch project demonstration video"
                >
                  <Play size={14} fill="#4f46e5" color="#4f46e5" />
                  <span>Watch demo</span>
                </button>
              </div>

              {/* Horizontal Social Icons Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="Instagram">
                  <InstagramIcon size={20} color="#e1306c" />
                </span>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="Facebook">
                  <FacebookIcon size={20} color="#1877f2" />
                </span>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="X">
                  <XIcon size={17} color="#0f172a" />
                </span>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="LinkedIn">
                  <LinkedinIcon size={20} color="#0a66c2" />
                </span>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="YouTube">
                  <YoutubeIcon size={20} color="#ff0000" />
                </span>
                <span className="social-icon-badge-floating" style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }} title="TikTok">
                  <TiktokIcon size={20} color="#000000" />
                </span>
              </div>
            </div>

            {/* Right Column: Hero Mockup with Floating Cards (ani.jpeg) */}
            <div className="hero-mockup-wrapper" style={{ flex: '1 1 640px', maxWidth: '690px', position: 'relative' }}>
              
              {/* Decorative Orbital Stage with Curved Path & 5 Animated Social Icons (Task 2) */}
              <div className="hero-orbit-stage" aria-hidden="true">
                <svg width="700" height="520" viewBox="0 0 700 520" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.75 }}>
                  <ellipse cx="350" cy="260" rx="330" ry="220" stroke="url(#orbitGradient)" strokeWidth="1.5" strokeDasharray="6 8" />
                  <ellipse cx="350" cy="260" rx="280" ry="180" stroke="url(#orbitGradient2)" strokeWidth="1.2" transform="rotate(-12 350 260)" />
                  <defs>
                    <linearGradient id="orbitGradient" x1="0" y1="0" x2="700" y2="520" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a855f7" stopOpacity="0.6" />
                      <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#ec4899" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="orbitGradient2" x1="700" y1="0" x2="0" y2="520" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366f1" stopOpacity="0.5" />
                      <stop offset="0.7" stopColor="#06b6d4" stopOpacity="0.7" />
                      <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 5 Social Media Icons Travelling Along the Curved Orbit */}
                <div className="curved-orbit-icon curved-orbit-icon-1" title="Instagram">
                  <InstagramIcon size={18} color="#e1306c" />
                </div>
                <div className="curved-orbit-icon curved-orbit-icon-2" title="Facebook">
                  <FacebookIcon size={18} color="#1877f2" />
                </div>
                <div className="curved-orbit-icon curved-orbit-icon-3" title="X">
                  <XIcon size={15} color="#0f172a" />
                </div>
                <div className="curved-orbit-icon curved-orbit-icon-4" title="LinkedIn">
                  <LinkedinIcon size={18} color="#0a66c2" />
                </div>
                <div className="curved-orbit-icon curved-orbit-icon-5" title="YouTube">
                  <YoutubeIcon size={18} color="#ff0000" />
                </div>
              </div>

              {/* Floating Vertical Social Strip (Left Edge of Mockup) */}
              <div 
                className="floating-social-strip"
                style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '24%',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  padding: '8px 6px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><InstagramIcon size={16} color="#e1306c" /></span>
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FacebookIcon size={16} color="#1877f2" /></span>
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon size={14} color="#0f172a" /></span>
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkedinIcon size={16} color="#0a66c2" /></span>
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><YoutubeIcon size={16} color="#ff0000" /></span>
                <span style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TiktokIcon size={16} color="#000000" /></span>
              </div>

              {/* Floating Card 1: Adventure Post Card (Top Right) */}
              <div
                className="floating-card-post"
                style={{
                  position: 'absolute',
                  top: '-32px',
                  right: '25px',
                  zIndex: 25,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  maxWidth: '280px'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160&auto=format&fit=crop&q=80" 
                    alt="Adventure Post" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    A new adventure awaits
                  </div>
                  <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 500, margin: '2px 0 4px' }}>
                    #travel #explore #nature
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <InstagramIcon size={11} color="#e1306c" />
                    <FacebookIcon size={11} color="#1877f2" />
                    <XIcon size={10} color="#0f172a" />
                    <LinkedinIcon size={11} color="#0a66c2" />
                    <YoutubeIcon size={11} color="#ff0000" />
                  </div>
                </div>
                {/* Purple Pointer Cursor */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    right: '-12px', 
                    bottom: '-14px',
                    filter: 'drop-shadow(0 4px 8px rgba(79, 70, 229, 0.4))'
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#7c3aed">
                    <path d="M4 2l16 8-7 2-2 7z" />
                  </svg>
                </div>
              </div>

              {/* Main Product Dashboard Mockup Window */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 10px 20px -5px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 10,
                  display: 'flex'
                }}
              >
                {/* Left Mini Sidebar */}
                <div
                  style={{
                    width: '130px',
                    backgroundColor: '#fafbfc',
                    borderRight: '1px solid #f1f5f9',
                    padding: '16px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', paddingLeft: '4px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={10} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>CRINOID</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px' }}>
                    <div style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }}>Dashboard</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Calendar</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Posts</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Approvals</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Content Library</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Analytics</div>
                    <div style={{ padding: '4px 8px', color: '#64748b' }}>Settings</div>
                  </div>
                </div>

                {/* Dashboard Main View */}
                <div style={{ flex: 1, padding: '18px 20px', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>Welcome back!</h4>
                      <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>Here's what's happening with your content.</p>
                    </div>
                  </div>

                  {/* 4 Summary Stats Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1d4ed8' }}>24</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: '#3b82f6' }}>Scheduled</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#c2410c' }}>8</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: '#f97316' }}>In Review</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857' }}>12</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: '#10b981' }}>Published</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f5f3ff', border: '1px solid #ede9fe', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#6d28d9' }}>5</div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: '#8b5cf6' }}>Drafts</div>
                    </div>
                  </div>

                  {/* Upcoming Posts Section */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Upcoming Posts</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { title: 'New collection launch', time: 'Today, 10:00 AM', platform: 'fb', status: 'Scheduled', pillBg: '#eff6ff', pillColor: '#2563eb', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&auto=format&fit=crop&q=80' },
                        { title: 'Behind the scenes', time: 'Today, 2:00 PM', platform: 'fb', status: 'In Review', pillBg: '#fff7ed', pillColor: '#ea580c', img: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=100&auto=format&fit=crop&q=80' },
                        { title: 'Product showcase', time: 'Tomorrow, 9:00 AM', platform: 'li', status: 'Draft', pillBg: '#f1f5f9', pillColor: '#475569', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80' },
                        { title: 'Customer story', time: 'Tomorrow, 4:00 AM', platform: 'tt', status: 'Scheduled', pillBg: '#eff6ff', pillColor: '#2563eb', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={item.img} alt={item.title} style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                              <div style={{ fontSize: '9px', color: '#94a3b8' }}>{item.time}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.platform === 'fb' && <FacebookIcon size={12} color="#1877f2" />}
                            {item.platform === 'li' && <LinkedinIcon size={12} color="#0a66c2" />}
                            {item.platform === 'tt' && <TiktokIcon size={12} color="#000000" />}
                            <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: item.pillBg, color: item.pillColor }}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2: April 2024 Calendar (Right Side) */}
              <div
                className="floating-card-calendar"
                style={{
                  position: 'absolute',
                  right: '-38px',
                  top: '18%',
                  zIndex: 22,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  width: '180px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>April 2024</span>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>&bull;&bull;&bull;</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', fontSize: '8.5px', textAlign: 'center', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', fontSize: '9px', textAlign: 'center', color: '#334155' }}>
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                  <span style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}>8</span>
                  <span>9</span><span>10</span><span>11</span>
                  <span style={{ backgroundColor: '#ec4899', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}>12</span>
                  <span>13</span><span>14</span><span>15</span>
                  <span style={{ backgroundColor: '#38bdf8', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}>16</span>
                  <span>17</span><span>18</span><span>19</span>
                  <span style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}>20</span>
                  <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span>
                  <span style={{ backgroundColor: '#f97316', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}>28</span>
                  <span>29</span><span>30</span>
                </div>
              </div>

              {/* Floating Card 3: Total Engagement Card (Bottom Right) */}
              <div
                className="floating-card-engagement"
                style={{
                  position: 'absolute',
                  right: '-18px',
                  bottom: '-28px',
                  zIndex: 26,
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  minWidth: '220px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>Total Engagement</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>12.8K</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#16a34a' }}>&uarr; 24%</span>
                  </div>
                </div>
                {/* Mini Graph Sparkline SVG */}
                <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
                  <path d="M2 22L16 16L30 19L44 8L58 12L68 4" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Floating Button: Publish Pill Button (Bottom Left) */}
              <button
                type="button"
                onClick={handleGetStarted}
                className="floating-btn-publish"
                style={{
                  position: 'absolute',
                  left: '-8px',
                  bottom: '-16px',
                  zIndex: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Send size={14} />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* 5 Feature Cards Row below Hero (ani.jpeg) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginTop: '68px',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* Card 1: Create Engaging Content */}
            <div className="hero-feature-card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PenTool size={20} color="#ec4899" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Create</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Engaging Content</div>
              </div>
            </div>

            {/* Card 2: Schedule with Ease */}
            <div className="hero-feature-card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="#2563eb" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Schedule</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>with Ease</div>
              </div>
            </div>

            {/* Card 3: Collaborate with Your Team */}
            <div className="hero-feature-card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Collaborate</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>with Your Team</div>
              </div>
            </div>

            {/* Card 4: Analyze Performance */}
            <div className="hero-feature-card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={20} color="#0d9488" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Analyze</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Performance</div>
              </div>
            </div>

            {/* Card 5: Organize Your Assets */}
            <div className="hero-feature-card">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Folder size={20} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Organize</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Your Assets</div>
              </div>
            </div>
          </div>
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
                  className="hero-card-icon-floating"
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
                <span className="social-icon-badge-floating" style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fdf2f8', border: '1px solid #fce7f3', display: 'flex' }}>
                  <InstagramIcon size={16} color="#e1306c" />
                </span>
                <span className="social-icon-badge-floating" style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', display: 'flex' }}>
                  <FacebookIcon size={16} color="#1877f2" />
                </span>
                <span className="social-icon-badge-floating" style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f0f7ff', border: '1px solid #e0f2fe', display: 'flex' }}>
                  <LinkedinIcon size={16} color="#0a66c2" />
                </span>
                <span className="social-icon-badge-floating" style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex' }}>
                  <TiktokIcon size={16} color="#000000" />
                </span>
                <span className="social-icon-badge-floating" style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex' }}>
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
                  className="hero-card-icon-floating"
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
                  className="hero-card-icon-floating"
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
                  className="hero-card-icon-floating"
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
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="channels-ambient-container" aria-hidden="true">
          <div className="channels-ambient-blob" />
        </div>
        <div style={{ maxWidth: '1140px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
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
                      className={isRecommended ? 'shadcn-btn-primary' : 'shadcn-btn-outline'}
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

      {/* =========================================================================
          WATCH DEMO VIDEO MODAL (Task 3)
          ========================================================================= */}
      {isDemoModalOpen && (
        <div 
          className="demo-modal-overlay" 
          onClick={() => setIsDemoModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="CRINOID SOCIAL Demo Video"
        >
          <div 
            className="demo-modal-dialog" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="demo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#ffffff" />
                </div>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>CRINOID SOCIAL</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>• Platform Demonstration</span>
                </div>
              </div>
              <button
                type="button"
                className="demo-modal-close-btn"
                onClick={() => setIsDemoModalOpen(false)}
                aria-label="Close demo"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player */}
            <div className="demo-video-player-wrapper">
              <video
                src="/crinoid_social_demo.webm"
                controls
                autoPlay
                playsInline
                className="demo-video-element"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="demo-modal-footer">
              <div style={{ fontSize: '12.5px', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.5 }}>
                Demonstrating genuine CRINOID SOCIAL workflows: Unified Dashboard, Multi-Platform Composer, Content Library Integration, Publishing Calendar, and Multi-Step Approval Queue.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    handleGetStarted();
                  }}
                  className="shadcn-btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    borderRadius: '8px'
                  }}
                >
                  <span>Try It Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
