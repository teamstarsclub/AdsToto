import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight,
  KeyRound,
  Mail,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
  autoFillCode?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
  autoFillCode,
}) => {
  const { 
    login, 
    signup, 
    verifySignupEmail, 
    resendVerificationEmail, 
    connectWallet, 
    requestPasswordReset, 
    resetPassword 
  } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'wallet' | 'forgot' | 'verify'>(defaultTab);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpBrand, setSignUpBrand] = useState('');
  const [signUpWebsite, setSignUpWebsite] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Email Verification State
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupDisplayCode, setBackupDisplayCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showDirectCode, setShowDirectCode] = useState(false);

  // Password Reset State
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Wallet State
  const [walletInput, setWalletInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle auto fill code if passed
  useEffect(() => {
    if (autoFillCode) {
      setResetCode(autoFillCode);
      setTab('forgot');
      setResetStep(2);
    }
  }, [autoFillCode]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(signInEmail, signInPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else if (res.requiresVerification && res.unverifiedEmail) {
      setVerificationEmail(res.unverifiedEmail);
      setTab('verify');
      setError('Please enter the 6-digit confirmation code sent to your email.');
    } else {
      setError(res.message || 'Login failed.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signup({
      name: signUpName,
      email: signUpEmail,
      brandName: signUpBrand,
      websiteUrl: signUpWebsite,
      password: signUpPassword,
    });
    setLoading(false);
    if (res.success && res.requiresVerification) {
      setVerificationEmail(signUpEmail.trim().toLowerCase());
      if (res.code) {
        setBackupDisplayCode(res.code);
      }
      setResendCooldown(60);
      setTab('verify');
    } else if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Signup failed.');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await verifySignupEmail(verificationEmail, verificationCode);
    setLoading(false);
    if (res.success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.message || 'Verification failed.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    const res = await resendVerificationEmail(verificationEmail);
    setLoading(false);
    if (res.success) {
      if (res.code) {
        setBackupDisplayCode(res.code);
      }
      setResendCooldown(60);
    } else {
      setError(res.message);
    }
  };

  const handleWalletConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await connectWallet(walletInput);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Wallet connection failed.');
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await requestPasswordReset(resetEmail);
    setLoading(false);
    if (res.success) {
      setResetStep(2);
      if (res.code) {
        setResetCode(res.code);
      }
    } else {
      setError(res.message);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await resetPassword(resetEmail, resetCode, newPassword);
    setLoading(false);
    if (res.success) {
      setResetSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemo = async (role: 'founder' | 'builder' | 'crypto') => {
    if (role === 'founder') {
      await login('contact.team.starsclub@gmail.com');
    } else if (role === 'builder') {
      await login('alex@indiehackers.dev');
    } else {
      await connectWallet('0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 shadow-lg shadow-indigo-600/20 mb-1">
            <span className="font-mono text-lg font-bold text-white tracking-wider">AT</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {tab === 'signin' && 'Welcome Back to AdsToto'}
            {tab === 'signup' && 'Create Advertiser Account'}
            {tab === 'wallet' && 'Web3 Wallet Sign In'}
            {tab === 'forgot' && 'Reset Account Password'}
            {tab === 'verify' && 'Verify Your Email'}
          </h2>
          <p className="text-xs text-slate-400">
            {tab === 'forgot'
              ? 'Receive an automated verification email code to set your new password.'
              : tab === 'verify'
              ? 'Enter the 6-digit confirmation code dispatched to your inbox to activate your account.'
              : 'Track real-time ad statistics, manage bids, and climb the leaderboard.'}
          </p>
        </div>

        {/* Tab Switcher (Visible unless in password reset or email verification mode) */}
        {tab !== 'forgot' && tab !== 'verify' ? (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('wallet');
                setError(null);
              }}
              className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                tab === 'wallet'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Web3</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
              setResetSuccessMessage(null);
              setVerificationSuccess(false);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setResetEmail(signInEmail);
                    setError(null);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Ads Dashboard'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP (Triggers Confirmation Email) */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Your Name</label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Satoshi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Brand / Project</label>
                <input
                  type="text"
                  required
                  value={signUpBrand}
                  onChange={(e) => setSignUpBrand(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address (Confirmation Sent)</label>
              <input
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" />
                <span>Automated welcome confirmation email will be sent</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Website or Product URL</label>
              <input
                type="url"
                value={signUpWebsite}
                onChange={(e) => setSignUpWebsite(e.target.value)}
                placeholder="https://yourproduct.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Create Account & Send Confirmation'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: WEB3 CONNECT */}
        {tab === 'wallet' && (
          <form onSubmit={handleWalletConnect} className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Wallet className="w-4 h-4" />
                <span>Web3 Wallet Authentication</span>
              </div>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                Connect your BEP-20 or EVM wallet to link on-chain verified payment receipts directly to your advertiser account.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Wallet Address (BEP-20 / EVM)</label>
              <input
                type="text"
                required
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet &amp; Sign In</span>
            </button>
          </form>
        )}

        {/* TAB 4: FORGOT / RESET PASSWORD */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {resetSuccessMessage ? (
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Password Reset Successful!</h4>
                <p className="text-xs text-emerald-300">{resetSuccessMessage}</p>
              </div>
            ) : resetStep === 1 ? (
              <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-400">
                    <Mail className="w-4 h-4" />
                    <span>Email Code Dispatch</span>
                  </div>
                  <p className="text-[11px] text-indigo-300/80">
                    Enter your account email. We will send a secure 6-digit one-time password (OTP) verification code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Account Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Dispatching Email...' : 'Send 6-Digit Reset Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                  <p className="text-[11px]">
                    Enter the 6-digit verification code sent to <strong>{resetEmail}</strong> and your new password.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold tracking-widest text-center text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: EMAIL VERIFICATION */}
        {tab === 'verify' && (
          <div className="space-y-4">
            {verificationSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Email Verified Successfully!</h4>
                <p className="text-xs text-emerald-300">
                  Your advertiser account is activated. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-400">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Enter Confirmation Code</span>
                  </div>
                  <p className="text-[11px] text-indigo-300/90 leading-relaxed">
                    We dispatched a 6-digit confirmation code to:
                  </p>
                  <div className="font-mono font-bold text-white bg-indigo-900/40 px-2.5 py-1 rounded border border-indigo-400/20 text-xs truncate">
                    {verificationEmail || 'your email'}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    💡 Check your Inbox and your <strong>Spam / Promotions</strong> folder.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                    {backupDisplayCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationCode(backupDisplayCode);
                          setShowDirectCode(true);
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-fill Code</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-xl font-mono font-extrabold tracking-[0.3em] text-center text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{loading ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 font-medium transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>

                {/* Instant Reveal / Auto-Fill Option */}
                {backupDisplayCode && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowDirectCode(!showDirectCode)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span>Email delayed or in Spam?</span>
                      <span className="text-amber-400 font-semibold underline">
                        {showDirectCode ? 'Hide Code' : 'View Code on Screen'}
                      </span>
                    </button>
                    {showDirectCode && (
                      <div className="mt-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-center animate-in fade-in duration-150">
                        <div className="text-[10px] text-amber-300 uppercase font-mono tracking-wider">
                          Your Verification Code:
                        </div>
                        <div className="text-xl font-mono font-bold text-amber-400 tracking-[0.25em] mt-0.5">
                          {backupDisplayCode}
                        </div>
                        <button
                          type="button"
                          onClick={() => setVerificationCode(backupDisplayCode)}
                          className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                          Click to insert this code into the box above
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* Instant 1-Click Fast Logins */}
        {tab !== 'forgot' && tab !== 'verify' && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 text-center">
              Or Quick 1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('founder')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-amber-400 flex items-center gap-1">
                  <span>Stars Club</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">contact.team.starsclub</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('crypto')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-indigo-400 flex items-center gap-1">
                  <span>Web3 Wallet</span>
                  <Wallet className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">0x71C8...6F22</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
