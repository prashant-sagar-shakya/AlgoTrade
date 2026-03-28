import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, Minus, Plus } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/mockData';
import type { useTradingEngine } from '@/lib/useTradingEngine';

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
  engine: ReturnType<typeof useTradingEngine>;
}

export default function OrderPanel({ symbol, currentPrice, engine }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  const currency = getCurrencySymbol(symbol);

  // Keep limit price in sync with current price
  useEffect(() => {
    if (orderType === 'limit' && !limitPrice) {
      setLimitPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType]);

  const submitOrder = () => {
    const qty = parseFloat(quantity) || 1;
    const price = orderType === 'limit' ? parseFloat(limitPrice) : currentPrice;
    if (price <= 0 || qty <= 0) return;
    engine.placeOrder(
      symbol, 
      side.toUpperCase() as any, 
      price, 
      qty, 
      sl ? parseFloat(sl) : null, 
      tp ? parseFloat(tp) : null
    );
  };

  // Active positions for this symbol
  const activePositions = engine.positions.filter(p => p.symbol === symbol && p.status === 'OPEN');

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span>Order</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-foreground bg-accent/50 px-2 py-0.5 rounded">{symbol}</span>
          <span className="font-mono text-[10px] text-primary font-bold">{currency}{currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex p-2 gap-1">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSide('buy')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${side === 'buy' ? 'btn-buy' : 'bg-accent text-muted-foreground'}`}>
          <ArrowUpCircle size={14} className="inline mr-1" />BUY
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSide('sell')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${side === 'sell' ? 'btn-sell' : 'bg-accent text-muted-foreground'}`}>
          <ArrowDownCircle size={14} className="inline mr-1" />SELL
        </motion.button>
      </div>

      {/* Order Type */}
      <div className="flex px-2 gap-1 mb-2">
        {(['market', 'limit'] as const).map(type => (
          <button key={type} onClick={() => setOrderType(type)}
            className={`flex-1 py-1 text-[10px] uppercase rounded font-medium transition-colors ${orderType === type ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-2 scrollbar-thin">
        {orderType === 'limit' ? (
          <Field label="Target Price">
            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="order-input" step="0.01" />
          </Field>
        ) : (
          <Field label="Execution Price (Live)">
            <div className="order-input text-foreground font-bold animate-pulse">{currency}{currentPrice.toFixed(2)}</div>
          </Field>
        )}

        <Field label="Quantity">
          <div className="flex items-center gap-1">
            <button onClick={() => setQuantity(String(Math.max(1, +quantity - 1)))} className="p-1 rounded hover:bg-accent"><Minus size={12} /></button>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="order-input text-center flex-1" min="1" step="1" />
            <button onClick={() => setQuantity(String(+quantity + 1))} className="p-1 rounded hover:bg-accent"><Plus size={12} /></button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Stop Loss">
            <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="0.00" className="order-input" step="0.01" />
          </Field>
          <Field label="Take Profit">
            <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="0.00" className="order-input" step="0.01" />
          </Field>
        </div>

        {/* Summary */}
        <div className="text-[10px] space-y-1.5 pt-2 mt-2 border-t border-panel">
          <div className="flex justify-between text-muted-foreground">
            <span>Required Margin</span>
            <span className="font-mono tabular-nums text-foreground font-bold">{currency}{(currentPrice * (+quantity || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Available Balance</span>
            <span className="font-mono tabular-nums text-foreground">{currency}{engine.balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Active Positions with Real-time P&L */}
        {activePositions.length > 0 && (
          <div className="pt-2 mt-2 border-t border-panel space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Open Positions</span>
            {activePositions.map(pos => {
              const pnl = pos.type === 'BUY' 
                ? (currentPrice - pos.entryPrice) * pos.quantity 
                : (pos.entryPrice - currentPrice) * pos.quantity;
              const pnlPct = ((pnl / (pos.entryPrice * pos.quantity)) * 100);
              const isProfit = pnl >= 0;
              return (
                <div key={pos.id} className="bg-accent/30 rounded-md p-2 border border-panel/30">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`font-bold ${pos.type === 'BUY' ? 'text-bull' : 'text-bear'}`}>{pos.type} x{pos.quantity}</span>
                    <span className={`font-mono font-bold ${isProfit ? 'text-bull' : 'text-bear'}`}>
                      {isProfit ? '+' : ''}{currency}{pnl.toFixed(2)} ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>Entry: {currency}{pos.entryPrice.toFixed(2)}</span>
                    <span>Now: {currency}{currentPrice.toFixed(2)}</span>
                  </div>
                  {(pos.sl || pos.tp) && (
                    <div className="flex gap-3 text-[9px] mt-1">
                      {pos.sl && <span className="text-bear">SL: {currency}{pos.sl.toFixed(2)}</span>}
                      {pos.tp && <span className="text-bull">TP: {currency}{pos.tp.toFixed(2)}</span>}
                    </div>
                  )}
                  <button onClick={() => engine.closePosition(pos.id, currentPrice)} 
                    className="w-full mt-1.5 py-1 text-[9px] font-bold uppercase bg-accent hover:bg-accent/80 rounded border border-panel/50 transition-colors">
                    Close Position
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="p-2 border-t border-panel">
        <motion.button onClick={submitOrder} whileTap={{ scale: 0.97 }}
          className={`w-full py-2.5 rounded-md text-sm font-semibold tracking-wide ${side === 'buy' ? 'btn-buy shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'btn-sell shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
          {side === 'buy' ? 'Execute Buy' : 'Execute Sell'}
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}
