import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import {
  menuPortions,
  forecastNight,
  isServiceNight,
  nightOfWeek,
  onShift,
  openNightIssues,
  type GameState,
  type RestaurantState,
} from "../../../core";
import { ClosedSign } from "../../art/ClosedSign";
import { PathAwards } from "./PathAwards";

export interface TonightCardProps {
  readonly state: GameState;
  readonly restaurant: RestaurantState;
  readonly onOpenNight: (event: ClickLike) => void;
  readonly onMenu: () => void;
  readonly onReady: () => void;
  readonly onTeam: () => void;
  readonly onService: () => void;
  readonly onLastNight: () => void;
}

export function TonightCard(props: TonightCardProps) {
  const { state, restaurant } = props;
  const day = state.calendar.day;
  const serviceNight = isServiceNight(day);
  const plan = forecastNight(state, restaurant, day);
  const critic = restaurant.criticNights.some((visit) => visit.day === day);
  const team = onShift(restaurant, nightOfWeek(day));
  const opened = state.lastShiftDay === day;
  const issue = openNightIssues(state)[0];
  const portions = menuPortions(restaurant.menu);
  return (
    <section className="ck-board ck-tonight" aria-labelledby="ck-tonight-title" data-testid="tonight-card">
      <header className="ck-board__header">
        <h2 id="ck-tonight-title" className="ck-chalk">
          {serviceNight ? "Tonight" : nightOfWeek(day) === 1 ? "Market Run" : "Family Meal"}
        </h2>
        <span className="ck-board__note">Day {day}</span>
      </header>
      <div className="ck-tonight__desks">
        <Button variant="secondary" icon="palette" onClick={props.onMenu} data-testid="open-menu">
          Menu &amp; prices
        </Button>
        <Button variant="secondary" icon="bag" onClick={props.onReady} data-testid="open-ready">
          Get ready
        </Button>
        <Button variant="secondary" icon="heart" onClick={props.onTeam} data-testid="open-team">
          Team &amp; schedule
        </Button>
      </div>
      {state.service !== null ? (
        <article className="ck-test-card ck-test-card--live">
          <h3>The dining room is open</h3>
          <Button icon="sparkle" onClick={props.onService} data-testid="back-to-service">
            Back to the pass
          </Button>
        </article>
      ) : null}
      {serviceNight && !opened && state.service === null ? (
        <article className="ck-ticket-card ck-tonight__ticket">
          <div className="ck-ticket-card__pin" aria-hidden="true" />
          <ul className="ck-ticket-card__facts">
            <li>
              <Icon name="heart" size={16} /> About {plan.guests} guests · {plan.seats} seats
            </li>
            <li>
              <Icon name="bag" size={16} /> {portions} portions ready · Market Run {plan.ingredients} coins
            </li>
            <li>
              <Icon name="star" size={16} />{" "}
              {team.length === 0
                ? "Nobody on shift yet"
                : team.map((member) => member.name.split(" ")[0]).join(", ")}
            </li>
          </ul>
          {critic ? (
            <p className="ck-tonight__critic">A quiet guest with a notebook will sit at Table 7 tonight.</p>
          ) : null}
          <div className="ck-ticket-card__actions">
            <Button
              icon="sparkle"
              onClick={props.onOpenNight}
              disabledReason={issue}
              showReason
              data-testid="open-night"
            >
              Open the doors
            </Button>
          </div>
        </article>
      ) : null}
      {opened && state.service === null ? (
        <div className="ck-tonight__closed">
          <ClosedSign />
          <p className="ck-board__empty">The chairs are up and the lamps are low. Lovely work tonight.</p>
          <p className="ck-tonight__next">
            <Icon name="calendar" size={18} /> All done here. Tap End the day when you're ready to rest.
          </p>
          {restaurant.lastNight === null ? null : (
            <Button variant="secondary" icon="star" onClick={props.onLastNight}>
              Tonight's report
            </Button>
          )}
        </div>
      ) : null}
      {!serviceNight ? (
        <p className="ck-board__empty">
          {nightOfWeek(day) === 1
            ? "No service tonight. Plan the week: menu, prices and who works when."
            : "Family Meal. The team rests. Practise a dish or plan next week."}
        </p>
      ) : null}
      <PathAwards path={restaurant} className="ck-path-awards--board" />
    </section>
  );
}
