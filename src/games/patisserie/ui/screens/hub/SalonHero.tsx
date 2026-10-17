import type { AvatarLook } from "../../../../../engine/avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { MenuTierId } from "../../../content/menuTier";
import {
  canOpenTables,
  canWorkShift,
  careerById,
  clientById,
  currentSeason,
  dayKind,
  fairDayOf,
  fairThemeById,
  salonDayOf,
  seasonBegun,
  type GameState,
} from "../../../core";
import { BakerFigure } from "../../art/BakerFigure";
import { CometRoomScene } from "../../art/CometRoomScene";
import { daysAway } from "../season/daysAway";
import { SeasonCountdown } from "../season/SeasonCountdown";
import { BookingBoard } from "./BookingBoard";
import { DayRibbon } from "./DayRibbon";
import { scrollToPlans } from "./scrollToPlans";
import { SalonStand } from "./SalonStand";
import "./salonHero.css";

export interface SalonHeroProps {
  readonly state: GameState;
  readonly plansId: string;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
  readonly onBakeTray: (event: ClickLike, tier: MenuTierId) => void;
  readonly onWelcome: (event: ClickLike) => void;
}

function parlourGuests(state: GameState): AvatarLook[] {
  return (state.salon?.bookings ?? []).flatMap((booking) => {
    const guest = clientById(booking.guestId);
    return guest === undefined ? [] : [guest.look];
  });
}

function seasonName(state: GameState): string | null {
  const fair = state.fair;
  if (fair === null) return null;
  const theme = fair.themeId === null ? "" : ` · ${fairThemeById(fair.themeId).name}`;
  return `${currentSeason(fair).name}${theme}`;
}

function todayNote(state: GameState): string | null {
  const kind = dayKind(state);
  if (kind === "salon") return "It's Salon Day! The oven rests. Your guests are on their way.";
  if (kind === "fair") return "It's Fair Day! Head to the glasshouse with your showpiece.";
  if (kind === "counter") return "It's Counter Day! The oven rests. Open the counter and box up treats.";
  return null;
}

export function SalonHero({ state, plansId, onWorkShift, onEndDay, onBakeTray, onWelcome }: SalonHeroProps) {
  const { profile, calendar, fair, salon } = state;
  const shift = canWorkShift(state);
  const career = careerById(state.career);
  const evening = calendar.hoursLeft <= 3;
  const salonDay = dayKind(state) === "salon" && salon !== null && salon.menu !== null;
  const welcome = canOpenTables(state);
  const live = fair !== null && seasonBegun(fair, calendar.day) && salon?.parlour !== "resting";
  const season = seasonName(state);
  return (
    <section className="pa-salon-hero" aria-label="Your day in the Comet Room">
      <div className="pa-salon-hero__view">
        <div className="pa-salon-hero__stage">
          <CometRoomScene
            className="pa-salon-hero__backdrop"
            glow={evening ? 1 : 0.6}
            daylight={!evening}
            guests={parlourGuests(state)}
          />
          <div className="pa-salon-hero__light" aria-hidden="true" />
          <div className="pa-salon-hero__baker" aria-hidden="true">
            <BakerFigure look={profile.look} name={profile.name} held="tea" />
          </div>
          <SalonStand state={state} onBakeTray={onBakeTray} />
        </div>
      </div>
      <div className="pa-salon-hero__top">
        <DayRibbon state={state} note={todayNote(state)}>
          {season !== null && fair !== null ? (
            <>
              <p className="pa-day-details__row">
                <Icon name="star" size={18} /> Fair Season {fair.seasonNumber}: {season}
              </p>
              {live ? (
                <div className="pa-day-details__chips">
                  <SeasonCountdown
                    label="Salon Day"
                    when={daysAway(calendar.day, salonDayOf(fair))}
                    icon="heart"
                    tone="sage"
                  />
                  <SeasonCountdown
                    label="Fair Day"
                    when={daysAway(calendar.day, fairDayOf(fair))}
                    icon="star"
                    tone="hot"
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </DayRibbon>
      </div>
      <BookingBoard state={state} />
      <button type="button" className="pa-salon-hero__plans" onClick={() => scrollToPlans(plansId)}>
        Menu, orders and shop
        <span className="pa-salon-hero__chevron" aria-hidden="true" />
      </button>
      <div className="pa-salon-hero__actions">
        <Button
          variant="secondary"
          className="pa-hub-hero__chore"
          onClick={onWorkShift}
          disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
          aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
        >
          Set up tables
          <span className="pa-hub-hero__pay">
            <Icon name="coin" size={14} /> +{career.shiftPay}
          </span>
        </Button>
        {salonDay ? (
          <>
            <Button variant="secondary" icon="calendar" onClick={onEndDay} data-testid="end-day">
              End day
            </Button>
            <Button
              size="lg"
              icon="heart"
              onClick={onWelcome}
              disabledReason={salon.session !== null || welcome.ok ? undefined : welcome.reasons[0]}
            >
              Welcome the guests
            </Button>
          </>
        ) : (
          <Button size="lg" icon="calendar" onClick={onEndDay} data-testid="end-day">
            End day
          </Button>
        )}
      </div>
    </section>
  );
}
