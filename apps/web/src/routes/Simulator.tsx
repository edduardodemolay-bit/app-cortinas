import {
  calculateGathered,
  calculateRoller,
  checkMeasurement,
  type CalcLine,
  type CalcResult,
  type Installation,
} from '@cortinas/calc';
import {
  formatBRL,
  formatMeters,
  formatSquareMeters,
  parseCentimetersToMm,
  parseReaisToCents,
} from '@cortinas/shared';
import { useState } from 'react';
import { Link } from 'react-router';

import { Card, NumberField, Segmented } from '../ui/controls';

type Product = 'gathered' | 'roller';

// Example prices only, until the price table (stage 6) exists.
const EXAMPLE_PRICES = {
  fabricPerMeter: '60,00',
  fabricRollWidthCm: '280',
  liningPerMeter: '45,00',
  trackPerMeter: '50,00',
  sewingPerMeter: '30,00',
  rollerPerM2: '150,00',
  rollerMaxWidthCm: '300',
  installation: '60,00',
};

type Prices = typeof EXAMPLE_PRICES;

function formatQuantity(line: CalcLine): string {
  if (line.unit === 'm') return formatMeters(line.quantity);
  if (line.unit === 'm2') return formatSquareMeters(line.quantity);
  return `${line.quantity} un`;
}

function formatUnitPrice(line: CalcLine): string {
  const suffix = { m: '/m', m2: '/m²', un: '' }[line.unit];
  return `${formatBRL(line.unitPriceCents)}${suffix}`;
}

interface Computed {
  result: CalcResult | null;
  missing: string[];
}

function compute(
  product: Product,
  widthText: string,
  heightText: string,
  installation: Installation,
  withLining: boolean,
  prices: Prices,
): Computed {
  const widthMm = parseCentimetersToMm(widthText) ?? 0;
  const heightMm = parseCentimetersToMm(heightText) ?? 0;
  const measurement = { widthMm, heightMm, installation };
  const { errors } = checkMeasurement(measurement);

  const cents = (text: string) => parseReaisToCents(text) ?? 0;
  const mm = (text: string) => parseCentimetersToMm(text) ?? 0;
  const rollWidth = product === 'roller' ? prices.rollerMaxWidthCm : prices.fabricRollWidthCm;
  if (mm(rollWidth) <= 0) errors.push('Informe a largura do rolo.');
  if (errors.length > 0) return { result: null, missing: errors };

  if (product === 'roller') {
    return {
      missing: [],
      result: calculateRoller({
        measurement,
        product: {
          name: 'Tecido de exemplo',
          pricePerM2Cents: cents(prices.rollerPerM2),
          maxWidthMm: mm(prices.rollerMaxWidthCm),
        },
        installationPriceCents: cents(prices.installation),
      }),
    };
  }

  const fabric = {
    name: 'de exemplo',
    rollWidthMm: mm(prices.fabricRollWidthCm),
    pricePerMeterCents: cents(prices.fabricPerMeter),
  };
  return {
    missing: [],
    result: calculateGathered({
      measurement,
      fabric,
      ...(withLining && {
        lining: { ...fabric, name: 'blackout', pricePerMeterCents: cents(prices.liningPerMeter) },
      }),
      trackPricePerMeterCents: cents(prices.trackPerMeter),
      sewingPricePerMeterCents: cents(prices.sewingPerMeter),
      installationPriceCents: cents(prices.installation),
    }),
  };
}

