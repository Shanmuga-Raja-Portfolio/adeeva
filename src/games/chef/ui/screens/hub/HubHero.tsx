import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { isFamilyMeal, rungById, type GameState } from "../../../core";
import { KitchenBackdrop } from "../../art/KitchenBackdrop";
import { HeroCravings } from "./HeroCravings";
import { HeroDayActions } from "./HeroDayActions";
import "./hero.css";

export interface HubHeroProps {
  readonly state: GameState;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

export function HubHero({ state, onPotWash, onEndDay }: HubHeroProps) {
  const rung = rungById(state.rung);
  const scene = state.rung === "line" ? "hall" : "kitchen";
  return (
    <section className="ck-hero ck-hero--stacked" aria-labelledby="ck-hero-title">
      <div className="ck-hero__copy">
        <div className="ck-hero__lead">
          <span className="ad-eyebrow">{rung.place}</span>
          <h1 id="ck-hero-title" className="ck-hero__title">
            {isFamilyMeal(state.calendar.day) ? "Family Meal" : rung.name}
          </h1>
          <p className="ck-hero__goal">
            {isFamilyMeal(state.calendar.day)
              ? "No shifts or tests today. Practise any dish, visit the shop, and rest."
              : rung.goal}
          </p>
        </div>
        <div className="ck-hero__day">
          <HeroDayActions state={state} home={rung.home} onPotWash={onPotWash} onEndDay={onEndDay} />
          <HeroCravings state={state} />
        </div>
      </div>
      <div className="ck-hero__stage">
        <KitchenBackdrop scene={scene} headroom className="ck-hero__backdrop" />
        <div className="ck-hero__shade" aria-hidden="true" />
        <div className="ck-hero__chef">
          <Avatar
            look={state.profile.look}
            variant="full"
            mood="delighted"
            pose="wave"
            size={360}
            title={`${state.profile.name}, ${rung.name}`}
          />
        </div>
      </div>
    </section>
  );
}
