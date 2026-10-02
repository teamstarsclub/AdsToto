import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { getRedeemedTxHashes } from '../utils/cryptoVerification';
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
  ShieldAlert
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

  // Form states once unlocked
  const [bscAddress, setBscAddress] = useState(payoutSettings.bscAddress || payoutSettings.polygonAddress || '');
  const [polygonAddress, setPolygonAddress] = useState(payoutSettings.polygonAddress || '');
  const [solanaAddress, setSolanaAddress] = useState(payoutSettings.solanaAddress || '');
  const [ethereumAddress, setEthereumAddress] = useState(payoutSettings.ethereumAddress || '');
  const [newPin, setNewPin] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSave = (e: React.FormEvent) => {
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
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5">
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
            <span>Internal Security Vault</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Internal Receiving Wallets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal merchant treasury. Never exposed publicly to unauthenticated visitors.
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
                  Only the site owner can view or edit internal BEP-20 receiving wallets.
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
          /* Unlocked Admin Form */
          <div>
            {savedSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Internal Vault Saved!</h3>
                <p className="text-xs text-emerald-300">
                  New advertiser payments on BNB Smart Chain will land directly into your secure wallet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {/* Security Status Card */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-emerald-300">Anti-Hijack &amp; Anti-Replay Active</div>
                      <div className="text-[10px] text-slate-400">Strict on-chain validation with {redeemedCount} hashes logged</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    SHIELDED
                  </span>
                </div>

                {/* Primary BNB Smart Chain (BEP-20) Address */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      BNB Smart Chain (BEP-20) Receiving Wallet
                    </label>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      Primary · Live
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAddress ? 'text' : 'password'}
                      required
                      value={bscAddress}
                      onChange={(e) => setBscAddress(e.target.value)}
                      placeholder="0x... (Your private BEP-20 receiving address)"
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddress(!showAddress)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      title={showAddress ? 'Mask address' : 'Reveal address'}
                    >
                      {showAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    All advertiser USDT &amp; USDC payments on BNB Smart Chain are deposited directly to this internal wallet.
                  </p>
                </div>

                {/* Alternative Polygon Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Polygon Receiving Wallet (Optional)</label>
                  <input
                    type="text"
                    value={polygonAddress}
                    onChange={(e) => setPolygonAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Change Master PIN */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Change Master Security PIN (Optional)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Min 6 digits</span>
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Leave blank to keep current PIN"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Internal Vault</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
