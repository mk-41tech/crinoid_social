/**
 * YouTube Data API v3 & Google OAuth 2.0 Client Service
 * Handles:
 * 1. OAuth 2.0 authorization URL & popup/redirect for user YouTube channel authentication
 * 2. Channel metadata retrieval (channel name, custom URL, subscriber count, avatar)
 * 3. Video upload to user's connected YouTube channel via Resumable Upload API
 * 
 * Note: Credentials are read dynamically from import.meta.env.VITE_YOUTUBE_CLIENT_ID.
 * If blank in .env, isYoutubeConfigured() returns false and clear instructions are provided.
 */

export const YOUTUBE_CLIENT_ID = (import.meta.env.VITE_YOUTUBE_CLIENT_ID || '').trim();

export const isYoutubeConfigured = (): boolean => {
  return YOUTUBE_CLIENT_ID.length > 0;
};

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

export interface YoutubeChannelInfo {
  id: string;
  title: string;
  customUrl?: string;
  avatarUrl: string;
  subscriberCount: number;
  videoCount: number;
}

export interface UploadVideoParams {
  accessToken: string;
  file: File | Blob;
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
  onProgress?: (percent: number) => void;
}

export interface UploadVideoResult {
  id: string;
  url: string;
  title: string;
  publishedAt: string;
  privacyStatus: string;
}

/**
 * Builds the official Google OAuth 2.0 consent URL for YouTube
 */
export const getYoutubeOAuthUrl = (state?: string): string => {
  if (!isYoutubeConfigured()) {
    throw new Error('VITE_YOUTUBE_CLIENT_ID is not configured in .env. Please set your Google OAuth Client ID.');
  }

  const redirectUri = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: YOUTUBE_SCOPES,
    include_granted_scopes: 'true',
    prompt: 'consent',
    state: state || 'youtube_connect'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Waits for the Google Identity Services library to load
 */
const waitForGIS = (timeoutMs = 4000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined' && google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
};

/**
 * Connects YouTube using Google Identity Services (GIS) Token Client.
 * Google's official, recommended way that avoids Cross-Origin-Opener-Policy (COOP)
 * errors, QUIC errors, and manual popup window tracking issues.
 */
export const connectYoutubeWithGIS = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!isYoutubeConfigured()) {
      reject(new Error(
        'Google OAuth Client ID is missing. Please add VITE_YOUTUBE_CLIENT_ID to your .env file.'
      ));
      return;
    }

    const isLoaded = await waitForGIS();
    if (!isLoaded || typeof google === 'undefined' || !google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services library failed to load. Please check your internet connection or ad-blocker.'));
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: YOUTUBE_CLIENT_ID,
        scope: YOUTUBE_SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received from Google authorization.'));
          }
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'Google sign-in popup was cancelled or failed.'));
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
};

/**
 * Primary YouTube connection function.
 * Uses Google Identity Services (GIS) first. Falls back to popup if GIS is unavailable.
 */
