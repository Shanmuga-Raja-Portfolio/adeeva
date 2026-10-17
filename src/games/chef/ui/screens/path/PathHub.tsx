import { useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ChapterId } from "../../../content/chapter";
import { HALL_PEOPLE } from "../../../content/hallPeople";
import { segmentPrepIssue, type Action, type GameState } from "../../../core";
import type { PlayView } from "../../chefRoute";
import { DiaryCard } from "../hub/DiaryCard";
import { DishChoiceDialog } from "../hub/DishChoiceDialog";
import { HubFrame, type HubTools } from "../hub/HubFrame";
import { OnBoardCard } from "../hub/OnBoardCard";
import { OrdersPanel } from "../hub/OrdersPanel";
import { PracticeCard } from "../hub/PracticeCard";
import { ShopPanel } from "../hub/ShopPanel";
import { CookbookDesk } from "./CookbookDesk";
import { CueCardsDialog } from "./CueCardsDialog";
import { FestivalMap } from "./FestivalMap";
import { HatchCard } from "./HatchCard";
import { HatchDialog } from "./HatchDialog";
import { LettersWall } from "./LettersWall";
import { MenuDialog } from "./MenuDialog";
import { PathHero } from "./PathHero";
import { ReadyDialog } from "./ReadyDialog";
import { RecipeCardDialog } from "./RecipeCardDialog";
import { RestaurantStage } from "./RestaurantStage";
import { ReviewsWall } from "./ReviewsWall";
import { SegmentDesk } from "./SegmentDesk";
import { TeamDialog } from "./TeamDialog";
import { WeekCard } from "./WeekCard";
import { WeekMoneyCard } from "./WeekMoneyCard";
import "./path.css";
import "./pathDialogs.css";
import "./festival.css";
import "./cookbook.css";

export interface PeekTour {
  readonly tour: string;
  readonly onBack: () => void;
}

export interface PathHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
  readonly peek?: PeekTour | undefined;
}

type Desk = "none" | "menu" | "ready" | "team" | "hatch" | "prepare" | "cues";

const HOLLIS = HALL_PEOPLE.find((person) => person.id === "hollis");

function PeekBanner({ peek }: { readonly peek: PeekTour }) {
  return (
    <div className="ck-peek" role="region" aria-label="Peeking through the door" data-testid="peek-banner">
      {HOLLIS === undefined ? null : (
        <Avatar look={HOLLIS.look} size={64} title="Hollis" frameColour="#fbe6c2" />
      )}
      <p>
        <span className="ad-eyebrow">Hollis's tour</span>“{peek.tour}”
      </p>
      <Button icon="back" onClick={peek.onBack} data-testid="peek-back">
        Back to the doors
      </Button>
    </div>
  );
}

