import { dayGreeting } from "../../../../../engine/dayHours";
import { DAYS_PER_WEEK, weekEndDay } from "../../../../../engine/week";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { REN } from "../../../content/apprentice";
import {
  canWorkShift,
  careerOf,
  dayHours,
  rentLabel,
  renWageDue,
  weeklyBill,
  type GameState,
} from "../../../core";
import { GarageBackdrop } from "../../art/GarageBackdrop";
import { ShowroomBackdrop } from "../../art/ShowroomBackdrop";
import { WorkshopAvatar } from "../../art/WorkshopAvatar";
import { PencilTicks } from "./PencilTicks";
import { SeasonRibbon } from "./SeasonRibbon";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function rentNote(state: GameState): string {
  const bill = weeklyBill(state);
  const landlord = careerOf(state).landlord;
  if (bill === 0) return "No rent on Relaxed. Build for joy!";
  const wage = renWageDue(state, weekEndDay(state.calendar.day));
  const label = rentLabel(state).toLowerCase();
  const days = daysUntilWeekEnd(state.calendar.day);
  const when = days === 0 ? "tonight" : `in ${days} ${days === 1 ? "day" : "days"}`;
  if (wage === 0) return `${landlord} collects ${bill} coins of ${label} ${when}.`;
  return `${landlord} collects ${bill} coins ${when}: ${bill - wage} of ${label} and Ren's ${wage}-coin wage for next week.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const career = careerOf(state);
  const shift = canWorkShift(state);
  const total = dayHours(state);
  const weekStart = calendar.day - ((calendar.day - 1) % DAYS_PER_WEEK);
  const evening = calendar.hoursLeft <= 3;
  const renHere = state.apprentice?.hired === true;
  return (
    <section className={`ww-hero ww-hero--${state.career}`} aria-label="Your day">
      {state.career === "showroom" ? (
        <ShowroomBackdrop
          className="ww-hero__backdrop"
          decor={state.decor}
          floor={state.showroom?.floor ?? []}
          rail={state.fair?.rosetteRail ?? {}}
          evening={evening}
          floorFocus
        />
      ) : (
        <GarageBackdrop className="ww-hero__backdrop" decor={state.decor} evening={evening} />
      )}
      <div className="ww-hero__figure" aria-hidden="true">
        <WorkshopAvatar look={profile.look} title={profile.name} />
        {renHere ? <WorkshopAvatar look={REN.look} title={REN.name} className="ww-hero__ren" /> : null}
      </div>
      <div className="ww-hero__card ww-paper ww-tape">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {career.workshopName}
        </span>
        <h1 className="ww-hero__title">
          {dayGreeting(calendar.hoursLeft, total)}, {profile.name}
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
        <SeasonRibbon state={state} />
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
            aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
          >
            {career.shiftButton} · +{career.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
