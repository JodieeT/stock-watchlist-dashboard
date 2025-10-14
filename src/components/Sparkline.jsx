import { useMemo } from 'react';

export default function Sparkline({ data, color = 'rgb(59, 130, 246)', height = 60 }) {
  const { path, min, max, change } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', min: 0, max: 0, change: 0 };

    const values = data;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const width = 300;
    const padding = 4;
    const step = (width - padding * 2) / (values.length - 1);
    
    const points = values.map((value, index) => {
      const x = padding + index * step;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });
    
    const pathString = `M ${points.join(' L ')}`;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    return { path: pathString, min, max, change };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-16 text-gray-400 dark:text-gray-500">
        <p>No data available</p>
        <p className="text-xs mt-1">This may happen outside market hours</p>
      </div>
    );
  }

  const isPositive = change >= 0;
  const strokeColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

  return (
    <div className="flex flex-col gap-2">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 300 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
      >
        {/* Grid lines */}
        <line
          x1="0"
          y1={height / 2}
          x2="300"
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-200 dark:text-gray-700"
          strokeDasharray="2,2"
        />
        
        {/* Sparkline */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Start point */}
        <circle
          cx={data.length > 0 ? 4 : 0}
          cy={height - 4 - ((data[0] - min) / (max - min || 1)) * (height - 8)}
          r="2"
          fill={strokeColor}
          opacity="0.6"
        />
        
        {/* End point */}
        <circle
          cx={296}
          cy={height - 4 - ((data[data.length - 1] - min) / (max - min || 1)) * (height - 8)}
          r="3"
          fill={strokeColor}
        />
      </svg>
      
      {/* Stats */}
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Low: ${min.toFixed(2)}</span>
        <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
        <span>High: ${max.toFixed(2)}</span>
      </div>
    </div>
  );
}

