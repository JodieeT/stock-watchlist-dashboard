# Stock Watchlist Dashboard

## Track Chosen: Option A (Frontend-Heavy)

## Setup/Run Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your Finnhub API key to .env
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Features Added Beyond Core

### Bonus Features
- **Mini-chart Sparklines**: Click any row to see 1D/1W price history with interactive SVG charts
- **Dark Mode Toggle**

### Additional Enhancements
- Background refresh (60-second auto-update)
- Progressive loading (stocks appear as they load)
- Invalid symbol validation with error handling
- 23 unit tests covering core functionality

