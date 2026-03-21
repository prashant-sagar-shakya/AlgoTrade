import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, Minus, Plus } from 'lucide-react';

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
}

export default function OrderPanel({ symbol, currentPrice }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState(currentPrice.toFixed(2));
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span>Order</span>
        <span className="font-mono text-foreground normal-case">{symbol}</span>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex p-2 gap-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${side === 'buy' ? 'btn-buy' : 'bg-accent text-muted-foreground'}`}
        >
          <ArrowUpCircle size={14} className="inline mr-1" />BUY
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${side === 'sell' ? 'btn-sell' : 'bg-accent text-muted-foreground'}`}
        >
          <ArrowDownCircle size={14} className="inline mr-1" />SELL
        </motion.button>
      </div>

      {/* Order Type */}
      <div className="flex px-2 gap-1 mb-2">
        {(['market', 'limit'] as const).map(type => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${orderType === type ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-2 scrollbar-thin">
        {/* Price */}
        {orderType === 'limit' && (
          <Field label="Price">
            <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="order-input" />
          </Field>
        )}
        {orderType === 'market' && (
          <Field label="Price">
            <div className="order-input text-muted-foreground">Market</div>
          </Field>
        )}

        {/* Quantity */}
        <Field label="Quantity">
          <div className="flex items-center gap-1">
            <button onClick={() => setQuantity(String(Math.max(0, +quantity - 1)))} className="p-1 rounded hover:bg-accent"><Minus size={12} /></button>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} className="order-input text-center flex-1" />
            <button onClick={() => setQuantity(String(+quantity + 1))} className="p-1 rounded hover:bg-accent"><Plus size={12} /></button>
          </div>
        </Field>

        {/* SL/TP */}
        <Field label="Stop Loss">
          <input value={sl} onChange={e => setSl(e.target.value)} placeholder="Optional" className="order-input" />
        </Field>
        <Field label="Take Profit">
          <input value={tp} onChange={e => setTp(e.target.value)} placeholder="Optional" className="order-input" />
        </Field>

        {/* Summary */}
        <div className="text-xs space-y-1 pt-1 border-t border-panel">
          <div className="flex justify-between text-muted-foreground">
            <span>Est. Cost</span>
            <span className="font-mono tabular-nums">${(currentPrice * +quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Risk (1%)</span>
            <span className="font-mono tabular-nums">${(currentPrice * +quantity * 0.01).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="p-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={`w-full py-2.5 rounded-md text-sm font-semibold ${side === 'buy' ? 'btn-buy' : 'btn-sell'}`}
        >
          {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
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
