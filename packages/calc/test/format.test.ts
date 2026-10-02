import { describe, expect, it } from 'vitest';
import { formatFactor, formatMeters, formatSquareMeters } from '../src';

describe('formatMeters', () => {
  it.each([
    [1850, '1,85 m'],
    [1855, '1,855 m'],
    [2000, '2,00 m'],
    [300, '0,30 m'],
    [10, '0,01 m'],
  ])('%i mm -> %s', (mm, expected) => {
    expect(formatMeters(mm)).toBe(expected);
  });
});

describe('formatSquareMeters', () => {
  it.each([
    [2_400_000, '2,40 m²'],
    [1_005_000, '1,01 m²'],
    [0, '0,00 m²'],
    [12_340_000, '12,34 m²'],
  ])('%i mm² -> %s', (mm2, expected) => {
    expect(formatSquareMeters(mm2)).toBe(expected);
  });
});

describe('formatFactor', () => {
  it.each([
    [25_000, '2,5'],
    [20_000, '2'],
    [27_500, '2,75'],
  ])('%i bps -> %s', (bps, expected) => {
    expect(formatFactor(bps)).toBe(expected);
  });
});
