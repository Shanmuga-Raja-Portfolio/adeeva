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
    <div className="ww-night" role="dialog" aria-modal="true" aria-labelledby="ww-night-title">
      <div className="ww-night__sky" aria-hidden="true">
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          <path d="M210 30 A40 40 0 1 0 238 98 A30 30 0 1 1 210 30 Z" fill="#fff1c4" />
          {[
            [60, 40],
            [110, 90],
            [300, 50],
            [340, 110],
            [170, 120],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#fff1c4" />
          ))}
          <path d="M0 150 L60 128 L120 140 L180 120 L260 138 L330 118 L400 136 V160 H0 Z" fill="#2c3a46" />
        </svg>
      </div>
      <section className="ww-night__card ww-paper ww-tape">
        <span className="ad-eyebrow">{summary.kind === "shift" ? "After a long shift" : "Lights out"}</span>
        <h2 id="ww-night-title">
          Good morning! Day {summary.toDay}, {weekdayName(summary.toDay)}
        </h2>
        <ul className="ww-night__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} /> {line}
            </li>
          ))}
        </ul>
        <Button autoFocus size="lg" onClick={onDone}>
          Open the garage
        </Button>
      </section>
    </div>
  );
}
