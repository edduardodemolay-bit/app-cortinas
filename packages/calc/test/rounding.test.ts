import { describe, expect, it } from 'vitest';
import { ceilDiv } from '../src';

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
