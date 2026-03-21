import { motion } from 'framer-motion';
import { getMockIndicators } from '@/lib/mockData';
import { Activity, BarChart3, Zap } from 'lucide-react';

interface IndicatorsPanelProps {
  symbol: string;
  price: number;
}

export default function IndicatorsPanel({ symbol, price }: IndicatorsPanelProps) {
  const ind = getMockIndicators(price);
  const rsiColor = ind.rsi > 70 ? 'text-bear' : ind.rsi < 30 ? 'text-bull' : 'text-foreground';
  const macdBullish = ind.macd.histogram > 0;

  return (
    <div className="trading-panel h-full flex flex-col">
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5"><BarChart3 size={12} /> Indicators</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {/* RSI */}
        <IndicatorRow label="RSI (14)" value={ind.rsi.toFixed(1)} color={rsiColor}>
          <div className="w-full h-1.5 bg-accent rounded-full mt-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ind.rsi}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${ind.rsi > 70 ? 'bg-bear' : ind.rsi < 30 ? 'bg-bull' : 'bg-primary'}`}
            />
          </div>
        </IndicatorRow>

        {/* MACD */}
        <div className="bg-accent/50 rounded-md p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">MACD</span>
            <span className={`text-[10px] font-mono font-semibold ${macdBullish ? 'price-up' : 'price-down'}`}>
              {macdBullish ? '▲ Bullish' : '▼ Bearish'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            <div><span className="text-muted-foreground block">Line</span>{ind.macd.value.toFixed(2)}</div>
            <div><span className="text-muted-foreground block">Signal</span>{ind.macd.signal.toFixed(2)}</div>
            <div><span className="text-muted-foreground block">Hist</span>
              <span className={macdBullish ? 'price-up' : 'price-down'}>{ind.macd.histogram.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* EMAs */}
        <div className="bg-accent/50 rounded-md p-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Moving Averages</span>
          <div className="space-y-1 text-[10px] font-mono">
            <EMARow label="EMA 20" value={ind.ema20} price={price} />
            <EMARow label="EMA 50" value={ind.ema50} price={price} />
            <EMARow label="EMA 200" value={ind.ema200} price={price} />
          </div>
        </div>

        {/* VWAP */}
        <IndicatorRow label="VWAP" value={ind.vwap.toFixed(2)} color={price > ind.vwap ? 'price-up' : 'price-down'} />

        {/* Supertrend */}
        <IndicatorRow
          label="Supertrend"
          value={`${ind.supertrend.value.toFixed(2)} ${ind.supertrend.direction === 'up' ? '▲' : '▼'}`}
          color={ind.supertrend.direction === 'up' ? 'price-up' : 'price-down'}
        />

        {/* ATR */}
        <IndicatorRow label="ATR (14)" value={ind.atr.toFixed(2)} color="text-foreground" />

        {/* Bollinger */}
        <div className="bg-accent/50 rounded-md p-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Bollinger Bands</span>
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            <div><span className="text-muted-foreground block">Upper</span>{ind.bollingerBands.upper.toFixed(2)}</div>
            <div><span className="text-muted-foreground block">Mid</span>{ind.bollingerBands.middle.toFixed(2)}</div>
            <div><span className="text-muted-foreground block">Lower</span>{ind.bollingerBands.lower.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IndicatorRow({ label, value, color, children }: { label: string; value: string; color: string; children?: React.ReactNode }) {
  return (
    <div className="bg-accent/50 rounded-md p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-mono font-semibold ${color}`}>{value}</span>
      </div>
      {children}
    </div>
  );
}

function EMARow({ label, value, price }: { label: string; value: number; price: number }) {
  const above = price > value;
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={above ? 'price-up' : 'price-down'}>{value.toFixed(2)}</span>
    </div>
  );
}
