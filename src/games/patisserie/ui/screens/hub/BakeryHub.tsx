import { useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { MenuTierId } from "../../../content/menuTier";
import type { ProductId, TrayProductId } from "../../../content/product";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  coachOn,
  currentBeat,
  offersFor,
  productById,
  upgradeById,
  type Action,
  type BakeRun,
  type GameState,
} from "../../../core";
import { MAX_ACTIVE_GIGS } from "../../../../../engine/gigBoard";
import type { PlayView } from "../../patisserieRoute";
import { useAfterFirstPaint } from "../../useAfterFirstPaint";
import { GuideBubble } from "../GuideBubble";
import { StoryOverlay } from "../story/StoryOverlay";
import { SeasonPanel } from "../season/SeasonPanel";
import { CometRoomCard } from "./CometRoomCard";
import { CounterPanel } from "./CounterPanel";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { GigCard } from "./GigCard";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { OfferCard } from "./OfferCard";
import { PantryPeek } from "./PantryPeek";
import { SalonHero } from "./SalonHero";
import { SetAsideDialog } from "../SetAsideDialog";
import { TrendsBoard } from "./TrendsBoard";
import { UpgradesPanel } from "./UpgradesPanel";
import "./hub.css";

export interface BakeryHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

const PLANS_ID = "pa-hub-plans";

function guideLine(state: GameState): string {
  if (state.gigs.active.length === 0) return "Pip has an order! Tap Accept on the order board.";
  return "Now tap Start baking. Hold, stir, bake and pipe!";
}

