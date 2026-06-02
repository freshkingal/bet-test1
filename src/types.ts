export type MarketCategory = 'politics' | 'crypto' | 'pop-culture' | 'sports' | 'science-tech';

export interface Market {
  id: string;
  question: string;
  description: string;
  category: MarketCategory;
  expiryDate: string;
  yesPrice: number; // between 0.01 and 0.99
  yesPriceHistory: number[]; // Array of past percentages for custom chart
  volume: number; // Volume in credits
  resolved: boolean;
  result?: 'YES' | 'NO';
  liquidity: number; // Liquidity scale factor (e.g. 1000)
  imageUrl?: string;
  creator: 'admin' | 'user';
  createdAt: string;
}

export interface Position {
  marketId: string;
  marketQuestion: string;
  option: 'YES' | 'NO';
  shares: number;
  averagePrice: number; // Entry cost of share (e.g., 0.55)
  totalCost: number; // Total credits paid
}

export interface Trade {
  id: string;
  marketId: string;
  marketQuestion: string;
  option: 'YES' | 'NO';
  type: 'BUY' | 'SELL';
  shares: number;
  price: number; // Price per share (e.g., 0.55)
  cost: number; // Total credit exchange
  timestamp: string;
}

export interface Comment {
  id: string;
  marketId: string;
  userEmail: string;
  userName: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByUser?: boolean;
}

export interface UserProfile {
  balance: number;
  positions: Position[];
  trades: Trade[];
}
