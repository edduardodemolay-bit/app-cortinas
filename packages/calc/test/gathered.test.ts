import { describe, expect, it } from 'vitest';
import { calculateGathered, type GatheredInput } from '../src';

const linen = { name: 'Linho', rollWidthMm: 2_800, pricePerMeterCents: 6_000 };
const blackout = { name: 'Blackout', rollWidthMm: 2_800, pricePerMeterCents: 4_500 };

const base: GatheredInput = {
  measurement: { widthMm: 2_000, heightMm: 2_600, installation: 'wall' },
  fabric: linen,
  trackPricePerMeterCents: 5_000,
  sewingPricePerMeterCents: 3_000,
  installationPriceCents: 6_000,
};

describe('calculateGathered', () => {
  it('wall, 2,00 × 2,60 m, linen + blackout lining used sideways', () => {
    // track = 2000 + 2×100 = 2200 mm; fabric width = 2200 × 2,5 = 5500 mm
    // cut height = 2600 + 100 + 100 = 2800 mm ≤ roll 2800 → sideways, 5,50 m of each fabric
    const result = calculateGathered({ ...base, lining: blackout });

    expect(result.lines.map((l) => [l.kind, l.quantity, l.totalCents])).toEqual([
      ['fabric', 5_500, 33_000], // 5,5 m × R$ 60,00
      ['lining', 5_500, 24_750], // 5,5 m × R$ 45,00
      ['track', 2_200, 11_000], // 2,2 m × R$ 50,00
      ['sewing', 2_200, 6_600], // 2,2 m × R$ 30,00
      ['installation', 1, 6_000],
    ]);
    expect(result.totalCents).toBe(81_350);
    expect(result.assumptions).toContain('Linho usado deitado (rolo de 2,80 m), sem emendas.');
    expect(result.assumptions).toContain('Franzimento de 2,5× a largura do trilho.');
    expect(result.warnings).toEqual([]);
    expect(result.calcVersion).toBe('0.1.0');
  });

  it('recess, narrow patterned fabric cut in vertical panels matched to the repeat', () => {
    // track = 1500 mm (recess); fabric width = 3750 mm → 3 panels of a 1,40 m roll
    // cut = 2500 + 200 = 2700 → next multiple of 640 = 3200 mm; 3 × 3200 = 9600 mm
    const result = calculateGathered({
      ...base,
      measurement: { widthMm: 1_500, heightMm: 2_500, installation: 'recess' },
      fabric: {
        name: 'Floral',
        rollWidthMm: 1_400,
        pricePerMeterCents: 4_000,
        patternRepeatMm: 640,
      },
    });

    expect(result.lines.map((l) => [l.kind, l.quantity, l.totalCents])).toEqual([
      ['fabric', 9_600, 38_400],
      ['track', 1_500, 7_500],
      ['sewing', 1_500, 4_500],
      ['installation', 1, 6_000],
    ]);
    expect(result.totalCents).toBe(56_400);
    expect(result.assumptions).toContain(
      'Floral em 3 panos de 3,20 m, ajustados à repetição de 0,64 m (rolo de 1,40 m), 2 emenda(s).',
    );
    expect(result.assumptions).toContain('Dentro do vão: trilho com a mesma largura do vão.');
  });

  it('plain narrow fabric with custom fullness', () => {
    // track = 1200; fabric width = 1200 × 2 = 2400 → 2 panels; cut = 2000 + 200 = 2200 → 4400 mm
    const result = calculateGathered({
      ...base,
      measurement: { widthMm: 1_000, heightMm: 2_000, installation: 'ceiling' },
      fabric: { name: 'Voil', rollWidthMm: 1_400, pricePerMeterCents: 2_000 },
      settings: { fullnessBps: 20_000 },
    });

    expect(result.lines[0]).toMatchObject({ quantity: 4_400, totalCents: 8_800 });
    expect(result.assumptions).toContain(
      'Voil em 2 panos de 2,20 m (rolo de 1,40 m), 1 emenda(s).',
    );
    expect(result.assumptions).toContain('Franzimento de 2× a largura do trilho.');
  });

  it('rounds fabric and track up to the sale increment', () => {
    // track = 1234 + 200 = 1434 → charged 1500; fabric = ceil(1434 × 2,5) = 3585 → 3600
    const result = calculateGathered({
      ...base,
      measurement: { widthMm: 1_234, heightMm: 2_600, installation: 'wall' },
    });

    expect(result.lines[0]).toMatchObject({ quantity: 3_600, totalCents: 21_600 });
    expect(result.lines[1]).toMatchObject({ kind: 'track', quantity: 1_500, totalCents: 7_500 });
  });

  it('warns when a patterned fabric is used sideways', () => {
    const result = calculateGathered({ ...base, fabric: { ...linen, patternRepeatMm: 300 } });
    expect(result.warnings).toEqual([
      'Linho tem estampa e foi calculado deitado. Confira o sentido da estampa.',
    ]);
  });

  it('passes measurement warnings through and rejects missing measurements', () => {
    const tall = calculateGathered({
      ...base,
      measurement: { widthMm: 2_000, heightMm: 5_500, installation: 'wall' },
    });
    expect(tall.warnings).toContain('Altura de 5,50 m está fora do comum. Confira a medida.');

    expect(() =>
      calculateGathered({
        ...base,
        measurement: { widthMm: 0, heightMm: 0, installation: 'wall' },
      }),
    ).toThrow('Informe a largura. Informe a altura.');
  });
});
