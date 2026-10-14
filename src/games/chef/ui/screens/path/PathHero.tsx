import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { PATH_AWARDS } from "../../../content/award";
import {
  awardById,
  isFamilyMeal,
  nightOfWeek,
  pathById,
  type GameState,
  type PathState,
} from "../../../core";
import { PathBackdrop } from "../../art/PathBackdrop";
import { HeroCravings } from "../hub/HeroCravings";
import { HeroDayActions } from "../hub/HeroDayActions";
import { restaurantName } from "./restaurantName";

export interface PathHeroProps {
  readonly state: GameState;
  readonly path: PathState;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function title(state: GameState, path: PathState): string {
  if (path.kind === "restaurant") return restaurantName(state);
  return path.kind === "truck" ? "Clementine" : "Spoon & Story";
}

function todayLine(state: GameState, path: PathState): string {
  if (isFamilyMeal(state.calendar.day)) return "Family Meal: rest, practise a dish and plan the week.";
  if (path.kind === "restaurant")
    return nightOfWeek(state.calendar.day) === 1
      ? "Market Run and planning day. Set the menu, prices and the team's week."
      : "A service night. Get ready, then open the doors.";
  return pathById(path.kind).goal;
}

export function PathHero({ state, path, onPotWash, onEndDay }: PathHeroProps) {
  const def = pathById(path.kind);
  return (
    <section className={`ck-hero ck-hero--${path.kind}`} aria-labelledby="ck-hero-title">
      <PathBackdrop state={state} className="ck-hero__backdrop" />
      <div className="ck-hero__shade" aria-hidden="true" />
      <div className="ck-hero__chef">
        <Avatar
          look={state.profile.look}
          variant="full"
          mood="delighted"
          size={250}
          title={state.profile.name}
        />
      </div>
      <div className="ck-hero__copy">
        <span className="ad-eyebrow">{def.venue === title(state, path) ? def.name : def.venue}</span>
        <h1 id="ck-hero-title" className="ck-hero__title">
          {title(state, path)}
        </h1>
        <p className="ck-hero__goal">{todayLine(state, path)}</p>
        <ul className="ck-path-awards" aria-label="Path awards">
          {PATH_AWARDS[path.kind].map((id) => {
            const won = path.awards.includes(id);
            return (
              <li key={id} className={won ? "ck-path-award ck-path-award--won" : "ck-path-award"}>
                <span aria-hidden="true">{won ? "★" : "☆"}</span> {awardById(id).name}
              </li>
            );
          })}
        </ul>
        <HeroCravings state={state} />
        <HeroDayActions state={state} home={def.home} onPotWash={onPotWash} onEndDay={onEndDay} />
      </div>
    </section>
  );
}
