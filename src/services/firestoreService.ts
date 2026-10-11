import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  onSnapshot, 
  getDocFromServer,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebaseAuth';
import { UserProfile } from '../types/auth';
import { AdCampaign } from '../types/ad';

/**
 * Validates connection to Firestore at boot time as required by Firebase skill
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running in offline/cached mode.');
    }
    return false;
  }
}

/**
 * Persists an advertiser user profile to Firestore
 */
export async function syncUserToFirestore(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    const sanitizedUser = {
      ...user,
      lastActiveAt: new Date().toISOString(),
    };
    await setDoc(userRef, sanitizedUser, { merge: true });
  } catch (error) {
    console.warn('Firestore user sync warning (persisted locally):', error);
  }
}

/**
 * Subscribes to real-time users collection updates from Firestore
 */
export function subscribeUsersFromFirestore(
  onUpdate: (users: UserProfile[]) => void
): () => void {
  try {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as UserProfile);
          });
          if (loaded.length > 0) {
            onUpdate(loaded);
          }
        }
      },
      (err) => {
        console.warn('Firestore users subscription fallback:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Unable to subscribe to Firestore users:', err);
    return () => {};
  }
}

/**
 * Persists an ad campaign to Firestore
 */
export async function syncCampaignToFirestore(campaign: AdCampaign): Promise<void> {
  try {
    const campRef = doc(db, 'campaigns', campaign.id);
    await setDoc(campRef, campaign, { merge: true });
  } catch (error) {
    console.warn('Firestore campaign sync warning:', error);
  }
}

/**
 * Subscribes to real-time ad campaigns from Firestore
 */
export function subscribeCampaignsFromFirestore(
  onUpdate: (campaigns: AdCampaign[]) => void
): () => void {
  try {
    const campCol = collection(db, 'campaigns');
    const unsubscribe = onSnapshot(
      campCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AdCampaign[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as AdCampaign);
          });
          if (loaded.length > 0) {
            // Sort by rank
            loaded.sort((a, b) => a.rank - b.rank);
            onUpdate(loaded);
          }
        }
      },
      (err) => {
        console.warn('Firestore campaigns subscription fallback:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Unable to subscribe to Firestore campaigns:', err);
    return () => {};
  }
}
