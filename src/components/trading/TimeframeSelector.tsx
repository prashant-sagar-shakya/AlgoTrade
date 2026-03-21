import { motion } from 'framer-motion';
import { TIMEFRAMES } from '@/lib/mockData';

interface TimeframeSelectorProps {
  selected: string;
  onSelect: (tf: string) => void;
}

export default function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-panel overflow-x-auto scrollbar-thin">
      {TIMEFRAMES.map((tf) => (
        <motion.button
          key={tf.value}
          onClick={() => onSelect(tf.value)}
          className={`tf-btn ${selected === tf.value ? 'tf-btn-active' : ''}`}
          whileTap={{ scale: 0.95 }}
        >
          {tf.label}
        </motion.button>
      ))}
    </div>
  );
}
