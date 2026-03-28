// Generate realistic OHLC candle data
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number[];
  confidence: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  timeframe: string;
  reason: string;
  timestamp: Date;
}

export const TIMEFRAMES = [
  { label: '1s', value: '1s', seconds: 1 },
  { label: '1m', value: '1m', seconds: 60 },
  { label: '3m', value: '3m', seconds: 180 },
  { label: '5m', value: '5m', seconds: 300 },
  { label: '15m', value: '15m', seconds: 900 },
  { label: '30m', value: '30m', seconds: 1800 },
  { label: '1H', value: '1h', seconds: 3600 },
  { label: '4H', value: '4h', seconds: 14400 },
  { label: '1D', value: '1D', seconds: 86400 },
  { label: '1W', value: '1W', seconds: 604800 },
  { label: '1M', value: '1M', seconds: 2592000 },
  { label: '6M', value: '6M', seconds: 15552000 },
] as const;

export function generateCandles(count: number, basePrice: number, intervalSeconds: number): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * intervalSeconds;

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.008;
    const trend = Math.sin(i / 30) * volatility * 0.5;
    const open = price;
    const change1 = (Math.random() - 0.48) * volatility + trend * 0.1;
    const change2 = (Math.random() - 0.48) * volatility + trend * 0.1;
    const close = open + change1;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(50000 + Math.random() * 200000 + Math.abs(change1) * 50000);

    candles.push({
      time: startTime + i * intervalSeconds,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return candles;
}

export const watchlistData: WatchlistItem[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 67842.50, change: 1247.30, changePercent: 1.87, volume: '28.4B' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 3542.18, change: -45.62, changePercent: -1.27, volume: '14.2B' },
  { symbol: 'NIFTY', name: 'Nifty 50', price: 22475.85, change: 156.40, changePercent: 0.70, volume: '1.8B' },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 48234.60, change: -312.75, changePercent: -0.64, volume: '890M' },
  { symbol: 'RELIANCE', name: 'Reliance Ind', price: 2847.35, change: 23.45, changePercent: 0.83, volume: '245M' },
  { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0847, change: 0.0023, changePercent: 0.21, volume: '6.2T' },
  { symbol: 'GOLD', name: 'Gold', price: 2342.80, change: 18.40, changePercent: 0.79, volume: '420M' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 189.84, change: -2.16, changePercent: -1.12, volume: '52.3M' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 248.42, change: 8.73, changePercent: 3.64, volume: '98.7M' },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 523.45, change: 3.21, changePercent: 0.62, volume: '67.1M' },
];

export const mockSignals: Signal[] = [
  {
    id: '1', symbol: 'BTCUSDT', type: 'BUY', entry: 67500, stopLoss: 66800, takeProfit: [68200, 69000, 70500],
    confidence: 85, strength: 'STRONG', timeframe: '4H',
    reason: 'Bullish engulfing at key support + MACD crossover + volume spike',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2', symbol: 'NIFTY', type: 'SELL', entry: 22500, stopLoss: 22650, takeProfit: [22350, 22200, 22000],
    confidence: 72, strength: 'MODERATE', timeframe: '15m',
    reason: 'Bearish divergence on RSI + rejection at resistance zone',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '3', symbol: 'ETHUSDT', type: 'BUY', entry: 3520, stopLoss: 3480, takeProfit: [3580, 3650],
    confidence: 58, strength: 'WEAK', timeframe: '1H',
    reason: 'EMA 20/50 crossover forming, waiting for volume confirmation',
    timestamp: new Date(Date.now() - 1800000),
  },
];

export interface IndicatorData {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  ema9: number;
  ema21: number;
  ema50: number;
  vwap: number;
  supertrend: { value: number; direction: 'up' | 'down' };
  atr: number;
  bollingerBands: { upper: number; middle: number; lower: number };
}

export function getMockIndicators(price: number): IndicatorData {
  return {
    rsi: 45 + Math.random() * 30,
    macd: { value: (Math.random() - 0.5) * 100, signal: (Math.random() - 0.5) * 80, histogram: (Math.random() - 0.5) * 40 },
    ema9: price * (1 + (Math.random() - 0.5) * 0.005),
    ema21: price * (1 + (Math.random() - 0.5) * 0.012),
    ema50: price * (1 + (Math.random() - 0.5) * 0.02),
    vwap: price * (1 + (Math.random() - 0.5) * 0.005),
    supertrend: { value: price * (1 + (Math.random() - 0.5) * 0.015), direction: Math.random() > 0.5 ? 'up' : 'down' },
    atr: price * 0.015 * (0.5 + Math.random()),
    bollingerBands: {
      upper: price * 1.02,
      middle: price,
      lower: price * 0.98,
    },
  };
}
export function getCurrencySymbol(symbol: string): string {
  if (!symbol) return '$';
  const upperSymbol = symbol.toUpperCase();
  const isIndian = upperSymbol.endsWith('.NS') || 
                   upperSymbol.endsWith('.BO') || 
                   upperSymbol.includes('NSEI') ||
                   upperSymbol.includes('BSESN') ||
                   upperSymbol.includes('NIFTY') ||
                   upperSymbol.includes('SENSEX') ||
                   upperSymbol.includes('NSEBANK') ||
                   upperSymbol.includes('BANKNIFTY');
  return isIndian ? '₹' : '$';
}
