import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { AdCampaign } from '../types/ad';
import { X, Swords, Zap, CheckCircle2, TrendingUp, Trophy } from 'lucide-react';

interface PickAFightModalProps {
  targetCampaign: AdCampaign | null;
  onClose: () => void;
  onOpenCreateCampaign: () => void;
}

export const PickAFightModal: React.FC<PickAFightModalProps> = ({
  targetCampaign,
  onClose,
  onOpenCreateCampaign,
}) => {
  const { campaigns, outbidCampaign } = useAds();
  const userCampaigns = campaigns.filter((c) => c.isUserOwned);

  const [yourCampaignId, setYourCampaignId] = useState<string>(
    userCampaigns.length > 0 ? userCampaigns[0].id : ''
  );

  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!targetCampaign) return null;

  const yourCampaign = campaigns.find((c) => c.id === yourCampaignId);
  const bidDifference = yourCampaign ? targetCampaign.bidAmount - yourCampaign.bidAmount : targetCampaign.bidAmount;
  const overtakeBid = targetCampaign.bidAmount + 10;
  const dominateBid = targetCampaign.bidAmount + 50;

  const handleFight = (amount: number) => {
    if (!yourCampaignId) return;
    const res = outbidCampaign(targetCampaign.id, yourCampaignId, amount);
    if (res.success) {
      setResultMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/80 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Head-to-Head Pay-to-Rank Duel</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Pick a Fight: Rank #{targetCampaign.rank}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Directly challenge {targetCampaign.title} and seize their live traffic allocation on adstoto.com.
          </p>
        </div>

        {/* Head-to-Head Fighter Cards */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg ring-4 ring-slate-900">
            VS
          </div>

          {/* Left Fighter: Your Campaign */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-[10px] text-indigo-400 font-mono font-bold uppercase">Your Champion</div>

            {userCampaigns.length > 0 ? (
              <>
                <select
                  value={yourCampaignId}
                  onChange={(e) => setYourCampaignId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                >
                  {userCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                {yourCampaign && (
                  <div className="space-y-1 pt-1 font-mono text-xs">
                    <div className="text-slate-400">
                      Rank: <span className="text-white font-bold" data-tabular>#{yourCampaign.rank}</span>
                    </div>
                    <div className="text-slate-400">
                      Bid: <span className="text-emerald-400 font-bold" data-tabular>${yourCampaign.bidAmount}</span>
                    </div>
                    <div className="text-slate-400">
                      Clicks: <span className="text-white" data-tabular>{yourCampaign.clicks}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-400 py-3">
                No active campaign.
                <button
                  type="button"
                  onClick={onOpenCreateCampaign}
                  className="text-indigo-400 font-bold block mt-1 hover:underline"
                >
                  + Launch Campaign First
                </button>
              </div>
            )}
          </div>

          {/* Right Fighter: Rival Target */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">Rival Defender</div>
            <div className="font-bold text-white text-sm truncate">{targetCampaign.title}</div>
            <div className="space-y-1 pt-1 font-mono text-xs">
              <div className="text-slate-400">
                Rank: <span className="text-white font-bold" data-tabular>#{targetCampaign.rank}</span>
              </div>
              <div className="text-slate-400">
                Bid: <span className="text-amber-400 font-bold" data-tabular>${targetCampaign.bidAmount}</span>
              </div>
              <div className="text-slate-400">
                Clicks: <span className="text-white" data-tabular>{targetCampaign.clicks}</span>
              </div>
            </div>
          </div>
        </div>

        {resultMsg ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Duel Won!</h3>
            <p className="text-xs text-emerald-300">{resultMsg}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Required to Leapfrog Rank #{targetCampaign.rank}:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm" data-tabular>
                ${overtakeBid}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleFight(overtakeBid)}
                disabled={!yourCampaignId}
                className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-md transition-all hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Overtake (${overtakeBid})</span>
              </button>

              <button
                onClick={() => handleFight(dominateBid)}
                disabled={!yourCampaignId}
                className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl shadow-md shadow-amber-400/20 transition-all hover:scale-[1.01]"
              >
                <Trophy className="w-4 h-4 fill-slate-900" />
                <span>Dominate (${dominateBid})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
