import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { CareerId } from "../../../content/career";
import { BoutiqueBackdrop } from "../../art/BoutiqueBackdrop";
import { StallBackdrop } from "../../art/StallBackdrop";
import { stallDayName } from "../stallDayName";
import type { DaySummary } from "./daySummary";

export interface DayTransitionProps {
  readonly summary: DaySummary;
  readonly career: CareerId;
  readonly signName: string | null;
  readonly onDone: () => void;
}

export function DayTransition({ summary, career, signName, onDone }: DayTransitionProps) {
  return (
    <div className="tf-dawn" role="dialog" aria-modal="true" aria-labelledby="tf-dawn-title">
      {career === "boutique" ? (
        <BoutiqueBackdrop dusk className="tf-dawn__backdrop" signName={signName ?? undefined} />
      ) : (
        <StallBackdrop dusk className="tf-dawn__backdrop" />
      )}
      <section className="tf-dawn__card">
        <span className="ad-eyebrow">
          {career === "boutique" ? "Larkspur Row wakes up" : "The market wakes up"}
        </span>
        <h2 id="tf-dawn-title">
          Day {summary.toDay} · {stallDayName(summary.toDay, career)}
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
          {career === "boutique" ? "Open the shop" : "Open the stall"}
        </Button>
      </section>
    </div>
  );
}
