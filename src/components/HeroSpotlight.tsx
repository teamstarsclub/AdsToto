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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 lg:p-8 shadow-xs">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Spotlight Info */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Leaderboard #1 Spotlight · Current Attention Leader</span>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${topCampaign.iconBg} flex items-center justify-center text-white text-xl font-bold font-mono shadow-xs border border-white/20 shrink-0`}>
              {topCampaign.iconSymbol}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                  {topCampaign.title}
                </h2>
                <a
                  href={topCampaign.destinationUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => onRecordClick(topCampaign.id)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-mono transition-colors"
                >
                  <span>{topCampaign.displayUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-slate-600 text-sm lg:text-base mt-1.5 leading-relaxed">
                {topCampaign.tagline}
              </p>

              {/* Zero-pill metadata line */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2.5">
                <span className="uppercase tracking-wider font-semibold text-slate-700">{topCampaign.category}</span>
                <span aria-hidden="true">·</span>
                <span>Active Bidding Auction</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium font-mono">Verified Clicks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Performance Stats & Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-8 shrink-0">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 lg:gap-6 text-left lg:text-right">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Current Bid</div>
              <div className="text-xl lg:text-2xl font-bold text-slate-900 font-mono" data-tabular>
                ${topCampaign.bidAmount}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-medium">Total Clicks</div>
              <div className="text-xl lg:text-2xl font-bold text-slate-900 font-mono" data-tabular>
                {topCampaign.clicks.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-medium">CTR / CPC</div>
              <div className="text-xl lg:text-2xl font-bold text-emerald-700 font-mono" data-tabular>
                {ctr}% <span className="text-xs text-slate-500 font-normal">(${cpc})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2">
            <button
              onClick={() => onPickAFight(topCampaign)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-slate-500" />
              <span>Challenge Bid</span>
            </button>

            <button
              onClick={() => onOutbid(topCampaign)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Outbid #1 (${topCampaign.bidAmount + 5})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
