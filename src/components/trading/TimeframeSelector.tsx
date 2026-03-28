import { motion } from 'framer-motion';
import { TIMEFRAMES } from '@/lib/mockData';

interface TimeframeSelectorProps {
  selected: string;
  onSelect: (tf: string) => void;
}

export default function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-accent/30 rounded-lg">
      {TIMEFRAMES.map((tf) => (
        <motion.button
          key={tf.value}
          onClick={() => onSelect(tf.value)}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95 ${
            selected === tf.value
              ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {tf.label}
        </motion.button>
      ))}
    </div>
  );
}
