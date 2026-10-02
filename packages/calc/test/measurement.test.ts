import { describe, expect, it } from 'vitest';
import { checkMeasurement } from '../src';

describe('checkMeasurement', () => {
  it('accepts usual measurements', () => {
    expect(checkMeasurement({ widthMm: 2_000, heightMm: 2_600, installation: 'wall' })).toEqual({
      errors: [],
      warnings: [],
    });
  });

  it('requires positive integer width and height', () => {
    expect(checkMeasurement({ widthMm: 0, heightMm: 1.5, installation: 'wall' }).errors).toEqual([
      'Informe a largura.',
      'Informe a altura.',
    ]);
  });

  it('warns about measurements outside the usual range', () => {
    expect(
      checkMeasurement({ widthMm: 200, heightMm: 6_000, installation: 'wall' }).warnings,
    ).toEqual([
      'Largura de 0,20 m está fora do comum. Confira a medida.',
      'Altura de 6,00 m está fora do comum. Confira a medida.',
    ]);
    expect(
      checkMeasurement({ widthMm: 9_000, heightMm: 100, installation: 'wall' }).warnings,
    ).toEqual([
      'Largura de 9,00 m está fora do comum. Confira a medida.',
      'Altura de 0,10 m está fora do comum. Confira a medida.',
    ]);
  });

  it('accepts custom limits', () => {
    const limits = { minWidthMm: 100, maxWidthMm: 10_000, minHeightMm: 100, maxHeightMm: 10_000 };
    expect(
      checkMeasurement({ widthMm: 9_000, heightMm: 6_000, installation: 'wall' }, limits).warnings,
    ).toEqual([]);
  });
});
