import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Target, Shield, Zap } from 'lucide-react';
import { IndicatorData } from '@/lib/mockData';

interface SignalPanelProps {
  symbol: string;
  price: number;
  indicators: Partial<IndicatorData> | null;
}

export default function SignalPanel({ symbol, price, indicators }: SignalPanelProps) {
  // Real-time Signal Logic
  const getSignal = () => {
    if (!indicators) return null;
    
    const { rsi = 50, ema9 = 0, ema21 = 0, ema50 = 0 } = indicators;
    
    let type: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    let strength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK';
    let reason = "Analyzing market structure...";
    let confidence = 50;

    // RSI Logic
    if (rsi < 30) {
      type = 'BUY';
      strength = 'STRONG';
      reason = "Oversold conditions (RSI < 30). Potential bullish reversal.";
      confidence = 85;
    } else if (rsi > 70) {
      type = 'SELL';
      strength = 'STRONG';
      reason = "Overbought conditions (RSI > 70). Potential bearish correction.";
      confidence = 82;
    } else if (ema9 > ema21 && price > ema9) {
      type = 'BUY';
      strength = 'MODERATE';
      reason = "Bullish momentum: Fast EMA (9) above Slow EMA (21) and price holding above EMA 9.";
      confidence = 75;
    } else if (ema9 < ema21 && price < ema9) {
      type = 'SELL';
      strength = 'MODERATE';
      reason = "Bearish momentum: Fast EMA (9) below Slow EMA (21) and price below EMA 9.";
      confidence = 72;
    }

    const sl = type === 'BUY' ? price * 0.99 : price * 1.01;
    const tp = type === 'BUY' ? price * 1.02 : price * 0.98;

    return { type, strength, reason, confidence, sl, tp };
  };

  const signal = getSignal();

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5"><Target size={12} /> AI Intelligence</span>
        <span className="text-[10px] text-bull animate-pulse flex items-center gap-1">
          <Zap size={10} /> Real-time
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {!signal || signal.type === 'NEUTRAL' ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <Target size={32} className="text-muted-foreground animate-spin-slow" />
            <div className="space-y-1">
              <p className="text-xs font-bold font-mono">SCANNING {symbol}</p>
              <p className="text-[10px] text-muted-foreground">Waiting for clear price action setup...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border p-4 space-y-4 ${
              signal.type === 'BUY' 
                ? 'bg-bull/5 border-bull/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                : 'bg-bear/5 border-bear/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  signal.type === 'BUY' ? 'bg-bull text-bull-foreground' : 'bg-bear text-bear-foreground'
                }`}>
                  {signal.type} SIGNAL
                </span>
                <h4 className="text-lg font-bold font-mono">{symbol}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block uppercase">Confidence</span>
                <span className="text-sm font-bold font-mono text-primary">{signal.confidence}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/40 rounded-lg p-2 border border-panel/50">
                <span className="text-[9px] text-muted-foreground uppercase block mb-1">Entry Price</span>
                <span className="text-xs font-bold font-mono">₹{price.toFixed(2)}</span>
              </div>
              <div className="bg-background/40 rounded-lg p-2 border border-panel/50">
                <span className="text-[9px] text-muted-foreground uppercase block mb-1">Strength</span>
                <span className={`text-xs font-bold uppercase ${
                  signal.strength === 'STRONG' ? 'text-primary' : 'text-foreground'
                }`}>{signal.strength}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bear/10 rounded-lg p-2 border border-bear/20">
                <span className="text-[9px] text-bear uppercase block mb-1 flex items-center gap-1">
                   <Shield size={8} /> Stop Loss
                </span>
                <span className="text-xs font-bold font-mono text-bear">₹{signal.sl.toFixed(2)}</span>
              </div>
              <div className="bg-bull/10 rounded-lg p-2 border border-bull/20">
                <span className="text-[9px] text-bull uppercase block mb-1">Take Profit</span>
                <span className="text-xs font-bold font-mono text-bull">₹{signal.tp.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-panel/50">
               <p className="text-[10px] text-muted-foreground leading-relaxed italic flex gap-2">
                 <AlertCircle size={12} className="shrink-0 mt-0.5" />
                 {signal.reason}
               </p>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-muted-foreground opacity-70">
              <Clock size={10} />
              <span>Generated just now based on live technicals</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
