import { Button } from "../../../../../ui/kit/Button";
import { coachOn, isHomeRoom, type Action, type GameState, type MakeoverRun } from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { BriefChecklist } from "./BriefChecklist";
import { BriefStage } from "./BriefStage";
import { FloorStage } from "./FloorStage";
import { LightStage } from "./LightStage";
import { MakeoverHeader } from "./MakeoverHeader";
import { PaintStage } from "./PaintStage";
import { PlanStage } from "./PlanStage";
import { ReadyStage } from "./ReadyStage";
import { ResultsStage } from "./ResultsStage";
import { RevealStage } from "./RevealStage";
import { ShopStage } from "./ShopStage";
import { COACH } from "./stageNames";
import { StageRail } from "./StageRail";
import { StyleStage } from "./StyleStage";
import "./makeover.css";
import "./compact.css";

interface MakeoverFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

interface MakeoverScreenProps extends MakeoverFlowProps {
  readonly onExitHome: () => void;
  readonly onOpenSettings: () => void;
}

function StageView(props: MakeoverFlowProps & { readonly run: MakeoverRun }) {
  switch (props.run.stage) {
    case "brief":
      return <BriefStage {...props} />;
    case "plan":
      return <PlanStage {...props} />;
    case "shop":
      return <ShopStage {...props} />;
    case "paint":
      return <PaintStage {...props} />;
    case "floor":
      return <FloorStage {...props} />;
    case "light":
      return <LightStage {...props} />;
    case "style":
      return <StyleStage {...props} />;
    case "reveal":
      return isHomeRoom(props.run) ? <ReadyStage {...props} /> : <RevealStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function MakeoverFlow({ state, dispatch, onExit, onExitHome, onOpenSettings }: MakeoverScreenProps) {
  const run = state.activeRun;
  const leave = () => {
    if (run !== null && isHomeRoom(run)) {
      dispatch({ type: "closeHomeRoom" });
      onExitHome();
    } else onExit();
  };
  if (run === null) {
    return (
      <main className="is-makeover is-makeover--empty ad-screen">
        <h1>The drawing table is clear</h1>
        <p className="is-muted">Pick a letter in the loft to start a new room.</p>
        <Button onClick={onExit}>Back to the loft</Button>
      </main>
    );
  }
  if (run.stage === "done" || run.stage === "reveal") {
    return (
      <main className="is-makeover ad-screen" data-stage={run.stage}>
        <StageView state={state} run={run} dispatch={dispatch} onExit={leave} />
      </main>
    );
  }
  const coach = COACH[run.stage];
  return (
    <main
      className={isHomeRoom(run) ? "is-makeover is-makeover--home ad-screen" : "is-makeover ad-screen"}
      data-stage={run.stage}
    >
      <MakeoverHeader
        state={state}
        run={run}
        dispatch={dispatch}
        onExit={leave}
        onOpenSettings={onOpenSettings}
      />
      <div className="is-makeover__guide">
        <StageRail state={state} run={run} dispatch={dispatch} />
        {coach !== undefined ? <CoachBubble show={coachOn(state)} text={coach} /> : null}
      </div>
      <div
        className={run.stage === "style" ? "is-makeover__body is-makeover__body--solo" : "is-makeover__body"}
      >
        <section className="is-makeover__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={leave} />
        </section>
        {run.stage === "style" ? null : <BriefChecklist state={state} run={run} />}
      </div>
    </main>
  );
}
