import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getCurrencySymbol } from '@/lib/mockData';

export type OrderType = 'BUY' | 'SELL';

export interface Position {
  id: string;
  symbol: string;
  type: OrderType;
  entryPrice: number;
  quantity: number;
  sl: number | null;
  tp: number | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: number;
  closedAt?: number;
  closePrice?: number;
  realizedPnl?: number;
}

function fireNotification(title: string, desc: string, type = 'TRADE') {
  window.dispatchEvent(new CustomEvent('trade-notification', { detail: { title, desc, type } }));
}

export function useTradingEngine(userId?: string | null) {
  const [balance, setBalance] = useState<number>(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isCloud, setIsCloud] = useState(false);
  const initDone = useRef(false);
  const uid = userId || 'demo_user';

  // Load from MongoDB on mount or when userId changes
  useEffect(() => {
    if (!userId) return;
    async function init() {
      try {
        const [userRes, orderRes] = await Promise.all([
          fetch('/api/user', { headers: { 'x-user-id': uid } }),
          fetch('/api/orders', { headers: { 'x-user-id': uid } })
        ]);
        const userData = await userRes.json();
        const orders = await orderRes.json();

        if (!userData.isDemo) {
          setIsCloud(true);
          if (userData.balance !== undefined) setBalance(userData.balance);
        }

        if (Array.isArray(orders) && orders.length > 0) {
          setPositions(orders.map((o: any) => ({
             id: o._id || o.id, symbol: o.symbol, type: o.type, entryPrice: o.price,
             quantity: o.quantity, sl: o.sl || null, tp: o.tp || null,
             status: o.status || 'OPEN', createdAt: new Date(o.createdAt).getTime(),
             closePrice: o.closePrice, realizedPnl: o.pnl
          })));
        }
        initDone.current = true;
      } catch {
        toast.error('Cloud sync unavailable — running in demo mode');
      }
    }
    init();
  }, [userId]);

  const saveBalance = useCallback(async (newBal: number) => {
    if (!userId) return;
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ balance: newBal })
      });
    } catch {}
  }, [uid, userId]);

  const placeOrder = useCallback(async (symbol: string, type: OrderType, price: number, quantity: number, sl: number | null, tp: number | null) => {
    const entryPrice = +price.toFixed(2);
    const currency = getCurrencySymbol(symbol);
    const isUSD = currency === '$';
    
    // Convert base USD asset price to INR equivalent for wallet impact
    // Assumes wallet base currency is globally INR
    const USD_INR_RATE = 83.5;
    const effectivePrice = isUSD ? entryPrice * USD_INR_RATE : entryPrice;
    const marginReq = +(effectivePrice * quantity).toFixed(2);

    if (balance < marginReq) {
      toast.error(`Insufficient funds! Need ₹${marginReq.toLocaleString(undefined, {minimumFractionDigits: 2})}`);
      return false;
    }

    let orderId = 'local_' + Date.now();

    // Save order to MongoDB
    if (userId) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
          body: JSON.stringify({ symbol, type, price: entryPrice, quantity, sl: sl ? +sl.toFixed(2) : null, tp: tp ? +tp.toFixed(2) : null })
        });
        const order = await res.json();
        if (order._id) orderId = order._id;
      } catch {}
    }

    // Update balance
    const newBal = +(balance - marginReq).toFixed(2);
    setBalance(newBal);
    saveBalance(newBal);

    setPositions(prev => [{ id: orderId, symbol, type, entryPrice, quantity, sl: sl ? +sl.toFixed(2) : null, tp: tp ? +tp.toFixed(2) : null, status: 'OPEN', createdAt: Date.now() }, ...prev]);

    // Save notification to MongoDB
    const notifDesc = `${type} ${quantity}x ${symbol} @ ${currency}${entryPrice.toFixed(2)} | Margin: ₹${marginReq.toLocaleString(undefined, {minimumFractionDigits: 2})} | Balance: ₹${newBal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (userId) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
          body: JSON.stringify({ userId: uid, title: `📈 ${type} Order Executed`, desc: notifDesc, type: 'TRADE' })
        });
      } catch {}
    }

    toast.success(`${type} ${quantity}x ${symbol} @ ${currency}${entryPrice.toFixed(2)}`);
    fireNotification(`📈 ${type} Order Executed`, notifDesc, 'TRADE');
    return true;
  }, [balance, saveBalance, uid, userId]);

  const closePosition = useCallback(async (id: string, currentPrice: number) => {
    const pos = positions.find(p => p.id === id);
    if (!pos || pos.status === 'CLOSED') return;

    const closePrice = +currentPrice.toFixed(2);
    const rawAssetPnl = +(pos.type === 'BUY' 
      ? (closePrice - pos.entryPrice) * pos.quantity 
      : (pos.entryPrice - closePrice) * pos.quantity);
      
    // Convert to INR wallet
    const currency = getCurrencySymbol(pos.symbol);
    const isUSD = currency === '$';
    const USD_INR_RATE = 83.5;
    const convertedPnl = isUSD ? rawAssetPnl * USD_INR_RATE : rawAssetPnl;
    const pnl = +convertedPnl.toFixed(2);

    const marginUsed = isUSD ? (pos.entryPrice * pos.quantity * USD_INR_RATE) : (pos.entryPrice * pos.quantity);
    const returnCapital = +(marginUsed + pnl).toFixed(2);
    const newBal = +(balance + returnCapital).toFixed(2);
    const pnlStr = `${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // Update order in MongoDB
    if (userId) {
      try { await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-user-id': uid }, body: JSON.stringify({ status: 'CLOSED', closePrice, pnl }) }); } catch {}
      // Save journal entry
      try { await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': uid }, body: JSON.stringify({ symbol: pos.symbol, type: pos.type, entry: pos.entryPrice, exit: closePrice, qty: pos.quantity, status: pnl >= 0 ? 'WIN' : 'LOSS', pnl }) }); } catch {}
    }

    // Update balance
    setBalance(newBal);
    saveBalance(newBal);

    // Save notification
    const notifDesc = `${pos.type} ${pos.quantity}x ${pos.symbol} closed @ ${currency}${closePrice.toFixed(2)} | P&L: ${pnlStr} | Balance: ₹${newBal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if (userId) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
          body: JSON.stringify({ userId: uid, title: pnl >= 0 ? '✅ Profit Booked' : '❌ Loss Realized', desc: notifDesc, type: pnl >= 0 ? 'SUCCESS' : 'ALERT' })
        });
      } catch {}
    }

    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: 'CLOSED', closePrice, realizedPnl: pnl, closedAt: Date.now() } : p));

    if (pnl >= 0) toast.success(`🎯 Profit: +${currency}${pnl.toFixed(2)}`);
    else toast.error(`📉 Loss: ${currency}${pnl.toFixed(2)}`);
    fireNotification(pnl >= 0 ? '✅ Profit Booked' : '❌ Loss Realized', notifDesc, pnl >= 0 ? 'SUCCESS' : 'ALERT');
  }, [positions, balance, saveBalance, uid, userId]);

  const checkTriggers = useCallback((symbol: string, currentPrice: number) => {
    positions.forEach(pos => {
      if (pos.status !== 'OPEN' || pos.symbol !== symbol) return;
      if (pos.type === 'BUY') {
        if (pos.sl && currentPrice <= pos.sl) closePosition(pos.id, currentPrice);
        if (pos.tp && currentPrice >= pos.tp) closePosition(pos.id, currentPrice);
      } else {
        if (pos.sl && currentPrice >= pos.sl) closePosition(pos.id, currentPrice);
        if (pos.tp && currentPrice <= pos.tp) closePosition(pos.id, currentPrice);
      }
    });
  }, [positions, closePosition]);

  return { balance, positions, placeOrder, closePosition, checkTriggers, isCloud };
}
