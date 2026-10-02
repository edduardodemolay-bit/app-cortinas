import { formatFactor, formatMeters } from '../format';
import { buildResult, lengthLine, unitLine } from '../lines';
import { assertMeasurement } from '../measurement';
import { ceilDiv, roundUpTo } from '../rounding';
import type { CalcLine, CalcResult, FabricSpec, Measurement } from '../types';

export interface GatheredSettings {
  /** Fabric width / track width, in basis points (25_000 = 2,5×). */
  fullnessBps: number;
  /** Track beyond the opening on each side (wall/ceiling installation). */
  trackExtraPerSideMm: number;
  /** Fabric added on top for the header tape. */
  headerAllowanceMm: number;
  /** Fabric added at the bottom for the hem (barra). */
  hemAllowanceMm: number;
  /** Fabric is bought in multiples of this length. */
  fabricIncrementMm: number;
  /** Track is charged in multiples of this length. */
  trackIncrementMm: number;
}

// TODO: validar com cortineiro – todos os padrões abaixo são provisórios.
export const DEFAULT_GATHERED_SETTINGS: GatheredSettings = {
  fullnessBps: 25_000,
  trackExtraPerSideMm: 100,
  headerAllowanceMm: 100,
  hemAllowanceMm: 100,
  fabricIncrementMm: 100,
  trackIncrementMm: 100,
};

export interface GatheredInput {
  measurement: Measurement;
  fabric: FabricSpec;
  lining?: FabricSpec;
  trackPricePerMeterCents: number;
  /** Sewing labor per meter of track. TODO: validar com cortineiro. */
  sewingPricePerMeterCents: number;
  installationPriceCents: number;
  settings?: Partial<GatheredSettings>;
}

interface FabricUsage {
  lengthMm: number;
  note: string;
  warnings: string[];
}

function fabricUsage(
  fabric: FabricSpec,
  fabricWidthMm: number,
  cutHeightMm: number,
  incrementMm: number,
): FabricUsage {
  const repeat = fabric.patternRepeatMm ?? 0;

  // Roll wide enough for the whole height: fabric runs sideways ("deitado"), no seams.
  if (fabric.rollWidthMm >= cutHeightMm) {
    const warnings =
      repeat > 0
        ? [`${fabric.name} tem estampa e foi calculado deitado. Confira o sentido da estampa.`]
        : [];
    return {
      lengthMm: roundUpTo(fabricWidthMm, incrementMm),
      note: `${fabric.name} usado deitado (rolo de ${formatMeters(fabric.rollWidthMm)}), sem emendas.`,
      warnings,
    };
  }

  const panels = ceilDiv(fabricWidthMm, fabric.rollWidthMm);
  const cutMm = roundUpTo(cutHeightMm, repeat);
  const repeatNote = repeat > 0 ? `, ajustados à repetição de ${formatMeters(repeat)}` : '';
  return {
    lengthMm: roundUpTo(panels * cutMm, incrementMm),
    note: `${fabric.name} em ${panels} panos de ${formatMeters(cutMm)}${repeatNote} (rolo de ${formatMeters(fabric.rollWidthMm)}), ${panels - 1} emenda(s).`,
    warnings: [],
  };
}

/** Gathered (franzida) fabric curtain on a track. */
export function calculateGathered(input: GatheredInput): CalcResult {
  const s: GatheredSettings = { ...DEFAULT_GATHERED_SETTINGS, ...input.settings };
  const { widthMm, heightMm, installation } = input.measurement;
  const warnings = assertMeasurement(input.measurement);
  const assumptions: string[] = [];

  const trackExtraMm = installation === 'recess' ? 0 : 2 * s.trackExtraPerSideMm;
  const trackMm = widthMm + trackExtraMm;
  assumptions.push(
    installation === 'recess'
      ? 'Dentro do vão: trilho com a mesma largura do vão.'
      : `Trilho com ${formatMeters(s.trackExtraPerSideMm)} além do vão de cada lado.`,
  );

  const fabricWidthMm = ceilDiv(trackMm * s.fullnessBps, 10_000);
  assumptions.push(`Franzimento de ${formatFactor(s.fullnessBps)}× a largura do trilho.`);

  const cutHeightMm = heightMm + s.headerAllowanceMm + s.hemAllowanceMm;
  assumptions.push(
    `Altura de corte = altura + ${formatMeters(s.headerAllowanceMm)} de cabeçote + ${formatMeters(s.hemAllowanceMm)} de barra.`,
  );

  const lines: CalcLine[] = [];
  const fabrics: [FabricSpec, 'fabric' | 'lining', string][] = [[input.fabric, 'fabric', 'Tecido']];
  if (input.lining) fabrics.push([input.lining, 'lining', 'Forro']);

  for (const [fabric, kind, label] of fabrics) {
    const usage = fabricUsage(fabric, fabricWidthMm, cutHeightMm, s.fabricIncrementMm);
    lines.push(
      lengthLine(kind, `${label} ${fabric.name}`, usage.lengthMm, fabric.pricePerMeterCents),
    );
    assumptions.push(usage.note);
    warnings.push(...usage.warnings);
  }
  assumptions.push(`Tecido comprado em múltiplos de ${formatMeters(s.fabricIncrementMm)}.`);

  const chargedTrackMm = roundUpTo(trackMm, s.trackIncrementMm);
  lines.push(lengthLine('track', 'Trilho', chargedTrackMm, input.trackPricePerMeterCents));
  lines.push(lengthLine('sewing', 'Costura', chargedTrackMm, input.sewingPricePerMeterCents));
  assumptions.push('Costura cobrada por metro de trilho.');

  lines.push(unitLine('installation', 'Instalação', 1, input.installationPriceCents));

  return buildResult(lines, assumptions, warnings);
}
