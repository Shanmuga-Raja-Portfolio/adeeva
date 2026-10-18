import type { ReactNode } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, hoursShortfallReason, runStageAfter, runStageHours, type Action } from "../../../core";
import { ADVANCE_TO } from "./stageNames";
import type { StageProps } from "./stageProps";

export interface StageFooterProps extends StageProps {
  readonly before?: readonly Action[] | undefined;
  readonly hint?: string | undefined;
  readonly status?: ReactNode;
}

export function StageFooter({ state, run, dispatch, onExit, before = [], hint, status }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const next = runStageAfter(run, run.stage);
  if (next === null || next === "done") return null;
  const check = canAdvance(state);
  const hours = runStageHours(run, state.upgrades);
  const hoursReason = hoursShortfallReason(state.calendar, hours);
  const otherReasons = check.reasons.filter((reason) => reason !== hoursReason);
  const advance = (event: ClickLike) => {
    once(event, ...before, { type: "goToStage", stage: next });
  };
  return (
    <footer className="tf-footer">
      {hoursReason !== null && otherReasons.length === 0 ? (
        <div className="tf-footer__notice" role="status">
          <Icon name="clock" size={22} />
          <span>
            <strong>Out of hours for today.</strong> {hoursReason} Your work waits on the bench.
          </span>
          <Button variant="secondary" onClick={onExit}>
            Back to the stall
          </Button>
        </div>
      ) : null}
      <div className="tf-footer__row">
        <div className="tf-footer__status" aria-live="polite">
          {status !== undefined ? (
            status
          ) : otherReasons.length > 0 ? (
            <ul className="tf-footer__reasons">
              {otherReasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              {otherReasons.length > 3 ? <li>…and {otherReasons.length - 3} more.</li> : null}
            </ul>
          ) : (
            <span className="tf-footer__ready">{hint ?? "All set for the next step."}</span>
          )}
        </div>
        <Button
          size="lg"
          icon={check.ok ? undefined : "lock"}
          onClick={advance}
          disabled={!check.ok}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="advance-stage"
        >
          {ADVANCE_TO[next]}
          {hours > 0 ? (
            <span className="tf-footer__hours">
              <Icon name="clock" size={14} /> {hours} h
            </span>
          ) : null}
        </Button>
      </div>
    </footer>
  );
}
