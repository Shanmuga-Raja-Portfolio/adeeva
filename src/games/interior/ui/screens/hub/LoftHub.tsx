import { useState } from "react";
import { MAX_ACTIVE_GIGS } from "../../../../../engine/gigBoard";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { LoftDecorId } from "../../../content/loftDecor";
import type { UpgradeId } from "../../../content/upgrade";
import { LARKSPUR_LATER_FLAG } from "../../../content/larkspurStoryBeat";
import {
  canOpenLarkspur,
  clientById,
  coachOn,
  currentBeat,
  loftDecorById,
  offersFor,
  openHouseAlert,
  purposeById,
  roomById,
  upgradeById,
  type Action,
  type GameState,
} from "../../../core";
import { RoomCutaway } from "../../art/RoomCutaway";
import { FINISHED, roomLook } from "../../art/roomLook";
import { CoachBubble } from "../CoachBubble";
import { SetAsideDialog } from "../SetAsideDialog";
import { LarkspurOfferCard } from "../larkspur/LarkspurOfferCard";
import { OpenHouseDayDialog } from "../larkspur/OpenHouseDayDialog";
import { LarkspurPanel } from "../larkspur/LarkspurPanel";
import { StoryOverlay } from "../story/StoryOverlay";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { LeftoverShelf } from "./LeftoverShelf";
import { LetterCard } from "./LetterCard";
import { LoftShop } from "./LoftShop";
import { MakeoverCard } from "./MakeoverCard";
import { MoodBoard } from "./MoodBoard";
import "./hub.css";

interface LoftHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpenMakeover: () => void;
  readonly onOpenHome: () => void;
  readonly onOpenOpenHouse: () => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

function coachLine(state: GameState): string {
  const larkspur = state.larkspur;
  if (larkspur !== null)
    return larkspur.project === null
      ? "Pick a family story below to start your first home."
      : "Tap Go to the home. Map it, pick a palette, then make each room.";
  if (state.gigs.active.length === 0) return "Nana Pearl sent a letter. Tap Accept on it.";
  return "Now tap Start the makeover. Plan, paint, floor and light!";
}

