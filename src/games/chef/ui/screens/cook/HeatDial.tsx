import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import "./sizzle.css";

export interface HeatDialProps {
  readonly value: number;
  readonly ideal: number;
  readonly locked: boolean;
  readonly onChange: (heat: number) => void;
}

const DOTS = ["1", "2", "3", "4", "5"] as const;

function Flame() {
  return (
    <svg viewBox="0 0 12 16" className="ck-heat__flame" aria-hidden="true" focusable="false">
      <path d="M6 0 C8 4 12 6 12 10 C12 13.5 9.3 16 6 16 C2.7 16 0 13.5 0 10 C0 7 3 5 3 2 C4.5 3.5 5 5 5 6 C6 4 6.5 2 6 0 Z" />
      <path
        d="M6 8 C7 10 9 11 9 12.5 C9 14.4 7.6 15.5 6 15.5 C4.4 15.5 3 14.4 3 12.5 C3 11 5 10 6 8 Z"
        fill="#fff3c8"
      />
    </svg>
  );
}

function dotClass(level: number, value: number): string {
  const lit = value >= level ? " ck-heat__dot--on" : "";
  const picked = value === level ? " ck-heat__dot--picked" : "";
  return `ck-heat__dot ck-heat__dot--l${level}${lit}${picked}`;
}

export function HeatDial({ value, ideal, locked, onChange }: HeatDialProps) {
  const options = DOTS.map((dot) => ({ value: dot, disabled: locked }));
  const roving = useRovingRadio(options, String(value) as (typeof DOTS)[number], (next) =>
    onChange(Number(next)),
  );
  return (
    <div className="ck-heat" role="radiogroup" aria-label="Heat dots">
      <span className="ck-heat__label">Heat</span>
      <div className="ck-heat__list">
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
              className={dotClass(level, value)}
              onClick={() => onChange(level)}
              onKeyDown={(event) => roving.handleKey(event, index)}
            >
              <span className="ck-heat__num">{level}</span>
              <span className="ck-heat__flames" aria-hidden="true">
                {Array.from({ length: level }, (_, flame) => (
                  <Flame key={flame} />
                ))}
              </span>
              {level === ideal ? (
                <span className="ck-heat__ideal" aria-hidden="true">
                  best
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
