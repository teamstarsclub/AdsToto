/**
 * Google Identity Services (GIS) & OAuth 2.0 Integration Service
 * Handles authentic Google Sign-In with real Google Account Chooser popup.
 */

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

const STORAGE_KEY_CLIENT_ID = 'adstoto_google_client_id_v2';

export function getGoogleClientId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore
  }
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';
}

export function saveGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
  } catch {
    // Ignore
  }
}

/**
 * Checks whether Google Identity Services (GIS) script is loaded
 */
export function isGoogleGsiLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window as any).google?.accounts;
}

/**
 * Initiates the authentic Google Sign-In popup flow
 * Opens accounts.google.com OAuth popup window
 */
export function requestRealGoogleSignIn(
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError: (error: string) => void
): void {
  const cleanId = clientId.trim();

  if (!cleanId) {
    onError('Google Client ID is required to launch the authentic Google Account Chooser.');
    return;
  }

  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    onError('Google Identity Services SDK is still loading. Please try again in a few seconds.');
    return;
  }

  try {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: cleanId,
      scope: 'email profile openid',
      prompt: 'select_account',
      callback: async (tokenResponse: any) => {
        if (tokenResponse?.error) {
          onError(`Google Authentication Error: ${tokenResponse.error_description || tokenResponse.error}`);
          return;
        }

        if (tokenResponse?.access_token) {
          try {
            // Fetch real user info from Google's official userinfo API
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo API returned HTTP ${res.status}`);
            }

            const data = await res.json();
            onSuccess({
              sub: data.sub || Math.random().toString(),
              name: data.name || data.given_name || 'Google User',
              email: data.email,
              picture: data.picture,
              email_verified: data.email_verified,
            });
          } catch (err: unknown) {
            onError(err instanceof Error ? err.message : 'Failed to retrieve profile from Google.');
          }
        }
      },
      error_callback: (err: any) => {
        onError(`Google OAuth popup closed or blocked: ${err?.message || 'Authorization failed'}`);
      },
    });

    // Triggers the real Google accounts.google.com popup
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: unknown) {
    onError(err instanceof Error ? err.message : 'Could not launch Google Sign-In.');
  }
}
