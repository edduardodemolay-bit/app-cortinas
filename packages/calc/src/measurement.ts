import { formatMeters } from './format';
import type { Measurement } from './types';

export interface MeasurementLimits {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
}

// TODO: validar com cortineiro – faixas consideradas normais para alertar medidas improváveis.
export const DEFAULT_MEASUREMENT_LIMITS: MeasurementLimits = {
  minWidthMm: 300,
  maxWidthMm: 8_000,
  minHeightMm: 300,
  maxHeightMm: 5_000,
};

export interface MeasurementCheck {
  errors: string[];
  warnings: string[];
}

export function checkMeasurement(
  { widthMm, heightMm }: Measurement,
  limits: MeasurementLimits = DEFAULT_MEASUREMENT_LIMITS,
): MeasurementCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isInteger(widthMm) || widthMm <= 0) errors.push('Informe a largura.');
  else if (widthMm < limits.minWidthMm || widthMm > limits.maxWidthMm) {
    warnings.push(`Largura de ${formatMeters(widthMm)} está fora do comum. Confira a medida.`);
  }

  if (!Number.isInteger(heightMm) || heightMm <= 0) errors.push('Informe a altura.');
  else if (heightMm < limits.minHeightMm || heightMm > limits.maxHeightMm) {
    warnings.push(`Altura de ${formatMeters(heightMm)} está fora do comum. Confira a medida.`);
  }

  return { errors, warnings };
}

/** Returns the warnings; throws if the measurement cannot be calculated at all. */
export function assertMeasurement(measurement: Measurement): string[] {
  const { errors, warnings } = checkMeasurement(measurement);
  if (errors.length > 0) throw new RangeError(errors.join(' '));
  return warnings;
}
