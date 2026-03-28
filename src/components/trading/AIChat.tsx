import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrencySymbol } from '@/lib/mockData';

const genAI = new GoogleGenerativeAI('AIzaSyA_ovTMt73P3Mood3RHQ2rXM1SGj188pNs');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

interface AIChatProps {
  symbol: string;
  price: number;
  indicators: any;
  userId?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChat({ symbol, price, indicators, userId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uid = userId || 'demo_user';

  // Load chat history from MongoDB
  useEffect(() => {
    if (!userId) return;
    async function loadHistory() {
      try {
        const res = await fetch('/api/chat', { headers: { 'x-user-id': uid } });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map((m: any) => ({
            id: m._id || m.id || Date.now().toString(),
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt)
          })));
        }
      } catch {}
      setLoaded(true);
    }
    loadHistory();
  }, [userId]);

  // Save message to MongoDB
  const saveMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
    if (!userId) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ role, content, symbol })
      });
    } catch {}
  }, [userId, uid, symbol]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    setMessages([]);
    if (!userId) return;
    try {
      await fetch('/api/chat', { method: 'DELETE', headers: { 'x-user-id': uid } });
    } catch {}
  }, [userId, uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    saveMessage('user', userContent);
    
    const currency = getCurrencySymbol(symbol);
    const context = `
      CURRENT MARKET DATA:
      - Symbol: ${symbol}
      - Price: ${currency}${price.toFixed(2)}
      - Indicators: RSI=${indicators?.rsi?.toFixed(1) || 'N/A'}, EMA9=${indicators?.ema9 || 'N/A'}, EMA21=${indicators?.ema21 || 'N/A'}, EMA50=${indicators?.ema50 || 'N/A'}
      
      ROLE: AlgoTrade AI Expert. 
      INSTRUCTIONS: Keep it concise, data-driven, and technical. Use the correct currency symbol (${currency}) when discussing price.
      
      USER: ${userContent}
    `;
    
    setInput('');
    setIsTyping(true);

    try {
      const result = await model.generateContent(context);
      const response = await result.response;
      const aiContent = response.text();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiContent, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      saveMessage('assistant', aiContent);
    } catch {
      const errContent = "⚠️ System busy. Re-syncing signal stream...";
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: errContent, timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`trading-panel flex flex-col ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-card border-none' : 'h-full'}`}>
      <div className="trading-panel-header shrink-0">
        <span className="flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-widest text-primary/80">
          <Sparkles size={11} /> Expert Intelligence
        </span>
        <div className="flex items-center gap-2">
          {price > 0 && (
            <div className="flex items-center gap-1.5 bg-accent/50 px-2 py-0.5 rounded border border-panel/50">
               <div className="w-1 h-1 bg-bull rounded-full animate-pulse" />
               <span className="text-[9px] font-mono font-bold text-foreground tracking-tighter uppercase whitespace-nowrap">
                 {symbol.replace('.NS', '').replace('=X', '')} · {getCurrencySymbol(symbol)}{price.toFixed(2)}
               </span>
            </div>
          )}
          <button onClick={clearChat} className="p-1 rounded hover:bg-bear/10 hover:text-bear transition-colors opacity-50 hover:opacity-100" title="Clear chat">
            <Trash2 size={11} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded hover:bg-accent/50 transition-colors">
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4 min-h-0 bg-background/20 relative">
        {messages.length === 0 && !isTyping && (
           <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-50 px-4 text-center">
            <Bot size={24} className="text-primary mb-2" />
            <p className="text-[11px] font-mono tracking-tighter uppercase">Intelligence Terminal v1.0 Connected.</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Monitoring <span className="text-primary font-bold">{symbol.replace('.NS', '').replace('=X', '')}</span> at {getCurrencySymbol(symbol)}{price.toFixed(2)}. How can I help with your strategy today?
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${msg.role === 'assistant' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-accent/40 border-panel/50'}`}>
                {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
              </div>
              <div className={`max-w-[90%] rounded-xl px-3 py-2 text-[10.5px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-accent/30 border border-panel/10'}`}>
                <div className="prose prose-invert prose-xs max-w-none" dangerouslySetInnerHTML={{
                   __html: (msg.content || '')
                     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                     .replace(/\*(.*?)\*/g, '<em>$1</em>')
                     .replace(/`(.*?)`/g, '<code class="bg-background/50 px-1 rounded text-[9px] font-mono">$1</code>')
                     .replace(/\n\n/g, '<br/><br/>')
                     .replace(/\n/g, '<br/>')
                 }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center"><Bot size={12} /></div>
            <div className="bg-accent/30 border border-panel/10 rounded-xl px-3 py-2 text-[10px] flex gap-1 items-center">
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:800ms]" />
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:-150ms]" />
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:-300ms]" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-panel/50 bg-background/50 shrink-0">
        <div className="flex gap-2 bg-accent/30 p-1 rounded-lg border border-panel/40 focus-within:border-primary/40 transition-all">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Analyze ${symbol} trend...`}
            className="flex-1 bg-transparent px-3 py-1.5 text-[10.5px] outline-none placeholder:text-muted-foreground/50 font-medium"
          />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim()}
            className="w-8 h-8 rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity flex items-center justify-center shadow-md">
            <Send size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
