import { BASE_DAY_HOURS, dayGreeting } from "../../../../../engine/dayHours";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { AvatarLook } from "../../../../../engine/avatar";
import {
  careerById,
  canWorkShift,
  clientById,
  dayKind,
  rentLabel,
  weeklyBill,
  type GameState,
} from "../../../core";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";
import { CometRoomBackdrop } from "../../art/CometRoomBackdrop";
import { ShopCounter } from "../../art/ShopCounter";
import { CounterCustomer } from "./CounterCustomer";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Bake for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  const label = rentLabel(state);
  if (days === 0) return `${label}: ${rent} coins, due tonight.`;
  return `${label}: ${rent} coins, due in ${days} ${days === 1 ? "day" : "days"}.`;
}

function parlourGuests(state: GameState): AvatarLook[] {
  return (state.salon?.bookings ?? []).flatMap((booking) => {
    const guest = clientById(booking.guestId);
    return guest === undefined ? [] : [guest.look];
  });
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const kind = dayKind(state);
  const career = careerById(state.career);
  const salon = state.career === "salon";
  const evening = calendar.hoursLeft <= 3;
  return (
    <section className={salon ? "pa-hub-hero pa-hub-hero--salon" : "pa-hub-hero"} aria-label="Your day">
      {salon ? (
        <CometRoomBackdrop
          className="pa-hub-hero__backdrop"
          glow={evening ? 1 : 0.55}
          daylight={!evening}
          guests={parlourGuests(state)}
        />
      ) : (
        <BakeryBackdrop className="pa-hub-hero__backdrop" evening={evening} />
      )}
      <div className="pa-hub-hero__figure" aria-hidden="true">
        <Avatar variant="full" look={profile.look} mood="happy" pose="wave" title={profile.name} />
      </div>
      {salon ? null : <CounterCustomer state={state} />}
      {salon ? null : <ShopCounter className="pa-hub-hero__counter-front" />}
      <div className="pa-hub-hero__card pa-doily">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} · {career.placeName}
        </span>
        <h1 className="pa-hub-hero__title">
          {dayGreeting(calendar.hoursLeft, BASE_DAY_HOURS)}, {profile.name}
        </h1>
        {kind === "counter" ? (
          <p className="pa-hub-hero__counter">
            <Icon name="star" size={16} /> It's Counter Day! The oven rests. Open the counter and box up
            treats.
          </p>
        ) : null}
        {kind === "salon" ? (
          <p className="pa-hub-hero__counter">
            <Icon name="heart" size={16} /> It's Salon Day! The oven rests. Open the Comet Room for your
            guests.
          </p>
        ) : null}
        {kind === "fair" ? (
          <p className="pa-hub-hero__counter">
            <Icon name="star" size={16} /> It's Fair Day! Head to the glasshouse with your showpiece.
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
            className="pa-hub-hero__chore"
            onClick={onWorkShift}
            disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
            aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
          >
            {state.career === "salon" ? "Set up tables" : "Wash trays"}
            <span className="pa-hub-hero__pay">
              <Icon name="coin" size={14} /> +{career.shiftPay}
            </span>
          </Button>
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
