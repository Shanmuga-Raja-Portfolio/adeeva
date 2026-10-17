import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { isFamilyMeal, pathById, type GameState, type PathState } from "../../../core";
import { PathBackdrop } from "../../art/PathBackdrop";
import { HeroCravings } from "../hub/HeroCravings";
import { HeroDayActions } from "../hub/HeroDayActions";
import { PathAwards } from "./PathAwards";
import "../hub/hero.css";

export interface PathHeroProps {
  readonly state: GameState;
  readonly path: PathState;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function title(path: PathState): string {
  return path.kind === "truck" ? "Clementine" : "Spoon & Story";
}

function todayLine(state: GameState, path: PathState): string {
  if (isFamilyMeal(state.calendar.day)) return "Family Meal: rest, practise a dish and plan the week.";
  return pathById(path.kind).goal;
}

export function PathHero({ state, path, onPotWash, onEndDay }: PathHeroProps) {
  const def = pathById(path.kind);
  return (
    <section className={`ck-hero ck-hero--${path.kind}`} aria-labelledby="ck-hero-title">
      <div className="ck-hero__copy">
        <div className="ck-hero__lead">
          <span className="ad-eyebrow">{def.venue === title(path) ? def.name : def.venue}</span>
          <h1 id="ck-hero-title" className="ck-hero__title">
            {title(path)}
          </h1>
          <p className="ck-hero__goal">{todayLine(state, path)}</p>
        </div>
        <div className="ck-hero__day">
          <HeroDayActions state={state} home={def.home} onPotWash={onPotWash} onEndDay={onEndDay} />
          <HeroCravings state={state} />
        </div>
      </div>
      <div className="ck-hero__stage">
        <PathBackdrop state={state} className="ck-hero__backdrop" />
        <div className="ck-hero__shade" aria-hidden="true" />
        <div className="ck-hero__chef">
          <Avatar
            look={state.profile.look}
            variant="three-quarter"
            mood="delighted"
            pose="poised"
            size={330}
            title={state.profile.name}
          />
        </div>
        <PathAwards path={path} />
      </div>
    </section>
  );
}
