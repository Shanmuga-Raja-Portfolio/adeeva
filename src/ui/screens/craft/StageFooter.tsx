import {
  canAdvance,
  hoursShortfallReason,
  stageCompletionHours,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { Button } from "../../kit/Button";
import { useDispatchOnce, type ClickLike } from "../../kit/useDispatchOnce";
import { HoursNotice } from "./HoursNotice";
import { ADVANCE_LABELS, CRAFT_STAGES } from "./stageNames";

export interface StageFooterProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
  readonly before?: readonly Action[] | undefined;
  readonly hint?: string | undefined;
}

export function StageFooter({ state, run, dispatch, onExit, before = [], hint }: StageFooterProps) {
  const once = useDispatchOnce(state, dispatch);
  const index = CRAFT_STAGES.findIndex((stage) => stage === run.stage);
  const next = CRAFT_STAGES[index + 1];
  if (next === undefined) return null;
  const check = canAdvance(state);
  const hours = stageCompletionHours(run.stage, state.studio.assistantHired);
  const hoursReason = hoursShortfallReason(state, hours);
  const otherReasons = check.reasons.filter((reason) => reason !== hoursReason);
  const advance = (event: ClickLike) => {
    once(event, ...before, { type: "goToStage", stage: next });
  };
  return (
    <footer className="ad-stage-footer">
      {hoursReason !== null && otherReasons.length === 0 ? (
        <HoursNotice message={hoursReason} onExit={onExit} />
      ) : null}
      <div className="ad-stage-footer__row">
        <div className="ad-stage-footer__status" aria-live="polite">
          {otherReasons.length > 0 ? (
            <ul className="ad-stage-footer__reasons">
              {otherReasons.slice(0, 4).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              {otherReasons.length > 4 ? <li>…and {otherReasons.length - 4} more.</li> : null}
            </ul>
          ) : (
            <span className="ad-stage-footer__ready">{hint ?? "All set for the next step."}</span>
          )}
        </div>
        <Button
          size="lg"
          onClick={advance}
          disabled={!check.ok}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="advance-stage"
        >
          {ADVANCE_LABELS[run.stage]}
          {hours > 0 ? <span className="ad-stage-footer__hours">{hours} h</span> : null}
        </Button>
      </div>
    </footer>
  );
}
