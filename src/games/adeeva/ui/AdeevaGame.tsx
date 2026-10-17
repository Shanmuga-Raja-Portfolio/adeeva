import { lazy, useCallback, useMemo, useState } from "react";
import type { GameScreenProps } from "../../../studio/gameModule";
import { createGame, newGameIssues, reduce, type NewGameSettings } from "../core";
import { Button } from "../../../ui/kit/Button";
import { Dialog } from "../../../ui/kit/Dialog";
import { StudioHub } from "./screens/hub/StudioHub";
import { NewGameFlow } from "./screens/newGame/NewGameFlow";
import { SettingsDialog } from "./screens/settings/SettingsDialog";
import { TitleScreen } from "./screens/title/TitleScreen";
import { resolveScreen, type AppRoute } from "./adeevaRoute";
import { adeevaSlots, deleteSlot, readAllSlots, savingAvailable, type SaveSlotId } from "./adeevaSlots";
import { useToast } from "../../../studio/ToastContext";
import { lookAllowed } from "../../../studio/perks";
import { useGameSession, type SaveMoment } from "../../../studio/useGameSession";
import { ViewLoadBoundary } from "../../../studio/ViewLoadBoundary";
import "./theme.css";

const CraftFlow = lazy(() =>
  import("./screens/craft/CraftFlow").then((module) => ({ default: module.CraftFlow })),
);
const LabelFlow = lazy(() =>
  import("./screens/label/LabelFlow").then((module) => ({ default: module.LabelFlow })),
);

export function AdeevaGame({ player, lookOptions, onPlayerChange, onExit }: GameScreenProps) {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    (moment: SaveMoment) =>
      toast(
        moment === "leaving"
          ? "We couldn't save your last few moments in ADEEVA. This browser didn't let us store them."
          : "We couldn't save just now. Your game is safe on screen and we'll keep trying.",
        "warning",
      ),
    [toast],
  );
  const rules = useMemo(
    () => ({
      reduce,
      create: createGame,
      newGameIssues: (settings: NewGameSettings) =>
        lookAllowed(lookOptions, settings.look)
          ? newGameIssues(settings)
          : [...newGameIssues(settings), "Finish your avatar."],
    }),
    [lookOptions],
  );
  const { session, dispatch, load, begin, flush, close } = useGameSession(rules, adeevaSlots, warnSaveFailed);
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
    if (!begin(slot, settings)) return;
    onPlayerChange({ name: settings.name.trim(), look: settings.look });
    toHub();
  };

  const openSettings = () => {
    refreshSlots();
    setSettingsOpen(true);
  };

  return (
    <div className="ad-root">
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
          onExitToStudio={onExit}
        />
      ) : null}
      {screen.name === "newGame" ? (
        <NewGameFlow
          key="new-game"
          slot={screen.slot}
          player={player}
          lookOptions={lookOptions}
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
    </div>
  );
}
