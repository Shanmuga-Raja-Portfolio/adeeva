import { useCallback, useMemo, useState } from "react";
import type { GameScreenProps } from "../../../studio/gameModule";
import { lookAllowed } from "../../../studio/perks";
import { useToast } from "../../../studio/ToastContext";
import { useGameSession, type SaveMoment } from "../../../studio/useGameSession";
import { ViewLoadBoundary } from "../../../studio/ViewLoadBoundary";
import { Button } from "../../../ui/kit/Button";
import { Dialog } from "../../../ui/kit/Dialog";
import { lazyScreen } from "../../../ui/kit/lazyScreen";
import { useIdlePreload } from "../../../ui/kit/useIdlePreload";
import { createGame, newGameIssues, reduce, type NewGameSettings } from "../core";
import { resolveScreen, type AppRoute, type PlayView } from "./jewelleryRoute";
import { jewellerySlots, type SaveSlotId } from "./jewellerySlots";
import { BenchHub } from "./screens/hub/BenchHub";
import { NewGameFlow } from "./screens/newGame/NewGameFlow";
import { SettingsDialog } from "./screens/settings/SettingsDialog";
import { TitleScreen } from "./screens/title/TitleScreen";
import { AssistProvider } from "./useAssist";
import { TintLabelsProvider } from "./useTintLabels";
import "./theme.css";

const pieceFlow = lazyScreen(() => import("./screens/bench/PieceFlow").then((module) => module.PieceFlow));
const marketDay = lazyScreen(() => import("./screens/market/MarketDay").then((module) => module.MarketDay));
const keepsakeCase = lazyScreen(() =>
  import("./screens/keepsake/KeepsakeCase").then((module) => module.KeepsakeCase),
);
const collectionBoard = lazyScreen(() =>
  import("./screens/board/CollectionBoard").then((module) => module.CollectionBoard),
);
const gemMarket = lazyScreen(() => import("./screens/gems/GemMarket").then((module) => module.GemMarket));
const lookbook = lazyScreen(() => import("./screens/lookbook/Lookbook").then((module) => module.Lookbook));
const launchFlow = lazyScreen(() =>
  import("./screens/launch/LaunchFlow").then((module) => module.LaunchFlow),
);
const popupWindow = lazyScreen(() =>
  import("./screens/popup/PopupWindow").then((module) => module.PopupWindow),
);
const PieceFlow = pieceFlow.Screen;
const MarketDay = marketDay.Screen;
const KeepsakeCase = keepsakeCase.Screen;
const CollectionBoard = collectionBoard.Screen;
const GemMarket = gemMarket.Screen;
const Lookbook = lookbook.Screen;
const LaunchFlow = launchFlow.Screen;
const PopupWindow = popupWindow.Screen;
const PRELOADS = [
  pieceFlow.preload,
  marketDay.preload,
  keepsakeCase.preload,
  collectionBoard.preload,
  gemMarket.preload,
  lookbook.preload,
  launchFlow.preload,
  popupWindow.preload,
];
const NO_PRELOADS: readonly (() => Promise<unknown>)[] = [];

export function JewelleryGame({ player, lookOptions, onPlayerChange, onExit }: GameScreenProps) {
  const toast = useToast();
  const warnSaveFailed = useCallback(
    (moment: SaveMoment) =>
      toast(
        moment === "leaving"
          ? "We couldn't save your last few moments at the bench. This browser didn't let us store them."
          : "We couldn't save just now. Your bench is safe on screen and we'll keep trying.",
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
    jewellerySlots,
    warnSaveFailed,
  );
  const [route, setRoute] = useState<AppRoute>({ name: "title" });
  const [slots, setSlots] = useState(jewellerySlots.readAllSlots);
  const [canSave] = useState(jewellerySlots.savingAvailable);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveBlocked, setLeaveBlocked] = useState(false);
  const screen = resolveScreen(route, session.game);
  useIdlePreload(screen.name === "hub" ? PRELOADS : NO_PRELOADS);

  const refreshSlots = useCallback(() => setSlots(jewellerySlots.readAllSlots()), []);
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
    setSlots(jewellerySlots.readAllSlots());
    setRoute({ name: "title" });
  }, [close]);
  const saveAndExit = useCallback(() => {
    if (flush()) leave();
    else setLeaveBlocked(true);
  }, [flush, leave]);

  const handleDelete = (slot: SaveSlotId) => {
    jewellerySlots.deleteSlot(slot);
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
      <TintLabelsProvider>
        <div className="jb-root">
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
            <BenchHub
              state={screen.game}
              dispatch={dispatch}
              onOpen={open}
              onOpenSettings={openSettings}
              onExitToTitle={saveAndExit}
            />
          ) : null}
          <ViewLoadBoundary>
            {screen.name === "bench" ? (
              <PieceFlow state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "market" ? (
              <MarketDay state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "keepsakes" ? <KeepsakeCase state={screen.game} onExit={toHub} /> : null}
            {screen.name === "board" ? (
              <CollectionBoard state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "gems" ? (
              <GemMarket state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "lookbook" ? (
              <Lookbook state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
            {screen.name === "launch" ? (
              <LaunchFlow state={screen.game} dispatch={dispatch} onOpen={open} onExit={toHub} />
            ) : null}
            {screen.name === "popup" ? (
              <PopupWindow state={screen.game} dispatch={dispatch} onExit={toHub} />
            ) : null}
          </ViewLoadBoundary>
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            slots={slots}
            activeSlot={session.slot}
            difficulty={session.game?.profile.difficulty ?? null}
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
              last save will be lost. Stay to keep making, and we will try again as you go.
            </p>
          </Dialog>
        </div>
      </TintLabelsProvider>
    </AssistProvider>
  );
}
