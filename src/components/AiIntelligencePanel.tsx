import React, { useState } from 'react';
import { analyzeAdMarketAndCompetition } from '../services/geminiService';
import { MarketInsight } from '../types/ad';
import { 
  Sparkles, 
  Search, 
  TrendingUp, 
  Zap, 
  Globe, 
  Check, 
  Copy, 
  Key, 
  Loader2 
} from 'lucide-react';

interface AiIntelligencePanelProps {
  onApplyTagline?: (tagline: string) => void;
  onApplyBid?: (bid: number) => void;
}

export const AiIntelligencePanel: React.FC<AiIntelligencePanelProps> = ({
  onApplyTagline,
  onApplyBid,
}) => {
  const [query, setQuery] = useState('AI Code Review & Developer Agents');
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('adstoto_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSaveKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('adstoto_gemini_key', key);
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeAdMarketAndCompetition(query, userApiKey);
      setInsight(result);
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTagline = (tagline: string, index: number) => {
    navigator.clipboard.writeText(tagline);
    setCopiedIndex(index);
    if (onApplyTagline) onApplyTagline(tagline);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>AI Competitive Intelligence &amp; Search Grounding</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>gemini-3.5-flash + Google Search</span>
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Grounded market intelligence powered by Gemini 3.5 Flash and Google Search Grounding to analyze live ad competition and generate high-converting copy.
          </p>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors w-fit cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-slate-500" />
          <span>{userApiKey ? 'Gemini API Key Configured' : 'Configure Custom API Key'}</span>
        </button>
      </div>

      {showKeyInput && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="text-xs text-slate-700 font-medium">Gemini API Key (Optional)</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={userApiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 shadow-2xs"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold cursor-pointer shadow-2xs"
            >
              Save
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            For GitHub Pages static hosting, key is kept strictly in your local browser storage. If empty, the app seamlessly runs using the built-in intelligent heuristic engine.
          </p>
        </div>
      )}

      {/* Query Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Enter Your Product Domain, Competitor URL, or Niche Topic
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. Autonomous AI coding agents, SaaS churn analytics, Figma to code..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grounding Search Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Analyze Market &amp; Bid</span>
              </>
            )}
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span>Popular queries:</span>
          {['AI Video Generators', 'Next.js Boilerplates', 'Creator Sponsorships', 'Edge Database'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setQuery(preset);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-[11px] cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Output */}
      {insight && (
        <div className="space-y-6">
          {/* Key Bid Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="text-xs text-slate-500">Recommended Entry Bid</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1" data-tabular>
                ${insight.recommendedBid}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1 flex items-center justify-between font-medium">
                <span>Optimal Attention ROI</span>
                {onApplyBid && (
                  <button
                    onClick={() => onApplyBid(insight.recommendedBid)}
                    className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Apply &rarr;
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="text-xs text-slate-500">Minimum to Enter Top 3</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1" data-tabular>
                ${insight.minToEnterTop3}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Required for high-intent exposure
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="text-xs text-slate-500">Projected Click-Through Rate</div>
              <div className="text-2xl font-bold text-blue-700 font-mono mt-1" data-tabular>
                {insight.projectedCtr}%
              </div>
              <div className="text-[11px] text-blue-600 mt-1">
                +40% above baseline average
              </div>
            </div>
          </div>

          {/* Strategic Analysis & Taglines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Summary */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Market Dynamics &amp; Bidding Angle</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insight.competitiveSummary}
              </p>

              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">High-Intent Keyword Vectors:</div>
                <div className="flex flex-wrap gap-1.5">
                  {insight.trendingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Search Grounding Sources */}
              {insight.searchGroundingSources && insight.searchGroundingSources.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span>Search Grounding Citations:</span>
                  </div>
                  <ul className="space-y-1">
                    {insight.searchGroundingSources.map((source, sIdx) => (
                      <li key={sIdx} className="text-xs truncate">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generated High-Converting Taglines */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>High-Converting Ad Copy Variations</span>
              </h3>
              <p className="text-xs text-slate-500">
                Optimized for maximum click-through rates on competitive pay-to-rank boards:
              </p>

              <div className="space-y-3">
                {insight.suggestedTaglines.map((tagline, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <p className="text-xs text-slate-800 leading-relaxed">{tagline}</p>
                    <button
                      onClick={() => handleCopyTagline(tagline, idx)}
                      title="Copy &amp; apply tagline"
                      className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 shrink-0 transition-colors font-medium cursor-pointer shadow-2xs"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Applied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Use</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
