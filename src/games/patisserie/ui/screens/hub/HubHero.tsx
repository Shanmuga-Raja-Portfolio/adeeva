import { BASE_DAY_HOURS } from "../../../../../engine/dayHours";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canWorkShift, isCounterDay, weeklyBill, type GameState } from "../../../core";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function greeting(hoursLeft: number): string {
  const share = hoursLeft / BASE_DAY_HOURS;
  if (share > 0.66) return "Good morning";
  if (share > 0.3) return "Good afternoon";
  return "Good evening";
}

function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Bake for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  if (days === 0) return `Bakery rent of ${rent} coins is due tonight.`;
  return `Bakery rent of ${rent} coins is due after Counter Day, in ${days} ${days === 1 ? "day" : "days"}.`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const counterDay = isCounterDay(calendar.day);
  return (
    <section className="pa-hub-hero" aria-label="Your day">
      <BakeryBackdrop className="pa-hub-hero__backdrop" evening={calendar.hoursLeft <= 3} />
      <div className="pa-hub-hero__figure" aria-hidden="true">
        <Avatar variant="full" look={profile.look} mood="happy" title={profile.name} />
      </div>
      <div className="pa-hub-hero__card pa-doily">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {CAREER.bakeryName}
        </span>
        <h1 className="pa-hub-hero__title">
          {greeting(calendar.hoursLeft)}, {profile.name}
        </h1>
        {counterDay ? (
          <p className="pa-hub-hero__counter">
            <Icon name="star" size={16} /> It's Counter Day! The oven rests. Open the counter and box up
            treats.
          </p>
        ) : null}
        <Meter
          label="Hours left today"
          tone="sage"
          value={calendar.hoursLeft}
          max={BASE_DAY_HOURS}
          valueText={`${calendar.hoursLeft} of ${BASE_DAY_HOURS}`}
        />
        <p className="pa-hint">
          <Icon name="coin" size={16} /> {rentNote(state)}
        </p>
        <div className="pa-hub-hero__buttons">
          <Button
            variant="secondary"
            icon="bag"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${CAREER.shiftName} for ${CAREER.shiftPay} coins`}
          >
            Wash trays · +{CAREER.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
