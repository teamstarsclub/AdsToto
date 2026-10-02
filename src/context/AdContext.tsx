import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdCampaign, ActivityEvent, PayoutSettings, CryptoPaymentReceipt } from '../types/ad';
import { INITIAL_CAMPAIGNS } from '../data/initialCampaigns';

interface AdContextType {
  campaigns: AdCampaign[];
  activityFeed: ActivityEvent[];
  payoutSettings: PayoutSettings;
  updatePayoutSettings: (newSettings: Partial<PayoutSettings>) => void;
  simulationSpeed: 'paused' | 'normal' | 'fast' | 'rush';
  setSimulationSpeed: (speed: 'paused' | 'normal' | 'fast' | 'rush') => void;
  outbidCampaign: (
    targetCampaignId: string,
    yourCampaignId: string,
    bidAmount: number,
    receipt?: CryptoPaymentReceipt
  ) => { success: boolean; message: string; receipt?: CryptoPaymentReceipt };
  quickBoostBid: (campaignId: string, increment: number) => void;
  createCampaign: (data: Partial<AdCampaign>, receipt?: CryptoPaymentReceipt) => string;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleAutoBid: (id: string, enabled?: boolean) => void;
  updateAutoBidConfig: (id: string, config: Partial<AdCampaign['autoBid']>) => void;
  recordClick: (campaignId: string) => void;
  triggerSimulatedSkirmish: () => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
}

const STORAGE_KEY_CAMPAIGNS = 'adstoto_campaigns_v2';
const STORAGE_KEY_ACTIVITY = 'adstoto_activity_v2';
const STORAGE_KEY_PAYOUT = 'adstoto_payout_settings_v1';

