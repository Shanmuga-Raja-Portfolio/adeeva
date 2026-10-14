import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canWorkShift, dayLength, isMarketDay, weeklyBill, type GameState } from "../../../core";
import { ArcadeBackdrop } from "../../art/ArcadeBackdrop";
import { BenchAvatar } from "../../art/BenchAvatar";
import { HourBeads } from "./HourBeads";
import { WeekDrawers } from "./WeekDrawers";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function greeting(hoursLeft: number, total: number): string {
  const share = hoursLeft / total;
  if (share > 0.66) return "Good morning";
  if (share > 0.3) return "Good afternoon";
  return "Good evening";
}

function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Make for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  if (days === 0) return `${rent} coins of rent go to ${CAREER.landlord} tonight.`;
  return `${rent} coins of rent are due after Market Day, in ${days} ${days === 1 ? "day" : "days"}.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const total = dayLength(state);
  const market = isMarketDay(calendar.day);
  return (
    <section className="jb-hub-hero" aria-label="Your day">
      <ArcadeBackdrop
        className="jb-hub-hero__backdrop"
        evening={calendar.hoursLeft <= 3}
        lanterns={state.decor.includes("lantern-string") ? 13 : 9}
      />
      <div className="jb-hub-hero__figure" aria-hidden="true">
        <BenchAvatar look={profile.look} title={profile.name} />
      </div>
      <div className="jb-hub-hero__card jb-measure">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {CAREER.arcadeName}
        </span>
        <h1 className="jb-hub-hero__title">
          {greeting(calendar.hoursLeft, total)}, {profile.name}
        </h1>
        {market ? (
          <p className="jb-hub-hero__market">
            <Icon name="star" size={16} /> It's Market Day! Set out your stall tray before the lanterns dim.
          </p>
        ) : null}
        <WeekDrawers day={calendar.day} />
        <HourBeads left={calendar.hoursLeft} total={total} />
        <p className="jb-hint">
          <Icon name="coin" size={16} /> {rentNote(state)}
        </p>
        <div className="jb-hub-hero__buttons">
          <Button
            variant="secondary"
            icon="bag"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${CAREER.shiftName} for ${CAREER.shiftPay} coins`}
          >
            Sort beads · +{CAREER.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
