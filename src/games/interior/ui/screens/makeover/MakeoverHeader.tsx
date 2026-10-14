import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientById, roomById } from "../../../core";
import { SetAsideDialog } from "../SetAsideDialog";
import { STAGE_TITLES } from "./stageNames";
import type { StageProps } from "./stageProps";

export function MakeoverHeader({
  state,
  run,
  dispatch,
  onExit,
  onOpenSettings,
}: StageProps & { readonly onOpenSettings: () => void }) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const shownStage = useRef(run.stage);

  useEffect(() => {
    if (shownStage.current === run.stage) return;
    shownStage.current = run.stage;
    window.scrollTo({ top: 0 });
    const active = document.activeElement;
    if (active === null || active === document.body) focusHeading();
  }, [run.stage]);
  const client = clientById(run.brief.clientId);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonRun" })) return;
    toast("The room is set aside. Your table is clear.", "info");
    onExit();
  };
  return (
    <header className="is-makeover-header">
      <Button variant="ghost" icon="back" onClick={onExit}>
        Back to the loft
      </Button>
      <div className="is-makeover-header__title">
        <span className="ad-eyebrow">
          For {client?.name ?? "a neighbour"} · {roomById(run.brief.roomId).name}
        </span>
        <h1>{STAGE_TITLES[run.stage]}</h1>
      </div>
      <div className="is-makeover-header__stats">
        <StatChip kind="day" value={state.calendar.day} />
        <span data-testid="makeover-hours">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        </span>
        <span data-testid="makeover-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        <Button variant="ghost" size="sm" onClick={onOpenSettings} data-testid="makeover-settings">
          Settings
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Set aside
        </Button>
      </div>
      <SetAsideDialog open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
