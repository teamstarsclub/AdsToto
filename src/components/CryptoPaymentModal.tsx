import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { CryptoPaymentReceipt } from '../types/ad';
import { verifyCryptoPaymentOnChain } from '../utils/cryptoVerification';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

interface CryptoPaymentModalProps {
  amountUsd: number;
  purposeTitle: string; // e.g., "Outbid CogniFlow AI" or "Launch New Ad"
  onPaymentSuccess: (receipt: CryptoPaymentReceipt) => void;
  onClose: () => void;
}

export const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({
  amountUsd,
  purposeTitle,
  onPaymentSuccess,
  onClose,
}) => {
  const { payoutSettings } = useAds();

  const [network, setNetwork] = useState<'bsc' | 'polygon' | 'solana' | 'ethereum'>('bsc');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<CryptoPaymentReceipt | null>(null);

  // Determine current receiving wallet address
  const activeRecipientAddress =
    network === 'bsc'
      ? payoutSettings.bscAddress || payoutSettings.polygonAddress || payoutSettings.ethereumAddress
      : network === 'solana'
      ? payoutSettings.solanaAddress
      : network === 'ethereum'
      ? payoutSettings.ethereumAddress
      : payoutSettings.polygonAddress;

  const tokenName =
    network === 'bsc'
      ? 'USDT / USDC (BEP-20)'
      : network === 'solana'
      ? 'USDC'
      : 'USDT / USDC';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeRecipientAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Run real on-chain transaction hash verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = txHash.trim();
    if (!clean) {
      setVerificationError('Please enter your transaction hash (TxID / Signature).');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationStep(`Querying ${network === 'bsc' ? 'BNB Smart Chain RPC' : network.toUpperCase()} for ${clean.substring(0, 10)}...`);

    try {
      const result = await verifyCryptoPaymentOnChain(
        clean,
        network,
        activeRecipientAddress,
        amountUsd,
        false // live mode verification
      );

      if (result.verified && result.receipt) {
        setVerifiedReceipt(result.receipt);
        setTimeout(() => {
          onPaymentSuccess(result.receipt!);
        }, 1600);
      } else {
        setVerificationError(result.message);
      }
    } catch (err: unknown) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
      setVerificationStep('');
    }
  };

  // SVG QR Code generator for the deposit address
  const generateQrUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(text)}&bgcolor=0f172a&color=f8fafc`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Automated On-Chain Crypto Settlement</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Complete Payment: ${amountUsd}.00
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {purposeTitle} · Zero middleman, verified directly on the public blockchain.
          </p>
        </div>

        {verifiedReceipt ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-white">Payment Confirmed On-Chain!</h3>
            <p className="text-xs text-emerald-300">
              Transaction verified on {verifiedReceipt.network === 'bsc' ? 'BNB Smart Chain' : verifiedReceipt.network.toUpperCase()} in block #{verifiedReceipt.blockNumber}.
              Your campaign rank is now active across adstoto.com!
            </p>
            <div className="pt-2">
              <a
                href={verifiedReceipt.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-mono underline"
              >
                <span>View on {verifiedReceipt.network === 'bsc' ? 'BscScan' : 'Block Explorer'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Network Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Blockchain Network</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bsc', label: 'BNB Chain', sub: 'BEP-20', fee: '<$0.03 gas · 3s', badge: 'Main / USDT' },
                  { id: 'polygon', label: 'Polygon', sub: 'PoS', fee: '<$0.01 gas', badge: '' },
                  { id: 'solana', label: 'Solana', sub: 'SPL', fee: '400ms finality', badge: '' },
                  { id: 'ethereum', label: 'Ethereum', sub: 'ERC-20', fee: 'Mainnet', badge: '' },
                ].map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => {
                      setNetwork(net.id as any);
                      setVerificationError(null);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      network === net.id
                        ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold leading-tight">{net.label}</span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono font-medium">{net.sub}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{net.fee}</div>
                    {net.badge && (
                      <span className="inline-block mt-1 text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {net.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">Amount Due</span>
                  <div className="text-xl font-mono font-bold text-amber-400 mt-0.5" data-tabular>
                    ${amountUsd}.00 <span className="text-xs font-normal text-slate-300">{tokenName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Network</div>
                  <div className="text-xs font-semibold text-white uppercase">{network === 'bsc' ? 'BNB Chain (BEP20)' : network}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    {network === 'bsc' ? 'gas ~$0.02 · 3s' : 'low fee'}
                  </div>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Send to Deposit Address:</span>
                  <span className="text-[10px] text-slate-500">{network === 'bsc' ? 'BEP-20 Wallet' : 'Direct payout'}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
                  <span className="truncate flex-1 select-all">{activeRecipientAddress}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy Address"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* QR Code & Transfer Instructions */}
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={generateQrUrl(activeRecipientAddress)}
                  alt="Payment QR"
                  className="w-18 h-18 rounded-lg border border-slate-700 p-1 bg-slate-900 shrink-0"
                />
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p className="text-slate-200 font-medium">How to complete payment:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                    <li>
                      Send <strong>${amountUsd}.00</strong> in {tokenName} on{' '}
                      <strong>{network === 'bsc' ? 'BNB Smart Chain (BEP-20)' : network.toUpperCase()}</strong>.
                    </li>
                    <li>Copy your <strong>Transaction Hash (TxID)</strong> from your wallet or BscScan.</li>
                    <li>Paste below to automatically verify on the public blockchain!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* TxID Automated Verification Form */}
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-xs text-slate-300">
                  Transaction Hash (TxID / Signature)
                </label>
                <input
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => {
                    setTxHash(e.target.value);
                    setVerificationError(null);
                  }}
                  placeholder={
                    network === 'solana'
                      ? 'e.g. 5Kx2s8J... (Base58 signature)'
                      : 'e.g. 0x4a8f9c... (66 character hex string)'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
                <p className="text-[10px] text-slate-500">
                  Our automated verifier connects directly to public blockchain RPC nodes to confirm receipt.
                </p>
              </div>

              {/* Verification Error Notice */}
              {verificationError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1 leading-relaxed">{verificationError}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-2 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{verificationStep || 'Verifying On-Chain...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Real On-Chain Tx</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
