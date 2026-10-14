import { dayGreeting } from "../../../../../engine/dayHours";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canWorkShift, dayLength, weeklyBill, type GameState } from "../../../core";
import { DesignerAvatar } from "../../art/DesignerAvatar";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import { PaintDots } from "./PaintDots";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Design for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  if (days === 0) return `${rent} coins of rent go to ${CAREER.landlord} tonight.`;
  return `${rent} coins of rent are due in ${days} ${days === 1 ? "day" : "days"}.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const total = dayLength(state);
  return (
    <section className="is-hub-hero" aria-label="Your day">
      <LoftBackdrop
        className="is-hub-hero__backdrop"
        decor={state.loftDecor}
        sign={`${profile.name}'s Studio`}
        evening={calendar.hoursLeft <= 3}
      />
      <div className="is-hub-hero__figure" aria-hidden="true">
        <DesignerAvatar look={profile.look} title={profile.name} />
      </div>
      <div className="is-hub-hero__card is-tape-card">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {CAREER.studioName}
        </span>
        <h1 className="is-hub-hero__title">
          {dayGreeting(calendar.hoursLeft, total)}, {profile.name}
        </h1>
        <PaintDots left={calendar.hoursLeft} total={total} />
        <p className="is-hint">
          <Icon name="coin" size={16} /> {rentNote(state)}
        </p>
        <div className="is-hub-hero__buttons">
          <Button
            variant="secondary"
            icon="bag"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${CAREER.shiftName} for ${CAREER.shiftPay} coins`}
          >
            Stack shelves · +{CAREER.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
