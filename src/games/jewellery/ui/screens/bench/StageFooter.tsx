import type { ReactNode } from "react";
import { hoursShortfallReason } from "../../../../../engine/dayHours";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, canFinishStall, leaveHours, runStages } from "../../../core";
import { ADVANCE_LABELS } from "./stageNames";
import type { StageProps } from "./stageProps";

export interface StageFooterProps extends StageProps {
  readonly ready?: string | undefined;
  readonly extra?: ReactNode;
}

export function StageFooter({ state, run, dispatch, onExit, ready, extra }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const stages = runStages(run);
  const next = stages[stages.indexOf(run.stage) + 1];
  if (next === undefined) return null;
  const finishing = next === "done";
  const check = finishing ? canFinishStall(state) : canAdvance(state);
  const hours = leaveHours(run);
  const hoursReason = hoursShortfallReason(state.calendar, hours);
  const others = check.reasons.filter((reason) => reason !== hoursReason);
  return (
    <footer className="jb-footer">
      {hoursReason !== null && others.length === 0 ? (
        <div className="jb-footer__tired" role="status">
          <Icon name="clock" size={22} />
          <span>
            <strong>Out of hours for today.</strong> {hoursReason} Your piece waits right here.
          </span>
          <Button variant="secondary" onClick={onExit}>
            Back to the arcade to end the day
          </Button>
        </div>
      ) : null}
      <div className="jb-footer__row">
        <div className="jb-footer__status" aria-live="polite">
          {others.length > 0 ? (
            <ul>
              {others.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <span className="jb-footer__ready">{ready ?? "All set for the next step."}</span>
          )}
        </div>
        {extra}
        <Button
          size="lg"
          onClick={(event) =>
            once(event, finishing ? { type: "finishStall" } : { type: "goToStage", stage: next })
          }
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="advance-stage"
        >
          {finishing
            ? "Put it in the stall box"
            : run.purpose.kind === "collection" && run.stage === "display"
              ? "Look it over"
              : ADVANCE_LABELS[run.stage]}
          {hours > 0 ? <span className="jb-footer__hours">{hours} h</span> : null}
        </Button>
      </div>
    </footer>
  );
}
