import { Market, Comment } from '../types';

export const INITIAL_MARKETS: Market[] = [
  {
    id: 'm-1',
    question: 'Will Bitcoin price exceed $120,000 in 2026?',
    description: 'This market resolves to YES if Bitcoin (BTC) reaches a trading price of $120,000.00 or higher at any point on or before December 31, 2026 (UTC), as tracked by CoinGecko or other reliable major indexes. If BTC does not breach $120,000 by this date, the market resolves to NO.',
    category: 'crypto',
    expiryDate: '2026-12-31',
    yesPrice: 0.74,
    yesPriceHistory: [0.65, 0.67, 0.64, 0.70, 0.71, 0.73, 0.74],
    volume: 142580,
    resolved: false,
    liquidity: 2000,
    imageUrl: '🪙',
    creator: 'admin',
    createdAt: '2026-05-01'
  },
  {
    id: 'm-2',
    question: 'Will OpenAI announce GPT-5 as a multimodal-first model before September 2026?',
    description: 'This market resolves to YES if OpenAI officially and publicly launches or releases its next major frontier model explicitly named GPT-5 (or a direct successor model recognized as such in public press releases) featuring natively integrated multimodal parameters before September 1, 2026. Otherwise, this market resolves to NO.',
    category: 'science-tech',
    expiryDate: '2026-09-01',
    yesPrice: 0.62,
    yesPriceHistory: [0.55, 0.58, 0.57, 0.60, 0.61, 0.59, 0.62],
    volume: 89400,
    resolved: false,
    liquidity: 1500,
    imageUrl: '🤖',
    creator: 'admin',
    createdAt: '2026-05-05'
  },
  {
    id: 'm-3',
    question: 'Will the US federal government pass draft crypto regulation into law in 2026?',
    description: 'This market resolves to YES if a federal bill establishing a legal and regulatory framework for digital assets (such as cryptocurrency exchanges, stablecoin issuers, or DeFi protocols) is passed by both houses of Congress and signed into law by the US President on or before December 31, 2026. Executive orders do not qualify.',
    category: 'politics',
    expiryDate: '2026-12-31',
    yesPrice: 0.48,
    yesPriceHistory: [0.52, 0.50, 0.47, 0.45, 0.46, 0.49, 0.48],
    volume: 245100,
    resolved: false,
    liquidity: 3000,
    imageUrl: '🏛️',
    creator: 'admin',
    createdAt: '2026-05-10'
  },
  {
    id: 'm-4',
    question: 'Will Grand Theft Auto VI (GTA 6) get delayed to 2027?',
    description: 'This market resolves to YES if Rockstar Games or parent company Take-Two Interactive officially announces a postponement of the retail release date of Grand Theft Auto VI to a date on or after January 1, 2027. If the game launches in 2026, this market resolves to NO.',
    category: 'pop-culture',
    expiryDate: '2026-11-30',
    yesPrice: 0.35,
    yesPriceHistory: [0.30, 0.28, 0.33, 0.32, 0.36, 0.34, 0.35],
    volume: 67320,
    resolved: false,
    liquidity: 1000,
    imageUrl: '🎮',
    creator: 'admin',
    createdAt: '2026-05-12'
  },
  {
    id: 'm-5',
    question: 'Will Real Madrid win the 2026 UEFA Champions League tournament?',
    description: 'This market resolves to YES if Real Madrid CF wins the final match of the UEFA Champions League tournament in 2026, claiming the champion title. If they are eliminated at any stage or lose the final, it resolves to NO.',
    category: 'sports',
    expiryDate: '2026-06-06',
    yesPrice: 0.41,
    yesPriceHistory: [0.38, 0.39, 0.42, 0.40, 0.43, 0.42, 0.41],
    volume: 111800,
    resolved: false,
    liquidity: 1800,
    imageUrl: '⚽',
    creator: 'admin',
    createdAt: '2026-05-15'
  },
  {
    id: 'm-6',
    question: 'Will SpaceX achieve a successful Starship orbital capture of both stages in 2026?',
    description: 'This market resolves to YES if SpaceX conducts a flight test in which both the Super Heavy booster and the Starship upper stage are successfully caught/recovered using the launch tower mechanical arms ("Mechazilla") or make controlled soft landings according to explicit criteria in official SpaceX statements during 2026.',
    category: 'science-tech',
    expiryDate: '2026-12-31',
    yesPrice: 0.56,
    yesPriceHistory: [0.45, 0.48, 0.50, 0.53, 0.54, 0.55, 0.56],
    volume: 93450,
    resolved: false,
    liquidity: 1200,
    imageUrl: '🚀',
    creator: 'admin',
    createdAt: '2026-05-18'
  },
  {
    id: 'm-7',
    question: 'Will Ethereum gas price drop below 1.5 Gwei on average for any full month in 2026?',
    description: 'This market resolves to YES if the average gas price on the mainnet Ethereum network is reported as strictly below 1.5 Gwei for any full calendar month during 2026, validated by major trackers (e.g. Etherscan). Otherwise, resolves to NO.',
    category: 'crypto',
    expiryDate: '2026-12-31',
    yesPrice: 0.28,
    yesPriceHistory: [0.35, 0.32, 0.30, 0.29, 0.27, 0.28, 0.28],
    volume: 43200,
    resolved: false,
    liquidity: 800,
    imageUrl: '⟠',
    creator: 'admin',
    createdAt: '2026-05-20'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    marketId: 'm-1',
    userEmail: 'whale_trader@polymarket.com',
    userName: 'CryptoWhale_88',
    text: 'Bitcoin has incredible momentum in this halving cycle. We are easily hitting $120k by winter. Loaded up on YES shares at 65¢!',
    timestamp: '2026-06-01T14:32:00Z',
    likes: 24
  },
  {
    id: 'c-2',
    marketId: 'm-1',
    userEmail: 'bear_patrol@gmail.com',
    userName: 'BearMarketGuard',
    text: 'Slipping consumer spending and interest rates will cap the cycle earlier than people think. $120k is way too optimistic. Selling YES and loading NO shares.',
    timestamp: '2026-06-01T16:15:00Z',
    likes: 12
  },
  {
    id: 'c-3',
    marketId: 'm-2',
    userEmail: 'sam_altman_fan@tech.co',
    userName: 'SoraExplorer',
    text: 'GPT-5 training has been finished for months. The red-teaming takes time but they will push it before fall to outcompete rivals. Highly bullish on YES at 62¢.',
    timestamp: '2026-06-02T09:12:00Z',
    likes: 19
  },
  {
    id: 'c-4',
    marketId: 'm-3',
    userEmail: 'senate_whisperer@hill.com',
    userName: 'CapitalHillInsider',
    text: 'Congress is divided and there are too many other legislative priorities in an election year. Hard to see a full digital asset bill signing happen in 2026. NO is the smartest play here.',
    timestamp: '2026-06-02T11:45:00Z',
    likes: 31
  }
];
