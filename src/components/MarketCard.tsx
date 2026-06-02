import React from 'react';
import { Sparkles, BarChart, Calendar } from 'lucide-react';
import { Market } from '../types';
import { useMarkets } from '../context/MarketContext';

interface MarketCardProps {
  market: Market;
  onSelect: (market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onSelect }) => {
  const { setSelectedMarket } = useMarkets();

  const formattedVolume = market.volume.toLocaleString('en-US', {
    maximumFractionDigits: 0
  });

  const categoryLabels: Record<string, string> = {
    'politics': '🏛️ Politics',
    'crypto': '🪙 Crypto',
    'pop-culture': '🎬 Pop Culture',
    'sports': '⚽ Sports',
    'science-tech': '🔬 Science & Tech'
  };

  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = 100 - yesPercent;

  return (
    <div 
      id={`market-card-${market.id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100"
    >
      <div>
        {/* Category Badge & Expiry */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
            {categoryLabels[market.category] || market.category}
          </span>
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>Expires {market.expiryDate}</span>
          </div>
        </div>

        {/* Question Heading */}
        <h3 
          onClick={() => onSelect(market)}
          className="cursor-pointer text-[15px] font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-3 min-h-[48px]"
          id={`market-question-${market.id}`}
        >
          {market.question}
        </h3>

        {/* Description Snippet */}
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 min-h-[32px] overflow-hidden">
          {market.description}
        </p>

        {/* Resolved Indicator or Active Meter */}
        {market.resolved ? (
          <div className="mt-4 rounded-lg bg-slate-50 px-3.5 py-2.5 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Market Resolved</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-normal uppercase ${
              market.result === 'YES' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {market.result} Resolved
            </span>
          </div>
        ) : (
          <div className="mt-4">
            {/* Probability Progress Track Bar */}
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-blue-600">YES Chance {yesPercent}%</span>
              <span className="text-slate-400 font-normal">vs {noPercent}% NO</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pricing Button Grid and Vol stats */}
      <div className="mt-5 pt-3.5 border-t border-slate-150 flex items-center justify-between">
        
        {/* Trading Volume Statistics */}
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Volume</span>
          <span className="font-mono text-xs font-bold text-slate-700 flex items-center" id={`market-vol-${market.id}`}>
            <Sparkles className="mr-0.5 h-3 w-3 text-blue-600" />
            {formattedVolume} cr
          </span>
        </div>

        {/* Order Action Buttons */}
        <div className="flex items-center space-x-2">
          {market.resolved ? (
            <button
              onClick={() => onSelect(market)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              View Summary
            </button>
          ) : (
            <>
              {/* Buy YES Chip */}
              <button
                onClick={() => onSelect(market)}
                className="group/btn relative flex items-center justify-center space-x-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-white transition-all border border-blue-200 hover:border-transparent active:scale-95 cursor-pointer"
                id={`buy-yes-btn-${market.id}`}
              >
                <span>YES</span>
                <span className="font-mono bg-blue-100 group-hover/btn:bg-blue-600 group-hover/btn:text-white rounded px-1 text-[10px] py-0.5 min-w-[28px] text-center">
                  {yesPercent}¢
                </span>
              </button>

              {/* Buy NO Chip */}
              <button
                onClick={() => onSelect(market)}
                className="group/btn relative flex items-center justify-center space-x-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-white transition-all border border-rose-200 hover:border-transparent active:scale-95 cursor-pointer"
                id={`buy-no-btn-${market.id}`}
              >
                <span>NO</span>
                <span className="font-mono bg-rose-100 group-hover/btn:bg-rose-700 group-hover/btn:text-white rounded px-1 text-[10px] py-0.5 min-w-[28px] text-center">
                  {noPercent}¢
                </span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
