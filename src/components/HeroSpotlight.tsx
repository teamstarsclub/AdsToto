import React from 'react';
import { AdCampaign } from '../types/ad';
import { ExternalLink, Swords, Zap, Crown } from 'lucide-react';

interface HeroSpotlightProps {
  topCampaign: AdCampaign | undefined;
  onOutbid: (targetCampaign: AdCampaign) => void;
  onPickAFight: (targetCampaign: AdCampaign) => void;
  onRecordClick: (campaignId: string) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  topCampaign,
  onOutbid,
  onPickAFight,
  onRecordClick,
}) => {
  if (!topCampaign) return null;

  const ctr = topCampaign.impressions > 0 
    ? ((topCampaign.clicks / topCampaign.impressions) * 100).toFixed(1) 
    : '0.0';

  const cpc = topCampaign.clicks > 0
    ? (topCampaign.bidAmount / topCampaign.clicks).toFixed(2)
    : '0.00';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/30 border border-indigo-500/30 p-6 lg:p-8 backdrop-blur-sm">
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Spotlight Info */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5 text-xs text-amber-400 font-semibold tracking-wide">
            <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>RANK #1 SPOTLIGHT · CURRENT ATTENTION LEADER</span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topCampaign.iconBg} flex items-center justify-center text-white text-xl font-bold font-mono shadow-lg ring-1 ring-white/20 shrink-0`}>
              {topCampaign.iconSymbol}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {topCampaign.title}
                </h2>
                <a
                  href={topCampaign.destinationUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => onRecordClick(topCampaign.id)}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
                >
                  <span>{topCampaign.displayUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-slate-300 text-sm lg:text-base mt-1.5 leading-relaxed">
                {topCampaign.tagline}
              </p>

              {/* Zero-pill metadata line */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2.5">
                <span className="uppercase tracking-wider font-semibold text-slate-300">{topCampaign.category}</span>
                <span aria-hidden="true">·</span>
                <span>Active Bidding War</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Real-time Verified Traffic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Performance Stats & Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-8 shrink-0">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 lg:gap-6 text-left lg:text-right">
            <div>
              <div className="text-[11px] text-slate-400">Current Bid</div>
              <div className="text-xl lg:text-2xl font-bold text-white font-mono" data-tabular>
                ${topCampaign.bidAmount}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Total Clicks</div>
              <div className="text-xl lg:text-2xl font-bold text-indigo-400 font-mono" data-tabular>
                {topCampaign.clicks.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">CTR / CPC</div>
              <div className="text-xl lg:text-2xl font-bold text-emerald-400 font-mono" data-tabular>
                {ctr}% <span className="text-xs text-slate-400 font-normal">(${cpc})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2">
            <button
              onClick={() => onPickAFight(topCampaign)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700/80 transition-colors whitespace-nowrap"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Pick a Fight</span>
            </button>

            <button
              onClick={() => onOutbid(topCampaign)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Outbid #1 Spot (${topCampaign.bidAmount + 5})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
