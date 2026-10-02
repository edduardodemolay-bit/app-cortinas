import { formatMeters, formatSquareMeters } from '../format';
import { areaLine, buildResult, unitLine } from '../lines';
import { assertMeasurement } from '../measurement';
import { roundUpTo } from '../rounding';
import type { CalcResult, Measurement } from '../types';

export interface RollerSettings {
  /** Width and height are charged in multiples of this length. */
  billingIncrementMm: number;
  /** Minimum area charged per blind. */
  minAreaMm2: number;
  /** Width removed when installed inside the opening. */
  recessWidthDeductionMm: number;
}

// TODO: validar com cortineiro – todos os padrões abaixo são provisórios.
export const DEFAULT_ROLLER_SETTINGS: RollerSettings = {
  billingIncrementMm: 100,
  minAreaMm2: 1_000_000,
  recessWidthDeductionMm: 0,
};

export interface RollerProduct {
  name: string;
  pricePerM2Cents: number;
  /** Widest blind the fabric allows without a seam (usually the roll width). */
  maxWidthMm: number;
}

export interface RollerInput {
  measurement: Measurement;
  product: RollerProduct;
  installationPriceCents: number;
  settings?: Partial<RollerSettings>;
}

/** Roller blind (persiana/cortina rolô), charged per square meter. */
export function calculateRoller(input: RollerInput): CalcResult {
  const s: RollerSettings = { ...DEFAULT_ROLLER_SETTINGS, ...input.settings };
  const { heightMm, installation } = input.measurement;
  const warnings = assertMeasurement(input.measurement);
  const assumptions: string[] = [];

  let widthMm = input.measurement.widthMm;
  if (installation === 'recess' && s.recessWidthDeductionMm > 0) {
    widthMm -= s.recessWidthDeductionMm;
    assumptions.push(
      `Dentro do vão: largura reduzida em ${formatMeters(s.recessWidthDeductionMm)} de folga.`,
    );
  }

  if (widthMm > input.product.maxWidthMm) {
    warnings.push(
      `Largura de ${formatMeters(widthMm)} maior que o máximo de ${input.product.name} (${formatMeters(input.product.maxWidthMm)}). Precisa de emenda ou de outro tecido.`,
    );
  }

  const billedWidthMm = roundUpTo(widthMm, s.billingIncrementMm);
  const billedHeightMm = roundUpTo(heightMm, s.billingIncrementMm);
  assumptions.push(
    `Medidas cobradas em múltiplos de ${formatMeters(s.billingIncrementMm)}: ${formatMeters(billedWidthMm)} × ${formatMeters(billedHeightMm)}.`,
  );

  let areaMm2 = billedWidthMm * billedHeightMm;
  if (areaMm2 < s.minAreaMm2) {
    assumptions.push(
      `Área de ${formatSquareMeters(areaMm2)} abaixo do mínimo: cobrado ${formatSquareMeters(s.minAreaMm2)}.`,
    );
    areaMm2 = s.minAreaMm2;
  }

  return buildResult(
    [
      areaLine('blind', `Rolô ${input.product.name}`, areaMm2, input.product.pricePerM2Cents),
      unitLine('installation', 'Instalação', 1, input.installationPriceCents),
    ],
    assumptions,
    warnings,
  );
}
