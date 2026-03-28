import { motion } from 'framer-motion';
import { Briefcase, XCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { Position } from '@/lib/useTradingEngine';
import { getCurrencySymbol } from '@/lib/mockData';

interface PositionsPanelProps {
  positions: Position[];
  closePosition: (id: string, currentPrice: number) => void;
  currentPrice: number;
  balance: number;
  symbol?: string;
}

export default function PositionsPanel({ positions, closePosition, currentPrice, balance, symbol }: PositionsPanelProps) {
  const openPositions = positions.filter(p => p.status === 'OPEN');
  const closedPositions = positions.filter(p => p.status === 'CLOSED').slice(0, 10); // Last 10
  
  const totalRealizedPnl = positions.filter(p => p.status === 'CLOSED').reduce((s, p) => s + (p.realizedPnl || 0), 0);
  const totalUnrealizedPnl = openPositions.reduce((s, p) => {
    const cp = currentPrice; // Use current price for all (simplified)
    return s + (p.type === 'BUY' ? (cp - p.entryPrice) * p.quantity : (p.entryPrice - cp) * p.quantity);
  }, 0);
  const totalPnl = totalRealizedPnl + totalUnrealizedPnl;
  const marginUsed = openPositions.reduce((s, p) => s + p.entryPrice * p.quantity, 0);

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header flex justify-between items-center">
        <span className="flex items-center gap-1.5"><Briefcase size={12} /> Paper Trading</span>
      </div>
      
      {/* Wallet Summary */}
      <div className="p-2 border-b border-panel/50 space-y-2">
        <div className="bg-accent/30 rounded-lg p-3 border border-panel/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Demo Wallet</span>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{balance.toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Margin Used: ₹{marginUsed.toFixed(2)}</div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
          <div className="bg-accent/20 rounded p-1.5 border border-panel/20">
            <span className="text-muted-foreground block text-[9px] uppercase mb-0.5">Total P&L</span>
            <span className={`font-bold ${totalPnl >= 0 ? 'price-up' : 'price-down'}`}>
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
            </span>
          </div>
          <div className="bg-accent/20 rounded p-1.5 border border-panel/20">
            <span className="text-muted-foreground block text-[9px] uppercase mb-0.5">Realized</span>
            <span className={`font-bold ${totalRealizedPnl >= 0 ? 'price-up' : 'price-down'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}₹{totalRealizedPnl.toFixed(2)}
            </span>
          </div>
          <div className="bg-accent/20 rounded p-1.5 border border-panel/20">
            <span className="text-muted-foreground block text-[9px] uppercase mb-0.5">Open P&L</span>
            <span className={`font-bold ${totalUnrealizedPnl >= 0 ? 'price-up' : 'price-down'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}₹{totalUnrealizedPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        {/* Open Positions */}
        {openPositions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active ({openPositions.length})
            </span>
            {openPositions.map(pos => {
              const cur = getCurrencySymbol(pos.symbol);
              const pnl = pos.type === 'BUY' ? (currentPrice - pos.entryPrice) * pos.quantity : (pos.entryPrice - currentPrice) * pos.quantity;
              const pnlPct = ((pnl / (pos.entryPrice * pos.quantity)) * 100);
              const isProfit = pnl >= 0;

              return (
                <motion.div key={pos.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/40 rounded-md p-2.5 text-xs border border-panel/50">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold tracking-wider ${pos.type === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'}`}>
                        {pos.type}
                      </span>
                      <span className="font-mono font-bold text-foreground">{pos.symbol}</span>
                      <span className="text-muted-foreground text-[9px]">x{pos.quantity}</span>
                    </div>
                    <button onClick={() => closePosition(pos.id, currentPrice)} className="text-muted-foreground hover:text-bear transition-colors" title="Close Position"><XCircle size={14} /></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono">
                    <div className="text-muted-foreground">Entry: <span className="text-foreground">{cur}{pos.entryPrice.toFixed(2)}</span></div>
                    <div className="text-muted-foreground text-right">Now: <span className="text-foreground">{cur}{currentPrice.toFixed(2)}</span></div>
                    {pos.sl && <div className="text-bear">SL: {cur}{pos.sl.toFixed(2)}</div>}
                    {pos.tp && <div className="text-bull text-right">TP: {cur}{pos.tp.toFixed(2)}</div>}
                  </div>
                  
                  <div className="mt-1.5 pt-1.5 border-t border-panel/50 flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Unrealized P&L</span>
                    <span className={`font-mono font-bold flex items-center gap-1 ${isProfit ? 'price-up' : 'price-down'}`}>
                      {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isProfit ? '+' : ''}{cur}{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPct.toFixed(1)}%)
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {openPositions.length === 0 && (
          <div className="text-center text-xs text-muted-foreground mt-8 space-y-2">
            <Briefcase size={24} className="mx-auto opacity-30" />
            <p>No active positions</p>
            <p className="text-[10px]">Go to Order tab to place a trade</p>
          </div>
        )}

        {/* Closed Positions History */}
        {closedPositions.length > 0 && (
          <div className="space-y-1.5 mt-3 pt-2 border-t border-panel/30">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Recent Closed</span>
            {closedPositions.map(pos => {
              const cur = getCurrencySymbol(pos.symbol);
              const isProfit = (pos.realizedPnl || 0) >= 0;
              return (
                <div key={pos.id} className="bg-accent/20 rounded p-2 text-[10px] font-mono flex justify-between items-center border border-panel/20 opacity-70">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] font-bold ${pos.type === 'BUY' ? 'text-bull' : 'text-bear'}`}>{pos.type}</span>
                    <span className="text-foreground">{pos.symbol}</span>
                    <span className="text-muted-foreground">x{pos.quantity}</span>
                  </div>
                  <span className={`font-bold ${isProfit ? 'price-up' : 'price-down'}`}>
                    {isProfit ? '+' : ''}{cur}{(pos.realizedPnl || 0).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
