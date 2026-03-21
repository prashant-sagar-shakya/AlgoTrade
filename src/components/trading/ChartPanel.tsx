import { useEffect, useRef, useCallback, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, VolumeSeries, LineSeries } from 'lightweight-charts';
import { generateCandles, TIMEFRAMES } from '@/lib/mockData';
import TimeframeSelector from './TimeframeSelector';

interface ChartPanelProps {
  symbol: string;
  isDark: boolean;
}

export default function ChartPanel({ symbol, isDark }: ChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [crosshairData, setCrosshairData] = useState<{
    time: string; open: number; high: number; low: number; close: number; volume: number;
  } | null>(null);

  const getBasePrice = useCallback((sym: string) => {
    const prices: Record<string, number> = {
      BTCUSDT: 67842, ETHUSDT: 3542, NIFTY: 22475, BANKNIFTY: 48234,
      RELIANCE: 2847, EURUSD: 1.0847, GOLD: 2342, AAPL: 189, TSLA: 248, SPY: 523
    };
    return prices[sym] || 100;
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const container = chartRef.current;
    const bgColor = isDark ? '#0f1319' : '#ffffff';
    const textColor = isDark ? '#8b95a8' : '#6b7280';
    const gridColor = isDark ? 'rgba(42, 48, 66, 0.4)' : 'rgba(220, 225, 235, 0.6)';
    const borderColor = isDark ? '#1e2433' : '#e5e7eb';

    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: bgColor }, textColor, fontFamily: 'JetBrains Mono' },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor, scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: { borderColor, timeVisible: true, secondsVisible: timeframe === '1s' },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const tfConfig = TIMEFRAMES.find(t => t.value === timeframe);
    const seconds = tfConfig?.seconds || 86400;
    const candles = generateCandles(200, getBasePrice(symbol), seconds);

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: isDark ? '#22c55e' : '#16a34a',
      downColor: isDark ? '#ef4444' : '#dc2626',
      borderDownColor: isDark ? '#ef4444' : '#dc2626',
      borderUpColor: isDark ? '#22c55e' : '#16a34a',
      wickDownColor: isDark ? '#ef4444' : '#dc2626',
      wickUpColor: isDark ? '#22c55e' : '#16a34a',
    });
    candleSeries.setData(candles.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close })));

    const volumeSeries = chart.addSeries(VolumeSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    volumeSeries.setData(
      candles.map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open
          ? (isDark ? 'rgba(34,197,94,0.25)' : 'rgba(22,163,74,0.25)')
          : (isDark ? 'rgba(239,68,68,0.25)' : 'rgba(220,38,38,0.25)'),
      }))
    );

    // EMA 20 line
    const ema20Data = candles.map((c, i) => {
      if (i < 20) return null;
      const slice = candles.slice(i - 19, i + 1);
      const avg = slice.reduce((a, b) => a + b.close, 0) / 20;
      return { time: c.time as any, value: +avg.toFixed(2) };
    }).filter(Boolean) as any[];

    const emaSeries = chart.addSeries(LineSeries, {
      color: isDark ? '#3b82f6' : '#2563eb',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    emaSeries.setData(ema20Data);

    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const data = param.seriesData.get(candleSeries) as any;
        if (data) {
          setCrosshairData({
            time: new Date((param.time as number) * 1000).toLocaleString(),
            open: data.open, high: data.high, low: data.low, close: data.close,
            volume: 0,
          });
        }
      }
    });

    chart.timeScale().fitContent();
    chartInstanceRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, [symbol, isDark, timeframe, getBasePrice]);

  const lastCandle = crosshairData;

  return (
    <div className="trading-panel flex flex-col h-full">
      <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
      {/* OHLC overlay */}
      {lastCandle && (
        <div className="flex items-center gap-3 px-3 py-1 text-xs font-mono border-b border-panel">
          <span className="text-muted-foreground">O</span>
          <span className={lastCandle.close >= lastCandle.open ? 'price-up' : 'price-down'}>{lastCandle.open.toFixed(2)}</span>
          <span className="text-muted-foreground">H</span>
          <span className={lastCandle.close >= lastCandle.open ? 'price-up' : 'price-down'}>{lastCandle.high.toFixed(2)}</span>
          <span className="text-muted-foreground">L</span>
          <span className={lastCandle.close >= lastCandle.open ? 'price-up' : 'price-down'}>{lastCandle.low.toFixed(2)}</span>
          <span className="text-muted-foreground">C</span>
          <span className={lastCandle.close >= lastCandle.open ? 'price-up' : 'price-down'}>{lastCandle.close.toFixed(2)}</span>
        </div>
      )}
      <div ref={chartRef} className="flex-1 min-h-0" />
    </div>
  );
}
