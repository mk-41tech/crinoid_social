import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

export const TermsOfServiceView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#0f172a', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* Header Bar */}
      <header style={{
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('landing');
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', fontSize: '13px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Crinoid Social</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/privacy');
              setCurrentView('privacy');
            }}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('composer');
            }}
            className="btn btn-primary btn-sm"
            style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 14px' }}
          >
            Open App
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6366f1' }}>
            Legal & Terms
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Last Updated: October 21, 2026 &bull; Effective Date: October 21, 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '14.5px', lineHeight: 1.7, color: '#334155' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Crinoid Social (<a href="https://crinoid-social-fyw2.vercel.app" style={{ color: '#4f46e5' }}>https://crinoid-social-fyw2.vercel.app</a>), you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              2. Description of Service
            </h2>
            <p>
              Crinoid Social provides content scheduling, authoring, multi-platform post composing, and video publishing tools for social networks including YouTube, Instagram, Facebook, and LinkedIn.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              3. Platform API Terms &amp; Integrations
            </h2>
            <p>
              Crinoid Social integrates directly with official social media platform APIs to enable content scheduling and publication:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>YouTube / Google:</strong> Crinoid Social utilizes YouTube API Services to allow you to upload and publish video content directly to your YouTube channel. By connecting your YouTube account, you explicitly agree to be bound by the:
                <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                  <li>
                    <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                      YouTube Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                      Google Privacy Policy
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Meta (Facebook Pages &amp; Instagram):</strong> Crinoid Social utilizes the Meta Graph API to compose and publish posts to your Facebook Pages and Instagram Professional accounts. By connecting your Meta accounts, you explicitly agree to be bound by the:
                <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                  <li>
                    <a href="https://www.facebook.com/terms.php" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                      Facebook Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="https://developers.facebook.com/terms" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                      Meta Platform Terms
                    </a>
                  </li>
                  <li>
                    <a href="https://help.instagram.com/581066165581870" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                      Instagram Terms of Use
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              4. User Responsibilities & Content Ownership
            </h2>
            <p>
              You retain full ownership of all text, images, videos, and media you create or upload through Crinoid Social. You represent and warrant that you own or possess the necessary rights, licenses, and permissions to publish any content you transmit through the Service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              5. Termination & Revocation
            </h2>
            <p>
              You may stop using Crinoid Social and disconnect your connected social accounts at any time through the application interface or via your Google Account third-party security permissions settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              6. Contact Information
            </h2>
            <p>
              For any questions regarding these Terms, contact us at: <a href="mailto:crinoidsocial@gmail.com" style={{ color: '#4f46e5' }}>crinoidsocial@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