export function Simulator() {
  const [product, setProduct] = useState<Product>('gathered');
  const [width, setWidth] = useState('200');
  const [height, setHeight] = useState('260');
  const [installation, setInstallation] = useState<Installation>('wall');
  const [withLining, setWithLining] = useState(true);
  const [prices, setPrices] = useState<Prices>(EXAMPLE_PRICES);

  const setPrice = (key: keyof Prices) => (value: string) =>
    setPrices((current) => ({ ...current, [key]: value }));

  const { result, missing } = compute(product, width, height, installation, withLining, prices);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-4 pb-40">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          className="flex min-h-12 min-w-12 items-center justify-center rounded-xl border-2 border-neutral-400 text-2xl font-bold"
          aria-label="Voltar"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold">Simular item</h1>
      </header>

      <Segmented
        label="Produto"
        value={product}
        onChange={setProduct}
        options={[
          { value: 'gathered', label: 'Cortina franzida' },
          { value: 'roller', label: 'Persiana rolô' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Largura" suffix="cm" value={width} onChange={setWidth} />
        <NumberField label="Altura" suffix="cm" value={height} onChange={setHeight} />
      </div>

      <Segmented
        label="Instalação"
        value={installation}
        onChange={setInstallation}
        options={[
          { value: 'wall', label: 'Parede' },
          { value: 'ceiling', label: 'Teto' },
          { value: 'recess', label: 'Dentro do vão' },
        ]}
      />

      {product === 'gathered' && (
        <Segmented
          label="Forro"
          value={withLining ? 'yes' : 'no'}
          onChange={(v) => setWithLining(v === 'yes')}
          options={[
            { value: 'yes', label: 'Com blackout' },
            { value: 'no', label: 'Sem forro' },
          ]}
        />
      )}

      {result && (
        <Card title="Cálculo">
          <ul className="flex flex-col divide-y divide-neutral-200">
            {result.lines.map((line) => (
              <li key={line.kind} className="flex items-start justify-between gap-3 py-2">
                <span className="flex flex-col">
                  <span className="font-semibold">{line.description}</span>
                  <span className="text-sm text-muted">
                    {formatQuantity(line)} × {formatUnitPrice(line)}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatBRL(line.totalCents)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result && result.warnings.length > 0 && (
        <section className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4" role="alert">
          <h2 className="mb-1 font-bold">Atenção</h2>
          <ul className="list-disc pl-5">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {result && (
        <details className="rounded-2xl border border-neutral-300 bg-white p-4">
          <summary className="cursor-pointer text-lg font-bold">Como calculamos</summary>
          <ul className="mt-2 list-disc pl-5 text-muted">
            {result.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted">
            Regras provisórias, a validar com o cortineiro. Versão do cálculo {result.calcVersion}.
          </p>
        </details>
      )}

      <details className="rounded-2xl border border-neutral-300 bg-white p-4">
        <summary className="cursor-pointer text-lg font-bold">Preços de exemplo</summary>
        <p className="mt-1 mb-3 text-sm text-muted">
          Valores fictícios para testar. A sua tabela de preços vem numa próxima etapa.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {product === 'gathered' ? (
            <>
              <NumberField
                label="Tecido"
                suffix="R$/m"
                value={prices.fabricPerMeter}
                onChange={setPrice('fabricPerMeter')}
              />
              <NumberField
                label="Largura do rolo"
                suffix="cm"
                value={prices.fabricRollWidthCm}
                onChange={setPrice('fabricRollWidthCm')}
              />
              <NumberField
                label="Forro"
                suffix="R$/m"
                value={prices.liningPerMeter}
                onChange={setPrice('liningPerMeter')}
              />
              <NumberField
                label="Trilho"
                suffix="R$/m"
                value={prices.trackPerMeter}
                onChange={setPrice('trackPerMeter')}
              />
              <NumberField
                label="Costura"
                suffix="R$/m"
                value={prices.sewingPerMeter}
                onChange={setPrice('sewingPerMeter')}
              />
            </>
          ) : (
            <>
              <NumberField
                label="Rolô"
                suffix="R$/m²"
                value={prices.rollerPerM2}
                onChange={setPrice('rollerPerM2')}
              />
              <NumberField
                label="Largura máx."
                suffix="cm"
                value={prices.rollerMaxWidthCm}
                onChange={setPrice('rollerMaxWidthCm')}
              />
            </>
          )}
          <NumberField
            label="Instalação"
            suffix="R$"
            value={prices.installation}
            onChange={setPrice('installation')}
          />
        </div>
      </details>

      <footer className="fixed inset-x-0 bottom-0 border-t border-neutral-300 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          {result ? (
            <>
              <span className="text-lg font-semibold">Total do item</span>
              <span className="text-3xl font-bold tabular-nums">
                {formatBRL(result.totalCents)}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-danger">{missing.join(' ')}</span>
          )}
        </div>
      </footer>
    </main>
  );
}