export const connectYoutubeWithPopup = async (brandId: string): Promise<string> => {
  if (!isYoutubeConfigured()) {
    throw new Error(
      'Google OAuth Client ID is missing. Please add VITE_YOUTUBE_CLIENT_ID to your .env file to connect live YouTube accounts.'
    );
  }

  // 1. Try Google Identity Services (official, zero COOP issues)
  try {
    const isGisReady = await waitForGIS(1500);
    if (isGisReady) {
      return await connectYoutubeWithGIS();
    }
  } catch (gisError: any) {
    console.warn('GIS init failed, attempting fallback popup:', gisError);
  }

  // 2. Fallback popup with safe COOP handling
  return new Promise((resolve, reject) => {
    let authUrl: string;
    try {
      authUrl = getYoutubeOAuthUrl(JSON.stringify({ brandId, platform: 'youtube' }));
    } catch (err: any) {
      reject(err);
      return;
    }

    const width = 550;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'ConnectYouTubePopup',
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,menubar=0`
    );

    if (!popup) {
      reject(new Error('Popup was blocked by your browser. Please allow popups for localhost.'));
      return;
    }

    let resolved = false;

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'YOUTUBE_AUTH_SUCCESS' && event.data?.accessToken) {
        resolved = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkTimer);
        resolve(event.data.accessToken);
      } else if (event.data?.type === 'YOUTUBE_AUTH_ERROR') {
        resolved = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkTimer);
        reject(new Error(event.data?.error || 'Google authentication was not completed.'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Watch if user closed the popup window safely without crashing on COOP
    const checkTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkTimer);
          window.removeEventListener('message', messageHandler);
          if (!resolved) {
            reject(new Error('Authorization window was closed.'));
          }
        }
      } catch {
        // Cross-Origin-Opener-Policy (COOP) restricts reading popup.closed; ignore and rely on postMessage or timeout
      }
    }, 1000);
  });
};

/**
 * Fetches the authenticated user's YouTube channel snippet and subscriber statistics
 */
export const fetchMyYoutubeChannel = async (accessToken: string): Promise<YoutubeChannelInfo> => {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true';
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.error?.message || `YouTube API returned status ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  const items = data.items || [];
  if (items.length === 0) {
    throw new Error('No YouTube channel was found for this Google account. Please create or select a channel on YouTube.');
  }

  const channel = items[0];
  const snippet = channel.snippet || {};
  const stats = channel.statistics || {};

  return {
    id: channel.id,
    title: snippet.title || 'YouTube Channel',
    customUrl: snippet.customUrl || (snippet.title ? `@${snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '')}` : undefined),
    avatarUrl: snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    subscriberCount: parseInt(stats.subscriberCount || '0', 10),
    videoCount: parseInt(stats.videoCount || '0', 10)
  };
};

/**
 * Uploads a video file to the authenticated YouTube channel using the Resumable Upload protocol
 */
export const uploadVideoToYoutube = async (params: UploadVideoParams): Promise<UploadVideoResult> => {
  const { accessToken, file, title, description, tags, categoryId, privacyStatus, onProgress } = params;

  if (!accessToken) {
    throw new Error('Missing YouTube authorization token. Please reconnect your YouTube channel.');
  }

  if (!file) {
    throw new Error('No video file provided for upload.');
  }

  // Step 1: Initiate Resumable Upload Session
  const initUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';
  const metadata = {
    snippet: {
      title: title.slice(0, 100) || 'Untitled Video',
      description: description || '',
      tags: tags || [],
      categoryId: categoryId || '22' // 22 = People & Blogs
    },
    status: {
      privacyStatus: privacyStatus || 'public',
      selfDeclaredMadeForKids: false
    }
  };

  if (onProgress) onProgress(5);

  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': file.type || 'video/mp4',
      'X-Upload-Content-Length': String(file.size)
    },
    body: JSON.stringify(metadata)
  });

  if (!initRes.ok) {
    const errorJson = await initRes.json().catch(() => ({}));
    const message = errorJson.error?.message || `Failed to initiate upload session (HTTP ${initRes.status})`;
    throw new Error(message);
  }

  const uploadLocation = initRes.headers.get('Location');
  if (!uploadLocation) {
    throw new Error('YouTube did not return a valid upload location URL.');
  }

  if (onProgress) onProgress(15);

  // Step 2: Upload Video Binary Stream via XMLHttpRequest to track progress
  return new Promise<UploadVideoResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadLocation, true);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.min(95, Math.round(15 + (e.loaded / e.total) * 80));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve({
            id: data.id,
            url: `https://www.youtube.com/watch?v=${data.id}`,
            title: data.snippet?.title || title,
            publishedAt: data.snippet?.publishedAt || new Date().toISOString(),
            privacyStatus: data.status?.privacyStatus || privacyStatus || 'public'
          });
        } catch {
          reject(new Error('Failed to parse YouTube upload response.'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || `Upload failed with status: ${xhr.status}`));
        } catch {
          reject(new Error(`YouTube upload returned status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during YouTube video upload. Please check your connection.'));
    };

    xhr.send(file);
  });
};
