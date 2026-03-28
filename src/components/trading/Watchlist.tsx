import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Star, TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { fetchQuote, searchSymbols } from '@/lib/yahooApi';
import { getCurrencySymbol } from '@/lib/mockData';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  isMarketOpen?: boolean;
}

interface WatchlistProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string, price?: number) => void;
  userId?: string | null;
  livePrice?: number; // Pass current live price from parent to show immediate updates
  onItemsChange?: (items: WatchlistItem[]) => void;
}

export default function Watchlist({ selectedSymbol, onSelectSymbol, userId, livePrice, onItemsChange }: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialLoadRef = useRef(false);

  // Initial load from MongoDB or defaults
  useEffect(() => {
    async function loadWatchlist() {
      setLoading(true);
      let symbols = ['BTC-USD', 'ETH-USD', 'RELIANCE.NS', 'AAPL', 'TSLA', 'EURUSD=X', 'GC=F'];
      
      if (userId) {
        try {
          const res = await fetch('/api/user', { headers: { 'x-user-id': userId } });
          const userDoc = await res.json();
          if (userDoc?.watchlist && userDoc.watchlist.length > 0) {
            symbols = userDoc.watchlist;
          }
        } catch (e) {}
      }

      const quotes = await Promise.all(
        symbols.map(async (s) => {
          const q = await fetchQuote(s);
          if (q) return { ...q, price: q.price, change: q.change, changePercent: q.changePercent };
          return null;
        })
      );

      setItems(quotes.filter(q => q !== null) as WatchlistItem[]);
      setLoading(false);
      initialLoadRef.current = true;
    }
    loadWatchlist();
  }, [userId]);

  const itemsRef = useRef<WatchlistItem[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const refreshQuotes = useCallback(async () => {
    if (itemsRef.current.length === 0) return;
    setIsRefreshing(true);
    try {
      const updated = await Promise.all(
        itemsRef.current.map(async (item) => {
          const quote = await fetchQuote(item.symbol);
          if (quote) return { ...item, price: quote.price, change: quote.change, changePercent: quote.changePercent, isMarketOpen: quote.isMarketOpen };
          return item;
        })
      );
      setItems(updated);
    } catch (e) {}
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshQuotes, 5000); // 5s refresh for watchlist
    return () => clearInterval(timer);
  }, [refreshQuotes]);

  const selectedRef = useRef(selectedSymbol);
  useEffect(() => { selectedRef.current = selectedSymbol; }, [selectedSymbol]);

  // Force strict sync of only the active viewed symbol to the master parent engine
  useEffect(() => {
     if (livePrice && livePrice > 0) {
         setItems(prev => prev.map(item => 
            item.symbol === selectedSymbol ? { ...item, price: livePrice } : item
         ));
     }
  }, [livePrice, selectedSymbol]);

  // Autonomous Background Ticker for all background open assets
  useEffect(() => {
    const ticker = setInterval(() => {
      setItems(prev => prev.map(item => {
        // Skip the actively viewed item (handled identically by livePrice above)
        if (item.symbol === selectedRef.current) return item;
        
        // Strictly freeze natively closed markets
        if (!item.isMarketOpen) return item;
        
        // Compute background active micro-fluctuations for open assets
        const vol = item.price * 0.0003;
        const change = (Math.random() - 0.5) * 2 * vol;
        const nextPrice = item.price + change;

        return {
           ...item, 
           price: +nextPrice.toFixed(item.price < 1 ? 4 : 2)
        };
      }));
    }, 500);
    return () => clearInterval(ticker);
  }, []);

  // Save watchlist to MongoDB when symbols change
  useEffect(() => {
    if (initialLoadRef.current && userId && items.length > 0) {
      const symbols = items.map(i => i.symbol);
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ watchlist: symbols })
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map(i => i.symbol).join(','), userId]);

  // Broadcast the actively ticking items to the parent container
  useEffect(() => {
    if (onItemsChange) onItemsChange(items);
  }, [items, onItemsChange]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchSymbols(search);
      setSearchResults(results.slice(0, 6)); // Top 6 results
      setIsSearching(false);
    }, 400); // 400ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const addSymbol = async (symbolStr: string) => {
    setSearch('');
    setSearchResults([]);
    // Don't add if already in list, just select
    if (items.some(i => i.symbol === symbolStr)) {
      onSelectSymbol(symbolStr);
      return;
    }
    const quote = await fetchQuote(symbolStr);
    if (quote) {
      const newItem: WatchlistItem = {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        currency: quote.currency,
        isMarketOpen: quote.isMarketOpen
      };
      setItems(prev => [newItem, ...prev]);
      onSelectSymbol(newItem.symbol, newItem.price);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      addSymbol(searchResults[0].symbol);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-panel overflow-visible relative z-20">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search symbol..."
            className="w-full bg-accent/30 border border-panel rounded-lg pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-primary/50 focus:bg-accent/50 transition-all font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-panel shadow-2xl rounded-lg overflow-hidden flex flex-col pointer-events-auto">
              {searchResults.map((res: any) => {
                 const cleanSym = res.symbol.replace('.NS', '').replace('.BO', '').replace('=X', '').replace('^', '');
                 return (
                  <button
                    key={res.symbol}
                    type="button"
                    onClick={() => addSymbol(res.symbol)}
                    className="flex flex-col text-left px-3 py-2 hover:bg-accent/50 border-b border-panel/30 last:border-0"
                  >
                    <span className="text-[11px] font-bold font-mono text-foreground">{cleanSym}</span>
                    <span className="text-[9px] text-muted-foreground truncate">{res.shortname || res.longname || res.symbol}</span>
                  </button>
                 );
              })}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-b border-panel/50 bg-accent/10 relative z-10">
        <div className="flex items-center gap-1.5">
           <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">My Station</span>
           <span className="text-[8px] text-bull animate-pulse">● LIVE</span>
        </div>
        <button onClick={refreshQuotes} className={`text-muted-foreground hover:text-primary transition-colors ${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 opacity-50">
             <Loader2 size={18} className="animate-spin" />
             <span className="text-[10px] uppercase font-mono tracking-tighter">Syncing terminal...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[10px] text-muted-foreground uppercase opacity-50 italic">Watchlist Empty</div>
        ) : (
          items.map((item) => (
            <WatchlistItemRow
              key={item.symbol}
              item={item}
              isSelected={selectedSymbol === item.symbol}
              onClick={() => onSelectSymbol(item.symbol, item.price)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WatchlistItemRow({ item, isSelected, onClick }: { item: WatchlistItem; isSelected: boolean; onClick: () => void }) {
  const isUp = item.change >= 0;
  const currency = getCurrencySymbol(item.symbol);
  const cleanSymbol = item.symbol.replace('.NS', '').replace('.BO', '').replace('=X', '').replace('^', '');

  return (
    <div
      onClick={onClick}
      className={`px-3 py-2.5 cursor-pointer border-b border-panel/30 transition-all hover:bg-accent/40 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary shadow-inner' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor] ${item.isMarketOpen ? 'bg-bull text-bull' : 'bg-bear text-bear/60'}`} title={item.isMarketOpen ? 'Market Open' : 'Market Closed'} />
          <span className="text-[11px] font-bold font-mono tracking-tighter text-foreground truncate max-w-[100px]">{cleanSymbol}</span>
        </div>
        <span className="text-[11px] font-bold font-mono text-foreground flex-shrink-0">{currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: (item.price < 1 ? 4 : 2) })}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground truncate max-w-[80px] font-medium opacity-80">{item.name}</span>
        <div className={`text-[9px] font-bold font-mono flex items-center gap-1 ${isUp ? 'price-up' : 'price-down'}`}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
