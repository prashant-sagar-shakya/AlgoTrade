import { Shield, BookOpen, Clock, Target, Rocket, CheckCircle2 } from 'lucide-react';

export default function MasterGuide() {
  const months = [
    { n: '01', range: '₹10,000 → ₹13,800', phase: 'Foundation Phase', title: 'Learn Before You Earn', tasks: 'Week 1–2: Paper trading only — zero real money. Week 3–4: Real trading with ₹5,000, 1 trade/day. Master only one setup: EMA Crossover. Goal: Don\'t lose money.' },
    { n: '02', range: '₹13,800 → ₹19,044', phase: 'Consistency Phase', title: 'Build the Habit, Build the Edge', tasks: 'Deploy full ₹13,800 with confidence. 2 trades/day max — quality over quantity. Add VWAP confirmation to your EMA setup. Track win rate in journal — target 55%+' },
    { n: '03', range: '₹19,044 → ₹26,281', phase: 'Expansion Phase', title: 'More Setups, Same Discipline', tasks: 'Trade Breakout + Reversal setups. Begin watching FII/DII data daily. Explore basic options on Nifty (watch only). Win rate should be stable at 55–60%' },
    { n: '04', range: '₹26,281 → ₹36,268', phase: 'Refinement Phase', title: 'Sharpen Your Edge', tasks: 'Learn sector rotation — which sector is leading? Master trailing stop losses. 3 trades/day only when high-conviction setups appear. Review journal — eliminate mistake' },
    { n: '05', range: '₹36,268 → ₹50,050', phase: 'Final Push', title: 'Execute Perfectly', tasks: 'Only trade best quality setups. Increase position size on highest-conviction trades. Month end: withdraw ₹50K+ — protect the gains. Celebrate. You built a system.' }
  ];

  const schedule = [
    { time: '8:00 AM', label: 'PRE-MARKET PREP', desc: 'Gift Nifty, US Markets close, Crude/USD index. Build watchlist of 3-4 stocks only.' },
    { time: '9:15 AM', label: 'OPENING - WATCH ONLY', desc: 'Zero trades. Observe volatility. Missing this costs nothing, entering costs money.' },
    { time: '10:00 AM', label: 'PRIME TRADE WINDOW', desc: 'Best time to enter. Setup confirmed, high volume. Max 2 trades. Set SL first.' },
    { time: '12:00 PM', label: 'LUNCH - AVOID', desc: 'Volume collapses, false breakouts common. Exit or tighten stops. Update journal.' },
    { time: '2:30 PM', label: 'EXIT ZONE', desc: 'ALL positions must be closed by 3:15 PM. No new trades. Manipulated session ends.' }
  ];

  return (
    <div className="flex flex-col h-full bg-card p-3 space-y-5 overflow-y-auto scrollbar-thin pb-10">
      <div>
        <div className="flex items-center gap-2 pb-2 border-b border-panel/50 mb-3 text-primary">
          <Rocket size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">5-Month Road To ₹50K</h3>
        </div>
        <div className="space-y-3">
          {months.map((m, i) => (
            <div key={i} className="p-3 bg-accent/20 border border-panel/30 rounded-lg">
              <div className="flex justify-between items-start mb-1 text-[10px]">
                <span className="font-bold text-primary uppercase">{m.phase}</span>
                <span className="font-mono text-muted-foreground">{m.range}</span>
              </div>
              <div className="text-xs font-bold text-foreground mb-1">{m.title}</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">{m.tasks}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 pb-2 border-b border-panel/50 mb-3 text-gold">
          <Clock size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Daily Trading Schedule</h3>
        </div>
        <div className="space-y-3">
          {schedule.map((s, i) => (
            <div key={i} className="flex gap-3 text-[10px]">
              <span className="font-mono text-gold min-w-[60px]">{s.time}</span>
              <div>
                <div className="font-bold text-foreground uppercase">{s.label}</div>
                <p className="text-muted-foreground italic leading-tight">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
