import { weekdayName } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { DaySummary } from "./daySummary";

export interface DayTransitionProps {
  readonly summary: DaySummary;
  readonly onDone: () => void;
}

const WINDOWS = [
  [40, 70],
  [90, 60],
  [150, 80],
  [260, 66],
  [320, 84],
  [360, 58],
] as const;

export function DayTransition({ summary, onDone }: DayTransitionProps) {
  return (
    <div className="is-night" role="dialog" aria-modal="true" aria-labelledby="is-night-title">
      <div className="is-night__sky" aria-hidden="true">
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
          <path d="M334 22 A20 20 0 1 0 352 52 A16 16 0 1 1 334 22 Z" fill="#fff3d0" />
          {[
            [40, 30],
            [120, 18],
            [200, 40],
            [280, 22],
            [380, 34],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={1.6} fill="#fff3d0" className="is-glow" />
          ))}
          {WINDOWS.map(([x, h]) => (
            <g key={x}>
              <rect x={x - 22} y={160 - h} width={44} height={h} fill="#1f2547" />
              <rect x={x - 8} y={160 - h + 14} width={10} height={12} fill="#f6d77a" className="is-glow" />
            </g>
          ))}
        </svg>
      </div>
      <section className="is-night__card is-tape-card">
        <span className="ad-eyebrow">
          {summary.kind === "shift" ? "After a day at Hollin's Hardware" : "Lights out"}
        </span>
        <h2 id="is-night-title">
          Good morning! Day {summary.toDay}, {weekdayName(summary.toDay)}
        </h2>
        <ul className="is-night__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} /> {line}
            </li>
          ))}
        </ul>
        <Button autoFocus size="lg" onClick={onDone}>
          Open the loft
        </Button>
      </section>
    </div>
  );
}
