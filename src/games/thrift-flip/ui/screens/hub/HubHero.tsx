import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  BASE_DAY_HOURS,
  canWorkShift,
  isStallDay,
  stallHeldToday,
  weekEndDay,
  weeklyBill,
  type GameState,
} from "../../../core";
import { weekNumber } from "../../../../../engine/weekday";
import { stallDayName } from "../stallDayName";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onEndDay: (event: ClickLike) => void;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onOpenStall: () => void;
}

export function HubHero({ state, onEndDay, onWorkShift, onOpenStall }: HubHeroProps) {
  const { day, hoursLeft } = state.calendar;
  const stallDay = isStallDay(day);
  const held = stallHeldToday(state);
  const shift = canWorkShift(state);
  const rent = weeklyBill(state);
  return (
    <section className={stallDay ? "tf-hero tf-hero--stall" : "tf-hero"} aria-label="Today at the market">
      <div className="tf-hero__board">
        <span className="tf-hero__week tf-chalk">Week {weekNumber(day)}</span>
        <strong className="tf-hero__day tf-chalk">Day {day}</strong>
        <span className="tf-hero__weekday tf-chalk">{stallDayName(day)}</span>
      </div>
      <div className="tf-hero__clock" aria-label={`${hoursLeft} of ${BASE_DAY_HOURS} hours left today`}>
        <span className="ad-eyebrow">Hours left</span>
        <span className="tf-hero__hours" aria-hidden="true">
          {Array.from({ length: BASE_DAY_HOURS }, (_, index) => (
            <span
              key={index}
              className={index < hoursLeft ? "tf-hero__hour tf-hero__hour--on" : "tf-hero__hour"}
            />
          ))}
        </span>
        <strong>
          <Icon name="clock" size={16} /> {hoursLeft} h
        </strong>
      </div>
      <div className="tf-hero__text">
        {stallDay ? (
          <>
            <h2>{held ? "The stall is packed up" : "It's Stall Day!"}</h2>
            <p className="ad-muted">
              {held
                ? rent === 0
                  ? "Rest up! A new week starts tomorrow."
                  : `Stall rent of ${rent} coins is paid when the day ends.`
                : "Hang your own pieces, write fair price tags and open the awning."}
            </p>
          </>
        ) : (
          <>
            <h2>{CAREER.marketName}</h2>
            <p className="ad-muted">
              {weekEndDay(day) - day === 1
                ? "Stall Day is tomorrow."
                : `Stall Day in ${weekEndDay(day) - day} days.`}{" "}
              {rent === 0 ? "No stall rent on Relaxed." : `Stall rent: ${rent} coins.`}
            </p>
          </>
        )}
      </div>
      <div className="tf-hero__actions">
        {stallDay && !held ? (
          <Button size="lg" icon="bag" onClick={onOpenStall} data-testid="open-stall">
            Open the stall
          </Button>
        ) : null}
        {stallDay ? null : (
          <Button
            variant="secondary"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons[0]}
            data-testid="work-shift"
          >
            {CAREER.shiftName} · +{CAREER.shiftPay}
          </Button>
        )}
        <Button variant={stallDay && !held ? "ghost" : "primary"} onClick={onEndDay} data-testid="end-day">
          End the day
        </Button>
      </div>
    </section>
  );
}
