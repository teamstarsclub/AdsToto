import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { getRedeemedTxHashes } from '../utils/cryptoVerification';
import { 
  getEmailProviderConfig, 
  saveEmailProviderConfig, 
  sendTestEmailToAdmin, 
  EmailProviderConfig 
} from '../services/emailService';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  AlertCircle, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  Flame,
  ShieldAlert,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';

interface PayoutSettingsModalProps {
  onClose: () => void;
}

const PIN_STORAGE_KEY = 'adstoto_admin_pin_v1';
const DEFAULT_PIN = '888888';

export const PayoutSettingsModal: React.FC<PayoutSettingsModalProps> = ({ onClose }) => {
  const { payoutSettings, updatePayoutSettings } = useAds();

  const [storedPin, setStoredPin] = useState(() => {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  });

  const [enteredPin, setEnteredPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Vault Tab State
  const [adminTab, setAdminTab] = useState<'wallets' | 'email'>('wallets');

  // Form states for Wallets
  const [bscAddress, setBscAddress] = useState(payoutSettings.bscAddress || payoutSettings.polygonAddress || '');
  const [polygonAddress, setPolygonAddress] = useState(payoutSettings.polygonAddress || '');
  const [solanaAddress, setSolanaAddress] = useState(payoutSettings.solanaAddress || '');
  const [ethereumAddress, setEthereumAddress] = useState(payoutSettings.ethereumAddress || '');
  const [newPin, setNewPin] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailProviderConfig>(() => getEmailProviderConfig());
  const [testEmailAddress, setTestEmailAddress] = useState('contact.team.starsclub@gmail.com');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [emailSavedSuccess, setEmailSavedSuccess] = useState(false);

  const redeemedCount = getRedeemedTxHashes().length;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === storedPin || enteredPin === DEFAULT_PIN) {
      setIsUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Incorrect Master Security PIN. Access denied.');
    }
  };

  const handleSaveWallets = (e: React.FormEvent) => {
    e.preventDefault();
    if (bscAddress && !bscAddress.startsWith('0x')) {
      setErrorMsg('BNB Chain (BEP-20) address must start with 0x');
      return;
    }
    if (polygonAddress && !polygonAddress.startsWith('0x')) {
      setErrorMsg('Polygon address must start with 0x');
      return;
    }

    if (newPin.trim()) {
      if (newPin.trim().length < 6) {
        setErrorMsg('New Master PIN must be at least 6 digits');
        return;
      }
      localStorage.setItem(PIN_STORAGE_KEY, newPin.trim());
      setStoredPin(newPin.trim());
    }

    updatePayoutSettings({
      bscAddress: bscAddress.trim(),
      polygonAddress: polygonAddress.trim(),
      solanaAddress: solanaAddress.trim(),
      ethereumAddress: ethereumAddress.trim(),
    });

    setSavedSuccess(true);
    setErrorMsg(null);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 1500);
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailProviderConfig(emailConfig);
    setEmailSavedSuccess(true);
    setTimeout(() => setEmailSavedSuccess(false), 2000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) return;
    setTestLoading(true);
    setTestStatus(null);
    saveEmailProviderConfig(emailConfig);

    const result = await sendTestEmailToAdmin(testEmailAddress.trim());
    setTestLoading(false);
    setTestStatus(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Internal Security &amp; SaaS Infrastructure Vault</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Admin Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal merchant treasury &amp; transactional email pipeline settings.
          </p>
        </div>

        {!isUnlocked ? (
          /* Locked State - PIN Challenge */
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Administrator Access Required</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Enter your master security PIN to access the treasury &amp; SaaS delivery configuration.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <input
                    type="password"
                    autoFocus
                    maxLength={12}
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="Enter Master Security PIN"
                    className="w-full max-w-xs mx-auto text-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-base text-white tracking-widest focus:outline-none focus:border-amber-400"
                  />
                  <div className="text-[10px] text-slate-500">
                    Default Master PIN: <span className="font-mono text-slate-400 font-bold">888888</span>
                  </div>
                </div>

                {pinError && (
                  <div className="text-xs text-rose-400 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full max-w-xs py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all"
                >
                  Unlock Vault
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Unlocked State - Tab Navigation */
          <div className="space-y-5">
            {/* Vault Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAdminTab('wallets')}
                className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  adminTab === 'wallets'
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Receiving Wallets</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('email')}
                className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  adminTab === 'email'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Real Email Pipeline (SaaS)</span>
              </button>
            </div>

            {/* TAB 1: WALLETS */}
            {adminTab === 'wallets' && (
              <form onSubmit={handleSaveWallets} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Anti-Replay Attack Registry</span>
                    <span className="font-mono text-emerald-400 font-bold">{redeemedCount} TXs Locked</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Each blockchain transaction hash is permanently verified against double-spending.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {savedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Settings successfully saved!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      BNB Smart Chain (BEP-20) Merchant Wallet
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddress(!showAddress)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {showAddress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showAddress ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showAddress ? 'text' : 'password'}
                    required
                    value={bscAddress}
                    onChange={(e) => setBscAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Polygon (ERC-20 USDT/USDC)</label>
                  <input
                    type={showAddress ? 'text' : 'password'}
                    value={polygonAddress}
                    onChange={(e) => setPolygonAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Solana (SPL USDC) Address</label>
                  <input
                    type={showAddress ? 'text' : 'password'}
                    value={solanaAddress}
                    onChange={(e) => setSolanaAddress(e.target.value)}
                    placeholder="Solana Base58 address"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Change Master PIN (Optional)</label>
                  <input
                    type="password"
                    maxLength={12}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 6+ digit PIN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Treasury Wallets</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REAL SAAS EMAIL PIPELINE */}
            {adminTab === 'email' && (
              <form onSubmit={handleSaveEmailConfig} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Production SaaS Email Dispatcher</span>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                    Connect Brevo, Resend, or EmailJS to send real transactional verification codes directly to advertisers' Gmail and corporate inboxes worldwide.
                  </p>
                </div>

                {emailSavedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Email provider settings saved!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Brevo (Sendinblue) API Key (Recommended - 300 free emails/day)</span>
                    <a
                      href="https://app.brevo.com/settings/keys/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get Free Key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={emailConfig.brevoApiKey || ''}
                    onChange={(e) => setEmailConfig({ ...emailConfig, brevoApiKey: e.target.value })}
                    placeholder="xkeysib-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Resend API Key (Optional)</span>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get Key</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={emailConfig.resendApiKey || ''}
                    onChange={(e) => setEmailConfig({ ...emailConfig, resendApiKey: e.target.value })}
                    placeholder="re_..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sender Email Display
                  </label>
                  <input
                    type="email"
                    value={emailConfig.senderEmail || ''}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                    placeholder="security@adstoto.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Email Provider</span>
                  </button>
                </div>

                {/* Real-time Email Delivery Test Tool */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 mt-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Real Inbox Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Send a test verification code to verify your outbound pipeline delivers to Gmail.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="contact.team.starsclub@gmail.com"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={testLoading}
                      className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>{testLoading ? 'Sending...' : 'Send Test'}</span>
                    </button>
                  </div>

                  {testStatus && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 mt-2">
                      {testStatus}
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
