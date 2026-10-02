import { roundDiv } from './rounding';
import type { CalcLine, CalcResult, LineKind } from './types';

export const CALC_VERSION = '0.1.0';

const MM_PER_M = 1_000;
const MM2_PER_M2 = 1_000_000;

export function lengthLine(
  kind: LineKind,
  description: string,
  lengthMm: number,
  pricePerMeterCents: number,
): CalcLine {
  return {
    kind,
    description,
    quantity: lengthMm,
    unit: 'm',
    unitPriceCents: pricePerMeterCents,
    totalCents: roundDiv(lengthMm * pricePerMeterCents, MM_PER_M),
  };
}

export function areaLine(
  kind: LineKind,
  description: string,
  areaMm2: number,
  pricePerM2Cents: number,
): CalcLine {
  return {
    kind,
    description,
    quantity: areaMm2,
    unit: 'm2',
    unitPriceCents: pricePerM2Cents,
    totalCents: roundDiv(areaMm2 * pricePerM2Cents, MM2_PER_M2),
  };
}

export function unitLine(
  kind: LineKind,
  description: string,
  units: number,
  unitPriceCents: number,
): CalcLine {
  return {
    kind,
    description,
    quantity: units,
    unit: 'un',
    unitPriceCents,
    totalCents: units * unitPriceCents,
  };
}

export function buildResult(
  lines: CalcLine[],
  assumptions: string[],
  warnings: string[],
): CalcResult {
  return {
    lines,
    totalCents: lines.reduce((sum, line) => sum + line.totalCents, 0),
    assumptions,
    warnings,
    calcVersion: CALC_VERSION,
  };
}