export function BakeryHub({ state, dispatch, onOpen, onOpenSettings, onExitToTitle }: BakeryHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const offers = offersFor(state);
  const run = state.activeRun;
  const onBench = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
  const painted = useAfterFirstPaint();
  const showPlans = state.career !== "salon" || painted;

  const accept = (event: ClickLike, offerId: string, clientId: string) => {
    if (once(event, { type: "acceptOffer", offerId }))
      toast(`${clientById(clientId)?.name ?? "Your neighbour"} is thrilled. Order accepted!`);
  };
  const decline = (event: ClickLike, offerId: string) => {
    if (once(event, { type: "declineOffer", offerId })) toast("You kindly passed on that order.", "info");
  };
  const startOrder = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startOrder", gigId })) onOpen("bake");
  };
  const startTray = (event: ClickLike, productId: TrayProductId) => {
    if (once(event, { type: "startTray", productId })) onOpen("bake");
  };
  const openCounter = (event: ClickLike) => {
    if (state.counter.session !== null) onOpen("counter");
    else if (once(event, { type: "openCounter" })) onOpen("counter");
  };
  const buy = (event: ClickLike, upgradeId: UpgradeId) => {
    if (once(event, { type: "buyUpgrade", upgradeId }))
      toast(`${upgradeById(upgradeId).name} is in the bakery!`);
  };
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    const action: Action = { type: kind === "shift" ? "workShift" : "endDay" };
    if (once(event, action)) setEnding({ from, kind });
  };
  const openSalon = (event: ClickLike) => {
    if (once(event, { type: "openSalon" })) toast("Dust sheets off, lamps on. The Comet Room is yours!");
  };
  const bakeSalonTray = (event: ClickLike, tier: MenuTierId) => {
    if (once(event, { type: "startSalonTray", tier })) onOpen("bake");
  };
  const welcome = (event: ClickLike) => {
    if ((state.salon?.session ?? null) !== null) onOpen("salon");
    else if (once(event, { type: "openTables" })) onOpen("salon");
  };
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The bake is set aside. Your bench is clear.", "info");
  };

  return (
    <div className="pa-hub ad-screen" data-testid="bakery-hub">
      <div className="pa-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="pa-hub__main">
          {state.career === "salon" ? (
            <SalonHero
              state={state}
              plansId={PLANS_ID}
              onWorkShift={(event) => endDay(event, "shift")}
              onEndDay={(event) => endDay(event, "rest")}
              onBakeTray={bakeSalonTray}
              onWelcome={welcome}
            />
          ) : (
            <HubHero
              state={state}
              plansId={PLANS_ID}
              onWorkShift={(event) => endDay(event, "shift")}
              onEndDay={(event) => endDay(event, "rest")}
              onStartOrder={startOrder}
              onBench={() => onOpen("bake")}
            />
          )}
          <GuideBubble show={coachOn(state) && onBench === null} text={guideLine(state)} />
          <div className="pa-hub__plans" id={PLANS_ID}>
            {showPlans ? (
              <>
                {state.career === "salon" ? (
                  <SeasonPanel state={state} dispatch={dispatch} once={once} onOpen={onOpen} />
                ) : null}
                <div className="pa-hub__grid">
                  <div className="pa-hub__column">
                    <section className="pa-board" aria-labelledby="pa-board-title">
                      <header className="pa-board__header">
                        <h2 id="pa-board-title">Order board</h2>
                        <span className="pa-muted">
                          {offers.length === 0 ? "All caught up" : `${offers.length} pinned up`}
                        </span>
                      </header>
                      {offers.length === 0 ? (
                        <p className="pa-board__empty">
                          New orders get pinned up overnight. Buzz brings more of them.
                        </p>
                      ) : (
                        <div className="pa-board__cards">
                          {offers.map((view) => (
                            <OfferCard
                              key={view.offer.id}
                              state={state}
                              view={view}
                              onAccept={(event) => accept(event, view.offer.id, view.client.id)}
                              onDecline={(event) => decline(event, view.offer.id)}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                  <div className="pa-hub__column">
                    {onBench !== null ? (
                      <Card
                        tone="gold"
                        eyebrow={benchEyebrow(onBench.purpose.kind)}
                        title={productName(onBench.design.productId)}
                        className="pa-hub-card"
                      >
                        <div className="pa-hub__bench">
                          <Button onClick={() => onOpen("bake")} icon="sparkle">
                            Back to the bench
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSettingAside(true)}>
                            Set aside
                          </Button>
                        </div>
                      </Card>
                    ) : null}
                    <Card
                      title="Your orders"
                      eyebrow={`${state.gigs.active.length} of ${MAX_ACTIVE_GIGS} on the go`}
                      className="pa-hub-card"
                    >
                      {state.gigs.active.length === 0 ? (
                        <p className="pa-muted">Accept an order from the board to start baking.</p>
                      ) : (
                        <div className="pa-hub__stack">
                          {state.gigs.active.map((gig) => (
                            <GigCard
                              key={gig.id}
                              state={state}
                              gig={gig}
                              onStart={(event) => startOrder(event, gig.id)}
                              onContinue={() => onOpen("bake")}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                    <CounterPanel state={state} onStartTray={startTray} onOpenCounter={openCounter} />
                  </div>
                  <div className="pa-hub__column">
                    <CometRoomCard state={state} onOpenSalon={openSalon} />
                    <TrendsBoard state={state} />
                    <Card
                      title="Bake Book"
                      eyebrow={`${state.bakeBook.length} bakes kept`}
                      className="pa-hub-card"
                    >
                      <Button variant="secondary" block icon="heart" onClick={() => onOpen("book")}>
                        Open the Bake Book
                      </Button>
                      <ToggleSwitch
                        label="First order guide"
                        description="Little hint bubbles from Otti."
                        checked={state.guide}
                        onChange={(on) => dispatch({ type: "setGuide", on })}
                      />
                    </Card>
                    <PantryPeek state={state} />
                    <UpgradesPanel state={state} onBuy={buy} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <p className="pa-safety pa-hub__safety">
            <Icon name="shield" size={14} /> Amounts and oven dots are game numbers. Real ovens, mixers and
            knives: ask an adult first.
          </p>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog open={settingAside} onConfirm={setAside} onClose={() => setSettingAside(false)} />
    </div>
  );
}

function benchEyebrow(kind: BakeRun["purpose"]["kind"]): string {
  if (kind === "showpiece") return "Fair showpiece on the bench";
  if (kind === "salon-tray") return "Salon tray on the bench";
  return "On the bench";
}

function productName(productId: ProductId | null): string {
  return productId === null ? "A bake in progress" : productById(productId).name;
}
