import { useState } from "react";
import { useToast } from "../../../app/ToastContext";
import type { Action, DressRun, GameState } from "../../../core";
import { Button } from "../../kit/Button";
import { StatChip } from "../../kit/StatChip";
import { briefOwner } from "./briefOwner";
import { SetAsideDialog } from "./SetAsideDialog";
import { STAGE_TITLES } from "./stageNames";

export interface CraftHeaderProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => boolean;
  readonly onExit: () => void;
}

function runOwner(run: DressRun): string {
  const { client, theme } = briefOwner(run.brief);
  if (client !== undefined) return `For ${client.name} · ${run.brief.occasion}`;
  return theme !== undefined ? `${theme.name} collection` : run.brief.occasion;
}

export function CraftHeader({ state, run, dispatch, onExit }: CraftHeaderProps) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonRun" })) return;
    toast("The dress is set aside. Your work table is clear.", "info");
    onExit();
  };
  return (
    <header className="ad-craft-header">
      <Button variant="ghost" onClick={onExit} className="ad-craft-header__exit">
        <span aria-hidden="true">←</span> Back to studio
      </Button>
      <div className="ad-craft-header__title">
        <span className="ad-eyebrow">{runOwner(run)}</span>
        <h1>{STAGE_TITLES[run.stage]}</h1>
      </div>
      <div className="ad-craft-header__stats">
        <StatChip kind="day" value={state.calendar.day} />
        <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        <StatChip kind="coins" value={state.coins} />
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} data-testid="set-aside">
          Set aside this dress
        </Button>
      </div>
      <SetAsideDialog run={run} open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
