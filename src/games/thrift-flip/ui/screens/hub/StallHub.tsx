import { useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  currentBeat,
  MAX_ACTIVE_GIGS,
  offersFor,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { Bunting } from "../../art/Bunting";
import { SetAsideDialog } from "../flip/SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { CrowdPanel } from "./CrowdPanel";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { GigCard } from "./GigCard";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { OfferTag } from "./OfferTag";
import { RackPanel } from "./RackPanel";
import { ResultsLog } from "./ResultsLog";
import { StockPanel } from "./StockPanel";
import { UpgradesPanel } from "./UpgradesPanel";
import "./hub.css";

export interface StallHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenFlip: () => void;
  readonly onOpenStall: () => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

const TILTS = [-2.5, 1.8, -1.2, 2.4];

interface DayEnding {
  readonly from: GameState;
  readonly kind: DayEndKind;
}

export function StallHub({
  state,
  dispatch,
  onOpenFlip,
  onOpenStall,
  onOpenSettings,
  onExitToTitle,
}: StallHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<DayEnding | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const offers = offersFor(state);
  const gigs = state.gigs.active;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;

  const clientName = (offerId: string) => {
    const offer = state.gigs.offers.find((entry) => entry.id === offerId);
    return offer === undefined ? "Your regular" : (clientById(offer.clientId)?.name ?? "Your regular");
  };

  const accept = (event: ClickLike, offerId: string) => {
    const name = clientName(offerId);
    if (once(event, { type: "acceptOffer", offerId })) toast(`${name} is delighted. Order accepted!`);
  };

  const decline = (event: ClickLike, offerId: string) => {
    const name = clientName(offerId);
    if (once(event, { type: "declineOffer", offerId }))
      toast(`You kindly passed on ${name}'s request.`, "info");
  };

  const startGig = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startFlip", gigId })) onOpenFlip();
  };

  const startOwn = (event: ClickLike) => {
    if (once(event, { type: "startOwnFlip" })) onOpenFlip();
  };

  const buy = (upgradeId: UpgradeId, event: ClickLike) => {
    if (once(event, { type: "buyUpgrade", upgradeId })) toast(`${upgradeById(upgradeId).name} is yours!`);
  };

  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    if (once(event, kind === "shift" ? { type: "workShift" } : { type: "endDay" })) setEnding({ from, kind });
  };

  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonFlip" })) toast("The flip is set aside. Your bench is clear.", "info");
  };

  return (
    <div className="tf-hub ad-screen" data-testid="stall-hub">
      <div className="tf-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="tf-hub__main">
          <h1 className="ad-visually-hidden">Your stall at the market</h1>
          <HubHero
            state={state}
            onWorkShift={(event) => endDay(event, "shift")}
            onEndDay={(event) => endDay(event, "rest")}
            onOpenStall={onOpenStall}
          />
          <div className="tf-hub__grid">
            <section className="tf-board" aria-labelledby="tf-board-title">
              <Bunting className="tf-board__bunting" />
              <header className="tf-board__head">
                <h2 id="tf-board-title">Order board</h2>
                <span className="tf-board__count">
                  {offers.length === 0
                    ? "All caught up"
                    : `${offers.length} new ${offers.length === 1 ? "request" : "requests"}`}
                </span>
              </header>
              {offers.length === 0 ? (
                <div className="tf-empty">
                  <Icon name="heart" size={28} />
                  <p>No requests right now. Regulars pin new ones overnight, and buzz brings more.</p>
                </div>
              ) : (
                <div className="tf-board__tags">
                  {offers.map((view, index) => (
                    <OfferTag
                      key={view.offer.id}
                      state={state}
                      view={view}
                      tilt={TILTS[index % TILTS.length] ?? 0}
                      onAccept={(event) => accept(event, view.offer.id)}
                      onDecline={(event) => decline(event, view.offer.id)}
                    />
                  ))}
                </div>
              )}
            </section>
            <div className="tf-hub__column">
              <Card
                title="Your orders"
                eyebrow={`${gigs.length} of ${MAX_ACTIVE_GIGS} on the go`}
                className="tf-hub-card"
              >
                {gigs.length === 0 ? (
                  <div className="tf-empty">
                    <Icon name="scissors" size={28} />
                    <p>Your bench is clear. Accept a request from the board to start a flip.</p>
                  </div>
                ) : (
                  <div className="tf-stack">
                    {gigs.map((gig) => (
                      <GigCard
                        key={gig.id}
                        state={state}
                        gig={gig}
                        onStart={(event) => startGig(event, gig.id)}
                        onContinue={onOpenFlip}
                        onSetAside={() => setSettingAside(true)}
                      />
                    ))}
                  </div>
                )}
              </Card>
              <RackPanel state={state} onStartOwn={startOwn} onContinue={onOpenFlip} />
              <ResultsLog state={state} />
            </div>
            <div className="tf-hub__column">
              <CrowdPanel state={state} />
              <StockPanel state={state} />
              <UpgradesPanel state={state} onBuy={buy} />
            </div>
          </div>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog
        run={state.activeRun}
        open={settingAside}
        onConfirm={setAside}
        onClose={() => setSettingAside(false)}
      />
    </div>
  );
}
