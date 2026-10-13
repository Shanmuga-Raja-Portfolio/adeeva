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
    <div className="pa-night" role="dialog" aria-modal="true" aria-labelledby="pa-night-title">
      <div className="pa-night__sky" aria-hidden="true">
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          <path d="M210 30 A40 40 0 1 0 238 98 A30 30 0 1 1 210 30 Z" fill="#fff1cf" />
          {[
            [60, 40],
            [110, 90],
            [300, 50],
            [340, 110],
            [170, 120],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#fff1cf" />
          ))}
        </svg>
      </div>
      <section className="pa-night__card pa-doily">
        <span className="ad-eyebrow">{summary.kind === "shift" ? "After a long shift" : "Lights out"}</span>
        <h2 id="pa-night-title">
          Good morning! Day {summary.toDay}, {weekdayName(summary.toDay)}
        </h2>
        <ul className="pa-night__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} /> {line}
            </li>
          ))}
        </ul>
        <Button autoFocus size="lg" onClick={onDone}>
          Open the shop
        </Button>
      </section>
    </div>
  );
}
