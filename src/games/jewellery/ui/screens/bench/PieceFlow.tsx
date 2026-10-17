import { Button } from "../../../../../ui/kit/Button";
import { coachOn, type Action, type GameState, type PieceRun } from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { BenchHeader } from "./BenchHeader";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { CutStage } from "./CutStage";
import { DesignStage } from "./DesignStage";
import { DisplayStage } from "./DisplayStage";
import { JoinStage } from "./JoinStage";
import { PlanStage } from "./PlanStage";
import { PolishStage } from "./PolishStage";
import { ResultsStage } from "./ResultsStage";
import { ReviewStage } from "./ReviewStage";
import { SetStage } from "./SetStage";
import { COACH } from "./stageNames";
import { StageRail } from "./StageRail";
import { SuppliesStage } from "./SuppliesStage";
import "./bench.css";

interface PieceFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function StageView(props: PieceFlowProps & { readonly run: PieceRun }) {
  switch (props.run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "design":
      return <DesignStage {...props} />;
    case "supplies":
      return <SuppliesStage {...props} />;
    case "plan":
      return <PlanStage {...props} />;
    case "cut":
      return <CutStage {...props} />;
    case "join":
      return <JoinStage {...props} />;
    case "set":
      return <SetStage {...props} />;
    case "polish":
      return <PolishStage {...props} />;
    case "display":
      return <DisplayStage {...props} />;
    case "review":
      return <ReviewStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function PieceFlow({ state, dispatch, onExit }: PieceFlowProps) {
  const run = state.activeRun;
  if (run === null) {
    return (
      <main className="jb-bench jb-bench--empty ad-screen">
        <h1>The bench is clear</h1>
        <p className="jb-muted">Pick an order tag in the arcade to start a new piece.</p>
        <Button onClick={onExit}>Back to the arcade</Button>
      </main>
    );
  }
  if (run.stage === "done") {
    return (
      <main className="jb-bench ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
      </main>
    );
  }
  const coach = COACH[run.stage];
  return (
    <main className="jb-bench ad-screen" data-stage={run.stage}>
      <BenchHeader state={state} run={run} dispatch={dispatch} onExit={onExit} />
      <StageRail state={state} run={run} dispatch={dispatch} />
      {coach !== undefined ? (
        <CoachBubble show={coachOn(state) && run.purpose.kind === "order"} text={coach} />
      ) : null}
      <div
        className={
          run.brief === null && run.purpose.kind !== "collection"
            ? "jb-bench__body jb-bench__body--solo"
            : "jb-bench__body"
        }
      >
        <section className="jb-bench__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        <BriefChecklist state={state} run={run} />
      </div>
    </main>
  );
}
