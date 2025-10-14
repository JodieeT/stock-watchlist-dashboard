import { describe, it, expect } from 'vitest';
import { sortStocks } from '../sorting.js';

const mockStocks = [
  { symbol: 'AAPL', price: 150, changePercent: 2.5, updatedAt: 1000 },
  { symbol: 'GOOGL', price: 2800, changePercent: -1.2, updatedAt: 3000 },
  { symbol: 'MSFT', price: 300, changePercent: 0.8, updatedAt: 2000 },
];

describe('sortStocks', () => {
  it('sorts by symbol ascending', () => {
    const sorted = sortStocks(mockStocks, 'symbol', 'asc');
    expect(sorted[0].symbol).toBe('AAPL');
    expect(sorted[1].symbol).toBe('GOOGL');
    expect(sorted[2].symbol).toBe('MSFT');
  });

  it('sorts by symbol descending', () => {
    const sorted = sortStocks(mockStocks, 'symbol', 'desc');
    expect(sorted[0].symbol).toBe('MSFT');
    expect(sorted[1].symbol).toBe('GOOGL');
    expect(sorted[2].symbol).toBe('AAPL');
  });

  it('sorts by price ascending', () => {
    const sorted = sortStocks(mockStocks, 'price', 'asc');
    expect(sorted[0].price).toBe(150);
    expect(sorted[1].price).toBe(300);
    expect(sorted[2].price).toBe(2800);
  });

  it('sorts by price descending', () => {
    const sorted = sortStocks(mockStocks, 'price', 'desc');
    expect(sorted[0].price).toBe(2800);
    expect(sorted[1].price).toBe(300);
    expect(sorted[2].price).toBe(150);
  });

  it('sorts by changePercent ascending', () => {
    const sorted = sortStocks(mockStocks, 'changePercent', 'asc');
    expect(sorted[0].changePercent).toBe(-1.2);
    expect(sorted[1].changePercent).toBe(0.8);
    expect(sorted[2].changePercent).toBe(2.5);
  });

  it('sorts by updatedAt descending', () => {
    const sorted = sortStocks(mockStocks, 'updatedAt', 'desc');
    expect(sorted[0].updatedAt).toBe(3000);
    expect(sorted[1].updatedAt).toBe(2000);
    expect(sorted[2].updatedAt).toBe(1000);
  });

  it('does not mutate original array', () => {
    const original = [...mockStocks];
    sortStocks(mockStocks, 'price', 'asc');
    expect(mockStocks).toEqual(original);
  });
});

