import type { ReactNode } from "react";
import { hoursShortfallReason } from "../../../../../engine/dayHours";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, isHomeRoom, leaveHours, RUN_STAGES } from "../../../core";
import { ADVANCE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export interface StageFooterProps extends StageProps {
  readonly ready?: string | undefined;
  readonly extra?: ReactNode;
}

export function StageFooter({ state, run, dispatch, onExit, ready, extra }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const next = RUN_STAGES[RUN_STAGES.indexOf(run.stage) + 1];
  if (next === undefined || next === "done") return null;
  const check = canAdvance(state);
  const hours = leaveHours(run);
  const hoursReason = hoursShortfallReason(state.calendar, hours);
  const others = check.reasons.filter((reason) => reason !== hoursReason);
  const label =
    run.stage === "style" && isHomeRoom(run) ? "Make it ready for visitors" : ADVANCE_LABELS[run.stage];
  return (
    <footer className="is-footer">
      {hoursReason !== null && others.length === 0 ? (
        <div className="is-footer__tired" role="status">
          <Icon name="clock" size={22} />
          <span>
            <strong>Out of hours for today.</strong> {hoursReason} Your room waits right here.
          </span>
          <Button variant="secondary" onClick={onExit}>
            {isHomeRoom(run) ? "Back to the home to end the day" : "Back to the loft to end the day"}
          </Button>
        </div>
      ) : null}
      <div className="is-footer__row">
        <div className="is-footer__status" aria-live="polite">
          {others.length > 0 ? (
            <p className="is-footer__lock">
              <Icon name="lock" size={16} /> To unlock “{label}”:
            </p>
          ) : null}
          {others.length > 0 ? (
            <ul>
              {others.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <span className="is-footer__ready">{ready ?? "All set for the next step."}</span>
          )}
        </div>
        {extra}
        <Button
          size="lg"
          icon={check.ok ? undefined : "lock"}
          onClick={(event) => once(event, { type: "goToStage", stage: next })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="advance-stage"
        >
          {label}
          {hours > 0 ? <span className="is-footer__hours">{hours} h</span> : null}
        </Button>
      </div>
    </footer>
  );
}
