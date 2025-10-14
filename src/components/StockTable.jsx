import { useState, useEffect } from 'react';
import { ArrowUpDown, Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice, formatChange, formatTime } from '../utils/format.js';
import { sortStocks } from '../utils/sorting.js';
import Sparkline from './Sparkline.jsx';
import { fetchIntradayData, fetchWeeklyData } from '../services/historicalApi.js';

export default function StockTable({ stocks, onRemove, loading }) {
  const [sortColumn, setSortColumn] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('1D');
  const [loadingChart, setLoadingChart] = useState(false);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleRowClick = async (symbol) => {
    if (expandedRow === symbol) {
      setExpandedRow(null);
      setChartData(null);
    } else {
      setExpandedRow(symbol);
      setChartData(undefined); // undefined = loading, null = error, [] = no data
      await loadChartData(symbol, chartPeriod);
    }
  };

  const loadChartData = async (symbol, period) => {
    setLoadingChart(true);
    setChartData(undefined);
    try {
      const data = period === '1D' 
        ? await fetchIntradayData(symbol)
        : await fetchWeeklyData(symbol);
      setChartData(data.prices || []);
    } catch (error) {
      setChartData(null);
    } finally {
      setLoadingChart(false);
    }
  };

  const handlePeriodChange = async (period) => {
    setChartPeriod(period);
    if (expandedRow) {
      await loadChartData(expandedRow, period);
    }
  };

  useEffect(() => {
    setExpandedRow(null);
    setChartData(null);
    setLoadingChart(false);
  }, [stocks.length]);

  const sortedStocks = sortStocks(stocks, sortColumn, sortDirection);

  const SortIcon = ({ column }) => (
    <ArrowUpDown
      size={16}
      className={`inline ml-1 ${
        sortColumn === column ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
      }`}
    />
  );

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No stocks in your watchlist</p>
        <p className="text-sm mt-2">Add a ticker to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              onClick={() => handleSort('symbol')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Symbol <SortIcon column="symbol" />
            </th>
            <th
              onClick={() => handleSort('price')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Price <SortIcon column="price" />
            </th>
            <th
              onClick={() => handleSort('changePercent')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Change % <SortIcon column="changePercent" />
            </th>
            <th
              onClick={() => handleSort('updatedAt')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Updated <SortIcon column="updatedAt" />
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedStocks.map((stock) => (
            <>
              <tr
                key={stock.symbol}
                onClick={() => handleRowClick(stock.symbol)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                  stock.error ? 'bg-red-50 dark:bg-red-900/10' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {expandedRow === stock.symbol ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                      {stock.error && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                          (Invalid)
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {stock.error ? (
                      <span className="text-red-600 dark:text-red-400">Error</span>
                    ) : stock.price > 0 ? (
                      formatPrice(stock.price)
                    ) : (
                      '-'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {stock.error ? (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {stock.errorMessage || 'Failed to fetch'}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stock.changePercent > 0
                          ? 'text-green-600 dark:text-green-400'
                          : stock.changePercent < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {stock.changePercent > 0 ? (
                        <TrendingUp size={16} />
                      ) : stock.changePercent < 0 ? (
                        <TrendingDown size={16} />
                      ) : null}
                      {stock.price > 0 ? formatChange(stock.changePercent) : '-'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(stock.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(stock.symbol);
                    }}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${stock.symbol}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
              
              {/* Expanded row with chart */}
              {expandedRow === stock.symbol && (
                <tr key={`${stock.symbol}-chart`}>
                  <td colSpan="5" className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-4">
                      {/* Info banner - only show if using demo data */}
                      {chartData && chartData.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                          📊 Price chart for {expandedRow} ({chartPeriod === '1D' ? '1 day' : '1 week'})
                        </div>
                      )}
                      
                      {/* Period toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Period:</span>
                        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePeriodChange('1D');
                            }}
                            className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                              chartPeriod === '1D'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            1D
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePeriodChange('1W');
                            }}
                            className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                              chartPeriod === '1W'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            1W
                          </button>
                        </div>
                      </div>
                      
                      {/* Chart */}
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[120px] flex items-center justify-center">
                        {chartData === undefined || loadingChart ? (
                          <div className="flex flex-col items-center justify-center gap-3 py-8">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
                              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 absolute top-0 left-0"></div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                              Loading chart data...
                            </p>
                          </div>
                        ) : chartData === null ? (
                          <div className="flex flex-col items-center justify-center py-4 text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium">Failed to load chart data</p>
                            <p className="text-xs mt-1">Check console for details</p>
                          </div>
                        ) : (
                          <Sparkline data={chartData} height={80} />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

