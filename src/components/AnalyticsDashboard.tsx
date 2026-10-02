import React, { useState } from 'react';
import { useAds } from '../context/AdContext';
import { 
  TrendingUp, 
  MousePointerClick, 
  DollarSign, 
  Target, 
  Sparkles, 
  ArrowUpRight,
  Calculator,
  SlidersHorizontal
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { campaigns } = useAds();

  // Interactive ROI Calculator State
  const [productPrice, setProductPrice] = useState<number>(49);
  const [conversionRate, setConversionRate] = useState<number>(3.5);
  const [selectedTargetRank, setSelectedTargetRank] = useState<number>(2);

  // Compute Platform Totals
  const totalVolume = campaigns.reduce((acc, c) => acc + c.bidAmount, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const avgCpc = totalClicks > 0 ? (totalVolume / totalClicks).toFixed(2) : '0.00';
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);

  // ROI Calculator Calculations
  const targetCampaign = campaigns.find((c) => c.rank === selectedTargetRank) || campaigns[0];
  const requiredBid = targetCampaign ? targetCampaign.bidAmount + 10 : 250;
  const projectedDailyClicks = Math.round((targetCampaign ? targetCampaign.clicks : 1200) / 14); // daily pacing
  const projectedConversions = Math.max(1, Math.round(projectedDailyClicks * (conversionRate / 100)));
  const projectedRevenue = projectedConversions * productPrice;
  const projectedDailyCost = Math.round(requiredBid / 7); // amortized weekly cycle
  const projectedNetProfit = projectedRevenue - projectedDailyCost;
  const roas = projectedDailyCost > 0 ? Math.round((projectedRevenue / projectedDailyCost) * 100) : 0;
  const breakevenCpc = ((productPrice * (conversionRate / 100))).toFixed(2);

  // Category Breakdown
  const categoryStats = campaigns.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.bidAmount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header with Title and context */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Campaign Performance Analytics &amp; Optimization
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-time metrics, attention market dynamics, and algorithmic bid optimization across adstoto.com
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Ad Attention Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono" data-tabular>
            ${totalVolume.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" />
            <span>Active Pay-to-Rank Bids</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Verified Clicks Delivered</span>
            <MousePointerClick className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono" data-tabular>
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Across {campaigns.length} live campaigns
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Network Average CTR</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono" data-tabular>
            {avgCtr}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totalImpressions.toLocaleString()} total impressions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Effective Network CPC</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono" data-tabular>
            ${avgCpc}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">
            {totalConversions} attributed conversions
          </div>
        </div>
      </div>

      {/* Charts Section: Rank vs CTR Decay + Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rank vs CTR Decay Curve (Visual proof of why Outbidding pays off) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Rank Position vs. Click-Through Efficiency (CTR %)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mathematical proof: Ranks #1 and #2 capture 64% of high-intent attention
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
              High ROI Zone: Top 3
            </span>
          </div>

          {/* Custom SVG Bar & Curve Visualizer */}
          <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 border-b border-slate-800">
            {campaigns.slice(0, 8).map((c) => {
              const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
              const barHeightPct = Math.min(100, Math.max(12, ctr * 10)); // normalized scale
              const isTop3 = c.rank <= 3;

              return (
                <div key={c.id} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] text-white font-mono whitespace-nowrap z-20 pointer-events-none shadow-lg">
                    {c.title}: {ctr.toFixed(1)}% CTR (${c.bidAmount})
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 mb-1" data-tabular>
                    {ctr.toFixed(1)}%
                  </span>

                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      c.rank === 1
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20'
                        : isTop3
                        ? 'bg-gradient-to-t from-indigo-700 to-indigo-500'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />

                  <span className="text-[11px] font-mono font-semibold text-slate-300 mt-2" data-tabular>
                    #{c.rank}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Rank Position on adstoto.com</span>
            <span className="text-amber-400 font-medium">Rank #1 achieves +280% click velocity over Rank #5</span>
          </div>
        </div>

        {/* Category Share & Market Allocation */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Ad Spend by Market Vertical
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live bid capital distribution
            </p>

            <div className="space-y-3.5 mt-5">
              {Object.entries(categoryStats).map(([cat, amount]) => {
                const pct = totalVolume > 0 ? Math.round((amount / totalVolume) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 uppercase">{cat}</span>
                      <span className="text-slate-400" data-tabular>
                        ${amount} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 mt-4">
            AI Tools and SaaS currently lead total bid competition with 54% of market capital.
          </div>
        </div>
      </div>

      {/* Real-Time Ad Performance Optimizer & ROI Calculator */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Real-Time Ad Performance Optimizer &amp; ROI Simulator</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Calculate Your Breakeven Bid &amp; Projected ROAS
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Pacing Model</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: Product Price / LTV */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Customer Value / LTV</span>
              <span className="font-mono text-white font-bold" data-tabular>${productPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">Average revenue per converted customer</p>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Landing Page Conversion Rate</span>
              <span className="font-mono text-emerald-400 font-bold" data-tabular>{conversionRate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="12.0"
              step="0.5"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">Industry benchmark: 2.5% to 5.0%</p>
          </div>

          {/* Selector: Target Rank Spot */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Desired Target Rank</span>
              <span className="font-mono text-amber-400 font-bold" data-tabular>Rank #{selectedTargetRank}</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedTargetRank(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    selectedTargetRank === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  #{r}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Simulate ranking economics</p>
          </div>
        </div>

        {/* Projected Outcomes Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Required Bid to Hold #{selectedTargetRank}</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5" data-tabular>
              ${requiredBid}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">one-time active bid</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Est. Conversions / Day</div>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5" data-tabular>
              {projectedConversions} <span className="text-xs text-slate-400">({projectedDailyClicks} clicks)</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">at {conversionRate}% CVR</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Projected Daily Revenue</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5" data-tabular>
              ${projectedRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">gross daily pipeline</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Projected ROAS &amp; Max CPC</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5" data-tabular>
              {roas}% <span className="text-xs text-slate-300">ROAS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Breakeven CPC: <span className="text-white">${breakevenCpc}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
