import React from 'react';
import { useAds } from '../context/AdContext';
import { useAuth } from '../context/AuthContext';
import { AdCampaign } from '../types/ad';
import { 
  Plus, 
  ExternalLink, 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Play, 
  Pause, 
  Zap, 
  ShieldCheck,
  Trophy,
  LogIn,
  Sparkles,
  UserCheck,
  BarChart3
} from 'lucide-react';

interface MyCampaignsViewProps {
  onOpenNewCampaign: () => void;
  onEditCampaign: (campaign: AdCampaign) => void;
  onBoostBid: (campaign: AdCampaign) => void;
  onNavigateLeaderboard?: () => void;
  onOpenAuthModal?: () => void;
}

export const MyCampaignsView: React.FC<MyCampaignsViewProps> = ({
  onOpenNewCampaign,
  onEditCampaign,
  onBoostBid,
  onNavigateLeaderboard,
  onOpenAuthModal,
}) => {
  const { campaigns, deleteCampaign, updateCampaign, quickBoostBid, toggleAutoBid } = useAds();
  const { user } = useAuth();
  const myCampaigns = campaigns.filter((c) => c.isUserOwned);

  const totalBids = myCampaigns.reduce((sum, c) => sum + c.bidAmount, 0);
  const totalImpressions = myCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = myCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const bestRank = myCampaigns.length > 0 ? Math.min(...myCampaigns.map((c) => c.rank)) : null;

  return (
    <div className="space-y-6">
      {/* Header with User State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Advertising Command Center
            </h2>
            {user && (
              <>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{user.brandName}</span>
                </span>
                {user.isEmailVerified && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Verified SaaS Advertiser</span>
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time campaign telemetry, live leaderboard positions, and on-chain bid defense.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateLeaderboard && (
            <button
              onClick={onNavigateLeaderboard}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 rounded-lg transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-500" />
              <span>See Leaderboard</span>
            </button>
          )}

          <button
            onClick={onOpenNewCampaign}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Launch New Ad</span>
          </button>
        </div>
      </div>

      {/* Guest Sign-In Notice if not authenticated */}
      {!user && onOpenAuthModal && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Create an Advertiser Account to Save Your Stats</h4>
              <p className="text-[11px] text-slate-600">
                Sign in to link verified on-chain payment receipts, get automated counter-defense alerts, and keep campaigns across devices.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-2xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      )}

      {/* Aggregated Real-Time Performance Matrix */}
      {myCampaigns.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500">Total Active Stake</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1" data-tabular>
              ${totalBids}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across {myCampaigns.length} campaigns</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500">Best Leaderboard Rank</div>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1" data-tabular>
              {bestRank ? `#${bestRank}` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {bestRank === 1 ? '👑 Reigning Leader' : bestRank ? 'Leaderboard Contender' : 'Unranked'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500">Total Inbound Views</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1" data-tabular>
              {totalImpressions.toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">30-day verified delivery</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="text-[10px] font-mono uppercase text-slate-500">Clicks &amp; Click-Through</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1" data-tabular>
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5 font-mono font-bold">
              {avgCtr}% Average CTR
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Listing */}
      {myCampaigns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Active Campaigns Running</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Launch an ad starting at just $15 to claim high-visibility positions on the AdsToto leaderboard and start driving verified traffic.
            </p>
          </div>
          <button
            onClick={onOpenNewCampaign}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Launch Your First Ad Slot ($15)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myCampaigns.map((camp) => {
            const ctr = camp.impressions > 0 
              ? ((camp.clicks / camp.impressions) * 100).toFixed(1) 
              : '0.0';
            const cpc = camp.clicks > 0
              ? (camp.bidAmount / camp.clicks).toFixed(2)
              : '0.00';
            const attributedRevenue = camp.conversions * camp.avgConversionValue;
            const roas = camp.bidAmount > 0 ? Math.round((attributedRevenue / camp.bidAmount) * 100) : 0;

            return (
              <div
                key={camp.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-all relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${camp.iconBg} flex items-center justify-center text-white text-base font-bold font-mono shadow-xs border border-white/20 shrink-0`}>
                      {camp.iconSymbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {camp.title}
                        </h3>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Rank #{camp.rank}
                        </span>
                      </div>
                      <a
                        href={camp.destinationUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs text-blue-600 hover:text-blue-700 font-mono inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>{camp.displayUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateCampaign(camp.id, {
                          status: camp.status === 'active' ? 'paused' : 'active',
                        })
                      }
                      title={camp.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {camp.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => onEditCampaign(camp)}
                      title="Edit Campaign Details"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(camp.id)}
                      title="Delete Campaign"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {camp.tagline}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Active Bid</div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5" data-tabular>
                      ${camp.bidAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Total Clicks</div>
                    <div className="text-sm font-bold text-blue-700 font-mono mt-0.5" data-tabular>
                      {camp.clicks}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">CTR (CPC)</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5" data-tabular>
                      {ctr}% <span className="text-[10px] text-slate-500 font-normal">(${cpc})</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Est. ROAS</div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-0.5" data-tabular>
                      {roas}%
                    </div>
                  </div>
                </div>

                {/* Auto-Bid Status Strip & Quick Boost */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => toggleAutoBid(camp.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className={`w-4 h-4 ${camp.autoBid.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>Shield: {camp.autoBid.enabled ? 'Armed (Top ' + camp.autoBid.targetRank + ')' : 'Off'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => quickBoostBid(camp.id, 2)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                      <span>+$2</span>
                    </button>
                    <button
                      onClick={() => onBoostBid(camp)}
                      className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Boost Rank</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
