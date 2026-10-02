import { useId, type ReactNode } from 'react';

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  invalid?: boolean;
}

/** Large numeric field: opens the numeric keyboard and accepts Brazilian decimals ("1,85"). */
export function NumberField({ label, value, onChange, suffix, invalid = false }: NumberFieldProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-base font-semibold">{label}</span>
      <span
        className={`flex min-h-14 items-center rounded-xl border-2 bg-white px-3 focus-within:border-primary ${
          invalid ? 'border-danger' : 'border-neutral-400'
        }`}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="next"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className="w-full min-w-0 bg-transparent text-xl font-semibold outline-none"
        />
        {suffix && <span className="ml-2 shrink-0 text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Row of large buttons for picking one option with a single tap. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-base font-semibold">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`min-h-14 rounded-xl border-2 px-2 text-base font-bold leading-tight ${
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-neutral-400 bg-white text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-neutral-300 bg-white p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
