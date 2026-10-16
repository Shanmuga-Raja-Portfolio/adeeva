import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { REN } from "../../../content/apprentice";
import { REN_SAFETY_LINE, SET_HINTS } from "../../../content/hint";
import {
  hireCheck,
  renAccuracy,
  renHireCost,
  renJobsPerDay,
  renLevel,
  type Action,
  type GameState,
} from "../../../core";
import { WorkshopAvatar } from "../../art/WorkshopAvatar";
import { weeklyRent } from "../../../../../engine/difficulty";

export interface RenCardProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
}

function jobsText(count: number): string {
  return `${count} ${count === 1 ? "job" : "jobs"}`;
}

export function RenCard({ state, dispatch }: RenCardProps) {
  const once = useDispatchOnce(state, dispatch);
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null) return null;
  const level = renLevel(apprentice.jobsDone);
  const toNext = level >= 3 ? null : REN.jobsPerLevel * level - apprentice.jobsDone;
  const wage = weeklyRent(REN.weeklyWage, state.profile.difficulty);
  const cost = renHireCost(state);
  return (
    <Card title={REN.name} eyebrow="Your apprentice" className="ww-hub-card ww-ren" data-testid="ren-card">
      <div className="ww-ren__row">
        <WorkshopAvatar look={REN.look} title={REN.name} className="ww-ren__avatar" />
        <div className="ww-ren__facts">
          <span>
            <Icon name="star" size={14} /> Level {level} ·{" "}
            {Math.round(renAccuracy(apprentice.jobsDone) * 100)}% steady
          </span>
          <span>
            <Icon name="coin" size={14} /> Wage {wage} a week
          </span>
          {apprentice.hired ? (
            <span>
              <Icon name="clock" size={14} />{" "}
              {jobsText(Math.max(0, renJobsPerDay(state) - apprentice.jobsToday))} left today
            </span>
          ) : (
            <span>
              <Icon name="heart" size={14} />{" "}
              {apprentice.jobsDone === 0 && apprentice.paidThroughDay === 0
                ? "Ready to start"
                : "Having a week off"}
            </span>
          )}
          <Meter
            label={toNext === null ? "Top level!" : `${jobsText(toNext)} to the next level`}
            tone="sage"
            value={
              toNext === null
                ? 100
                : Math.round(((apprentice.jobsDone % REN.jobsPerLevel) / REN.jobsPerLevel) * 100)
            }
            valueText={`Level ${level}`}
          />
        </div>
      </div>
      <p className="ww-hint">{SET_HINTS.ren} Ren fetches boards, sands and taps peg joints.</p>
      <p className="ww-safety">
        <Icon name="shield" size={14} /> {REN_SAFETY_LINE}
      </p>
      {apprentice.hired ? (
        <Button variant="ghost" onClick={(event) => once(event, { type: "giveRenWeekOff" })}>
          Give Ren the week off
        </Button>
      ) : (
        <Button
          icon="heart"
          onClick={(event) => once(event, { type: "takeRenOn" })}
          disabledReason={hireCheck(state).reasons[0]}
          data-testid="take-ren-on"
        >
          {cost > 0 ? `Take Ren on · ${cost} coins` : "Take Ren on"}
        </Button>
      )}
    </Card>
  );
}
