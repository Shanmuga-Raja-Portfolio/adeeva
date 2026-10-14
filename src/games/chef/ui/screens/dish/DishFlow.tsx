import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { COACH_LINES } from "../../../content/hints";
import type { Action, DishRun, GameState } from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { CookStage } from "./CookStage";
import { DishHeader } from "./DishHeader";
import { MiseStage } from "./MiseStage";
import { PassStage } from "./PassStage";
import { PlateStage } from "./PlateStage";
import { ResultsStage } from "./ResultsStage";
import { SegmentCueStrip } from "./SegmentCueStrip";
import { StageRail } from "./StageRail";
import { TicketChecklist } from "./TicketChecklist";
import { TicketStage } from "./TicketStage";
import "./dish.css";

interface DishFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function StageView(props: DishFlowProps & { readonly run: DishRun }) {
  switch (props.run.stage) {
    case "ticket":
      return <TicketStage {...props} />;
    case "mise":
      return <MiseStage {...props} />;
    case "cook":
      return <CookStage {...props} />;
    case "plate":
      return <PlateStage {...props} />;
    case "pass":
      return <PassStage {...props} />;
    case "done":
      return <ResultsStage {...props} />;
  }
}

export function DishFlow({ state, dispatch, onExit }: DishFlowProps) {
  const [settingAside, setSettingAside] = useState(false);
  const run = state.activeRun;
  if (run === null) {
    return (
      <main className="ck-dish ck-dish--empty ad-screen">
        <h1>The board is clear</h1>
        <p className="ck-muted">Pick a lesson, an order or a practice dish in the kitchen.</p>
        <Button onClick={onExit}>Back to the kitchen</Button>
      </main>
    );
  }
  if (run.stage === "done") {
    return (
      <main className="ck-dish ad-screen" data-stage="done">
        <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        <StoryOverlay state={state} dispatch={dispatch} />
      </main>
    );
  }
  return (
    <main className="ck-dish ad-screen" data-stage={run.stage}>
      <DishHeader state={state} run={run} onExit={onExit} onSetAside={() => setSettingAside(true)} />
      <StageRail state={state} run={run} dispatch={dispatch} />
      <SegmentCueStrip run={run} />
      <CoachBubble
        show={state.guide && state.diary.length < 2 && run.stage === "ticket"}
        text={COACH_LINES.ticket}
      />
      <div className="ck-dish__body">
        <section className="ck-dish__stage" key={run.stage} aria-label={`${run.stage} step`}>
          <StageView state={state} run={run} dispatch={dispatch} onExit={onExit} />
        </section>
        <TicketChecklist run={run} />
      </div>
      <SetAsideDialog
        open={settingAside}
        purpose={run.purpose.kind}
        onConfirm={() => {
          setSettingAside(false);
          if (dispatch({ type: "abandonRun" })) onExit();
        }}
        onClose={() => setSettingAside(false)}
      />
      <StoryOverlay state={state} dispatch={dispatch} />
    </main>
  );
}
