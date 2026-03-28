# 📈 Lucid Signals - Intelligence Terminal

A production-grade algorithmic trading terminal that bridges the gap between sophisticated quantitative data and intuitive, gorgeous UI. Engineered from the ground up for total immersion, blazing speed, and cross-market agility.

## 🚀 Key Features

### 🌍 Global Deep-Market Integration
- **Hybrid Data Pipeline:** Seamless integration querying both local Indian assets (NSE/BSE like `RELIANCE`, `NIFTY`, `BANKNIFTY`) and global tickers (Forex/Crypto/NASDAQ).
- **Intelligent Status Indicators:** Sub-second autonomous active-trading checks. Watchlist assets display a "Green (LIVE)" glowing dot when the market is actively open and pulsing, and automatically shift to "Red (STATIC)" during after-hours—evaluated completely independently per asset.

### ⚡ Ultra-Optimized 'Zero' Latency UI 
- **DOM-Bound Event Tracking:** Trading charts update with deep `subscribeVisibleLogicalRangeChange` hooks, guaranteeing markers, tools, and visual elements stay anchored flawlessly at 120Hz+, completely immune to scroll or zoom detachment.
- **Shared Master State Engine:** Clicking any item in the Watchlist instantly overrides the entire terminal layout with synced, cached prices. Absolutely zero default-screen flashing, zero layout thrashing, and zero fake data states between API calls.
- **Infinite Master Ticker:** The horizontal scrolling Top Bar is structurally bound *directly* to your dynamically active Watchlist memory array. It continuously inherits the exact live UI micro-fluctuations in a seamless infinite loop without making a single redundant API call.

### 💰 Adaptive Cross-Currency Paper Engine
- **Intelligent Margin Logic:** Trading account values stay strictly pegged natively to Indian Rupees (₹).
- **Auto-conversion:** Buy 1 unit of Bitcoin at $68,000? The terminal automatically reads the underlying US Dollar ticker footprint and transparently converts your required margin and continuous live P&L mathematically into INR (₹) (e.g., $1 = ₹83.50).

### 🤖 Generative AI Co-Pilot
- **Market-Aware Context Stream:** Gemini-Flash immediately synchronizes with the Active Chart. Asking the bot for technical assistance inherently intercepts exact technical values happening on the screen instantly (EMA9, EMA21, RSI, Live Price).
- **Autonomous Localization:** AI consistently outputs structured technical strategies perfectly aligned to local currency logic (₹ vs $).

## ⚙️ Core Architecture
- **Next.js 14 App Router** (Optimal Server/Client segregation)
- **Lightweight-Charts v4** (High-Performance Canvas Rendering)
- **Tailwind CSS + Framer Motion** (State-of-the-art Fluid Micro-Animations)
- **Mongoose + MongoDB Atlas** (Persistent cloud wallet and watchlist sync)
- **Google Generative AI SDK** (Native Gemini Flash integrations)

*Engineered to feel exactly like an institution-tier algorithmic workstation. Welcome to the future of retail market-making.*
