export type Installation = 'ceiling' | 'wall' | 'recess';

/** Window/opening measurement. All lengths in integer millimeters. */
export interface Measurement {
  widthMm: number;
  heightMm: number;
  installation: Installation;
}

export type LineKind = 'fabric' | 'lining' | 'track' | 'blind' | 'sewing' | 'installation';

/** Unit the line is priced in. Quantities are integers: mm for 'm', mm² for 'm2', units for 'un'. */
export type PriceUnit = 'm' | 'm2' | 'un';

export interface CalcLine {
  kind: LineKind;
  description: string;
  quantity: number;
  unit: PriceUnit;
  /** Price per meter, per square meter or per unit, in cents. */
  unitPriceCents: number;
  totalCents: number;
}

export interface CalcResult {
  lines: CalcLine[];
  totalCents: number;
  /** Every default or rule applied, in plain pt-BR, so the professional can check it. */
  assumptions: string[];
  /** Things worth double-checking (unusual measurements, fabric too narrow…). */
  warnings: string[];
  calcVersion: string;
}

export interface FabricSpec {
  name: string;
  rollWidthMm: number;
  pricePerMeterCents: number;
  /** Vertical pattern repeat; 0 or absent means plain fabric. */
  patternRepeatMm?: number;
}
