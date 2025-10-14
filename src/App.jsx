import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import StockTable from './components/StockTable.jsx';
import AddTickerForm from './components/AddTickerForm.jsx';
import DarkModeToggle from './components/DarkModeToggle.jsx';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from './utils/storage.js';
import { fetchMultipleQuotes } from './services/stockApi.js';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStocks = useCallback(async (showLoading = true) => {
    const watchlist = getWatchlist();
    
    if (watchlist.length === 0) {
      setStocks([]);
      return;
    }

    showLoading ? setLoading(true) : setIsRefreshing(true);
    setError('');

    try {
      const quotes = await fetchMultipleQuotes(watchlist, (quote) => {
        setStocks(prev => {
          const existing = prev.find(s => s.symbol === quote.symbol);
          if (existing) {
            return prev.map(s => s.symbol === quote.symbol ? quote : s);
          }
          return [...prev, quote];
        });
      });

      setStocks(quotes);
      setLastRefresh(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stocks');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    const interval = setInterval(() => loadStocks(false), 60000);
    return () => clearInterval(interval);
  }, [loadStocks]);

  const handleAddTicker = async (symbol) => {
    const watchlist = getWatchlist();
    
    if (watchlist.includes(symbol)) {
      setError(`${symbol} is already in your watchlist`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    addToWatchlist(symbol);
    setError('');
    
    try {
      setLoading(true);
      const quote = await fetchMultipleQuotes([symbol]);
      
      if (quote[0]?.error) {
        setError(`"${symbol}" is not a valid stock symbol. Please check and try again.`);
        removeFromWatchlist(symbol);
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      await loadStocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to add ${symbol}`);
      removeFromWatchlist(symbol);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTicker = (symbol) => {
    removeFromWatchlist(symbol);
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  const handleManualRefresh = () => {
    loadStocks(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Stock Watchlist Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your favorite stocks in real-time
            </p>
          </div>
          <DarkModeToggle />
        </div>

        {/* Add Ticker Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <AddTickerForm onAdd={handleAddTicker} disabled={loading} />
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stocks.length} {stocks.length === 1 ? 'stock' : 'stocks'} in watchlist
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Stock Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {loading && stocks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                <p className="text-gray-600 dark:text-gray-400">Loading stocks...</p>
              </div>
            </div>
          ) : (
            <StockTable
              stocks={stocks}
              onRemove={handleRemoveTicker}
              loading={loading || isRefreshing}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Data updates every 60 seconds · Powered by Finnhub
          </p>
          <p className="mt-1">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

