import { Clock, Globe, TrendingUp, TrendingDown, AlertTriangle, BookMarked, ExternalLink, ShieldCheck, Newspaper, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fetchNews } from '@/lib/yahooApi';

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
}

export default function NewsPanel({ symbol = 'AAPL' }: { symbol?: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNews() {
      setLoading(true);
      try {
        const data = await fetchNews(symbol);
        setNews(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    getNews();
  }, [symbol]);

  return (
    <div className="flex flex-col h-full bg-card p-4 space-y-6 overflow-y-auto scrollbar-thin pb-20">
      <header className="flex items-center justify-between border-b border-panel/50 pb-3">
        <div className="flex items-center gap-2">
          <Newspaper size={18} className="text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Live Intelligence Feed</h3>
        </div>
        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase opacity-70">
          {symbol} Focus
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Globe size={24} className="text-muted-foreground animate-spin-slow" />
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground animate-pulse">Retrieving global data...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 opacity-60">
          <BookMarked size={24} className="text-muted-foreground" />
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">No recent headlines found for {symbol}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {news.map((item, i) => (
              <motion.a
                key={item.uuid || i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group block bg-accent/10 hover:bg-accent/30 border border-panel/20 rounded-xl p-4 transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
              >
                <div className="flex justify-between items-start gap-3 relative z-10">
                   <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase font-mono bg-primary/10 px-1.5 rounded">{item.publisher}</span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                           <Clock size={10} /> {new Date(item.providerPublishTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-bold text-foreground leading-normal group-hover:text-primary transition-colors pr-4">{item.title}</h4>
                   </div>
                   <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="bg-bear/5 border border-bear/20 p-4 rounded-xl flex gap-3 text-bear">
         <ShieldCheck className="shrink-0 mt-0.5" size={16} />
         <p className="text-[10px] font-bold italic leading-relaxed uppercase tracking-tighter">
            PRO ADVISORY: Always cross-verify news with NSE/SEC official filings. Sentiment spikes can lead to stop-loss hunts.
         </p>
      </div>

      <div className="pt-4 border-t border-panel/30">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Institutional Calendar</h4>
        <div className="space-y-2">
           <CalendarEvent title="RBI MPC Policy" impact="EXTREME" />
           <CalendarEvent title="F&O Expiry" impact="HIGH" />
        </div>
      </div>
    </div>
  );
}

function CalendarEvent({ title, impact }: any) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-accent/5 rounded-lg border border-panel/10">
       <span className="text-[10px] font-mono font-bold text-foreground">{title}</span>
       <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${
         impact === 'EXTREME' ? 'bg-bear/20 text-bear border border-bear/30' : 'bg-gold/20 text-gold border border-gold/30'
       }`}>{impact} IMPACT</span>
    </div>
  );
}
