import { useState, type ReactNode } from "react";
import { useToast } from "../../../../../studio/ToastContext";
import { useDispatchOnce, type ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { UpgradeId } from "../../../content/upgrade";
import {
  currentBeat,
  orderDishIssue,
  practiceStartIssue,
  upgradeById,
  type Action,
  type GameState,
  type Gig,
} from "../../../core";
import type { PlayView } from "../../chefRoute";
import { SetAsideDialog } from "../SetAsideDialog";
import { StoryOverlay } from "../story/StoryOverlay";
import { daySummary, type DayEndKind } from "./daySummary";
import { DayTransition } from "./DayTransition";
import { DishChoiceDialog } from "./DishChoiceDialog";
import { HubTopBar } from "./HubTopBar";
import "./hub.css";

export interface HubTools {
  readonly once: (event: ClickLike, action: Action) => boolean;
  readonly startRun: (action: Action) => void;
  readonly endDay: (event: ClickLike, kind: DayEndKind) => void;
  readonly buy: (event: ClickLike, upgradeId: UpgradeId) => void;
  readonly pickPractice: () => void;
  readonly pickOrder: (gig: Gig) => void;
  readonly setAside: () => void;
  readonly toast: ReturnType<typeof useToast>;
}

export interface HubFrameProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onOpen: (view: PlayView) => void;
  readonly onOpenSettings: () => void;
  readonly onExitToTitle: () => void;
  readonly testId: string;
  readonly className?: string | undefined;
  readonly banner?: ReactNode;
  readonly readOnly?: boolean | undefined;
  readonly children: (tools: HubTools) => ReactNode;
  readonly overlays?: ((tools: HubTools) => ReactNode) | undefined;
}

type Picking =
  { readonly kind: "none" } | { readonly kind: "practice" } | { readonly kind: "order"; readonly gig: Gig };

export function HubFrame(props: HubFrameProps) {
  const { state, dispatch, onOpen } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const [ending, setEnding] = useState<{ readonly from: GameState; readonly kind: DayEndKind } | null>(null);
  const [picking, setPicking] = useState<Picking>({ kind: "none" });
  const [settingAside, setSettingAside] = useState(false);
  const beat = ending === null && props.readOnly !== true ? currentBeat(state) : null;
  const overlayOpen = ending !== null || beat !== null;
  const close = () => setPicking({ kind: "none" });
  const run = state.activeRun;
  const onBoard = run !== null && run.stage !== "done" ? run : null;

  const tools: HubTools = {
    once,
    toast,
    startRun: (action) => {
      if (dispatch(action)) {
        close();
        onOpen("dish");
      }
    },
    endDay: (event, kind) => {
      const from = state;
      if (once(event, { type: kind === "potwash" ? "potWash" : "endDay" })) setEnding({ from, kind });
    },
    buy: (event, upgradeId) => {
      if (once(event, { type: "buyUpgrade", upgradeId }))
        toast(`${upgradeById(upgradeId).name} is in your kit!`);
    },
    pickPractice: () => setPicking({ kind: "practice" }),
    pickOrder: (gig) => setPicking({ kind: "order", gig }),
    setAside: () => setSettingAside(true),
  };

  const confirmSetAside = () => {
    setSettingAside(false);
    if (dispatch({ type: "abandonRun" })) toast("The board is clear.", "info");
  };

  return (
    <div className={`ck-hub ad-screen ${props.className ?? ""}`} data-testid={props.testId}>
      {props.banner}
      <div className="ck-hub__content" inert={overlayOpen || props.readOnly === true}>
        <HubTopBar state={state} onOpenSettings={props.onOpenSettings} onExit={props.onExitToTitle} />
        <main className="ck-hub__main">{props.children(tools)}</main>
      </div>
      {props.overlays?.(tools)}
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
          selected[0] !== undefined && tools.startRun({ type: "startPractice", dishId: selected[0] })
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
          tools.startRun({ type: "startOrderDish", gigId: picking.gig.id, dishId: selected[0] })
        }
        onClose={close}
      />
      {ending !== null ? (
        <DayTransition summary={daySummary(ending.from, state, ending.kind)} onDone={() => setEnding(null)} />
      ) : null}
      {beat !== null ? <StoryOverlay state={state} dispatch={dispatch} /> : null}
      <SetAsideDialog
        open={settingAside}
        purpose={onBoard?.purpose.kind ?? null}
        onConfirm={confirmSetAside}
        onClose={() => setSettingAside(false)}
      />
    </div>
  );
}
