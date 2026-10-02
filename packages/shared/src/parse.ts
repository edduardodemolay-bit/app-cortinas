/**
 * Parses a number typed the Brazilian way into an integer scaled by 10^decimals, without floats.
 * "1.234,56" / "1234,56" / "1234.56" with decimals=2 -> 123456. Extra decimals round half up.
 * Returns null for empty or invalid input.
 */
export function parseBrDecimal(input: string, decimals: number): number | null {
  let text = input.replace(/R\$|\s/g, '');
  // With a comma, dots are thousands separators; without one, a dot is the decimal separator.
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  const match = /^(\d+)(?:\.(\d*))?$/.exec(text);
  if (!match) return null;

  const [, whole = '', fraction = ''] = match;
  const kept = fraction.slice(0, decimals).padEnd(decimals, '0');
  const roundUp = (fraction[decimals] ?? '0') >= '5' ? 1 : 0;
  return Number(whole) * 10 ** decimals + Number(kept || '0') + roundUp;
}

/** Centimeters typed by the user ("185" or "185,5") -> integer millimeters. */
export function parseCentimetersToMm(input: string): number | null {
  return parseBrDecimal(input, 1);
}

/** Reais typed by the user ("60" or "1.234,56") -> integer cents. */
export function parseReaisToCents(input: string): number | null {
  return parseBrDecimal(input, 2);
}
