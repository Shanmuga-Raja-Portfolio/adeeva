import { useRef, useState } from "react";
import type { ColourId } from "../../../../../engine/palette";
import { useToast } from "../../../../../studio/ToastContext";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { DecorId } from "../../../content/decor";
import type { FairThemeId } from "../../../content/fairTheme";
import type { SetTemplateId } from "../../../content/setTemplate";
import { SAFETY_LINE } from "../../../content/hint";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  coachOn,
  currentBeat,
  decorById,
  fairThemeById,
  MAX_ACTIVE_GIGS,
  offersFor,
  productById,
  setAsideIssue,
  setTemplateById,
  upgradeById,
  type Action,
  type CommissionRun,
  type GameState,
} from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { BenchTourCard } from "./BenchTourCard";
import { BoardRack } from "./BoardRack";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { DecorPanel } from "./DecorPanel";
import { DoorBoard } from "./DoorBoard";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { JobCard } from "./JobCard";
import { RenCard } from "./RenCard";
import { RosetteRailCard } from "./RosetteRailCard";
import { SeasonCard } from "./SeasonCard";
import { SetTemplatesCard } from "./SetTemplatesCard";
import { ShowroomFloorCard } from "./ShowroomFloorCard";
import { ShowroomOfferCard } from "./ShowroomOfferCard";
import { TrendsBoard } from "./TrendsBoard";
import { UpgradesPanel } from "./UpgradesPanel";
import "./hero.css";
import "./hub.css";
import "./showroom.css";

interface WorkshopHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenBuild: () => void;
  readonly onOpenFair: () => void;
  readonly onOpenFloor: () => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

function benchTitle(run: CommissionRun): string {
  if (run.purpose.kind === "set") return setTemplateById(run.purpose.templateId).name;
  return run.design.productId === null ? "A piece in progress" : productById(run.design.productId).name;
}

function coachLine(state: GameState): string {
  if (state.gigs.active.length === 0) return "A note is pinned to the door! Tap Accept.";
  return "Now tap Start building. Your workbench is ready.";
}

export function WorkshopHub({
  state,
  dispatch,
  onOpenBuild,
  onOpenFair,
  onOpenFloor,
  onOpenSettings,
  onExitToTitle,
}: WorkshopHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const desk = useRef<HTMLDivElement>(null);
  const offers = offersFor(state);
  const run = state.activeRun;
  const onBench = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;

  const accept = (event: ClickLike, offerId: string, clientId: string) => {
    if (once(event, { type: "acceptOffer", offerId }))
      toast(`${clientById(clientId)?.name ?? "Your neighbour"} is delighted. Job accepted!`);
  };
  const decline = (event: ClickLike, offerId: string) => {
    if (once(event, { type: "declineOffer", offerId })) toast("You kindly passed on that job.", "info");
  };
  const start = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startCommission", gigId })) onOpenBuild();
  };
  const buyUpgrade = (event: ClickLike, upgradeId: UpgradeId) => {
    if (once(event, { type: "buyUpgrade", upgradeId }))
      toast(`${upgradeById(upgradeId).name} is in the garage!`);
  };
  const buyDecor = (event: ClickLike, decorId: DecorId, paint: ColourId | null) => {
    if (once(event, { type: "buyDecor", decorId, paint })) toast(`${decorById(decorId).name} looks great!`);
  };
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    const action: Action = { type: kind === "shift" ? "workShift" : "endDay" };
    if (once(event, action)) setEnding({ from, kind });
  };
  const startSet = (event: ClickLike, templateId: SetTemplateId) => {
    if (once(event, { type: "startSet", templateId })) onOpenBuild();
  };
  const chooseTheme = (event: ClickLike, themeId: FairThemeId) => {
    if (once(event, { type: "chooseFairTheme", themeId }))
      toast(`${fairThemeById(themeId).name} it is! The Fair Board is ready.`);
  };
  const rest = (event: ClickLike) => {
    if (once(event, { type: "restShowroom" }))
      toast("The shop rests this season. Rent is just the garage.", "info");
  };
  const openShowroom = (event: ClickLike) => {
    once(event, { type: "openShowroom" });
  };
  const toDesk = () => {
    const calm =
      document.documentElement.dataset["motion"] === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    desk.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "setAside" })) toast("The piece is set aside. Your workbench is clear.", "info");
  };

  return (
    <div className="ww-hub ad-screen" data-testid="workshop-hub">
      <div className="ww-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="ww-hub__main">
          <BenchTourCard state={state} dispatch={dispatch} />
          <ShowroomOfferCard state={state} onOpen={openShowroom} />
          <div className="ww-hub__stage">
            <HubHero
              state={state}
              benchTitle={onBench === null ? null : benchTitle(onBench)}
              setAsideReason={setAsideIssue(state) ?? undefined}
              onOpenBench={onOpenBuild}
              onSetAside={() => setSettingAside(true)}
              onWorkShift={(event) => endDay(event, "shift")}
              onEndDay={(event) => endDay(event, "rest")}
            />
            <div className="ww-hub__door">
              <DoorBoard state={state} offers={offers} onAccept={accept} onDecline={decline} />
            </div>
          </div>
          <CoachBubble show={coachOn(state) && onBench === null} text={coachLine(state)} />
          <button type="button" className="ww-hub__more" onClick={toDesk}>
            <span className="ww-hub__more-arrow" aria-hidden="true">
              ↓
            </span>
            {state.career === "showroom"
              ? "Your showroom floor, jobs and more"
              : "Your jobs, upgrades and more"}
          </button>
          <div className="ww-hub__desk" ref={desk}>
            {state.career === "showroom" ? (
              <ShowroomFloorCard state={state} dispatch={dispatch} onArrange={onOpenFloor} />
            ) : null}
            <div className="ww-hub__grid">
              <div className="ww-hub__column">
                <Card
                  title="Your jobs"
                  eyebrow={`${state.gigs.active.length} of ${MAX_ACTIVE_GIGS} on the go`}
                  className="ww-hub-card"
                >
                  {state.gigs.active.length === 0 ? (
                    <p className="ww-muted">Accept a note from the door to start building.</p>
                  ) : (
                    <div className="ww-hub__stack">
                      {state.gigs.active.map((gig) => (
                        <JobCard
                          key={gig.id}
                          state={state}
                          gig={gig}
                          onStart={(event) => start(event, gig.id)}
                          onContinue={onOpenBuild}
                        />
                      ))}
                    </div>
                  )}
                </Card>
                <SetTemplatesCard state={state} onStart={startSet} />
                <BoardRack state={state} />
              </div>
              <div className="ww-hub__column">
                <SeasonCard state={state} onTheme={chooseTheme} onRest={rest} onFair={onOpenFair} />
                <RenCard state={state} dispatch={dispatch} />
                <RosetteRailCard state={state} />
                <TrendsBoard state={state} />
              </div>
              <div className="ww-hub__column">
                <UpgradesPanel state={state} onBuy={buyUpgrade} />
                <DecorPanel state={state} onBuy={buyDecor} />
              </div>
            </div>
          </div>
          <p className="ww-safety ww-hub__safety">
            <Icon name="shield" size={14} /> Sizes here are game numbers, not real plans. {SAFETY_LINE}
          </p>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition
          summary={daySummary(ending.from, state, ending.kind)}
          opener={state.career === "showroom" ? "Open the shop" : "Open the garage"}
          onDone={() => setEnding(null)}
        />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog open={settingAside} onConfirm={setAside} onClose={() => setSettingAside(false)} />
    </div>
  );
}
