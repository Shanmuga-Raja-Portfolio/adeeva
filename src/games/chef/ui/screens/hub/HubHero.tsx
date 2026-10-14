import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  canEndDay,
  canPotWash,
  isFamilyMeal,
  rungById,
  visibleNextTrends,
  weeklyBill,
  type GameState,
} from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

export function HubHero({ state, onPotWash, onEndDay }: HubHeroProps) {
  const rung = rungById(state.rung);
  const scene = state.rung === "student" ? "school" : state.rung === "line" ? "hall" : "kitchen";
  const next = visibleNextTrends(state);
  const rentIn = daysUntilWeekEnd(state.calendar.day);
  const potWash = canPotWash(state);
  const endDay = canEndDay(state);
  return (
    <section className="ck-hero" aria-labelledby="ck-hero-title">
      <KitchenBackdrop scene={scene} className="ck-hero__backdrop" />
      <div className="ck-hero__shade" aria-hidden="true" />
      <div className="ck-hero__chef">
        <Avatar
          look={state.profile.look}
          variant="full"
          mood="delighted"
          size={250}
          title={`${state.profile.name}, ${rung.name}`}
        />
      </div>
      <div className="ck-hero__copy">
        <span className="ad-eyebrow">{rung.place}</span>
        <h1 id="ck-hero-title" className="ck-hero__title">
          {isFamilyMeal(state.calendar.day) ? "Family Meal" : rung.name}
        </h1>
        <p className="ck-hero__goal">
          {isFamilyMeal(state.calendar.day)
            ? "No shifts or tests today. Practise any dish, visit the shop, and rest."
            : rung.goal}
        </p>
        <div className="ck-hero__cravings" aria-label="Town cravings">
          <span className="ck-hero__label">Town cravings</span>
          {state.trends.current.map((tag) => (
            <TagPill key={tag} tone="hot">
              {tag}
            </TagPill>
          ))}
          {next === null ? null : (
            <>
              <span className="ck-hero__label">Next week</span>
              {next.map((tag) => (
                <TagPill key={tag} tone="next">
                  {tag}
                </TagPill>
              ))}
            </>
          )}
        </div>
        <p className="ck-hero__rent">
          {weeklyBill(state) === 0
            ? `No rent for ${rung.home} on this difficulty.`
            : rentIn === 0
              ? `Rent of ${weeklyBill(state)} coins for ${rung.home} is due tonight.`
              : `Rent for ${rung.home}: ${weeklyBill(state)} coins in ${rentIn} ${rentIn === 1 ? "day" : "days"}.`}
        </p>
        <div className="ck-hero__actions">
          <Button
            variant="secondary"
            onClick={onPotWash}
            disabledReason={potWash.reasons[0]}
            data-testid="pot-wash"
          >
            Pot-wash day (+{CAREER.potWashPay})
          </Button>
          <Button icon="calendar" onClick={onEndDay} disabledReason={endDay.reasons[0]} data-testid="end-day">
            End the day
          </Button>
        </div>
      </div>
    </section>
  );
}
