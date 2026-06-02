import React, { useState } from 'react';
import { Sliders, Plus, Check, X, AlertTriangle, Trash2, Trophy, Coins, Calendar, HelpCircle } from 'lucide-react';
import { useMarkets } from '../context/MarketContext';
import { MarketCategory, Market } from '../types';

export const AdminConsole: React.FC = () => {
  const { markets, createMarket, resolveMarket, deleteMarket, resetAll } = useMarkets();

  // Create form state
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketCategory>('politics');
  const [expiryDate, setExpiryDate] = useState('');
  const [initialChance, setInitialChance] = useState('50'); // 10% to 90%
  const [liquidity, setLiquidity] = useState('1000');
  const [emoji, setEmoji] = useState('🔮');

  // Interactive notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle create
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!question.trim() || !description.trim() || !expiryDate || !initialChance || !liquidity) {
      setErrorMsg('All fields must be completely filled out.');
      return;
    }

    const parsedChance = parseFloat(initialChance);
    if (isNaN(parsedChance) || parsedChance < 5 || parsedChance > 95) {
      setErrorMsg('Initial Yes chance probability must lie strictly between 5% and 95%.');
      return;
    }

    const parsedLiquidity = parseFloat(liquidity);
    if (isNaN(parsedLiquidity) || parsedLiquidity < 100) {
      setErrorMsg('AMM Liquidity scaling parameter must be at least 100 credits.');
      return;
    }

    // Call Context action
    try {
      createMarket({
        question: question.trim(),
        description: description.trim(),
        category,
        expiryDate,
        yesPrice: parseFloat((parsedChance / 100).toFixed(2)),
        liquidity: parsedLiquidity,
        imageUrl: emoji
      });

      setSuccessMsg('Market created successfully and injected into active boards!');
      
      // Clear fields
      setQuestion('');
      setDescription('');
      setExpiryDate('');
      setInitialChance('50');
      setLiquidity('1000');
      setEmoji('🔮');
    } catch (err) {
      setErrorMsg('Process aborted. Fatal parameter syntax.');
    }
  };

  // Organize market states
  const activeMarkets = markets.filter(m => !m.resolved);
  const resolvedMarkets = markets.filter(m => m.resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in" id="admin_page">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center">
            <Sliders className="mr-3 h-7 w-7 text-amber-500" />
            Admin Commander
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Set custom prediction outcomes, formulate real events, and resolve credits settlement directly in-browser.
          </p>
        </div>

        {/* Global dangerous resetting action */}
        <button
          onClick={() => {
            if (window.confirm("WARNING: This will erase ALL custom markets, active positions, user balances, and restore initial standard demo contents. Proceed?")) {
              resetAll();
            }
          }}
          className="mt-4 sm:mt-0 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 px-4 py-2.5 text-xs font-bold text-rose-700 transition-colors"
        >
          Prune Database & Load Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Market Creator Form (Col-span 1) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 flex items-center mb-5 border-b border-slate-100 pb-3" id="admin_form_title">
              <Plus className="mr-2 h-5 w-5 text-blue-600" />
              Build Event Market
            </h2>

            {/* Validation indicators */}
            {successMsg && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-bold text-emerald-800 flex items-start" id="admin_success_toast">
                <Check className="mr-2 h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-800 flex items-start" id="admin_error_toast">
                <X className="mr-2 h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              
              {/* Question */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Will SpaceX successfully catch Starship booster on next flight?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  id="admin_input_question"
                />
              </div>

              {/* Description Details */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Resolution description / criteria</label>
                <textarea
                  placeholder="Define clear resolving instructions. E.g. Resolves to YES if SpaceX conducts flight 5 booster recovery catch using launch tower mechanical arms. Otherwise, NO."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  required
                  id="admin_input_desc"
                />
              </div>

              {/* Category, Emoji selector grids */}
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Event Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MarketCategory)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="admin_select_category"
                  >
                    <option value="politics">🏛️ Politics</option>
                    <option value="crypto">🪙 Crypto</option>
                    <option value="pop-culture">🎬 Pop Culture</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="science-tech">🔬 Science & Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Display Icon Emoji</label>
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    id="admin_select_emoji"
                  >
                    <option value="🔮">🔮 Crystal Ball</option>
                    <option value="🪙">🪙 Coin Icon</option>
                    <option value="🏛️">🏛️ Capitol Pillar</option>
                    <option value="⚽">⚽ Football Sports</option>
                    <option value="🚀">🚀 Spaceship Orbit</option>
                    <option value="🤖">🤖 Android Automation</option>
                    <option value="🎮">🎮 Game Console</option>
                    <option value="🎤">🎤 Music Stage</option>
                  </select>
                </div>

              </div>

              {/* Expiry, starting probability, liquidity parameters */}
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                    id="admin_input_expiry"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Yes probability%</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={initialChance}
                    onChange={(e) => setInitialChance(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    placeholder="50"
                    required
                    id="admin_input_chance"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">AMM Market Liquidity</label>
                <input
                  type="number"
                  min="100"
                  value={liquidity}
                  onChange={(e) => setLiquidity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  required
                  id="admin_input_liquidity"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 block leading-normal leading-tight font-medium">
                  Higher liquidity limits instant slippage changes when users dump larger buy blocks.
                </span>
              </div>

              {/* Deploy trigger */}
              <button
                type="submit"
                id="admin_create_submit_btn"
                className="w-full rounded-lg bg-slate-900 hover:bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-sm hover:shadow transition-all uppercase tracking-widest cursor-pointer"
              >
                Incorporate Live Market
              </button>

            </form>

          </div>
        </div>

        {/* Resolutions grid (Col-span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active markets waiting result resolution */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 flex items-center mb-5 border-b border-slate-100 pb-3">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              Outstanding Settlements awaiting Verification ({activeMarkets.length})
            </h2>

            {activeMarkets.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-slate-150">
                <HelpCircle className="mx-auto h-10 w-10 text-slate-350" />
                <h3 className="mt-4 text-xs font-extrabold text-slate-700 uppercase tracking-widest">No Active Events</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Every pre-populated and custom prediction market in the workspace is complete.
                </p>
              </div>
            ) : (
              <div className="space-y-4" id="admin_active_list">
                {activeMarkets.map((market) => {
                  const yesPercent = Math.round(market.yesPrice * 100);
                  const noPercent = 100 - yesPercent;

                  return (
                    <div 
                      key={market.id} 
                      className="border border-slate-150 rounded-xl p-5 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-300 transition-all"
                      id={`admin-resolving-row-${market.id}`}
                    >
                      <div className="space-y-1 sm:max-w-md">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{market.imageUrl}</span>
                          <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-tight">
                            {market.question}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold pl-8">
                          <span className="uppercase text-blue-600">{market.category}</span>
                          <span>•</span>
                          <span>Vol: {market.volume.toLocaleString()} cr</span>
                          <span>•</span>
                          <span className="font-mono">Chance: YES {yesPercent}% / NO {noPercent}%</span>
                        </div>
                      </div>

                      {/* Deciding Settlement Action Buttons */}
                      <div className="flex items-center gap-2 pl-8 sm:pl-0 shrink-0">
                        
                        {/* Resolve YES */}
                        <button
                          onClick={() => {
                            if (window.confirm(`SETTLEMENT DANGER: Are you certain you want to resolve YES for: "${market.question}"? This will payout 1.00 credit per YES share and close all positions permanently.`)) {
                              resolveMarket(market.id, 'YES');
                            }
                          }}
                          className="flex items-center justify-center space-x-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-3.5 py-2 text-xs font-bold transition-all border border-blue-200 uppercase tracking-wide cursor-pointer animate-none"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>YES wins</span>
                        </button>

                        {/* Resolve NO */}
                        <button
                          onClick={() => {
                            if (window.confirm(`SETTLEMENT DANGER: Are you certain you want to resolve NO for: "${market.question}"? This will payout 1.00 credit per NO share and close all positions permanently.`)) {
                              resolveMarket(market.id, 'NO');
                            }
                          }}
                          className="flex items-center justify-center space-x-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-3.5 py-2 text-xs font-bold transition-all border border-rose-200 uppercase tracking-wide cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>NO wins</span>
                        </button>

                        {/* Pruning Trash action */}
                        <button
                          onClick={() => {
                            if (window.confirm("PERMANENT ERASE: This will instantly delete this market and refund/cancel ALL user holdings without payouts. Proceed?")) {
                              deleteMarket(market.id);
                            }
                          }}
                          className="rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 p-2 text-slate-400"
                          title="Erase event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settle events log database */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-900 flex items-center mb-5 border-b border-slate-100 pb-3">
              <Coins className="mr-2 h-5 w-5 text-emerald-600" />
              Settled / Resolved Resolutions Log ({resolvedMarkets.length})
            </h2>

            {resolvedMarkets.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No verified resolutions in dynamic history.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1" id="admin_resolved_list">
                {resolvedMarkets.map((market) => (
                  <div key={market.id} className="py-3 flex items-center justify-between text-xs font-sans">
                    <div className="space-y-0.5 max-w-lg">
                      <h4 className="font-bold text-slate-700 leading-tight">
                        {market.question}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Category: {market.category} • Expiry: {market.expiryDate}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 ml-4 font-bold">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        market.result === 'YES' ? 'bg-blue-100 text-blue-805' : 'bg-rose-100 text-rose-805'
                      }`}>
                        {market.result} Wins
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete resolved record of this market?")) {
                            deleteMarket(market.id);
                          }
                        }}
                        className="rounded hover:bg-slate-100 p-1.5 text-slate-400 hover:text-rose-600"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
