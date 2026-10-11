import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthState } from '../types/auth';
import { 
  testFirestoreConnection, 
  syncUserToFirestore, 
  subscribeUsersFromFirestore 
} from '../services/firestoreService';

const STORAGE_KEY_AUTH = 'adstoto_auth_user_v2';
const STORAGE_KEY_USERS_DB = 'adstoto_registered_users_v2';

const INITIAL_SAAS_USERS: UserProfile[] = [
  {
    id: 'usr-starsclub',
    name: 'Stars Club Founder',
    email: 'contact.team.starsclub@gmail.com',
    brandName: 'StarsClub Ventures',
    websiteUrl: 'https://starsclub.io',
    walletAddress: '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22',
    avatarBg: 'from-amber-500 to-indigo-600',
    avatarInitials: 'SC',
    createdAt: '2026-09-20T10:00:00Z',
    tier: 'Apex Partner',
    isEmailVerified: true,
    authProvider: 'google',
    status: 'active',
    totalSpent: 420,
    activeAdsCount: 3,
    lastActiveAt: '2026-10-06T10:00:00Z',
    role: 'admin',
  },
  {
    id: 'usr-cogniflow',
    name: 'Elena Rostova',
    email: 'elena.ai@cogniflow.run',
    brandName: 'CogniFlow AI',
    websiteUrl: 'https://cogniflow.run',
    walletAddress: '0x32A4B89c83a1519d0aB1a89c97b830d6F22718E1',
    avatarBg: 'from-violet-600 to-indigo-600',
    avatarInitials: 'ER',
    createdAt: '2026-09-28T08:30:00Z',
    tier: 'Apex Partner',
    isEmailVerified: true,
    authProvider: 'google',
    status: 'active',
    totalSpent: 350,
    activeAdsCount: 2,
    lastActiveAt: '2026-10-06T09:15:00Z',
    role: 'advertiser',
  },
  {
    id: 'usr-saasify',
    name: 'Sarah Mitchell',
    email: 'sarah.m@saasify.dev',
    brandName: 'SaaSify Studio',
    websiteUrl: 'https://saasify.dev',
    walletAddress: '0x58F1C8F6964F88c83a1519d0aB1a89c97b8309aC3',
    avatarBg: 'from-emerald-500 to-teal-600',
    avatarInitials: 'SM',
    createdAt: '2026-09-29T14:20:00Z',
    tier: 'Growth Marketer',
    isEmailVerified: true,
    authProvider: 'google',
    status: 'active',
    totalSpent: 185,
    activeAdsCount: 1,
    lastActiveAt: '2026-10-05T18:40:00Z',
    role: 'advertiser',
  },
  {
    id: 'usr-hyperforge',
    name: 'Alex Vance',
    email: 'alex.v@hyperforge.space',
    brandName: 'HyperForge Studio',
    websiteUrl: 'https://hyperforge.space',
    walletAddress: '0x992B89c83a1519d0aB1a89c97b830d6F22481F4B',
    avatarBg: 'from-amber-600 to-orange-600',
    avatarInitials: 'AV',
    createdAt: '2026-09-30T11:10:00Z',
    tier: 'Growth Marketer',
    isEmailVerified: true,
    authProvider: 'web3',
    status: 'active',
    totalSpent: 240,
    activeAdsCount: 1,
    lastActiveAt: '2026-10-06T08:50:00Z',
    role: 'advertiser',
  },
  {
    id: 'usr-web3trader',
    name: 'David Satoshi',
    email: 'david.bep20@starsclub.io',
    brandName: 'DEX Alpha Yield',
    websiteUrl: 'https://dexalpha.io',
    walletAddress: '0x1818B89c83a1519d0aB1a89c97b830d6F22778A9',
    avatarBg: 'from-cyan-500 to-blue-600',
    avatarInitials: 'DS',
    createdAt: '2026-10-02T16:45:00Z',
    tier: 'Starter Advertiser',
    isEmailVerified: true,
    authProvider: 'web3',
    status: 'active',
    totalSpent: 75,
    activeAdsCount: 1,
    lastActiveAt: '2026-10-06T11:05:00Z',
    role: 'advertiser',
  },
];

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SAAS_USERS;
  });

  // Save active user session
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // Ignore
    }
  }, [user]);

  // Persist allUsers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(allUsers));
    } catch {
      // Ignore
    }
  }, [allUsers]);

  // Connect & sync with Firestore
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = subscribeUsersFromFirestore((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setAllUsers((prev) => {
          const merged = new Map<string, UserProfile>();
          prev.forEach((u) => merged.set(u.id, u));
          firestoreUsers.forEach((u) => merged.set(u.id, u));
          return Array.from(merged.values());
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (profile?: {
    name?: string;
    email?: string;
    picture?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const email = (profile?.email || 'contact.team.starsclub@gmail.com').trim().toLowerCase();
      const name = profile?.name || 'Google Advertiser';
      const words = name.split(/\s+/);
      const initials =
        words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

      const existingUser = allUsers.find((u) => u.email.toLowerCase() === email);

      const googleUser: UserProfile = existingUser
        ? {
            ...existingUser,
            name: profile?.name || existingUser.name,
            avatarUrl: profile?.picture || existingUser.avatarUrl,
            lastActiveAt: new Date().toISOString(),
          }
        : {
            id: 'usr-g-' + Math.random().toString(36).substring(2, 9),
            name: name,
            email: email,
            brandName: `${name.split(' ')[0]}'s Venture`,
            websiteUrl: 'https://adstoto.com',
            avatarBg: 'from-blue-600 via-indigo-600 to-purple-600',
            avatarInitials: initials,
            avatarUrl: profile?.picture,
            createdAt: new Date().toISOString(),
            tier: 'Growth Marketer',
            isEmailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            authProvider: 'google',
            status: 'active',
            totalSpent: 0,
            activeAdsCount: 0,
            lastActiveAt: new Date().toISOString(),
            role: email === 'contact.team.starsclub@gmail.com' ? 'admin' : 'advertiser',
          };

      setAllUsers((prev) => {
        const idx = prev.findIndex((u) => u.email.toLowerCase() === email);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = googleUser;
          return updated;
        }
        return [googleUser, ...prev];
      });

      setUser(googleUser);
      syncUserToFirestore(googleUser);
      return { success: true };
    } catch {
      return { success: false, message: 'Google sign-in failed. Please try again.' };
    }
  };

  const connectWallet = async (address: string): Promise<{ success: boolean; message?: string }> => {
    const clean = address.trim();
    if (!clean || clean.length < 8) {
      return { success: false, message: 'Invalid wallet address.' };
    }

    const shortAddr = `${clean.substring(0, 4)}...${clean.substring(clean.length - 4)}`;
    const existing = allUsers.find(
      (u) => u.walletAddress?.toLowerCase() === clean.toLowerCase()
    );

    const newProfile: UserProfile = existing
      ? { ...existing, lastActiveAt: new Date().toISOString() }
      : {
          id: 'usr-w3-' + clean.substring(0, 8),
          name: `Web3 Founder (${shortAddr})`,
          email: `${clean.substring(0, 6)}@web3.adstoto.com`,
          brandName: `BEP20-${clean.substring(2, 6).toUpperCase()}`,
          walletAddress: clean,
          avatarBg: 'from-amber-400 to-yellow-600',
          avatarInitials: 'W3',
          createdAt: new Date().toISOString(),
          tier: 'Apex Partner',
          authProvider: 'web3',
          isEmailVerified: true,
          status: 'active',
          totalSpent: 0,
          activeAdsCount: 0,
          lastActiveAt: new Date().toISOString(),
          role: 'advertiser',
        };

    setAllUsers((prev) => {
      const idx = prev.findIndex(
        (u) => u.walletAddress?.toLowerCase() === clean.toLowerCase()
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newProfile;
        return updated;
      }
      return [newProfile, ...prev];
    });

    setUser(newProfile);
    syncUserToFirestore(newProfile);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      syncUserToFirestore(updated);
      return updated;
    });
    setAllUsers((prev) =>
      prev.map((u) => {
        if (user && u.id === user.id) {
          const updated = { ...u, ...updates };
          syncUserToFirestore(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    if (user && user.id === id) {
      setUser(null);
    }
  };

  const updateUserTier = (
    id: string,
    tier: 'Starter Advertiser' | 'Growth Marketer' | 'Apex Partner'
  ) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, tier };
          syncUserToFirestore(updated);
          return updated;
        }
        return u;
      })
    );
    if (user && user.id === id) {
      setUser((prev) => (prev ? { ...prev, tier } : null));
    }
  };

  const toggleUserStatus = (id: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
          const updated: UserProfile = { ...u, status: newStatus };
          syncUserToFirestore(updated);
          return updated;
        }
        return u;
      })
    );
  };

  const addAdminUser = (userData: Partial<UserProfile>) => {
    const name = userData.name || 'New Advertiser';
    const email = userData.email || `user-${Date.now()}@adstoto.com`;
    const words = name.split(/\s+/);
    const initials =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const newUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: name,
      email: email,
      brandName: userData.brandName || `${name}'s Brand`,
      websiteUrl: userData.websiteUrl || 'https://adstoto.com',
      walletAddress: userData.walletAddress,
      avatarBg: 'from-indigo-600 to-purple-600',
      avatarInitials: initials,
      createdAt: new Date().toISOString(),
      tier: userData.tier || 'Starter Advertiser',
      isEmailVerified: true,
      authProvider: userData.authProvider || 'custom',
      status: 'active',
      totalSpent: 0,
      activeAdsCount: 0,
      lastActiveAt: new Date().toISOString(),
      role: userData.role || 'advertiser',
    };

    setAllUsers((prev) => [newUser, ...prev]);
    syncUserToFirestore(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        allUsers,
        signInWithGoogle,
        connectWallet,
        logout,
        updateProfile,
        deleteUser,
        updateUserTier,
        toggleUserStatus,
        addAdminUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
