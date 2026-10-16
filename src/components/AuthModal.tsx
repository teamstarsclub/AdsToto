import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithGooglePopup } from '../services/firebaseAuth';
import { 
  X, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
}) => {
  const { signInWithGoogle, connectWallet, loginWithEmail, signUpWithEmail } = useAuth();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Sub-method: 'quick' (Google) | 'email' | 'web3'
  const [authMethod, setAuthMethod] = useState<'quick' | 'email' | 'web3'>('quick');

  // Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [walletInput, setWalletInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google Sign-In Handler
  const handleGoogleClick = async () => {
    setError(null);
    setLoading(true);

    try {
      const googleUser = await signInWithGooglePopup();
      
      const result = await signInWithGoogle({
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
      });

      setLoading(false);
      if (result.success) {
        setAuthSuccess(`Welcome, ${googleUser.name}!`);
        setTimeout(() => {
          onClose();
          if (onVerificationSuccess) onVerificationSuccess();
        }, 800);
      } else {
        setError(result.message || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setLoading(false);
      if (err?.isCancelled) {
        return;
      }
      setError(err?.message || 'Google authentication was not completed. Please try again.');
    }
  };

  // Email Sign In / Sign Up Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please provide a valid business or personal email address.');
      return;
    }

    setLoading(true);

    if (authMode === 'signup') {
      if (!nameInput.trim()) {
        setLoading(false);
        setError('Please enter your name or team handle.');
        return;
      }
      const res = await signUpWithEmail({
        name: nameInput.trim(),
        email: emailInput.trim(),
        brandName: brandInput.trim() || `${nameInput.trim()}'s Brand`,
        password: passwordInput,
      });
      setLoading(false);
      if (res.success) {
        setAuthSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
          if (onVerificationSuccess) onVerificationSuccess();
        }, 800);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } else {
      // Sign In
      const res = await loginWithEmail(emailInput.trim(), passwordInput);
      setLoading(false);
      if (res.success) {
        setAuthSuccess('Signed in successfully!');
        setTimeout(() => {
          onClose();
          if (onVerificationSuccess) onVerificationSuccess();
        }, 800);
      } else {
        setError(res.message || 'Login failed.');
      }
    }
  };

  // Web3 Browser Wallet Connect
  const handleConnectBrowserWallet = async () => {
    setError(null);
    setLoading(true);

    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts[0]) {
          const res = await connectWallet(accounts[0]);
          setLoading(false);
          if (res.success) {
            setAuthSuccess(`Connected wallet ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
            setTimeout(() => {
              onClose();
              if (onVerificationSuccess) onVerificationSuccess();
            }, 800);
            return;
          }
        }
      } else {
        setLoading(false);
        setError('No Web3 browser wallet detected. Please paste your wallet address (0x...) below.');
        return;
      }
    } catch (err: unknown) {
      setLoading(false);
      setError('Wallet connection was cancelled or rejected by user.');
      return;
    }

    setLoading(false);
    setError('No wallet account selected.');
  };

  const handleManualWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = walletInput.trim();
    if (!clean || clean.length < 10) {
      setError('Please enter a valid BSC or EVM blockchain address (e.g., 0x...).');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await connectWallet(clean);
    setLoading(false);
    if (res.success) {
      setAuthSuccess('Wallet connected!');
      setTimeout(() => {
        onClose();
        if (onVerificationSuccess) onVerificationSuccess();
      }, 800);
    } else {
      setError(res.message || 'Invalid wallet address.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl p-6 sm:p-7 space-y-5 text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <span className="font-mono text-xs font-bold tracking-wider">AT</span>
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">AdsToto</span>
        </div>

        {/* Mode Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {authMode === 'signin' ? 'Welcome Back to AdsToto' : 'Create Your Advertiser Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {authMode === 'signin'
              ? 'Access your personal Advertiser Dashboard, live clicks, and stats.'
              : 'Join the pay-to-rank ad exchange and track real-time campaign performance.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {authSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{authSuccess} Redirecting to your dashboard...</span>
          </div>
        )}

        {/* Primary Method: Google Sign-In */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm rounded-xl shadow-xs border border-slate-300 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-tight text-slate-800 font-semibold text-xs sm:text-sm">
              {loading ? 'Connecting with Google...' : `Continue with Google (${authMode === 'signup' ? '1-Click Signup' : '1-Click Login'})`}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="absolute bg-white px-3 text-[10px] uppercase font-mono font-semibold text-slate-400 tracking-wider">
            OR USE EMAIL / WALLET
          </span>
        </div>

        {/* Sub-method Switcher: Email vs Web3 */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email &amp; Password</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('web3')}
            className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              authMethod === 'web3'
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Web3 Wallet</span>
          </button>
        </div>

        {/* EMAIL FORM */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
            {authMode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Your Full Name / Alias</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>Brand or Project Name</span>
                  </label>
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="e.g. Acme Tech Labs"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>{authMode === 'signup' ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* WEB3 FORM */}
        {authMethod === 'web3' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={handleConnectBrowserWallet}
              disabled={loading}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect MetaMask / TrustWallet</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center font-mono uppercase">
              or enter public address
            </div>

            <form onSubmit={handleManualWalletSubmit} className="space-y-2">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="0x... (e.g. your BSC or ETH wallet address)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                {loading ? 'Connecting...' : 'Connect Address & Open Dashboard'}
              </button>
            </form>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant User Dashboard</span>
          </span>
          <span>·</span>
          <span>100% Free Account</span>
        </div>
      </div>
    </div>
  );
};
