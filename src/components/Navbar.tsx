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
  User,
  Shield
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel' | 'admin';
  setActiveTab: (tab: 'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel' | 'admin') => void;
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
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xs transition-colors group-hover:bg-slate-800">
              <span className="font-mono text-xs font-bold tracking-wider">AT</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                AdsToto
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-slate-500" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('my-campaigns')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-campaigns'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>My Ads &amp; Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('autobid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'autobid'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Auto-Bid Guard</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-intel')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai-intel'
                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200/90 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>AI Intel</span>
          </button>

          {/* Admin Console Tab - STRICTLY FOR ADMINS */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200'
              }`}
              title="Open Platform Admin Dashboard & Operations"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & User Account Hub */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Account / Login Button */}
          {user ? (
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-100/80 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer"
              title="Open Advertiser Command Center & Numbers"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-800 text-xs font-bold font-mono shrink-0 shadow-2xs">
                {user.avatarInitials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[11px] font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                  <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate max-w-[90px]">
                  {user.brandName}
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200/90 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Internal Admin Vault (PIN Protected) - strictly for admin */}
          {isAdmin && onOpenPayoutSettings && (
            <button
              onClick={onOpenPayoutSettings}
              title="Security Vault & Treasury Configuration"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/90 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline text-[11px] font-medium text-slate-600">Vault</span>
            </button>
          )}

          {/* Primary CTA: Launch Ad */}
          <button
            onClick={onOpenNewCampaign}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Launch Ad</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden border-t border-slate-200 bg-white/95 px-2 py-1.5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200' : 'text-slate-600'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200' : 'text-slate-600'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('my-campaigns')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'my-campaigns' ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200' : 'text-slate-600'
          }`}
        >
          My Ads &amp; Stats
        </button>
        <button
          onClick={() => setActiveTab('autobid')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'autobid' ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200' : 'text-slate-600'
          }`}
        >
          Auto-Bid
        </button>
        <button
          onClick={() => setActiveTab('ai-intel')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'ai-intel' ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200' : 'text-slate-600'
          }`}
        >
          AI Intel
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'admin' ? 'bg-slate-900 text-white font-semibold' : 'text-purple-700 bg-purple-50'
            }`}
          >
            <Shield className="w-3 h-3 text-purple-600" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
