import { Button } from "../../../../../ui/kit/Button";
import type { Action, BakeRun, GameState } from "../../../core";
import { GuideBubble } from "../GuideBubble";
import { handsOn } from "./handsOn";
import { BakeHeader } from "./BakeHeader";
import { BakeStage } from "./BakeStage";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { DecorateStage } from "./DecorateStage";
import { DesignStage } from "./DesignStage";
import { MixStage } from "./MixStage";
import { OrderPeek } from "./OrderPeek";
import { PantryStage } from "./PantryStage";
import { PipeStage } from "./PipeStage";
import { ResultsStage } from "./ResultsStage";
import { ReviewStage } from "./ReviewStage";
import { StackStage } from "./StackStage";
import { STAGE_HINTS } from "./stageNames";
import { StageRail } from "./StageRail";
import { WeighStage } from "./WeighStage";
import "./bake.css";
import "./orderPeek.css";
import "./compact.css";

export interface BakeFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function StageView(props: BakeFlowProps & { readonly run: BakeRun }) {
  switch (props.run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "design":
      return <DesignStage {...props} />;
    case "pantry":
      return <PantryStage {...props} />;
    case "weigh":
      return <WeighStage {...props} />;
    case "mix":
      return <MixStage {...props} />;
    case "bake":
      return <BakeStage {...props} />;
    case "stack":
      return <StackStage {...props} />;
    case "pipe":
      return <PipeStage {...props} />;
    case "decorate":
      return <DecorateStage {...props} />;
    case "review":
      return <ReviewStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function BakeFlow({ state, dispatch, onExit }: BakeFlowProps) {
  const run = state.activeRun;
  if (run === null) {
    return (
      <main className="pa-bake pa-bake--empty ad-screen">
        <h1>The bench is clear</h1>
        <p className="pa-muted">Pick an order in the shop to start a new bake.</p>
        <Button onClick={onExit}>Back to the shop</Button>
      </main>
    );
  }
  if (run.stage === "done") {
    return (
      <main className="pa-bake pa-bake--results ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
      </main>
    );
  }
  const hint = STAGE_HINTS[run.stage];
  const peek = run.brief !== null && handsOn(run.stage);
  return (
    <main className="pa-bake ad-screen" data-stage={run.stage}>
      <BakeHeader state={state} run={run} dispatch={dispatch} onExit={onExit} />
      <div className={peek ? "pa-bake__railrow pa-bake__railrow--peek" : "pa-bake__railrow"}>
        <StageRail state={state} run={run} dispatch={dispatch} />
        {peek ? <OrderPeek key={run.stage} state={state} run={run} /> : null}
      </div>
      {hint !== undefined ? <GuideBubble show={state.guide} text={hint} /> : null}
      <div className={run.brief === null || peek ? "pa-bake__body pa-bake__body--solo" : "pa-bake__body"}>
        <section className="pa-bake__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        {peek ? null : <BriefChecklist state={state} run={run} />}
      </div>
    </main>
  );
}
