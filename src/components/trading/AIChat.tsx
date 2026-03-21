import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, X, Maximize2, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `🤖 **AlgoTrade AI Assistant**\n\nMain tumhara trading companion hoon. Mujhse pooch sakte ho:\n\n• **"BTCUSDT ka analysis do"** — Full technical breakdown\n• **"NIFTY buy karna chahiye?"** — Signal with entry/SL/TP\n• **"Market sentiment kya hai?"** — News-based analysis\n• **"RSI divergence samjhao"** — Trading concepts\n\n_Trading ki language mein baat karte hain!_ 📊`,
    timestamp: new Date(),
  },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response (will be replaced with Claude API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `📊 **Analysis Processing...**\n\nAbhi real-time analysis ke liye **Claude API** integrate karna padega.\n\n**Setup karne ke liye:**\n1. Lovable Cloud enable karo\n2. Claude API key add karo\n3. Phir full institutional-grade analysis milega!\n\n_Indicators, chart patterns, news sentiment — sab cover hoga._ 🎯`,
      };

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses.default,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={`trading-panel flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'h-full'}`}>
      <div className="trading-panel-header">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" /> AI Trading Chat
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded hover:bg-accent transition-colors">
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-primary/15 text-primary' : 'bg-accent'}`}>
                {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
              </div>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code class="bg-background/50 px-1 rounded text-[10px]">$1</code>')
                }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Bot size={12} /></div>
            <div className="bg-accent rounded-lg px-3 py-2 text-xs">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-panel">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any market..."
            className="flex-1 bg-accent rounded-md px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            <Send size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
