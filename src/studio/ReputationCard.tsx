import { Icon } from "../ui/kit/IconSet";
import { Meter } from "../ui/kit/Meter";
import type { Perk } from "./perks";

export interface ReputationCardProps {
  readonly reputation: number;
  readonly unlockedCount: number;
  readonly totalPerks: number;
  readonly next: Perk | null;
  readonly previousThreshold: number;
}

export function ReputationCard({
  reputation,
  unlockedCount,
  totalPerks,
  next,
  previousThreshold,
}: ReputationCardProps) {
  return (
    <section className="st-rep" aria-label="Studio reputation" data-testid="studio-reputation">
      <div className="st-rep__head">
        <span className="st-rep__badge">
          <Icon name="star" size={22} />
        </span>
        <div>
          <span className="st-rep__label">Studio reputation</span>
          <strong className="st-rep__value">{reputation}</strong>
        </div>
        <span className="st-rep__count">
          {unlockedCount} of {totalPerks} perks
        </span>
      </div>
      {next === null ? (
        <p className="st-rep__note">Every perk is yours. Your studio is in full bloom.</p>
      ) : (
        <>
          <Meter
            label={`Next: ${next.label}`}
            value={reputation - previousThreshold}
            max={next.threshold - previousThreshold}
            tone="gold"
            valueText={`${reputation} / ${next.threshold}`}
          />
          <p className="st-rep__note">
            Finish orders in any game to earn reputation. {next.label} unlocks at {next.threshold}.
          </p>
        </>
      )}
    </section>
  );
}
