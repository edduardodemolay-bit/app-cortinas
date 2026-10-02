import { describe, expect, it } from 'vitest';
import { ceilDiv, roundDiv, roundUpTo } from '../src';

describe('ceilDiv', () => {
  it('rounds up partial results', () => {
    expect(ceilDiv(5000, 1400)).toBe(4);
  });

  it('keeps exact results', () => {
    expect(ceilDiv(2800, 1400)).toBe(2);
  });

  it('rejects non-integers and non-positive divisors', () => {
    expect(() => ceilDiv(1.5, 2)).toThrow(RangeError);
    expect(() => ceilDiv(10, 0)).toThrow(RangeError);
  });
});

describe('roundDiv', () => {
  it('rounds half up', () => {
    expect(roundDiv(5, 2)).toBe(3);
    expect(roundDiv(4, 3)).toBe(1);
    expect(roundDiv(0, 7)).toBe(0);
  });

  it('rejects negatives, non-integers and non-positive divisors', () => {
    expect(() => roundDiv(-1, 2)).toThrow(RangeError);
    expect(() => roundDiv(1.5, 2)).toThrow(RangeError);
    expect(() => roundDiv(1, 0)).toThrow(RangeError);
  });
});

describe('roundUpTo', () => {
  it('rounds up to the next multiple', () => {
    expect(roundUpTo(1434, 100)).toBe(1500);
    expect(roundUpTo(1500, 100)).toBe(1500);
  });

  it('leaves the value unchanged when the increment is 0', () => {
    expect(roundUpTo(1434, 0)).toBe(1434);
  });
});
