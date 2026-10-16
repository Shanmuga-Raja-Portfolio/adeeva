import { useEffect, useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import {
  bramsPick,
  canStageFair,
  currentSeason,
  fairThemeById,
  hattieSuggests,
  planIssue,
  type Action,
  type FairPlan,
  type GameState,
} from "../../../core";
import { GreenBackdrop } from "../../art/GreenBackdrop";
import { BoothReveal } from "./BoothReveal";
import { FairBoard } from "./FairBoard";
import { FairPlanner } from "./FairPlanner";
import { FairResults } from "./FairResults";
import "./fair.css";

export interface FairFlowProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

type FairStep = "board" | "planner" | "reveal" | "results";

export function FairFlow({ state, dispatch, onExit }: FairFlowProps) {
  const toast = useToast();
  const { fair, showroom } = state;
  const [step, setStep] = useState<FairStep>(fair?.result === null ? "board" : "results");
  const [picked, setPicked] = useState<string | null>(fair?.pickSetId ?? null);
  const [plan, setPlan] = useState<FairPlan | null>(null);
  const [replay, setReplay] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);
  if (fair === null || showroom === null) return null;
  const themeId = fair.result?.themeId ?? showroom.themeId;
  if (themeId === null) return null;
  const theme = fairThemeById(themeId);
  const result = fair.result;
  const resultSet =
    result === null ? null : (showroom.floor.find((set) => set.setId === result.plan.setId) ?? null);

  const toPlanner = () => {
    const setId = picked ?? bramsPick(state, theme)?.setId ?? null;
    if (setId === null) return;
    if (fair.pickSetId !== setId && !dispatch({ type: "pickFairSet", setId })) return;
    const set = showroom.floor.find((entry) => entry.setId === setId);
    if (set === undefined) return;
    setPlan(plan?.setId === setId ? plan : hattieSuggests(theme, set, state.profile.difficulty));
    setStep("planner");
  };

  const stage = () => {
    if (plan === null) return;
    if (dispatch({ type: "stageFair", plan })) setStep("reveal");
  };

  const shown: FairStep = step === "reveal" && resultSet === null ? "results" : step;
  const plannedSet = plan === null ? undefined : showroom.floor.find((set) => set.setId === plan.setId);
  const stageCheck = canStageFair(state);
  const stageIssue =
    plan === null
      ? "Make a plan first."
      : (planIssue(state, plan) ?? (stageCheck.ok ? null : (stageCheck.reasons[0] ?? null)));

  return (
    <main className="ww-fair ad-screen" data-testid="fair-flow" data-step={shown}>
      {shown === "board" || shown === "planner" ? (
        <div className="ww-fair__banner" aria-hidden="true">
          <GreenBackdrop
            className="ww-fair__banner-art"
            backdrop={plan?.backdrop ?? theme.bestBackdrop}
            sky={currentSeason(showroom).sky}
            awning={state.upgrades.includes("booth-awning")}
            glow={1}
          />
        </div>
      ) : null}
      {shown === "board" ? (
        <FairBoard
          state={state}
          theme={theme}
          picked={picked}
          onPick={setPicked}
          onNext={toPlanner}
          onBack={onExit}
        />
      ) : null}
      {shown === "planner" && plan !== null && plannedSet !== undefined ? (
        <FairPlanner
          theme={theme}
          set={plannedSet}
          plan={plan}
          relaxed={state.profile.difficulty === "relaxed"}
          stageIssue={stageIssue}
          onPlan={setPlan}
          onBack={() => setStep("board")}
          onStage={stage}
        />
      ) : null}
      {shown === "reveal" && result !== null && resultSet !== null ? (
        <BoothReveal
          theme={theme}
          result={result}
          set={resultSet}
          showroom={showroom}
          upgrades={state.upgrades}
          replay={replay}
          onDone={() => setStep("results")}
        />
      ) : null}
      {shown === "results" && result !== null ? (
        <FairResults
          result={result}
          set={resultSet}
          boothOffer={fair.boothOffer}
          onMoveUp={() => {
            if (dispatch({ type: "moveUpBooth" })) toast("Next season you'll have a bigger booth!");
          }}
          onReplay={() => {
            setReplay(true);
            setStep("reveal");
          }}
          onExit={onExit}
        />
      ) : null}
      {(shown === "reveal" || shown === "results") && result === null ? (
        <section className="ww-paper ww-fair-board__empty">
          <p>The booth isn't ready yet.</p>
          <Button onClick={() => setStep("board")}>Back to the Fair Board</Button>
        </section>
      ) : null}
    </main>
  );
}
