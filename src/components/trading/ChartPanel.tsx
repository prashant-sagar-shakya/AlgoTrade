import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { generateCandles, TIMEFRAMES, getCurrencySymbol, IndicatorData } from '@/lib/mockData';
import { fetchStockData } from '@/lib/yahooApi';
import type { Position } from '@/lib/useTradingEngine';
import TimeframeSelector from './TimeframeSelector';
import { BarChart2, Zap, Clock, X } from 'lucide-react';

interface ChartPanelProps {
  symbol: string;
  isDark: boolean;
  livePrice?: number; 
  onIndicatorUpdate?: (data: Partial<IndicatorData>) => void;
  positions?: Position[];
  onClosePosition?: (id: string, price: number) => void;
  // Lifted state from parent (persisted to DB)
  chartType: 'candle' | 'line';
  onChartTypeChange: (v: 'candle' | 'line') => void;
  timeframe: string;
  onTimeframeChange: (v: string) => void;
  showEMA9: boolean; onShowEMA9: (v: boolean) => void;
  showEMA21: boolean; onShowEMA21: (v: boolean) => void;
  showEMA50: boolean; onShowEMA50: (v: boolean) => void;
  showVWAP: boolean; onShowVWAP: (v: boolean) => void;
  showRSI: boolean; onShowRSI: (v: boolean) => void;
  showVolume: boolean; onShowVolume: (v: boolean) => void;
}

// --- Technical Indicator Calculations ---

function calcEMA(data: any[], period: number) {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  let ema = data[0].close;
  const out = [];
  for (let i = 0; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    if (i >= period - 1) out.push({ time: data[i].time, value: +ema.toFixed(2) });
  }
  return out;
}

function calcVWAP(data: any[]) {
  const out: any[] = [];
  let tpv = 0, vol = 0, lastDay: number | null = null;
  data.forEach(d => {
    const day = d.time ? new Date(d.time * 1000).getDate() : 0;
    if (day !== lastDay) { tpv = 0; vol = 0; lastDay = day; }
    const tp = (d.high + d.low + d.close) / 3;
    const v = d.volume || 1000;
    tpv += tp * v; vol += v;
    out.push({ time: d.time, value: +(tpv / vol).toFixed(2) });
  });
  return out;
}

function calcRSI(data: any[], period = 14) {
  if (data.length <= period) return [];
  const out: any[] = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const c = data[i].close - data[i - 1].close;
    if (c > 0) gains += c; else losses -= c;
  }
  let ag = gains / period, al = losses / period;
  for (let i = period + 1; i < data.length; i++) {
    const c = data[i].close - data[i - 1].close;
    ag = (ag * (period - 1) + (c > 0 ? c : 0)) / period;
    al = (al * (period - 1) + (c < 0 ? -c : 0)) / period;
    const rs = al === 0 ? 100 : ag / al;
    out.push({ time: data[i].time, value: +(100 - (100 / (1 + rs))).toFixed(2) });
  }
  return out;
}

function calcMACD(data: any[]) {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  if (ema12.length < 26) return { macd: [], signal: [], histogram: [] };
  
  const macdLine: any[] = [];
  const startIdx = ema12.length - ema26.length;
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push({ time: ema26[i].time, value: +(ema12[startIdx + i].value - ema26[i].value).toFixed(2) });
  }
  
  const k = 2 / (9 + 1);
  let ema = macdLine[0].value;
  const signalLine: any[] = [];
  const histogram: any[] = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    ema = (macdLine[i].value - ema) * k + ema;
    signalLine.push({ time: macdLine[i].time, value: +ema.toFixed(2) });
    histogram.push({ time: macdLine[i].time, value: +(macdLine[i].value - ema).toFixed(2) });
  }
  
  return { macd: macdLine, signal: signalLine, histogram };
}

function calcATR(data: any[], period = 14) {
  if (data.length < 2) return 0;
  const trs = data.slice(1).map((d, i) => {
    const prev = data[i];
    return Math.max(d.high - d.low, Math.abs(d.high - prev.close), Math.abs(d.low - prev.close));
  });
  const recent = trs.slice(-period);
  return +(recent.reduce((a, b) => a + b, 0) / recent.length).toFixed(2);
}

