import { useRef, useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { ShopSignId } from "../../../content/shopSign";
import type { UpgradeId } from "../../../content/upgrade";
import {
  personById,
  currentBeat,
  signById,
  MAX_ACTIVE_GIGS,
  offersFor,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { SetAsideDialog } from "../flip/SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { CrowdPanel } from "./CrowdPanel";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { GigCard } from "./GigCard";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { OrderBoard } from "./OrderBoard";
import { RackPanel } from "./RackPanel";
import { ResultsLog } from "./ResultsLog";
import { StockPanel } from "./StockPanel";
import { UpgradesPanel } from "./UpgradesPanel";
import { KeepsakePanel } from "../boutique/KeepsakePanel";
import { LarkspurCard } from "../boutique/LarkspurCard";
import { SeasonPanel } from "../boutique/SeasonPanel";
import { WindowCard } from "../boutique/WindowCard";
import "./hub.css";
import "../boutique/boutique.css";

export interface StallHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenFlip: () => void;
  readonly onOpenStall: () => void;
  readonly onOpenWindow: () => void;
  readonly onOpenHall: () => void;
  readonly onOpenShowcase: () => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

interface DayEnding {
  readonly from: GameState;
  readonly kind: DayEndKind;
}

export function StallHub({
  state,
  dispatch,
  onOpenFlip,
  onOpenStall,
  onOpenWindow,
  onOpenHall,
  onOpenShowcase,
  onOpenSettings,
  onExitToTitle,
}: StallHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<DayEnding | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const desk = useRef<HTMLDivElement>(null);
  const offers = offersFor(state);
  const gigs = state.gigs.active;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;

  const clientName = (offerId: string) => {
    const offer = state.gigs.offers.find((entry) => entry.id === offerId);
    return offer === undefined ? "Your regular" : (personById(offer.clientId)?.name ?? "Your regular");
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

  const shelf = (event: ClickLike, action: Action) => {
    if (once(event, action))
      toast(
        action.type === "unshelvePiece" ? "Back on the seasonal rack." : "On the show shelf!",
        action.type === "unshelvePiece" ? "info" : "success",
      );
  };

  const openBoutique = (signId: ShopSignId) => {
    if (dispatch({ type: "openBoutique", signId }))
      toast(`${signById(signId).name} is open on Larkspur Row!`);
  };

  const toDesk = () => {
    const calm =
      document.documentElement.dataset["motion"] === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    desk.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  };

  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonFlip" })) toast("The flip is set aside. Your bench is clear.", "info");
  };

  return (
    <div
      className={state.boutique === null ? "tf-hub ad-screen" : "tf-hub tf-hub--boutique ad-screen"}
      data-testid="stall-hub"
      data-career={state.profile.career}
    >
      <div className="tf-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="tf-hub__main">
          <h1 className="ad-visually-hidden">
            {state.boutique === null ? "Your stall at the market" : "Your boutique on Larkspur Row"}
          </h1>
          <div className="tf-hub__stage">
            <HubHero
              state={state}
              onWorkShift={(event) => endDay(event, "shift")}
              onEndDay={(event) => endDay(event, "rest")}
              onOpenStall={onOpenStall}
              onOpenHall={onOpenHall}
              onOpenShowcase={onOpenShowcase}
              onOpenFlip={onOpenFlip}
              onOpenDesk={toDesk}
              board={<OrderBoard state={state} offers={offers} onAccept={accept} onDecline={decline} />}
            />
          </div>
          <div className="tf-hub__grid" ref={desk}>
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
              <RackPanel state={state} onStartOwn={startOwn} onContinue={onOpenFlip} onShelf={shelf} />
              <WindowCard state={state} onOpen={onOpenWindow} />
            </div>
            <div className="tf-hub__column">
              <LarkspurCard state={state} onOpen={openBoutique} />
              <SeasonPanel state={state} onOpenShowcase={onOpenShowcase} />
              <CrowdPanel state={state} />
              <ResultsLog state={state} />
            </div>
            <div className="tf-hub__column">
              <KeepsakePanel state={state} />
              <StockPanel state={state} />
              <UpgradesPanel state={state} onBuy={buy} />
            </div>
          </div>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition
          summary={daySummary(ending.from, state, ending.kind)}
          career={state.profile.career}
          signName={state.boutique === null ? null : signById(state.boutique.signId).name}
          onDone={() => setEnding(null)}
        />
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
