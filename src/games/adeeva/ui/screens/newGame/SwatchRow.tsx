import { optionLabel } from "./newGameDraft";

export interface SwatchOption<T extends string> {
  readonly id: T;
  readonly hex: string;
}

export interface SwatchRowProps<T extends string> {
  label: string;
  options: readonly SwatchOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SwatchRow<T extends string>({ label, options, value, onChange }: SwatchRowProps<T>) {
  return (
    <div className="ad-swatch-row" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          aria-label={optionLabel(option.id)}
          title={optionLabel(option.id)}
          className="ad-swatch"
          style={{ background: option.hex }}
          onClick={() => onChange(option.id)}
        />
      ))}
    </div>
  );
}
