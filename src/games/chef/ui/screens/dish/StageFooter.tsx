import type { ReactNode } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canAdvance, stageIndex, type RunStage } from "../../../core";
import type { StageProps } from "./stageProps";

const NEXT_LABELS: Partial<Record<RunStage, string>> = {
  ticket: "Get ready",
  mise: "Start cooking",
  cook: "On to plating",
  plate: "Send it to the pass",
};

const ORDER: readonly RunStage[] = ["ticket", "mise", "cook", "plate", "pass"];

export function StageFooter({
  state,
  run,
  dispatch,
  children,
}: StageProps & { readonly children?: ReactNode }) {
  const once = useDispatchOnce(state, dispatch);
  const check = canAdvance(state);
  const next = ORDER[stageIndex(run.stage) + 1];
  const label = NEXT_LABELS[run.stage];
  return (
    <footer className="ck-stage-footer">
      <div className="ck-stage-footer__note">{children}</div>
      {next !== undefined && label !== undefined ? (
        <Button
          size="lg"
          icon="sparkle"
          disabledReason={check.reasons[0]}
          showReason
          onClick={(event) => once(event, { type: "goToStage", stage: next })}
          data-testid="advance-stage"
        >
          {label}
        </Button>
      ) : null}
    </footer>
  );
}
