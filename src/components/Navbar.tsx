import React from 'react';
import { Coins, User, Sliders, BarChart2, RefreshCw } from 'lucide-react';
import { useMarkets } from '../context/MarketContext';

interface NavbarProps {
  currentTab: 'markets' | 'portfolio' | 'admin';
  onChangeTab: (tab: 'markets' | 'portfolio' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onChangeTab }) => {
  const { balance, claimFaucet, resetAll } = useMarkets();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => onChangeTab('markets')} 
          className="flex cursor-pointer items-center space-x-3"
          id="navbar_brand"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-display text-lg font-bold text-white shadow-sm">
            P
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 uppercase">
            POLY<span className="text-blue-600">MARKET</span>
            <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 border border-amber-100">
              Virtual
            </span>
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-6 h-full text-sm font-medium" id="nav_links">
          <button
            id="tab_markets_btn"
            onClick={() => onChangeTab('markets')}
            className={`h-16 flex items-center space-x-1.5 px-1 pb-1 transition-all border-b-2 hover:text-blue-600 ${
              currentTab === 'markets'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Explore</span>
          </button>
          
          <button
            id="tab_portfolio_btn"
            onClick={() => onChangeTab('portfolio')}
            className={`h-16 flex items-center space-x-1.5 px-1 pb-1 transition-all border-b-2 hover:text-blue-600 ${
              currentTab === 'portfolio'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Portfolio</span>
          </button>

          <button
            id="tab_admin_btn"
            onClick={() => onChangeTab('admin')}
            className={`h-16 flex items-center space-x-1.5 px-1 pb-1 transition-all border-b-2 hover:text-blue-600 ${
              currentTab === 'admin'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Control Station</span>
          </button>
        </nav>

        {/* Right side Profile & Virtual Balance & Faucet */}
        <div className="flex items-center space-x-3.5" id="navbar_profile_container">
          
          {/* Virtual Credits Badge */}
          <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center">
            <span className="text-[10px] font-bold text-blue-700 mr-2 uppercase tracking-wider font-sans">Credits</span>
            <span className="text-sm font-bold text-blue-900 font-mono tracking-tight" id="header_balance_val">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Faucet Button */}
          <button
            id="claim_faucet_btn"
            onClick={claimFaucet}
            title="Claim +500.00 free credits"
            className="flex h-9 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Faucet
          </button>

          {/* Reset Application Button */}
          <button
            id="reset_all_btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all markets, custom trades and reload default entries?")) {
                resetAll();
              }
            }}
            title="Reset sandbox database"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all text-slate-400 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 bg-white px-2 py-1 justify-around" id="mobile_nav">
        <button
          onClick={() => onChangeTab('markets')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-semibold ${
            currentTab === 'markets' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <BarChart2 className="h-5 w-5 mb-0.5" />
          Explore
        </button>
        <button
          onClick={() => onChangeTab('portfolio')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-semibold ${
            currentTab === 'portfolio' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <User className="h-5 w-5 mb-0.5" />
          Portfolio
        </button>
        <button
          onClick={() => onChangeTab('admin')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-semibold ${
            currentTab === 'admin' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Sliders className="h-5 w-5 mb-0.5" />
          Control
        </button>
      </div>

    </header>
  );
};
