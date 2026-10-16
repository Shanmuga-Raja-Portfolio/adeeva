import { lazy, useCallback, useMemo, useState } from "react";
import type { GameScreenProps } from "../../../studio/gameModule";
import { lookAllowed } from "../../../studio/perks";
import { useToast } from "../../../studio/ToastContext";
import { useGameSession, type SaveMoment } from "../../../studio/useGameSession";
import { ViewLoadBoundary } from "../../../studio/ViewLoadBoundary";
import { Button } from "../../../ui/kit/Button";
import { Dialog } from "../../../ui/kit/Dialog";
import { createGame, newGameIssues, reduce, type NewGameSettings } from "../core";
import { resolveScreen, type AppRoute, type PlayView } from "./interiorRoute";
import { interiorSlots, type SaveSlotId } from "./interiorSlots";
import { LoftHub } from "./screens/hub/LoftHub";
import { NewGameFlow } from "./screens/newGame/NewGameFlow";
import { SettingsDialog } from "./screens/settings/SettingsDialog";
import { TitleScreen } from "./screens/title/TitleScreen";
import { AssistProvider } from "./useAssist";
import "./theme.css";

const MakeoverFlow = lazy(() =>
  import("./screens/makeover/MakeoverFlow").then((module) => ({ default: module.MakeoverFlow })),
);

const HomeScreen = lazy(() =>
  import("./screens/home/HomeScreen").then((module) => ({ default: module.HomeScreen })),
);

const OpenHouseScreen = lazy(() =>
  import("./screens/openHouse/OpenHouseScreen").then((module) => ({ default: module.OpenHouseScreen })),
);

export function InteriorGame({ player, lookOptions, onPlayerChange, onExit }: GameScreenProps) {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    (moment: SaveMoment) =>
      toast(
        moment === "leaving"
          ? "We couldn't save your last few moments in the loft. This browser didn't let us store them."
          : "We couldn't save just now. Your room is safe on screen and we'll keep trying.",
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
  const { session, dispatch, load, begin, flush, close } = useGameSession(
    rules,
    interiorSlots,
    warnSaveFailed,
  );
  const [route, setRoute] = useState<AppRoute>({ name: "title" });
  const [slots, setSlots] = useState(interiorSlots.readAllSlots);
  const [canSave] = useState(interiorSlots.savingAvailable);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveBlocked, setLeaveBlocked] = useState(false);
  const screen = resolveScreen(route, session.game);

  const refreshSlots = useCallback(() => setSlots(interiorSlots.readAllSlots()), []);
  const open = useCallback(
    (view: PlayView) => {
      if (view !== "hub") flush();
      setRoute({ name: "play", view });
      window.scrollTo({ top: 0 });
    },
    [flush],
  );
  const toHub = useCallback(() => open("hub"), [open]);
  const toHome = useCallback(() => open("home"), [open]);
  const toMakeover = useCallback(() => open("makeover"), [open]);
  const toOpenHouse = useCallback(() => open("openHouse"), [open]);
  const leave = useCallback(() => {
    setLeaveBlocked(false);
    close();
    setSlots(interiorSlots.readAllSlots());
    setRoute({ name: "title" });
  }, [close]);
  const saveAndExit = useCallback(() => {
    if (flush()) leave();
    else setLeaveBlocked(true);
  }, [flush, leave]);

  const handleDelete = (slot: SaveSlotId) => {
    interiorSlots.deleteSlot(slot);
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
    <AssistProvider>
      <div className="is-root">
        {screen.name === "title" ? (
          <TitleScreen
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
            slot={screen.slot}
            player={player}
            lookOptions={lookOptions}
            onBegin={(settings) => handleBegin(screen.slot, settings)}
            onCancel={() => setRoute({ name: "title" })}
          />
        ) : null}
        {screen.name === "hub" ? (
          <LoftHub
            state={screen.game}
            dispatch={dispatch}
            onOpenMakeover={toMakeover}
            onOpenHome={toHome}
            onOpenOpenHouse={toOpenHouse}
            onOpenSettings={openSettings}
            onExitToTitle={saveAndExit}
          />
        ) : null}
        <ViewLoadBoundary>
          {screen.name === "makeover" ? (
            <MakeoverFlow
              state={screen.game}
              dispatch={dispatch}
              onExit={toHub}
              onExitHome={toHome}
              onOpenSettings={openSettings}
            />
          ) : null}
          {screen.name === "home" ? (
            <HomeScreen
              state={screen.game}
              dispatch={dispatch}
              onExit={toHub}
              onOpenRoom={toMakeover}
              onOpenOpenHouse={toOpenHouse}
              onOpenSettings={openSettings}
            />
          ) : null}
          {screen.name === "openHouse" ? (
            <OpenHouseScreen state={screen.game} dispatch={dispatch} onExit={toHub} />
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
            This browser didn't let us store your latest progress. If you leave now, everything since your
            last save will be lost. Stay to keep designing, and we will try again as you go.
          </p>
        </Dialog>
      </div>
    </AssistProvider>
  );
}
