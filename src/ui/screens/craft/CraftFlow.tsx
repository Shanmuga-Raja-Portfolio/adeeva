import type { Action, DressRun, GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { AssembleStage } from "./AssembleStage";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { CraftHeader } from "./CraftHeader";
import { CutStage } from "./CutStage";
import { DecorateStage } from "./DecorateStage";
import { FabricShopStage } from "./FabricShopStage";
import { ResultsStage } from "./ResultsStage";
import { ReviewStage } from "./ReviewStage";
import { SewStage } from "./SewStage";
import { SketchStage } from "./SketchStage";
import { StageRail } from "./StageRail";
import "./craftControls.css";
import "./craftLayout.css";

export interface CraftFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface StageViewProps extends CraftFlowProps {
  readonly run: DressRun;
}

function StageView({ state, run, dispatch, onExit }: StageViewProps) {
  const props = { state, run, dispatch, onExit };
  switch (run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "sketch":
      return <SketchStage {...props} />;
    case "fabric":
      return <FabricShopStage {...props} />;
    case "cut":
      return <CutStage {...props} />;
    case "assemble":
      return <AssembleStage {...props} />;
    case "sew":
      return <SewStage {...props} />;
    case "decorate":
      return <DecorateStage {...props} />;
    case "review":
      return <ReviewStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function CraftFlow({ state, dispatch, onExit }: CraftFlowProps) {
  const run = state.activeRun;
  if (run === null) {
    return (
      <main className="ad-craft ad-craft--empty ad-screen">
        <div className="ad-craft-empty">
          <h1>The work table is clear</h1>
          <p className="ad-muted">Pick a gig in the studio to start a new dress.</p>
          <Button onClick={onExit}>Back to studio</Button>
        </div>
      </main>
    );
  }
  if (run.stage === "done") {
    return (
      <main className="ad-craft ad-craft--results ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
      </main>
    );
  }
  return (
    <main className="ad-craft ad-screen" data-stage={run.stage}>
      <CraftHeader state={state} run={run} dispatch={dispatch} onExit={onExit} />
      <StageRail state={state} run={run} dispatch={dispatch} />
      <div className="ad-craft__body">
        <section className="ad-craft__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        <BriefChecklist state={state} run={run} />
      </div>
    </main>
  );
}
