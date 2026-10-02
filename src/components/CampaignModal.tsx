import React, { useState, useEffect } from 'react';
import { useAds } from '../context/AdContext';
import { AdCampaign, CategoryType, CryptoPaymentReceipt } from '../types/ad';
import { CryptoPaymentModal } from './CryptoPaymentModal';
import { X, Sparkles, Eye, ShieldCheck, Check, Wallet } from 'lucide-react';

interface CampaignModalProps {
  initialCampaign?: AdCampaign | null;
  onClose: () => void;
  onSuccess: (campaignId: string) => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  initialCampaign,
  onClose,
  onSuccess,
}) => {
  const { createCampaign, updateCampaign } = useAds();

  const [title, setTitle] = useState(initialCampaign?.title || '');
  const [tagline, setTagline] = useState(initialCampaign?.tagline || '');
  const [destinationUrl, setDestinationUrl] = useState(initialCampaign?.destinationUrl || 'https://');
  const [displayUrl, setDisplayUrl] = useState(initialCampaign?.displayUrl || '');
  const [category, setCategory] = useState<CategoryType>(initialCampaign?.category || 'saas');
  const [bidAmount, setBidAmount] = useState<number>(initialCampaign?.bidAmount || 15);
  const [iconSymbol, setIconSymbol] = useState(initialCampaign?.iconSymbol || 'AD');
  const [iconBg, setIconBg] = useState(initialCampaign?.iconBg || 'from-indigo-600 to-blue-700');
  const [autoBidEnabled, setAutoBidEnabled] = useState(initialCampaign?.autoBid.enabled ?? true);
  const [maxBudget, setMaxBudget] = useState(initialCampaign?.autoBid.maxBudget || 30);
  const [targetRank, setTargetRank] = useState<1 | 3 | 5>(initialCampaign?.autoBid.targetRank || 3);
  const [targetKeywords, setTargetKeywords] = useState(initialCampaign?.targetKeywords?.join(', ') || '');
  const [metaTitle, setMetaTitle] = useState(initialCampaign?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialCampaign?.metaDescription || '');
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  // Auto-generate display url and icon symbol if not typed
  useEffect(() => {
    if (!displayUrl && destinationUrl) {
      try {
        const parsed = new URL(destinationUrl);
        setDisplayUrl(parsed.hostname.replace(/^www\./, ''));
      } catch {
        // Keep as is
      }
    }
  }, [destinationUrl, displayUrl]);

  useEffect(() => {
    if (title && (!iconSymbol || iconSymbol === 'AD')) {
      const words = title.trim().split(/\s+/);
      const symbol = words.length >= 2 
        ? (words[0][0] + words[1][0]).toUpperCase()
        : title.substring(0, 2).toUpperCase();
      setIconSymbol(symbol);
    }
  }, [title, iconSymbol]);

  const bgPresets = [
    { label: 'Indigo', value: 'from-indigo-600 to-blue-700' },
    { label: 'Violet', value: 'from-violet-600 to-indigo-600' },
    { label: 'Emerald', value: 'from-emerald-500 to-teal-600' },
    { label: 'Amber', value: 'from-amber-500 to-orange-600' },
    { label: 'Cyan', value: 'from-cyan-500 to-blue-600' },
    { label: 'Rose', value: 'from-rose-500 to-pink-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim() || !destinationUrl.trim()) return;

    const parsedKeywords = targetKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (initialCampaign) {
      updateCampaign(initialCampaign.id, {
        title,
        tagline,
        destinationUrl,
        displayUrl: displayUrl || 'adstoto.com',
        category,
        bidAmount,
        iconSymbol: iconSymbol.substring(0, 3).toUpperCase(),
        iconBg,
        metaTitle: metaTitle || `${title} — ${tagline} | AdsToto`,
        metaDescription: metaDescription || tagline,
        targetKeywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        autoBid: {
          ...initialCampaign.autoBid,
          enabled: autoBidEnabled,
          maxBudget: Math.max(bidAmount, maxBudget),
          targetRank,
        },
      });
      onSuccess(initialCampaign.id);
      onClose();
    } else {
      // Trigger on-chain payment verification modal
      setShowCryptoModal(true);
    }
  };

  const handleCryptoSuccess = (receipt: CryptoPaymentReceipt) => {
    const parsedKeywords = targetKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const newId = createCampaign({
      title,
      tagline,
      destinationUrl,
      displayUrl: displayUrl || 'adstoto.com',
      category,
      bidAmount,
      iconSymbol: iconSymbol.substring(0, 3).toUpperCase(),
      iconBg,
      metaTitle: metaTitle || `${title} — ${tagline} | AdsToto`,
      metaDescription: metaDescription || tagline,
      targetKeywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
      autoBid: {
        enabled: autoBidEnabled,
        maxBudget: Math.max(bidAmount, maxBudget),
        targetRank,
        incrementStep: 10,
        defenseCount: 0,
      },
    }, receipt);

    setShowCryptoModal(false);
    onSuccess(newId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {initialCampaign ? 'Edit Ad Campaign Details' : 'Launch New Digital Ad Campaign'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deploy your product creative directly to the adstoto.com pay-to-rank exchange.
          </p>
        </div>

        {/* Live Creative Card Preview */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-indigo-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Creative Preview on adstoto.com</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold" data-tabular>${bidAmount} Active Bid</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white text-base font-bold font-mono shadow ring-1 ring-white/20 shrink-0`}>
              {iconSymbol || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm truncate">
                  {title || 'Your Product Name'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {tagline || 'Snappy value proposition and call to action headline...'}
              </p>
              <div className="text-[11px] text-indigo-400 font-mono mt-1">
                {displayUrl || 'yourdomain.com'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Product / Brand Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NextPulse Analytics"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category Vertical</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ai">AI Tools &amp; Autonomous Agents</option>
                <option value="saas">SaaS &amp; Cloud Software</option>
                <option value="creator">Creators, Media &amp; Newsletters</option>
                <option value="devtools">Developer Tools &amp; APIs</option>
                <option value="growth">Growth &amp; Digital Advertising</option>
                <option value="crypto">Web3, Security &amp; Fintech</option>
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ad Tagline / Value Proposition</label>
            <input
              type="text"
              required
              maxLength={120}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Instant AI code refactoring for high-velocity software engineering teams"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <div className="text-[10px] text-slate-500 text-right">{tagline.length}/120 characters</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Destination URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Destination URL</label>
              <input
                type="url"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Display URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Clean Domain</label>
              <input
                type="text"
                value={displayUrl}
                onChange={(e) => setDisplayUrl(e.target.value)}
                placeholder="yourproduct.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bid Amount & Auto-Bid Shield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Initial Active Bid ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={bidAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBidAmount(val);
                    if (maxBudget < val) {
                      setMaxBudget(val * 2);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                  data-tabular
                />
              </div>
              <p className="text-[10px] text-slate-500">Determines your starting rank position on the leaderboard</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Brand Color Accent</label>
              <div className="flex gap-2 pt-1">
                {bgPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setIconBg(preset.value)}
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${preset.value} ring-offset-2 ring-offset-slate-900 transition-all ${
                      iconBg === preset.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Auto-Bid Shield Settings */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Auto-Bid Defense Guardrail</span>
              </div>
              <input
                type="checkbox"
                checked={autoBidEnabled}
                onChange={(e) => setAutoBidEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {autoBidEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400">Target Rank to Hold</label>
                  <select
                    value={targetRank}
                    onChange={(e) => setTargetRank(Number(e.target.value) as 1 | 3 | 5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white mt-1 cursor-pointer"
                  >
                    <option value={1}>Rank #1 Crown</option>
                    <option value={3}>Top 3 Leaderboard</option>
                    <option value={5}>Top 5 Visibility</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Max Budget Ceiling ($)</label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono mt-1"
                    data-tabular
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Budget limit for automatic defensive counter-bids</p>
                </div>
              </div>
            )}
          </div>

          {/* Organic Google SEO Accordion */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <button
              type="button"
              onClick={() => setShowSeoFields(!showSeoFields)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span>✦</span>
                <span>Organic Google SEO &amp; SERP Snippet Optimization</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {showSeoFields ? 'Hide SEO' : 'Configure SEO'}
              </span>
            </button>

            {showSeoFields && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Target Organic Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="e.g. buy advertising space, best ai tools, saas promo"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <p className="text-[10px] text-slate-500">Targets specific search queries in Google indexing</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Custom Google SERP Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="e.g. CogniFlow AI — Autonomous Dev Workflow Orchestrator | AdsToto"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Google Search Meta Description</label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Compelling 1-2 sentence description shown in Google search results snippets..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              {initialCampaign ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Proceed to Crypto Pay (${bidAmount})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showCryptoModal && (
        <CryptoPaymentModal
          amountUsd={bidAmount}
          purposeTitle={`Launch Ad Campaign "${title || 'Untitled'}"`}
          onPaymentSuccess={handleCryptoSuccess}
          onClose={() => setShowCryptoModal(false)}
        />
      )}
    </div>
  );
};