// --- Component ---

export default function ChartPanel({ 
  symbol, isDark, livePrice, onIndicatorUpdate, positions, onClosePosition,
  chartType, onChartTypeChange, timeframe, onTimeframeChange,
  showEMA9, onShowEMA9, showEMA21, onShowEMA21, showEMA50, onShowEMA50,
  showVWAP, onShowVWAP, showRSI, onShowRSI, showVolume, onShowVolume
}: ChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);
  const dataRef = useRef<any[]>([]);
  const ema9Ref = useRef<any>(null);
  const ema21Ref = useRef<any>(null);
  const ema50Ref = useRef<any>(null);
  const vwapRef = useRef<any>(null);
  const rsiRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  const dotRef = useRef<HTMLDivElement>(null);
  const [crosshairData, setCrosshairData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })), 1000);
    return () => clearInterval(t);
  }, []);

  // Chart creation
  useEffect(() => {
    if (!chartRef.current) return;
    const container = chartRef.current;
    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: isDark ? '#0f1319' : '#fff' }, textColor: isDark ? '#8b95a8' : '#6b7280', fontFamily: 'JetBrains Mono' },
      grid: { vertLines: { color: isDark ? 'rgba(42,48,66,0.4)' : 'rgba(220,225,235,0.6)' }, horzLines: { color: isDark ? 'rgba(42,48,66,0.4)' : 'rgba(220,225,235,0.6)' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? '#1e2433' : '#e5e7eb', scaleMargins: { top: 0.08, bottom: 0.3 } },
      timeScale: { borderColor: isDark ? '#1e2433' : '#e5e7eb', timeVisible: true, secondsVisible: timeframe === '1s' },
      localization: { 
        timeFormatter: (time: any) => {
          const d = new Date(time * 1000);
          return timeframe.includes('D') || timeframe.includes('W') || timeframe.includes('M') 
            ? d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })
            : d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
        }
      },
      width: container.clientWidth, height: container.clientHeight,
    });

    const mainSeries = chartType === 'candle'
      ? chart.addSeries(CandlestickSeries, { priceFormat: { type: 'price', precision: 2, minMove: 0.01 } })
      : chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, priceFormat: { type: 'price', precision: 2, minMove: 0.01 } });
    seriesRef.current = mainSeries;

    const volSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'vol' });
    volumeRef.current = volSeries;
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.78, bottom: 0 }, visible: false });

    ema9Ref.current = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'EMA9' });
    ema21Ref.current = chart.addSeries(LineSeries, { color: '#f5a623', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'EMA21' });
    ema50Ref.current = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, title: 'EMA50' });
    vwapRef.current = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, title: 'VWAP' });
    rsiRef.current = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 2, priceScaleId: 'rsi', title: 'RSI' });
    chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.88, bottom: 0 }, borderVisible: true });

    (async () => {
      const TF: Record<string, {i: string, r: string}> = {
        '1s': {i:'1m', r:'1d'}, '1m': {i:'1m', r:'1d'}, '3m': {i:'1m', r:'1d'},
        '5m': {i:'5m', r:'2d'}, '15m': {i:'15m', r:'5d'}, '30m': {i:'30m', r:'10d'},
        '1h': {i:'60m', r:'30d'}, '4h': {i:'60m', r:'90d'}, '1D': {i:'1d', r:'max'},
        '1W': {i:'1wk', r:'max'}, '1M': {i:'1mo', r:'max'}, '6M': {i:'1mo', r:'max'}
      };
      const tf = TF[timeframe] || {i:'1d', r:'2y'};
      let data = await fetchStockData(symbol, tf.i, tf.r);
      const tfSec = TIMEFRAMES.find(t => t.value === timeframe)?.seconds || 86400;
      if (!data || data.length === 0) data = generateCandles(500, livePrice || 100, tfSec);
      data = data.map(c => ({ ...c, open: +c.open.toFixed(2), high: +c.high.toFixed(2), low: +c.low.toFixed(2), close: +c.close.toFixed(2) }));
      dataRef.current = data;

      mainSeries.setData(chartType === 'candle' ? data as any : data.map(c => ({ time: c.time, value: c.close })) as any);
      if (showVolume) volSeries.setData(data.map(c => ({ time: c.time, value: c.volume || 1000, color: c.close >= c.open ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' })) as any);
      else volSeries.setData([]);
      if (showEMA9) ema9Ref.current.setData(calcEMA(data, 9) as any); else ema9Ref.current.setData([]);
      if (showEMA21) ema21Ref.current.setData(calcEMA(data, 21) as any); else ema21Ref.current.setData([]);
      if (showEMA50) ema50Ref.current.setData(calcEMA(data, 50) as any); else ema50Ref.current.setData([]);
      if (showVWAP) vwapRef.current.setData(calcVWAP(data) as any); else vwapRef.current.setData([]);
      if (showRSI) rsiRef.current.setData(calcRSI(data) as any); else rsiRef.current.setData([]);
      chart.timeScale().fitContent();
    })();

    chartInstanceRef.current = chart;
    const ro = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth, height: container.clientHeight }));
    ro.observe(container);
    const updateDot = () => {
      const series = seriesRef.current;
      const dot = dotRef.current;
      if (!series || !chart || !dot || !dataRef.current.length) return;
      const last = dataRef.current[dataRef.current.length - 1];
      try {
        const x = chart.timeScale().timeToCoordinate(last.time);
        const y = series.priceToCoordinate(last.close);
        if (x !== null && y !== null) {
          dot.style.display = 'block';
          dot.style.left = `${x}px`;
          dot.style.top = `${y}px`;
        } else {
          dot.style.display = 'none';
        }
      } catch { dot.style.display = 'none'; }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(updateDot);
    
    chart.subscribeCrosshairMove(param => {
      if (param.time) {
        const d = param.seriesData.get(mainSeries) as any;
        if (d) setCrosshairData({ time: new Date((param.time as number) * 1000).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) + ' (IST)', open: d.open || 0, high: d.high || 0, low: d.low || 0, close: d.close || d.value || 0 });
      }
    });
    return () => { 
      ro.disconnect(); 
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(updateDot);
      chart.remove(); 
      chartInstanceRef.current = null; 
    };
  }, [symbol, isDark, timeframe, chartType, showEMA9, showEMA21, showEMA50, showVWAP, showRSI, showVolume]);

  // UPDATE DOT POSITION EXTERNALLY WHEN PRICE CHANGES
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartInstanceRef.current;
    const dot = dotRef.current;
    if (series && chart && dot && dataRef.current.length > 0) {
      const last = dataRef.current[dataRef.current.length - 1];
      try {
        const x = chart.timeScale().timeToCoordinate(last.time);
        const y = series.priceToCoordinate(last.close);
        if (x !== null && y !== null) {
          dot.style.display = 'block';
          dot.style.left = `${x}px`;
          dot.style.top = `${y}px`;
        }
      } catch { dot.style.display = 'none'; }
    }
  }, [livePrice, chartType]);

  // TRADE MARKERS
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    priceLinesRef.current.forEach(l => { try { series.removePriceLine(l); } catch {} });
    priceLinesRef.current = [];

    const openPos = (positions || []).filter(p => p.status === 'OPEN' && p.symbol === symbol);
    openPos.forEach(pos => {
      priceLinesRef.current.push(series.createPriceLine({
        price: pos.entryPrice,
        color: pos.type === 'BUY' ? '#22c55e' : '#ef4444',
        lineWidth: 1, lineStyle: 3, axisLabelVisible: true,
        title: `${pos.type} ${pos.entryPrice.toFixed(2)}`,
      }));
      if (pos.sl) {
        priceLinesRef.current.push(series.createPriceLine({
          price: pos.sl, color: '#ef4444', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `SL`,
        }));
      }
      if (pos.tp) {
        priceLinesRef.current.push(series.createPriceLine({
          price: pos.tp, color: '#22c55e', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `TP`,
        }));
      }
    });
  }, [positions, symbol]);

  // LIVE PRICE UPDATER
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartInstanceRef.current;
    if (!series || !chart || !dataRef.current.length || !livePrice || livePrice <= 0) return;

    const tfSec = TIMEFRAMES.find(t => t.value === timeframe)?.seconds || 86400;
    const last = dataRef.current[dataRef.current.length - 1];
    const now = Math.floor(Date.now() / 1000);
    const p = +(livePrice.toFixed(2));

    if (now >= last.time + tfSec) {
      const nc = { time: last.time + tfSec, open: last.close, high: p, low: p, close: p, volume: 1000 + Math.floor(Math.random() * 5000) };
      dataRef.current.push(nc);
      if (chartType === 'candle') series.update(nc); else series.update({ time: nc.time, value: nc.close });
      if (showVolume) volumeRef.current?.update({ time: nc.time, value: nc.volume, color: 'rgba(59,130,246,0.25)' });
      if (dataRef.current.length > 1200) dataRef.current.shift();
    } else {
      last.close = p; last.high = Math.max(last.high, p); last.low = Math.min(last.low, p);
      if (chartType === 'candle') series.update({ time: last.time, open: last.open, high: last.high, low: last.low, close: last.close });
      else series.update({ time: last.time, value: last.close });
    }

    const e9 = calcEMA(dataRef.current, 9), e21 = calcEMA(dataRef.current, 21), e50 = calcEMA(dataRef.current, 50);
    const rsi = calcRSI(dataRef.current), vwap = calcVWAP(dataRef.current);
    const macdData = calcMACD(dataRef.current);
    const atr = calcATR(dataRef.current);

    if (showEMA9 && e9.length) ema9Ref.current?.update(e9[e9.length-1]);
    if (showEMA21 && e21.length) ema21Ref.current?.update(e21[e21.length-1]);
    if (showEMA50 && e50.length) ema50Ref.current?.update(e50[e50.length-1]);
    if (showVWAP && vwap.length) vwapRef.current?.update(vwap[vwap.length-1]);
    if (showRSI && rsi.length) rsiRef.current?.update(rsi[rsi.length-1]);

    onIndicatorUpdate?.({
      ema9: e9.length ? e9[e9.length-1].value : 0, 
      ema21: e21.length ? e21[e21.length-1].value : 0,
      ema50: e50.length ? e50[e50.length-1].value : 0, 
      rsi: rsi.length ? rsi[rsi.length-1].value : 50,
      vwap: vwap.length ? vwap[vwap.length-1].value : p,
      macd: {
        value: macdData.macd.length ? macdData.macd[macdData.macd.length-1].value : 0,
        signal: macdData.signal.length ? macdData.signal[macdData.signal.length-1].value : 0,
        histogram: macdData.histogram.length ? macdData.histogram[macdData.histogram.length-1].value : 0
      },
      atr,
      bollingerBands: { upper: p * 1.02, middle: p, lower: p * 0.98 }
    });

  }, [livePrice]);


  const currency = getCurrencySymbol(symbol);
  const ohlc = crosshairData;

  const openPos = (positions || []).filter(p => p.status === 'OPEN' && p.symbol === symbol);
  const hasPnl = openPos.length > 0 && livePrice;

  return (
    <div className="trading-panel flex flex-col h-full overflow-hidden relative">
      <div className="flex items-center px-3 py-1.5 border-b border-panel/50 bg-accent/5 shrink-0 gap-2 overflow-x-auto no-scrollbar">
         <TimeframeSelector selected={timeframe} onSelect={onTimeframeChange} />
         <div className="h-4 w-px bg-panel/40" />
         <button onClick={() => onChartTypeChange(chartType === 'candle' ? 'line' : 'candle')} className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 flex items-center gap-1 active:scale-95 transition-all shrink-0">
            {chartType === 'candle' ? <><BarChart2 size={11} /> Line</> : <><Zap size={11} /> Candle</>}
         </button>
         <div className="h-4 w-px bg-panel/40" />
         <Tog label="EMA9" on={showEMA9} set={onShowEMA9} />
         <Tog label="EMA21" on={showEMA21} set={onShowEMA21} />
         <Tog label="EMA50" on={showEMA50} set={onShowEMA50} />
         <Tog label="VWAP" on={showVWAP} set={onShowVWAP} />
         <Tog label="RSI" on={showRSI} set={onShowRSI} />
         <Tog label="VOL" on={showVolume} set={onShowVolume} />

         {hasPnl && (
           <>
             <div className="flex-1" />
             <div className="h-4 w-px bg-panel/40" />
             {openPos.map(pos => {
               const cp = livePrice || 0;
               const pnl = pos.type === 'BUY' ? (cp - pos.entryPrice) * pos.quantity : (pos.entryPrice - cp) * pos.quantity;
               const isProfit = pnl >= 0;
               return (
                 <div key={pos.id} className={`flex items-center gap-1.5 px-2 py-0.5 rounded border shrink-0 text-[10px] font-mono font-bold ${isProfit ? 'bg-bull/10 border-bull/30 text-bull' : 'bg-bear/10 border-bear/30 text-bear'}`}>
                   <span className="text-[8px] opacity-70">{pos.type}</span>
                   <span>{isProfit ? '+' : ''}{currency}{pnl.toFixed(2)}</span>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onClosePosition?.(pos.id, cp); }}
                     className="ml-0.5 p-0.5 rounded hover:bg-background/50 transition-colors" 
                     title="Close Position"
                   >
                     <X size={10} />
                   </button>
                 </div>
               );
             })}
           </>
         )}
      </div>

      {ohlc && (
        <div className="flex items-center gap-4 px-3 py-1 text-[10px] font-mono border-b border-panel bg-background/30 shrink-0">
          <span className="text-primary font-bold">{ohlc.time}</span>
          <span className="text-muted-foreground">O <span className={ohlc.close >= ohlc.open ? 'price-up' : 'price-down'}>{currency}{ohlc.open.toFixed(2)}</span></span>
          <span className="text-muted-foreground">H <span className={ohlc.close >= ohlc.open ? 'price-up' : 'price-down'}>{currency}{ohlc.high.toFixed(2)}</span></span>
          <span className="text-muted-foreground">L <span className={ohlc.close >= ohlc.open ? 'price-up' : 'price-down'}>{currency}{ohlc.low.toFixed(2)}</span></span>
          <span className="text-muted-foreground">C <span className={ohlc.close >= ohlc.open ? 'price-up' : 'price-down'}>{currency}{ohlc.close.toFixed(2)}</span></span>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full relative">
        <div ref={chartRef} className="w-full h-full" />
        {/* Animated dot at the current price point — only visible on line chart */}
        <div 
           ref={dotRef}
           className="absolute pointer-events-none z-10" 
           style={{ display: 'none', transform: 'translate(-50%, -50%)', opacity: chartType === 'line' ? 1 : 0 }}
        >
           <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] z-20 border border-white/40" />
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-[2px] z-10 animate-pulse" />
              <div className="absolute inset-[-4px] border border-primary/20 rounded-full animate-ping [animation-duration:1.5s]" />
              <div className="absolute inset-[-8px] border border-primary/10 rounded-full animate-ping [animation-duration:2s] [animation-delay:400ms]" />
           </div>
        </div>
      </div>

      <div className="h-6 border-t border-panel/50 px-3 flex items-center justify-between bg-background/80 shrink-0">
         <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground">
            <div className={`w-1.5 h-1.5 rounded-full ${livePrice ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /> 
            {livePrice ? `LIVE · ${currency}${livePrice.toFixed(2)}` : 'CONNECTING...'}
         </div>
         <div className="text-[10px] font-mono font-bold flex items-center gap-1.5 opacity-70">
            <Clock size={10} /> {currentTime}
         </div>
      </div>
    </div>
  );
}

function Tog({ label, on, set }: { label: string, on: boolean, set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all shrink-0 ${on ? 'bg-primary/15 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground border border-transparent'}`}>
      {label}
    </button>
  );
}
