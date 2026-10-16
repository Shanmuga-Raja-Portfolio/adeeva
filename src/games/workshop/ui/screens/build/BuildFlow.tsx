import { Button } from "../../../../../ui/kit/Button";
import { COACH_HINTS } from "../../../content/hint";
import { coachOn, type Action, type CommissionRun, type GameState } from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { BuildHeader } from "./BuildHeader";
import { DesignStage } from "./design/DesignStage";
import { FinishStage } from "./finish/FinishStage";
import { JoinStage } from "./join/JoinStage";
import { LayoutStage } from "./layout/LayoutStage";
import { ResultsStage } from "./results/ResultsStage";
import { ReviewStage } from "./review/ReviewStage";
import { SandStage } from "./sand/SandStage";
import { SawStage } from "./saw/SawStage";
import { SetResults } from "./set/SetResults";
import { SetReview } from "./set/SetReview";
import { StageRail } from "./StageRail";
import { TimberStage } from "./timber/TimberStage";
import "./build.css";
import "./set/set.css";

interface BuildFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function StageView(props: BuildFlowProps & { readonly run: CommissionRun }) {
  switch (props.run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "design":
      return <DesignStage {...props} />;
    case "timber":
      return <TimberStage {...props} />;
    case "layout":
      return <LayoutStage {...props} />;
    case "saw":
      return <SawStage {...props} />;
    case "join":
      return <JoinStage {...props} />;
    case "sand":
      return <SandStage {...props} />;
    case "finish":
      return <FinishStage {...props} />;
    case "review":
      return props.run.purpose.kind === "set" ? <SetReview {...props} /> : <ReviewStage {...props} />;
    case "done":
      return props.run.purpose.kind === "set" ? <SetResults {...props} /> : <ResultsStage {...props} />;
  }
}

export function BuildFlow({ state, dispatch, onExit }: BuildFlowProps) {
  const run = state.activeRun;
  if (run === null) {
    return (
      <main className="ww-build ww-build--empty ad-screen">
        <h1>The workbench is clear</h1>
        <p className="ww-muted">Pick a job in the garage to start a new piece.</p>
        <Button onClick={onExit}>Back to the garage</Button>
      </main>
    );
  }
  if (run.stage === "done") {
    return (
      <main className="ww-build ww-build--results ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
      </main>
    );
  }
  const hint = COACH_HINTS[run.stage];
  return (
    <main className="ww-build ad-screen" data-stage={run.stage}>
      <BuildHeader state={state} run={run} dispatch={dispatch} onExit={onExit} />
      <StageRail state={state} run={run} dispatch={dispatch} />
      {hint !== undefined ? <CoachBubble show={coachOn(state)} text={hint} /> : null}
      <div className="ww-build__body">
        <section className="ww-build__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        <BriefChecklist state={state} run={run} />
      </div>
    </main>
  );
}
