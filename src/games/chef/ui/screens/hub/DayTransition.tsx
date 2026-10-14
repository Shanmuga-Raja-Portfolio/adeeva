import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { DaySummary } from "./daySummary";

export interface DayTransitionProps {
  readonly summary: DaySummary;
  readonly onDone: () => void;
}

export function DayTransition({ summary, onDone }: DayTransitionProps) {
  return (
    <div className="ck-night" role="dialog" aria-modal="true" aria-labelledby="ck-night-title">
      <section className="ck-night__card ck-card">
        <div className="ck-night__sky" aria-hidden="true">
          <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
            <path d="M318 26 A26 26 0 1 0 336 70 A20 20 0 1 1 318 26 Z" fill="#ffe2a8" />
            {[
              [60, 40],
              [110, 90],
              [300, 50],
              [340, 110],
              [170, 120],
              [220, 30],
            ].map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={2.4}
                fill="#ffe2a8"
                className="ck-twinkle"
                style={{ animationDelay: `${index * 0.4}s` }}
              />
            ))}
            <path
              d="M0 160 L0 128 L40 128 L40 110 L90 110 L90 132 L150 132 L150 100 L230 100 L230 126 L300 126 L300 116 L400 116 L400 160 Z"
              fill="#1c2326"
            />
            {[60, 180, 200, 320].map((x) => (
              <rect key={x} x={x} y={118} width={10} height={8} fill="#f2a93b" opacity={0.85} />
            ))}
          </svg>
        </div>
        <span className="ad-eyebrow">
          {summary.kind === "potwash" ? "After a day at the sinks" : "Lamps out"}
        </span>
        <h2 id="ck-night-title">
          Good morning! Day {summary.toDay}, {weekdayName(summary.toDay)}
        </h2>
        <ul className="ck-night__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} /> {line}
            </li>
          ))}
        </ul>
        <Button autoFocus size="lg" onClick={onDone}>
          Into the kitchen
        </Button>
      </section>
    </div>
  );
}
