/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_CLIENT_ID?: string;
  readonly VITE_YOUTUBE_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token?: string;
        error?: string;
        error_description?: string;
        expires_in?: number;
        scope?: string;
        token_type?: string;
      }

      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (nonOAuthError: { message: string; type: string }) => void;
        prompt?: string;
      }

      interface TokenClient {
        requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(accessToken: string, done?: () => void): void;
    }
  }
}
