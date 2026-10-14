import { useState } from "react";
import type { ColourId } from "../../../../../engine/palette";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { DecorId } from "../../../content/decor";
import { SAFETY_LINE } from "../../../content/hint";
import type { UpgradeId } from "../../../content/upgrade";
import {
  clientById,
  currentBeat,
  decorById,
  MAX_ACTIVE_GIGS,
  offersFor,
  productById,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { CoachBubble } from "../CoachBubble";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { BoardRack } from "./BoardRack";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { DecorPanel } from "./DecorPanel";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { JobCard } from "./JobCard";
import { OfferNote } from "./OfferNote";
import { TrendsBoard } from "./TrendsBoard";
import { UpgradesPanel } from "./UpgradesPanel";
import "./hub.css";

interface WorkshopHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenBuild: () => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

const TILTS = [-2.4, 1.8, -1.2, 2.6];

function coachLine(state: GameState): string {
  if (state.gigs.active.length === 0) return "A note is pinned to the door! Tap Accept.";
  return "Now tap Start building. Your workbench is ready.";
}

export function WorkshopHub({
  state,
  dispatch,
  onOpenBuild,
  onOpenSettings,
  onExitToTitle,
}: WorkshopHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [settingAside, setSettingAside] = useState(false);
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
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "setAside" })) toast("The piece is set aside. Your workbench is clear.", "info");
  };

  return (
    <div className="ww-hub ad-screen" data-testid="workshop-hub">
      <div className="ww-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="ww-hub__main">
          <HubHero
            state={state}
            onWorkShift={(event) => endDay(event, "shift")}
            onEndDay={(event) => endDay(event, "rest")}
          />
          <CoachBubble show={state.delivered === 0 && onBench === null} text={coachLine(state)} />
          <div className="ww-hub__grid">
            <section className="ww-door" aria-labelledby="ww-door-title">
              <header className="ww-door__header">
                <h2 id="ww-door-title">Notes on the door</h2>
                <span className="ww-muted">
                  {offers.length === 0 ? "All caught up" : `${offers.length} pinned up`}
                </span>
              </header>
              {offers.length === 0 ? (
                <p className="ww-door__empty">New notes get pinned up overnight. Buzz brings more of them.</p>
              ) : (
                <div className="ww-door__notes">
                  {offers.map((view, index) => (
                    <OfferNote
                      key={view.offer.id}
                      state={state}
                      view={view}
                      tilt={TILTS[index % TILTS.length] ?? 0}
                      onAccept={(event) => accept(event, view.offer.id, view.client.id)}
                      onDecline={(event) => decline(event, view.offer.id)}
                    />
                  ))}
                </div>
              )}
            </section>
            <div className="ww-hub__column">
              {onBench !== null ? (
                <Card
                  tone="gold"
                  eyebrow="On the workbench"
                  title={
                    onBench.design.productId === null
                      ? "A piece in progress"
                      : productById(onBench.design.productId).name
                  }
                  className="ww-hub-card"
                >
                  <div className="ww-hub__bench">
                    <Button onClick={onOpenBuild} icon="sparkle">
                      Back to the workbench
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSettingAside(true)}>
                      Set aside
                    </Button>
                  </div>
                </Card>
              ) : null}
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
              <BoardRack state={state} />
            </div>
            <div className="ww-hub__column">
              <TrendsBoard state={state} />
              <UpgradesPanel state={state} onBuy={buyUpgrade} />
              <DecorPanel state={state} onBuy={buyDecor} />
            </div>
          </div>
          <p className="ww-safety ww-hub__safety">
            <Icon name="shield" size={14} /> Sizes here are game numbers, not real plans. {SAFETY_LINE}
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
