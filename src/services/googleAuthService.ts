/**
 * Google Identity Services (GIS) & OAuth 2.0 Integration Service
 * Branded 100% to adstoto.com without any firebaseapp.com middleman.
 */

import firebaseConfig from '../../firebase-applet-config.json';

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

const STORAGE_KEY_CLIENT_ID = 'adstoto_google_client_id_v2';
export const OAUTH_CLIENT_ID =
  firebaseConfig.oAuthClientId ||
  '828845718854-r5ih63tqcm3gue7ig7kfd9f37gtbbati.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore
  }
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || OAUTH_CLIENT_ID;
}

export function saveGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
  } catch {
    // Ignore
  }
}

/**
 * Ensures Google Identity Services (GIS) client script is loaded and ready
 */
export async function ensureGoogleGsiLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if ((window as any).google?.accounts?.oauth2) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(!!(window as any).google?.accounts?.oauth2);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 50) {
          clearInterval(interval);
          resolve(false);
        }
      }, 50);
    }
  });
}

/**
 * Initiates authentic Google Sign-In directly to adstoto.com (no firebaseapp.com)
 */
export async function requestRealGoogleSignIn(
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError: (error: string) => void
): Promise<void> {
  const cleanId = (clientId || OAUTH_CLIENT_ID).trim();

  const isLoaded = await ensureGoogleGsiLoaded();
  if (!isLoaded || !(window as any).google?.accounts?.oauth2) {
    onError('Google Identity Services is still loading. Please try again.');
    return;
  }

  try {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: cleanId,
      scope: 'email profile openid',
      prompt: 'select_account',
      callback: async (tokenResponse: any) => {
        if (tokenResponse?.error) {
          if (tokenResponse.error === 'access_denied') {
            const cancelErr = new Error('Google Sign-In window was closed.');
            (cancelErr as any).isCancelled = true;
            onError(cancelErr.message);
            return;
          }
          onError(`Google Sign-In Notice: ${tokenResponse.error_description || tokenResponse.error}`);
          return;
        }

        if (tokenResponse?.access_token) {
          try {
            // Fetch real user info from Google's official userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo returned HTTP ${res.status}`);
            }

            const data = await res.json();
            onSuccess({
              sub: data.sub || Math.random().toString(),
              name: data.name || data.given_name || 'Google Advertiser',
              email: data.email || 'contact.team.starsclub@gmail.com',
              picture: data.picture,
              email_verified: data.email_verified,
            });
          } catch (err: unknown) {
            onError(err instanceof Error ? err.message : 'Failed to retrieve profile from Google.');
          }
        }
      },
      error_callback: (err: any) => {
        const cancelErr = new Error('Google Sign-In window was closed.');
        (cancelErr as any).isCancelled = true;
        onError(cancelErr.message);
      },
    });

    // Triggers direct Google Account Chooser popup branded to adstoto.com
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: unknown) {
    onError(err instanceof Error ? err.message : 'Could not launch Google Sign-In.');
  }
}
