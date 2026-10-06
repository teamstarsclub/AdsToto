import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithGooglePopup } from '../services/firebaseAuth';
import { 
  X, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2 
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
  const { signInWithGoogle, connectWallet } = useAuth();

  const [walletInput, setWalletInput] = useState('');
  const [isWeb3Open, setIsWeb3Open] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google Sign-In Handler (Reliable official Google authentication)
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
        setAuthSuccess(`Signed in with Google as ${googleUser.email}!`);
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
      }
    } catch (err: unknown) {
      console.warn('Browser wallet request declined or unavailable:', err);
    }

    // Fallback: connect with address
    const res = await connectWallet(walletInput.trim() || '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22');
    setLoading(false);
    if (res.success) {
      setAuthSuccess('Web3 Wallet connected!');
      setTimeout(() => {
        onClose();
        if (onVerificationSuccess) onVerificationSuccess();
      }, 800);
    } else {
      setError(res.message || 'Failed to connect wallet.');
    }
  };

  const handleManualWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim()) {
      setError('Please enter a valid wallet address.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await connectWallet(walletInput.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-7 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <span className="font-mono text-sm font-bold text-white tracking-wider">AT</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight">AdsToto</span>
        </div>

        {/* Header Text matching user screenshot design */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
            Sign in or create an account
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Use Google or connect your Web3 wallet to continue with AdsToto (it’s free)!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {authSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{authSuccess} Redirecting to your dashboard...</span>
          </div>
        )}

        {/* PRIMARY CTA: CONTINUER AVEC GOOGLE / CONTINUE WITH GOOGLE */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3.5 group hover:scale-[1.01] active:scale-[0.99] border border-slate-200 cursor-pointer disabled:opacity-60"
          >
            {/* Google 4-Color SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="tracking-tight text-slate-800 font-semibold text-base">
              {loading ? 'Opening Google Sign-In...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800"></div>
          <span className="absolute bg-slate-900 px-3 text-xs uppercase font-mono font-semibold text-slate-500 tracking-wider">
            OR
          </span>
        </div>

        {/* WEB3 WALLET SIGN UP / LOGIN */}
        <div className="space-y-3">
          {!isWeb3Open ? (
            <button
              type="button"
              onClick={() => setIsWeb3Open(true)}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800/90 text-amber-400 font-bold text-sm rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Connect Web3 Wallet (BEP-20 / EVM)</span>
            </button>
          ) : (
            <form onSubmit={handleManualWalletSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Web3 Wallet Connection</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsWeb3Open(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Instant Browser Connect Button */}
              <button
                type="button"
                onClick={handleConnectBrowserWallet}
                disabled={loading}
                className="w-full py-2 px-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Detect MetaMask / TrustWallet</span>
              </button>

              <div className="text-[10px] text-slate-500 text-center font-mono uppercase">
                or enter wallet address
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {loading ? 'Connecting...' : 'Connect Address & Access Dashboard'}
              </button>
            </form>
          )}
        </div>

        {/* Security & Free Guarantee Footer */}
        <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Access</span>
          </span>
          <span>·</span>
          <span>Zero Password Friction</span>
          <span>·</span>
          <span>100% Free Account</span>
        </div>
      </div>
    </div>
  );
};
