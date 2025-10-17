const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';

const generateMockData = (symbol, days) => {
  const basePrice = { 
    'AAPL': 180, 
    'GOOGL': 140, 
    'MSFT': 380, 
    'AMZN': 170, 
    'TSLA': 250 
  }[symbol] || 100;
  
  const prices = [];
  const timestamps = [];
  const now = Date.now() / 1000;
  
  for (let i = days; i >= 0; i--) {
    // Random walk with slight upward bias
    const randomChange = (Math.random() - 0.48) * 5;
    const price = basePrice + randomChange + (Math.sin(i / 3) * 3);
    prices.push(Number(price.toFixed(2)));
    timestamps.push(Math.floor(now - (i * 24 * 60 * 60)));
  }
  
  return {
    prices,
    timestamps,
    highs: prices.map(p => p * 1.02),
    lows: prices.map(p => p * 0.98),
    opens: prices,
    volumes: prices.map(() => Math.floor(Math.random() * 10000000)),
  };
};

export const fetchHistoricalData = async (symbol, resolution = 'D', days = 7) => {
  const now = Math.floor(Date.now() / 1000);
  const from = now - (days * 24 * 60 * 60);
  
  try {
    let url = `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${API_KEY}`;
    let response = await fetch(url);
    
    if (!response.ok && response.status === 403) {
      response = await fetch(
        `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}`,
        { headers: { 'X-Finnhub-Token': API_KEY } }
      );
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.s === 'no_data' || !data.c || data.c.length === 0) {
      return generateMockData(symbol, days);
    }
    
    return {
      prices: data.c,
      timestamps: data.t,
      highs: data.h,
      lows: data.l,
      opens: data.o,
      volumes: data.v,
    };
  } catch (error) {
    return generateMockData(symbol, days);
  }
};

export const fetchIntradayData = async (symbol) => {
  return fetchHistoricalData(symbol, 'D', 7);
};

export const fetchWeeklyData = async (symbol) => {
  return fetchHistoricalData(symbol, 'D', 30);
};

