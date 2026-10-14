import { DAYS_PER_WEEK } from "../../../../../engine/week";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canWorkShift, dayHours, weeklyBill, type GameState } from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
import { WorkshopAvatar } from "../../art/WorkshopAvatar";
import { PencilTicks } from "./PencilTicks";

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
  if (rent === 0) return "No rent on Relaxed. Build for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  if (days === 0) return `${CAREER.landlord} collects ${rent} coins of rent tonight.`;
  return `${CAREER.landlord} collects ${rent} coins of rent in ${days} ${days === 1 ? "day" : "days"}.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const total = dayHours(state);
  const weekStart = calendar.day - ((calendar.day - 1) % DAYS_PER_WEEK);
  return (
    <section className="ww-hero" aria-label="Your day">
      <GarageBackdrop className="ww-hero__backdrop" decor={state.decor} evening={calendar.hoursLeft <= 3} />
      <div className="ww-hero__figure" aria-hidden="true">
        <WorkshopAvatar look={profile.look} title={profile.name} />
      </div>
      <div className="ww-hero__card ww-paper ww-tape">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {CAREER.workshopName}
        </span>
        <h1 className="ww-hero__title">
          {greeting(calendar.hoursLeft, total)}, {profile.name}
        </h1>
        <ol className="ww-week" aria-label="This week">
          {Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
            const day = weekStart + index;
            const status = day < calendar.day ? "past" : day === calendar.day ? "today" : "ahead";
            return (
              <li
                key={day}
                className={`ww-week__day ww-week__day--${status}`}
                aria-current={status === "today" ? "date" : undefined}
              >
                <span>{weekdayName(day).slice(0, 2)}</span>
                <strong>{day}</strong>
              </li>
            );
          })}
        </ol>
        <PencilTicks left={calendar.hoursLeft} total={total} />
        <p className="ww-hint">
          <Icon name="coin" size={16} /> {rentNote(state)}
        </p>
        <div className="ww-hero__buttons">
          <Button
            variant="secondary"
            icon="bag"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${CAREER.shiftName} for ${CAREER.shiftPay} coins`}
          >
            Sweep at Pell's · +{CAREER.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
