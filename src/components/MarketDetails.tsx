import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Coins, MessageSquare, Heart, Sparkles, AlertCircle, Info, Calendar, TrendingUp } from 'lucide-react';
import { Market, Position, Comment } from '../types';
import { useMarkets } from '../context/MarketContext';

interface MarketDetailsProps {
  market: Market;
  onBack: () => void;
}

export const MarketDetails: React.FC<MarketDetailsProps> = ({ market, onBack }) => {
  const { 
    balance, 
    positions, 
    comments, 
    buyShares, 
    sellShares, 
    addComment, 
    likeComment 
  } = useMarkets();

  // Navigation and active panel tabs
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [activeOutcome, setActiveOutcome] = useState<'YES' | 'NO'>('YES');
  
  // Trade Inputs
  const [amountInput, setAmountInput] = useState<string>('100');
  const [sharesToSellInput, setSharesToSellInput] = useState<string>('100');
  
  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Comment state
  const [commentText, setCommentText] = useState<string>('');
  const [commentName, setCommentName] = useState<string>('');

  // Interactive Chart state
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; index: number; x: number; y: number } | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  // Clear messages on transition
  useEffect(() => {
    setSuccessMsg('');
    setErrorMsg('');
  }, [tradeAction, activeOutcome, market.id]);

  // Current Position check
  const userPosition = positions.find(pos => pos.marketId === market.id && pos.option === activeOutcome);
  const anyPositionsInMarket = positions.filter(pos => pos.marketId === market.id);

  // AMM Calculation numbers
  const L = market.liquidity || 1000;
  const p = market.yesPrice;
  const numericAmount = parseFloat(amountInput) || 0;
  const numericSellShares = parseFloat(sharesToSellInput) || 0;

  // Predict new probabilities after transaction
  let simulatedNextPrice = p;
  let simulatedAvgPrice = p;
  let simulatedShares = 0;
  let simulatedMultiplier = 1;

  if (tradeAction === 'BUY' && numericAmount > 0) {
    if (activeOutcome === 'YES') {
      const delta = (numericAmount / (numericAmount + L)) * (1 - p);
      simulatedNextPrice = p + delta;
      simulatedAvgPrice = p + delta / 2;
    } else {
      const q = 1 - p;
      const delta = (numericAmount / (numericAmount + L)) * (1 - q);
      simulatedNextPrice = p - delta; // YES price goes down, so NO price goes up
      simulatedAvgPrice = q + delta / 2; // Price of NO share bought
    }
    simulatedNextPrice = Math.max(0.01, Math.min(0.99, simulatedNextPrice));
    simulatedAvgPrice = Math.max(0.01, Math.min(0.99, simulatedAvgPrice));
    simulatedShares = numericAmount / simulatedAvgPrice;
    simulatedMultiplier = 1 / simulatedAvgPrice; // Each share returns 1.00 if wins
  }

  // Predict return for selling
  let simulatedSellReturn = 0;
  let simulatedSellAvgPrice = 0;
  if (tradeAction === 'SELL' && numericSellShares > 0 && userPosition) {
    const sharesToSell = Math.min(userPosition.shares, numericSellShares);
    if (activeOutcome === 'YES') {
      const weight = sharesToSell * p;
      const delta = (weight / (weight + L)) * p;
      simulatedSellAvgPrice = p - delta / 2;
    } else {
      const q = 1 - p;
      const weight = sharesToSell * q;
      const delta = (weight / (weight + L)) * q;
      simulatedSellAvgPrice = q - delta / 2;
    }
    simulatedSellAvgPrice = Math.max(0.01, Math.min(0.99, simulatedSellAvgPrice));
    simulatedSellReturn = sharesToSell * simulatedSellAvgPrice;
  }

  // Handle transaction execute
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (tradeAction === 'BUY') {
      if (!amountInput || numericAmount <= 0) {
        setErrorMsg('Please enter a valid credit deposit.');
        return;
      }
      const res = buyShares(market.id, activeOutcome, numericAmount);
      if (res.success) {
        setSuccessMsg(`Successfully purchased ${res.shares?.toFixed(2)} active ${activeOutcome} shares for ${numericAmount.toFixed(2)} credits!`);
        setAmountInput('');
      } else {
        setErrorMsg(res.error || 'Failed to complete deal.');
      }
    } else {
      if (!sharesToSellInput || numericSellShares <= 0) {
        setErrorMsg('Please enter an amount of shares to sell.');
        return;
      }
      if (!userPosition) {
        setErrorMsg(`You do not own any ${activeOutcome} shares to sell.`);
        return;
      }
      const sharesToSell = Math.min(userPosition.shares, numericSellShares);
      const res = sellShares(market.id, activeOutcome, sharesToSell);
      if (res.success) {
        setSuccessMsg(`Successfully sold ${sharesToSell.toFixed(2)} ${activeOutcome} shares for ${res.creditsReturned?.toFixed(2)} credits returned!`);
        setSharesToSellInput('');
      } else {
        setErrorMsg(res.error || 'Failed to complete deal.');
      }
    }
  };

  // Submit User Comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(
      market.id, 
      commentText, 
      commentName.trim() || 'Virtual Trader', 
      commentName.trim() ? `${commentName.toLowerCase().replace(/\s+/g, '_')}@virtual.co` : 'anon_player@virtual.co'
    );
    setCommentText('');
    setCommentName('');
  };

  // Filter Comments for this market
  const marketComments = comments.filter(comm => comm.marketId === market.id);

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const priceHistory = market.yesPriceHistory && market.yesPriceHistory.length > 0 
    ? market.yesPriceHistory 
    : [0.50, 0.50];

  const pointsCount = priceHistory.length;

  // Render SVG Path points
  const svgPoints = priceHistory.map((val, idx) => {
    const x = paddingX + (idx / (pointsCount - 1)) * (width - 2 * paddingX);
    // Y scale mapping 0 to 1 price bounds inside coordinate system
    const y = height - paddingY - (val * (height - 2 * paddingY));
    return { x, y, value: val, index: idx };
  });

  // Polyline coordinates list
  const dPath = svgPoints.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  // Shaded area path underneath coordinates
  const gradientPath = dPath 
    + `L ${svgPoints[svgPoints.length - 1].x} ${height - paddingY} `
    + `L ${svgPoints[0].x} ${height - paddingY} Z`;

  // Draw chart hover cursor finder
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartRef.current || svgPoints.length === 0) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    // Scale user clientX to match internal SVG coordinates (width = 600)
    const svgX = (clientX / rect.width) * width;

    // Find closest segment point
    let closestPt = svgPoints[0];
    let minDiff = Math.abs(svgPoints[0].x - svgX);

    for (let i = 1; i < svgPoints.length; i++) {
      const diff = Math.abs(svgPoints[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestPt = svgPoints[i];
      }
    }

    setHoveredPoint(closestPt);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in" id={`market-details-page-${market.id}`}>
      
      {/* Back Header Nav */}
      <button 
        onClick={onBack}
        id="details_back_btn"
        className="mb-6 flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Active Board</span>
      </button>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details and Chart Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Category / Icon & Expiry */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 uppercase">
                {market.imageUrl} {market.category.replace('-', ' ')}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                Valid through {market.expiryDate}
              </span>
            </div>

            {/* Title heading */}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug" id="details_title">
              {market.question}
            </h1>

            {/* Description card */}
            <div className="mt-4 text-sm leading-relaxed text-slate-500 border-l-4 border-slate-200 pl-4 bg-slate-50 p-3 rounded-r-lg">
              {market.description}
            </div>

            {/* Volume Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-slate-100 py-4 font-sans">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Traded Volume</div>
                <div className="text-lg font-mono font-bold text-slate-800" id="details_volume">
                  {market.volume.toLocaleString()} cr
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Yes Chance</div>
                <div className="text-lg font-semibold text-blue-600 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {Math.round(market.yesPrice * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">AMM Liquidity</div>
                <div className="text-lg font-mono font-bold text-slate-700">
                  {market.liquidity} cr
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Status</div>
                <div>
                  {market.resolved ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase text-emerald-800">
                      Settled ({market.result})
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold uppercase text-blue-800 animate-pulse">
                      Open Event
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Block */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">YES Price Chance History</span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {hoveredPoint ? `Day ${hoveredPoint.index + 1}: ${Math.round(hoveredPoint.value * 100)}¢` : 'Hover chart points to inspect'}
                </span>
              </div>

              {/* Graphic SVG Chart */}
              <div className="relative bg-slate-50 border border-slate-150 rounded-xl overflow-hidden p-2">
                <svg
                  ref={chartRef}
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  id="chart_svg"
                >
                  {/* Grid Guidelines */}
                  <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Axis indicators */}
                  <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" className="text-[10px] font-mono font-medium fill-slate-400">100%</text>
                  <text x={paddingX - 10} y={height / 2 + 4} textAnchor="end" className="text-[10px] font-mono font-medium fill-slate-400">50%</text>
                  <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" className="text-[10px] font-mono font-medium fill-slate-400">0%</text>

                  {/* Gradient Area Shading */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* Underlay Area */}
                  <path d={gradientPath} fill="url(#chartGlow)" />

                  {/* Primary line path */}
                  <path
                    d={dPath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Point Dots */}
                  {svgPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.index === i ? "6" : "3.5"}
                      fill={hoveredPoint?.index === i ? "#2563eb" : "#ffffff"}
                      stroke="#2563eb"
                      strokeWidth={hoveredPoint?.index === i ? "3" : "2"}
                      className="transition-all duration-100"
                    />
                  ))}

                  {/* Moving focal crosshair lines */}
                  {hoveredPoint && (
                    <>
                      <line
                        x1={hoveredPoint.x}
                        y1={paddingY}
                        x2={hoveredPoint.x}
                        y2={height - paddingY}
                        stroke="#95a5b9"
                        strokeDasharray="3"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="8"
                        fill="#2563eb"
                        fillOpacity="0.15"
                      />
                    </>
                  )}
                </svg>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Start Month</span>
                <span>Real-time Dynamic Spans</span>
                <span>Latest update</span>
              </div>
            </div>

          </div>

          {/* Social Feedback and Argument Board (Comments Section) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-900 flex items-center mb-4">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              Argument Thread ({marketComments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your screen name (e.g. Satoshi_99)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  id="comment_name_input"
                />
                <span className="text-[11px] text-slate-400 self-center">
                  Join the consensus. Shares owned indicate leverage!
                </span>
              </div>
              <textarea
                placeholder="Share your logical case for YES or NO shares. Keep it constructive..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                id="comment_text_textarea"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  id="post_comment_btn"
                  className="rounded-lg bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  Post Argument
                </button>
              </div>
            </form>

            {/* Custom Argument Stream list */}
            {marketComments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No active comments on this market. Be first to share your prediction insight!
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1" id="comments_list">
                {marketComments.map((comm) => (
                  <div key={comm.id} className="rounded-lg border border-slate-100 p-4 text-xs bg-white hover:bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-800">{comm.userName}</span>
                        <span className="text-[10px] text-slate-400">{comm.userEmail}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-sans">{comm.text}</p>
                    <div className="mt-2.5 flex items-center space-x-4">
                      <button 
                        onClick={() => likeComment(comm.id)}
                        className={`flex items-center space-x-1 text-[10px] uppercase tracking-wider font-extrabold transition-all active:scale-95 ${
                          comm.likedByUser ? 'text-red-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${comm.likedByUser ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>Like • {comm.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Dynamic Order & Checkout Panel Spacer */}
        <div className="space-y-6">
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24" id="trading_panel">
            
            {/* TABS Selector (Buy or Sell) */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-5">
              <button
                id="trade_action_buy_tab"
                onClick={() => setTradeAction('BUY')}
                className={`flex-1 rounded-md py-2 text-center text-xs font-bold transition-all ${
                  tradeAction === 'BUY' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Buy Shares
              </button>
              <button
                id="trade_action_sell_tab"
                onClick={() => setTradeAction('SELL')}
                className={`flex-1 rounded-md py-2 text-center text-xs font-bold transition-all ${
                  tradeAction === 'SELL' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sell Holdings
              </button>
            </div>

            {/* YES and NO contract selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                id="outcome_yes_btn"
                onClick={() => setActiveOutcome('YES')}
                className={`relative flex flex-col items-center justify-center rounded-xl p-3 border-2 transition-all ${
                  activeOutcome === 'YES'
                    ? 'bg-blue-50/50 border-blue-600 text-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs font-black tracking-wide">YES Shares</span>
                <span className="font-mono text-sm font-black mt-1">
                  {Math.round(market.yesPrice * 100)}¢
                </span>
              </button>

              <button
                id="outcome_no_btn"
                onClick={() => setActiveOutcome('NO')}
                className={`relative flex flex-col items-center justify-center rounded-xl p-3 border-2 transition-all ${
                  activeOutcome === 'NO'
                    ? 'bg-rose-50/50 border-rose-500 text-rose-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs font-black tracking-wide">NO Shares</span>
                <span className="font-mono text-sm font-black mt-1">
                  {100 - Math.round(market.yesPrice * 100)}¢
                </span>
              </button>
            </div>

            {/* Error or Success notification displays */}
            {successMsg && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs font-medium text-emerald-800 flex items-start" id="trade_success_toast">
                <Sparkles className="mr-2 h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-800 flex items-start" id="trade_error_toast">
                <AlertCircle className="mr-2 h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Order Input Form */}
            <form onSubmit={handleExecuteTrade} className="space-y-4">
              
              {tradeAction === 'BUY' ? (
                // BUY MODE
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Fund with Credits</span>
                    <span className="text-slate-400 font-mono">My Wallet: {balance.toFixed(2)} cr</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-3.5 pr-14 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={market.resolved}
                      id="buy_credits_input"
                    />
                    <span className="absolute right-3.5 top-3.5 font-bold font-mono text-xs text-slate-400 uppercase">CREDITS</span>
                  </div>

                  {/* Buy presets */}
                  <div className="mt-2.5 flex items-center justify-between gap-1.5">
                    {[50, 100, 250, 500].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmountInput(preset.toString())}
                        className="flex-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 py-1.5 text-[10px] font-bold text-slate-600"
                      >
                        +{preset} cr
                      </button>
                    ))}
                  </div>

                  {/* Payout Calculations Recap indicators */}
                  {numericAmount > 0 ? (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Estimated Shares</span>
                        <span className="font-mono font-bold text-slate-900" id="estimated_shares_val">
                          {simulatedShares.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Avg purchase price</span>
                        <span className="font-mono font-bold text-slate-800">
                          {simulatedAvgPrice.toFixed(4)} cr / share
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Price impact (Slippage)</span>
                        <span className={`font-mono font-bold ${simulatedNextPrice - p > 0.05 ? 'text-red-500' : 'text-slate-400'}`}>
                          {((Math.abs(simulatedAvgPrice - p) / p) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-150">
                        <span className="text-emerald-700 font-bold">Winning payout</span>
                        <span className="font-mono font-bold text-emerald-800" id="potential_payout_val">
                          {simulatedShares.toFixed(2)} cr
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                        <span>Potential Multiplier</span>
                        <span>{simulatedMultiplier.toFixed(2)}x (+{((simulatedMultiplier - 1) * 100).toFixed(0)}% ROI)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl bg-slate-50 px-3.5 py-4 border border-slate-100 text-slate-400 text-xs flex items-center justify-center font-medium">
                      <Info className="mr-1.5 h-4 w-4 text-slate-400 shrink-0" />
                      Specify a purchase value to inspect potential dividend multi-factors.
                    </div>
                  )}

                </div>
              ) : (
                // SELL MODE
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Shares to Liquidate</span>
                    <span className="text-slate-400 font-mono">
                      Owned: {userPosition ? userPosition.shares.toFixed(2) : '0.00'} shares
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0.0001"
                      step="any"
                      placeholder="0.00"
                      value={sharesToSellInput}
                      onChange={(e) => setSharesToSellInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-3.5 pr-14 text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={market.resolved || !userPosition}
                      id="sell_shares_input"
                    />
                    <span className="absolute right-3.5 top-3.5 font-bold font-mono text-xs text-slate-400 uppercase">SHARES</span>
                  </div>

                  {userPosition && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSharesToSellInput(userPosition.shares.toString())}
                        className="text-[10px] font-semibold text-blue-600 hover:underline"
                        id="sell_max_shares_btn"
                      >
                        Sell Max ({userPosition.shares.toFixed(2)} shares)
                      </button>
                    </div>
                  )}

                  {numericSellShares > 0 && userPosition ? (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Estimated payout returns</span>
                        <span className="font-mono font-bold text-slate-900" id="sell_return_credits">
                          {simulatedSellReturn.toFixed(2)} cr
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Avg sell price per share</span>
                        <span className="font-mono font-bold text-slate-800">
                          {simulatedSellAvgPrice.toFixed(4)} cr
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Bought at avg</span>
                        <span className="font-mono font-bold text-slate-600">
                          {userPosition.averagePrice.toFixed(4)} cr
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-150">
                        <span className="text-slate-500 font-bold">Estimated profit</span>
                        <span className={`font-mono font-bold ${simulatedSellReturn - (numericSellShares * userPosition.averagePrice) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {(simulatedSellReturn - (numericSellShares * userPosition.averagePrice)).toFixed(2)} cr
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl bg-slate-50 px-3.5 py-4 border border-slate-100 text-slate-400 text-xs flex items-center justify-center font-medium">
                      <Info className="mr-1.5 h-4 w-4 text-slate-400 shrink-0" />
                      Specify shares to load estimated liqudation cashbacks.
                    </div>
                  )}

                </div>
              )}

              {/* Submit Buttons */}
              {market.resolved ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-slate-200 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  Market Resolved & Locked
                </button>
              ) : (
                <button
                  type="submit"
                  id="trade_submit_btn"
                  disabled={tradeAction === 'SELL' && !userPosition}
                  className={`w-full rounded-lg py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-colors cursor-pointer ${
                    tradeAction === 'BUY'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {tradeAction === 'BUY' ? `Buy ${activeOutcome} Shares` : `Sell ${activeOutcome} Shares`}
                </button>
              )}

            </form>

            {/* Current holdings list indicator block */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-sans">
              <span className="text-xs font-bold text-slate-700 block mb-2">My Open Positions in Market</span>
              {anyPositionsInMarket.length === 0 ? (
                <span className="text-slate-400 font-medium">No open positions in this event.</span>
              ) : (
                <div className="space-y-2" id="user_open_positions_sub">
                  {anyPositionsInMarket.map((pos, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-indigo-50/50 p-2 border border-indigo-100/50">
                      <div className="flex items-center">
                        <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-black mr-2 uppercase ${
                          pos.option === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pos.option}
                        </span>
                        <div>
                          <p className="font-mono font-bold leading-none text-slate-900">{pos.shares.toFixed(1)} sh</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">at {pos.averagePrice} avg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold leading-none text-slate-800">
                          {(pos.shares * (pos.option === 'YES' ? market.yesPrice : (1 - market.yesPrice))).toFixed(2)} cr
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 leading-none mt-0.5">val</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
