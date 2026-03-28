import { Award, ShieldCheck, Zap, AlertTriangle, BookCheck, TrendingUp, DollarSign, Calendar, XCircle, ChevronDown, ChevronUp, Swords, RotateCcw, Target, ZapOff, Trophy } from 'lucide-react';

export default function GoldenRules() {
  const rules = [
    { n: '01', c: 'text-bear', title: 'Never Move Your Stop Loss', desc: 'Once set, it stays. The moment you say "let me wait a bit more" is the moment small losses become account killers. SL hit = trade over. Find the next setup.', icon: <ZapOff size={14} className="text-bear" /> },
    { n: '02', c: 'text-gold', title: 'Respect the Daily Loss Limit', desc: 'Lose 15% of capital in one day? Screen goes off. You are done for the day. Emotional revenge trading has destroyed more accounts than bad setups ever could.', icon: <AlertTriangle size={14} className="text-gold" /> },
    { n: '03', c: 'text-bull', title: 'Only Trade With the Trend', desc: 'Nifty is falling? Do not buy. "It will bounce from here" is not analysis — it\'s hope. The market can always go lower. Always trade in the direction of the broader market.', icon: <TrendingUp size={14} className="text-bull" /> },
    { n: '04', c: 'text-primary', title: '2–3 Trades Maximum Per Day', desc: 'More trades = more brokerage + more mistakes + more emotional decisions. Two perfect trades per week can deliver your monthly target. Boredom is not a reason to trade.', icon: <Target size={14} className="text-primary" /> },
    { n: '05', c: 'text-purple-500', title: 'Setup First, News Never', desc: 'Breaking news caused a 2% gap up? You missed it. That\'s fine. Never chase news-driven moves. Wait for YOUR setup to appear. The market offers setups every single day.', icon: <Zap size={14} className="text-purple-500" /> },
    { n: '06', c: 'text-cyan-500', title: 'Withdraw Profits Weekly', desc: 'Every Friday, move 50% of weekly profits to a separate account. This prevents "paper wealth" syndrome where your trading account inflates and you start overleveraging.', icon: <DollarSign size={14} className="text-cyan-500" /> },
    { n: '07', c: 'text-bull', title: 'Journal Every Single Trade', desc: 'No journal = no improvement. After 3 months, patterns will emerge — your best setup, your worst time of day, your emotional triggers. This is your competitive edge.', icon: <BookCheck size={14} className="text-bull" /> },
    { n: '08', c: 'text-bear', title: 'Zero Tips, Zero Groups', desc: 'If someone genuinely made money with a stock tip, they would be trading it themselves — not broadcasting it. Every tip serves the tipper, not you. Your analysis, your trades only.', icon: <ShieldCheck size={14} className="text-bear" /> },
    { n: '09', c: 'text-gold', title: 'Win Rate Matters Less Than R:R', desc: 'A 40% win rate with 1:3 risk-reward is MORE profitable than a 70% win rate at 1:1. Math: 4 wins × ₹300 − 6 losses × ₹100 = +₹600. Understand expectancy, not just wins.', icon: <Target size={14} className="text-gold" /> },
    { n: '10', c: 'text-primary', title: 'Consistency Beats Home Runs', desc: '₹500/day × 20 trading days = ₹10,000/month = 100% monthly return on ₹10K. One "home run" trade that goes wrong wipes out 5 days of disciplined profit. Be boring. Be consistent.', icon: <Trophy size={14} className="text-primary" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-card p-3 space-y-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 pb-2 border-b border-panel/50">
        <Award size={16} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">10 Commandments of Trading</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 pb-8">
        {rules.map((rule, i) => (
          <div key={i} className="group p-3 bg-accent/20 border border-panel/30 rounded-lg hover:border-primary/40 transition-all relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${rule.c} bg-current`} />
            <div className="flex items-center gap-2 mb-1.5 ml-1">
               <span className={`text-[10px] font-bold ${rule.c} font-mono tracking-tighter`}>{rule.n}</span>
               <span className="text-xs font-bold text-foreground font-mono">{rule.title}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed ml-1">{rule.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
