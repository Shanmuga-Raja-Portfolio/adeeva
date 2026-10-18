import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import type { Action, FlipRun, GameState } from "../../../core";
import { Awning } from "../../art/Awning";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { ClientCorner } from "./ClientCorner";
import { ClientPeek } from "./ClientPeek";
import { CleanStage } from "./clean/CleanStage";
import { CutStage } from "./cut/CutStage";
import { DesignStage } from "./DesignStage";
import { FinishStage } from "./finish/FinishStage";
import { FlipHeader } from "./FlipHeader";
import { LayoutStage } from "./layout/LayoutStage";
import { MarketStage } from "./market/MarketStage";
import { ResultsStage } from "./results/ResultsStage";
import { ReviewStage } from "./ReviewStage";
import { SewStage } from "./SewStage";
import { StageRail } from "./StageRail";
import { UnpickStage } from "./unpick/UnpickStage";
import "../../../../adeeva/ui/screens/craft/craftControls.css";
import "./flip.css";
import "./compact.css";

export interface FlipFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

const HANDS_ON: ReadonlySet<FlipRun["stage"]> = new Set(["unpick", "clean", "layout", "cut", "sew"]);
const CORNER: ReadonlySet<FlipRun["stage"]> = new Set(["design", "market"]);

interface StageViewProps extends FlipFlowProps {
  readonly run: FlipRun;
}

function StageView(props: StageViewProps) {
  switch (props.run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "design":
      return <DesignStage {...props} />;
    case "market":
      return <MarketStage {...props} />;
    case "unpick":
      return <UnpickStage {...props} />;
    case "clean":
      return <CleanStage {...props} />;
    case "layout":
      return <LayoutStage {...props} />;
    case "cut":
      return <CutStage {...props} />;
    case "sew":
      return <SewStage {...props} />;
    case "finish":
      return <FinishStage {...props} />;
    case "review":
      return <ReviewStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function FlipFlow({ state, dispatch, onExit }: FlipFlowProps) {
  const run = state.activeRun;
  const stage = run?.stage ?? null;
  useEffect(() => {
    if (stage !== null) focusHeading();
  }, [stage]);
  if (run === null) return null;
  if (run.stage === "done") {
    return (
      <main className="tf-flip tf-flip--results ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
      </main>
    );
  }
  const handsOn = HANDS_ON.has(run.stage);
  return (
    <main className="tf-flip ad-screen" data-stage={run.stage}>
      <Awning className="tf-flip__awning" />
      <FlipHeader state={state} run={run} dispatch={dispatch} onExit={onExit} />
      <div className="tf-flip__railrow">
        <StageRail state={state} run={run} dispatch={dispatch} />
        {handsOn ? <ClientPeek state={state} run={run} /> : null}
      </div>
      <div className={handsOn ? "tf-flip__body tf-flip__body--wide" : "tf-flip__body"}>
        <section className="tf-flip__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        {handsOn ? null : (
          <div className="tf-flip__side">
            {CORNER.has(run.stage) ? <ClientCorner state={state} run={run} /> : null}
            <BriefChecklist state={state} run={run} />
          </div>
        )}
      </div>
    </main>
  );
}
