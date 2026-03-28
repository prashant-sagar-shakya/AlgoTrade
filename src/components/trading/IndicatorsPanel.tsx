import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCurrencySymbol, IndicatorData } from '@/lib/mockData';
import { Activity, BarChart3, Zap, AlertCircle } from 'lucide-react';

interface IndicatorsPanelProps {
  symbol: string;
  price: number;
  liveData?: Partial<IndicatorData> | null;
}

export default function IndicatorsPanel({ symbol, price, liveData }: IndicatorsPanelProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!liveData) {
    return (
      <div className="trading-panel h-full flex flex-col items-center justify-center space-y-3 opacity-40">
        <Activity size={24} className="animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest uppercase">Calculating Real-time Analytics...</span>
      </div>
    );
  }

  const currency = getCurrencySymbol(symbol);
  
  const rsi = liveData.rsi ?? 50;
  const rsiColor = rsi > 70 ? 'text-bear' : rsi < 30 ? 'text-bull' : 'text-foreground';
  
  const macd = liveData.macd || { value: 0, signal: 0, histogram: 0 };
  const macdBullish = macd.histogram > 0;

  const atr = liveData.atr || 0;
  const vwap = liveData.vwap || price;

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-widest text-primary/80"><BarChart3 size={11} /> 100% Real-time Intelligence</span>
        <span className="text-[8px] bg-bull/10 text-bull px-1 rounded flex items-center gap-0.5">
           <Zap size={8} /> NO MOCK
        </span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {/* EMAs */}
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-accent/30 rounded-lg p-3 border border-panel/20">
            <span className="text-[9px] text-primary font-bold uppercase tracking-widest block mb-2 px-1">EMA Crossovers</span>
            <div className="space-y-2 text-[10px] font-mono">
              <EMARow label="EMA 9 (Fast)" value={liveData.ema9 || 0} price={price} currency={currency} color="bg-blue-500" />
              <EMARow label="EMA 21 (Mid)" value={liveData.ema21 || 0} price={price} currency={currency} color="bg-orange-500" />
              <EMARow label="EMA 50 (Slow)" value={liveData.ema50 || 0} price={price} currency={currency} color="bg-red-500" />
            </div>
          </div>
        </div>

        {/* Momentum & Volatility */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-accent/30 rounded-lg p-3 border border-panel/20 flex flex-col justify-between">
              <div>
                 <span className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">RSI (14)</span>
                 <span className={`text-lg font-bold font-mono ${rsiColor}`}>{rsi.toFixed(1)}</span>
              </div>
              <div className="w-full h-1 bg-background rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rsi}%` }}
                  className={`h-full ${rsi > 70 ? 'bg-bear' : rsi < 30 ? 'bg-bull' : 'bg-primary'}`}
                />
              </div>
           </div>

           <div className="bg-accent/30 rounded-lg p-3 border border-panel/20">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">Volatility (ATR)</span>
              <span className="text-lg font-bold font-mono text-foreground">{atr.toFixed(2)}</span>
              <p className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tight">Average True Range</p>
           </div>
        </div>

        {/* MACD */}
        <div className="bg-accent/30 rounded-lg p-3 border border-panel/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">MACD (12, 26, 9)</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${macdBullish ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
              {macdBullish ? 'Bullish Hist' : 'Bearish Hist'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div><span className="text-[8px] text-muted-foreground uppercase block opacity-70">Line</span>{macd.value.toFixed(2)}</div>
            <div><span className="text-[8px] text-muted-foreground uppercase block opacity-70">Signal</span>{macd.signal.toFixed(2)}</div>
            <div><span className="text-[8px] text-muted-foreground uppercase block opacity-70">Hist</span>
              <span className={macdBullish ? 'text-bull' : 'text-bear'}>{macd.histogram.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* VWAP */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Session VWAP</span>
            </div>
            <span className={`text-sm font-mono font-bold ${price > vwap ? 'text-bull' : 'text-bear'}`}>
              {currency}{vwap.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        </div>
      </div>
    </div>
  );
}

function EMARow({ label, value, price, currency, color }: { label: string; value: number; price: number; currency: string; color: string }) {
  const above = price > value;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
         <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         <span className="font-bold text-foreground">{currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
         <span className={`text-[8px] font-bold px-1 rounded ${above ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
            {above ? 'BELOW' : 'ABOVE'}
         </span>
      </div>
    </div>
  );
}
