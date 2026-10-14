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
    <div className="jb-night" role="dialog" aria-modal="true" aria-labelledby="jb-night-title">
      <div className="jb-night__sky" aria-hidden="true">
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          <path d="M318 26 A26 26 0 1 0 336 70 A20 20 0 1 1 318 26 Z" fill="#fff3d0" />
          {[
            [60, 40],
            [110, 90],
            [300, 50],
            [340, 110],
            [170, 120],
          ].map(([x, y], index) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={2.4}
              fill="#fff3d0"
              className="jb-twinkle"
              style={{ animationDelay: `${index * 0.4}s` }}
            />
          ))}
        </svg>
      </div>
      <section className="jb-night__card jb-measure">
        <span className="ad-eyebrow">
          {summary.kind === "shift" ? "After a day at the Bead Barn" : "Lanterns out"}
        </span>
        <h2 id="jb-night-title">
          Good morning! Day {summary.toDay}, {weekdayName(summary.toDay)}
        </h2>
        <ul className="jb-night__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} /> {line}
            </li>
          ))}
        </ul>
        <Button autoFocus size="lg" onClick={onDone}>
          Open the bench
        </Button>
      </section>
    </div>
  );
}
