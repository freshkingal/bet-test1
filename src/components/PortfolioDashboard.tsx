import React from 'react';
import { Wallet, TrendingUp, DollarSign, Activity, ArrowRight, CornerDownRight, HelpCircle } from 'lucide-react';
import { Market } from '../types';
import { useMarkets } from '../context/MarketContext';

interface PortfolioDashboardProps {
  onSelectMarket: (market: Market) => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ onSelectMarket }) => {
  const { balance, positions, trades, markets } = useMarkets();

  // Compute live position valuations
  let totalPositionValuation = 0;
  let totalCostBasis = 0;

  const positionsWithValuation = positions.map(pos => {
    const market = markets.find(m => m.id === pos.marketId);
    let currentPricePerShare = 1.00; // settled/resolved default high
    
    if (market) {
      if (market.resolved) {
        currentPricePerShare = market.result === pos.option ? 1.00 : 0.00;
      } else {
        currentPricePerShare = pos.option === 'YES' ? market.yesPrice : (1 - market.yesPrice);
      }
    }

    const currentWorth = pos.shares * currentPricePerShare;
    // P&L
    const profitLossValue = currentWorth - pos.totalCost;
    const profitLossPercentage = pos.totalCost > 0 
      ? (profitLossValue / pos.totalCost) * 100 
      : 0;

    totalPositionValuation += currentWorth;
    totalCostBasis += pos.totalCost;

    return {
      ...pos,
      currentPrice: currentPricePerShare,
      currentWorth,
      profitLossValue,
      profitLossPercentage,
      market
    };
  });

  const netWorth = balance + totalPositionValuation;
  
  // Overall P&L relative to cost basis
  const overallPL = totalCostBasis > 0 
    ? totalPositionValuation - totalCostBasis 
    : 0;
  const overallPLPercent = totalCostBasis > 0 
    ? (overallPL / totalCostBasis) * 100 
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in" id="portfolio_page">
      
      {/* Title section */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          My Trading Portfolio
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Track active positions, valuation outcomes, and full ledger settlement audits in real-time.
        </p>
      </div>

      {/* Metrics Header Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8" id="portfolio_stats_grid">
        
        {/* Total Net Worth */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-black text-slate-900" id="portfolio_net_worth">
              {netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400">cr</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center">
            <span>Portfolio + Cash Wallet value</span>
          </div>
        </div>

        {/* Available Cash Balance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Wallet</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-1.5 font-mono">
            <span className="text-2xl font-black text-slate-900">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400">cr</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center">
            <span>Dynamic virtual liquid budget</span>
          </div>
        </div>

        {/* Active P&L status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unrealized P&L</span>
            <div className={`rounded-lg p-2 ${overallPL >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-1.5 font-mono">
            <span className={`text-2xl font-black ${overallPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {overallPL >= 0 ? '+' : ''}{overallPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400">cr</span>
          </div>
          <div className={`mt-2 text-xs font-bold ${overallPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{overallPLPercent >= 0 ? '▲' : '▼'} {overallPLPercent.toFixed(2)}% net returns</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Holdings vs Trade History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Holdings (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 flex items-center mb-5">
              <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
              Active Shareholdings ({positions.length})
            </h2>

            {positionsWithValuation.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-xs font-extrabold text-slate-700 uppercase tracking-widest">No Active Positions</h3>
                <p className="mt-2 text-xs text-slate-400 px-4">
                  Deploy your virtual credits into global predictive events to monitor holdings here!
                </p>
              </div>
            ) : (
              <div className="space-y-4" id="active_positions_list">
                {positionsWithValuation.map((pos, idx) => (
                  <div 
                    key={idx} 
                    className="group border border-slate-150 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 hover:bg-white"
                  >
                    <div className="space-y-1 max-w-sm sm:max-w-md">
                      <h4 className="text-[13px] font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
                        {pos.marketQuestion}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                        <span className={`inline-flex rounded-md px-1.5 py-0.5 font-extrabold uppercase ${
                          pos.option === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pos.option} Shares
                        </span>
                        <span>•</span>
                        <span>{pos.shares.toFixed(1)} sh</span>
                        <span>•</span>
                        <span className="font-mono">Entry: {pos.averagePrice} cr</span>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto sm:space-x-6 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      
                      {/* Valuation metrics */}
                      <div className="text-right">
                        <div className="font-mono text-sm leading-none font-bold text-slate-900">
                          {pos.currentWorth.toFixed(2)} cr
                        </div>
                        <div className={`text-[10px] font-bold tracking-tight mt-1 leading-none ${
                          pos.profitLossValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {pos.profitLossValue >= 0 ? '▲' : '▼'} {pos.profitLossValue >= 0 ? '+' : ''}
                          {pos.profitLossValue.toFixed(2)} ({pos.profitLossPercentage.toFixed(1)}%)
                        </div>
                      </div>

                      {/* Redirect trigger */}
                      {pos.market && (
                        <button
                          onClick={() => onSelectMarket(pos.market!)}
                          className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-800 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all shadow-sm shrink-0 cursor-pointer"
                        >
                          <span>Trade</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ledger trade history logs (Col-span 1) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 flex items-center mb-5">
              <Activity className="mr-2 h-5 w-5 text-slate-400" />
              Transaction Ledger
            </h2>

            {trades.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No trading transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1" id="portfolio_trades_ledger">
                {trades.map((tr) => (
                  <div key={tr.id} className="border-b border-slate-100 pb-3 text-xs last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        tr.type === 'BUY' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {tr.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(tr.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h5 className="font-extrabold text-slate-700 line-clamp-1 py-0.5" title={tr.marketQuestion}>
                      {tr.marketQuestion}
                    </h5>

                    <div className="flex items-center justify-between font-medium text-slate-500 text-[10px] mt-1 pl-1 border-l-2 border-slate-200">
                      <span>{tr.option} contract</span>
                      <span>{tr.shares > 0 ? `${tr.shares.toFixed(1)} shares` : 'Payout Claims'}</span>
                      <span className="font-mono text-slate-805 font-bold" id={`ledger-cost-${tr.id}`}>
                        {tr.type === 'BUY' ? '-' : '+'}{tr.cost.toFixed(2)} cr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
