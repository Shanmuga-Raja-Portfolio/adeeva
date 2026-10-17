import { useEffect, useRef, useState } from "react";
import { MAX_ACTIVE_GIGS } from "../../../../../engine/gigBoard";
import { focusHeading } from "../../../../../studio/focusHeading";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { DecorId } from "../../../content/decor";
import type { LaunchThemeId } from "../../../content/launchTheme";
import type { LineNameId } from "../../../content/lineName";
import type { StallProductId } from "../../../content/product";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  coachOn,
  currentBeat,
  decorById,
  lanternNightUnstaged,
  launchThemeById,
  lineNameById,
  offersFor,
  productById,
  setAsideIssue,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import type { PlayView } from "../../jewelleryRoute";
import { CoachBubble } from "../CoachBubble";
import { BenchTourCard } from "../loft/BenchTourCard";
import { LanternNightDialog } from "../loft/LanternNightDialog";
import { LoftOfferCard } from "../loft/LoftOfferCard";
import { LoftPanel } from "../loft/LoftPanel";
import { SeasonRibbon } from "../loft/SeasonRibbon";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { ChalkBoard } from "./ChalkBoard";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { OfferTag } from "./OfferTag";
import { OrderCard } from "./OrderCard";
import { ShopPanel } from "./ShopPanel";
import { StallPanel } from "./StallPanel";
import { StockDrawers } from "./StockDrawers";
import "./hub.css";

interface BenchHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

function coachLine(state: GameState): string {
  if (state.gigs.active.length === 0) return "Gran Mina pinned up an order. Tap Accept on her tag.";
  return "Now tap Start making. Cut, join, set and polish!";
}

