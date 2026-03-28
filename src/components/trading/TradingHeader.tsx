import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

interface TradingHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  onOpenTab?: (tab: 'AI'|'ORDER'|'POSITIONS'|'TOOLS'|'SETTINGS'|'NOTIFICATIONS') => void;
  hasUnread?: boolean;
  balance?: number;
  isCloud?: boolean;
  isMarketOpen?: boolean;
}

export default function TradingHeader({ isDark, onToggleTheme, selectedSymbol, onSymbolChange, onOpenTab, hasUnread, balance, isCloud, isMarketOpen }: TradingHeaderProps) {
  const [connected] = useState(true);
  const { isSignedIn, isLoaded } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-12 bg-card border-b border-panel flex items-center px-3 gap-2 relative z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-panel">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">LS</span>
        </div>
        <span className="font-semibold text-sm hidden sm:block">AlgoTrade</span>
      </div>

      <div className="relative pl-4 border-l border-panel flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${isMarketOpen ? 'bg-bull text-bull' : 'bg-bear text-bear'}`} title={isMarketOpen ? 'Market Open' : 'Market Closed'} />
          <span className="font-mono text-sm font-semibold">{selectedSymbol.replace('.NS', '').replace('.BO', '').replace('=X', '').replace('^', '')}</span>
        </div>
        {balance !== undefined && (
          <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-bull/10 rounded-md border border-bull/20 shadow-[0_0_10px_rgba(0,255,163,0.1)]">
             <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{isCloud ? 'Cloud Wallet' : 'Demo Wallet'}</span>
             <span className="text-xs font-bold text-bull">₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-2 mr-2">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
          isCloud 
            ? 'bg-bull/10 border-bull/30 text-bull animate-pulse' 
            : 'bg-gold/10 border-gold/30 text-gold'
        }`}>
           <div className={`w-1 h-1 rounded-full ${isCloud ? 'bg-bull' : 'bg-gold'}`} />
           {isCloud ? 'Cloud Sync' : 'Demo Mode'}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground opacity-60">
           {connected ? <Wifi size={10} className="text-bull" /> : <WifiOff size={10} className="text-bear" />}
           {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Actions */}
      <button onClick={() => onOpenTab?.('NOTIFICATIONS')} className="p-1.5 rounded-md hover:bg-accent transition-all relative active:scale-95">
        <Bell size={16} className="text-muted-foreground" />
        {hasUnread && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-bear rounded-full" />}
      </button>
      <button onClick={onToggleTheme} className="p-1.5 rounded-md hover:bg-accent transition-all active:scale-95">
        {isDark ? <Sun size={16} className="text-muted-foreground" /> : <Moon size={16} className="text-muted-foreground" />}
      </button>

      {isLoaded && (
        <>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all active:scale-95">
                Login
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center justify-center p-1.5 rounded-md hover:bg-accent transition-colors">
              <UserButton />
            </div>
          )}
        </>
      )}
    </motion.header>
  );
}
