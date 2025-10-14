import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getWatchlist, 
  setWatchlist, 
  addToWatchlist, 
  removeFromWatchlist,
  getCachedData,
  setCachedData
} from '../storage.js';

describe('Watchlist Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default watchlist when none exists', () => {
    const watchlist = getWatchlist();
    expect(watchlist).toEqual(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']);
  });

  it('sets and gets watchlist', () => {
    setWatchlist(['AAPL', 'GOOGL']);
    const watchlist = getWatchlist();
    expect(watchlist).toEqual(['AAPL', 'GOOGL']);
  });

  it('adds ticker to watchlist', () => {
    setWatchlist(['AAPL']);
    addToWatchlist('GOOGL');
    const watchlist = getWatchlist();
    expect(watchlist).toContain('GOOGL');
  });

  it('does not add duplicate tickers', () => {
    setWatchlist(['AAPL']);
    addToWatchlist('aapl');
    const watchlist = getWatchlist();
    expect(watchlist.filter(s => s === 'AAPL').length).toBe(1);
  });

  it('removes ticker from watchlist', () => {
    setWatchlist(['AAPL', 'GOOGL', 'MSFT']);
    removeFromWatchlist('GOOGL');
    const watchlist = getWatchlist();
    expect(watchlist).toEqual(['AAPL', 'MSFT']);
  });
});

describe('Cache Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null for non-existent cache', () => {
    const cached = getCachedData('TEST');
    expect(cached).toBeNull();
  });

  it('caches and retrieves data', () => {
    const testData = { price: 150, symbol: 'AAPL' };
    setCachedData('AAPL', testData);
    const cached = getCachedData('AAPL');
    expect(cached).toEqual(testData);
  });

  it('returns null for expired cache', () => {
    const testData = { price: 150 };
    // Manually set expired cache
    const expired = {
      data: testData,
      timestamp: Date.now() - 70000, // 70 seconds ago
    };
    localStorage.setItem('stock-cache-AAPL', JSON.stringify(expired));
    
    const cached = getCachedData('AAPL');
    expect(cached).toBeNull();
  });

  it('returns valid fresh cache', () => {
    const testData = { price: 150 };
    const fresh = {
      data: testData,
      timestamp: Date.now() - 30000, // 30 seconds ago
    };
    localStorage.setItem('stock-cache-AAPL', JSON.stringify(fresh));
    
    const cached = getCachedData('AAPL');
    expect(cached).toEqual(testData);
  });
});

