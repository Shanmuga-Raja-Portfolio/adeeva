import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientById, setAsideIssue, setTemplateById } from "../../../core";
import { SetAsideDialog } from "../SetAsideDialog";
import { SET_STAGE_TITLES, STAGE_TITLES } from "./stageNames";
import type { StageProps } from "./stageProps";

export function BuildHeader({ state, run, dispatch, onExit }: StageProps) {
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
    if (!dispatch({ type: "setAside" })) return;
    toast("The piece is set aside. Your workbench is clear.", "info");
    onExit();
  };
  return (
    <header className="ww-build-header">
      <Button variant="ghost" icon="back" onClick={onExit}>
        {state.career === "showroom" ? "Back to the shop" : "Back to the garage"}
      </Button>
      <div className="ww-build-header__title">
        <span className="ad-eyebrow">
          {run.purpose.kind === "set"
            ? `Matched set · ${setTemplateById(run.purpose.templateId).name}`
            : `For ${client?.name ?? "a neighbour"} · ${run.brief.occasion}`}
        </span>
        <h1>
          {(run.purpose.kind === "set" ? SET_STAGE_TITLES[run.stage] : undefined) ?? STAGE_TITLES[run.stage]}
        </h1>
      </div>
      <div className="ww-build-header__stats">
        <StatChip kind="day" value={state.calendar.day} />
        <span data-testid="bench-hours">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        </span>
        <span data-testid="bench-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(true)}
          disabledReason={setAsideIssue(state) ?? undefined}
        >
          Set aside
        </Button>
      </div>
      <SetAsideDialog open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
