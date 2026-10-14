import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { CAREER } from "../../../content/career";
import type { DishId } from "../../../content/dish";
import {
  dishById,
  menuIssues,
  testDishIssues,
  testFor,
  type Action,
  type GameState,
  type ShiftOffer,
  type ShiftSetup,
} from "../../../core";
import type { PlayView } from "../../chefRoute";
import { CoachBubble } from "../CoachBubble";
import { BoardPanel } from "./BoardPanel";
import { CounterDialog } from "./CounterDialog";
import { CrossroadsCard } from "./CrossroadsCard";
import { DiaryCard } from "./DiaryCard";
import { DishChoiceDialog } from "./DishChoiceDialog";
import { HubFrame } from "./HubFrame";
import { HubHero } from "./HubHero";
import { MasteryPanel } from "./MasteryPanel";
import { OnBoardCard } from "./OnBoardCard";
import { OrdersPanel } from "./OrdersPanel";
import { PracticeCard } from "./PracticeCard";
import { ShiftDialog } from "./ShiftDialog";
import { ShopPanel } from "./ShopPanel";

interface KitchenHubProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
}

type Picking =
  | { readonly kind: "none" }
  | { readonly kind: "test" }
  | { readonly kind: "station" }
  | { readonly kind: "menu" }
  | { readonly kind: "shift"; readonly offer: ShiftOffer };

function coachLine(state: GameState): string {
  if (state.rung === "student")
    return "Your first lesson is pinned to the class board. Tap Start the lesson!";
  return "Pick a shift on the board. Tickets will start to arrive!";
}

export function KitchenHub(props: KitchenHubProps) {
  const { state, dispatch, onOpen } = props;
  const [picking, setPicking] = useState<Picking>({ kind: "none" });
  const close = () => setPicking({ kind: "none" });
  const startShift = (offerId: string, setup: ShiftSetup) => {
    if (dispatch({ type: "startShift", offerId, setup })) {
      close();
      onOpen("service");
    }
  };
  const onBoard = state.activeRun !== null && state.activeRun.stage !== "done";

  return (
    <HubFrame
      {...props}
      testId="kitchen-hub"
      overlays={(tools) => (
        <>
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
            onConfirm={(selected: readonly DishId[]) => {
              close();
              tools.startRun({
                type: "startTest",
                test: state.rung === "sous" ? "tasting" : "graduation",
                dishIds: selected,
              });
            }}
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
              if (dispatch({ type: "setMenu", dishIds: selected })) tools.toast("The menu is on the board!");
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
        </>
      )}
    >
      {(tools) => (
        <>
          <HubHero
            state={state}
            onPotWash={(event) => tools.endDay(event, "potwash")}
            onEndDay={(event) => tools.endDay(event, "rest")}
          />
          <CoachBubble show={state.guide && state.diary.length === 0 && !onBoard} text={coachLine(state)} />
          <div className="ck-hub__grid">
            <div className="ck-hub__column">
              <BoardPanel
                state={state}
                onStartLesson={(event) => {
                  if (tools.once(event, { type: "startLesson" })) onOpen("dish");
                }}
                onDeclineLesson={(event) => {
                  if (tools.once(event, { type: "declineLesson" }))
                    tools.toast("You can practise instead. A new lesson comes tomorrow.", "info");
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
                  if (tools.once(event, { type: "startNextTestDish" })) onOpen("dish");
                }}
                onOpenService={() => onOpen("service")}
              />
              {state.rung === "head" ? (
                <>
                  <CrossroadsCard state={state} onVisit={() => onOpen("crossroads")} />
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
                      if (tools.once(event, { type: "acceptOffer", offerId })) tools.toast("Order accepted!");
                    }}
                    onDecline={(event, offerId) => {
                      if (tools.once(event, { type: "declineOffer", offerId }))
                        tools.toast("You kindly passed on that order.", "info");
                    }}
                    onCook={tools.pickOrder}
                  />
                </>
              ) : null}
            </div>
            <div className="ck-hub__column">
              <OnBoardCard state={state} onBack={() => onOpen("dish")} onSetAside={tools.setAside} />
              <PracticeCard
                onPick={tools.pickPractice}
                lead="Cook any dish you've unlocked, just for the joy of it. Great on Family Meal days."
              />
              <MasteryPanel state={state} />
            </div>
            <div className="ck-hub__column">
              <DiaryCard state={state} dispatch={dispatch} onOpen={() => onOpen("diary")} />
              <ShopPanel state={state} onBuy={tools.buy} />
            </div>
          </div>
          <p className="ck-safety ck-hub__safety">
            <Icon name="shield" size={14} /> Chef uses game numbers and pictures, not real recipes,
            temperatures or knife skills. Real cooking needs an adult.
          </p>
        </>
      )}
    </HubFrame>
  );
}
