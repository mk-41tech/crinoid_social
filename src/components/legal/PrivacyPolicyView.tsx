import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
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
              window.history.pushState({}, '', '/terms');
              setCurrentView('terms');
            }}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Terms of Service
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
            Legal & Compliance
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Last Updated: October 21, 2026 &bull; Effective Date: October 21, 2026
          </p>
        </div>

        {/* Highlights Banner */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '14px' }}>
            <Lock size={16} color="#4f46e5" />
            <span>Our Privacy Commitment</span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Crinoid Social values your privacy. We strictly access and process only the minimal data required to manage and publish your content to social channels. We do not sell, rent, or monetize your personal or account data to third parties.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '14.5px', lineHeight: 1.7, color: '#334155' }}>
          {/* Section 1 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              1. Overview
            </h2>
            <p>
              Crinoid Social ("we," "our," or "the Service") operates the social media publishing and management platform accessible at <a href="https://crinoid-social-fyw2.vercel.app" style={{ color: '#4f46e5' }}>https://crinoid-social-fyw2.vercel.app</a>. This Privacy Policy details how we collect, use, store, and protect information when you use our web application and connect third-party social media accounts, including YouTube, Facebook, Instagram, and LinkedIn.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              2. Information We Collect
            </h2>
            <p>We collect the following types of information when you interact with our platform:</p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <li>
                <strong>Account & Profile Information:</strong> Basic identifying data such as your name, email address (<a href="mailto:crinoidsocial@gmail.com" style={{ color: '#4f46e5' }}>crinoidsocial@gmail.com</a>), and chosen brand preferences.
              </li>
              <li>
                <strong>Content & Drafts:</strong> Text copy, video files, images, scheduling times, and platform variant settings created within the Crinoid Social Composer.
              </li>
              <li>
                <strong>Google & YouTube User Data:</strong> When you connect a YouTube channel using Google OAuth 2.0, we request permission to access:
                <ul style={{ paddingLeft: '20px', marginTop: '6px', listStyleType: 'circle' }}>
                  <li><code>https://www.googleapis.com/auth/youtube.readonly</code>: To retrieve your channel name, channel avatar, handle, and subscriber statistics to display in the Connected Channels dashboard.</li>
                  <li><code>https://www.googleapis.com/auth/youtube.upload</code>: To upload videos, titles, and descriptions that you explicitly initiate from the Composer to your connected YouTube channel.</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              3. Google API Services User Data Policy Compliance
            </h2>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', fontSize: '13.5px' }}>
                Limited Use Disclosure:
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#1e3a8a', lineHeight: 1.55 }}>
                Crinoid Social's use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Google API Services User Data Policy</a>, including the Limited Use requirements.
              </p>
            </div>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>We only use Google/YouTube data to provide user-facing social management and video publishing functionality.</li>
              <li>We do not transfer or share your Google user data with any third-party advertisers, data brokers, or information resellers.</li>
              <li>We do not use Google user data to serve targeted advertisements.</li>
              <li>We do not use Google user data for training generalized artificial intelligence or machine learning models.</li>
              <li>No humans read your private Google data unless you explicitly request customer support assistance or it is strictly required by law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              4. How Your Data is Used
            </h2>
            <p>We use the data collected strictly for the following purposes:</p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <li>To authenticate your identity and authorized social accounts.</li>
              <li>To display your connected channel profiles, names, handles, and avatars in the application interface.</li>
              <li>To transmit video files and publication metadata directly to YouTube's Data API when you click "Publish Now".</li>
              <li>To display real-time upload progress and generate the live YouTube watch URL upon successful upload.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              5. Data Storage, Retention & Security
            </h2>
            <p>
              OAuth authorization tokens are stored securely in your authenticated browser storage using industry-standard encryption protocols. All communications between Crinoid Social, your browser, and Google's OAuth/API servers occur exclusively over encrypted HTTPS/TLS connections.
            </p>
            <p style={{ marginTop: '10px' }}>
              We retain token credentials only as long as you maintain the account connection in Crinoid Social. We do not store copies of your published video files on our servers after upload completion.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              6. How to Disconnect and Delete Your Data
            </h2>
            <p>You have complete control over your connected accounts and data at all times:</p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <li>
                <strong>In Crinoid Social:</strong> Navigate to <em>Connected Channels</em> and click <strong>Disconnect</strong> on the YouTube account card. This immediately purges the OAuth access token from your session and disconnects the channel.
              </li>
              <li>
                <strong>Via Google Security Settings:</strong> You can revoke Crinoid Social's access directly at any time by visiting the official Google Account permissions page:
                <div style={{ marginTop: '6px' }}>
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <span>Google Third-Party Account Access Settings</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </li>
              <li>
                <strong>Data Deletion Requests:</strong> You can contact us at <a href="mailto:crinoidsocial@gmail.com" style={{ color: '#4f46e5' }}>crinoidsocial@gmail.com</a> to request immediate deletion of any associated account records.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              7. Third-Party Services
            </h2>
            <p>
              Crinoid Social integrates with YouTube API Services. By using our YouTube integration, you are also agreeing to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>YouTube Terms of Service</a> and Google's Privacy Policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>https://policies.google.com/privacy</a>.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              8. Contact Us
            </h2>
            <p>
              If you have any questions, feedback, or concerns regarding this Privacy Policy or our data handling practices, please contact our privacy team at:
            </p>
            <div style={{ marginTop: '8px', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>Application Name:</strong> Crinoid Social</div>
              <div><strong>Contact Email:</strong> <a href="mailto:crinoidsocial@gmail.com" style={{ color: '#4f46e5' }}>crinoidsocial@gmail.com</a></div>
              <div><strong>Website:</strong> <a href="https://crinoid-social-fyw2.vercel.app" style={{ color: '#4f46e5' }}>https://crinoid-social-fyw2.vercel.app</a></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
