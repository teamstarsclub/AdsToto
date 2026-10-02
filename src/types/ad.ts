export type CategoryType = 
  | 'all'
  | 'ai'
  | 'saas'
  | 'creator'
  | 'devtools'
  | 'growth'
  | 'crypto';

export interface AutoBidConfig {
  enabled: boolean;
  targetRank: 1 | 3 | 5;
  maxBudget: number;
  incrementStep: number;
  defenseCount: number;
  lastDefendedAt?: string;
}

export interface CryptoPaymentReceipt {
  txHash: string;
  network: 'bsc' | 'polygon' | 'solana' | 'ethereum';
  token: 'USDC' | 'USDT' | 'BNB' | 'SOL' | 'POL';
  amount: number;
  payerAddress?: string;
  recipientAddress: string;
  blockNumber?: number;
  confirmedAt: string;
  status: 'confirmed' | 'pending' | 'failed';
  explorerUrl: string;
}

export interface PayoutSettings {
  bscAddress: string; // BNB Smart Chain (BEP-20) - Main network
  polygonAddress: string;
  solanaAddress: string;
  ethereumAddress: string;
  customPaymentLink?: string;
}

export interface AdCampaign {
  id: string;
  rank: number;
  previousRank: number;
  title: string;
  tagline: string;
  destinationUrl: string;
  displayUrl: string;
  category: CategoryType;
  bidAmount: number; // in USD
  isUserOwned?: boolean;
  iconBg: string;
  iconSymbol: string;
  badge?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  avgConversionValue: number;
  createdAt: string;
  lastBidAt: string;
  autoBid: AutoBidConfig;
  status: 'active' | 'paused';
  hourlyStats: { hour: string; clicks: number; impressions: number }[];
  targetKeywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  paymentReceipt?: CryptoPaymentReceipt;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'outbid' | 'new_campaign' | 'auto_defense' | 'click_surge' | 'rank_takeover';
  campaignId: string;
  campaignTitle: string;
  rivalTitle?: string;
  amount?: number;
  newRank?: number;
  message: string;
}

export interface MarketInsight {
  query: string;
  recommendedBid: number;
  minToEnterTop3: number;
  projectedCtr: number;
  suggestedTaglines: string[];
  trendingKeywords: string[];
  competitiveSummary: string;
  searchGroundingSources?: { title: string; url: string }[];
}
