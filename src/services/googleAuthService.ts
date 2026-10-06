/**
 * Google Identity Services (GIS) & OAuth 2.0 Integration Service
 * Handles direct, authentic Google Sign-In showing adstoto.com without firebaseapp.com
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
const DEFAULT_CLIENT_ID = firebaseConfig.oAuthClientId || '828845718854-r5ih63tqcm3gue7ig7kfd9f37gtbbati.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore
  }
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || DEFAULT_CLIENT_ID;
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
 * Initiates direct Google OAuth Sign-In (showing adstoto.com)
 */
export function requestRealGoogleSignIn(
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void,
  onError: (error: string) => void
): void {
  const cleanId = (clientId || DEFAULT_CLIENT_ID).trim();

  if (!cleanId) {
    onError('Google Client ID is missing.');
    return;
  }

  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    onError('Google Identity Services is loading. Please try again.');
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
            const cancelErr = new Error('Google Sign-In window was closed. Please try again.');
            (cancelErr as any).isCancelled = true;
            onError(cancelErr.message);
            return;
          }
          onError(`Google Sign-In Notice: ${tokenResponse.error_description || tokenResponse.error}`);
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
        const cancelErr = new Error('Google Sign-In window was closed. Please try again.');
        (cancelErr as any).isCancelled = true;
        onError(cancelErr.message);
      },
    });

    // Triggers direct Google Account Chooser popup with adstoto.com branding
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: unknown) {
    onError(err instanceof Error ? err.message : 'Could not launch Google Sign-In.');
  }
}
