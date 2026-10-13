import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { canWorkShift, careerById, hoursPerDay, weeklyBill, type GameState } from "../../../core";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { StudioBackdrop } from "../../art/StudioBackdrop";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";

export interface HubHeroProps {
  state: GameState;
  onWorkShift: (event: ClickLike) => void;
  onEndDay: (event: ClickLike) => void;
}

function greeting(hoursLeft: number, dayHours: number): string {
  const share = hoursLeft / dayHours;
  if (share > 0.66) return "Good morning";
  if (share > 0.3) return "Good afternoon";
  return "Good evening";
}

function billNote(state: GameState): string {
  const bill = weeklyBill(state);
  const total = bill.rent + bill.wage;
  if (total === 0) return "No bills this week. Sew for joy.";
  const days = daysUntilWeekEnd(state.calendar.day);
  const when = days === 0 ? "tonight" : days === 1 ? "tomorrow night" : `in ${days} days`;
  return `Weekly bills of ${total} coins due ${when}`;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const career = careerById(profile.career);
  const dayHours = hoursPerDay(state.studio);
  const shift = canWorkShift(state);
  const billDue = daysUntilWeekEnd(calendar.day) === 0 && weeklyBill(state).rent + weeklyBill(state).wage > 0;
  return (
    <section className="ad-hub-hero" aria-label="Your day">
      <StudioBackdrop kind={profile.career === "student" ? "bedroom" : "atelier"} wash={0.08} />
      <div className="ad-hub-hero__shade" aria-hidden="true" />
      <div className="ad-hub-hero__figure" aria-hidden="true">
        <Avatar variant="full" look={profile.look} mood="happy" title={profile.name} />
      </div>
      <div className="ad-hub-hero__greeting">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {career.studioName}
        </span>
        <h1 className="ad-hub-hero__title">
          {greeting(calendar.hoursLeft, dayHours)}, {profile.name}
        </h1>
      </div>
      <div className="ad-hub-hero__day">
        <Meter
          label="Hours left today"
          tone="sage"
          value={calendar.hoursLeft}
          max={dayHours}
          valueText={`${calendar.hoursLeft} of ${dayHours}`}
        />
        <p className={billDue ? "ad-hub-hero__bill ad-hub-hero__bill--due" : "ad-hub-hero__bill"}>
          <Icon name="coin" size={16} /> {billNote(state)}
        </p>
        <div className="ad-hub-hero__buttons">
          <Button
            variant="secondary"
            icon="bag"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
          >
            Work a shift · +{career.shiftPay}
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay}>
            End day
          </Button>
        </div>
        {shift.ok ? (
          <p className="ad-hub-hero__shift-note">
            {career.shiftName} pays {career.shiftPay} coins and takes the whole day.
          </p>
        ) : (
          <p className="ad-reason ad-hub-hero__reason">{shift.reasons.join(" ")}</p>
        )}
      </div>
    </section>
  );
}
