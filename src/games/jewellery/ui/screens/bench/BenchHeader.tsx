import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientById, productById, setAsideIssue } from "../../../core";
import { SetAsideDialog } from "../SetAsideDialog";
import { STAGE_TITLES } from "./stageNames";
import type { StageProps } from "./stageProps";

export function BenchHeader({ state, run, dispatch, onExit }: StageProps) {
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
  const client = run.brief === null ? undefined : clientById(run.brief.clientId);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonRun" })) return;
    toast("The piece is set aside. Your bench is clear.", "info");
    onExit();
  };
  return (
    <header className="jb-bench-header ad-pinned-head">
      <Button variant="ghost" icon="back" onClick={onExit} className="ad-pinned-head__back">
        {state.career === "collection" ? "Back to the loft" : "Back to the arcade"}
      </Button>
      <div className="jb-bench-header__title ad-pinned-head__title">
        <span className="ad-eyebrow">
          {run.purpose.kind === "collection"
            ? `For your line · ${productById(run.design.productId).name}`
            : client !== undefined && run.brief !== null
              ? `For ${client.name} · ${productById(run.design.productId).name}`
              : `A ${productById(run.design.productId).name} for Market Day`}
        </span>
        <h1>
          {run.purpose.kind === "collection" && run.stage === "review"
            ? "Ready for the line"
            : STAGE_TITLES[run.stage]}
        </h1>
      </div>
      <div className="jb-bench-header__stats ad-pinned-head__stats">
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
      <SetAsideDialog
        open={confirming}
        onConfirm={setAside}
        onClose={() => setConfirming(false)}
        linePiece={state.activeRun?.purpose.kind === "collection"}
      />
    </header>
  );
}
