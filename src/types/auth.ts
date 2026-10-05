export interface UserProfile {
  id: string;
  name: string;
  email: string;
  brandName: string;
  websiteUrl?: string;
  walletAddress?: string;
  avatarBg: string;
  avatarInitials: string;
  createdAt: string;
  tier: 'Starter Advertiser' | 'Growth Marketer' | 'Apex Partner';
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  authProvider?: 'google' | 'web3' | 'custom';
  avatarUrl?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  signInWithGoogle: (profile?: { name?: string; email?: string; picture?: string }) => Promise<{ success: boolean; message?: string }>;
  connectWallet: (address: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login?: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signup?: (data: { name: string; email: string; brandName: string; websiteUrl?: string; password?: string }) => Promise<{ success: boolean; message?: string }>;
  verifySignupEmail?: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail?: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  requestPasswordReset?: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  resetPassword?: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}
