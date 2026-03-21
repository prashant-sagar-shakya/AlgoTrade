import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { watchlistData, WatchlistItem } from '@/lib/mockData';

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function Watchlist({ selectedSymbol, onSelectSymbol }: WatchlistProps) {
  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5"><Activity size={12} /> Watchlist</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {watchlistData.map((item, i) => (
          <WatchlistRow
            key={item.symbol}
            item={item}
            index={i}
            isSelected={item.symbol === selectedSymbol}
            onClick={() => onSelectSymbol(item.symbol)}
          />
        ))}
      </div>
    </div>
  );
}

function WatchlistRow({ item, index, isSelected, onClick }: { item: WatchlistItem; index: number; isSelected: boolean; onClick: () => void }) {
  const isPositive = item.change >= 0;
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors border-b border-panel/50 active:scale-[0.98] ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
    >
      <div className="text-left">
        <div className="font-mono font-semibold text-foreground">{item.symbol}</div>
        <div className="text-muted-foreground text-[10px]">{item.name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono font-semibold tabular-nums">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        <div className={`flex items-center gap-0.5 justify-end tabular-nums ${isPositive ? 'price-up' : 'price-down'}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          <span>{isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </motion.button>
  );
}
