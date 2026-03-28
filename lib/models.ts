import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: String,
  desc: String,
  type: { type: String, default: 'INFO' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const JournalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  symbol: String,
  type: String,
  entry: Number,
  exit: Number,
  qty: Number,
  status: String,
  pnl: Number,
  setup: String,
  notes: String,
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  balance: { type: Number, default: 10000 },
  watchlist: { type: [String], default: ['BTC-USD', 'ETH-USD', 'RELIANCE.NS', 'AAPL', 'TSLA'] },
  settings: {
    selectedSymbol: { type: String, default: 'BTC-USD' },
    isDark: { type: Boolean, default: true },
    rightTab: { type: String, default: 'AI' },
    chartType: { type: String, default: 'candle' },
    timeframe: { type: String, default: '1D' },
    showEMA9: { type: Boolean, default: true },
    showEMA21: { type: Boolean, default: true },
    showEMA50: { type: Boolean, default: true },
    showVWAP: { type: Boolean, default: false },
    showRSI: { type: Boolean, default: false },
    showVolume: { type: Boolean, default: true },
  }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  symbol: String,
  type: String,
  price: Number,
  quantity: Number,
  sl: Number,
  tp: Number,
  pnl: Number,
  closePrice: Number,
  status: { type: String, default: 'OPEN' },
  createdAt: { type: Date, default: Date.now }
});

const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  symbol: String,
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const Journal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
