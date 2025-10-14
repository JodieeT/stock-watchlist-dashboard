const WATCHLIST_KEY = 'stock-watchlist';
const CACHE_KEY_PREFIX = 'stock-cache-';
const CACHE_DURATION = 60 * 1000; // 60 seconds

export const getWatchlist = () => {
  const stored = localStorage.getItem(WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
};

export const setWatchlist = (symbols) => {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
};

export const addToWatchlist = (symbol) => {
  const watchlist = getWatchlist();
  if (!watchlist.includes(symbol.toUpperCase())) {
    setWatchlist([...watchlist, symbol.toUpperCase()]);
  }
};

export const removeFromWatchlist = (symbol) => {
  const watchlist = getWatchlist();
  setWatchlist(watchlist.filter(s => s !== symbol));
};

export const getCachedData = (key) => {
  const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
  if (!cached) return null;
  
  const parsed = JSON.parse(cached);
  const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
  
  if (isExpired) {
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
    return null;
  }
  
  return parsed.data;
};

export const setCachedData = (key, data) => {
  const cached = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cached));
};

