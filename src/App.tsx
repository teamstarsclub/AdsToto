import React, { useState } from 'react';
import { AdProvider, useAds } from './context/AdContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSpotlight } from './components/HeroSpotlight';
import { LeaderboardView } from './components/LeaderboardView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MyCampaignsView } from './components/MyCampaignsView';
import { AutoBidderPanel } from './components/AutoBidderPanel';
import { AiIntelligencePanel } from './components/AiIntelligencePanel';
import { AdminDashboardView } from './components/AdminDashboardView';
import { OutbidModal } from './components/OutbidModal';
import { PickAFightModal } from './components/PickAFightModal';
import { CampaignModal } from './components/CampaignModal';
import { AuthModal } from './components/AuthModal';
import { UserAccountModal } from './components/UserAccountModal';
import { PayoutSettingsModal } from './components/PayoutSettingsModal';
import { CryptoPaymentModal } from './components/CryptoPaymentModal';
import { AdCampaign } from './types/ad';
import { HelpCircle, ChevronDown, ChevronUp, User, Shield } from 'lucide-react';

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does pay-to-rank digital advertising work on AdsToto?',
      a: 'AdsToto (adstoto.com) is a transparent, real-time digital advertising exchange. Rankings (#1, #2, #3, etc.) are strictly determined by the active bid. The highest bidder secures the #1 Crown Spot and captures over 40% of all incoming visitor clicks and referral impressions.'
    },
    {
      q: 'How do I create an account and track my ad numbers & statistics?',
      a: 'Click "Sign In / Join" in the header to create an advertiser account. Once signed in, your Advertiser Command Center tracks live impressions, clicks, click-through rates (CTR), and leaderboard ranks across all your campaigns with 100% transparency.'
    },
    {
      q: 'How does the Auto-Bid Shield protect my ad placement?',
      a: 'If a competitor attempts to outbid your campaign, your Auto-Bid Shield automatically matches and leapfrogs their bid by your specified increment (e.g., +$1 or +$2) up to your hard budget ceiling, preventing sudden loss of visibility.'
    },
    {
      q: 'Which cryptocurrencies and networks are supported for instant settlement?',
      a: 'AdsToto natively supports Binance Smart Chain (BNB Chain BEP-20) for USDT, USDC, and BNB with under $0.03 gas fees and 3-second block finality, as well as Polygon, Solana, and Ethereum.'
    },
  ];

  return (
    <section className="pt-8 border-t border-slate-200 space-y-4">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Transparent Digital Advertising Exchange</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-slate-500">
          Everything you need to know about pay-to-rank advertising on adstoto.com
        </p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-colors shadow-2xs"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MainApp() {
  const { campaigns, recordClick, outbidCampaign } = useAds();
  const { user, allUsers } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'analytics' | 'my-campaigns' | 'autobid' | 'ai-intel' | 'admin'>('leaderboard');

  // Modals state
  const [outbidTarget, setOutbidTarget] = useState<AdCampaign | null>(null);
  const [fightTarget, setFightTarget] = useState<AdCampaign | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isTestPaymentModalOpen, setIsTestPaymentModalOpen] = useState(false);

  const topCampaign = campaigns[0];

  const handleOpenNewCampaign = () => {
    setEditingCampaign(null);
    setIsCampaignModalOpen(true);
  };

  const handleEditCampaign = (campaign: AdCampaign) => {
    setEditingCampaign(campaign);
    setIsCampaignModalOpen(true);
  };

  const handleBoostBid = (campaign: AdCampaign) => {
    setOutbidTarget(campaign);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-zone Header with User Account & Auth Integration */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCampaign={handleOpenNewCampaign}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenPayoutSettings={() => setIsPayoutModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Leaderboard View */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            {/* The Crown #1 Spotlight */}
            <HeroSpotlight
              topCampaign={topCampaign}
              onOutbid={(target) => setOutbidTarget(target)}
              onPickAFight={(target) => setFightTarget(target)}
              onRecordClick={(id) => recordClick(id)}
            />

            {/* Competitive Pay-to-Rank Table */}
            <LeaderboardView
              onSelectOutbid={(target) => setOutbidTarget(target)}
              onSelectFight={(target) => setFightTarget(target)}
              onOpenNewCampaign={handleOpenNewCampaign}
            />

            {/* Crawlable Semantic FAQ on the main landing page for Googlebot */}
            <FaqSection />
          </div>
        )}

        {/* Analytics & Performance Optimization */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* My Campaigns Management & User Stats */}
        {activeTab === 'my-campaigns' && (
          <MyCampaignsView
            onOpenNewCampaign={handleOpenNewCampaign}
            onEditCampaign={handleEditCampaign}
            onBoostBid={handleBoostBid}
            onNavigateLeaderboard={() => setActiveTab('leaderboard')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Auto-Bid Shield Guardrails */}
        {activeTab === 'autobid' && <AutoBidderPanel />}

        {/* AI Competitive Intelligence & Keyword Optimizer */}
        {activeTab === 'ai-intel' && (
          <AiIntelligencePanel
            onApplyTagline={(tagline) => {
              setEditingCampaign(null);
              setIsCampaignModalOpen(true);
            }}
            onApplyBid={(bid) => {
              if (topCampaign) setOutbidTarget(topCampaign);
            }}
          />
        )}

        {/* SaaS Operations Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboardView onOpenCreateAd={handleOpenNewCampaign} />
        )}
      </main>

      {/* Clean Modern Pro Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">AdsToto</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500">adstoto.com</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Real-Time Pay-to-Rank Digital Advertising Exchange</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('my-campaigns')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              My Ads &amp; Numbers
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Analytics &amp; ROI
            </button>
            <button
              onClick={() => setActiveTab('autobid')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Auto-Bid Shield
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Dashboard</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                {allUsers.length} Users
              </span>
            </button>
            {user ? (
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Account Hub</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Security Vault
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Google & Web3 Sign In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onVerificationSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('my-campaigns');
        }}
      />

      {/* User Account & Statistics Command Center */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenCreateAd={handleOpenNewCampaign}
        onOpenOutbid={(camp) => setOutbidTarget(camp)}
      />

      {/* Outbid Arena Modal */}
      {outbidTarget && (
        <OutbidModal
          targetCampaign={outbidTarget}
          onClose={() => setOutbidTarget(null)}
          onOpenCreateCampaign={() => {
            setOutbidTarget(null);
            handleOpenNewCampaign();
          }}
        />
      )}

      {/* Pick A Fight Modal */}
      {fightTarget && (
        <PickAFightModal
          targetCampaign={fightTarget}
          onClose={() => setFightTarget(null)}
          onOpenCreateCampaign={() => {
            setFightTarget(null);
            handleOpenNewCampaign();
          }}
        />
      )}

      {/* Launch or Edit Campaign Modal */}
      {isCampaignModalOpen && (
        <CampaignModal
          initialCampaign={editingCampaign}
          onClose={() => {
            setIsCampaignModalOpen(false);
            setEditingCampaign(null);
          }}
          onSuccess={(id) => {
            setActiveTab('my-campaigns');
          }}
        />
      )}

      {/* Internal Security Vault Modal (PIN Protected) */}
      {isPayoutModalOpen && (
        <PayoutSettingsModal onClose={() => setIsPayoutModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <MainApp />
      </AdProvider>
    </AuthProvider>
  );
}