export function BenchHub({ state, dispatch, onOpen, onOpenSettings, onExitToTitle }: BenchHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const [nightKind, setNightKind] = useState<DayEndKind | null>(null);
  const offers = offersFor(state);
  const run = state.activeRun;
  const onBench = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
  const hadOverlay = useRef(overlayOpen);
  useEffect(() => {
    if (hadOverlay.current && !overlayOpen) focusHeading();
    hadOverlay.current = overlayOpen;
  }, [overlayOpen]);
  const latest = state.keepsakes.slice(-3).reverse();

  const accept = (event: ClickLike, offerId: string, clientId: string) => {
    if (once(event, { type: "acceptOffer", offerId }))
      toast(`${clientById(clientId)?.name ?? "Your neighbour"} is delighted. Order accepted!`);
  };
  const decline = (event: ClickLike, offerId: string) => {
    if (once(event, { type: "declineOffer", offerId })) toast("You kindly passed on that order.", "info");
  };
  const startOrder = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startOrder", gigId })) onOpen("bench");
  };
  const startStall = (event: ClickLike, productId: StallProductId) => {
    if (once(event, { type: "startStall", productId })) onOpen("bench");
  };
  const buyUpgrade = (event: ClickLike, upgradeId: UpgradeId) => {
    if (once(event, { type: "buyUpgrade", upgradeId }))
      toast(`${upgradeById(upgradeId).name} is on your bench!`);
  };
  const buyDecor = (event: ClickLike, decorId: DecorId) => {
    if (once(event, { type: "buyDecor", decorId })) toast(`${decorById(decorId).name} brightens your stall!`);
  };
  const finishDay = (event: ClickLike, kind: DayEndKind) => {
    setNightKind(null);
    const from = state;
    if (once(event, { type: kind === "shift" ? "workShift" : "endDay" })) setEnding({ from, kind });
  };
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    if (lanternNightUnstaged(state)) setNightKind(kind);
    else finishDay(event, kind);
  };
  const openLoft = (event: ClickLike, lineNameId: LineNameId) => {
    if (once(event, { type: "openLoft", lineNameId }))
      toast(`${lineNameById(lineNameId).name} has a home in the Lantern Loft!`);
  };
  const pickTheme = (event: ClickLike, themeId: LaunchThemeId) => {
    if (once(event, { type: "pickLaunchTheme", themeId }))
      toast(`${launchThemeById(themeId).name} it is! Open the Collection Board next.`);
  };
  const restLine = (event: ClickLike) => {
    if (once(event, { type: "restLine" })) toast("Your line rests this season. Bench rent only.", "info");
  };
  const startLinePiece = (event: ClickLike, slot: number) => {
    if (once(event, { type: "startCollectionPiece", slot })) onOpen("bench");
  };
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The piece is set aside. Your bench is clear.", "info");
  };

  return (
    <div className="jb-hub ad-screen" data-testid="bench-hub">
      <div className="jb-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="jb-hub__main">
          <HubHero
            state={state}
            onWorkShift={(event) => endDay(event, "shift")}
            onEndDay={(event) => endDay(event, "rest")}
          />
          <SeasonRibbon state={state} />
          <CoachBubble show={coachOn(state) && onBench === null} text={coachLine(state)} />
          <div className="jb-hub__grid">
            <div className="jb-hub__column">
              <section className="jb-cork" aria-labelledby="jb-cork-title">
                <header className="jb-cork__header">
                  <h2 id="jb-cork-title">Order tags</h2>
                  <span className="jb-cork__count">
                    {offers.length === 0 ? "All caught up" : `${offers.length} pinned up`}
                  </span>
                </header>
                {offers.length === 0 ? (
                  <p className="jb-cork__empty">New order tags arrive overnight. Buzz brings more of them.</p>
                ) : (
                  <div className="jb-cork__tags">
                    {offers.map((view, index) => (
                      <OfferTag
                        key={view.offer.id}
                        state={state}
                        view={view}
                        index={index}
                        onAccept={(event) => accept(event, view.offer.id, view.client.id)}
                        onDecline={(event) => decline(event, view.offer.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
              <StockDrawers state={state} />
            </div>
            <div className="jb-hub__column">
              <BenchTourCard state={state} dispatch={dispatch} />
              <LoftOfferCard state={state} onOpen={openLoft} />
              {onBench !== null ? (
                <Card
                  tone="gold"
                  eyebrow={
                    onBench.purpose.kind === "collection" ? "On the bench · for your line" : "On the bench"
                  }
                  title={productById(onBench.design.productId).name}
                  className="jb-hub-card"
                >
                  <div className="jb-hub__bench">
                    <Button onClick={() => onOpen("bench")} icon="sparkle">
                      Back to the bench
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSettingAside(true)}
                      disabledReason={setAsideIssue(state) ?? undefined}
                    >
                      Set aside
                    </Button>
                  </div>
                </Card>
              ) : null}
              <LoftPanel
                state={state}
                onOpen={onOpen}
                onPickTheme={pickTheme}
                onRest={restLine}
                onStartPiece={startLinePiece}
              />
              <Card
                title="Your orders"
                eyebrow={`${state.gigs.active.length} of ${MAX_ACTIVE_GIGS} on the go`}
                className="jb-hub-card"
              >
                {state.gigs.active.length === 0 ? (
                  <p className="jb-muted">Accept an order tag to start making.</p>
                ) : (
                  <div className="jb-hub__stack">
                    {state.gigs.active.map((gig) => (
                      <OrderCard
                        key={gig.id}
                        state={state}
                        gig={gig}
                        onStart={(event) => startOrder(event, gig.id)}
                        onContinue={() => onOpen("bench")}
                      />
                    ))}
                  </div>
                )}
              </Card>
              <StallPanel state={state} onStartStall={startStall} onOpenMarket={() => onOpen("market")} />
              <Card
                title="Keepsake Case"
                eyebrow={`${state.keepsakes.length} treasures kept`}
                className="jb-hub-card"
              >
                {latest.length > 0 ? (
                  <div className="jb-keep-peek" aria-hidden="true">
                    {latest.map((entry) => (
                      <PiecePreview key={entry.id} source={entry.look} title={null} />
                    ))}
                  </div>
                ) : (
                  <p className="jb-muted">Every piece you deliver or show goes in here.</p>
                )}
                <Button variant="secondary" block icon="heart" onClick={() => onOpen("keepsakes")}>
                  Open the Keepsake Case
                </Button>
                <ToggleSwitch
                  label="First order coach"
                  description="Little hints from Mr. Osei on your first order."
                  checked={state.guide}
                  onChange={(on) => dispatch({ type: "setGuide", on })}
                />
              </Card>
            </div>
            <div className="jb-hub__column">
              <ChalkBoard state={state} />
              <ShopPanel state={state} onBuyUpgrade={buyUpgrade} onBuyDecor={buyDecor} />
            </div>
          </div>
          <p className="jb-safety jb-hub__safety">
            <Icon name="shield" size={14} /> Metals and stones here are game items with no real prices or
            values.
          </p>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <LanternNightDialog
        open={nightKind !== null}
        difficulty={state.profile.difficulty}
        onStage={() => {
          setNightKind(null);
          onOpen("launch");
        }}
        onEndAnyway={(event) => finishDay(event, nightKind ?? "rest")}
        onClose={() => setNightKind(null)}
      />
      <SetAsideDialog
        open={settingAside}
        onConfirm={setAside}
        onClose={() => setSettingAside(false)}
        linePiece={state.activeRun?.purpose.kind === "collection"}
      />
    </div>
  );
}
