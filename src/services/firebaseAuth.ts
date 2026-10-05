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
 * Triggers authentic Google Account Chooser popup with graceful cancellation handling
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

    console.warn('Google Sign-In Notice:', error.message || error);
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
