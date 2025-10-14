import { getCachedData, setCachedData } from '../utils/storage.js';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'demo';
const BASE_URL = 'https://finnhub.io/api/v1';

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minDelay = 1100;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minDelay - timeSinceLastRequest)
        );
      }
      
      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }
    
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

export const fetchStockQuote = async (symbol) => {
  const cached = getCachedData(symbol);
  if (cached) return cached;
  
  return rateLimiter.add(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.c === 0 && data.pc === 0) {
        throw new Error(`Invalid or unknown stock symbol: ${symbol}`);
      }
      
      const quote = {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        updatedAt: Date.now(),
      };
      
      setCachedData(symbol, quote);
      return quote;
    } catch (error) {
      throw error;
    }
  });
};

export const fetchMultipleQuotes = async (symbols, onUpdate) => {
  const promises = symbols.map(async (symbol) => {
    try {
      const quote = await fetchStockQuote(symbol);
      if (onUpdate) onUpdate(quote);
      return quote;
    } catch (error) {
      const cached = getCachedData(symbol);
      if (cached) {
        if (onUpdate) onUpdate(cached);
        return cached;
      }
      
      const errorQuote = {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        updatedAt: Date.now(),
        error: true,
        errorMessage: error.message || 'Failed to fetch data',
      };
      
      if (onUpdate) onUpdate(errorQuote);
      return errorQuote;
    }
  });
  
  return Promise.all(promises);
};

