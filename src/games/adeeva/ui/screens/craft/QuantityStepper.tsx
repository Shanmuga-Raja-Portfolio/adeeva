export interface QuantityStepperProps {
  readonly label: string;
  readonly value: number;
  readonly step: number;
  readonly min: number;
  readonly max: number;
  readonly unit: string;
  readonly onChange: (value: number) => void;
}

export function QuantityStepper({ label, value, step, min, max, unit, onChange }: QuantityStepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next / step) * step)));
  return (
    <div className="ad-stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="ad-stepper__button"
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label={`Less ${label.toLowerCase()}`}
      >
        −
      </button>
      <output className="ad-stepper__value" aria-live="polite">
        {value} {unit}
      </output>
      <button
        type="button"
        className="ad-stepper__button"
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label={`More ${label.toLowerCase()}`}
      >
        +
      </button>
    </div>
  );
}