export function PathHub(props: PathHubProps) {
  const { state, dispatch, onOpen } = props;
  const [desk, setDesk] = useState<Desk>("none");
  const [chapter, setChapter] = useState<ChapterId | null>(null);
  const path = state.path;
  if (path === null) return null;
  const closeDesk = () => setDesk("none");

  const orders = (tools: HubTools) => (
    <OrdersPanel
      state={state}
      onAccept={(event, offerId) => {
        if (tools.once(event, { type: "acceptOffer", offerId })) tools.toast("Booking accepted!");
      }}
      onDecline={(event, offerId) => {
        if (tools.once(event, { type: "declineOffer", offerId }))
          tools.toast("You kindly passed on that one.", "info");
      }}
      onCook={tools.pickOrder}
    />
  );
  const onBoard = (tools: HubTools) => (
    <OnBoardCard state={state} onBack={() => onOpen("dish")} onSetAside={tools.setAside} />
  );
  const practice = (tools: HubTools) => (
    <PracticeCard
      onPick={tools.pickPractice}
      lead="Cook any dish you've unlocked. A 4-star plate counts as tested."
    />
  );
  const diary = <DiaryCard state={state} dispatch={dispatch} onOpen={() => onOpen("diary")} />;
  const money = <WeekMoneyCard week={path.week} lastWeek={path.lastWeek} />;

  return (
    <HubFrame
      {...props}
      testId="path-hub"
      className={`ck-path-hub ck-path-hub--${path.kind}`}
      readOnly={props.peek !== undefined}
      banner={props.peek === undefined ? undefined : <PeekBanner peek={props.peek} />}
      overlays={(tools) => (
        <>
          {path.kind === "tv" ? null : (
            <>
              <MenuDialog
                state={state}
                menu={path.menu}
                dispatch={dispatch}
                open={desk === "menu"}
                onClose={closeDesk}
              />
              <ReadyDialog state={state} open={desk === "ready"} dispatch={dispatch} onClose={closeDesk} />
            </>
          )}
          {path.kind === "restaurant" ? (
            <TeamDialog
              state={state}
              restaurant={path}
              open={desk === "team"}
              dispatch={dispatch}
              onClose={closeDesk}
            />
          ) : null}
          {path.kind === "truck" ? (
            <HatchDialog
              state={state}
              truck={path}
              open={desk === "hatch"}
              onMenu={() => setDesk("menu")}
              onClose={closeDesk}
              onStart={(helperId) => {
                if (dispatch({ type: "openFestival", helperId })) {
                  closeDesk();
                  onOpen("service");
                }
              }}
            />
          ) : null}
          {path.kind === "tv" ? (
            <>
              <DishChoiceDialog
                state={state}
                open={desk === "prepare"}
                title="Prepare a segment"
                lead="Pick the dish you'll teach today. Cook it with an adult, always."
                max={1}
                initial={[]}
                confirmLabel="Write the cue cards"
                issue={(selected) =>
                  selected[0] === undefined ? "Pick a dish." : segmentPrepIssue(state, selected[0])
                }
                onConfirm={(selected) => {
                  if (selected[0] !== undefined && dispatch({ type: "prepSegment", dishId: selected[0] }))
                    setDesk("cues");
                }}
                onClose={closeDesk}
              />
              <CueCardsDialog
                state={state}
                prep={path.prep}
                open={desk === "cues"}
                dispatch={dispatch}
                onClose={closeDesk}
                onLive={() => {
                  closeDesk();
                  tools.startRun({ type: "startSegment" });
                }}
              />
              <RecipeCardDialog
                state={state}
                tv={path}
                chapterId={chapter}
                onClose={() => setChapter(null)}
                onAdd={(chapterId, dishId, tip) => {
                  if (dispatch({ type: "addRecipeCard", chapterId, dishId, tip })) {
                    setChapter(null);
                    tools.toast("A new recipe card for the book!");
                  }
                }}
              />
            </>
          ) : null}
        </>
      )}
    >
      {(tools) => (
        <>
          {path.kind === "restaurant" ? (
            <>
              <RestaurantStage
                state={state}
                restaurant={path}
                onMenu={() => setDesk("menu")}
                onReady={() => setDesk("ready")}
                onTeam={() => setDesk("team")}
                onService={() => onOpen("service")}
                onReport={() => onOpen("service")}
                onOpenNight={(event) => {
                  if (tools.once(event, { type: "openNight" })) onOpen("service");
                }}
                onEndDay={(event) => tools.endDay(event, "rest")}
                onPotWash={(event) => tools.endDay(event, "potwash")}
              />
              <div className="ck-hub__grid">
                <div className="ck-hub__column">
                  {onBoard(tools)}
                  <WeekCard state={state} path={path} />
                  {money}
                </div>
                <div className="ck-hub__column">
                  <ReviewsWall restaurant={path} />
                  {orders(tools)}
                </div>
                <div className="ck-hub__column">
                  {practice(tools)}
                  {diary}
                  <ShopPanel state={state} onBuy={tools.buy} />
                </div>
              </div>
            </>
          ) : (
            <PathHero
              state={state}
              path={path}
              onPotWash={(event) => tools.endDay(event, "potwash")}
              onEndDay={(event) => tools.endDay(event, "rest")}
            />
          )}
          {path.kind === "truck" ? (
            <div className="ck-hub__grid">
              <div className="ck-hub__column">
                <FestivalMap
                  state={state}
                  truck={path}
                  onServe={() => setDesk("hatch")}
                  onService={() => onOpen("service")}
                />
              </div>
              <div className="ck-hub__column">
                <HatchCard truck={path} onMenu={() => setDesk("menu")} onReady={() => setDesk("ready")} />
                {onBoard(tools)}
                {money}
              </div>
              <div className="ck-hub__column">
                {orders(tools)}
                {practice(tools)}
                {diary}
                <ShopPanel state={state} onBuy={tools.buy} />
              </div>
            </div>
          ) : null}
          {path.kind === "tv" ? (
            <div className="ck-hub__grid">
              <div className="ck-hub__column">
                <SegmentDesk
                  state={state}
                  tv={path}
                  onPrepare={() => setDesk("prepare")}
                  onCueCards={() => setDesk("cues")}
                  onDrop={() => dispatch({ type: "dropSegment" })}
                />
                {onBoard(tools)}
                <LettersWall tv={path} />
              </div>
              <div className="ck-hub__column ck-hub__column--wide">
                <CookbookDesk
                  state={state}
                  tv={path}
                  onSign={(event) => {
                    if (tools.once(event, { type: "startBook" })) tools.toast("You signed the book deal!");
                  }}
                  onAddCard={setChapter}
                  onLaunch={(event) => {
                    if (tools.once(event, { type: "launchBook" })) onOpen("service");
                  }}
                  onService={() => onOpen("service")}
                />
                {money}
              </div>
              <div className="ck-hub__column">
                {orders(tools)}
                {practice(tools)}
                {diary}
                <ShopPanel state={state} onBuy={tools.buy} />
              </div>
            </div>
          ) : null}
          <p className="ck-safety ck-hub__safety">
            <Icon name="shield" size={14} /> Chef uses game numbers and pictures, not real recipes,
            temperatures or knife skills. Real cooking needs an adult.
          </p>
        </>
      )}
    </HubFrame>
  );
}
