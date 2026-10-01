/** Formats integer cents as Brazilian currency, e.g. 123456 -> "R$ 1.234,56". */
export function formatBRL(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const reais = Math.trunc(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = (abs % 100).toString().padStart(2, '0');
  return `${sign}R$ ${reais},${centavos}`;
}

/** Formats integer millimeters as meters with comma, e.g. 1855 -> "1,855 m", 1850 -> "1,85 m". */
export function formatMeters(mm: number): string {
  const meters = Math.trunc(mm / 1000);
  const fraction = (Math.abs(mm) % 1000).toString().padStart(3, '0').replace(/0+$/, '');
  const decimals = fraction.length < 2 ? fraction.padEnd(2, '0') : fraction;
  return `${meters},${decimals} m`;
}
