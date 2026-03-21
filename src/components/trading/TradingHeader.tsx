import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Settings, Search, Wifi, WifiOff, User } from 'lucide-react';

interface TradingHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export default function TradingHeader({ isDark, onToggleTheme, selectedSymbol, onSymbolChange }: TradingHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connected] = useState(true);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'NIFTY', 'BANKNIFTY', 'RELIANCE', 'EURUSD', 'GOLD', 'AAPL', 'TSLA', 'SPY'];
  const filtered = symbols.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-12 bg-card border-b border-panel flex items-center px-3 gap-2 relative z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-panel">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">AT</span>
        </div>
        <span className="font-semibold text-sm hidden sm:block">AlgoTrade</span>
      </div>

      {/* Symbol Search */}
      <div className="relative">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent hover:bg-accent/80 transition-colors"
        >
          <Search size={14} className="text-muted-foreground" />
          <span className="font-mono text-sm font-semibold">{selectedSymbol}</span>
        </button>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full left-0 mt-1 w-56 bg-card border border-panel rounded-lg shadow-xl overflow-hidden"
          >
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol..."
              className="w-full px-3 py-2 text-sm bg-transparent border-b border-panel outline-none placeholder:text-muted-foreground"
            />
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              {filtered.map((s) => (
                <button
                  key={s}
                  onClick={() => { onSymbolChange(s); setSearchOpen(false); setSearchQuery(''); }}
                  className={`w-full px-3 py-2 text-left text-sm font-mono hover:bg-accent transition-colors ${s === selectedSymbol ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
        {connected ? (
          <><Wifi size={12} className="text-bull" /><span className="text-bull">Live</span></>
        ) : (
          <><WifiOff size={12} className="text-bear" /><span className="text-bear">Offline</span></>
        )}
      </div>

      {/* Actions */}
      <button className="p-1.5 rounded-md hover:bg-accent transition-colors relative">
        <Bell size={16} className="text-muted-foreground" />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-bear rounded-full" />
      </button>
      <button onClick={onToggleTheme} className="p-1.5 rounded-md hover:bg-accent transition-colors">
        {isDark ? <Sun size={16} className="text-muted-foreground" /> : <Moon size={16} className="text-muted-foreground" />}
      </button>
      <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
        <Settings size={16} className="text-muted-foreground" />
      </button>
      <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
        <User size={16} className="text-muted-foreground" />
      </button>
    </motion.header>
  );
}
