import { CheckCircle2, AlertTriangle, TrendingUp, Zap, Target, Shield, ArrowRight } from 'lucide-react';

export default function ExpertSetups() {
  const strategies = [
    { name: 'EMA Crossover', time: '10:00 AM – 12:00 PM', risk: 'Low', color: 'text-bull', steps: 'Nifty bullish trend. EMA 9 crosses above EMA 21 with rising volume. Price is above VWAP. Enter on candle close. SL below EMA 21.' },
    { name: 'VWAP Breakout', time: '9:45 AM – 11:30 AM', risk: 'Medium', color: 'text-primary', steps: 'Price breaks above VWAP with 2x average volume. RSI crosses above 50. Enter after VWAP breakout candle closes. SL just below VWAP.' },
    { name: 'Opening Range Breakout', time: '9:45 – 10:15 AM', risk: 'Medium', color: 'text-gold', steps: 'Mark high/low of first 15-min candle. Wait for price to break either side with volume. SL = opposite side of range. Align with Nifty trend.' }
  ];

  return (
    <div className="flex flex-col h-full bg-card p-3 space-y-6 overflow-y-auto scrollbar-thin pb-20">
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1.5 border-b border-panel/50">
           <CheckCircle2 size={16} className="text-bull" />
           <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Entry Checklist (Must Meet All)</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
           <RuleItem text="Nifty is Green: Market trend is bullish on 15-min chart" type="success" />
           <RuleItem text="EMA 9 > EMA 21: Both EMAs pointing up on 5-min chart" type="success" />
           <RuleItem text="Price above VWAP: Stock trading above its daily VWAP line" type="success" />
           <RuleItem text="High Volume: Current volume ≥ 1.5x average volume" type="success" />
           <RuleItem text="RSI 45–60: Not overbought, momentum building upward" type="success" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1.5 border-b border-panel/50">
           <AlertTriangle size={16} className="text-bear" />
           <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Never Enter When (Red Flags)</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
           <RuleItem text="Nifty is falling: Never buy into broad selloff" type="danger" />
           <RuleItem text="RSI above 70: Stock is already overbought" type="danger" />
           <RuleItem text="Low volume breakout: Fake breakout / retail trap" type="danger" />
           <RuleItem text="After 2:30 PM: Too close to closing volatility" type="danger" />
           <RuleItem text="FOMO entry: Stock already moved 2% before entry" type="danger" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1.5 border-b border-panel/50">
           <Zap size={16} className="text-gold" />
           <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Core Strategies</h3>
        </div>
        <div className="space-y-3">
           {strategies.map((s, i) => (
             <div key={i} className="bg-accent/20 border border-panel/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                   <span className={`text-xs font-bold ${s.color}`}>{s.name}</span>
                   <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded font-bold uppercase">{s.risk} Risk</span>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase tracking-tighter">
                   <Target size={10} /> Time: {s.time}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-panel/50 pl-2">"{s.steps}"</p>
             </div>
           ))}
        </div>
      </section>

      <section className="bg-primary/10 border border-primary/30 p-3 rounded-lg space-y-2">
         <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
            <Shield size={14} /> Trade Management
         </div>
         <ul className="space-y-1.5">
            <li className="text-[10px] text-muted-foreground flex gap-2"><ArrowRight size={10} className="shrink-0 mt-0.5" /> At +1R: Move stop-loss to breakeven.</li>
            <li className="text-[10px] text-muted-foreground flex gap-2"><ArrowRight size={10} className="shrink-0 mt-0.5" /> At 1.5R: Exit 50% position. Lock in profit.</li>
            <li className="text-[10px] text-muted-foreground flex gap-2"><ArrowRight size={10} className="shrink-0 mt-0.5" /> Stop Loss is hit? Exit immediately. Zero hope.</li>
         </ul>
      </section>
    </div>
  );
}

function RuleItem({ text, type }: any) {
  return (
    <div className={`p-2 rounded text-[10px] border flex gap-2 items-center ${type === 'success' ? 'bg-bull/5 border-bull/20 text-bull-foreground' : 'bg-bear/5 border-bear/20 text-bear-foreground'}`}>
       <div className={`w-1.5 h-1.5 rounded-full ${type === 'success' ? 'bg-bull' : 'bg-bear'}`} />
       {text}
    </div>
  );
}
