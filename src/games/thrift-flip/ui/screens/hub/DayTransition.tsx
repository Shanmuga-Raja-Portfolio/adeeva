import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StallBackdrop } from "../../art/StallBackdrop";
import { stallDayName } from "../stallDayName";
import type { DaySummary } from "./daySummary";

export interface DayTransitionProps {
  readonly summary: DaySummary;
  readonly onDone: () => void;
}

export function DayTransition({ summary, onDone }: DayTransitionProps) {
  return (
    <div className="tf-dawn" role="dialog" aria-modal="true" aria-labelledby="tf-dawn-title">
      <StallBackdrop dusk className="tf-dawn__backdrop" />
      <section className="tf-dawn__card">
        <span className="ad-eyebrow">The market wakes up</span>
        <h2 id="tf-dawn-title">
          Day {summary.toDay} · {stallDayName(summary.toDay)}
        </h2>
        <ul className="tf-dawn__lines">
          {summary.lines.map((line) => (
            <li key={line}>
              <Icon name="sparkle" size={16} />
              {line}
            </li>
          ))}
        </ul>
        <Button size="lg" autoFocus onClick={onDone} data-testid="dawn-continue">
          Open the stall
        </Button>
      </section>
    </div>
  );
}
