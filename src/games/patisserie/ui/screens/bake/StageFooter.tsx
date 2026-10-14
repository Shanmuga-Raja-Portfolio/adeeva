import { hoursShortfallReason } from "../../../../../engine/dayHours";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, leaveHours, runKind, stagesFor } from "../../../core";
import { ADVANCE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export interface StageFooterProps extends StageProps {
  readonly ready?: string | undefined;
}

export function StageFooter({ state, run, dispatch, onExit, ready }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const stages = stagesFor(runKind(run));
  const next = stages[stages.indexOf(run.stage) + 1];
  if (next === undefined || next === "done") return null;
  const check = canAdvance(state);
  const hours = leaveHours(run, state.upgrades);
  const hoursReason = hoursShortfallReason(state.calendar, hours);
  const others = check.reasons.filter((reason) => reason !== hoursReason);
  return (
    <footer className="pa-footer">
      {hoursReason !== null && others.length === 0 ? (
        <div className="pa-footer__tired" role="status">
          <Icon name="clock" size={22} />
          <span>
            <strong>Out of hours for today.</strong> {hoursReason} Your bake waits right here.
          </span>
          <Button variant="secondary" onClick={onExit}>
            Back to the shop to end the day
          </Button>
        </div>
      ) : null}
      <div className="pa-footer__row">
        <div className="pa-footer__status" aria-live="polite">
          {others.length > 0 ? (
            <ul>
              {others.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <span className="pa-footer__ready">{ready ?? "All set for the next step."}</span>
          )}
        </div>
        <Button
          size="lg"
          onClick={(event) => once(event, { type: "goToStage", stage: next })}
          disabled={!check.ok}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="advance-stage"
        >
          {ADVANCE_LABELS[run.stage]}
          {hours > 0 ? <span className="pa-footer__hours">{hours} h</span> : null}
        </Button>
      </div>
    </footer>
  );
}
