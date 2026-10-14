import { useState } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import type { DishId } from "../../../content/dish";
import type { UpgradeId } from "../../../content/upgrade";
import {
  currentBeat,
  dishById,
  menuIssues,
  orderDishIssue,
  practiceStartIssue,
  testDishIssues,
  testFor,
  upgradeById,
  type Action,
  type GameState,
  type Gig,
  type ShiftOffer,
  type ShiftSetup,
} from "../../../core";
import { PlateArt } from "../../art/PlateArt";
import type { PlayView } from "../../chefRoute";
import { CoachBubble } from "../CoachBubble";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { BoardPanel } from "./BoardPanel";
import { CounterDialog } from "./CounterDialog";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { DishChoiceDialog } from "./DishChoiceDialog";
import { HubHero } from "./HubHero";
import { HubTopBar } from "./HubTopBar";
import { MasteryPanel } from "./MasteryPanel";
import { OrdersPanel } from "./OrdersPanel";
import { ShiftDialog } from "./ShiftDialog";
import { ShopPanel } from "./ShopPanel";
import "./hub.css";

interface KitchenHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

type Picking =
  | { readonly kind: "none" }
  | { readonly kind: "practice" }
  | { readonly kind: "order"; readonly gig: Gig }
  | { readonly kind: "test" }
  | { readonly kind: "station" }
  | { readonly kind: "menu" }
  | { readonly kind: "shift"; readonly offer: ShiftOffer };

function coachLine(state: GameState): string {
  if (state.rung === "student")
    return "Your first lesson is pinned to the class board. Tap Start the lesson!";
  return "Pick a shift on the board. Tickets will start to arrive!";
}

