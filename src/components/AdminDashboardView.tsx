import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAds } from '../context/AdContext';
import { UserProfile } from '../types/auth';
import { AdCampaign } from '../types/ad';
import { getRedeemedTxHashes } from '../utils/cryptoVerification';
import { getGoogleClientId, saveGoogleClientId } from '../services/googleAuthService';
import { RevenueProjectionChart } from './RevenueProjectionChart';
import { 
  Users, 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ShieldAlert, 
  ExternalLink, 
  Sparkles, 
  Lock, 
  Unlock, 
  Eye, 
  Save, 
  KeyRound, 
  Activity, 
  MousePointer, 
  BarChart3,
  Check,
  X,
  ChevronRight,
  Globe,
  FileText,
  FileSpreadsheet,
  Copy,
  Layers,
  Calendar,
  RefreshCw,
  Sliders,
  Shield,
  UserCheck,
  UserX,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

interface AdminDashboardViewProps {
  onOpenCreateAd?: () => void;
}

const PIN_STORAGE_KEY = 'adstoto_admin_pin_v1';
const DEFAULT_PIN = '888888';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onOpenCreateAd }) => {
  const { user, allUsers, deleteUser, updateUserTier, toggleUserStatus, addAdminUser } = useAuth();
  const { campaigns, payoutSettings, updatePayoutSettings } = useAds();

  // Admin PIN Unlock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Tab: overview | users | reports | financials | moderation | settings
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'financials' | 'moderation' | 'settings'>('overview');

  // Search & Filter State in CRM
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<'all' | 'google' | 'web3' | 'apex' | 'suspended'>('all');

  // User Dossier Modal State
  const [selectedUserDossier, setSelectedUserDossier] = useState<UserProfile | null>(null);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserBrand, setNewUserBrand] = useState('');
  const [newUserWallet, setNewUserWallet] = useState('');
  const [newUserTier, setNewUserTier] = useState<'Starter Advertiser' | 'Growth Marketer' | 'Apex Partner'>('Growth Marketer');
  const [newUserProvider, setNewUserProvider] = useState<'google' | 'web3'>('google');

  // Reporting Center State
  const [reportDateRange, setReportDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [previewReportType, setPreviewReportType] = useState<'executive' | 'users' | 'financials' | 'campaigns' | 'security' | null>(null);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  // Treasury Settings
  const [bscAddress, setBscAddress] = useState(payoutSettings.bscAddress || '');
  const [polygonAddress, setPolygonAddress] = useState(payoutSettings.polygonAddress || '');
  const [solanaAddress, setSolanaAddress] = useState(payoutSettings.solanaAddress || '');
  const [googleClientId, setGoogleClientId] = useState(() => getGoogleClientId());
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Platform Metrics & Aggregate Stats
  const totalUsers = allUsers.length;
  const googleUsers = allUsers.filter((u) => u.authProvider === 'google').length;
  const web3Users = allUsers.filter((u) => u.authProvider === 'web3').length;
  const activeUsersCount = allUsers.filter((u) => u.status !== 'suspended').length;
  const suspendedUsersCount = allUsers.filter((u) => u.status === 'suspended').length;
  
  const apexPartnersCount = allUsers.filter((u) => u.tier === 'Apex Partner').length;
  const growthMarketersCount = allUsers.filter((u) => u.tier === 'Growth Marketer').length;
  const starterAdvertisersCount = allUsers.filter((u) => u.tier === 'Starter Advertiser').length;

  const totalBidsVolume = campaigns.reduce((sum, c) => sum + c.bidAmount, 0);
  const totalClicksDelivered = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalImpressionsDelivered = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const avgCtr = totalImpressionsDelivered > 0 ? ((totalClicksDelivered / totalImpressionsDelivered) * 100).toFixed(2) : '0.00';
  const redeemedTxs = getRedeemedTxHashes().length;
  const totalUserSpend = allUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
  const arpu = totalUsers > 0 ? (totalUserSpend / totalUsers).toFixed(2) : '0.00';

  // Filtered Users List for CRM
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.brandName.toLowerCase().includes(q) ||
        (u.walletAddress && u.walletAddress.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterProvider === 'google') return u.authProvider === 'google';
      if (filterProvider === 'web3') return u.authProvider === 'web3';
      if (filterProvider === 'apex') return u.tier === 'Apex Partner';
      if (filterProvider === 'suspended') return u.status === 'suspended';
      return true;
    });
  }, [allUsers, searchTerm, filterProvider]);

  // Unlock validation
  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stored = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    if (pinInput.trim() === stored || pinInput.trim() === DEFAULT_PIN) {
      setIsUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Incorrect Master Security PIN.');
    }
  };

  const handleInstantDemoUnlock = () => {
    setPinInput(DEFAULT_PIN);
    setIsUnlocked(true);
    setPinError(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addAdminUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      brandName: newUserBrand.trim() || `${newUserName.trim()}'s Venture`,
      walletAddress: newUserWallet.trim() || undefined,
      tier: newUserTier,
      authProvider: newUserProvider,
      role: 'advertiser',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserBrand('');
    setNewUserWallet('');
    setIsAddUserOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayoutSettings({
      bscAddress: bscAddress.trim(),
      polygonAddress: polygonAddress.trim(),
      solanaAddress: solanaAddress.trim(),
    });
    saveGoogleClientId(googleClientId.trim());
    setSettingsSuccess('Platform credentials and treasury wallets saved successfully!');
    setTimeout(() => setSettingsSuccess(null), 3000);
  };

  // ==========================================
  // EXPORT & REPORTING SYSTEM ("REPORT ALL OPTIONS")
  // ==========================================

  const triggerDownload = (filename: string, content: string, type: 'csv' | 'json') => {
    const mime = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Option 1: Users Export (CSV)
  const exportUsersCsv = () => {
    const headers = ['User_ID,Full_Name,Email_Address,Brand_Name,Website_URL,Auth_Provider,Tier,Status,Total_Spent_USD,Active_Ads_Count,Wallet_Address,Joined_Date,Last_Active'];
    const rows = allUsers.map((u) =>
      `"${u.id}","${u.name}","${u.email}","${u.brandName}","${u.websiteUrl || ''}","${u.authProvider || 'custom'}","${u.tier}","${u.status || 'active'}",${u.totalSpent || 0},${u.activeAdsCount || 0},"${u.walletAddress || ''}","${u.createdAt}","${u.lastActiveAt || u.createdAt}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload(`adstoto_users_directory_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'csv');
  };

  // Option 2: Users Export (JSON)
  const exportUsersJson = () => {
    const jsonContent = JSON.stringify({
      reportType: 'Advertisers & Platform Users Directory',
      exportedAt: new Date().toISOString(),
      platform: 'AdsToto Ad Exchange',
      totalRegisteredUsers: totalUsers,
      breakdown: {
        googleVerified: googleUsers,
        web3Wallets: web3Users,
        apexPartners: apexPartnersCount,
        growthMarketers: growthMarketersCount,
        starterAdvertisers: starterAdvertisersCount,
      },
      users: allUsers,
    }, null, 2);
    triggerDownload(`adstoto_users_directory_${new Date().toISOString().split('T')[0]}.json`, jsonContent, 'json');
  };

  // Option 3: Financials & Treasury Audit (CSV)
  const exportFinancialsCsv = () => {
    const headers = ['Metric,Value,Unit,Note'];
    const rows = [
      `"Total Active Bids Pool",${totalBidsVolume},"USD","Current funds locked in competitive ranks"`,
      `"Total User Lifetime Spend",${totalUserSpend},"USD","Aggregated advertiser deposits"`,
      `"Average Revenue Per User (ARPU)",${arpu},"USD","Spend per registered user"`,
      `"Anti-Replay Cryptographic Hashes",${redeemedTxs},"Count","Blockchain receipts sealed"`,
      `"BNB Chain Treasury Wallet","${payoutSettings.bscAddress || '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22'}","BEP-20","Primary merchant wallet"`,
      `"Polygon Treasury Wallet","${payoutSettings.polygonAddress || '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22'}","ERC-20","Secondary merchant wallet"`,
      `"Solana Treasury Wallet","${payoutSettings.solanaAddress || '7i5btA8xGA5en3S53V8eGjguTYSoLGLCYw9hpWvCtWnn'}","SPL","Solana merchant wallet"`,
    ];
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload(`adstoto_financials_treasury_report_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'csv');
  };

  // Option 4: Campaigns Performance Report (CSV)
  const exportCampaignsCsv = () => {
    const headers = ['Rank,Campaign_ID,Title,Tagline,Destination_URL,Active_Bid_USD,Impressions,Clicks,CTR_Percent,AutoBid_Enabled,Status'];
    const rows = campaigns.map((c) => {
      const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : '0.00';
      return `${c.rank},"${c.id}","${c.title}","${c.tagline}","${c.destinationUrl}",${c.bidAmount},${c.impressions},${c.clicks},${ctr},${c.autoBid.enabled ? 'YES' : 'NO'},"${c.status}"`;
    });
    const csvContent = [headers, ...rows].join('\n');
    triggerDownload(`adstoto_campaigns_performance_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'csv');
  };

  // Option 5: Executive Full Platform Diagnostic Dossier (JSON)
  const exportFullExecutiveDossier = () => {
    const fullReport = {
      reportTitle: 'AdsToto Executive SaaS Platform Report',
      generatedAt: new Date().toISOString(),
      platformVersion: '2.5.0-production',
      domain: 'adstoto.com',
      kpis: {
        totalUsers,
        activeUsersCount,
        suspendedUsersCount,
        googleUsers,
        web3Users,
        totalBidsVolumeUSD: totalBidsVolume,
        totalLifetimeSpendUSD: totalUserSpend,
        arpuUSD: arpu,
        totalImpressionsDelivered,
        totalClicksDelivered,
        platformAverageCTR: `${avgCtr}%`,
        sealedAntiReplayReceipts: redeemedTxs,
      },
      tierDistribution: {
        apexPartners: apexPartnersCount,
        growthMarketers: growthMarketersCount,
        starterAdvertisers: starterAdvertisersCount,
      },
      treasuryWallets: payoutSettings,
      campaignCount: campaigns.length,
      topCampaign: campaigns[0] ? {
        title: campaigns[0].title,
        rank: campaigns[0].rank,
        bidAmount: campaigns[0].bidAmount,
        clicks: campaigns[0].clicks,
      } : null,
      usersSummary: allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        brand: u.brandName,
        provider: u.authProvider,
        tier: u.tier,
        spend: u.totalSpent,
      })),
    };
    triggerDownload(`adstoto_executive_dossier_${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(fullReport, null, 2), 'json');
  };

  // Option 6: Copy Markdown Summary to Clipboard
  const handleCopyTextSummary = () => {
    const text = `📊 **AdsToto Platform Executive Report (${new Date().toLocaleDateString()})**
------------------------------------------------
👥 **Users on Platform:** ${totalUsers} Total
   • Google Verified: ${googleUsers} (${Math.round((googleUsers / Math.max(totalUsers, 1)) * 100)}%)
   • Web3 BEP-20: ${web3Users} (${Math.round((web3Users / Math.max(totalUsers, 1)) * 100)}%)
   • Active Advertisers: ${activeUsersCount} | Suspended: ${suspendedUsersCount}
   • Apex Partners: ${apexPartnersCount} | Growth: ${growthMarketersCount} | Starter: ${starterAdvertisersCount}

💰 **Financials & Bids Pool:**
   • Active Bids in Play: $${totalBidsVolume.toLocaleString()}
   • Total Lifetime Spend: $${totalUserSpend.toLocaleString()}
   • Average Revenue Per User (ARPU): $${arpu}
   • Sealed Blockchain TX Receipts: ${redeemedTxs}

🚀 **Campaign & Traffic Telemetry:**
   • Total Live Campaigns: ${campaigns.length}
   • Impressions Delivered: ${totalImpressionsDelivered.toLocaleString()}
   • Clicks Delivered: ${totalClicksDelivered.toLocaleString()}
   • Platform Average CTR: ${avgCtr}%
   • Current #1 Crown Bid: $${campaigns[0]?.bidAmount || 0} (${campaigns[0]?.title || 'None'})

🔒 **Treasury Status:** Operational (BNB Smart Chain + Polygon + Solana)
Generated automatically by AdsToto SaaS Operations Center.`;

    navigator.clipboard.writeText(text);
    setCopySuccessMessage('Executive report copied to clipboard!');
    setTimeout(() => setCopySuccessMessage(null), 3000);
  };

  // PIN CHALLENGE IF NOT UNLOCKED
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center space-y-6 animate-in fade-in duration-200 text-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Suite</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your Master Security PIN to view registered platform users, financials, analytics reports, and platform controls.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            autoFocus
            maxLength={10}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter Master PIN (e.g. 888888)"
            className="w-full text-center bg-white border border-slate-300 rounded-2xl px-4 py-3 font-mono text-xl text-slate-900 tracking-widest focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-2xs"
          />

          {pinError && (
            <div className="text-xs text-rose-600 flex items-center justify-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Unlock Admin Command Center
            </button>

            {/* Instant One-Click Demo Access */}
            <button
              type="button"
              onClick={handleInstantDemoUnlock}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant 1-Click Access (Default PIN: 888888)</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-900">
      {/* ======================================================== */}
      {/* 1. TOP EXECUTIVE HEADER BANNER                           */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AdsToto SaaS Operations Suite
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SYSTEM HEALTHY</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                v2.5 PRODUCTION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live advertiser directory, platform analytics, multi-option reporting center, and on-chain treasury audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Copy Report */}
          <button
            onClick={handleCopyTextSummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            title="Copy Executive Summary to Clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>Copy Summary</span>
          </button>

          {/* Quick Export Users CSV */}
          <button
            onClick={exportUsersCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            title="Export all users to CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Add Advertiser CTA */}
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Advertiser</span>
          </button>

          {/* Lock Admin */}
          <button
            onClick={() => setIsUnlocked(false)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Lock Admin Console"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copySuccessMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center justify-between gap-2 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{copySuccessMessage}</span>
          </div>
          <button onClick={() => setCopySuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EXECUTIVE KPI CARDS: REAL PLATFORM USER COUNT & STATS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users on Platform (Core User Request) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Platform Users Count</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">{totalUsers}</span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">
              {activeUsersCount} Active
            </span>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-slate-200 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>Google Accounts</span>
              </span>
              <span className="font-mono text-slate-900 font-semibold">
                {googleUsers} ({totalUsers > 0 ? Math.round((googleUsers / totalUsers) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Web3 Wallets</span>
              </span>
              <span className="font-mono text-slate-900 font-semibold">
                {web3Users} ({totalUsers > 0 ? Math.round((web3Users / totalUsers) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Ad Volume Pool */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Bids Pool</span>
            <DollarSign className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">
              ${totalBidsVolume.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">in play</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span>Live Campaigns:</span>
              <span className="font-mono text-slate-900 font-semibold">{campaigns.length} ads</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg Spend / User (ARPU):</span>
              <span className="font-mono text-emerald-600 font-semibold">${arpu}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Traffic & Delivery Telemetry */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Traffic Telemetry</span>
            <MousePointer className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {totalClicksDelivered.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">clicks</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span>Impressions:</span>
              <span className="font-mono text-slate-900 font-semibold">{totalImpressionsDelivered.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Platform CTR:</span>
              <span className="font-mono text-emerald-600 font-semibold">{avgCtr}%</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Security Health & Anti-Replay Guard */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cryptographic Security</span>
            <ShieldCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {redeemedTxs}
            </span>
            <span className="text-xs text-emerald-600 font-mono font-semibold">Sealed TXs</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span>Anti-Replay Ledger:</span>
              <span className="font-mono text-emerald-600 font-semibold">100% Protected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Suspended Users:</span>
              <span className="font-mono text-slate-700 font-semibold">{suspendedUsersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DASHBOARD TABS NAVIGATION                             */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Executive Overview &amp; Revenue Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Advertiser CRM &amp; Directory ({totalUsers})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="flex items-center gap-1.5">
            <span>Reports &amp; Intelligence</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono font-bold">
              ALL OPTIONS
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'financials'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>On-Chain Audit &amp; Treasury</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Campaign Moderation ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Platform &amp; OAuth Config</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW & USER GROWTH                  */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Acquisition & Tier Distribution Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity & Auth Breakdown Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>User Authentication Split</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{totalUsers} Users Total</span>
              </div>
              <p className="text-xs text-slate-500">
                Breakdown of how advertisers authenticate on AdsToto.
              </p>

              {/* Progress bars */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Google OAuth Verified
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {googleUsers} ({totalUsers > 0 ? Math.round((googleUsers / totalUsers) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${totalUsers > 0 ? (googleUsers / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Web3 Wallet (BEP-20)
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {web3Users} ({totalUsers > 0 ? Math.round((web3Users / totalUsers) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalUsers > 0 ? (web3Users / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-700 font-semibold">{activeUsersCount} Active · {suspendedUsersCount} Suspended</span>
              </div>
            </div>

            {/* Subscription & VIP Tier Matrix */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Advertiser Tier Distribution</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Privileges</span>
              </div>
              <p className="text-xs text-slate-500">
                Distribution of advertiser tiers across the platform ecosystem.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Apex Partners</div>
                      <div className="text-[10px] text-slate-500">Highest bids &amp; priority placement</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-blue-700">{apexPartnersCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Growth Marketers</div>
                      <div className="text-[10px] text-slate-500">Active scale campaigns</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-emerald-700">{growthMarketersCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Starter Advertisers</div>
                      <div className="text-[10px] text-slate-500">Entry testing campaigns</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-slate-700">{starterAdvertisersCount}</span>
                </div>
              </div>
            </div>

            {/* Quick SaaS Administrative Actions */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>SaaS Quick Actions</span>
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200/60">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-500">
                Direct management shortcuts for platform administrators.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Add New Advertiser
                      </div>
                      <div className="text-[10px] text-slate-500">Create client account manually</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Generate Platform Reports
                      </div>
                      <div className="text-[10px] text-slate-500">Export CSV / JSON / Summaries</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={() => setActiveTab('financials')}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Audit Anti-Replay Guard
                      </div>
                      <div className="text-[10px] text-slate-500">{redeemedTxs} Sealed transactions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* REAL-TIME REVENUE PROJECTION ENGINE (RECHARTS) */}
          <RevenueProjectionChart
            campaigns={campaigns}
            allUsers={allUsers}
            totalBidsVolume={totalBidsVolume}
            totalUserSpend={totalUserSpend}
          />

          {/* User Growth & Platform Highlights Bar */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Platform Advertiser Highlights &amp; High Spenders</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top performing and verified advertisers leading bid volume on AdsToto.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All {totalUsers} Users</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {allUsers.slice(0, 3).map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserDossier(u)}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.avatarBg || 'from-indigo-600 to-purple-600'} flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs`}>
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{u.brandName}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                      {u.tier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                    <span className="text-slate-500">Total Spend:</span>
                    <span className="font-mono text-emerald-600 font-bold">${u.totalSpent || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ADVERTISER CRM & USER DIRECTORY                   */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search, Filter, and Counter Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search advertisers by name, email, brand, wallet, or ID..."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setFilterProvider('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterProvider === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                All ({totalUsers})
              </button>
              <button
                onClick={() => setFilterProvider('google')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterProvider === 'google'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterProvider === 'google' ? 'bg-white' : 'bg-blue-600'}`}></span>
                <span>Google ({googleUsers})</span>
              </button>
              <button
                onClick={() => setFilterProvider('web3')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterProvider === 'web3'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <Wallet className="w-3 h-3" />
                <span>Web3 ({web3Users})</span>
              </button>
              <button
                onClick={() => setFilterProvider('apex')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterProvider === 'apex'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <span>Apex ({apexPartnersCount})</span>
              </button>
              <button
                onClick={() => setFilterProvider('suspended')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterProvider === 'suspended'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <span>Suspended ({suspendedUsersCount})</span>
              </button>
            </div>
          </div>

          {/* CRM Users Table */}
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Advertiser Profile</th>
                    <th className="py-3.5 px-4">Brand &amp; Website</th>
                    <th className="py-3.5 px-4">Identity Method</th>
                    <th className="py-3.5 px-4">Tier Level</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Spend</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No advertisers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setSelectedUserDossier(u)}
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                                u.avatarBg || 'from-indigo-600 to-purple-600'
                              } flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-transform`}
                              title="Click to view full dossier"
                            >
                              {u.avatarInitials || u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span
                                  onClick={() => setSelectedUserDossier(u)}
                                  className="hover:text-blue-600 cursor-pointer transition-colors"
                                >
                                  {u.name}
                                </span>
                                {u.role === 'admin' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/80 font-bold">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px]">{u.email}</div>
                              {u.walletAddress && (
                                <div className="text-[10px] font-mono text-emerald-600 mt-0.5">
                                  {u.walletAddress.substring(0, 6)}...{u.walletAddress.substring(u.walletAddress.length - 4)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{u.brandName}</div>
                          {u.websiteUrl && (
                            <a
                              href={u.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <span>{u.websiteUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        {/* Provider */}
                        <td className="py-3.5 px-4">
                          {u.authProvider === 'google' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>Google Verified</span>
                            </span>
                          ) : u.authProvider === 'web3' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 font-mono">
                              <Wallet className="w-3 h-3 text-amber-600" />
                              <span>BEP-20 Web3</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-600 bg-slate-100">
                              Custom
                            </span>
                          )}
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.tier}
                            onChange={(e) =>
                              updateUserTier(
                                u.id,
                                e.target.value as 'Starter Advertiser' | 'Growth Marketer' | 'Apex Partner'
                              )
                            }
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="Starter Advertiser">Starter Advertiser</option>
                            <option value="Growth Marketer">Growth Marketer</option>
                            <option value="Apex Partner">Apex Partner</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title="Click to toggle Active / Suspended status"
                          >
                            {u.status === 'suspended' ? 'Suspended' : 'Active'}
                          </button>
                        </td>

                        {/* Total Spent */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          ${u.totalSpent || 0}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUserDossier(u)}
                              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border border-slate-200/60"
                              title="View User Dossier"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              <span>Dossier</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REPORTS & INTELLIGENCE CENTER ("REPORT ALL OPTIONS")*/}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>SaaS Reporting &amp; Intelligence Export Center</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Generate and download multi-format reports across users, campaign telemetry, on-chain financials, and security audits.
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
                <button
                  onClick={() => setReportDateRange('24h')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                    reportDateRange === '24h' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last 24h
                </button>
                <button
                  onClick={() => setReportDateRange('7d')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                    reportDateRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setReportDateRange('30d')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                    reportDateRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setReportDateRange('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ${
                    reportDateRange === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All-Time
                </button>
              </div>
            </div>

            {/* Global Summary Action Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Active Data Pool:</span>
                <span className="font-mono text-slate-900 font-semibold">{totalUsers} Users</span>
                <span>·</span>
                <span className="font-mono text-slate-900 font-semibold">{campaigns.length} Campaigns</span>
                <span>·</span>
                <span className="font-mono text-slate-900 font-semibold">${totalBidsVolume} Volume</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTextSummary}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copy Markdown Report</span>
                </button>

                <button
                  onClick={exportFullExecutiveDossier}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Complete Platform Bundle (JSON)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5 Distinct Report Options Cards ("REPORT ALL OPTIONS") */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Report Option 1: Users & Demographics */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Users &amp; Accounts Directory Report</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Complete registry of all registered users on AdsToto, including contact emails, Web3 wallet addresses, tiers, spend, and auth methods.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Records:</span>
                    <span className="text-slate-900 font-bold">{totalUsers} advertisers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Google / Web3:</span>
                    <span className="text-blue-700 font-semibold">{googleUsers} / {web3Users}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={exportUsersCsv}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Users (CSV)</span>
                </button>
                <button
                  onClick={exportUsersJson}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Users (JSON)</span>
                </button>
              </div>
            </div>

            {/* Report Option 2: Financials & Treasury */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Financials &amp; On-Chain Treasury Report</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Audit of all platform ad bids in play, lifetime spend, receiving merchant addresses (BSC, Polygon, Solana), and sealed transaction hashes.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Bids Volume:</span>
                    <span className="text-emerald-700 font-bold">${totalBidsVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Average ARPU:</span>
                    <span className="text-slate-900 font-bold">${arpu}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={exportFinancialsCsv}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Financials (CSV)</span>
                </button>
                <button
                  onClick={() => setPreviewReportType('financials')}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preview Treasury Ledger</span>
                </button>
              </div>
            </div>

            {/* Report Option 3: Campaign Performance & Telemetry */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Campaign Exchange &amp; CTR Report</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Live exchange performance report: rankings #1 through #10+, bid competition, delivered impressions, click counts, and conversion metrics.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Impressions:</span>
                    <span className="text-blue-700 font-bold">{totalImpressionsDelivered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg CTR:</span>
                    <span className="text-emerald-700 font-bold">{avgCtr}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={exportCampaignsCsv}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Campaigns (CSV)</span>
                </button>
                <button
                  onClick={() => setPreviewReportType('campaigns')}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview Rankings Table</span>
                </button>
              </div>
            </div>

            {/* Report Option 4: Anti-Replay & Security Audit */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cryptographic Security &amp; Anti-Replay Audit</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Double-spend prevention verification hashes, wallet authentication logs, and cryptographic transaction seals protecting platform funds.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sealed Hashes:</span>
                    <span className="text-emerald-700 font-bold">{redeemedTxs} receipts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replay Exploits:</span>
                    <span className="text-emerald-700 font-bold">0 blocked</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewReportType('security')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Inspect Security Seals</span>
                </button>
              </div>
            </div>

            {/* Report Option 5: Executive Full Platform Diagnostic Report */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all space-y-3.5 shadow-2xs flex flex-col justify-between md:col-span-2">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Complete Executive Platform Diagnostic Dossier</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Consolidated 360° platform audit containing users, financials, live traffic telemetry, treasury configs, anti-replay hashes, and active rankings in a single machine-readable package.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap">
                <button
                  onClick={exportFullExecutiveDossier}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Executive Dossier (JSON)</span>
                </button>

                <button
                  onClick={handleCopyTextSummary}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                  <span>Copy Formatted Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FINANCIAL AUDIT & ON-CHAIN TREASURY               */}
      {/* ======================================================== */}
      {activeTab === 'financials' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Platform Treasury Status &amp; Receiving Merchants</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active multi-chain merchant addresses designated to collect on-chain payments from outbid challenges and campaign deposits.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-amber-700 font-bold uppercase font-mono">BNB Smart Chain (BEP-20)</div>
                <div className="font-mono text-xs text-slate-900 truncate">
                  {payoutSettings.bscAddress || '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-blue-700 font-bold uppercase font-mono">Polygon (USDT/USDC)</div>
                <div className="font-mono text-xs text-slate-900 truncate">
                  {payoutSettings.polygonAddress || '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-purple-700 font-bold uppercase font-mono">Solana (SPL USDC)</div>
                <div className="font-mono text-xs text-slate-900 truncate">
                  {payoutSettings.solanaAddress || '7i5btA8xGA5en3S53V8eGjguTYSoLGLCYw9hpWvCtWnn'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Anti-Replay Attack Registry (Double-Spending Guard)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                {redeemedTxs} Hashes Sealed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Every blockchain payment receipt is permanently indexed in this cryptographic registry to prevent replay exploits.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700">
              <div className="text-slate-500 text-[11px] mb-2 font-sans font-medium">
                Sample Sealed Hashes on Record:
              </div>
              <div className="space-y-1 text-emerald-700 font-mono text-[11px]">
                <div>• 0x4a8f9c1b7e3d2a0f8b6e5c4d3a2b1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a [Verified BEP-20]</div>
                <div>• 0x7c9b2e1a4d8f0c3b5a6e7d8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b [Verified BEP-20]</div>
                <div>• 0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c [Verified Polygon]</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CAMPAIGN MODERATION QUEUE                         */}
      {/* ======================================================== */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Ad Moderation Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect, pause, or adjust campaigns running on the ad exchange.
              </p>
            </div>
            {onOpenCreateAd && (
              <button
                onClick={onOpenCreateAd}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Create Admin Ad
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${camp.iconBg} flex items-center justify-center font-mono font-bold text-white text-xs shrink-0 shadow-xs`}
                  >
                    {camp.iconSymbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{camp.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                        #{camp.rank}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{camp.tagline}</div>
                    <div className="text-[11px] text-emerald-700 font-mono mt-0.5 font-medium">
                      ${camp.bidAmount} active bid · {camp.clicks} clicks · {camp.impressions} views
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      camp.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: PLATFORM & OAUTH SETTINGS                         */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Platform Configuration &amp; Credentials</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure treasury deposit addresses, Google OAuth 2.0 Web Client settings, and platform variables.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                BNB Smart Chain (BEP-20) Treasury Wallet
              </label>
              <input
                type="text"
                value={bscAddress}
                onChange={(e) => setBscAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Polygon (ERC-20 USDT/USDC) Treasury Wallet
              </label>
              <input
                type="text"
                value={polygonAddress}
                onChange={(e) => setPolygonAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Solana (SPL USDC) Treasury Address
              </label>
              <input
                type="text"
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                placeholder="Base58 address"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Google OAuth 2.0 Web Client ID</span>
                <span className="text-[10px] text-blue-600">For direct GIS popup authentication</span>
              </label>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="828845718854-r5ih63tqcm3gue7ig7kfd9f37gtbbati.apps.googleusercontent.com"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* USER DOSSIER MODAL (FULL SAAS PROFILE INSPECTION)        */}
      {/* ======================================================== */}
      {selectedUserDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedUserDossier.avatarBg || 'from-indigo-600 to-purple-600'} flex items-center justify-center text-white font-mono font-extrabold text-base shadow-xs`}>
                  {selectedUserDossier.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedUserDossier.name}</span>
                    {selectedUserDossier.role === 'admin' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 font-bold">
                        ADMIN
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-500">{selectedUserDossier.email}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDossier(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Information Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-500">Brand Name</div>
                <div className="font-bold text-slate-900 truncate">{selectedUserDossier.brandName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-500">Auth Method</div>
                <div className="font-bold text-blue-700 flex items-center gap-1">
                  {selectedUserDossier.authProvider === 'google' ? 'Google Account' : 'Web3 BEP-20 Wallet'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-500">Total Spend</div>
                <div className="font-bold text-emerald-700 font-mono">${selectedUserDossier.totalSpent || 0}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                <div className="text-[10px] uppercase font-mono text-slate-500">Account Tier</div>
                <div className="font-bold text-slate-900">{selectedUserDossier.tier}</div>
              </div>
            </div>

            {selectedUserDossier.walletAddress && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="text-[10px] uppercase font-mono text-slate-500">Connected Wallet Address</div>
                <div className="font-mono text-emerald-700 truncate flex items-center justify-between">
                  <span>{selectedUserDossier.walletAddress}</span>
                  <a
                    href={`https://bscscan.com/address/${selectedUserDossier.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-mono">User ID: {selectedUserDossier.id}</span>
              <button
                onClick={() => {
                  toggleUserStatus(selectedUserDossier.id);
                  setSelectedUserDossier(prev => prev ? ({ ...prev, status: prev.status === 'suspended' ? 'active' : 'suspended' }) : null);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                  selectedUserDossier.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {selectedUserDossier.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT PREVIEW MODAL                                     */}
      {/* ======================================================== */}
      {previewReportType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xl max-h-[85vh] flex flex-col text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>
                  {previewReportType === 'financials' && 'Treasury & Financial Audit Ledger'}
                  {previewReportType === 'campaigns' && 'Active Campaigns & Telemetry Rankings'}
                  {previewReportType === 'security' && 'Cryptographic Anti-Replay Registry'}
                </span>
              </h3>
              <button
                onClick={() => setPreviewReportType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 text-xs pr-1">
              {previewReportType === 'campaigns' && (
                <div className="space-y-2">
                  {campaigns.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>#{c.rank} {c.title}</span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">${c.bidAmount}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{c.tagline}</div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-600">
                        <div>{c.clicks} clicks</div>
                        <div className="text-slate-400">{c.impressions} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewReportType === 'financials' && (
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-sans">Active Bids Capital:</div>
                    <div className="text-lg font-bold text-emerald-700">${totalBidsVolume.toLocaleString()} USD</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-sans">Lifetime Advertiser Deposits:</div>
                    <div className="text-lg font-bold text-slate-900">${totalUserSpend.toLocaleString()} USD</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-sans">Registered Advertisers:</div>
                    <div className="text-lg font-bold text-blue-700">{totalUsers} Active Accounts</div>
                  </div>
                </div>
              )}

              {previewReportType === 'security' && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-xs">
                    Sealed cryptographic hashes prevents transaction replay and double-spending across BSC and EVM networks:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-emerald-700 space-y-1.5">
                    <div>✓ 0x4a8f9c1b7e3d2a0f8b6e5c4d3a2b1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a [SEALED]</div>
                    <div>✓ 0x7c9b2e1a4d8f0c3b5a6e7d8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b [SEALED]</div>
                    <div>✓ 0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c [SEALED]</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewReportType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD ADVERTISER MODAL                                     */}
      {/* ======================================================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Add Advertiser to Platform</span>
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Founder or Advertiser Name"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="advertiser@company.com"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Brand Name</label>
                <input
                  type="text"
                  value={newUserBrand}
                  onChange={(e) => setNewUserBrand(e.target.value)}
                  placeholder="Brand or Venture Name"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Wallet Address (Optional)</label>
                <input
                  type="text"
                  value={newUserWallet}
                  onChange={(e) => setNewUserWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tier Level</label>
                  <select
                    value={newUserTier}
                    onChange={(e) => setNewUserTier(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 mt-1 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="Starter Advertiser">Starter Advertiser</option>
                    <option value="Growth Marketer">Growth Marketer</option>
                    <option value="Apex Partner">Apex Partner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Auth Method</label>
                  <select
                    value={newUserProvider}
                    onChange={(e) => setNewUserProvider(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 mt-1 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="google">Google Account</option>
                    <option value="web3">Web3 Wallet</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Save Advertiser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
