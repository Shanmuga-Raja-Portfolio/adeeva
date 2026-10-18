import { useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { personById, recipeById } from "../../../core";
import { SetAsideDialog } from "./SetAsideDialog";
import { stageTitle } from "./stageNames";
import type { StageProps } from "./stageProps";

function owner(props: StageProps): string {
  const { run } = props;
  const recipe = run.design.recipeId === null ? null : recipeById(run.design.recipeId).name;
  if (run.brief === null) return recipe === null ? "Your own piece" : `Your own ${recipe.toLowerCase()}`;
  const client = personById(run.brief.clientId);
  return `For ${client?.name ?? "a regular"} · ${run.brief.occasion}`;
}

export function FlipHeader(props: StageProps) {
  const { state, run, dispatch, onExit } = props;
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonFlip" })) return;
    toast("The flip is set aside. Your bench is clear.", "info");
    onExit();
  };
  return (
    <header className="tf-flip-header ad-pinned-head">
      <Button variant="ghost" onClick={onExit} className="ad-pinned-head__back">
        <span aria-hidden="true">←</span> Back to the stall
      </Button>
      <div className="tf-flip-header__title ad-pinned-head__title">
        <span className="ad-eyebrow">{owner(props)}</span>
        <h1>{stageTitle(run)}</h1>
      </div>
      <div className="tf-flip-header__stats ad-pinned-head__stats">
        <StatChip kind="day" value={`Day ${state.calendar.day}`} />
        <StatChip kind="hours" value={`${state.calendar.hoursLeft} h left`} />
        <span className="tf-flip-header__coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} data-testid="set-aside">
          Set aside
        </Button>
      </div>
      <SetAsideDialog run={run} open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
