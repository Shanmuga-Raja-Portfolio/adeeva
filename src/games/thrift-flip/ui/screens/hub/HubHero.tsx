import { Button } from "../../../../../ui/kit/Button";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { weekNumber } from "../../../../../engine/weekday";
import { SEASON_LENGTH_DAYS, SHOWCASE_FIRST_DAY, SWAP_SEASON_DAY } from "../../../content/season";
import {
  BASE_DAY_HOURS,
  canWorkShift,
  careerOf,
  hallCommittedToday,
  isShowcaseDay,
  isStallDay,
  isSwapDay,
  seasonDay,
  seasonTheme,
  signById,
  stallHeldToday,
  todaysSwapDay,
  weekEndDay,
  weeklyBill,
  type GameState,
} from "../../../core";
import { stallDayName } from "../stallDayName";
import { HubScene } from "./HubScene";
import "./hero.css";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onEndDay: (event: ClickLike) => void;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onOpenStall: () => void;
  readonly onOpenHall: () => void;
  readonly onOpenShowcase: () => void;
}

interface Fact {
  readonly icon: IconName;
  readonly label: string;
  readonly value: string;
}

function inDays(count: number): string {
  return count === 1 ? "tomorrow" : `in ${count} days`;
}

function sellDayFacts(state: GameState): readonly Fact[] {
  const { day } = state.calendar;
  const career = careerOf(state);
  const rent = weeklyBill(state);
  const until = weekEndDay(day) - day;
  const selling: Fact = {
    icon: "calendar",
    label: "Next selling day",
    value: `${career.sellDayName}, ${inDays(until)}`,
  };
  if (rent > 0) return [selling, { icon: "coin", label: career.rentName, value: `${rent} coins` }];
  const welcome = state.boutique !== null && state.profile.difficulty !== "relaxed";
  return [
    selling,
    welcome
      ? { icon: "coin", label: "Mrs. Pell's welcome week", value: "No rent!" }
      : { icon: "coin", label: career.rentName, value: "None on Relaxed" },
  ];
}

function seasonValue(state: GameState): string | null {
  const day = seasonDay(state);
  const boutique = state.boutique;
  if (day === null || boutique === null) return null;
  if (boutique.season.showcase !== null) return "Showcase done. Enjoy the rosette!";
  if (isShowcaseDay(state)) return "The Showcase is open in Larkspur Hall";
  if (day < SWAP_SEASON_DAY) return `Swap & Mend ${inDays(SWAP_SEASON_DAY - day)}`;
  if (day < SHOWCASE_FIRST_DAY) return `Showcase opens ${inDays(SHOWCASE_FIRST_DAY - day)}`;
  return "A new season starts after Till Day";
}

function seasonFacts(state: GameState): readonly Fact[] {
  const value = seasonValue(state);
  return value === null ? [] : [{ icon: "sparkle", label: "Coming up", value }];
}

function Facts({ facts }: { readonly facts: readonly Fact[] }) {
  return (
    <ul className="tf-hero__facts">
      {facts.map((fact) => (
        <li key={fact.label}>
          <Icon name={fact.icon} size={20} />
          <span>
            <small>{fact.label}</small>
            <strong>{fact.value}</strong>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HubHero({
  state,
  onEndDay,
  onWorkShift,
  onOpenStall,
  onOpenHall,
  onOpenShowcase,
}: HubHeroProps) {
  const { day, hoursLeft } = state.calendar;
  const career = careerOf(state);
  const sellDay = isStallDay(day);
  const held = stallHeldToday(state);
  const shift = canWorkShift(state);
  const rent = weeklyBill(state);
  const boutique = state.boutique;
  const season = seasonTheme(state);
  const swapToday = isSwapDay(state) && todaysSwapDay(state) !== null && !sellDay;
  const hallOpen = hallCommittedToday(state);
  const showDay = boutique !== null && isShowcaseDay(state);
  const showOpen = showDay && boutique.season.showcase === null;
  const place = boutique === null ? career.placeName : signById(boutique.signId).name;
  return (
    <section
      className={["tf-hero", sellDay ? "tf-hero--stall" : "", boutique === null ? "" : "tf-hero--boutique"]
        .filter((name) => name.length > 0)
        .join(" ")}
      aria-label={boutique === null ? "Today at the market" : "Today on Larkspur Row"}
    >
      <HubScene state={state} className="tf-hero__scene" />
      <div className="tf-hero__board">
        <span className="tf-hero__week tf-chalk">
          {boutique === null ? `Week ${weekNumber(day)}` : `Season ${boutique.season.number}`}
        </span>
        <strong className="tf-hero__day tf-chalk">Day {day}</strong>
        <span className="tf-hero__weekday tf-chalk">{stallDayName(day, state.profile.career)}</span>
        {season === null ? null : (
          <span className="tf-hero__season tf-chalk">
            {season.name} · {seasonDay(state)}/{SEASON_LENGTH_DAYS}
          </span>
        )}
      </div>
      <div className="tf-hero__bar">
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
          {sellDay ? (
            <>
              <h2>
                {held
                  ? boutique === null
                    ? "The stall is packed up"
                    : "The till is closed for today"
                  : `It's ${career.sellDayName}!`}
              </h2>
              <p className="ad-muted">
                {held
                  ? rent === 0
                    ? "Rest up! A new week starts tomorrow."
                    : `${career.rentName} of ${rent} coins is paid when the day ends.`
                  : boutique === null
                    ? "Hang your own pieces, write fair price tags and open the awning."
                    : "Write fair price tags for the seasonal rack and ring the bell."}
              </p>
            </>
          ) : swapToday ? (
            <>
              <h2>Swap &amp; Mend is on today</h2>
              <p className="ad-muted">
                {hallOpen
                  ? "The hall is open. Tables, tea and a queue of loved things."
                  : "Open the hall to mend for neighbours and swap finds. No coins today."}
              </p>
            </>
          ) : (
            <>
              <h2>{place}</h2>
              <Facts facts={[...sellDayFacts(state), ...seasonFacts(state)]} />
            </>
          )}
        </div>
        <div className="tf-hero__actions">
          {sellDay && !held ? (
            <Button size="lg" icon="bag" onClick={onOpenStall} data-testid="open-stall">
              {boutique === null ? "Open the stall" : "Open the till"}
            </Button>
          ) : null}
          {swapToday ? (
            <Button size="lg" icon="heart" onClick={onOpenHall} data-testid="open-hall">
              {hallOpen ? "Back to the hall" : "Open the hall"}
            </Button>
          ) : null}
          {showDay && !sellDay ? (
            <Button
              size="lg"
              variant={showOpen ? "primary" : "secondary"}
              icon="sparkle"
              onClick={onOpenShowcase}
              data-testid="open-showcase"
            >
              {showOpen ? "Plan the Showcase" : "See the Showcase"}
            </Button>
          ) : null}
          {sellDay || swapToday ? null : (
            <Button
              variant="secondary"
              onClick={onWorkShift}
              disabledReason={shift.ok ? undefined : shift.reasons[0]}
              data-testid="work-shift"
            >
              {career.shiftName} · +{career.shiftPay}
            </Button>
          )}
          <Button
            variant={(sellDay && !held) || swapToday || showOpen ? "ghost" : "primary"}
            size={(sellDay && !held) || swapToday || showOpen ? "md" : "lg"}
            icon={(sellDay && !held) || swapToday || showOpen ? undefined : "clock"}
            onClick={onEndDay}
            data-testid="end-day"
          >
            End the day
          </Button>
        </div>
      </div>
    </section>
  );
}
