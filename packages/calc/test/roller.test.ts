import { describe, expect, it } from 'vitest';
import { calculateRoller, type RollerInput } from '../src';

const base: RollerInput = {
  measurement: { widthMm: 1_500, heightMm: 1_600, installation: 'wall' },
  product: { name: 'Translúcido', pricePerM2Cents: 15_000, maxWidthMm: 3_000 },
  installationPriceCents: 4_000,
};

describe('calculateRoller', () => {
  it('charges width × height per m²', () => {
    // 1,50 × 1,60 = 2,40 m² × R$ 150,00 = R$ 360,00
    const result = calculateRoller(base);

    expect(result.lines.map((l) => [l.kind, l.quantity, l.unit, l.totalCents])).toEqual([
      ['blind', 2_400_000, 'm2', 36_000],
      ['installation', 1, 'un', 4_000],
    ]);
    expect(result.totalCents).toBe(40_000);
    expect(result.assumptions).toEqual([
      'Medidas cobradas em múltiplos de 0,10 m: 1,50 m × 1,60 m.',
    ]);
    expect(result.warnings).toEqual([]);
  });

  it('rounds width and height up to the billing increment', () => {
    // 1,53 × 1,61 → 1,60 × 1,70 = 2,72 m² × R$ 150,00 = R$ 408,00
    const result = calculateRoller({
      ...base,
      measurement: { widthMm: 1_530, heightMm: 1_610, installation: 'wall' },
    });
    expect(result.lines[0]).toMatchObject({ quantity: 2_720_000, totalCents: 40_800 });
  });

  it('applies the minimum area', () => {
    // 0,80 × 1,00 = 0,80 m² → charged 1,00 m²
    const result = calculateRoller({
      ...base,
      measurement: { widthMm: 800, heightMm: 1_000, installation: 'wall' },
    });
    expect(result.lines[0]).toMatchObject({ quantity: 1_000_000, totalCents: 15_000 });
    expect(result.assumptions).toContain('Área de 0,80 m² abaixo do mínimo: cobrado 1,00 m².');
  });

  it('warns when the blind is wider than the fabric allows', () => {
    const result = calculateRoller({
      ...base,
      measurement: { widthMm: 3_100, heightMm: 1_600, installation: 'wall' },
    });
    expect(result.warnings).toEqual([
      'Largura de 3,10 m maior que o máximo de Translúcido (3,00 m). Precisa de emenda ou de outro tecido.',
    ]);
  });

  it('deducts the recess clearance only when configured', () => {
    const recess = { widthMm: 1_510, heightMm: 1_600, installation: 'recess' as const };

    const noDeduction = calculateRoller({ ...base, measurement: recess });
    expect(noDeduction.lines[0]?.quantity).toBe(1_600 * 1_600);

    const withDeduction = calculateRoller({
      ...base,
      measurement: recess,
      settings: { recessWidthDeductionMm: 10 },
    });
    expect(withDeduction.lines[0]?.quantity).toBe(1_500 * 1_600);
    expect(withDeduction.assumptions[0]).toBe(
      'Dentro do vão: largura reduzida em 0,01 m de folga.',
    );
  });
});
