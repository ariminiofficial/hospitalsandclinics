import { describe, it, expect } from 'vitest';
import { numberToWords } from '../shared/utils/amountInWords.js';

describe('numberToWords', () => {
  it('converts 0 to Rupees Zero Only', () => {
    expect(numberToWords(0)).toBe('Rupees Zero Only');
  });

  it('converts single digits and teens correctly', () => {
    expect(numberToWords(5)).toBe('Rupees Five Only');
    expect(numberToWords(14)).toBe('Rupees Fourteen Only');
  });

  it('converts tens and hundreds correctly', () => {
    expect(numberToWords(50)).toBe('Rupees Fifty Only');
    expect(numberToWords(500)).toBe('Rupees Five Hundred Only');
    expect(numberToWords(750)).toBe('Rupees Seven Hundred and Fifty Only');
  });

  it('converts thousands, lakhs and crores correctly', () => {
    expect(numberToWords(2500)).toBe('Rupees Two Thousand Five Hundred Only');
    expect(numberToWords(150000)).toBe('Rupees One Lakh Fifty Thousand Only');
  });

  it('handles negative or invalid inputs gracefully', () => {
    expect(numberToWords(null)).toBe('Rupees Zero Only');
    expect(numberToWords('invalid')).toBe('Rupees Zero Only');
  });
});
