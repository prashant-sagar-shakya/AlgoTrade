import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TradingHeader from '@/components/trading/TradingHeader';
import TickerBar from '@/components/trading/TickerBar';
import ChartPanel from '@/components/trading/ChartPanel';
import Watchlist from '@/components/trading/Watchlist';
import OrderPanel from '@/components/trading/OrderPanel';
import SignalPanel from '@/components/trading/SignalPanel';
import AIChat from '@/components/trading/AIChat';
import IndicatorsPanel from '@/components/trading/IndicatorsPanel';
import { watchlistData } from '@/lib/mockData';

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const currentPrice = watchlistData.find(w => w.symbol === selectedSymbol)?.price || 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <TradingHeader
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        selectedSymbol={selectedSymbol}
        onSymbolChange={setSelectedSymbol}
      />
      <TickerBar />

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Watchlist */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-52 border-r border-panel flex-shrink-0 hidden lg:block"
        >
          <Watchlist selectedSymbol={selectedSymbol} onSelectSymbol={setSelectedSymbol} />
        </motion.div>

        {/* Center: Chart + Indicators */}
        <div className="flex-1 flex flex-col min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-h-0"
          >
            <ChartPanel symbol={selectedSymbol} isDark={isDark} />
          </motion.div>
        </div>

        {/* Right sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-64 border-l border-panel flex-shrink-0 flex flex-col hidden md:flex"
        >
          {/* Top: Order Panel */}
          <div className="h-[45%] border-b border-panel">
            <OrderPanel symbol={selectedSymbol} currentPrice={currentPrice} />
          </div>
          {/* Bottom: Indicators */}
          <div className="flex-1 min-h-0">
            <IndicatorsPanel symbol={selectedSymbol} price={currentPrice} />
          </div>
        </motion.div>

        {/* Far right: Signals + AI Chat */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-72 border-l border-panel flex-shrink-0 flex flex-col hidden xl:flex"
        >
          <div className="h-[45%] border-b border-panel">
            <SignalPanel />
          </div>
          <div className="flex-1 min-h-0">
            <AIChat />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
