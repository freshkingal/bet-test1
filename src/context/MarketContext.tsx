import React, { createContext, useContext, useState, useEffect } from 'react';
import { Market, Position, Trade, Comment, UserProfile, MarketCategory } from '../types';
import { INITIAL_MARKETS, INITIAL_COMMENTS } from '../data/initialMarkets';

interface MarketContextType {
  markets: Market[];
  positions: Position[];
  trades: Trade[];
  comments: Comment[];
  balance: number;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;
  claimFaucet: () => void;
  buyShares: (marketId: string, option: 'YES' | 'NO', credits: number) => { success: boolean; error?: string; shares?: number; avgPrice?: number };
  sellShares: (marketId: string, option: 'YES' | 'NO', shares: number) => { success: boolean; error?: string; creditsReturned?: number };
  addComment: (marketId: string, text: string, userName: string, userEmail: string) => void;
  likeComment: (commentId: string) => void;
  createMarket: (marketData: Omit<Market, 'id' | 'yesPriceHistory' | 'volume' | 'resolved' | 'creator' | 'createdAt'>) => void;
  resolveMarket: (marketId: string, winningOutcome: 'YES' | 'NO') => void;
  deleteMarket: (marketId: string) => void;
  resetAll: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [balance, setBalance] = useState<number>(1000.00); // Default virtual credits

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const cachedMarkets = localStorage.getItem('pm_markets');
    const cachedPositions = localStorage.getItem('pm_positions');
    const cachedTrades = localStorage.getItem('pm_trades');
    const cachedComments = localStorage.getItem('pm_comments');
    const cachedBalance = localStorage.getItem('pm_balance');

    if (cachedMarkets) {
      setMarkets(JSON.parse(cachedMarkets));
    } else {
      setMarkets(INITIAL_MARKETS);
      localStorage.setItem('pm_markets', JSON.stringify(INITIAL_MARKETS));
    }

    if (cachedPositions) {
      setPositions(JSON.parse(cachedPositions));
    } else {
      setPositions([]);
      localStorage.setItem('pm_positions', JSON.stringify([]));
    }

    if (cachedTrades) {
      setTrades(JSON.parse(cachedTrades));
    } else {
      setTrades([]);
      localStorage.setItem('pm_trades', JSON.stringify([]));
    }

    if (cachedComments) {
      setComments(JSON.parse(cachedComments));
    } else {
      setComments(INITIAL_COMMENTS);
      localStorage.setItem('pm_comments', JSON.stringify(INITIAL_COMMENTS));
    }

