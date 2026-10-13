import { lazy, useCallback, useState } from "react";
import type { NewGameSettings } from "../core";
import { Button } from "../ui/kit/Button";
import { Dialog } from "../ui/kit/Dialog";
import { StudioHub } from "../ui/screens/hub/StudioHub";
import { NewGameFlow } from "../ui/screens/newGame/NewGameFlow";
import { SettingsDialog } from "../ui/screens/settings/SettingsDialog";
import { TitleScreen } from "../ui/screens/title/TitleScreen";
import { resolveScreen, type AppRoute } from "./appRoute";
import { deleteSlot, readAllSlots, savingAvailable, type SaveSlotId } from "./saveSlots";
import { useToast } from "./ToastContext";
import { useGameSession } from "./useGameSession";
import { ViewLoadBoundary } from "./ViewLoadBoundary";

const CraftFlow = lazy(() =>
  import("../ui/screens/craft/CraftFlow").then((module) => ({ default: module.CraftFlow })),
);
const LabelFlow = lazy(() =>
  import("../ui/screens/label/LabelFlow").then((module) => ({ default: module.LabelFlow })),
);

export function GameShell() {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    () => toast("We couldn't save just now. Your game is safe on screen and we'll keep trying.", "warning"),
    [toast],
  );
  const { session, dispatch, load, begin, flush, close } = useGameSession(warnSaveFailed);
  const [route, setRoute] = useState<AppRoute>({ name: "title" });
  const [slots, setSlots] = useState(readAllSlots);
  const [canSave] = useState(savingAvailable);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveBlocked, setLeaveBlocked] = useState(false);
  const screen = resolveScreen(route, session.game);

  const refreshSlots = useCallback(() => setSlots(readAllSlots()), []);
  const toHub = useCallback(() => setRoute({ name: "play", view: "hub" }), []);
  const toCraft = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "craft" });
  }, [flush]);
  const toLabel = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "label" });
  }, [flush]);
  const leave = useCallback(() => {
    setLeaveBlocked(false);
    close();
    setSlots(readAllSlots());
    setRoute({ name: "title" });
  }, [close]);
  const saveAndExit = useCallback(() => {
    if (flush()) leave();
    else setLeaveBlocked(true);
  }, [flush, leave]);

  const handleDelete = (slot: SaveSlotId) => {
    deleteSlot(slot);
    refreshSlots();
  };

  const handleBegin = (slot: SaveSlotId, settings: NewGameSettings) => {
    begin(slot, settings);
    toHub();
  };

  const openSettings = () => {
    refreshSlots();
    setSettingsOpen(true);
  };

  return (
    <>
      {screen.name === "title" ? (
        <TitleScreen
          key="title"
          slots={slots}
          canSave={canSave}
          onLoad={(slot, game) => {
            load(slot, game);
            toHub();
          }}
          onNewGame={(slot) => setRoute({ name: "newGame", slot })}
          onDeleteSlot={handleDelete}
          onOpenSettings={openSettings}
        />
      ) : null}
      {screen.name === "newGame" ? (
        <NewGameFlow
          key="new-game"
          slot={screen.slot}
          onBegin={(settings) => handleBegin(screen.slot, settings)}
          onCancel={() => setRoute({ name: "title" })}
        />
      ) : null}
      {screen.name === "hub" ? (
        <StudioHub
          state={screen.game}
          dispatch={dispatch}
          onOpenCraft={toCraft}
          onOpenLabel={toLabel}
          onOpenSettings={openSettings}
          onExitToTitle={saveAndExit}
        />
      ) : null}
      <ViewLoadBoundary>
        {screen.name === "craft" ? (
          <CraftFlow state={screen.game} dispatch={dispatch} onExit={toHub} />
        ) : null}
        {screen.name === "label" ? (
          <LabelFlow state={screen.game} dispatch={dispatch} onExit={toHub} onOpenCraft={toCraft} />
        ) : null}
      </ViewLoadBoundary>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slots={slots}
        activeSlot={session.slot}
        onDeleteSlot={handleDelete}
      />
      <Dialog
        open={leaveBlocked}
        title="We couldn't save"
        onClose={() => setLeaveBlocked(false)}
        footer={
          <>
            <Button variant="ghost" onClick={leave}>
              Leave anyway
            </Button>
            <Button autoFocus onClick={() => setLeaveBlocked(false)}>
              Stay
            </Button>
          </>
        }
      >
        <p>
          This browser didn't let us store your latest progress. If you leave now, everything since your last
          save will be lost. Stay to keep playing, and we will try again as you go.
        </p>
      </Dialog>
    </>
  );
}
