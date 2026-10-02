/** Integer division rounding up. Both operands must be integers; divisor must be positive. */
export function ceilDiv(dividend: number, divisor: number): number {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor <= 0) {
    throw new RangeError('ceilDiv expects integers and a positive divisor');
  }
  return Math.ceil(dividend / divisor);
}

/** Integer division rounding half up, for non-negative integers. */
export function roundDiv(dividend: number, divisor: number): number {
  if (!Number.isInteger(dividend) || dividend < 0 || !Number.isInteger(divisor) || divisor <= 0) {
    throw new RangeError('roundDiv expects a non-negative integer and a positive divisor');
  }
  return Math.floor((2 * dividend + divisor) / (2 * divisor));
}

/** Rounds up to the next multiple of `increment`; an increment of 0 leaves the value unchanged. */
export function roundUpTo(value: number, increment: number): number {
  if (increment === 0) return value;
  return ceilDiv(value, increment) * increment;
}
