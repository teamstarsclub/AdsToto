import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { ShieldCheck, Zap, AlertCircle, CheckCircle2, History } from 'lucide-react';

export const AutoBidderPanel: React.FC = () => {
  const { campaigns, updateAutoBidConfig, toggleAutoBid, activityFeed } = useAds();
  const userCampaigns = campaigns.filter((c) => c.isUserOwned);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    userCampaigns.length > 0 ? userCampaigns[0].id : campaigns[0]?.id || ''
  );

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const autoBidEvents = activityFeed.filter((a) => a.type === 'auto_defense');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Auto-Bid Shield &amp; Defense Guardrails</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Never get caught asleep when competitors try to outbid you. Automatically defend your top-tier rank within your budget ceiling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Configuration Guardrails */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            {/* Campaign Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Campaign to Shield
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Rank #{c.rank} · ${c.bidAmount} active bid) {c.isUserOwned ? '⭐ Your Ad' : ''}
                  </option>
                ))}
              </select>
            </div>

            {activeCampaign && (
              <>
                {/* Status Toggle Card */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${activeCampaign.autoBid.enabled ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Auto-Bid Shield: {activeCampaign.autoBid.enabled ? 'ACTIVE & MONITORING' : 'PAUSED'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {activeCampaign.autoBid.enabled
                          ? `Monitoring incoming rival bids to protect Rank #${activeCampaign.autoBid.targetRank} spot`
                          : 'Manual bidding only. Campaign will drop rank if outbid.'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAutoBid(activeCampaign.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      activeCampaign.autoBid.enabled
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                    }`}
                  >
                    {activeCampaign.autoBid.enabled ? 'Pause Shield' : 'Activate Shield'}
                  </button>
                </div>

                {/* Guardrail Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Target Rank */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-xs text-slate-600 font-medium">Target Rank Goal</label>
                    <select
                      value={activeCampaign.autoBid.targetRank}
                      onChange={(e) =>
                        updateAutoBidConfig(activeCampaign.id, {
                          targetRank: Number(e.target.value) as 1 | 3 | 5,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-2xs cursor-pointer"
                    >
                      <option value={1}>Rank #1 (Crown Spot)</option>
                      <option value={3}>Hold Top 3 Slots</option>
                      <option value={5}>Hold Top 5 Slots</option>
                    </select>
                    <p className="text-[11px] text-slate-500">Defend rank when pushed below target</p>
                  </div>

                  {/* Maximum Budget Ceiling */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-xs text-slate-600 font-medium">Max Budget Ceiling ($)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-xs font-mono">$</span>
                      <input
                        type="number"
                        min={activeCampaign.bidAmount}
                        max={5000}
                        step={25}
                        value={activeCampaign.autoBid.maxBudget}
                        onChange={(e) =>
                          updateAutoBidConfig(activeCampaign.id, {
                            maxBudget: Math.max(activeCampaign.bidAmount, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono shadow-2xs"
                        data-tabular
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Hard stop limit. Will never exceed.</p>
                  </div>

                  {/* Increment Step */}
                  <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-xs text-slate-600 font-medium">Counter-Bid Step ($)</label>
                    <select
                      value={activeCampaign.autoBid.incrementStep}
                      onChange={(e) =>
                        updateAutoBidConfig(activeCampaign.id, {
                          incrementStep: Number(e.target.value),
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 shadow-2xs cursor-pointer"
                    >
                      <option value={5}>+$5 Minimal Raise</option>
                      <option value={10}>+$10 Standard Counter</option>
                      <option value={20}>+$20 Aggressive Strike</option>
                      <option value={50}>+$50 Dominance Step</option>
                    </select>
                    <p className="text-[11px] text-slate-500">Amount to leapfrog rival by</p>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Defensive Logic:</strong> If a competitor bids higher than{' '}
                    <span className="font-mono text-slate-900 font-bold">${activeCampaign.bidAmount}</span> to overtake your{' '}
                    <span className="font-mono text-slate-900 font-bold">Rank #{activeCampaign.autoBid.targetRank}</span> position, 
                    the Auto-Bidder will automatically raise your bid by{' '}
                    <span className="font-mono text-slate-900 font-bold">+${activeCampaign.autoBid.incrementStep}</span> up to your maximum reserve ceiling of{' '}
                    <span className="font-mono text-slate-900 font-bold">${activeCampaign.autoBid.maxBudget}</span>.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Col: Defensive History Log */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Shield Defense Log</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {activeCampaign?.autoBid.defenseCount || 0} Defenses
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {autoBidEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No defensive battles recorded yet. The shield is on standby.
              </div>
            ) : (
              autoBidEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Defended Rank #{event.newRank}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600">{event.message}</p>
                  <div className="text-[11px] font-mono text-slate-700 font-medium" data-tabular>
                    New Bid: ${event.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
