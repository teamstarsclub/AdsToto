import React, { useState } from 'react';
import { AdCampaign, CategoryType } from '../types/ad';
import { useAds } from '../context/AdContext';
import { 
  Search, 
  ExternalLink, 
  Zap, 
  Swords, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Flame, 
  Plus,
  ShieldCheck
} from 'lucide-react';

interface LeaderboardViewProps {
  onSelectOutbid: (targetCampaign: AdCampaign) => void;
  onSelectFight: (targetCampaign: AdCampaign) => void;
  onOpenNewCampaign: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onSelectOutbid,
  onSelectFight,
  onOpenNewCampaign,
}) => {
  const { campaigns, activityFeed, quickBoostBid, recordClick } = useAds();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'clicks' | 'ctr'>('rank');

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.displayUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'ctr') {
      const ctrA = a.impressions > 0 ? a.clicks / a.impressions : 0;
      const ctrB = b.impressions > 0 ? b.clicks / b.impressions : 0;
      return ctrB - ctrA;
    }
    return a.rank - b.rank;
  });

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'ai', label: 'AI & Agents' },
    { id: 'saas', label: 'SaaS Platforms' },
    { id: 'creator', label: 'Creators & Media' },
    { id: 'devtools', label: 'Dev Tools' },
    { id: 'growth', label: 'Growth & Ads' },
    { id: 'crypto', label: 'Web3 & Fintech' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Activity Ticker (Anti-slop, clean unboxed alerts) */}
      {activityFeed.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs overflow-hidden">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold shrink-0">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span className="uppercase tracking-wider">Live War Feed:</span>
          </div>
          <div className="truncate text-slate-300">
            {activityFeed[0].message}
          </div>
          <div className="hidden sm:block ml-auto text-[11px] text-slate-500 font-mono shrink-0">
            Just now
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, URLs..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="rank">Sort: Pay-to-Rank ($)</option>
            <option value="clicks">Sort: Most Clicks</option>
            <option value="ctr">Sort: Highest CTR</option>
          </select>
        </div>
      </div>

      {/* Main Competitive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-900/80">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Campaign &amp; Offer</th>
              <th className="py-3 px-4 hidden md:table-cell">Category</th>
              <th className="py-3 px-4 text-right">Verified Clicks</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">CTR &amp; CPC</th>
              <th className="py-3 px-4 text-right">Active Bid</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedCampaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  No advertising campaigns found matching your search.
                  <div className="mt-3">
                    <button
                      onClick={onOpenNewCampaign}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      Launch a Campaign in this Niche
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedCampaigns.map((camp) => {
                const rankDelta = camp.previousRank - camp.rank;
                const ctr = camp.impressions > 0 
                  ? ((camp.clicks / camp.impressions) * 100).toFixed(1) 
                  : '0.0';
                const cpc = camp.clicks > 0
                  ? (camp.bidAmount / camp.clicks).toFixed(2)
                  : '0.00';

                return (
                  <tr 
                    key={camp.id}
                    className={`group hover:bg-slate-800/40 transition-colors ${
                      camp.rank === 1 ? 'bg-indigo-950/20' : camp.isUserOwned ? 'bg-indigo-900/10' : ''
                    }`}
                  >
                    {/* Rank + Delta */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-base font-bold font-mono ${
                          camp.rank === 1 ? 'text-amber-400' : camp.rank <= 3 ? 'text-indigo-400' : 'text-slate-300'
                        }`} data-tabular>
                          #{camp.rank}
                        </span>

                        <div className="flex items-center text-[10px] font-mono mt-0.5">
                          {rankDelta > 0 ? (
                            <span className="text-emerald-400 flex items-center">
                              <ArrowUp className="w-2.5 h-2.5" />
                              {rankDelta}
                            </span>
                          ) : rankDelta < 0 ? (
                            <span className="text-rose-400 flex items-center">
                              <ArrowDown className="w-2.5 h-2.5" />
                              {Math.abs(rankDelta)}
                            </span>
                          ) : (
                            <span className="text-slate-600 flex items-center">
                              <Minus className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Campaign Identity & Creative */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${camp.iconBg} flex items-center justify-center text-white text-sm font-bold font-mono shadow ring-1 ring-white/20 shrink-0 mt-0.5`}>
                          {camp.iconSymbol}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm tracking-tight hover:text-indigo-300 transition-colors">
                              {camp.title}
                            </span>

                            {camp.isUserOwned && (
                              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-1.5 py-0.5 rounded">
                                Your Campaign
                              </span>
                            )}

                            {camp.autoBid.enabled && (
                              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                                Auto-Bid Shield
                              </span>
                            )}

                            {camp.paymentReceipt && (
                              <a
                                href={camp.paymentReceipt.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded hover:bg-amber-900/60 transition-colors"
                                title={`Verified on ${camp.paymentReceipt.network.toUpperCase()} block #${camp.paymentReceipt.blockNumber}`}
                              >
                                <ShieldCheck className="w-3 h-3 text-amber-400" />
                                <span>On-Chain Verified · {camp.paymentReceipt.network.toUpperCase()}</span>
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-lg">
                            {camp.tagline}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                            <a
                              href={camp.destinationUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={() => recordClick(camp.id)}
                              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                            >
                              <span>{camp.displayUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span aria-hidden="true">·</span>
                            <span>{camp.impressions.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                        {camp.category}
                      </span>
                    </td>

                    {/* Clicks */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-mono text-sm font-bold text-white" data-tabular>
                        {camp.clicks.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        verified clicks
                      </div>
                    </td>

                    {/* CTR & CPC */}
                    <td className="py-4 px-4 text-right hidden sm:table-cell">
                      <div className="font-mono text-xs font-semibold text-emerald-400" data-tabular>
                        {ctr}% CTR
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono" data-tabular>
                        ${cpc} CPC
                      </div>
                    </td>

                    {/* Active Bid */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-mono text-base font-bold text-white" data-tabular>
                        ${camp.bidAmount}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        pay-to-rank
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {camp.isUserOwned ? (
                          <button
                            onClick={() => quickBoostBid(camp.id, 10)}
                            title="Boost bid by +$10"
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+$10</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => onSelectFight(camp)}
                              title="Compare head-to-head"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                            >
                              <Swords className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onSelectOutbid(camp)}
                              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap"
                            >
                              <Zap className="w-3 h-3 fill-white" />
                              <span>Outbid</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
