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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Head-to-Head Pay-to-Rank Duel</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pick a Fight: Rank #{targetCampaign.rank}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Directly challenge {targetCampaign.title} and seize their live traffic allocation on adstoto.com.
          </p>
        </div>

        {/* Head-to-Head Fighter Cards */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-white">
            VS
          </div>

          {/* Left Fighter: Your Campaign */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-[10px] text-blue-600 font-mono font-bold uppercase">Your Champion</div>

            {userCampaigns.length > 0 ? (
              <>
                <select
                  value={yourCampaignId}
                  onChange={(e) => setYourCampaignId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {userCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                {yourCampaign && (
                  <div className="space-y-1 pt-1 font-mono text-xs">
                    <div className="text-slate-500">
                      Rank: <span className="text-slate-900 font-bold" data-tabular>#{yourCampaign.rank}</span>
                    </div>
                    <div className="text-slate-500">
                      Bid: <span className="text-emerald-600 font-bold" data-tabular>${yourCampaign.bidAmount}</span>
                    </div>
                    <div className="text-slate-500">
                      Clicks: <span className="text-slate-900" data-tabular>{yourCampaign.clicks}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-500 py-3">
                No active campaign.
                <button
                  type="button"
                  onClick={onOpenCreateCampaign}
                  className="text-blue-600 font-semibold block mt-1 hover:underline cursor-pointer"
                >
                  + Launch Campaign First
                </button>
              </div>
            )}
          </div>

          {/* Right Fighter: Rival Target */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-[10px] text-slate-600 font-mono font-bold uppercase">Rival Defender</div>
            <div className="font-bold text-slate-900 text-sm truncate">{targetCampaign.title}</div>
            <div className="space-y-1 pt-1 font-mono text-xs">
              <div className="text-slate-500">
                Rank: <span className="text-slate-900 font-bold" data-tabular>#{targetCampaign.rank}</span>
              </div>
              <div className="text-slate-500">
                Bid: <span className="text-slate-900 font-bold" data-tabular>${targetCampaign.bidAmount}</span>
              </div>
              <div className="text-slate-500">
                Clicks: <span className="text-slate-900" data-tabular>{targetCampaign.clicks}</span>
              </div>
            </div>
          </div>
        </div>

        {resultMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Duel Won!</h3>
            <p className="text-xs text-emerald-800">{resultMsg}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Required to Leapfrog Rank #{targetCampaign.rank}:</span>
              <span className="font-mono font-bold text-emerald-600 text-sm" data-tabular>
                ${overtakeBid}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleFight(overtakeBid)}
                disabled={!yourCampaignId}
                className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Overtake (${overtakeBid})</span>
              </button>

              <button
                onClick={() => handleFight(dominateBid)}
                disabled={!yourCampaignId}
                className="flex items-center justify-center gap-1.5 py-3 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>Dominate (${dominateBid})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
