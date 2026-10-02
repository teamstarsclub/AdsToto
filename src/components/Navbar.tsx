import React from 'react';
import { useAds } from '../context/AdContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Trophy, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Plus, 
  Lock,
  LogIn,
  User
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel';
  setActiveTab: (tab: 'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel') => void;
  onOpenNewCampaign: () => void;
  onOpenAuthModal: () => void;
  onOpenAccountModal: () => void;
  onOpenPayoutSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewCampaign,
  onOpenAuthModal,
  onOpenAccountModal,
  onOpenPayoutSettings,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Brand Wordmark + Live Network Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <span className="font-mono text-sm font-bold text-white tracking-wider">AT</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                AdsToto
              </span>
            </div>
          </button>

          {/* Live BEP-20 Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>BEP-20 LIVE</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('my-campaigns')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'my-campaigns'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Ads &amp; Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('autobid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'autobid'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auto-Bid Guard</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-intel')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai-intel'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Intel</span>
          </button>
        </nav>

        {/* Zone 3: Actions & User Account Hub */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Account / Login Button */}
          {user ? (
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-400/80 transition-all text-left group"
              title="Open Advertiser Command Center & Numbers"
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${user.avatarBg || 'from-amber-500 to-indigo-600'} flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm shrink-0`}>
                {user.avatarInitials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[11px] font-bold text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                  <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono truncate max-w-[90px]">
                  {user.brandName}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Internal Admin Vault (PIN Protected - Not Public) */}
          {onOpenPayoutSettings && (
            <button
              onClick={onOpenPayoutSettings}
              title="Internal Security Vault &amp; Receiving Wallet Configuration (PIN Protected)"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-amber-400/80" />
              <span className="hidden xl:inline text-[11px] font-semibold text-slate-300">Vault</span>
            </button>
          )}

          {/* Primary CTA: Launch Ad */}
          <button
            onClick={onOpenNewCampaign}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Launch Ad</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden border-t border-slate-800/80 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('my-campaigns')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'my-campaigns' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          My Ads &amp; Stats
        </button>
        <button
          onClick={() => setActiveTab('autobid')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'autobid' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Auto-Bid
        </button>
        <button
          onClick={() => setActiveTab('ai-intel')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'ai-intel' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          AI Intel
        </button>
      </div>
    </header>
  );
};