export function KitchenHub({ state, dispatch, onOpen, onOpenSettings, onExitToTitle }: KitchenHubProps) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [picking, setPicking] = useState<Picking>({ kind: "none" });
  const [settingAside, setSettingAside] = useState(false);
  const run = state.activeRun;
  const onBoard = run !== null && run.stage !== "done" ? run : null;
  const beat = ending === null ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
  const close = () => setPicking({ kind: "none" });

  const startRun = (action: Action) => {
    if (dispatch(action)) {
      close();
      onOpen("dish");
    }
  };
  const endDay = (event: ClickLike, kind: DayEndKind) => {
    const from = state;
    if (once(event, { type: kind === "potwash" ? "potWash" : "endDay" })) setEnding({ from, kind });
  };
  const buy = (event: ClickLike, upgradeId: UpgradeId) => {
    if (once(event, { type: "buyUpgrade", upgradeId }))
      toast(`${upgradeById(upgradeId).name} is in your kit!`);
  };
  const startShift = (offerId: string, setup: ShiftSetup) => {
    if (dispatch({ type: "startShift", offerId, setup })) {
      close();
      onOpen("service");
    }
  };
  const setAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The board is clear.", "info");
  };
  const latest = state.diary.slice(-3).reverse();

  return (
    <div className="ck-hub ad-screen" data-testid="kitchen-hub">
      <div className="ck-hub__content" inert={overlayOpen}>
        <HubTopBar state={state} onOpenSettings={onOpenSettings} onExit={onExitToTitle} />
        <main className="ck-hub__main">
          <HubHero
            state={state}
            onPotWash={(event) => endDay(event, "potwash")}
            onEndDay={(event) => endDay(event, "rest")}
          />
          <CoachBubble
            show={state.guide && state.diary.length === 0 && onBoard === null}
            text={coachLine(state)}
          />
          <div className="ck-hub__grid">
            <div className="ck-hub__column">
              <BoardPanel
                state={state}
                onStartLesson={(event) => {
                  if (once(event, { type: "startLesson" })) onOpen("dish");
                }}
                onDeclineLesson={(event) => {
                  if (once(event, { type: "declineLesson" }))
                    toast("You can practise instead. A new lesson comes tomorrow.", "info");
                }}
                onPickShift={(offer) =>
                  state.rung === "line"
                    ? startShift(offer.id, { special: null, helpers: [] })
                    : setPicking({ kind: "shift", offer })
                }
                onTakeTest={() =>
                  setPicking({ kind: testFor(state.rung) === "station" ? "station" : "test" })
                }
                onNextTestDish={(event) => {
                  if (once(event, { type: "startNextTestDish" })) onOpen("dish");
                }}
                onOpenService={() => onOpen("service")}
              />
              {state.rung === "head" ? (
                <>
                  <Card
                    title="Your menu"
                    eyebrow={`${state.menu.length} of ${CAREER.menuSize} dishes`}
                    className="ck-panel"
                  >
                    {state.menu.length === 0 ? (
                      <p className="ck-muted">
                        Write a {CAREER.menuSize}-dish menu before tonight's service.
                      </p>
                    ) : (
                      <ul className="ck-menu-list">
                        {state.menu.map((id) => (
                          <li key={id} className="ck-chalk">
                            {dishById(id).name}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="secondary"
                      block
                      icon="palette"
                      onClick={() => setPicking({ kind: "menu" })}
                      data-testid="write-menu"
                    >
                      Write the menu
                    </Button>
                  </Card>
                  <OrdersPanel
                    state={state}
                    onAccept={(event, offerId) => {
                      if (once(event, { type: "acceptOffer", offerId })) toast("Order accepted!");
                    }}
                    onDecline={(event, offerId) => {
                      if (once(event, { type: "declineOffer", offerId }))
                        toast("You kindly passed on that order.", "info");
                    }}
                    onCook={(gig) => setPicking({ kind: "order", gig })}
                  />
                </>
              ) : null}
            </div>
            <div className="ck-hub__column">
              {onBoard !== null ? (
                <Card
                  tone="gold"
                  eyebrow="On the board"
                  title={dishById(onBoard.dishId).name}
                  className="ck-panel"
                >
                  <div className="ck-hub__on-board">
                    <Button icon="sparkle" onClick={() => onOpen("dish")} data-testid="back-to-dish">
                      Back to the board
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSettingAside(true)}>
                      Set aside
                    </Button>
                  </div>
                </Card>
              ) : null}
              <Card
                title="Practice kitchen"
                eyebrow={`${CAREER.dishHours} hours · no pay`}
                className="ck-panel"
              >
                <p className="ck-muted">
                  Cook any dish you've unlocked, just for the joy of it. Great on Family Meal days.
                </p>
                <Button
                  variant="secondary"
                  block
                  icon="heart"
                  onClick={() => setPicking({ kind: "practice" })}
                  data-testid="practice"
                >
                  Practise a dish
                </Button>
              </Card>
              <MasteryPanel state={state} />
            </div>
            <div className="ck-hub__column">
              <Card
                title="Dish Diary"
                eyebrow={`${state.diary.length} ${state.diary.length === 1 ? "plate" : "plates"} kept`}
                className="ck-panel"
              >
                {latest.length > 0 ? (
                  <div className="ck-diary-peek" aria-hidden="true">
                    {latest.map((entry) => (
                      <PlateArt
                        key={entry.id}
                        colour={entry.plateColour}
                        components={entry.components}
                        title={null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="ck-muted">Every plate you send out is kept here.</p>
                )}
                <Button
                  variant="secondary"
                  block
                  icon="star"
                  onClick={() => onOpen("diary")}
                  data-testid="open-diary"
                >
                  Open the Dish Diary
                </Button>
                <ToggleSwitch
                  label="Kitchen coach"
                  description="Little hints on your first dishes."
                  checked={state.guide}
                  onChange={(on) => dispatch({ type: "setGuide", on })}
                />
              </Card>
              <ShopPanel state={state} onBuy={buy} />
            </div>
          </div>
          <p className="ck-safety ck-hub__safety">
            <Icon name="shield" size={14} /> Chef uses game numbers and pictures, not real recipes,
            temperatures or knife skills. Real cooking needs an adult.
          </p>
        </main>
      </div>
      <DishChoiceDialog
        state={state}
        open={picking.kind === "practice"}
        title="Practice kitchen"
        lead="Pick any dish you've unlocked."
        max={1}
        initial={[]}
        confirmLabel="Start cooking"
        issue={(selected) =>
          selected[0] === undefined ? "Pick a dish." : practiceStartIssue(state, selected[0])
        }
        onConfirm={(selected) =>
          selected[0] !== undefined && startRun({ type: "startPractice", dishId: selected[0] })
        }
        onClose={close}
      />
      <DishChoiceDialog
        state={state}
        open={picking.kind === "order"}
        title="Cook for this order"
        lead={picking.kind === "order" ? picking.gig.brief.occasion : ""}
        max={1}
        initial={
          picking.kind === "order" && picking.gig.brief.dishId !== null ? [picking.gig.brief.dishId] : []
        }
        confirmLabel="Start cooking"
        allowed={(dish) =>
          picking.kind === "order" &&
          (picking.gig.brief.dishId === null || picking.gig.brief.dishId === dish.id) &&
          !state.orderDishes.some((entry) => entry.gigId === picking.gig.id && entry.dishId === dish.id)
        }
        issue={(selected) =>
          picking.kind !== "order" || selected[0] === undefined
            ? "Pick a dish."
            : orderDishIssue(state, picking.gig.id, selected[0])
        }
        onConfirm={(selected) =>
          picking.kind === "order" &&
          selected[0] !== undefined &&
          startRun({ type: "startOrderDish", gigId: picking.gig.id, dishId: selected[0] })
        }
        onClose={close}
      />
      <DishChoiceDialog
        state={state}
        open={picking.kind === "test"}
        title={state.rung === "sous" ? "Tasting Day" : "Graduation Practical"}
        lead={
          state.rung === "sous"
            ? "Pick a small plate, a main and a side, each from a different kitchen."
            : "Pick three dishes from three different cuisines. You'll cook them one after another."
        }
        max={3}
        initial={[]}
        confirmLabel="Begin the test"
        issue={(selected) => testDishIssues(state, selected)[0] ?? null}
        onConfirm={(selected: readonly DishId[]) =>
          startRun({
            type: "startTest",
            test: state.rung === "sous" ? "tasting" : "graduation",
            dishIds: selected,
          })
        }
        onClose={close}
      />
      <DishChoiceDialog
        state={state}
        open={picking.kind === "menu"}
        title="Write the menu"
        lead="Six dishes for the Hall. A mix of kitchens and tastes keeps guests happy."
        max={CAREER.menuSize}
        initial={state.menu}
        confirmLabel="Chalk it up"
        issue={(selected) => menuIssues(state, selected)[0] ?? null}
        onConfirm={(selected) => {
          if (dispatch({ type: "setMenu", dishIds: selected })) toast("The menu is on the board!");
          close();
        }}
        onClose={close}
      />
      <CounterDialog
        state={state}
        open={picking.kind === "station"}
        onStart={(cuisine) => {
          if (dispatch({ type: "startStationTest", cuisine })) {
            close();
            onOpen("service");
          }
        }}
        onClose={close}
      />
      <ShiftDialog
        state={state}
        offer={picking.kind === "shift" ? picking.offer : null}
        onStart={startShift}
        onClose={close}
      />
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog
        open={settingAside}
        test={onBoard?.purpose.kind === "test"}
        onConfirm={setAside}
        onClose={() => setSettingAside(false)}
      />
    </div>
  );
}
