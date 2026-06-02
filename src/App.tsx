import React, { useState } from 'react';
import { MarketProvider, useMarkets } from './context/MarketContext';
import { Navbar } from './components/Navbar';
import { MarketCard } from './components/MarketCard';
import { MarketDetails } from './components/MarketDetails';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { AdminConsole } from './components/AdminConsole';
import { Search, Filter, HelpCircle, ArrowUpRight, TrendingUp, HelpCircle as HelpIcon } from 'lucide-react';

function AppContent() {
  const { 
    markets, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    selectedMarket,
    setSelectedMarket
  } = useMarkets();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'markets' | 'portfolio' | 'admin'>('markets');
  
  // Sorting options
  const [sortBy, setSortBy] = useState<'volume' | 'expiry' | 'newest'>('volume');

  // Static Category items
  const categoriesList = [
    { id: 'all', label: '🌐 All Markets' },
    { id: 'politics', label: '🏛️ Politics' },
    { id: 'crypto', label: '🪙 Crypto' },
    { id: 'science-tech', label: '🔬 Science & Tech' },
    { id: 'pop-culture', label: '🎮 Pop Culture' },
    { id: 'sports', label: '⚽ Sports' }
  ];

  // Helper filter & sort
  const filteredMarkets = markets.filter(m => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch = m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (sortBy === 'volume') {
      return b.volume - a.volume;
    }
    if (sortBy === 'expiry') {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    }
    return 0;
  });

  const handleSelectFromPortfolio = (marketSelected: any) => {
    setSelectedMarket(marketSelected);
    setCurrentTab('markets'); // redirect view contexts safely
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Global Brand Header Navbar */}
      <Navbar 
        currentTab={currentTab} 
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          setSelectedMarket(null); // Clear active detail view on tab toggles
        }} 
      />

      <main className="flex-1 pb-16">
        
        {/* Drill down detail router */}
        {selectedMarket ? (
          <MarketDetails 
            market={selectedMarket} 
            onBack={() => setSelectedMarket(null)} 
          />
        ) : (
          <>
            {/* 1. MARKETS EXPLORER TAB */}
            {currentTab === 'markets' && (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in" id="explore_markets_tab">
                
                {/* Hero Platform Billboard */}
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 border border-blue-400/20">
                      Prediction Markets Terminal
                    </span>
                    <h1 className="mt-3.5 font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                      Trade on real-world outcomes.
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
                      Settle doubts about politics, finance, pop culture, sports, and space launch events. Manage YES and NO shareholdings backed by simulated test credits.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-100">
                      <div className="flex items-center space-x-1.5 rounded-lg bg-white/10 px-3.5 py-2 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Mock Liquidity Active</span>
                      </div>
                      <div className="flex items-center space-x-1.5 rounded-lg bg-white/10 px-3.5 py-2 backdrop-blur-md">
                        <span>🚀 Zero-risk testing sandbox</span>
                      </div>
                    </div>
                  </div>
                  {/* Backdrop graphic */}
                  <div className="absolute right-[-20%] bottom-[-50%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Filters sidebar rail and Search Row combo */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                  {/* Categories Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none" id="category-pills-row">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        id={`category-pill-${cat.id}`}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`inline-flex shrink-0 items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          activeCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sort widgets */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    
                    {/* Search Field */}
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search predictions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-60 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        id="global_search_input"
                      />
                    </div>

                    {/* Sorting dropdown */}
                    <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 px-3 py-1">
                      <Filter className="h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border-0 bg-transparent py-1 text-xs font-extrabold text-slate-600 focus:ring-0 focus:outline-none"
                        id="global_sort_select"
                      >
                        <option value="volume">Highest Volume</option>
                        <option value="expiry">Soonest Expiry</option>
                        <option value="newest">Newest Events</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Sub Title information check */}
                <div className="mb-4 flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-150 pb-2">
                  <span>SHOWING {sortedMarkets.length} PREDICTION EVENTS</span>
                  <span>CONSTANT PRODUCT AMM MODELING</span>
                </div>

                {/* Cards Deck Grid viewport */}
                {sortedMarkets.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl">
                    <HelpCircle className="mx-auto h-12 w-12 text-slate-350" />
                    <h3 className="mt-4 text-sm font-black text-slate-700 uppercase tracking-widest">No Results Located</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      No events matched active criteria. Clear filters or create new fields in the Admin Panel!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="markets_cards_deck">
                    {sortedMarkets.map((market) => (
                      <MarketCard 
                        key={market.id} 
                        market={market} 
                        onSelect={(m) => setSelectedMarket(m)} 
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* 2. PORTFOLIO TERMINAL DASHBOARD TAB */}
            {currentTab === 'portfolio' && (
              <PortfolioDashboard onSelectMarket={handleSelectFromPortfolio} />
            )}

            {/* 3. ADMIN MANAGEMENT TAB */}
            {currentTab === 'admin' && (
              <AdminConsole />
            )}
          </>
        )}

      </main>

      {/* Persistent global footer credits */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            POLYMARKET CLONE TERMINAL • VIRTUAL TEST CREDITS ONLY • ZERO REAL MONEY CAPABILITY
          </p>
          <p className="text-[10px] text-slate-300 mt-1 leading-snug">
            Implemented as an interactive sandbox. Pricing represents virtual supply fluctuations and algorithmic constants in memory.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <MarketProvider>
      <AppContent />
    </MarketProvider>
  );
}
