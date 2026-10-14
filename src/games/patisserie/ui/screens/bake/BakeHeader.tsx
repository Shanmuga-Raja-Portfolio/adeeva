import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientById } from "../../../core";
import { SetAsideDialog } from "../SetAsideDialog";
import { STAGE_TITLES } from "./stageNames";
import type { StageProps } from "./stageProps";

export function BakeHeader({ state, run, dispatch, onExit }: StageProps) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const shownStage = useRef(run.stage);

  useEffect(() => {
    if (shownStage.current === run.stage) return;
    shownStage.current = run.stage;
    const active = document.activeElement;
    if (active === null || active === document.body) focusHeading();
  }, [run.stage]);
  const client = run.brief === null ? undefined : clientById(run.brief.clientId);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonRun" })) return;
    toast("The bake is set aside. Your bench is clear.", "info");
    onExit();
  };
  return (
    <header className="pa-bake-header">
      <Button variant="ghost" icon="back" onClick={onExit}>
        Back to the shop
      </Button>
      <div className="pa-bake-header__title">
        <span className="ad-eyebrow">
          {client !== undefined && run.brief !== null
            ? `For ${client.name} · ${run.brief.occasion}`
            : run.purpose.kind === "showpiece"
              ? `Fair showpiece · ${run.brief?.occasion ?? "The Larkspur Patisserie Fair"}`
              : run.purpose.kind === "salon-tray"
                ? "A salon tray for the Comet Room"
                : "A tray for Counter Day"}
        </span>
        <h1>
          {run.stage === "brief" && run.purpose.kind === "showpiece"
            ? "The Fair card"
            : run.stage === "review" && run.purpose.kind === "showpiece"
              ? "Ready for the Fair"
              : run.stage === "review" && run.purpose.kind === "salon-tray"
                ? "Ready for the shelf"
                : STAGE_TITLES[run.stage]}
        </h1>
      </div>
      <div className="pa-bake-header__stats">
        <StatChip kind="day" value={state.calendar.day} />
        <span data-testid="bench-hours">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        </span>
        <StatChip kind="coins" value={state.coins} />
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Set aside
        </Button>
      </div>
      <SetAsideDialog open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
