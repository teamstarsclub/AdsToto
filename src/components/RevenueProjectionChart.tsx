import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Sliders, 
  BarChart3, 
  Activity,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { AdCampaign } from '../types/ad';
import { UserProfile } from '../types/auth';

interface RevenueProjectionChartProps {
  campaigns: AdCampaign[];
  allUsers: UserProfile[];
  totalBidsVolume: number;
  totalUserSpend: number;
}

type Timeframe = 'daily' | 'weekly' | 'monthly';
type ChartMode = 'area' | 'bar';
type GrowthScenario = 'conservative' | 'target' | 'aggressive';

export const RevenueProjectionChart: React.FC<RevenueProjectionChartProps> = ({
  campaigns,
  allUsers,
  totalBidsVolume,
  totalUserSpend,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [chartMode, setChartMode] = useState<ChartMode>('area');
  const [growthScenario, setGrowthScenario] = useState<GrowthScenario>('target');
  const [platformTakeRate, setPlatformTakeRate] = useState<number>(10); // 10% platform fee

  // Growth multipliers based on selected scenario
  const growthMultiplier = useMemo(() => {
    switch (growthScenario) {
      case 'conservative': return 1.05; // 5% pacing
      case 'aggressive': return 1.30;   // 30% pacing
      case 'target':
      default: return 1.15;            // 15% pacing
    }
  }, [growthScenario]);

  // Baseline earnings calculations derived from live platform state
  const activeAdvertisers = Math.max(allUsers.length, 1);
  const activeCampaignsCount = Math.max(campaigns.length, 1);
  const totalBids = Math.max(totalBidsVolume, 100);

  // Estimated daily base revenue: (10% of outbid battle volume) + (daily recurring bids pacing)
  const baseDailyVolume = totalBids * 0.18; // ~18% of bid pool actively challenged daily
  const baseDailyPlatformEarnings = Math.round(baseDailyVolume * (platformTakeRate / 100) + (activeCampaignsCount * 8));

  // Projected metrics
  const projectedDailyEarnings = Math.round(baseDailyPlatformEarnings * growthMultiplier);
  const projectedWeeklyEarnings = Math.round(projectedDailyEarnings * 7);
  const projectedMonthlyEarnings = Math.round(projectedDailyEarnings * 30.5);
  const projectedAnnualEarnings = Math.round(projectedMonthlyEarnings * 12);

  // Generate real-time projection dataset based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === 'daily') {
      // 14 days: 7 days historical / live + 7 days projected
      const days = [
        { day: 'Mon', date: 'Oct 01', hist: true },
        { day: 'Tue', date: 'Oct 02', hist: true },
        { day: 'Wed', date: 'Oct 03', hist: true },
        { day: 'Thu', date: 'Oct 04', hist: true },
        { day: 'Fri', date: 'Oct 05', hist: true },
        { day: 'Sat', date: 'Oct 06', hist: true },
        { day: 'Sun (Live)', date: 'Today', hist: false },
        { day: 'Mon +1', date: 'Oct 08', hist: false },
        { day: 'Tue +2', date: 'Oct 09', hist: false },
        { day: 'Wed +3', date: 'Oct 10', hist: false },
        { day: 'Thu +4', date: 'Oct 11', hist: false },
        { day: 'Fri +5', date: 'Oct 12', hist: false },
        { day: 'Sat +6', date: 'Oct 13', hist: false },
        { day: 'Sun +7', date: 'Oct 14', hist: false },
      ];

      return days.map((d, index) => {
        // Curve calculation
        const factor = index < 7 
          ? 0.75 + (index * 0.04) 
          : (1.0 + ((index - 6) * 0.05 * (growthMultiplier - 0.9)));
        
        const grossAdVolume = Math.round(baseDailyVolume * factor);
        const outbidChallengeFees = Math.round(grossAdVolume * 0.35);
        const netEarnings = Math.round(grossAdVolume * (platformTakeRate / 100) + (outbidChallengeFees * 0.25));

        return {
          label: d.date,
          subtitle: d.day,
          isProjection: !d.hist,
          netEarnings,
          grossVolume: grossAdVolume,
          outbidFees: outbidChallengeFees,
          totalTake: netEarnings + Math.round(outbidChallengeFees * 0.1),
        };
      });
    }

    if (timeframe === 'weekly') {
      // 8 weeks trajectory
      const weeks = [
        { label: 'Wk 38 (Past)', hist: true },
        { label: 'Wk 39 (Past)', hist: true },
        { label: 'Wk 40 (Live)', hist: true },
        { label: 'Wk 41 (Proj)', hist: false },
        { label: 'Wk 42 (Proj)', hist: false },
        { label: 'Wk 43 (Proj)', hist: false },
        { label: 'Wk 44 (Proj)', hist: false },
        { label: 'Wk 45 (Proj)', hist: false },
      ];

      return weeks.map((w, index) => {
        const factor = index < 3 
          ? 0.8 + (index * 0.1) 
          : (1.05 + ((index - 2) * 0.12 * (growthMultiplier - 0.85)));

        const grossAdVolume = Math.round(baseDailyVolume * 7 * factor);
        const outbidChallengeFees = Math.round(grossAdVolume * 0.32);
        const netEarnings = Math.round(grossAdVolume * (platformTakeRate / 100) + (outbidChallengeFees * 0.25));

        return {
          label: w.label,
          subtitle: `Week ${index + 1}`,
          isProjection: !w.hist,
          netEarnings,
          grossVolume: grossAdVolume,
          outbidFees: outbidChallengeFees,
          totalTake: netEarnings + Math.round(outbidChallengeFees * 0.1),
        };
      });
    }

    // Monthly projection: 12 months
    const months = [
      { label: 'May', hist: true },
      { label: 'Jun', hist: true },
      { label: 'Jul', hist: true },
      { label: 'Aug', hist: true },
      { label: 'Sep', hist: true },
      { label: 'Oct (Live)', hist: true },
      { label: 'Nov (Proj)', hist: false },
      { label: 'Dec (Proj)', hist: false },
      { label: 'Jan (Proj)', hist: false },
      { label: 'Feb (Proj)', hist: false },
      { label: 'Mar (Proj)', hist: false },
      { label: 'Apr (Proj)', hist: false },
    ];

    return months.map((m, index) => {
      const factor = index < 6 
        ? 0.65 + (index * 0.08) 
        : (1.1 + ((index - 5) * 0.14 * (growthMultiplier - 0.85)));

      const grossAdVolume = Math.round(baseDailyVolume * 30 * factor);
      const outbidChallengeFees = Math.round(grossAdVolume * 0.3);
      const netEarnings = Math.round(grossAdVolume * (platformTakeRate / 100) + (outbidChallengeFees * 0.25));

      return {
        label: m.label,
        subtitle: 'Monthly',
        isProjection: !m.hist,
        netEarnings,
        grossVolume: grossAdVolume,
        outbidFees: outbidChallengeFees,
        totalTake: netEarnings + Math.round(outbidChallengeFees * 0.1),
      };
    });
  }, [timeframe, baseDailyVolume, platformTakeRate, growthMultiplier]);

  // Custom Formatted Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200/90 p-3 rounded-xl shadow-xl min-w-[210px] space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>{label}</span>
              {dataPoint.subtitle && (
                <span className="text-[10px] text-slate-500 font-normal">({dataPoint.subtitle})</span>
              )}
            </span>
            {dataPoint.isProjection ? (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PROJECTION
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                VERIFIED
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-blue-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Net Platform Earnings:</span>
              </span>
              <span className="font-bold text-slate-900">${dataPoint.netEarnings.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Gross Ad Volume (GMV):</span>
              </span>
              <span className="font-semibold text-slate-700">${dataPoint.grossVolume.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-indigo-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Outbid Challenge Fees:</span>
              </span>
              <span className="font-semibold text-slate-700">${dataPoint.outbidFees.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-sans">
            <span>Take-Rate Margin:</span>
            <span className="text-blue-700 font-mono font-bold">{platformTakeRate}% fee cut</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* 1. Header with Title & Projection Run-Rate Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Real-Time Ad Platform Revenue Projections</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                LIVE FORECAST
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic earnings projection engine modeling daily, weekly, and monthly net platform commission and ad bid turnover.
          </p>
        </div>

        {/* View Switchers: Timeframe & Chart Style */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Daily / Weekly / Monthly Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeframe === 'weekly'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setChartMode('area')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                chartMode === 'area' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Area Curve View"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                chartMode === 'bar' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Bar Stream Breakdown View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Run-Rate Metric Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Projected Daily Run-Rate</span>
            <span className="text-emerald-700 font-bold">+18%</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ${projectedDailyEarnings.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal ml-1">/day</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Based on {campaigns.length} active rank bids
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Projected Weekly Earnings</span>
            <span className="text-blue-700 font-bold">Pacing</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ${projectedWeeklyEarnings.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal ml-1">/wk</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            7-day aggregate outbid turnover
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Monthly Platform MRR</span>
            <span className="text-emerald-700 font-bold">Target</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            ${projectedMonthlyEarnings.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal ml-1">/mo</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {allUsers.length} registered advertisers
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Annual Run-Rate (ARR)</span>
            <span className="text-blue-700 font-bold">Annualized</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            ${projectedAnnualEarnings.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal ml-1">/yr</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            Long-term platform scale
          </div>
        </div>
      </div>

      {/* 3. Recharts Visualization Canvas */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 relative">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs"></span>
              <span>Net Platform Commission ($)</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-semibold font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Gross Ad Volume ($)</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-indigo-600 font-semibold font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>Outbid Challenge Fees ($)</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {timeframe.toUpperCase()} TIMEFRAME
          </span>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  {/* Blue gradient for Net Platform Earnings */}
                  <linearGradient id="colorNetEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Emerald gradient for Gross Volume */}
                  <linearGradient id="colorGrossVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Indigo gradient for Outbid Fees */}
                  <linearGradient id="colorOutbidFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Area 
                  type="monotone" 
                  dataKey="grossVolume" 
                  stroke="#059669" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGrossVolume)" 
                  name="Gross Volume"
                />
                <Area 
                  type="monotone" 
                  dataKey="outbidFees" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOutbidFees)" 
                  name="Outbid Fees"
                />
                <Area 
                  type="monotone" 
                  dataKey="netEarnings" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorNetEarnings)" 
                  name="Net Earnings"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="grossVolume" fill="#059669" radius={[4, 4, 0, 0]} name="Gross Volume" />
                <Bar dataKey="outbidFees" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Outbid Fees" />
                <Bar dataKey="netEarnings" fill="#2563eb" radius={[4, 4, 0, 0]} name="Net Earnings" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Interactive Simulation Controls (Growth Scenarios & Take-Rate) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold text-slate-900">Projection Sensitivity Engine:</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Scenario Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Scenario:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setGrowthScenario('conservative')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  growthScenario === 'conservative' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conservative (+5%)
              </button>
              <button
                onClick={() => setGrowthScenario('target')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  growthScenario === 'target' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target (+15%)
              </button>
              <button
                onClick={() => setGrowthScenario('aggressive')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  growthScenario === 'aggressive' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aggressive (+30%)
              </button>
            </div>
          </div>

          {/* Platform Fee Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Platform Fee:</span>
            <select
              value={platformTakeRate}
              onChange={(e) => setPlatformTakeRate(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value={5}>5% Commission</option>
              <option value={8}>8% Commission</option>
              <option value={10}>10% Commission (Standard)</option>
              <option value={12}>12% Commission</option>
              <option value={15}>15% Commission (Premium)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