    if (cachedBalance) {
      setBalance(parseFloat(cachedBalance));
    } else {
      setBalance(1000.00);
      localStorage.setItem('pm_balance', '1000.00');
    }
  }, []);

  // Save utility
  const saveState = (newMarketsList: Market[], newPositionsList: Position[], newTradesList: Trade[], newCommentsList: Comment[], newBalanceVal: number) => {
    setMarkets(newMarketsList);
    setPositions(newPositionsList);
    setTrades(newTradesList);
    setComments(newCommentsList);
    setBalance(newBalanceVal);

    localStorage.setItem('pm_markets', JSON.stringify(newMarketsList));
    localStorage.setItem('pm_positions', JSON.stringify(newPositionsList));
    localStorage.setItem('pm_trades', JSON.stringify(newTradesList));
    localStorage.setItem('pm_comments', JSON.stringify(newCommentsList));
    localStorage.setItem('pm_balance', newBalanceVal.toFixed(2));
  };

  // Faucet
  const claimFaucet = () => {
    const nextBalance = balance + 500.00;
    saveState(markets, positions, trades, comments, nextBalance);
  };

  // Buy shares
  const buyShares = (marketId: string, option: 'YES' | 'NO', credits: number) => {
    if (credits <= 0) {
      return { success: false, error: 'Enter a valid amount of credits.' };
    }
    if (balance < credits) {
      return { success: false, error: 'Insufficient virtual credits.' };
    }

    const marketIndex = markets.findIndex(m => m.id === marketId);
    if (marketIndex === -1) {
      return { success: false, error: 'Market not found.' };
    }

    const market = markets[marketIndex];
    if (market.resolved) {
      return { success: false, error: 'This market is resolved and closed for trading.' };
    }

    const p = market.yesPrice;
    const L = market.liquidity || 1000;
    let delta = 0;
    let avgPrice = 0;
    let newPrice = p;

    if (option === 'YES') {
      // Buying YES pushes YES price up
      delta = (credits / (credits + L)) * (1 - p);
      avgPrice = p + delta / 2;
      newPrice = p + delta;
    } else {
      // Buying NO pushes YES price down (NO price q = 1 - p goes up)
      const q = 1 - p;
      delta = (credits / (credits + L)) * (1 - q);
      avgPrice = q + delta / 2;
      newPrice = p - delta;
    }

    // Protect bounds
    const boundedNewPrice = Math.max(0.01, Math.min(0.99, newPrice));
    avgPrice = Math.max(0.01, Math.min(0.99, avgPrice));
    const sharesBought = credits / avgPrice;

    // Update market status
    const updatedMarkets = [...markets];
    const prevHistory = [...market.yesPriceHistory];
    
    // Add new price to history, keep history length reasonable (approx last 15 points)
    const newPriceHistory = [...prevHistory, parseFloat(boundedNewPrice.toFixed(2))];
    if (newPriceHistory.length > 20) {
      newPriceHistory.shift();
    }

    updatedMarkets[marketIndex] = {
      ...market,
      yesPrice: parseFloat(boundedNewPrice.toFixed(2)),
      yesPriceHistory: newPriceHistory,
      volume: market.volume + credits
    };

    // Update selectedMarket state if active
    if (selectedMarket && selectedMarket.id === marketId) {
      setSelectedMarket(updatedMarkets[marketIndex]);
    }

    // Update positions
    const existingPositionIndex = positions.findIndex(pos => pos.marketId === marketId && pos.option === option);
    const updatedPositions = [...positions];

    if (existingPositionIndex !== -1) {
      const pos = positions[existingPositionIndex];
      const newTotalCost = pos.totalCost + credits;
      const newShares = pos.shares + sharesBought;
      updatedPositions[existingPositionIndex] = {
        ...pos,
        shares: newShares,
        totalCost: newTotalCost,
        averagePrice: parseFloat((newTotalCost / newShares).toFixed(4))
      };
    } else {
      updatedPositions.push({
        marketId,
        marketQuestion: market.question,
        option,
        shares: sharesBought,
        averagePrice: parseFloat(avgPrice.toFixed(4)),
        totalCost: credits
      });
    }

    // Add trade log
    const newTrade: Trade = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      marketId,
      marketQuestion: market.question,
      option,
      type: 'BUY',
      shares: parseFloat(sharesBought.toFixed(4)),
      price: parseFloat(avgPrice.toFixed(2)),
      cost: credits,
      timestamp: new Date().toISOString()
    };
    const updatedTrades = [newTrade, ...trades];

    // Deduct balance
    const nextBalance = balance - credits;

    saveState(updatedMarkets, updatedPositions, updatedTrades, comments, nextBalance);

    return {
      success: true,
      shares: sharesBought,
      avgPrice: avgPrice
    };
  };

  // Sell shares
  const sellShares = (marketId: string, option: 'YES' | 'NO', sharesToSell: number) => {
    if (sharesToSell <= 0) {
      return { success: false, error: 'Enter a valid amount of shares.' };
    }

    const posIndex = positions.findIndex(pos => pos.marketId === marketId && pos.option === option);
    if (posIndex === -1) {
      return { success: false, error: 'You do not own shares of this option.' };
    }

    const currentPosition = positions[posIndex];
    if (currentPosition.shares < sharesToSell) {
      return { success: false, error: `You only own ${currentPosition.shares.toFixed(2)} shares.` };
    }

    const marketIndex = markets.findIndex(m => m.id === marketId);
    if (marketIndex === -1) {
      return { success: false, error: 'Market not found.' };
    }

    const market = markets[marketIndex];
    if (market.resolved) {
      return { success: false, error: 'Market is already resolved and locked.' };
    }

    const p = market.yesPrice;
    const L = market.liquidity || 1000;
    let delta = 0;
    let avgPrice = 0;
    let newPrice = p;

    // Approximate sell impact based on share volume and current probability
    if (option === 'YES') {
      const weight = sharesToSell * p;
      delta = (weight / (weight + L)) * p; // YES price drops
      avgPrice = p - delta / 2;
      newPrice = p - delta;
    } else {
      const q = 1 - p;
      const weight = sharesToSell * q;
      delta = (weight / (weight + L)) * q; // NO price drops, YES price goes up
      avgPrice = q - delta / 2;
      newPrice = p + delta;
    }

    // Protect bounds
    const boundedNewPrice = Math.max(0.01, Math.min(0.99, newPrice));
    avgPrice = Math.max(0.01, Math.min(0.99, avgPrice));
    const creditsReturned = sharesToSell * avgPrice;

    // Deduct position
    let updatedPositions = [...positions];
    const newSharesRem = currentPosition.shares - sharesToSell;

    if (newSharesRem < 0.001) {
      // Clear position entirely
      updatedPositions = updatedPositions.filter((_, idx) => idx !== posIndex);
    } else {
      const originalAvg = currentPosition.averagePrice;
      const originalTotalCost = currentPosition.totalCost;
      const costReduction = sharesToSell * originalAvg;
      updatedPositions[posIndex] = {
        ...currentPosition,
        shares: newSharesRem,
        totalCost: Math.max(0, originalTotalCost - costReduction)
      };
    }

    // Update market status
    const updatedMarkets = [...markets];
    const prevHistory = [...market.yesPriceHistory];
    const newPriceHistory = [...prevHistory, parseFloat(boundedNewPrice.toFixed(2))];
    if (newPriceHistory.length > 20) {
      newPriceHistory.shift();
    }

    updatedMarkets[marketIndex] = {
      ...market,
      yesPrice: parseFloat(boundedNewPrice.toFixed(2)),
      yesPriceHistory: newPriceHistory
    };

    // Update selectedMarket state if active
    if (selectedMarket && selectedMarket.id === marketId) {
      setSelectedMarket(updatedMarkets[marketIndex]);
    }

    // Add trade log
    const newTrade: Trade = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      marketId,
      marketQuestion: market.question,
      option,
      type: 'SELL',
      shares: parseFloat(sharesToSell.toFixed(4)),
      price: parseFloat(avgPrice.toFixed(2)),
      cost: creditsReturned,
      timestamp: new Date().toISOString()
    };
    const updatedTrades = [newTrade, ...trades];

    // Add balance
    const nextBalance = balance + creditsReturned;

    saveState(updatedMarkets, updatedPositions, updatedTrades, comments, nextBalance);

    return {
      success: true,
      creditsReturned
    };
  };

  // Add Comment
  const addComment = (marketId: string, text: string, userName: string, userEmail: string) => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      marketId,
      userEmail,
      userName: userName || 'Anonymous Trader',
      text,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    const updatedComments = [newComment, ...comments];
    saveState(markets, positions, trades, updatedComments, balance);
  };

  // Like Comment
  const likeComment = (commentId: string) => {
    const updatedComments = comments.map(comm => {
      if (comm.id === commentId) {
        const alreadyLiked = comm.likedByUser;
        return {
          ...comm,
          likes: alreadyLiked ? comm.likes - 1 : comm.likes + 1,
          likedByUser: !alreadyLiked
        };
      }
      return comm;
    });

    saveState(markets, positions, trades, updatedComments, balance);
  };

  // ADMIN: Create Market
  const createMarket = (marketData: Omit<Market, 'id' | 'yesPriceHistory' | 'volume' | 'resolved' | 'creator' | 'createdAt'>) => {
    const newMarket: Market = {
      ...marketData,
      id: `market-${Date.now()}`,
      yesPriceHistory: [marketData.yesPrice],
      volume: 0,
      resolved: false,
      creator: 'admin',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedMarkets = [newMarket, ...markets];
    saveState(updatedMarkets, positions, trades, comments, balance);
  };

  // ADMIN: Resolve Market & Payout
  const resolveMarket = (marketId: string, winningOutcome: 'YES' | 'NO') => {
    const marketIndex = markets.findIndex(m => m.id === marketId);
    if (marketIndex === -1) return;

    const market = markets[marketIndex];
    if (market.resolved) return;

    // Filter out relevant positions and payout virtual credits!
    // Every winning share is worth exactly 1.00 credit
    let payoutAmount = 0;
    const positionsToKeep: Position[] = [];

    positions.forEach(pos => {
      if (pos.marketId === marketId) {
        if (pos.option === winningOutcome) {
          // User wins! Pays out at 1.00 credit per share
          payoutAmount += pos.shares * 1.00;
        }
        // losing option gets nothing
      } else {
        positionsToKeep.push(pos);
      }
    });

    // Update market status
    const updatedMarkets = [...markets];
    updatedMarkets[marketIndex] = {
      ...market,
      resolved: true,
      result: winningOutcome,
      // Payout pushes price to either 1.00 or 0.00
      yesPrice: winningOutcome === 'YES' ? 1.00 : 0.00,
      yesPriceHistory: [...market.yesPriceHistory, winningOutcome === 'YES' ? 1.00 : 0.00]
    };

    if (selectedMarket && selectedMarket.id === marketId) {
      setSelectedMarket(updatedMarkets[marketIndex]);
    }

    // Add general resolution record in trades logs
    let updatedTrades = [...trades];
    if (payoutAmount > 0) {
      const resolutionRewardLog: Trade = {
        id: `t-payout-${Date.now()}`,
        marketId,
        marketQuestion: market.question,
        option: winningOutcome,
        type: 'BUY', // generic type representation
        shares: 0,
        price: 1.00,
        cost: payoutAmount, // Shows capital added
        timestamp: new Date().toISOString()
      };
      
      // Update trades with resolution reward log
      updatedTrades = [resolutionRewardLog, ...updatedTrades];
    }

    const nextBalance = balance + payoutAmount;

    saveState(updatedMarkets, positionsToKeep, updatedTrades, comments, nextBalance);
    
    // Alert or log to let the app know of the payout sum
    console.log(`Resolved market ${marketId}. Distributed virtual credit dividend: ${payoutAmount.toFixed(2)}.`);
  };

  // ADMIN: Delete Market
  const deleteMarket = (marketId: string) => {
    const updatedMarkets = markets.filter(m => m.id !== marketId);
    const updatedPositions = positions.filter(p => p.marketId !== marketId);
    const updatedTrades = trades.filter(t => t.marketId !== marketId);
    const updatedComments = comments.filter(c => c.marketId !== marketId);

    if (selectedMarket && selectedMarket.id === marketId) {
      setSelectedMarket(null);
    }

    saveState(updatedMarkets, updatedPositions, updatedTrades, updatedComments, balance);
  };

  // Reset Storage / App
  const resetAll = () => {
    localStorage.removeItem('pm_markets');
    localStorage.removeItem('pm_positions');
    localStorage.removeItem('pm_trades');
    localStorage.removeItem('pm_comments');
    localStorage.removeItem('pm_balance');

    setMarkets(INITIAL_MARKETS);
    setPositions([]);
    setTrades([]);
    setComments(INITIAL_COMMENTS);
    setBalance(1000.00);
    setSelectedMarket(null);
    setActiveCategory('all');
    setSearchQuery('');

    localStorage.setItem('pm_markets', JSON.stringify(INITIAL_MARKETS));
    localStorage.setItem('pm_positions', JSON.stringify([]));
    localStorage.setItem('pm_trades', JSON.stringify([]));
    localStorage.setItem('pm_comments', JSON.stringify(INITIAL_COMMENTS));
    localStorage.setItem('pm_balance', '1000.00');
  };

  return (
    <MarketContext.Provider value={{
      markets,
      positions,
      trades,
      comments,
      balance,
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      selectedMarket,
      setSelectedMarket,
      claimFaucet,
      buyShares,
      sellShares,
      addComment,
      likeComment,
      createMarket,
      resolveMarket,
      deleteMarket,
      resetAll
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarkets = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarkets must be used within a MarketProvider');
  }
  return context;
};
