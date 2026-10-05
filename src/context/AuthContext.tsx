import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AuthState } from '../types/auth';
import { 
  sendWelcomeConfirmationEmail, 
  sendPasswordResetEmail,
  sendSignupVerificationEmail 
} from '../services/emailService';

const STORAGE_KEY_AUTH = 'adstoto_auth_user_v2';
const STORAGE_KEY_USERS_DB = 'adstoto_registered_users_v2';
const STORAGE_KEY_PASSWORD_RESETS = 'adstoto_password_resets_v1';
const STORAGE_KEY_PENDING_VERIFICATIONS = 'adstoto_pending_verifications_v2';

interface StoredAccount extends UserProfile {
  passwordHash?: string;
}

interface ResetToken {
  email: string;
  code: string;
  expiresAt: number;
}

interface PendingVerification {
  email: string;
  code: string;
  expiresAt: number;
  profileData: {
    id: string;
    name: string;
    email: string;
    brandName: string;
    websiteUrl: string;
    avatarBg: string;
    avatarInitials: string;
    createdAt: string;
    tier: 'Starter Advertiser' | 'Growth Marketer' | 'Apex Partner';
    passwordHash?: string;
  };
}

const DEFAULT_DEMO_USER: UserProfile = {
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
};

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

  const signInWithGoogle = async (profile?: {
    name?: string;
    email?: string;
    picture?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const email = (profile?.email || 'contact.team.starsclub@gmail.com').trim().toLowerCase();
      const name = profile?.name || 'Stars Club Advertiser';
      const words = name.split(/\s+/);
      const initials =
        words.length >= 2
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

      const googleUser: UserProfile = {
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
      };

      // Save to registered accounts
      const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
      const db: StoredAccount[] = rawDb ? JSON.parse(rawDb) : [];
      const existingIdx = db.findIndex((u) => u.email.toLowerCase() === email);
      if (existingIdx !== -1) {
        db[existingIdx] = { ...db[existingIdx], ...googleUser };
      } else {
        db.push(googleUser);
      }
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));

      setUser(googleUser);
      return { success: true };
    } catch {
      return { success: false, message: 'Google sign-in failed. Please try again.' };
    }
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string; requiresVerification?: boolean; unverifiedEmail?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    try {
      // Check stored accounts database
      const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
      const db: StoredAccount[] = rawDb ? JSON.parse(rawDb) : [];
      const found = db.find((u) => u.email.toLowerCase() === cleanEmail);

      if (found) {
        setUser(found);
        return { success: true };
      }

      // Check if there is an unverified pending signup for this email
      const rawPending = localStorage.getItem(STORAGE_KEY_PENDING_VERIFICATIONS);
      const pendingList: PendingVerification[] = rawPending ? JSON.parse(rawPending) : [];
      const pendingFound = pendingList.find((p) => p.email === cleanEmail && p.expiresAt > Date.now());

      if (pendingFound) {
        return {
          success: false,
          requiresVerification: true,
          unverifiedEmail: cleanEmail,
          message: 'Your email address is pending verification. Please enter your 6-digit confirmation code.',
        };
      }

      // If user logs in with email that doesn't exist yet, seamlessly log in with a clean profile
      const namePart = cleanEmail.split('@')[0];
      const initials = namePart.substring(0, 2).toUpperCase();
      const newProfile: UserProfile = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        email: cleanEmail,
        brandName: `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Brand`,
        avatarBg: 'from-indigo-600 to-purple-600',
        avatarInitials: initials,
        createdAt: new Date().toISOString(),
        tier: 'Growth Marketer',
        isEmailVerified: true,
      };

      db.push(newProfile);
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
      setUser(newProfile);
      return { success: true };
    } catch {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    brandName: string;
    websiteUrl?: string;
    password?: string;
  }): Promise<{ success: boolean; message?: string; requiresVerification?: boolean; code?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanBrand = data.brandName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    if (!cleanName) {
      return { success: false, message: 'Please enter your name.' };
    }

    const words = cleanName.split(/\s+/);
    const initials =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : cleanName.substring(0, 2).toUpperCase();

    const bgGradients = [
      'from-amber-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-600 to-fuchsia-600',
      'from-rose-500 to-orange-500',
      'from-cyan-500 to-blue-600',
    ];
    const randomBg = bgGradients[Math.floor(Math.random() * bgGradients.length)];

    const newProfileData: PendingVerification['profileData'] = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      email: cleanEmail,
      brandName: cleanBrand || `${cleanName}'s Project`,
      websiteUrl: data.websiteUrl || '',
      avatarBg: randomBg,
      avatarInitials: initials,
      createdAt: new Date().toISOString(),
      tier: 'Starter Advertiser',
      passwordHash: data.password || 'pass123',
    };

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const rawPending = localStorage.getItem(STORAGE_KEY_PENDING_VERIFICATIONS);
      const pendingList: PendingVerification[] = rawPending ? JSON.parse(rawPending) : [];
      const filteredPending = pendingList.filter((p) => p.email !== cleanEmail && p.expiresAt > Date.now());

      filteredPending.push({
        email: cleanEmail,
        code: verificationCode,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
        profileData: newProfileData,
      });

      localStorage.setItem(STORAGE_KEY_PENDING_VERIFICATIONS, JSON.stringify(filteredPending));

      // Dispatch 6-digit confirmation code to email
      await sendSignupVerificationEmail(cleanEmail, verificationCode, cleanName);

      return {
        success: true,
        requiresVerification: true,
        code: verificationCode,
      };
    } catch {
      return { success: false, message: 'Failed to initiate registration. Please try again.' };
    }
  };

  const verifySignupEmail = async (
    email: string,
    code: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit verification code.' };
    }

    try {
      const rawPending = localStorage.getItem(STORAGE_KEY_PENDING_VERIFICATIONS);
      const pendingList: PendingVerification[] = rawPending ? JSON.parse(rawPending) : [];
      const pendingRecord = pendingList.find((p) => p.email === cleanEmail && p.code === cleanCode);

      if (!pendingRecord) {
        return {
          success: false,
          message: 'Invalid verification code. Please check the code in your email or click Resend.',
        };
      }

      if (Date.now() > pendingRecord.expiresAt) {
        return {
          success: false,
          message: 'This verification code has expired. Please click Resend Code.',
        };
      }

      // Activate user account
      const verifiedUser: UserProfile = {
        id: pendingRecord.profileData.id,
        name: pendingRecord.profileData.name,
        email: pendingRecord.profileData.email,
        brandName: pendingRecord.profileData.brandName,
        websiteUrl: pendingRecord.profileData.websiteUrl,
        avatarBg: pendingRecord.profileData.avatarBg,
        avatarInitials: pendingRecord.profileData.avatarInitials,
        createdAt: pendingRecord.profileData.createdAt,
        tier: pendingRecord.profileData.tier,
        isEmailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      };

      const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
      const db: StoredAccount[] = rawDb ? JSON.parse(rawDb) : [];
      const filteredDb = db.filter((u) => u.email.toLowerCase() !== cleanEmail);
      filteredDb.push({
        ...verifiedUser,
        passwordHash: pendingRecord.profileData.passwordHash,
      });

      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(filteredDb));

      // Remove from pending
      const remainingPending = pendingList.filter((p) => p.email !== cleanEmail);
      localStorage.setItem(STORAGE_KEY_PENDING_VERIFICATIONS, JSON.stringify(remainingPending));

      // Set logged in user
      setUser(verifiedUser);

      // Dispatch welcome email
      await sendWelcomeConfirmationEmail({
        name: verifiedUser.name,
        email: verifiedUser.email,
        brandName: verifiedUser.brandName,
      });

      return { success: true };
    } catch {
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  };

  const resendVerificationEmail = async (
    email: string
  ): Promise<{ success: boolean; message: string; code?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const rawPending = localStorage.getItem(STORAGE_KEY_PENDING_VERIFICATIONS);
      const pendingList: PendingVerification[] = rawPending ? JSON.parse(rawPending) : [];
      const existing = pendingList.find((p) => p.email === cleanEmail);

      const name = existing ? existing.profileData.name : 'Advertiser';
      const updatedList = pendingList.filter((p) => p.email !== cleanEmail);

      updatedList.push({
        email: cleanEmail,
        code: newCode,
        expiresAt: Date.now() + 15 * 60 * 1000,
        profileData: existing
          ? existing.profileData
          : {
              id: 'usr-' + Math.random().toString(36).substring(2, 9),
              name,
              email: cleanEmail,
              brandName: `${name}'s Brand`,
              websiteUrl: '',
              avatarBg: 'from-amber-500 to-indigo-600',
              avatarInitials: name.substring(0, 2).toUpperCase(),
              createdAt: new Date().toISOString(),
              tier: 'Starter Advertiser',
            },
      });

      localStorage.setItem(STORAGE_KEY_PENDING_VERIFICATIONS, JSON.stringify(updatedList));

      await sendSignupVerificationEmail(cleanEmail, newCode, name);

      return {
        success: true,
        message: `Fresh 6-digit confirmation code dispatched to ${cleanEmail}.`,
        code: newCode,
      };
    } catch {
      return { success: false, message: 'Failed to resend confirmation code.' };
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string; code?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Generate secure 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenRecord: ResetToken = {
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    try {
      const rawTokens = localStorage.getItem(STORAGE_KEY_PASSWORD_RESETS);
      const tokens: ResetToken[] = rawTokens ? JSON.parse(rawTokens) : [];
      // Remove any previous active tokens for this email
      const filtered = tokens.filter((t) => t.email !== cleanEmail && t.expiresAt > Date.now());
      filtered.push(tokenRecord);
      localStorage.setItem(STORAGE_KEY_PASSWORD_RESETS, JSON.stringify(filtered));

      // Dispatch password reset email
      await sendPasswordResetEmail(cleanEmail, code);

      return {
        success: true,
        message: `Password reset verification code dispatched to ${cleanEmail}. Check your inbox.`,
        code,
      };
    } catch (e) {
      console.error('Password reset dispatch error', e);
      return { success: false, message: 'Failed to dispatch reset email. Please try again.' };
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit verification code.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
      const rawTokens = localStorage.getItem(STORAGE_KEY_PASSWORD_RESETS);
      const tokens: ResetToken[] = rawTokens ? JSON.parse(rawTokens) : [];
      const foundToken = tokens.find((t) => t.email === cleanEmail && t.code === cleanCode);

      if (!foundToken) {
        return { success: false, message: 'Invalid or expired reset code. Please request a new one.' };
      }

      if (Date.now() > foundToken.expiresAt) {
        return { success: false, message: 'This reset code has expired. Please request a fresh code.' };
      }

      // Update password in stored accounts
      const rawDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
      const db: StoredAccount[] = rawDb ? JSON.parse(rawDb) : [];
      let account = db.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!account) {
        // Create account if not present
        const namePart = cleanEmail.split('@')[0];
        account = {
          id: 'usr-' + Math.random().toString(36).substring(2, 9),
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: cleanEmail,
          brandName: `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Brand`,
          avatarBg: 'from-amber-500 to-indigo-600',
          avatarInitials: namePart.substring(0, 2).toUpperCase(),
          createdAt: new Date().toISOString(),
          tier: 'Growth Marketer',
          passwordHash: newPassword,
        };
        db.push(account);
      } else {
        account.passwordHash = newPassword;
      }

      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));

      // Remove consumed token
      const remainingTokens = tokens.filter((t) => t.email !== cleanEmail);
      localStorage.setItem(STORAGE_KEY_PASSWORD_RESETS, JSON.stringify(remainingTokens));

      // Auto login
      setUser(account);

      return {
        success: true,
        message: 'Password successfully updated! You are now logged in.',
      };
    } catch {
      return { success: false, message: 'Password reset failed. Please try again.' };
    }
  };

  const connectWallet = async (address: string): Promise<{ success: boolean; message?: string }> => {
    const clean = address.trim();
    if (!clean || clean.length < 10) {
      return { success: false, message: 'Invalid wallet address.' };
    }

    const shortAddr = `${clean.substring(0, 4)}...${clean.substring(clean.length - 4)}`;
    const newProfile: UserProfile = {
      id: 'usr-' + clean.substring(0, 8),
      name: `Web3 Founder (${shortAddr})`,
      email: `${clean.substring(0, 6)}@web3.adstoto.com`,
      brandName: `BEP20-${clean.substring(2, 6).toUpperCase()}`,
      walletAddress: clean,
      avatarBg: 'from-amber-400 to-yellow-600',
      avatarInitials: 'W3',
      createdAt: new Date().toISOString(),
      tier: 'Apex Partner',
    };

    setUser(newProfile);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signInWithGoogle,
        login,
        signup,
        verifySignupEmail,
        resendVerificationEmail,
        connectWallet,
        logout,
        updateProfile,
        requestPasswordReset,
        resetPassword,
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
