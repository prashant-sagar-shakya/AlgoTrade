import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Target, Shield } from 'lucide-react';
import { mockSignals, Signal } from '@/lib/mockData';

export default function SignalPanel() {
  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5"><Target size={12} /> AI Signals</span>
        <span className="text-[10px] text-bull animate-pulse-glow rounded-full px-1.5 py-0.5">● Live</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {mockSignals.map((signal, i) => (
          <SignalCard key={signal.id} signal={signal} index={i} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  const isBuy = signal.type === 'BUY';
  const strengthClass = signal.strength === 'STRONG' ? 'signal-badge-strong' : signal.strength === 'MODERATE' ? 'signal-badge-moderate' : 'signal-badge-weak';
  const timeAgo = getTimeAgo(signal.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="px-3 py-2.5 border-b border-panel/50 hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs font-bold ${isBuy ? 'price-up' : 'price-down'}`}>
            {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {signal.type}
          </span>
          <span className="font-mono text-xs font-semibold">{signal.symbol}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${strengthClass}`}>
          {signal.strength}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mb-1.5">
        <div>
          <span className="text-muted-foreground block">Entry</span>
          <span className="font-semibold">{signal.entry}</span>
        </div>
        <div>
          <span className="text-muted-foreground block flex items-center gap-0.5"><Shield size={8} /> SL</span>
          <span className="text-bear font-semibold">{signal.stopLoss}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">TP1</span>
          <span className="text-bull font-semibold">{signal.takeProfit[0]}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Clock size={9} />{timeAgo}</span>
          <span>{signal.timeframe}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <AlertCircle size={9} className="text-muted-foreground" />
          <span className="font-semibold">{signal.confidence}%</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{signal.reason}</p>
    </motion.div>
  );
}

function getTimeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}
