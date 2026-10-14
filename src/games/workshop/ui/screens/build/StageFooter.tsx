import { RUN_STAGES } from "../../../content/runStage";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, hoursShortfallReason, leaveHours } from "../../../core";
import { ADVANCE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export interface StageFooterProps extends StageProps {
  readonly ready?: string | undefined;
}

export function StageFooter({ state, run, dispatch, onExit, ready }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const next = RUN_STAGES[RUN_STAGES.indexOf(run.stage) + 1];
  if (next === undefined || next === "done") return null;
  const check = canAdvance(state);
  const hours = leaveHours(run);
  const hoursReason = hoursShortfallReason(state.calendar, hours);
  const others = check.reasons.filter((reason) => reason !== hoursReason);
  return (
    <footer className="ww-footer">
      {hoursReason !== null && others.length === 0 ? (
        <div className="ww-footer__tired" role="status">
          <Icon name="clock" size={22} />
          <span>
            <strong>Out of hours for today.</strong> {hoursReason} Your piece waits right here.
          </span>
          <Button variant="secondary" onClick={onExit}>
            Back to the garage to end the day
          </Button>
        </div>
      ) : null}
      <div className="ww-footer__row">
        <div className="ww-footer__status" aria-live="polite">
          {others.length > 0 ? (
            <ul>
              {others.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <span className="ww-footer__ready">
              <Icon name="check" size={18} /> {ready ?? "All set for the next step."}
            </span>
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
          {hours > 0 ? <span className="ww-footer__hours">{hours} h</span> : null}
        </Button>
      </div>
    </footer>
  );
}
