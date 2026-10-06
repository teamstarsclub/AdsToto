import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { requestRealGoogleSignIn } from './googleAuthService';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('openid');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleAuthResult {
  uid: string;
  name: string;
  email: string;
  picture?: string;
}

/**
 * Triggers authentic Google Account Chooser popup with fallback and domain handling
 */
export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      uid: user.uid,
      name: user.displayName || 'Google Advertiser',
      email: user.email || 'contact.team.starsclub@gmail.com',
      picture: user.photoURL || undefined,
    };
  } catch (error: any) {
    // If the domain is not yet authorized in Firebase Console (e.g. custom domain adstoto.com)
    if (error.code === 'auth/unauthorized-domain') {
      console.warn('Firebase unauthorized-domain detected for host:', window.location.hostname);

      // Attempt Google Identity Services fallback if OAuth client ID is present
      const oAuthClientId = firebaseConfig.oAuthClientId;
      if (oAuthClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        return new Promise<GoogleAuthResult>((resolve, reject) => {
          requestRealGoogleSignIn(
            oAuthClientId,
            (profile) => {
              resolve({
                uid: profile.sub,
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
              });
            },
            (gisError) => {
              const customErr = new Error(
                `Domain "${window.location.hostname}" is not authorized in Firebase. Please add "${window.location.hostname}" in Firebase Console > Authentication > Settings > Authorized Domains.`
              );
              (customErr as any).isUnauthorizedDomain = true;
              (customErr as any).projectId = firebaseConfig.projectId;
              (customErr as any).domain = window.location.hostname;
              reject(customErr);
            }
          );
        });
      }

      const domainErr = new Error(
        `Domain "${window.location.hostname}" is not authorized in Firebase. Please add "${window.location.hostname}" in Firebase Console > Authentication > Settings > Authorized Domains.`
      );
      (domainErr as any).isUnauthorizedDomain = true;
      (domainErr as any).projectId = firebaseConfig.projectId;
      (domainErr as any).domain = window.location.hostname;
      throw domainErr;
    }

    // Graceful handling for user cancellation or closed popups
    if (error.code === 'auth/popup-closed-by-user') {
      const cancelErr = new Error('Google Sign-In window was closed. Please try again.');
      (cancelErr as any).isCancelled = true;
      throw cancelErr;
    }
    
    if (error.code === 'auth/cancelled-popup-request') {
      const cancelErr = new Error('Previous popup was cancelled. Please try again.');
      (cancelErr as any).isCancelled = true;
      throw cancelErr;
    }

    if (error.code === 'auth/popup-blocked') {
      const blockedErr = new Error('Pop-up window was blocked by your browser. Please allow popups for adstoto.com and try again.');
      (blockedErr as any).isBlocked = true;
      throw blockedErr;
    }

    throw new Error(error.message || 'Failed to authenticate with Google.');
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Non-blocking
  }
}
