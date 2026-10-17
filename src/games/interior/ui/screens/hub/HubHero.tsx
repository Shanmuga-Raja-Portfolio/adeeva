import { dayGreeting } from "../../../../../engine/dayHours";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { canWorkShift, careerById, dayLength, weeklyBill, type GameState } from "../../../core";
import { DesignerAvatar } from "../../art/DesignerAvatar";
import { LarkspurBackdrop } from "../../art/LarkspurBackdrop";
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
  if (days === 0) return `${rent} coins of rent go to ${careerById(state.career).landlord} tonight.`;
  return `${rent} coins of rent are due in ${days} ${days === 1 ? "day" : "days"}.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const career = careerById(state.career);
  const total = dayLength(state);
  return (
    <section className="is-hub-hero" aria-label="Your day">
      {state.larkspur === null ? (
        <LoftBackdrop
          className="is-hub-hero__backdrop"
          decor={state.loftDecor}
          sign={`${profile.name}'s Studio`}
          evening={calendar.hoursLeft <= 3}
        />
      ) : (
        <LarkspurBackdrop
          className="is-hub-hero__backdrop"
          decor={state.loftDecor}
          time={calendar.hoursLeft <= 3 ? "evening" : calendar.hoursLeft <= 6 ? "afternoon" : "morning"}
          plot={state.larkspur.project === null ? null : state.larkspur.plot}
          keyWall={state.larkspur.keyWall}
        />
      )}
      <div className="is-hub-hero__figure" aria-hidden="true">
        <DesignerAvatar look={profile.look} title={profile.name} mood="delighted" pose="poised" />
      </div>
      <div className="is-hub-hero__card is-tape-card">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {career.studioName}
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
            aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
          >
            {career.shiftLabel} · +{career.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
