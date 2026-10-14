import { useState } from "react";
import { MAX_ACTIVE_GIGS } from "../../../../../engine/gigBoard";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { DecorId } from "../../../content/decor";
import type { StallProductId } from "../../../content/product";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  coachOn,
  currentBeat,
  decorById,
  offersFor,
  productById,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import type { PlayView } from "../../jewelleryRoute";
import { CoachBubble } from "../CoachBubble";
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
  const offers = offersFor(state);
  const run = state.activeRun;
  const onBench = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
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
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    if (once(event, { type: kind === "shift" ? "workShift" : "endDay" })) setEnding({ from, kind });
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
              {onBench !== null ? (
                <Card
                  tone="gold"
                  eyebrow="On the bench"
                  title={productById(onBench.design.productId).name}
                  className="jb-hub-card"
                >
                  <div className="jb-hub__bench">
                    <Button onClick={() => onOpen("bench")} icon="sparkle">
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
      <SetAsideDialog open={settingAside} onConfirm={setAside} onClose={() => setSettingAside(false)} />
    </div>
  );
}
