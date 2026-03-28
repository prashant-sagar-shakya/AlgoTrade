import { Bell, AlertTriangle, CheckCircle2, Info, TrendingUp, Clock, Trash2, Zap, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  desc: string;
  type: string;
  time: string;
  read: boolean;
  dateObj?: Date;
}

export default function NotificationsPanel({ onMarkRead, userId }: { onMarkRead?: () => void; userId?: string | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const uid = userId || 'demo_user';

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { headers: { 'x-user-id': uid } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data.map((n: any) => ({
           id: n._id || Math.random().toString(),
           title: n.title || 'System Alert',
           desc: n.desc || '',
           type: n.type || 'INFO',
           time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
           read: n.read || false,
           dateObj: n.createdAt ? new Date(n.createdAt) : new Date()
        })).sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0)));
      }
    } catch {}
  }, [uid]);

  // Initial Fetch
  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  // Listen for real-time trade events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { title, desc, type } = e.detail;
      const newNotif: Notification = { 
        id: Date.now().toString(), 
        title, 
        desc, 
        type: type || 'TRADE', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        read: false 
      };
      setNotifications(prev => [newNotif, ...prev]);
    };
    window.addEventListener('trade-notification' as any, handler);
    return () => window.removeEventListener('trade-notification' as any, handler);
  }, []);

  const clearAll = async () => {
    setNotifications([]);
    // Optionally call delete endpoint if exists
  };

  const getIcon = (type: string) => {
    switch(type.toUpperCase()) {
      case 'TRADE': return <div className="p-1.5 rounded-lg bg-bull/10 text-bull"><Zap size={14} /></div>;
      case 'ALERT': return <div className="p-1.5 rounded-lg bg-bear/10 text-bear"><AlertTriangle size={14} /></div>;
      case 'SUCCESS': return <div className="p-1.5 rounded-lg bg-bull/10 text-bull"><CheckCircle2 size={14} /></div>;
      default: return <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Info size={14} /></div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-panel/50 bg-background/30">
        <div className="flex items-center gap-2">
           <Bell size={16} className="text-primary" />
           <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Activity Hub</h3>
           {notifications.filter(n => !n.read).length > 0 && (
              <span className="text-[8px] bg-bear text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {notifications.filter(n => !n.read).length} NEW
              </span>
           )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onMarkRead} className="text-[9px] text-muted-foreground hover:text-primary font-bold uppercase tracking-tighter transition-colors">Mark All Read</button>
          <button onClick={clearAll} className="p-1 rounded-md hover:bg-bear/10 hover:text-bear transition-all opacity-60">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-background/10">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-30 space-y-2">
             <Bell size={32} />
             <span className="text-[10px] uppercase font-mono tracking-widest">No Recent Activity</span>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            <AnimatePresence mode='popLayout'>
              {notifications.map((notif) => (
                <motion.div 
                   key={notif.id} 
                   initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                   animate={{ opacity: 1, y: 0, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className={`relative group bg-accent/20 border border-panel/30 rounded-xl p-3 hover:bg-accent/30 hover:border-primary/20 transition-all cursor-default overflow-hidden ${!notif.read ? 'border-l-2 border-l-primary shadow-sm' : ''}`}
                >
                  <div className="flex gap-3">
                     <div className="shrink-0">{getIcon(notif.type)}</div>
                     <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex justify-between items-center text-[11px]">
                           <span className="font-bold text-foreground font-mono tracking-tight flex items-center gap-1.5">
                              {notif.title}
                           </span>
                           <span className="text-[9px] text-muted-foreground font-mono opacity-60 flex items-center gap-1 shrink-0">
                              <Clock size={10} /> {notif.time}
                           </span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-normal pr-2 font-medium">
                           {parseDescription(notif.desc)}
                        </p>
                     </div>
                  </div>
                  {!notif.read && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to highlight key data in description
function parseDescription(desc: string) {
    if (!desc) return '';
    // Highlight symbols (uppercase words) and prices (starting with ₹ or numbers)
    const words = desc.split(' ');
    return words.map((word, i) => {
        const isSymbol = /^[A-Z]{3,}=?[A-Z]*$/.test(word.replace(/[\(\),]/g, ''));
        const isPrice = word.includes('₹') || word.includes('$') || /^[0-9]+\.[0-9]+$/.test(word);
        const isQty = word.endsWith('x') && /^[0-9]/.test(word);
        
        if (isSymbol || isPrice || isQty) {
            return <span key={i} className="text-foreground font-bold font-mono px-0.5 rounded bg-accent/30">{word} </span>;
        }
        return word + ' ';
    });
}
