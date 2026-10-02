import { describe, expect, it } from 'vitest';
import { formatBRL } from '../src';

describe('formatBRL', () => {
  it.each([
    [0, 'R$ 0,00'],
    [5, 'R$ 0,05'],
    [123456, 'R$ 1.234,56'],
    [100000000, 'R$ 1.000.000,00'],
    [-2550, '-R$ 25,50'],
  ])('%i -> %s', (cents, expected) => {
    expect(formatBRL(cents)).toBe(expected);
  });
});
