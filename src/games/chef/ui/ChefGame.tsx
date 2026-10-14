import "./theme.css";
import { lazy, useCallback, useMemo, useState } from "react";
import type { GameScreenProps } from "../../../studio/gameModule";
import { lookAllowed } from "../../../studio/perks";
import { useToast } from "../../../studio/ToastContext";
import { useGameSession, type SaveMoment } from "../../../studio/useGameSession";
import { ViewLoadBoundary } from "../../../studio/ViewLoadBoundary";
import { Button } from "../../../ui/kit/Button";
import { Dialog } from "../../../ui/kit/Dialog";
import { createGame, newGameIssues, reduce, type NewGameSettings } from "../core";
import { resolveScreen, type AppRoute, type PlayView } from "./chefRoute";
import { chefSlots, type SaveSlotId } from "./chefSlots";
import { KitchenHub } from "./screens/hub/KitchenHub";
import { NewGameFlow } from "./screens/newGame/NewGameFlow";
import { SettingsDialog } from "./screens/settings/SettingsDialog";
import { TitleScreen } from "./screens/title/TitleScreen";
import { SoundProvider } from "./sound/SoundContext";
import { AssistProvider } from "./useAssist";

const DishFlow = lazy(() =>
  import("./screens/dish/DishFlow").then((module) => ({ default: module.DishFlow })),
);
const ServiceRush = lazy(() =>
  import("./screens/service/ServiceRush").then((module) => ({ default: module.ServiceRush })),
);
const CrossroadsScreen = lazy(() =>
  import("./screens/crossroads/CrossroadsScreen").then((module) => ({ default: module.CrossroadsScreen })),
);
const PathHub = lazy(() => import("./screens/path/PathHub").then((module) => ({ default: module.PathHub })));
const DishDiary = lazy(() =>
  import("./screens/diary/DishDiary").then((module) => ({ default: module.DishDiary })),
);

export function ChefGame({ player, lookOptions, onPlayerChange, onExit }: GameScreenProps) {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    (moment: SaveMoment) =>
      toast(
        moment === "leaving"
          ? "We couldn't save your last few moments in the kitchen. This browser didn't let us store them."
          : "We couldn't save just now. Your kitchen is safe on screen and we'll keep trying.",
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
  const { session, dispatch, load, begin, flush, close } = useGameSession(rules, chefSlots, warnSaveFailed);
  const [route, setRoute] = useState<AppRoute>({ name: "title" });
  const [slots, setSlots] = useState(chefSlots.readAllSlots);
  const [canSave] = useState(chefSlots.savingAvailable);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveBlocked, setLeaveBlocked] = useState(false);
  const screen = resolveScreen(route, session.game);

  const refreshSlots = useCallback(() => setSlots(chefSlots.readAllSlots()), []);
  const open = useCallback(
    (view: PlayView) => {
      if (view !== "hub") flush();
      setRoute({ name: "play", view });
      window.scrollTo({ top: 0 });
    },
    [flush],
  );
  const toHub = useCallback(() => open("hub"), [open]);
  const leave = useCallback(() => {
    setLeaveBlocked(false);
    close();
    setSlots(chefSlots.readAllSlots());
    setRoute({ name: "title" });
  }, [close]);
  const saveAndExit = useCallback(() => {
    if (flush()) leave();
    else setLeaveBlocked(true);
  }, [flush, leave]);

  const handleDelete = (slot: SaveSlotId) => {
    chefSlots.deleteSlot(slot);
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
    <SoundProvider>
      <AssistProvider>
        <div className="ck-root">
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
          {screen.name === "hub" && screen.game.path === null ? (
            <KitchenHub
              state={screen.game}
              dispatch={dispatch}
              onOpen={open}
              onOpenSettings={openSettings}
              onExitToTitle={saveAndExit}
            />
          ) : null}
          <ViewLoadBoundary>
            {screen.name === "hub" && screen.game.path !== null ? (
              <PathHub
                state={screen.game}
                dispatch={dispatch}
                onOpen={open}
                onOpenSettings={openSettings}
                onExitToTitle={saveAndExit}
              />
            ) : null}
            {screen.name === "crossroads" ? (
              <CrossroadsScreen state={screen.game} dispatch={dispatch} onBack={toHub} onChosen={toHub} />
            ) : null}
            {screen.name === "dish" ? (
              <DishFlow state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "service" ? (
              <ServiceRush state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "diary" ? <DishDiary state={screen.game} onExit={toHub} /> : null}
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
              last save will be lost. Stay to keep cooking, and we will try again as you go.
            </p>
          </Dialog>
        </div>
      </AssistProvider>
    </SoundProvider>
  );
}
