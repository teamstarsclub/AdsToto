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
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>AI Competitive Intelligence &amp; Search Grounding</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Grounded market intelligence powered by Gemini and Google Search to analyze ad competition and generate high-converting copy.
          </p>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors w-fit"
        >
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>{userApiKey ? 'Gemini API Key Configured' : 'Configure Custom API Key'}</span>
        </button>
      </div>

      {showKeyInput && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <label className="text-xs text-slate-300 font-medium">Gemini API Key (Optional)</label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={userApiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-semibold"
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
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 whitespace-nowrap"
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
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
          <span>Popular queries:</span>
          {['AI Video Generators', 'Next.js Boilerplates', 'Creator Sponsorships', 'Edge Database'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setQuery(preset);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors text-[11px]"
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
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Recommended Entry Bid</div>
              <div className="text-2xl font-bold text-white font-mono mt-1" data-tabular>
                ${insight.recommendedBid}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center justify-between">
                <span>Optimal Attention ROI</span>
                {onApplyBid && (
                  <button
                    onClick={() => onApplyBid(insight.recommendedBid)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Apply &rarr;
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Minimum to Enter Top 3</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1" data-tabular>
                ${insight.minToEnterTop3}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Required for high-intent exposure
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Projected Click-Through Rate</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1" data-tabular>
                {insight.projectedCtr}%
              </div>
              <div className="text-[11px] text-indigo-300 mt-1">
                +40% above baseline average
              </div>
            </div>
          </div>

          {/* Strategic Analysis & Taglines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Summary */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Market Dynamics &amp; Bidding Angle</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {insight.competitiveSummary}
              </p>

              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 mb-2">High-Intent Keyword Vectors:</div>
                <div className="flex flex-wrap gap-1.5">
                  {insight.trendingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-950 rounded-lg border border-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Search Grounding Sources */}
              {insight.searchGroundingSources && insight.searchGroundingSources.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>Search Grounding Citations:</span>
                  </div>
                  <ul className="space-y-1">
                    {insight.searchGroundingSources.map((source, sIdx) => (
                      <li key={sIdx} className="text-xs truncate">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
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
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>High-Converting Ad Copy Variations</span>
              </h3>
              <p className="text-xs text-slate-400">
                Optimized for maximum click-through rates on competitive pay-to-rank boards:
              </p>

              <div className="space-y-3">
                {insight.suggestedTaglines.map((tagline, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <p className="text-xs text-white leading-relaxed">{tagline}</p>
                    <button
                      onClick={() => handleCopyTagline(tagline, idx)}
                      title="Copy &amp; apply tagline"
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 shrink-0 transition-colors font-medium"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Applied</span>
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
