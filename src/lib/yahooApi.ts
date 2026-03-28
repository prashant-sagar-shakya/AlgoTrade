// A utility to fetch real data from Yahoo Finance via a generic CORS proxy.
export interface RealChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const PROXY_URL = '/api/yahoo?url='; 

export async function fetchStockData(symbol: string, interval: string = '1d', range: string = '1y'): Promise<RealChartData[]> {
  try {
     const targetUrl = encodeURIComponent(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`);
     const response = await fetch(`${PROXY_URL}${targetUrl}`, { cache: 'no-store' });
     const data = await response.json();
    
    if (!data.chart.result) return [];
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators.quote[0];
    
    return timestamps.map((timestamp: number, index: number) => ({
      time: timestamp,
      open: quote.open[index] ?? 0,
      high: quote.high[index] ?? 0,
      low: quote.low[index] ?? 0,
      close: quote.close[index] ?? 0,
      volume: quote.volume[index] ?? 0,
    })).filter((c: RealChartData) => c.close > 0);
  } catch {
    return [];
  }
}

export async function fetchQuote(symbol: string) {
  try {
    const targetUrl = encodeURIComponent(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
    const response = await fetch(`${PROXY_URL}${targetUrl}`, { cache: 'no-store' });
    const data = await response.json();
    if (!data.chart || !data.chart.result) return null;
    const res = data.chart.result[0];
    const meta = res.meta;
    
    const currentPrice = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = currentPrice - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    
    const isCrypto = symbol.includes('-USD') || symbol.includes('USDT');
    const isMarketOpen = isCrypto || ((Math.floor(Date.now() / 1000) - meta.regularMarketTime) < 1800);
    
    return {
      symbol: symbol,
      name: meta.shortName || symbol,
      price: currentPrice || 0,
      change: change || 0,
      changePercent: isFinite(changePercent) ? changePercent : 0,
      currency: meta.currency || (symbol.includes('USDT') ? 'USD' : 'INR'),
      isMarketOpen
    };
  } catch (e) {
    return null;
  }
}

export async function searchSymbols(query: string) {
  try {
    const targetUrl = encodeURIComponent(`https://query2.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=5`);
    const response = await fetch(`${PROXY_URL}${targetUrl}`, { cache: 'no-store' });
    const data = await response.json();
    return data.quotes || [];
  } catch {
    return [];
  }
}

export async function fetchNews(symbol: string = 'AAPL') {
  try {
    const targetUrl = encodeURIComponent(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=10`);
    const response = await fetch(`${PROXY_URL}${targetUrl}`, { cache: 'no-store' });
    const data = await response.json();
    return data.news || [];
  } catch {
    return [];
  }
}
