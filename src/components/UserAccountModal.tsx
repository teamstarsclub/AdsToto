import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdContext';
import { AdCampaign } from '../types/ad';
import { 
  X, 
  Trophy, 
  BarChart3, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  Globe, 
  Layers, 
  ArrowUpRight, 
  Sparkles, 
  Wallet, 
  Edit3, 
  Check, 
  Flame,
  Plus
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel') => void;
  onOpenCreateAd: () => void;
  onOpenOutbid: (campaign: AdCampaign) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenCreateAd,
  onOpenOutbid,
}) => {
  const { user, logout, updateProfile } = useAuth();
  const { campaigns, quickBoostBid, toggleAutoBid } = useAds();

  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState(user?.brandName || '');
  const [newWebsite, setNewWebsite] = useState(user?.websiteUrl || '');

  if (!isOpen || !user) return null;

  // Filter user owned campaigns
  const userCampaigns = campaigns.filter((c) => c.isUserOwned);

  // Compute aggregated real statistics
  const totalBids = userCampaigns.reduce((sum, c) => sum + c.bidAmount, 0);
  const totalImpressions = userCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = userCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = userCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const bestRank = userCampaigns.length > 0 ? Math.min(...userCampaigns.map((c) => c.rank)) : null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      brandName: newBrandName,
      websiteUrl: newWebsite,
    });
    setIsEditingBrand(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${user.avatarBg || 'from-amber-500 to-indigo-600'} flex items-center justify-center shadow-lg text-white font-mono text-xl font-bold ring-2 ring-white/10 shrink-0`}>
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user.tier}
                </span>
                {user.authProvider === 'google' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <span>Google Verified</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{user.email}</span>
                {user.walletAddress && (
                  <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/30">
                    {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                  </span>
                )}
              </div>
              <div className="text-xs text-indigo-400 font-medium mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Brand: <strong>{user.brandName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsEditingBrand(!isEditingBrand)}
              className="p-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 rounded-lg border border-rose-900/50 transition-colors flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Inline Profile Editor */}
        {isEditingBrand && (
          <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-white">Update Brand Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400">Brand / Project Name</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Website URL</label>
                <input
                  type="url"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingBrand(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* REAL-TIME ADVERTISER STATS GRID */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Real-Time Ad Performance &amp; Numbers</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Stake */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Active Capital</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1" data-tabular>
                ${totalBids}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {userCampaigns.length} ads</div>
            </div>

            {/* Best Rank */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Peak Leaderboard</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1" data-tabular>
                {bestRank ? `#${bestRank}` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {bestRank === 1 ? '👑 Reigning Champion' : bestRank ? 'Active Contender' : 'No active ads'}
              </div>
            </div>

            {/* Total Impressions */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Views</div>
              <div className="text-xl font-bold font-mono text-white mt-1" data-tabular>
                {totalImpressions.toLocaleString()}
              </div>
              <div className="text-[10px] text-indigo-400 mt-0.5 font-medium">30-day verified</div>
            </div>

            {/* Total Clicks & CTR */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Clicks &amp; CTR</div>
              <div className="text-xl font-bold font-mono text-white mt-1" data-tabular>
                {totalClicks.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-mono font-semibold">
                {avgCtr}% CTR (2.4x avg)
              </div>
            </div>
          </div>
        </div>

        {/* QUICK NAVIGATION ACTION BAR */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Track &amp; Boost Campaigns</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('leaderboard');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>See Leaderboard</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCreateAd();
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Launch New Ad</span>
            </button>
          </div>
        </div>

        {/* YOUR ACTIVE CAMPAIGNS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Your Active Ads Portfolio ({userCampaigns.length})</span>
            </h4>
            <button
              onClick={() => {
                onClose();
                onNavigateTab('my-campaigns');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Manage in My Ads</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {userCampaigns.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-white">No Active Campaigns Yet</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Launch your first ad starting at just $15 to get featured on the AdsToto leaderboard and start driving traffic.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateAd();
                }}
                className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                Launch Your First Ad Now
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {camp.iconSymbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{camp.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Rank #{camp.rank}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{camp.tagline}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-amber-400" data-tabular>
                        ${camp.bidAmount} active bid
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {camp.autoBid.enabled ? '🛡️ Auto-Defense ON' : 'Manual bid'}
                      </div>
                    </div>
                  </div>

                  {/* Micro Performance Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-[11px]">
                    <div className="text-slate-400">
                      Views: <span className="text-white font-mono font-medium">{camp.impressions.toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400">
                      Clicks: <span className="text-white font-mono font-medium">{camp.clicks.toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400 text-right">
                      CTR: <span className="text-emerald-400 font-mono font-medium">{((camp.clicks / Math.max(camp.impressions, 1)) * 100).toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => quickBoostBid(camp.id, 2)}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>Quick Boost +$2</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenOutbid(camp);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 rounded-lg border border-indigo-800/60 transition-colors flex items-center gap-1"
                    >
                      <Trophy className="w-3 h-3" />
                      <span>Outbid Rivals</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
