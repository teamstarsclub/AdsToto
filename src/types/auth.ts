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
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; unverifiedEmail?: string }>;
  signup: (data: { name: string; email: string; brandName: string; websiteUrl?: string; password?: string }) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; code?: string }>;
  verifySignupEmail: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  connectWallet: (address: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}
