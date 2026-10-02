import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { AdCampaign, CryptoPaymentReceipt } from '../types/ad';
import { CryptoPaymentModal } from './CryptoPaymentModal';
import { X, Zap, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react';

interface OutbidModalProps {
  targetCampaign: AdCampaign | null;
  onClose: () => void;
  onOpenCreateCampaign: () => void;
}

export const OutbidModal: React.FC<OutbidModalProps> = ({
  targetCampaign,
  onClose,
  onOpenCreateCampaign,
}) => {
  const { campaigns, outbidCampaign, createCampaign } = useAds();
  const userCampaigns = campaigns.filter((c) => c.isUserOwned);

  // Auto-select first user campaign or fallback
  const [selectedYourCampaignId, setSelectedYourCampaignId] = useState<string>(() => {
    if (userCampaigns.length > 0) {
      // Don't default to the target itself if target is user owned
      const other = userCampaigns.find((c) => c.id !== targetCampaign?.id);
      return other ? other.id : userCampaigns[0].id;
    }
    const demo = campaigns.find((c) => c.id === 'camp-6');
    return demo ? demo.id : campaigns[0]?.id || '';
  });

  const minRequiredBid = targetCampaign ? targetCampaign.bidAmount + 1 : 10;
  const [bidAmount, setBidAmount] = useState<number>(minRequiredBid);
  const [enableShield, setEnableShield] = useState<boolean>(true);
  const [successResult, setSuccessResult] = useState<string | null>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);
  const [showCryptoModal, setShowCryptoModal] = useState<boolean>(false);

  if (!targetCampaign) return null;

  const yourCampaign = campaigns.find((c) => c.id === selectedYourCampaignId);

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    let effectiveCampId = selectedYourCampaignId;

    if (!effectiveCampId || effectiveCampId === targetCampaign.id) {
      // Auto-fallback to another campaign
      const fallback = campaigns.find((c) => c.id !== targetCampaign.id);
      if (fallback) {
        effectiveCampId = fallback.id;
        setSelectedYourCampaignId(fallback.id);
      }
    }

    if (bidAmount <= targetCampaign.bidAmount) {
      setErrorResult(`Bid must exceed the rival's current bid of $${targetCampaign.bidAmount}`);
      return;
    }

    setErrorResult(null);
    setShowCryptoModal(true);
  };

  const handlePaymentSuccess = (receipt: CryptoPaymentReceipt) => {
    setShowCryptoModal(false);
    const result = outbidCampaign(targetCampaign.id, selectedYourCampaignId, bidAmount, receipt);
    if (result.success) {
      setSuccessResult(result.message);
      setErrorResult(null);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setErrorResult(result.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Pay-to-Rank Outbid Arena</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Outbid {targetCampaign.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Seize Rank #{targetCampaign.rank} by placing a higher active bid. Ranks update immediately across adstoto.com upon on-chain verification.
            </p>
          </div>

          {/* Rival vs You comparison strip */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <div className="text-slate-500 font-mono text-[10px] uppercase">Rival Target</div>
              <div className="font-bold text-white truncate text-sm mt-0.5">{targetCampaign.title}</div>
              <div className="text-amber-400 font-mono font-bold mt-1" data-tabular>
                Rank #{targetCampaign.rank} · ${targetCampaign.bidAmount}
              </div>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <div className="text-slate-500 font-mono text-[10px] uppercase">Target Leapfrog</div>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">New Rank #{targetCampaign.rank}</div>
              <div className="text-slate-300 font-mono mt-1" data-tabular>
                Minimum: ${minRequiredBid}
              </div>
            </div>
          </div>

          {successResult ? (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Outbid Successful!</h3>
              <p className="text-xs text-emerald-300">{successResult}</p>
            </div>
          ) : (
            <form onSubmit={handleOpenPayment} className="space-y-5">
              {/* Select Your Campaign */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Choose Your Campaign to Rank Up</label>
                  {userCampaigns.length === 0 && (
                    <button
                      type="button"
                      onClick={onOpenCreateCampaign}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                    >
                      + Create One First
                    </button>
                  )}
                </div>

                {userCampaigns.length > 0 ? (
                  <select
                    value={selectedYourCampaignId}
                    onChange={(e) => setSelectedYourCampaignId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {userCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (Currently Rank #{c.rank} · ${c.bidAmount} active bid)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800 text-xs text-amber-300 flex items-center justify-between">
                    <span>You don't have a campaign yet to bid with.</span>
                    <button
                      type="button"
                      onClick={onOpenCreateCampaign}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition-colors"
                    >
                      Create Ad
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Quick Bid Presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map((inc) => {
                    const presetBid = targetCampaign.bidAmount + inc;
                    return (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setBidAmount(presetBid)}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-colors border ${
                          bidAmount === presetBid
                            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                        data-tabular
                      >
                        +${inc} (${presetBid})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Bid Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Total New Bid ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={minRequiredBid}
                    step="any"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                    data-tabular
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Minimum required to outbid {targetCampaign.title} is ${minRequiredBid}
                </p>
              </div>

              {/* Auto-Bid Shield Option */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <input
                  type="checkbox"
                  id="enableShield"
                  checked={enableShield}
                  onChange={(e) => setEnableShield(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="enableShield" className="text-slate-300 cursor-pointer select-none">
                  Enable Auto-Bid Shield to protect this spot with a +$10 counter-raise
                </label>
              </div>

              {errorResult && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorResult}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedYourCampaignId || bidAmount < minRequiredBid}
                  className="flex-2 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Proceed to Crypto Pay (${bidAmount})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Automated Crypto Payment & On-Chain Verifier Modal */}
      {showCryptoModal && (
        <CryptoPaymentModal
          amountUsd={bidAmount}
          purposeTitle={`Outbid ${targetCampaign.title} to seize Rank #${targetCampaign.rank}`}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setShowCryptoModal(false)}
        />
      )}
    </>
  );
};
