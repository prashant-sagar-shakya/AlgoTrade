import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/mockData';
import { fetchQuote } from '@/lib/yahooApi';
import { useState, useEffect } from 'react';

interface TickerItem {
  symbol: string;
  price: number;
  changePercent: number;
  isMarketOpen?: boolean;
}

export default function TickerBar({ items = [] }: { items?: TickerItem[] }) {
  // Duplicate for seamless 60-second infinite loop scrolling 
  // We duplicate it 3 times to guarantee it never runs out of off-screen content before resetting
  const allItems = [...items, ...items, ...items];

  return (
    <div className="h-8 bg-card/40 backdrop-blur-md border-b border-panel/50 overflow-hidden relative shadow-sm flex items-center">
      <div className="absolute left-0 z-10 bg-background/80 h-full flex items-center px-3 border-r border-panel/50 backdrop-blur-sm">
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest">
            <Bell size={10} className="text-primary animate-pulse" /> Live Market Ticker
         </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 text-center text-[9px] font-mono font-bold text-muted-foreground uppercase opacity-40 animate-pulse pl-32">
           Syncing Global Data Hub...
        </div>
      ) : (
        <motion.div
          className="flex items-center h-full gap-8 whitespace-nowrap pl-40"
          animate={{ x: [0, -2500] }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          style={{ width: 'max-content' }}
        >
          {allItems.map((item, i) => {
            const isPositive = item.changePercent >= 0;
            const cleanSym = item.symbol.replace('.NS', '').replace('.BO', '').replace('=X', '').replace('^', '');
            return (
              <div 
                key={`${item.symbol}-${i}`} 
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all duration-300
                  ${isPositive 
                    ? 'bg-bull/5 border border-bull/20 text-bull shadow-[0_0_10px_rgba(34,197,94,0.05)]' 
                    : 'bg-bear/5 border border-bear/20 text-bear shadow-[0_0_10px_rgba(239,68,68,0.05)]'
                  }`}
              >
                <span className="font-bold tracking-tighter opacity-90 uppercase">{cleanSym}</span>
                <span className="tabular-nums font-bold tracking-tight">{getCurrencySymbol(item.symbol)}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <div className={`flex items-center gap-0.5 px-1.5 rounded-sm font-bold shadow-inner ${isPositive ? 'bg-bull/10' : 'bg-bear/10'}`}>
                  {isPositive ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                  <span>{isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
