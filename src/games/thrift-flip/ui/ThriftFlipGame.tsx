import { useCallback, useMemo, useState } from "react";
import type { GameScreenProps } from "../../../studio/gameModule";
import { lookAllowed } from "../../../studio/perks";
import { lazyScreen } from "../../../studio/lazyScreen";
import { useToast } from "../../../studio/ToastContext";
import { useGameSession, type SaveMoment } from "../../../studio/useGameSession";
import { useIdlePreload } from "../../../studio/useIdlePreload";
import { ViewLoadBoundary } from "../../../studio/ViewLoadBoundary";
import { Button } from "../../../ui/kit/Button";
import { Dialog } from "../../../ui/kit/Dialog";
import { createGame, newGameIssues, reduce, type NewGameSettings } from "../core";
import { StallHub } from "./screens/hub/StallHub";
import { NewGameFlow } from "./screens/newGame/NewGameFlow";
import { SettingsDialog } from "./screens/settings/SettingsDialog";
import { TitleScreen } from "./screens/title/TitleScreen";
import { resolveScreen, type AppRoute } from "./thriftRoute";
import { thriftSlots, type SaveSlotId } from "./thriftSlots";
import "./theme.css";
import "./art/art.css";

const flip = lazyScreen(() => import("./screens/flip/FlipFlow").then((module) => module.FlipFlow));
const stall = lazyScreen(() =>
  import("./screens/stall/StallDayScreen").then((module) => module.StallDayScreen),
);
const shopWindow = lazyScreen(() =>
  import("./screens/window/WindowScreen").then((module) => module.WindowScreen),
);
const hall = lazyScreen(() => import("./screens/hall/HallScreen").then((module) => module.HallScreen));
const showcase = lazyScreen(() =>
  import("./screens/showcase/ShowcaseScreen").then((module) => module.ShowcaseScreen),
);
const FlipFlow = flip.Screen;
const StallDayScreen = stall.Screen;
const WindowScreen = shopWindow.Screen;
const HallScreen = hall.Screen;
const ShowcaseScreen = showcase.Screen;
const PRELOADS = [flip.preload, showcase.preload, hall.preload, stall.preload, shopWindow.preload];
const NO_PRELOADS: readonly (() => Promise<unknown>)[] = [];

export function ThriftFlipGame({ player, lookOptions, onPlayerChange, onExit }: GameScreenProps) {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    (moment: SaveMoment) =>
      toast(
        moment === "leaving"
          ? "We couldn't save your last few moments at the stall. This browser didn't let us store them."
          : "We couldn't save just now. Your stall is safe on screen and we'll keep trying.",
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
  const { session, dispatch, load, begin, flush, close } = useGameSession(rules, thriftSlots, warnSaveFailed);
  const [route, setRoute] = useState<AppRoute>({ name: "title" });
  const [slots, setSlots] = useState(thriftSlots.readAllSlots);
  const [canSave] = useState(thriftSlots.savingAvailable);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveBlocked, setLeaveBlocked] = useState(false);
  const screen = resolveScreen(route, session.game);
  useIdlePreload(screen.name === "hub" ? PRELOADS : NO_PRELOADS);

  const refreshSlots = useCallback(() => setSlots(thriftSlots.readAllSlots()), []);
  const toHub = useCallback(() => setRoute({ name: "play", view: "hub" }), []);
  const toFlip = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "flip" });
  }, [flush]);
  const toStall = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "stall" });
  }, [flush]);
  const toWindow = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "window" });
  }, [flush]);
  const toHall = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "hall" });
  }, [flush]);
  const toShowcase = useCallback(() => {
    flush();
    setRoute({ name: "play", view: "showcase" });
  }, [flush]);
  const leave = useCallback(() => {
    setLeaveBlocked(false);
    close();
    setSlots(thriftSlots.readAllSlots());
    setRoute({ name: "title" });
  }, [close]);
  const saveAndExit = useCallback(() => {
    if (flush()) leave();
    else setLeaveBlocked(true);
  }, [flush, leave]);

  const handleDelete = (slot: SaveSlotId) => {
    thriftSlots.deleteSlot(slot);
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
    <div className="tf-theme">
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
        <StallHub
          state={screen.game}
          dispatch={dispatch}
          onOpenFlip={toFlip}
          onOpenStall={toStall}
          onOpenWindow={toWindow}
          onOpenHall={toHall}
          onOpenShowcase={toShowcase}
          onOpenSettings={openSettings}
          onExitToTitle={saveAndExit}
        />
      ) : null}
      <ViewLoadBoundary>
        {screen.name === "flip" ? <FlipFlow state={screen.game} dispatch={dispatch} onExit={toHub} /> : null}
        {screen.name === "stall" ? (
          <StallDayScreen state={screen.game} dispatch={dispatch} onExit={toHub} />
        ) : null}
        {screen.name === "window" ? (
          <WindowScreen state={screen.game} dispatch={dispatch} onExit={toHub} />
        ) : null}
        {screen.name === "hall" ? (
          <HallScreen state={screen.game} dispatch={dispatch} onExit={toHub} />
        ) : null}
        {screen.name === "showcase" ? (
          <ShowcaseScreen state={screen.game} dispatch={dispatch} onExit={toHub} />
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
