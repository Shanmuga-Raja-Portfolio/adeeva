import { dayGreeting } from "../../../../../engine/dayHours";
import { daysUntilWeekEnd, weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { ARCADE_NAME, LANDLORD } from "../../../content/career";
import {
  canEndDay,
  canWorkShift,
  careerById,
  dayLength,
  isLanternNight,
  isMarketDay,
  isPopupDay,
  launchStaged,
  popupDone,
  rentLabel,
  seasonByNumber,
  weeklyBill,
  type GameState,
} from "../../../core";
import { ArcadeBackdrop } from "../../art/ArcadeBackdrop";
import { BenchAvatar } from "../../art/BenchAvatar";
import { HeroBench } from "../../art/HeroBench";
import { LoftBackdrop } from "../../art/LoftBackdrop";
import { garlandLights } from "../loft/garlandLights";
import { HourBeads } from "./HourBeads";
import { WeekDrawers } from "./WeekDrawers";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Make for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  const label = rentLabel(state).toLowerCase();
  if (days === 0) return `${rent} coins of ${label} go to ${LANDLORD} tonight.`;
  return `${rent} coins of ${label} are due at the week's end, in ${days} ${days === 1 ? "day" : "days"}.`;
}

function dayNote(state: GameState): string | null {
  const collection = state.collection;
  const day = state.calendar.day;
  if (collection !== null && isLanternNight(state, day) && !launchStaged(state, collection))
    return "It's Lantern Night! Stage your Launch before the lanterns dim.";
  if (collection !== null && isPopupDay(state, day))
    return popupDone(state, collection)
      ? "Pop-up Day. Your window is all done for this season."
      : launchStaged(state, collection)
        ? "It's Pop-up Day! Open your window at the arcade gate."
        : canEndDay(state).ok
          ? "Pop-up Day. Your line carries on to next season."
          : "Pop-up Day! There's still time for a late Launch first.";
  if (isMarketDay(state, day)) return "It's Market Day! Set out your stall tray before the lanterns dim.";
  return null;
}

export function HubHero({ state, onWorkShift, onEndDay }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const total = dayLength(state);
  const note = dayNote(state);
  const career = careerById(state.career);
  const collection = state.collection;
  const evening = calendar.hoursLeft <= 3;
  const end = canEndDay(state);
  return (
    <section className="jb-hub-hero" aria-label="Your day">
      {collection === null ? (
        <ArcadeBackdrop
          className="jb-hub-hero__backdrop"
          evening={evening}
          lanterns={state.decor.includes("lantern-string") ? 13 : 9}
        />
      ) : (
        <LoftBackdrop
          className="jb-hub-hero__backdrop"
          dusk={seasonByNumber(collection.seasonNumber).dusk}
          evening={evening}
          garland={garlandLights(state)}
        />
      )}
      <div className="jb-hub-hero__figure" aria-hidden="true">
        <BenchAvatar look={profile.look} title={profile.name} />
        <HeroBench className="jb-hub-hero__bench" />
      </div>
      <div className="jb-hub-hero__card jb-measure">
        <span className="ad-eyebrow">
          Week {weekNumber(calendar.day)} · {weekdayName(calendar.day)} ·{" "}
          {collection === null ? ARCADE_NAME : "The Lantern Loft"}
        </span>
        <h1 className="jb-hub-hero__title">
          {dayGreeting(calendar.hoursLeft, total)}, {profile.name}
        </h1>
        {note !== null ? (
          <p className="jb-hub-hero__market" data-testid="day-note">
            <Icon name="star" size={16} /> {note}
          </p>
        ) : null}
        <WeekDrawers day={calendar.day} />
        <div className="jb-hub-hero__hours">
          <HourBeads left={calendar.hoursLeft} total={total} />
          <span aria-hidden="true">
            <strong>{calendar.hoursLeft}</strong> of {total} hours left
          </span>
        </div>
        <p className="jb-hint">
          <Icon name="coin" size={16} /> {rentNote(state)}
        </p>
        <div className="jb-hub-hero__buttons">
          {!shift.ok && end.ok ? (
            <p className="jb-hub-hero__shift-note" title={shift.reasons[0]}>
              <Icon name="bag" size={16} /> {career.shiftButton} · +{career.shiftPay} · mornings only
            </p>
          ) : null}
          {shift.ok ? (
            <Button
              variant="secondary"
              icon="bag"
              onClick={onWorkShift}
              aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
            >
              {career.shiftButton} · +{career.shiftPay}
            </Button>
          ) : null}
          <Button
            size="lg"
            icon="calendar"
            onClick={onEndDay}
            disabledReason={end.ok ? undefined : end.reasons[0]}
            showReason
            data-testid="end-day"
          >
            End day
          </Button>
        </div>
      </div>
    </section>
  );
}