function sanitizeString(str?: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

function sanitizeUrl(url?: string): string {
  if (!url) return 'https://adstoto.com';
  const trimmed = url.trim();
  // Prevent dangerous protocol execution (javascript:, data:, vbscript:)
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return 'https://adstoto.com';
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

const DEFAULT_PAYOUT_SETTINGS: PayoutSettings = {
  bscAddress: '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22',
  polygonAddress: '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22',
  solanaAddress: '7pG2q8sUfVwK9E6hNnYbC1oPm4h9L3qX8wZa2bCdEfGh',
  ethereumAddress: '0x71C8F6964F88c83a1519d0aB1a89c97b830d6F22',
  customPaymentLink: '',
};

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CAMPAIGNS;
  });

  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'act-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        type: 'outbid',
        campaignId: 'camp-1',
        campaignTitle: 'CogniFlow AI',
        rivalTitle: 'SaaSify Studio',
        amount: 45,
        newRank: 1,
        message: 'CogniFlow AI outbid SaaSify Studio ($45) to seize Rank #1 Spot!',
      },
      {
        id: 'act-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        type: 'auto_defense',
        campaignId: 'camp-2',
        campaignTitle: 'SaaSify Studio',
        amount: 38,
        newRank: 2,
        message: 'Auto-Bid Guard defended SaaSify Studio with +$2 increment.',
      },
    ];
  });

  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYOUT);
      if (saved) {
        return { ...DEFAULT_PAYOUT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PAYOUT_SETTINGS;
  });

  const updatePayoutSettings = useCallback((newSettings: Partial<PayoutSettings>) => {
    setPayoutSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY_PAYOUT, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save payout settings:', e);
      }
      return updated;
    });
  }, []);

  const [simulationSpeed, setSimulationSpeed] = useState<'paused' | 'normal' | 'fast' | 'rush'>('normal');

  // Helper to re-rank campaigns based on bidAmount
  const sortAndRerank = useCallback((items: AdCampaign[]): AdCampaign[] => {
    const sorted = [...items].sort((a, b) => b.bidAmount - a.bidAmount);
    return sorted.map((item, index) => {
      const newRank = index + 1;
      return {
        ...item,
        previousRank: item.rank !== newRank ? item.rank : item.previousRank,
        rank: newRank,
      };
    });
  }, []);

  // Save to localStorage whenever campaigns change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [campaigns]);

  // Save activity to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activityFeed.slice(0, 30)));
    } catch (e) {
      console.warn('LocalStorage save activity failed:', e);
    }
  }, [activityFeed]);

  const addActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    setActivityFeed((prev) => [newEvent, ...prev.slice(0, 49)]);
  }, []);

  // Real-time visitor click & impression generator simulation
  useEffect(() => {
    if (simulationSpeed === 'paused') return;

    const intervalMs = simulationSpeed === 'rush' ? 1200 : simulationSpeed === 'fast' ? 2500 : 4500;

    const timer = setInterval(() => {
      setCampaigns((prev) => {
        if (!prev.length) return prev;

        // Rank #1 gets highest probability of clicks and impressions
        return prev.map((camp) => {
          if (camp.status === 'paused') return camp;

          // Rank weighting factor: #1 gets high weight, #2 gets good weight, lower ranks get less
          const rankFactor = Math.max(0.1, 1 - (camp.rank - 1) * 0.12);
          const addImp = Math.floor(Math.random() * (12 * rankFactor)) + 3;
          const clickChance = Math.random();
          const didClick = clickChance < (0.28 * rankFactor);
          const addClick = didClick ? 1 : 0;
          const didConvert = didClick && Math.random() < 0.08;

          return {
            ...camp,
            impressions: camp.impressions + addImp,
            clicks: camp.clicks + addClick,
            conversions: camp.conversions + (didConvert ? 1 : 0),
          };
        });
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  // Periodic random competitor skirmish simulation (gives the live pay-to-rank feeling of outbid.lol)
  useEffect(() => {
    if (simulationSpeed === 'paused') return;

    const skirmishInterval = simulationSpeed === 'rush' ? 9000 : simulationSpeed === 'fast' ? 16000 : 28000;

    const skirmishTimer = setInterval(() => {
      // 40% chance of competitor outbidding someone
      if (Math.random() > 0.45) return;

      setCampaigns((prev) => {
        // Pick an active rival (not user-owned)
        const rivals = prev.filter((c) => !c.isUserOwned && c.status === 'active');
        if (rivals.length < 2) return prev;

        const challenger = rivals[Math.floor(Math.random() * rivals.length)];
        const higherRanked = prev.filter((c) => c.rank < challenger.rank && c.id !== challenger.id);
        if (!higherRanked.length) return prev;

        // Target someone 1 or 2 spots above
        const target = higherRanked[higherRanked.length - 1];
        const newBid = target.bidAmount + (Math.floor(Math.random() * 3) + 1) * 5;

        // Check if challenger auto-bid budget allows
        if (challenger.autoBid.enabled && newBid > challenger.autoBid.maxBudget) {
          return prev;
        }

        const updated = prev.map((c) => {
          if (c.id === challenger.id) {
            return {
              ...c,
              bidAmount: newBid,
              lastBidAt: new Date().toISOString(),
            };
          }
          return c;
        });

        // Check if target has auto-bid enabled to defend!
        let finalUpdated = sortAndRerank(updated);
        const targetNow = finalUpdated.find((c) => c.id === target.id);

        if (targetNow && targetNow.autoBid.enabled && targetNow.bidAmount < newBid) {
          const defensiveBid = newBid + targetNow.autoBid.incrementStep;
          if (defensiveBid <= targetNow.autoBid.maxBudget) {
            finalUpdated = finalUpdated.map((c) => {
              if (c.id === target.id) {
                return {
                  ...c,
                  bidAmount: defensiveBid,
                  lastBidAt: new Date().toISOString(),
                  autoBid: {
                    ...c.autoBid,
                    defenseCount: c.autoBid.defenseCount + 1,
                    lastDefendedAt: new Date().toISOString(),
                  },
                };
              }
              return c;
            });
            finalUpdated = sortAndRerank(finalUpdated);

            setTimeout(() => {
              addActivity({
                type: 'auto_defense',
                campaignId: target.id,
                campaignTitle: target.title,
                rivalTitle: challenger.title,
                amount: defensiveBid,
                newRank: targetNow.rank,
                message: `Auto-Bid Shield defended ${target.title}: matched & raised to $${defensiveBid}!`,
              });
            }, 600);
          }
        }

        addActivity({
          type: 'outbid',
          campaignId: challenger.id,
          campaignTitle: challenger.title,
          rivalTitle: target.title,
          amount: newBid,
          newRank: target.rank,
          message: `${challenger.title} raised bid to $${newBid} and challenged ${target.title}!`,
        });

        return finalUpdated;
      });
    }, skirmishInterval);

    return () => clearInterval(skirmishTimer);
  }, [simulationSpeed, sortAndRerank, addActivity]);

  // Outbid a specific target campaign using another campaign
  const outbidCampaign = useCallback((
    targetCampaignId: string, 
    yourCampaignId: string, 
    bidAmount: number,
    receipt?: CryptoPaymentReceipt
  ) => {
    let result = { success: false, message: '', receipt };

    setCampaigns((prev) => {
      const yourCamp = prev.find((c) => c.id === yourCampaignId);
      const targetCamp = prev.find((c) => c.id === targetCampaignId);

      if (!yourCamp || !targetCamp) {
        result = { success: false, message: 'Campaign not found', receipt };
        return prev;
      }

      if (bidAmount <= targetCamp.bidAmount) {
        result = { success: false, message: `Bid must be greater than $${targetCamp.bidAmount}`, receipt };
        return prev;
      }

      const updated = prev.map((c) => {
        if (c.id === yourCampaignId) {
          return {
            ...c,
            bidAmount,
            lastBidAt: new Date().toISOString(),
            paymentReceipt: receipt || c.paymentReceipt,
          };
        }
        return c;
      });

      const reranked = sortAndRerank(updated);
      const newRank = reranked.find((c) => c.id === yourCampaignId)?.rank || 1;

      const receiptNote = receipt 
        ? ` (Confirmed on-chain: ${receipt.network.toUpperCase()} #${receipt.blockNumber})` 
        : '';

      addActivity({
        type: 'outbid',
        campaignId: yourCampaignId,
        campaignTitle: yourCamp.title,
        rivalTitle: targetCamp.title,
        amount: bidAmount,
        newRank,
        message: `${yourCamp.title} outbid ${targetCamp.title} with $${bidAmount} to reach Rank #${newRank}!${receiptNote}`,
      });

      result = { 
        success: true, 
        message: `Successfully placed $${bidAmount} bid! You reached Rank #${newRank}${receiptNote}`,
        receipt 
      };
      return reranked;
    });

    return result;
  }, [sortAndRerank, addActivity]);

  // Quick boost bid on your own campaign
  const quickBoostBid = useCallback((campaignId: string, increment: number) => {
    setCampaigns((prev) => {
      const camp = prev.find((c) => c.id === campaignId);
      if (!camp) return prev;

      const newBid = camp.bidAmount + increment;
      const updated = prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            bidAmount: newBid,
            lastBidAt: new Date().toISOString(),
          };
        }
        return c;
      });

      const reranked = sortAndRerank(updated);
      const newRank = reranked.find((c) => c.id === campaignId)?.rank || camp.rank;

      addActivity({
        type: 'outbid',
        campaignId,
        campaignTitle: camp.title,
        amount: newBid,
        newRank,
        message: `${camp.title} boosted bid by +$${increment} (total $${newBid})!`,
      });

      return reranked;
    });
  }, [sortAndRerank, addActivity]);

  // Create new campaign
  const createCampaign = useCallback((data: Partial<AdCampaign>, receipt?: CryptoPaymentReceipt): string => {
    const newId = 'camp-' + Math.random().toString(36).substring(2, 9);
    const initialBid = data.bidAmount || 15;

    const newCamp: AdCampaign = {
      id: newId,
      rank: 99,
      previousRank: 99,
      title: sanitizeString(data.title) || 'Untitled Campaign',
      tagline: sanitizeString(data.tagline) || 'Leading digital product innovation',
      destinationUrl: sanitizeUrl(data.destinationUrl),
      displayUrl: sanitizeString(data.displayUrl) || 'adstoto.com',
      category: data.category || 'growth',
      bidAmount: initialBid,
      isUserOwned: true,
      iconBg: data.iconBg || 'from-indigo-600 to-blue-700',
      iconSymbol: data.iconSymbol || (data.title ? data.title.substring(0, 2).toUpperCase() : 'AD'),
      badge: 'Your Campaign',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      avgConversionValue: data.avgConversionValue || 45,
      createdAt: new Date().toISOString(),
      lastBidAt: new Date().toISOString(),
      paymentReceipt: receipt,
      autoBid: data.autoBid || {
        enabled: false,
        targetRank: 3,
        maxBudget: initialBid * 2,
        incrementStep: 10,
        defenseCount: 0,
      },
      status: 'active',
      hourlyStats: [
        { hour: '00:00', clicks: 0, impressions: 0 },
        { hour: '04:00', clicks: 0, impressions: 0 },
        { hour: '08:00', clicks: 0, impressions: 0 },
        { hour: '12:00', clicks: 0, impressions: 0 },
        { hour: '16:00', clicks: 0, impressions: 0 },
        { hour: '20:00', clicks: 0, impressions: 0 },
      ],
    };

    setCampaigns((prev) => {
      const updated = sortAndRerank([...prev, newCamp]);
      const actualRank = updated.find((c) => c.id === newId)?.rank || 1;

      const receiptNote = receipt ? ` (On-Chain Confirmed ${receipt.network.toUpperCase()})` : '';

      addActivity({
        type: 'new_campaign',
        campaignId: newId,
        campaignTitle: newCamp.title,
        amount: initialBid,
        newRank: actualRank,
        message: `New campaign launched: ${newCamp.title} entered at Rank #${actualRank} with $${initialBid}!${receiptNote}`,
      });

      return updated;
    });

    return newId;
  }, [sortAndRerank, addActivity]);

  // Update campaign
  const updateCampaign = useCallback((id: string, updates: Partial<AdCampaign>) => {
    setCampaigns((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const sanitizedUpdates: Partial<AdCampaign> = { ...updates };
          if (updates.title) sanitizedUpdates.title = sanitizeString(updates.title);
          if (updates.tagline) sanitizedUpdates.tagline = sanitizeString(updates.tagline);
          if (updates.destinationUrl) sanitizedUpdates.destinationUrl = sanitizeUrl(updates.destinationUrl);
          if (updates.displayUrl) sanitizedUpdates.displayUrl = sanitizeString(updates.displayUrl);
          return { ...c, ...sanitizedUpdates };
        }
        return c;
      });
      return updates.bidAmount !== undefined ? sortAndRerank(updated) : updated;
    });
  }, [sortAndRerank]);

  // Delete campaign
  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return sortAndRerank(filtered);
    });
  }, [sortAndRerank]);

  // Toggle auto-bid
  const toggleAutoBid = useCallback((id: string, enabled?: boolean) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = enabled !== undefined ? enabled : !c.autoBid.enabled;
          return {
            ...c,
            autoBid: { ...c.autoBid, enabled: nextState },
          };
        }
        return c;
      })
    );
  }, []);

  // Update auto-bid settings
  const updateAutoBidConfig = useCallback((id: string, config: Partial<AdCampaign['autoBid']>) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            autoBid: { ...c.autoBid, ...config },
          };
        }
        return c;
      })
    );
  }, []);

  // Record simulated or real click
  const recordClick = useCallback((campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            clicks: c.clicks + 1,
          };
        }
        return c;
      })
    );
  }, []);

  // Trigger manual simulated skirmish
  const triggerSimulatedSkirmish = useCallback(() => {
    setCampaigns((prev) => {
      const rivals = prev.filter((c) => !c.isUserOwned);
      if (rivals.length < 2) return prev;
      const challenger = rivals[Math.floor(Math.random() * rivals.length)];
      const bump = Math.floor(Math.random() * 3 + 1) * 2;
      const newBid = challenger.bidAmount + bump;

      const updated = prev.map((c) => {
        if (c.id === challenger.id) {
          return {
            ...c,
            bidAmount: newBid,
            lastBidAt: new Date().toISOString(),
          };
        }
        return c;
      });

      const reranked = sortAndRerank(updated);
      const newRank = reranked.find((c) => c.id === challenger.id)?.rank || 1;

      addActivity({
        type: 'outbid',
        campaignId: challenger.id,
        campaignTitle: challenger.title,
        amount: newBid,
        newRank,
        message: `⚡ Live Skirmish: ${challenger.title} surged by +$${bump} (total $${newBid}) to seize Rank #${newRank}!`,
      });

      return reranked;
    });
  }, [sortAndRerank, addActivity]);

  // Reset to default seed
  const resetToDefaults = useCallback(() => {
    setCampaigns(INITIAL_CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEY_CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
  }, []);

  // Export JSON
  const exportDataJson = useCallback(() => {
    return JSON.stringify({ campaigns, activityFeed, exportedAt: new Date().toISOString() }, null, 2);
  }, [campaigns, activityFeed]);

  // Import JSON
  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.campaigns)) {
        setCampaigns(sortAndRerank(parsed.campaigns));
        if (Array.isArray(parsed.activityFeed)) {
          setActivityFeed(parsed.activityFeed);
        }
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }, [sortAndRerank]);

  return (
    <AdContext.Provider
      value={{
        campaigns,
        activityFeed,
        payoutSettings,
        updatePayoutSettings,
        simulationSpeed,
        setSimulationSpeed,
        outbidCampaign,
        quickBoostBid,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        toggleAutoBid,
        updateAutoBidConfig,
        recordClick,
        triggerSimulatedSkirmish,
        resetToDefaults,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
