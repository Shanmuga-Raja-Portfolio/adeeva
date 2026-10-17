import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon, type IconName } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  canEndDay,
  canPotWash,
  forecastNight,
  isFamilyMeal,
  isServiceNight,
  menuPortions,
  nightOfWeek,
  onShift,
  openNightIssues,
  pathById,
  type GameState,
  type RestaurantState,
} from "../../../core";
import { diningCast } from "../../art/diningCast";
import { DINER_STYLES, dinerWear } from "../../art/dinerWear";
import { DINING_VIEW, KITCHEN_HATCH, MENU_BOARD, ROTA_BOARD, SPEAKER_SEAT } from "../../art/diningLayout";
import { QuaysideScene, type DiningMood } from "../../art/QuaysideScene";
import { SceneSpot } from "../hub/SceneSpot";
import { restaurantName } from "./restaurantName";
import "../hub/sceneHub.css";
import "./restaurantStage.css";

export interface RestaurantStageProps {
  readonly state: GameState;
  readonly restaurant: RestaurantState;
  readonly onMenu: () => void;
  readonly onReady: () => void;
  readonly onTeam: () => void;
  readonly onService: () => void;
  readonly onReport: () => void;
  readonly onOpenNight: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
  readonly onPotWash: (event: ClickLike) => void;
}

interface Choice {
  readonly label: string;
  readonly icon: IconName;
  readonly onClick: (event: ClickLike) => void;
  readonly testId: string;
  readonly reason?: string | undefined;
}

interface Tonight {
  readonly mood: DiningMood;
  readonly headline: string;
  readonly primary: Choice;
  readonly secondary: Choice | null;
}

function plan(props: RestaurantStageProps): Tonight {
  const { state, restaurant } = props;
  const day = state.calendar.day;
  const potWash: Choice | null = canPotWash(state).ok
    ? {
        label: `Wash pots for ${CAREER.potWashPay} coins`,
        icon: "coin",
        onClick: props.onPotWash,
        testId: "pot-wash",
      }
    : null;
  const endDay: Choice = {
    label: "End the day",
    icon: "calendar",
    onClick: props.onEndDay,
    testId: "end-day",
    reason: canEndDay(state).reasons[0],
  };
  if (state.service !== null)
    return {
      mood: "open",
      headline: "The dining room is full. Your team needs you!",
      primary: {
        label: "Back to the pass",
        icon: "sparkle",
        onClick: props.onService,
        testId: "back-to-service",
      },
      secondary: null,
    };
  if (state.lastShiftDay === day)
    return {
      mood: "closed",
      headline: "Lovely work, chef! The last guests wave goodbye.",
      primary: endDay,
      secondary:
        restaurant.lastNight === null
          ? null
          : { label: "Tonight's report", icon: "star", onClick: props.onReport, testId: "tonight-report" },
    };
  if (isServiceNight(day))
    return {
      mood: "ready",
      headline: restaurant.criticNights.some((visit) => visit.day === day)
        ? "Guests are waiting, and a critic is coming!"
        : "Guests are waiting outside. Ready, chef?",
      primary: {
        label: "Open the doors",
        icon: "sparkle",
        onClick: props.onOpenNight,
        testId: "open-night",
        reason: openNightIssues(state)[0],
      },
      secondary: potWash,
    };
  return {
    mood: "planning",
    headline:
      nightOfWeek(day) === 1 && !isFamilyMeal(day)
        ? "Market Run day: plan the menu and the team's week."
        : "Family Meal: the team rests. Plan next week.",
    primary: endDay,
    secondary: potWash,
  };
}

export function RestaurantStage(props: RestaurantStageProps) {
  const { state, restaurant } = props;
  const day = state.calendar.day;
  const tonight = plan(props);
  const forecast = forecastNight(state, restaurant, day);
  const team = onShift(restaurant, nightOfWeek(day));
  const showsEndDay = tonight.primary.testId === "end-day";
  const cast = diningCast(state, restaurant);
  const guest = cast.guests[SPEAKER_SEAT];
  const style = DINER_STYLES[SPEAKER_SEAT % DINER_STYLES.length];
  const quote = tonight.mood === "closed" && guest !== undefined ? cast.note : null;
  return (
    <section className="ck-scene-hub ck-dining" aria-labelledby="ck-dining-title">
      <div className="ck-scene-hub__stage">
        <QuaysideScene mood={tonight.mood} {...cast} className="ck-scene-hub__art" />
        <div className="ck-scene-hub__spots">
          <SceneSpot
            view={DINING_VIEW}
            area={MENU_BOARD}
            label="Menu & prices"
            icon="palette"
            onClick={props.onMenu}
            testId="open-menu"
          />
          <SceneSpot
            view={DINING_VIEW}
            area={ROTA_BOARD}
            label="Team & schedule"
            icon="heart"
            onClick={props.onTeam}
            testId="open-team"
          />
          <SceneSpot
            view={DINING_VIEW}
            area={KITCHEN_HATCH}
            label="Get ready"
            icon="bag"
            onClick={props.onReady}
            testId="open-ready"
          />
        </div>
      </div>
      <div className="ck-scene-hub__hud">
        <div className="ck-scene-hub__today">
          <div className="ck-dining__title">
            <h1 id="ck-dining-title" className="ck-dining__name">
              {restaurantName(state)}
            </h1>
            <span className="ad-eyebrow">{pathById(restaurant.kind).venue}</span>
          </div>
          {quote === null || guest === undefined ? (
            <p className="ck-scene-hub__headline">{tonight.headline}</p>
          ) : (
            <figure className="ck-dining__quote">
              <Avatar
                look={guest}
                garment={style === undefined ? undefined : dinerWear(style)}
                mood="delighted"
                size={72}
                frameColour="#ffd387"
                title="A happy guest"
              />
              <blockquote className="ck-scene-hub__headline">“{quote}”</blockquote>
            </figure>
          )}
          {tonight.mood === "ready" || !showsEndDay ? (
            <div className="ck-scene-hub__meta">
              {tonight.mood === "ready" ? (
                <ul className="ck-dining__facts">
                  <li>
                    <Icon name="heart" size={18} /> About {forecast.guests} guests
                  </li>
                  <li>
                    <Icon name="bag" size={18} /> {menuPortions(restaurant.menu)} portions
                  </li>
                  <li>
                    <Icon name="star" size={18} />{" "}
                    {team.length === 0
                      ? "Nobody on shift"
                      : team.map((member) => member.name.split(" ")[0]).join(", ")}
                  </li>
                </ul>
              ) : null}
              {showsEndDay ? null : (
                <div className="ck-scene-hub__links">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="calendar"
                    onClick={props.onEndDay}
                    disabledReason={canEndDay(state).reasons[0]}
                    data-testid="end-day"
                  >
                    End the day
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="ck-scene-hub__choices">
          {tonight.secondary === null ? null : (
            <Button
              variant="secondary"
              size="lg"
              icon={tonight.secondary.icon}
              onClick={tonight.secondary.onClick}
              data-testid={tonight.secondary.testId}
            >
              {tonight.secondary.label}
            </Button>
          )}
          <Button
            size="lg"
            icon={tonight.primary.icon}
            onClick={tonight.primary.onClick}
            disabledReason={tonight.primary.reason}
            showReason
            data-testid={tonight.primary.testId}
          >
            {tonight.primary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
