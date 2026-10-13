import { useState } from "react";
import { useToast } from "../../../app/ToastContext";
import type { UpgradeId } from "../../../content/upgrade";
import {
  assistantHireCost,
  clientById,
  currentBeat,
  MAX_ACTIVE_GIGS,
  offersFor,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { Button } from "../../kit/Button";
import { Card } from "../../kit/Card";
import { Icon } from "../../kit/IconSet";
import { useDispatchOnce, type ClickLike } from "../../kit/useDispatchOnce";
import { SetAsideDialog } from "../craft/SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { GigCard } from "./GigCard";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { LabelLaunchCard } from "./LabelLaunchCard";
import { OfferCard } from "./OfferCard";
import { ResultsLog } from "./ResultsLog";
import { SeasonCard } from "./SeasonCard";
import { StudioPanel } from "./StudioPanel";
import { TrendsPanel } from "./TrendsPanel";
import "./hub.css";

export interface StudioHubProps {
  state: GameState;
  dispatch: (action: Action) => boolean;
  onOpenCraft: () => void;
  onOpenLabel: () => void;
  onOpenSettings: () => void;
  onExitToTitle: () => void;
}

interface DayEnding {
  readonly from: GameState;
  readonly kind: DayEndKind;
}

export function StudioHub({
  state,
  dispatch,
  onOpenCraft,
  onOpenLabel,
  onOpenSettings,
  onExitToTitle,
}: StudioHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<DayEnding | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const offers = offersFor(state);
  const gigs = state.gigs.active;
  const run = state.activeRun;
  const lookOnTable = run !== null && run.stage !== "done" && run.purpose.kind === "look";
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;

  const clientName = (offerId: string) => {
    const offer = state.gigs.offers.find((entry) => entry.id === offerId);
    return offer === undefined ? undefined : clientById(offer.clientId)?.name;
  };

  const accept = (event: ClickLike, offerId: string) => {
    const name = clientName(offerId) ?? "Your client";
    if (once(event, { type: "acceptOffer", offerId })) toast(`${name} is thrilled. Gig accepted.`);
  };

  const decline = (event: ClickLike, offerId: string) => {
    const name = clientName(offerId) ?? "the request";
    if (once(event, { type: "declineOffer", offerId })) toast(`You politely passed on ${name}.`, "info");
  };

  const startGig = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startRun", gigId })) onOpenCraft();
  };

  const buy = (upgradeId: UpgradeId, event: ClickLike) => {
    if (once(event, { type: "buyUpgrade", upgradeId })) toast(`Bought ${upgradeById(upgradeId).name}`);
  };

  const hire = (event: ClickLike) => {
    const cost = assistantHireCost(state);
    if (!once(event, { type: "hireAssistant" })) return;
    toast(
      cost > 0 ? `Assistant hired. Paid ${cost} coins for this week.` : "Your assistant is back this week.",
    );
  };

  const fire = (event: ClickLike) => {
    if (once(event, { type: "fireAssistant" }))
      toast("Your assistant packed up with a smile. You can hire again any time.", "info");
  };

  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    if (once(event, { type: kind === "shift" ? "workShift" : "endDay" })) setEnding({ from, kind });
  };

  const launch = (event: ClickLike) => {
    if (once(event, { type: "launchLabel" })) toast("Your label is born. Welcome to the atelier!");
  };

  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The dress is set aside. Your work table is clear.", "info");
  };

  return (
    <div className="ad-hub ad-screen" data-testid="studio-hub">
      <div className="ad-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="ad-hub__main">
          <HubHero
            state={state}
            onWorkShift={(event) => endDay(event, "shift")}
            onEndDay={(event) => endDay(event, "rest")}
          />
          <div className="ad-hub__grid">
            <div className="ad-hub__column">
              <Card
                title="Inbox"
                eyebrow={
                  offers.length === 0
                    ? "All caught up"
                    : `${offers.length} new ${offers.length === 1 ? "request" : "requests"}`
                }
                className="ad-hub-card"
              >
                {offers.length === 0 ? (
                  <div className="ad-empty">
                    <Icon name="heart" size={28} />
                    <p>
                      No requests right now. New clients write in overnight, and buzz brings more of them.
                    </p>
                  </div>
                ) : (
                  <div className="ad-stack">
                    {offers.map((view) => (
                      <OfferCard
                        key={view.offer.id}
                        state={state}
                        view={view}
                        onAccept={(event) => accept(event, view.offer.id)}
                        onDecline={(event) => decline(event, view.offer.id)}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
            <div className="ad-hub__column">
              {state.profile.career === "label" ? (
                <SeasonCard state={state} onOpenBoard={onOpenLabel} />
              ) : null}
              {lookOnTable ? (
                <Card
                  tone="rose"
                  eyebrow="On the table"
                  title="A collection look is waiting"
                  className="ad-hub-card"
                >
                  <button type="button" className="ad-link-button" onClick={onOpenCraft}>
                    <Icon name="needle" size={18} /> Continue look{" "}
                    {run.purpose.kind === "look" ? run.purpose.lookIndex + 1 : ""}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => setSettingAside(true)}>
                    Set aside
                  </Button>
                </Card>
              ) : null}
              <Card
                title="Active gigs"
                eyebrow={`${gigs.length} of ${MAX_ACTIVE_GIGS} on the go`}
                className="ad-hub-card"
              >
                {gigs.length === 0 ? (
                  <div className="ad-empty">
                    <Icon name="scissors" size={28} />
                    <p>Your cutting table is clear. Accept a request from the inbox to get sewing.</p>
                  </div>
                ) : (
                  <div className="ad-stack">
                    {gigs.map((gig) => (
                      <GigCard
                        key={gig.id}
                        state={state}
                        gig={gig}
                        onStart={(event) => startGig(event, gig.id)}
                        onContinue={onOpenCraft}
                        onSetAside={() => setSettingAside(true)}
                      />
                    ))}
                  </div>
                )}
              </Card>
              {state.profile.career === "student" ? (
                <LabelLaunchCard state={state} onLaunch={launch} />
              ) : null}
              <ResultsLog state={state} />
            </div>
            <div className="ad-hub__column">
              <TrendsPanel state={state} />
              <StudioPanel state={state} onBuy={buy} onHire={hire} onFire={fire} />
            </div>
          </div>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog
        run={run}
        open={settingAside}
        onConfirm={setAside}
        onClose={() => setSettingAside(false)}
      />
    </div>
  );
}
