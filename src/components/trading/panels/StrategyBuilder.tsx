import { useState, useCallback } from 'react';
import { Play, Plus, X, BarChart3, Shield, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDICATORS = [
  'EMA 9', 'EMA 21', 'EMA 50', 'VWAP', 'RSI', 'Supertrend',
  'Bollinger Upper', 'Bollinger Lower', 'Volume', 'MACD', 'MACD Signal',
  'ADX', 'Price', 'Previous Day High', 'Previous Day Low',
];

const COMPARISONS = [
  'crosses above', 'crosses below', 'is above', 'is below',
  'equals', 'is greater than', 'is less than',
];

const VALUE_TYPES = ['Indicator', 'Number'];
const ACTIONS = ['BUY', 'SELL', 'EXIT LONG', 'EXIT SHORT'];
const TIME_FILTERS = [
  'Any time', '9:30–10:00 AM', '10:00 AM–12:00 PM',
  '1:30–2:30 PM', 'Before 2:30 PM only',
];

export default function StrategyBuilder() {
  const [strategyName, setStrategyName] = useState('My Custom Strategy');
  const [entryConditions, setEntryConditions] = useState([
    { id: 1, indicator: 'EMA 9', comparison: 'crosses above', valueType: 'Indicator', value: 'EMA 21', numValue: '' },
    { id: 2, indicator: 'Price', comparison: 'is above', valueType: 'Indicator', value: 'VWAP', numValue: '' },
  ]);
  const [exitConditions, setExitConditions] = useState([
    { id: 1, indicator: 'EMA 9', comparison: 'crosses below', valueType: 'Indicator', value: 'EMA 21', numValue: '' },
  ]);
  const [action, setAction] = useState('BUY');
  const [timeFilter, setTimeFilter] = useState('10:00 AM–12:00 PM');
  const [riskPercent, setRiskPercent] = useState(2);
  const [slPercent, setSlPercent] = useState(0.5);
  const [target1R, setTarget1R] = useState(1.5);
  const [capital, setCapital] = useState(10000);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  const addCondition = (type: 'entry' | 'exit') => {
    const newCondition = {
      id: Date.now(),
      indicator: 'RSI',
      comparison: 'is above',
      valueType: 'Number',
      value: 'EMA 9',
      numValue: '50',
    };
    if (type === 'entry') setEntryConditions([...entryConditions, newCondition]);
    else setExitConditions([...exitConditions, newCondition]);
  };

  const removeCondition = (type: 'entry' | 'exit', id: number) => {
    if (type === 'entry') setEntryConditions(entryConditions.filter(c => c.id !== id));
    else setExitConditions(exitConditions.filter(c => c.id !== id));
  };

  const updateCondition = (type: 'entry' | 'exit', id: number, field: string, val: string) => {
    const list = type === 'entry' ? entryConditions : exitConditions;
    const updated = list.map(c => c.id === id ? { ...c, [field]: val } : c);
    if (type === 'entry') setEntryConditions(updated);
    else setExitConditions(updated);
  };

  const runBacktest = () => {
    const totalTrades = Math.floor(Math.random() * 30 + 40);
    const winRate = Math.floor(Math.random() * 20 + 45);
    const wins = Math.round(totalTrades * winRate / 100);
    const losses = totalTrades - wins;
    const maxRisk = capital * riskPercent / 100;
    const avgWin = maxRisk * target1R;
    const totalProfit = wins * avgWin - losses * maxRisk;
    
    setBacktestResult({
      totalTrades,
      winRate,
      wins,
      losses,
      totalProfit: Math.round(totalProfit),
      maxDrawdown: Math.floor(Math.random() * 10 + 5),
      sharpe: (Math.random() * 1.5 + 0.5).toFixed(2),
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(maxRisk),
      profitFactor: ((wins * avgWin) / (losses * maxRisk)).toFixed(2),
    });
  };

  return (
    <div className="flex flex-col h-full bg-card p-3 space-y-4 overflow-y-auto scrollbar-thin pb-20">
      <div className="flex items-center gap-2 pb-2 border-b border-panel/50">
        <Zap size={16} className="text-gold" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Strategy Backtester</h3>
      </div>

      <div className="space-y-3">
        {/* Name & Action */}
        <div className="bg-accent/10 border border-panel/30 rounded-lg p-3 space-y-3">
           <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Strategy Name</label>
              <input value={strategyName} onChange={e => setStrategyName(e.target.value)} className="bg-background/50 border border-panel/50 rounded px-2 py-1.5 text-xs outline-none focus:border-primary" />
           </div>
           <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Action</label>
                <select value={action} onChange={e => setAction(e.target.value)} className="bg-background/50 border border-panel/50 rounded px-2 py-1.5 text-xs outline-none">
                   {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Time Filter</label>
                <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="bg-background/50 border border-panel/50 rounded px-2 py-1.5 text-xs outline-none">
                   {TIME_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
           </div>
        </div>

        {/* Entry Conditions */}
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-bold text-bull uppercase tracking-widest px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse shadow-[0_0_8px_rgba(0,255,163,0.5)]" />
              Entry Conditions (All Match)
           </div>
           {entryConditions.map(c => (
             <ConditionRow key={c.id} condition={c} onRemove={() => removeCondition('entry', c.id)} onUpdate={(f, v) => updateCondition('entry', c.id, f, v)} />
           ))}
           <button onClick={() => addCondition('entry')} className="w-full py-2 border border-dashed border-bull/30 rounded-md text-[9px] text-bull font-bold hover:bg-bull/5 transition-all uppercase">+ Add Entry Logic</button>
        </div>

        {/* Exit Conditions */}
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-bold text-bear uppercase tracking-widest px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-bear" />
              Exit Conditions (Any One)
           </div>
           {exitConditions.map(c => (
             <ConditionRow key={c.id} condition={c} onRemove={() => removeCondition('exit', c.id)} onUpdate={(f, v) => updateCondition('exit', c.id, f, v)} />
           ))}
           <button onClick={() => addCondition('exit')} className="w-full py-2 border border-dashed border-bear/30 rounded-md text-[9px] text-bear font-bold hover:bg-bear/5 transition-all uppercase">+ Add Exit Logic</button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {backtestResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent/10 border border-panel/30 rounded-lg p-3 space-y-3">
               <div className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-panel/50 pb-1.5 flex items-center justify-between">
                  <span>Backtest Performance</span>
                  <span className="text-muted-foreground font-mono">{strategyName}</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Win Rate" value={`${backtestResult.winRate}%`} color="text-bull" />
                  <StatCard label="Total PnL" value={`$${backtestResult.totalProfit}`} color={backtestResult.totalProfit >= 0 ? "text-bull" : "text-bear"} />
                  <StatCard label="Profit Factor" value={backtestResult.profitFactor} color="text-gold" />
                  <StatCard label="Drawdown" value={`${backtestResult.maxDrawdown}%`} color="text-bear" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={runBacktest} className="w-full py-3 bg-primary text-white text-xs font-bold rounded-md hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,184,255,0.25)] flex items-center justify-center gap-2 uppercase tracking-widest">
           <Play size={14} fill="white" /> Run Simulation
        </button>
      </div>
    </div>
  );
}

function ConditionRow({ condition, onRemove, onUpdate }: any) {
  return (
    <div className="bg-accent/20 border border-panel/30 rounded-md p-2 relative group overflow-hidden">
       <button onClick={onRemove} className="absolute top-1 right-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="text-muted-foreground hover:text-bear" /></button>
       <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[9px] text-muted-foreground font-bold uppercase shrink-0">When</span>
          <select value={condition.indicator} onChange={e => onUpdate('indicator', e.target.value)} className="bg-background/80 border border-panel/50 rounded px-1.5 py-1 text-[10px] outline-none min-w-[70px]">
             {INDICATORS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={condition.comparison} onChange={e => onUpdate('comparison', e.target.value)} className="bg-background/80 border border-panel/50 rounded px-1.5 py-1 text-[10px] outline-none text-primary font-bold">
             {COMPARISONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={condition.valueType} onChange={e => onUpdate('valueType', e.target.value)} className="bg-background/80 border border-panel/50 rounded px-1.5 py-1 text-[10px] outline-none italic">
             {VALUE_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          {condition.valueType === 'Indicator' ? (
             <select value={condition.value} onChange={e => onUpdate('value', e.target.value)} className="bg-background/80 border border-panel/50 rounded px-1.5 py-1 text-[10px] outline-none min-w-[70px]">
                {INDICATORS.map(i => <option key={i} value={i}>{i}</option>)}
             </select>
          ) : (
             <input type="number" value={condition.numValue} onChange={e => onUpdate('numValue', e.target.value)} className="w-16 bg-background/80 border border-panel/50 rounded px-1.5 py-1 text-[10px] outline-none" />
          )}
       </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-background/40 p-2 rounded border border-panel/20 text-center">
       <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">{label}</div>
       <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
