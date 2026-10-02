import { describe, expect, it } from 'vitest';
import { parseBrDecimal, parseCentimetersToMm, parseReaisToCents } from '../src';

describe('parseBrDecimal', () => {
  it.each([
    ['1.234,56', 2, 123456],
    ['1234,56', 2, 123456],
    ['1234.56', 2, 123456],
    ['R$ 60', 2, 6000],
    ['0,5', 2, 50],
    ['1,005', 2, 101],
    ['1,004', 2, 100],
    ['12,', 2, 1200],
    ['7', 0, 7],
  ])('%s (%i decimals) -> %i', (input, decimals, expected) => {
    expect(parseBrDecimal(input, decimals)).toBe(expected);
  });

  it.each(['', 'abc', '1,2,3', '-5', ',5'])('rejects %j', (input) => {
    expect(parseBrDecimal(input, 2)).toBeNull();
  });
});

describe('field helpers', () => {
  it('converts centimeters to millimeters', () => {
    expect(parseCentimetersToMm('185')).toBe(1850);
    expect(parseCentimetersToMm('185,5')).toBe(1855);
  });

  it('converts reais to cents', () => {
    expect(parseReaisToCents('1.234,56')).toBe(123456);
  });
});
