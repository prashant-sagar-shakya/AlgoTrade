'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import TradingHeader from '@/components/trading/TradingHeader';
import TickerBar from '@/components/trading/TickerBar';
import ChartPanel from '@/components/trading/ChartPanel';
import Watchlist from '@/components/trading/Watchlist';
import OrderPanel from '@/components/trading/OrderPanel';
import SignalPanel from '@/components/trading/SignalPanel';
import AIChat from '@/components/trading/AIChat';
import IndicatorsPanel from '@/components/trading/IndicatorsPanel';
import PositionsPanel from '@/components/trading/PositionsPanel';
import RiskCalculator from '@/components/trading/panels/RiskCalculator';
import TradeJournal from '@/components/trading/panels/TradeJournal';
import GoldenRules from '@/components/trading/panels/GoldenRules';
import MasterGuide from '@/components/trading/panels/MasterGuide';
import StrategyBuilder from '@/components/trading/panels/StrategyBuilder';
import ExpertSetups from '@/components/trading/panels/ExpertSetups';
import NewsPanel from '@/components/trading/panels/NewsPanel';
import NotificationsPanel from '@/components/trading/panels/NotificationsPanel';
import { useTradingEngine } from '@/lib/useTradingEngine';
import { watchlistData, IndicatorData, getCurrencySymbol } from '@/lib/mockData';
import { fetchQuote } from '@/lib/yahooApi';
import { Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const clerkUserId = user?.id || null;

  // All persisted settings — defaults used until MongoDB load completes
  const [isDark, setIsDark] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
  const [rightTab, setRightTab] = useState<'AI'|'ORDER'|'POSITIONS'|'TOOLS'|'NOTIFICATIONS'>('AI');
  const [chartType, setChartType] = useState<'candle'|'line'>('candle');
  const [timeframe, setTimeframe] = useState('1D');
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showVWAP, setShowVWAP] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const [livePrice, setLivePrice] = useState<number>(0);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [liveIndicators, setLiveIndicators] = useState<Partial<IndicatorData> | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [toolSubTab, setToolSubTab] = useState<'CALC'|'JOURNAL'|'RULES'|'GUIDE'|'BACKTEST'|'EXPERT'|'NEWS'>('CALC');
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

  const engine = useTradingEngine(clerkUserId);
  
  const settingsLoaded = useRef(false);
  const basePriceRef = useRef<number>(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // ====== LOAD settings from MongoDB (once, on login) ======
  useEffect(() => {
    if (!clerkUserId) return;
    async function loadSettings() {
      try {
        const res = await fetch('/api/user', { headers: { 'x-user-id': clerkUserId! } });
        const doc = await res.json();
        if (doc.isDemo) return; // DB unavailable, keep defaults

        const s = doc.settings || {};
        if (s.selectedSymbol) setSelectedSymbol(s.selectedSymbol);
        if (typeof s.isDark === 'boolean') setIsDark(s.isDark);
        if (s.rightTab) setRightTab(s.rightTab as any);
        if (s.chartType) setChartType(s.chartType as any);
        if (s.timeframe) setTimeframe(s.timeframe);
        if (typeof s.showEMA9 === 'boolean') setShowEMA9(s.showEMA9);
        if (typeof s.showEMA21 === 'boolean') setShowEMA21(s.showEMA21);
        if (typeof s.showEMA50 === 'boolean') setShowEMA50(s.showEMA50);
        if (typeof s.showVWAP === 'boolean') setShowVWAP(s.showVWAP);
        if (typeof s.showRSI === 'boolean') setShowRSI(s.showRSI);
        if (typeof s.showVolume === 'boolean') setShowVolume(s.showVolume);

        settingsLoaded.current = true;
      } catch {}
    }
    loadSettings();

    // Check unread notifications
    fetch('/api/notifications', { headers: { 'x-user-id': clerkUserId! } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHasUnreadNotifs(data.some((n: any) => !n.read)); })
      .catch(() => {});
  }, [clerkUserId]);

  // ====== SAVE settings to MongoDB (debounced, stable ref) ======
  const settingsRef = useRef({ selectedSymbol, isDark, rightTab, chartType, timeframe, showEMA9, showEMA21, showEMA50, showVWAP, showRSI, showVolume });

  // Keep ref in sync (this does NOT trigger re-renders or effects)
  useEffect(() => {
    settingsRef.current = { selectedSymbol, isDark, rightTab, chartType, timeframe, showEMA9, showEMA21, showEMA50, showVWAP, showRSI, showVolume };
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);

    // Only save after initial load from DB is complete
    if (!settingsLoaded.current || !clerkUserId) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const s = settingsRef.current;
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': clerkUserId },
        body: JSON.stringify({ settings: s })
      }).catch(() => {});
    }, 2000); // 2 second debounce

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [isDark, selectedSymbol, rightTab, chartType, timeframe, showEMA9, showEMA21, showEMA50, showVWAP, showRSI, showVolume, clerkUserId]);


  // ====== Yahoo price anchor (every 5s) ======
  useEffect(() => {
    // If we don't have a livePrice yet or just switched, try to grab initial from mock as absolute fallback
    if (livePrice <= 0) {
      const fallback: Record<string, number> = {
        'BTC-USD': 67842, 'ETH-USD': 3542, 'RELIANCE.NS': 2847, 'TCS.NS': 3942,
        'HDFCBANK.NS': 1442, 'AAPL': 189, 'TSLA': 248, 'EURUSD=X': 1.0847, 'GC=F': 2342
      };
      basePriceRef.current = fallback[selectedSymbol] || watchlistData.find(w => w.symbol === selectedSymbol)?.price || 100;
      setLivePrice(basePriceRef.current);
    }

    const fetchBase = async () => {
      try {
        const quote = await fetchQuote(selectedSymbol);
        if (quote) {
           if (quote.price > 0) {
             basePriceRef.current = quote.price;
             setLivePrice(quote.price); 
           }
           setIsMarketOpen(!!quote.isMarketOpen);
        }
      } catch {}
    };
    fetchBase();
    pollRef.current = setInterval(fetchBase, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedSymbol]);

  // ====== Local tick simulator (500ms) - ONLY ON OPEN MARKETS ======
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!isMarketOpen) return; // Freeze simulated ticks if market closed

    tickRef.current = setInterval(() => {
      const base = basePriceRef.current;
      if (base <= 0) return;
      
      const vol = base * 0.0003;
      const change = (Math.random() - 0.5) * 2 * vol;
      
      setLivePrice(prev => {
        const next = (prev || base) + change;
        const maxDrift = base * 0.02; // max 2% drift from base between yahoo syncs
        if (Math.abs(next - base) > maxDrift) return base + (Math.random() - 0.5) * vol;
        return +next.toFixed(2);
      });
    }, 500);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [selectedSymbol, isMarketOpen]);

  const currentPrice = livePrice || 0;

  // SL/TP triggers
  useEffect(() => {
    if (livePrice > 0) engine.checkTriggers(selectedSymbol, livePrice);
  }, [livePrice, selectedSymbol]);

  // Expose setRightTab for external use
  useEffect(() => { (window as any).openTab = setRightTab; }, []);

  const handleSymbolChange = (symbol: string, initialPrice?: number) => {
    setSelectedSymbol(symbol);
    if (initialPrice && initialPrice > 0) {
      basePriceRef.current = initialPrice;
      setLivePrice(initialPrice);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans relative">
      <TradingHeader
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
        onOpenTab={(tab: any) => setRightTab(tab)}
        hasUnread={hasUnreadNotifs}
        balance={engine.balance}
        isCloud={engine.isCloud}
        isMarketOpen={isMarketOpen}
      />
      <TickerBar items={watchlistItems} />

      <main className="flex-1 flex min-h-0 relative">
        <div className="w-52 border-r border-panel flex-shrink-0 hidden lg:block overflow-hidden">
          <Watchlist 
            selectedSymbol={selectedSymbol} 
            onSelectSymbol={handleSymbolChange} 
            userId={clerkUserId} 
            livePrice={livePrice}
            onItemsChange={setWatchlistItems}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-[400px]">
            <ChartPanel 
              symbol={selectedSymbol} 
              isDark={isDark} 
              livePrice={livePrice} 
              onIndicatorUpdate={setLiveIndicators}
              positions={engine.positions}
              onClosePosition={engine.closePosition}
              chartType={chartType}
              onChartTypeChange={setChartType}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              showEMA9={showEMA9} onShowEMA9={setShowEMA9}
              showEMA21={showEMA21} onShowEMA21={setShowEMA21}
              showEMA50={showEMA50} onShowEMA50={setShowEMA50}
              showVWAP={showVWAP} onShowVWAP={setShowVWAP}
              showRSI={showRSI} onShowRSI={setShowRSI}
              showVolume={showVolume} onShowVolume={setShowVolume}
            />
          </div>
          <div className="h-[200px] border-t border-panel overflow-hidden bg-card/30">
            <IndicatorsPanel symbol={selectedSymbol} price={currentPrice} liveData={liveIndicators} />
          </div>
        </div>

        <div className="w-[400px] border-l border-panel flex-shrink-0 flex flex-col hidden lg:flex bg-card overflow-hidden">
          <div className="flex border-b border-panel shrink-0 bg-background/50">
             <TabButton active={rightTab === 'AI'} onClick={() => setRightTab('AI')} label="AI Chat" />
             <TabButton active={rightTab === 'ORDER'} onClick={() => setRightTab('ORDER')} label="Order" />
             <TabButton active={rightTab === 'POSITIONS'} onClick={() => setRightTab('POSITIONS')} label="Positions" />
             <TabButton active={rightTab === 'TOOLS'} onClick={() => setRightTab('TOOLS')} label="Tools" />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {rightTab === 'AI' ? <AIChat symbol={selectedSymbol} price={currentPrice} indicators={liveIndicators} userId={clerkUserId} /> : 
             rightTab === 'ORDER' ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="h-[50%] border-b border-panel overflow-hidden">
                    <OrderPanel symbol={selectedSymbol} currentPrice={currentPrice} engine={engine} />
                  </div>
                  <div className="flex-1 min-h-0"><SignalPanel symbol={selectedSymbol} price={currentPrice} indicators={liveIndicators} /></div>
               </div>
             ) : 
             rightTab === 'POSITIONS' ? (
               <PositionsPanel positions={engine.positions} closePosition={engine.closePosition} currentPrice={currentPrice} balance={engine.balance} symbol={selectedSymbol} />
             ) : 
             rightTab === 'TOOLS' ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex border-b border-panel/50 bg-accent/20 shrink-0">
                    <SubTabButton active={toolSubTab === 'CALC'} onClick={() => setToolSubTab('CALC')} label="Calc" />
                    <SubTabButton active={toolSubTab === 'JOURNAL'} onClick={() => setToolSubTab('JOURNAL')} label="Logs" />
                    <SubTabButton active={toolSubTab === 'RULES'} onClick={() => setToolSubTab('RULES')} label="Rules" />
                    <SubTabButton active={toolSubTab === 'GUIDE'} onClick={() => setToolSubTab('GUIDE')} label="Guide" />
                    <SubTabButton active={toolSubTab === 'BACKTEST'} onClick={() => setToolSubTab('BACKTEST')} label="Test" />
                    <SubTabButton active={toolSubTab === 'EXPERT'} onClick={() => setToolSubTab('EXPERT')} label="Expert" />
                    <SubTabButton active={toolSubTab === 'NEWS'} onClick={() => setToolSubTab('NEWS')} label="News" />
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {toolSubTab === 'CALC' && <RiskCalculator />}
                    {toolSubTab === 'JOURNAL' && <TradeJournal userId={clerkUserId} />}
                    {toolSubTab === 'RULES' && <GoldenRules />}
                    {toolSubTab === 'GUIDE' && <MasterGuide />}
                    {toolSubTab === 'BACKTEST' && <StrategyBuilder />}
                    {toolSubTab === 'EXPERT' && <ExpertSetups />}
                    {toolSubTab === 'NEWS' && <NewsPanel symbol={selectedSymbol} />}
                  </div>
               </div>
             ) : (
               <NotificationsPanel onMarkRead={() => setHasUnreadNotifs(false)} userId={clerkUserId} />
             )}
          </div>
        </div>

        {/* AUTH GUARD */}
        <AnimatePresence>
          {isLoaded && !isSignedIn && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => openSignIn({})}
              className="absolute inset-0 z-[100] cursor-pointer bg-background/20 backdrop-blur-[2px] flex items-center justify-center"
            >
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="max-w-md w-full bg-card/90 border-2 border-dashed border-panel p-10 rounded-2xl shadow-2xl space-y-6 backdrop-blur-xl hover:border-primary/50 transition-all"
               >
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                    <Lock className="text-primary animate-pulse" size={32} />
                  </div>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
                    <p className="text-sm text-muted-foreground">Sign in to access <span className="text-primary font-bold">AlgoTrade™</span> trading tools.</p>
                  </div>
                  <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Zap size={18} /> Initialize Terminal
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest opacity-60">Click anywhere to sign in</p>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return <button onClick={onClick} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${active ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>{label}</button>;
}

function SubTabButton({ active, onClick, label }: any) {
  return <button onClick={onClick} className={`flex-1 py-1.5 text-[9px] font-bold uppercase transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>;
}
