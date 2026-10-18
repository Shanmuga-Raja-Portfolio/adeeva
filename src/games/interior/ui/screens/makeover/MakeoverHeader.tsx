import { useEffect, useRef, useState } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { StatChip } from "../../../../../ui/kit/StatChip";
import { clientById, purseLeft, roomById } from "../../../core";
import { homeRoomContext } from "./homeRoomContext";
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
  const home = homeRoomContext(state, run);
  const setAside = () => {
    setConfirming(false);
    if (!dispatch({ type: "abandonRun" })) return;
    toast("The room is set aside. Your table is clear.", "info");
    onExit();
  };
  return (
    <header className="is-makeover-header ad-pinned-head">
      <Button
        variant="ghost"
        icon="back"
        onClick={onExit}
        data-testid="makeover-back"
        className="ad-pinned-head__back"
      >
        {home === null ? "Back to the loft" : "Back to the home"}
      </Button>
      <div className="is-makeover-header__title ad-pinned-head__title">
        <span className="ad-eyebrow">
          {home === null
            ? `For ${client?.name ?? "a neighbour"} · ${roomById(run.brief.roomId).name}`
            : `${home.purpose.name} · ${home.plot.name}`}
        </span>
        <h1>{home !== null && run.stage === "shop" ? "Larkspur Supply Yard" : STAGE_TITLES[run.stage]}</h1>
      </div>
      <div className="is-makeover-header__stats ad-pinned-head__stats">
        <StatChip kind="day" value={state.calendar.day} />
        <span data-testid="makeover-hours">
          <StatChip kind="hours" value={`${state.calendar.hoursLeft} h`} />
        </span>
        <span data-testid="makeover-coins">
          <StatChip kind="coins" value={state.coins} />
        </span>
        {home === null ? null : (
          <span className="is-purse-chip" data-testid="makeover-purse">
            Purse {purseLeft(home.project)}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={onOpenSettings} data-testid="makeover-settings">
          Settings
        </Button>
        {home === null ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            Set aside
          </Button>
        ) : null}
      </div>
      <SetAsideDialog open={confirming} onConfirm={setAside} onClose={() => setConfirming(false)} />
    </header>
  );
}
