import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AddTickerForm({ onAdd, disabled }) {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmed = symbol.trim().toUpperCase();
    
    if (!trimmed) {
      setError('Please enter a stock symbol');
      return;
    }
    
    if (!/^[A-Z]{1,5}$/.test(trimmed)) {
      setError('Invalid symbol format (1-5 letters only)');
      return;
    }
    
    onAdd(trimmed);
    setSymbol('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <input
          type="text"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            setError('');
          }}
          placeholder="Add ticker (e.g., AAPL)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={disabled}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={20} />
        Add
      </button>
    </form>
  );
}

