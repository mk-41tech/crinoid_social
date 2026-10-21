import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchMyYoutubeChannel } from '../../services/youtube';
import { YoutubeIcon } from '../common/SocialIcons';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const AuthCallbackView: React.FC = () => {
  const { connectAccount, showToast, setCurrentView, currentBrand } = useApp();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [channelTitle, setChannelTitle] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash.substring(1);
      const search = window.location.search.substring(1);
      const params = new URLSearchParams(hash || search);

      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (error) {
        const errorDesc = params.get('error_description') || error;
        setStatus('error');
        setErrorMessage(errorDesc);

        if (window.opener) {
          window.opener.postMessage({ type: 'YOUTUBE_AUTH_ERROR', error: errorDesc }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        } else {
          showToast('error', `YouTube authorization failed: ${errorDesc}`);
          setTimeout(() => setCurrentView('composer'), 2500);
        }
        return;
      }

      if (!accessToken) {
        setStatus('error');
        setErrorMessage('No access token returned from Google authorization.');
        if (window.opener) {
          window.opener.postMessage({ type: 'YOUTUBE_AUTH_ERROR', error: 'No access token found' }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        }
        return;
      }

      // If opened in a popup window, send token directly to main parent window
      if (window.opener) {
        setStatus('success');
        window.opener.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS', accessToken }, window.location.origin);
        setTimeout(() => window.close(), 800);
        return;
      }

      // Direct full-page redirect flow
      try {
        const channel = await fetchMyYoutubeChannel(accessToken);
        setChannelTitle(channel.title);

        await connectAccount(currentBrand.id, 'youtube', {
          username: channel.customUrl || `@${channel.title.toLowerCase().replace(/\s+/g, '')}`,
          name: channel.title,
          avatar: channel.avatarUrl,
          accessToken,
          channelId: channel.id,
          followers: channel.subscriberCount
        });

        setStatus('success');
        showToast('success', `Connected YouTube channel "${channel.title}" successfully!`);

        setTimeout(() => {
          setCurrentView('composer');
          window.location.hash = '';
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to fetch YouTube channel details.');
        showToast('error', err.message || 'Failed to fetch YouTube channel details.');
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '24px',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle, #e5e7eb)',
        borderRadius: '16px',
        padding: '36px 28px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626'
        }}>
          <YoutubeIcon size={30} />
        </div>

        {status === 'loading' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Loader2 className="animate-spin" size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Connecting YouTube Channel...
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Communicating with Google OAuth endpoints to retrieve channel permissions.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#15803d' }}>
                Authorization Successful!
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {channelTitle ? `Channel "${channelTitle}" has been linked.` : 'Returning to your workspace...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
              <AlertTriangle size={24} />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#b91c1c' }}>
                Connection Failed
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, lineHeight: 1.5, backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', width: '100%' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => {
                if (window.opener) window.close();
                else setCurrentView('composer');
              }}
              className="btn btn-secondary"
              style={{ marginTop: '8px', fontSize: '13px' }}
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
};
