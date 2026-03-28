import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ChevronRight, TrendingUp, ShieldAlert, Target } from 'lucide-react';

export default function RiskCalculator() {
  const [cap, setCap] = useState(10000);
  const [riskPct, setRiskPct] = useState(2);
  const [price, setPrice] = useState(2500);
  const [slDist, setSlDist] = useState(0.5);
  const [winRate, setWinRate] = useState(55);

  const stats = useMemo(() => {
    const maxRisk = Math.round(cap * riskPct / 100);
    const slAmt = price * slDist / 100;
    const slPr = Math.round(price - slAmt);
    const qty = Math.max(1, Math.floor(maxRisk / slAmt));
    const invest = Math.round(qty * price);
    const t1 = Math.round(price + slAmt * 1.5);
    const t2 = Math.round(price + slAmt * 2.5);
    const dailyLoss = Math.round(cap * 0.15);
    const wins = Math.round(20 * winRate / 100);
    const losses = 20 - wins;
    const gross = Math.round(wins * maxRisk * 1.5 - losses * maxRisk);
    const monthlyReturn = Math.round(gross / cap * 100);

    return {
      maxRisk, slPr, qty, invest, t1, t2, dailyLoss, wins, losses, gross, monthlyReturn
    };
  }, [cap, riskPct, price, slDist, winRate]);

  return (
    <div className="flex flex-col h-full bg-card overflow-y-auto scrollbar-thin p-3 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-panel/50">
        <Calculator size={16} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Position Sizing Calc</h3>
      </div>

      <div className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <InputGroup label="Capital ($)" value={`$${cap.toLocaleString()}`} min={1000} max={100000} step={500} val={cap} onChange={setCap} />
          <InputGroup label="Risk per Trade (%)" value={`${riskPct}%`} min={0.5} max={10} step={0.5} val={riskPct} onChange={setRiskPct} />
          <InputGroup label="Price ($)" value={`$${price.toLocaleString()}`} min={1} max={10000} step={10} val={price} onChange={setPrice} />
          <InputGroup label="SL Distance (%)" value={`${slDist.toFixed(1)}%`} min={0.1} max={5} step={0.1} val={slDist} onChange={setSlDist} />
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-2 gap-2">
          <ResultCard icon={<ShieldAlert size={12} />} label="Max Risk" value={`$${stats.maxRisk}`} color="text-bear" />
          <ResultCard icon={<ChevronRight size={12} />} label="SL Price" value={`$${stats.slPr}`} color="text-primary" />
          <ResultCard icon={<Calculator size={12} />} label="Quantity" value={`${stats.qty} Units`} color="text-bull" />
          <ResultCard icon={<Target size={12} />} label="Total Used" value={`$${stats.invest}`} color="text-primary" />
        </div>

        <div className="bg-accent/40 rounded-lg p-3 border border-panel/50 space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={10} /> Monthly Expectancy (20 trades)
          </h4>
          <div className="space-y-1 text-xs font-mono">
             <div className="flex justify-between">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="text-bull">{winRate}%</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Gain</span>
                <span className={stats.gross >= 0 ? 'text-bull' : 'text-bear'}>
                  {stats.gross >= 0 ? '+' : ''}${stats.gross}
                </span>
             </div>
             <div className="flex justify-between font-bold border-t border-panel/50 mt-1 pt-1">
                <span className="text-foreground">Monthly ROI</span>
                <span className={stats.monthlyReturn >= 0 ? 'text-primary' : 'text-bear'}>
                  {stats.monthlyReturn >= 0 ? '+' : ''}{stats.monthlyReturn}%
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, min, max, step, val, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-bold font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

function ResultCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-accent/30 p-2 rounded-md border border-panel/30 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
        {icon}
        <span className="text-[9px] uppercase font-bold tracking-tight">{label}</span>
      </div>
      <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}
