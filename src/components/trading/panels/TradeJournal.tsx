import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle, TrendingUp, DollarSign, Calendar, XCircle, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function TradeJournal({ userId }: { userId?: string | null }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = userId || 'demo_user';
  
  const [form, setForm] = useState({
    stock: '', dir: 'BUY', setup: 'EMA Crossover', entry: '', exit: '', qty: '', outcome: 'win', notes: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    async function fetchJournal() {
      setLoading(true);
      try {
        const res = await fetch('/api/journal', { headers: { 'x-user-id': uid } });
        const data = await res.json();
        if (Array.isArray(data)) setEntries(data);
      } catch {}
      setLoading(false);
    }
    fetchJournal();
  }, [uid]);

  const stats = useMemo(() => {
    const total = entries.length;
    const wins = entries.filter(e => e.status === 'WIN' || e.outcome === 'win').length;
    const totalPnl = entries.reduce((a, e) => a + (e.pnl || 0), 0);
    return { total, winRate: total ? Math.round(wins/total*100) : 0, totalPnl };
  }, [entries]);

  const addEntry = async () => {
    if (!form.stock || !form.entry || !form.exit || !form.qty) {
       toast.error('Please fill all required fields');
       return;
    }
    const pnl = form.dir === 'BUY' ? (+form.exit - +form.entry) * +form.qty : (+form.entry - +form.exit) * +form.qty;
    const newEntry = { 
      symbol: form.stock.toUpperCase(), type: form.dir, entry: +form.entry, exit: +form.exit,
      qty: +form.qty, status: pnl >= 0 ? 'WIN' : 'LOSS', pnl, setup: form.setup, notes: form.notes
    };

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify(newEntry)
      });
      const saved = await res.json();
      setEntries([saved, ...entries]);
      toast.success('Trade logged');
    } catch {
      toast.error('Failed to save trade');
    }
    setForm({ ...form, stock: '', entry: '', exit: '', qty: '', notes: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-panel/50">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Cloud Journal</h3>
        </div>
        <button 
           onClick={() => setIsFormOpen(!isFormOpen)} 
           className="text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-white transition-all">
           {isFormOpen ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
        <AnimatePresence>
          {isFormOpen && (
            <motion.div 
               initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} 
               className="bg-accent/40 rounded-lg p-3 border border-panel/50 space-y-3 overflow-hidden">
               <div className="grid grid-cols-2 gap-2">
                 <Input label="Symbol" value={form.stock} onChange={(v:any) => setForm({...form, stock: v.toUpperCase()})} placeholder="AAPL" />
                 <Select label="Direction" value={form.dir} options={['BUY', 'SELL']} onChange={(v:any) => setForm({...form, dir: v})} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <Input label="Entry" type="number" value={form.entry} onChange={(v:any) => setForm({...form, entry: v})} placeholder="150.00" />
                 <Input label="Exit" type="number" value={form.exit} onChange={(v:any) => setForm({...form, exit: v})} placeholder="155.00" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <Input label="Qty" type="number" value={form.qty} onChange={(v:any) => setForm({...form, qty: v})} placeholder="10" />
                 <Select label="Setup" value={form.setup} options={['EMA Crossover', 'VWAP Breakout', 'Range Break', 'Scalp']} onChange={(v:any) => setForm({...form, setup: v})} />
               </div>
               <button onClick={addEntry} className="w-full py-2 bg-primary text-white rounded text-xs font-bold hover:brightness-110 active:scale-95 transition-all uppercase">Save Entry</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-2">
           <Stat label="Total" value={stats.total} color="text-primary" />
           <Stat label="Win Rate" value={`${stats.winRate}%`} color="text-bull" />
           <Stat label="Total P&L" value={`₹${stats.totalPnl.toFixed(2)}`} color={stats.totalPnl >= 0 ? 'text-bull' : 'text-bear'} />
        </div>

        <div className="space-y-2 pb-20">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Calendar size={10} /> Trade History
          </h4>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-40">
               <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center text-[10px] text-muted-foreground py-12 uppercase tracking-tighter italic">No entries yet</div>
          ) : (
            entries.map(e => (
              <div key={e._id || e.id} className="bg-accent/20 border border-panel/30 rounded-lg p-3 text-[11px] relative group hover:border-primary/30 transition-shadow">
                <div className="flex justify-between items-center mb-1.5">
                   <div className="flex items-center gap-2">
                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${e.type === 'BUY' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>{e.type}</span>
                      <span className="font-bold text-foreground font-mono">{e.symbol}</span>
                   </div>
                   <span className={`font-bold font-mono ${(e.pnl || 0) >= 0 ? 'text-bull' : 'text-bear'}`}>{(e.pnl || 0) >= 0 ? '+' : ''}₹{(e.pnl || 0).toFixed(2)}</span>
                </div>
                <div className="text-[9px] text-muted-foreground flex justify-between items-center opacity-80 font-medium">
                   <span className="flex items-center gap-1.5"><Zap size={10} className="text-primary" /> {e.setup || 'Manual'} | Qty: {e.qty}</span>
                   <span>{new Date(e.date || e.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-accent/30 border border-panel/50 rounded px-2 py-1.5 outline-none focus:border-primary/50 text-xs text-foreground" />
    </div>
  );
}

function Select({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-accent/30 border border-panel/50 rounded px-2 py-1.5 outline-none focus:border-primary/50 text-xs text-foreground appearance-none uppercase">
          {options.map((opt:any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }: any) {
  return (
    <div className="bg-accent/40 rounded-lg border border-panel/30 p-2.5 text-center shadow-sm">
       <div className="text-[8px] uppercase text-muted-foreground font-bold tracking-widest mb-1">{label}</div>
       <div className={`text-[12px] font-mono font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}
