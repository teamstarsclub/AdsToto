import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

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
 * Triggers official Firebase Google Sign-In with authentic Google popup
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
    if (error.code === 'auth/unauthorized-domain') {
      const customErr = new Error(
        `Firebase: Domain "${window.location.hostname}" is not in Authorized Domains. Please add "${window.location.hostname}" in Firebase Console > Authentication > Settings > Authorized Domains.`
      );
      (customErr as any).isUnauthorizedDomain = true;
      (customErr as any).projectId = firebaseConfig.projectId;
      (customErr as any).domain = window.location.hostname;
      throw customErr;
    }

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
