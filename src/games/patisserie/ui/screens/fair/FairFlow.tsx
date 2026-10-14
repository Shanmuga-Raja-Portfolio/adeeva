import { useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import {
  canStageFair,
  fairThemeById,
  ottisPicks,
  planIssue,
  suggestedPlan,
  type Action,
  type FairPlan,
  type GameState,
} from "../../../core";
import { FairBoard } from "./FairBoard";
import { FairPlanner } from "./FairPlanner";
import { FairResults } from "./FairResults";
import { FairShowcase } from "./FairShowcase";
import { showPlates } from "./showPlates";
import "../season/season.css";
import "./fair.css";

export interface FairFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

type Phase = "board" | "planner" | "showcase" | "results";

function freshPlan(state: GameState, sidePlates: readonly string[]): FairPlan | null {
  const fair = state.fair;
  if (fair === null || fair.entry === null || fair.themeId === null) return null;
  const qualities = showPlates(state, fair.entry, sidePlates).map((plate) => plate.quality);
  return suggestedPlan(fairThemeById(fair.themeId), sidePlates, qualities);
}

export function FairFlow({ state, dispatch, onExit }: FairFlowProps) {
  const toast = useToast();
  const fair = state.fair;
  const theme = fair?.themeId === null || fair === null ? null : fairThemeById(fair.themeId);
  const [phase, setPhase] = useState<Phase>(fair?.result === null ? "board" : "results");
  const [watched, setWatched] = useState(fair?.result !== null);
  const [plan, setPlan] = useState<FairPlan | null>(() =>
    theme === null ? null : freshPlan(state, ottisPicks(state, theme)),
  );
  if (fair === null || fair.entry === null || theme === null) {
    return (
      <main className="pa-fair ad-screen">
        <p className="pa-muted">The glasshouse is quiet today.</p>
        <Button onClick={onExit}>Back to the bakery</Button>
      </main>
    );
  }
  const entry = fair.entry;
  const result = fair.result;
  const shownPlan = result?.plan ?? plan;
  const plates = showPlates(state, entry, shownPlan?.sidePlates ?? []);
  const toggle = (runId: string) => {
    if (plan === null) return;
    const sides = plan.sidePlates.includes(runId)
      ? plan.sidePlates.filter((id) => id !== runId)
      : [...plan.sidePlates, runId];
    setPlan(freshPlan(state, sides));
  };
  const stageIssue =
    plan === null
      ? "Plan the showcase first."
      : (planIssue(state, plan) ?? canStageFair(state).reasons[0] ?? null);
  const stage = () => {
    if (plan !== null && dispatch({ type: "stageFair", plan })) setPhase("showcase");
  };
  return (
    <main className="pa-fair ad-screen" data-testid="fair-flow" data-phase={phase}>
      {phase !== "showcase" ? (
        <header className="pa-fair__top">
          <Button variant="ghost" icon="back" onClick={onExit}>
            Back to the bakery
          </Button>
          <div>
            <span className="ad-eyebrow">The Larkspur Patisserie Fair</span>
            <h1>{theme.name} at the glasshouse</h1>
          </div>
        </header>
      ) : null}
      {phase === "board" && plan !== null ? (
        <FairBoard
          state={state}
          theme={theme}
          entry={entry}
          sidePlates={plan.sidePlates}
          onToggle={toggle}
          onOttisPicks={() => setPlan(freshPlan(state, ottisPicks(state, theme)))}
          onNext={() => setPhase("planner")}
        />
      ) : null}
      {phase === "planner" && plan !== null ? (
        <FairPlanner
          theme={theme}
          plan={plan}
          plates={plates}
          onPlan={setPlan}
          onSuggest={() => setPlan(freshPlan(state, plan.sidePlates))}
          onBack={() => setPhase("board")}
          onStage={stage}
          stageIssue={stageIssue}
        />
      ) : null}
      {phase === "showcase" && result !== null ? (
        <FairShowcase
          theme={theme}
          result={result}
          plates={plates}
          visitors={fair.visitors}
          skippable={watched}
          onDone={() => {
            setWatched(true);
            setPhase("results");
          }}
        />
      ) : null}
      {phase === "results" && result !== null ? (
        <FairResults
          theme={theme}
          result={result}
          plates={plates}
          tentOffer={fair.tentOffer}
          onMoveUp={() => {
            if (dispatch({ type: "moveUpTent" })) toast("Next season you'll bake in a bigger tent!");
          }}
          onReplay={() => setPhase("showcase")}
          onExit={onExit}
        />
      ) : null}
    </main>
  );
}
