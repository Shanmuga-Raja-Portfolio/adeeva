import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";

export interface HeatDialProps {
  readonly value: number;
  readonly ideal: number;
  readonly locked: boolean;
  readonly onChange: (heat: number) => void;
}

const DOTS = ["1", "2", "3", "4", "5"] as const;

export function HeatDial({ value, ideal, locked, onChange }: HeatDialProps) {
  const options = DOTS.map((dot) => ({ value: dot, disabled: locked }));
  const roving = useRovingRadio(options, String(value) as (typeof DOTS)[number], (next) =>
    onChange(Number(next)),
  );
  return (
    <div className="ck-heat" role="radiogroup" aria-label="Heat dots">
      <span className="ck-heat__label">Heat</span>
      {DOTS.map((dot, index) => {
        const level = Number(dot);
        return (
          <button
            key={dot}
            ref={roving.buttonRef(index)}
            type="button"
            role="radio"
            aria-checked={value === level}
            aria-label={`${level} ${level === 1 ? "dot" : "dots"}${level === ideal ? ", as the dish card says" : ""}`}
            tabIndex={roving.tabIndex(index)}
            disabled={locked}
            className={value >= level ? "ck-heat__dot ck-heat__dot--on" : "ck-heat__dot"}
            onClick={() => onChange(level)}
            onKeyDown={(event) => roving.handleKey(event, index)}
          >
            {level}
            {level === ideal ? <span className="ck-heat__ideal" aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