export function LoftHub({
  state,
  dispatch,
  onOpenMakeover,
  onOpenHome,
  onOpenOpenHouse,
  onOpenSettings,
  onExitToTitle,
}: LoftHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [settingAside, setSettingAside] = useState(false);
  const [confirmKind, setConfirmKind] = useState<DayEndKind | null>(null);
  const offers = offersFor(state);
  const run = state.activeRun;
  const inProgress = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
  const lastRun = run !== null && run.stage === "done" ? run : null;

  const accept = (event: ClickLike, offerId: string, clientId: string) => {
    if (once(event, { type: "acceptOffer", offerId }))
      toast(`${clientById(clientId)?.name ?? "Your neighbour"} is delighted. Makeover booked!`);
  };
  const decline = (event: ClickLike, offerId: string) => {
    if (once(event, { type: "declineOffer", offerId })) toast("You kindly passed on that letter.", "info");
  };
  const startOrder = (event: ClickLike, gigId: string) => {
    if (once(event, { type: "startOrder", gigId })) onOpenMakeover();
  };
  const buyUpgrade = (event: ClickLike, upgradeId: UpgradeId) => {
    if (once(event, { type: "buyUpgrade", upgradeId }))
      toast(`${upgradeById(upgradeId).name} is in the loft!`);
  };
  const buyDecor = (event: ClickLike, decorId: LoftDecorId) => {
    if (once(event, { type: "buyLoftDecor", decorId }))
      toast(`${loftDecorById(decorId).name} brightens the loft!`);
  };
  const project = state.larkspur?.project ?? null;
  const alert = project === null ? null : openHouseAlert(project, state.calendar.day);
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    if (alert !== null) {
      setConfirmKind(kind);
      return;
    }
    const from = state;
    if (once(event, { type: kind === "shift" ? "workShift" : "endDay" })) setEnding({ from, kind });
  };
  const confirmEndDay = () => {
    const kind = confirmKind;
    setConfirmKind(null);
    if (kind === null) return;
    const from = state;
    if (dispatch({ type: kind === "shift" ? "workShift" : "endDay" })) setEnding({ from, kind });
  };
  const takeKeys = (event: ClickLike) => {
    if (once(event, { type: "openLarkspur" })) toast("The keys to Larkspur Close are yours!");
  };
  const laterOffer =
    state.larkspur === null && state.story.flags.includes(LARKSPUR_LATER_FLAG) && canOpenLarkspur(state).ok;
  const homeRoom = inProgress !== null && inProgress.purpose.kind === "home-room";
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The room is set aside. Your table is clear.", "info");
  };

  return (
    <div className="is-hub ad-screen" data-testid="loft-hub">
      <div className="is-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="is-hub__main">
          <HubHero
            state={state}
            onWorkShift={(event) => endDay(event, "shift")}
            onEndDay={(event) => endDay(event, "rest")}
          />
          <CoachBubble show={coachOn(state) && inProgress === null} text={coachLine(state)} />
          {state.larkspur !== null ? (
            <LarkspurPanel
              state={state}
              larkspur={state.larkspur}
              dispatch={dispatch}
              onOpenHome={onOpenHome}
              onOpenOpenHouse={onOpenOpenHouse}
            />
          ) : null}
          {laterOffer ? <LarkspurOfferCard onTakeKeys={takeKeys} /> : null}
          <div className="is-hub__grid">
            <div className="is-hub__column">
              <section className="is-inbox" aria-labelledby="is-inbox-title">
                <header className="is-inbox__header">
                  <h2 id="is-inbox-title">Letters</h2>
                  <span className="is-inbox__count">
                    {offers.length === 0 ? "All caught up" : `${offers.length} waiting`}
                  </span>
                </header>
                {offers.length === 0 ? (
                  <p className="is-inbox__empty">New letters arrive overnight. Buzz brings more of them.</p>
                ) : (
                  <div className="is-inbox__letters">
                    {offers.map((view, index) => (
                      <LetterCard
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
            </div>
            <div className="is-hub__column">
              {inProgress !== null ? (
                <Card
                  tone="gold"
                  eyebrow={
                    inProgress.purpose.kind === "home-room" ? "In your show home" : "On the drawing table"
                  }
                  title={
                    inProgress.purpose.kind === "home-room"
                      ? purposeById(inProgress.purpose.purposeId).name
                      : roomById(inProgress.brief.roomId).name
                  }
                  className="is-hub-card"
                >
                  <div className="is-hub__bench">
                    <Button onClick={onOpenMakeover} icon="sparkle">
                      Back to the room
                    </Button>
                    {homeRoom ? null : (
                      <Button variant="ghost" size="sm" onClick={() => setSettingAside(true)}>
                        Set aside
                      </Button>
                    )}
                  </div>
                </Card>
              ) : null}
              <Card
                title="Your makeovers"
                eyebrow={`${state.gigs.active.length} of ${MAX_ACTIVE_GIGS} booked`}
                className="is-hub-card"
              >
                {state.gigs.active.length === 0 ? (
                  <p className="is-muted">Accept a letter to book a makeover.</p>
                ) : (
                  <div className="is-hub__stack">
                    {state.gigs.active.map((gig) => (
                      <MakeoverCard
                        key={gig.id}
                        state={state}
                        gig={gig}
                        onStart={(event) => startOrder(event, gig.id)}
                        onContinue={onOpenMakeover}
                      />
                    ))}
                  </div>
                )}
              </Card>
              {lastRun !== null ? (
                <Card
                  title="Last reveal"
                  eyebrow={clientById(lastRun.brief.clientId)?.name ?? "A neighbour"}
                  className="is-hub-card"
                >
                  <RoomCutaway
                    look={roomLook(lastRun, FINISHED)}
                    title={`The finished ${roomById(lastRun.brief.roomId).name}`}
                    className="is-hub__last-room"
                  />
                </Card>
              ) : null}
              <LeftoverShelf state={state} />
            </div>
            <div className="is-hub__column">
              <MoodBoard state={state} />
              <LoftShop state={state} onBuyUpgrade={buyUpgrade} onBuyDecor={buyDecor} />
              <ToggleSwitch
                label="First makeover coach"
                description="Little hints from Ms. Vale on your first room."
                checked={state.guide}
                onChange={(on) => dispatch({ type: "setGuide", on })}
              />
            </div>
          </div>
          <p className="is-safety is-hub__safety">
            <Icon name="shield" size={14} /> Rooms, prices and sizes here are made up for the game.
          </p>
        </main>
      </div>
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog open={settingAside} onConfirm={setAside} onClose={() => setSettingAside(false)} />
      <OpenHouseDayDialog
        alert={confirmKind === null ? null : alert}
        relaxed={state.profile.difficulty === "relaxed"}
        onConfirm={confirmEndDay}
        onClose={() => setConfirmKind(null)}
      />
    </div>
  );
}
