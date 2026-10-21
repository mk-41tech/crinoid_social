/**
 * Meta (Facebook & Instagram) Graph API Client Service
 * 
 * Handles:
 * 1. Meta OAuth 2.0 / Facebook JavaScript SDK authentication
 * 2. Fetching user's Facebook Pages and connected Instagram Professional accounts
 * 3. Publishing posts directly to Facebook Pages (feed, photos, links)
 * 4. Publishing posts to Instagram Business/Creator accounts via Instagram Graph API
 */

export const META_APP_ID = (import.meta.env.VITE_META_APP_ID || '').trim();

export const isMetaConfigured = (): boolean => {
  return META_APP_ID.length > 0;
};

export const META_SCOPES = [
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'business_management'
].join(',');

export interface FacebookPageAccount {
  id: string;
  name: string;
  accessToken: string;
  avatar?: string;
  category?: string;
  followers?: number;
  instagramAccount?: {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    followers?: number;
  };
}

/**
 * Loads and initializes the Meta / Facebook JavaScript SDK
 */
export const loadFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window.FB !== 'undefined') {
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      if (window.FB && isMetaConfigured()) {
        window.FB.init({
          appId: META_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
      }
      resolve();
    };

    if (document.getElementById('facebook-jssdk')) {
      resolve();
      return;
    }

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    js.async = true;
    js.defer = true;
    js.onload = () => {
      if (typeof window.FB !== 'undefined' && isMetaConfigured()) {
        try {
          window.FB.init({
            appId: META_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v19.0'
          });
        } catch {
          // In case already initialized
        }
      }
      resolve();
    };
    document.body.appendChild(js);
  });
};

/**
 * Triggers Meta OAuth login dialog and returns the User Access Token
 */
export const loginWithMeta = async (): Promise<string> => {
  if (!isMetaConfigured()) {
    throw new Error('Meta App ID is missing. Please set VITE_META_APP_ID in your .env file.');
  }

  await loadFacebookSDK();

  if (typeof window.FB !== 'undefined') {
    return new Promise((resolve, reject) => {
      window.FB!.login(
        (response) => {
          if (response.authResponse?.accessToken) {
            resolve(response.authResponse.accessToken);
          } else {
            reject(new Error('Meta authorization was cancelled or failed.'));
          }
        },
        { scope: META_SCOPES, return_scopes: true }
      );
    });
  }

  // Fallback: Popup with standard OAuth Dialog
  return new Promise((resolve, reject) => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(META_SCOPES)}&response_type=token`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'MetaAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups to sign in with Facebook.'));
      return;
    }

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'META_AUTH_SUCCESS' && event.data?.accessToken) {
        window.removeEventListener('message', messageHandler);
        resolve(event.data.accessToken);
      } else if (event.data?.type === 'META_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        reject(new Error(event.data?.error || 'Meta authorization error.'));
      }
    };

    window.addEventListener('message', messageHandler);
  });
};

/**
 * Queries Meta Graph API to fetch user's Facebook Pages and their connected Instagram Business accounts
 */
export const fetchFacebookPages = async (userAccessToken: string): Promise<FacebookPageAccount[]> => {
  const fields = 'id,name,access_token,category,picture{url},followers_count,instagram_business_account{id,username,name,profile_picture_url,followers_count}';
  const url = `https://graph.facebook.com/v19.0/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${userAccessToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch Facebook Pages.');
  }

  if (!data.data || data.data.length === 0) {
    throw new Error('No Facebook Pages found. Please ensure you have created at least one Facebook Page and granted page permissions.');
  }

  return data.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    accessToken: item.access_token,
    avatar: item.picture?.data?.url || '',
    category: item.category,
    followers: item.followers_count,
    instagramAccount: item.instagram_business_account ? {
      id: item.instagram_business_account.id,
      username: item.instagram_business_account.username,
      name: item.instagram_business_account.name,
      avatar: item.instagram_business_account.profile_picture_url,
      followers: item.instagram_business_account.followers_count
    } : undefined
  }));
};

/**
 * Publishes a post to a Facebook Page
 */
export const publishToFacebookPage = async (params: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  linkUrl?: string;
  imageUrl?: string;
}): Promise<{ id: string; url: string }> => {
  const { pageId, pageAccessToken, message, linkUrl, imageUrl } = params;

  let endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  const body = new URLSearchParams();
  body.append('access_token', pageAccessToken);
  body.append('message', message);

  if (imageUrl) {
    endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    body.append('url', imageUrl);
    body.append('caption', message);
    body.delete('message');
  } else if (linkUrl) {
    body.append('link', linkUrl);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error.message || 'Failed to publish to Facebook Page.');
  }

  const postId = result.id || result.post_id;
  return {
    id: postId,
    url: `https://facebook.com/${postId}`
  };
};

/**
 * Publishes an image or reel to an Instagram Business account via the 2-step Container API
 */
export const publishToInstagram = async (params: {
  igUserId: string;
  pageAccessToken: string;
  caption: string;
  imageUrl: string;
}): Promise<{ id: string; url: string }> => {
  const { igUserId, pageAccessToken, caption, imageUrl } = params;

  if (!imageUrl) {
    throw new Error('Instagram requires an image or video URL to publish a post.');
  }

  // Step 1: Create media container
  const createUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
  const createBody = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: pageAccessToken
  });

  const createRes = await fetch(createUrl, { method: 'POST', body: createBody });
  const createData = await createRes.json();

  if (createData.error) {
    throw new Error(createData.error.message || 'Instagram media container creation failed.');
  }

  const creationId = createData.id;

  // Step 2: Publish media container
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
  const publishBody = new URLSearchParams({
    creation_id: creationId,
    access_token: pageAccessToken
  });

  const publishRes = await fetch(publishUrl, { method: 'POST', body: publishBody });
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || 'Failed to publish Instagram post.');
  }

  return {
    id: publishData.id,
    url: `https://instagram.com/p/${publishData.id}`
  };
};
