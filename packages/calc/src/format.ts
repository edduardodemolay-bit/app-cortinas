/** Formats integer millimeters as meters with comma and at least 2 decimals: 1850 -> "1,85 m", 1855 -> "1,855 m". */
export function formatMeters(mm: number): string {
  const meters = Math.trunc(mm / 1000);
  const fraction = (Math.abs(mm) % 1000).toString().padStart(3, '0').replace(/0+$/, '');
  const decimals = fraction.length < 2 ? fraction.padEnd(2, '0') : fraction;
  return `${meters},${decimals} m`;
}

/** Formats integer mm² as square meters with 2 decimals (half up): 2_400_000 -> "2,40 m²". */
export function formatSquareMeters(mm2: number): string {
  const hundredths = Math.floor((2 * mm2 + 10_000) / 20_000);
  const decimals = (hundredths % 100).toString().padStart(2, '0');
  return `${Math.trunc(hundredths / 100)},${decimals} m²`;
}

/** Formats a factor in basis points: 25_000 -> "2,5", 20_000 -> "2". */
export function formatFactor(bps: number): string {
  const whole = Math.trunc(bps / 10_000);
  const fraction = (bps % 10_000).toString().padStart(4, '0').replace(/0+$/, '');
  return fraction ? `${whole},${fraction}` : `${whole}`;
}
