import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { watchlistData } from '@/lib/mockData';

export default function TickerBar() {
  const items = [...watchlistData, ...watchlistData];

  return (
    <div className="h-7 bg-card border-b border-panel overflow-hidden relative">
      <motion.div
        className="flex items-center h-full gap-6 whitespace-nowrap animate-ticker-scroll"
        style={{ width: 'max-content' }}
      >
        {items.map((item, i) => {
          const isPositive = item.change >= 0;
          return (
            <span key={`${item.symbol}-${i}`} className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="font-semibold text-foreground">{item.symbol}</span>
              <span className="tabular-nums">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`flex items-center gap-0.5 tabular-nums ${isPositive ? 'text-ticker-positive' : 'text-ticker-negative'}`}>
                {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
