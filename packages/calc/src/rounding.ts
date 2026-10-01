/** Integer division rounding up. Both operands must be integers; divisor must be positive. */
export function ceilDiv(dividend: number, divisor: number): number {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || divisor <= 0) {
    throw new RangeError('ceilDiv expects integers and a positive divisor');
  }
  return Math.ceil(dividend / divisor);
}
