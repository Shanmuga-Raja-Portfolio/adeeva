import { dayGreeting } from "../../../../../engine/dayHours";
import { DAYS_PER_WEEK, weekEndDay } from "../../../../../engine/week";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import {
  canWorkShift,
  careerOf,
  dayHours,
  rentLabel,
  renWageDue,
  weeklyBill,
  type GameState,
} from "../../../core";
import { HoursPips } from "./HoursPips";
import { HubScene } from "./HubScene";
import { SeasonRibbon } from "./SeasonRibbon";
import { WorkbenchTicket } from "./WorkbenchTicket";

export interface HubHeroProps {
  readonly state: GameState;
  readonly benchTitle: string | null;
  readonly setAsideReason: string | undefined;
  readonly onOpenBench: () => void;
  readonly onSetAside: () => void;
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

export function HubHero({
  state,
  benchTitle,
  setAsideReason,
  onOpenBench,
  onSetAside,
  onWorkShift,
  onEndDay,
}: HubHeroProps) {
  const { profile, calendar } = state;
  const career = careerOf(state);
  const shift = canWorkShift(state);
  const total = dayHours(state);
  const weekStart = calendar.day - ((calendar.day - 1) % DAYS_PER_WEEK);
  const evening = calendar.hoursLeft <= 3;
  return (
    <section className={`ww-hero ww-hero--${state.career}`} aria-label="Your day">
      <div className="ww-hero__scene">
        <HubScene state={state} evening={evening} />
        <WorkbenchTicket
          title={benchTitle}
          quietWhenClear={state.career === "showroom"}
          setAsideReason={setAsideReason}
          onOpen={onOpenBench}
          onSetAside={onSetAside}
        />
      </div>
      <div className="ww-hero__desk">
        <div className="ww-hero__time">
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
          <HoursPips left={calendar.hoursLeft} total={total} />
        </div>
        <div className="ww-hero__day">
          <span className="ad-eyebrow">
            Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {career.workshopName}
          </span>
          <h1 className="ww-hero__title">
            {dayGreeting(calendar.hoursLeft, total)}, {profile.name}
          </h1>
          <SeasonRibbon state={state} />
          <p className="ww-hint ww-hero__rent">
            <Icon name="coin" size={18} /> {rentNote(state)}
          </p>
          <div className="ww-hero__buttons">
            <Button
              variant="secondary"
              icon="bag"
              onClick={onWorkShift}
              disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
              showReason
              aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
            >
              {career.shiftButton} · +{career.shiftPay}
            </Button>
            <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
              End day
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
