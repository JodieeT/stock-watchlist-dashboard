import { describe, it, expect } from 'vitest';
import { formatPrice, formatChange, formatTime } from '../format.js';

describe('formatPrice', () => {
  it('formats price with dollar sign and 2 decimals', () => {
    expect(formatPrice(123.456)).toBe('$123.46');
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(0.99)).toBe('$0.99');
  });
});

describe('formatChange', () => {
  it('formats positive changes with + sign', () => {
    expect(formatChange(5.25)).toBe('+5.25%');
    expect(formatChange(0.01)).toBe('+0.01%');
  });

  it('formats negative changes with - sign', () => {
    expect(formatChange(-3.75)).toBe('-3.75%');
  });

  it('formats zero change', () => {
    expect(formatChange(0)).toBe('+0.00%');
  });
});

describe('formatTime', () => {
  it('formats recent time as "Just now"', () => {
    const now = Date.now();
    expect(formatTime(now)).toBe('Just now');
  });

  it('formats minutes ago', () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    expect(formatTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    expect(formatTime(twoHoursAgo)).toBe('2h ago');
  });
});

