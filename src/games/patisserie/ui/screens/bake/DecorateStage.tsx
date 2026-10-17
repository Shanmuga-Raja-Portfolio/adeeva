import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  clampPose,
  MAX_PLACED_SCALE,
  MIN_PLACED_SCALE,
  poseOf,
  samePose,
  type PlacedPose,
} from "../../../../../engine/placedPose";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { TOPPINGS, type ToppingId } from "../../../content/topping";
import {
  availableToppings,
  CAKE_CANVAS,
  ROTATION_STEP,
  toppingById,
  type PlacedTopping,
} from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { BenchScene } from "../../art/BenchScene";
import { bakeLook } from "../../art/bakeLook";
import { TOPPING_EXTENT, ToppingBadge } from "../../art/ToppingArt";
import { PantryDialog } from "./PantryDialog";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./decorate.css";

interface PoseDrag {
  readonly id: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly origin: PlacedPose;
  readonly pose: PlacedPose;
  readonly moved: boolean;
}

interface TrayDrag {
  readonly toppingId: ToppingId;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

const DROP_SPOT = { x: 200, y: 190 } as const;
const MOVE_THRESHOLD = 6;
const KEY_NUDGE = 8;
const NUDGES: Readonly<Record<string, { readonly x: number; readonly y: number }>> = {
  ArrowLeft: { x: -KEY_NUDGE, y: 0 },
  ArrowRight: { x: KEY_NUDGE, y: 0 },
  ArrowUp: { x: 0, y: -KEY_NUDGE },
  ArrowDown: { x: 0, y: KEY_NUDGE },
};

function snapRotation(rotation: number): number {
  return Math.round(rotation / ROTATION_STEP) * ROTATION_STEP;
}

export function DecorateStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const cakeRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<PoseDrag | null>(null);
  const [tray, setTray] = useState<TrayDrag | null>(null);
  const [pantryOpen, setPantryOpen] = useState(false);
  const focusAfter = useRef<string | null>(null);
  const svg = () => cakeRef.current?.querySelector<SVGSVGElement>(".pa-decorate__art") ?? null;

  useEffect(() => {
    const wanted = focusAfter.current;
    if (wanted === null) return;
    focusAfter.current = null;
    const root = cakeRef.current?.closest(".pa-decorate");
    const target =
      root?.querySelector<SVGElement | HTMLElement>(`[data-topping="${wanted}"]`) ??
      root?.querySelector<HTMLElement>(".pa-topping-tile:not(:disabled)") ??
      null;
    target?.focus();
  });
  const toppings: PlacedTopping[] = run.toppings.map((topping) =>
    drag !== null && drag.id === topping.id ? { ...topping, ...drag.pose } : topping,
  );
  const look = bakeLook(run.design, toppings, true);
  const selected = toppings.find((topping) => topping.id === selectedId);
  if (look === null) return null;

  const putBack = (topping: PlacedTopping) => {
    const others = run.toppings.filter((entry) => entry.id !== topping.id);
    dispatch({ type: "removeTopping", toppingId: topping.id });
    setSelectedId(null);
    focusAfter.current = others[others.length - 1]?.id ?? "tray";
  };

  const toppingKey = (event: KeyboardEvent<SVGElement>, topping: PlacedTopping) => {
    const nudge = NUDGES[event.key];
    if (nudge !== undefined) {
      event.preventDefault();
      setSelectedId(topping.id);
      update(topping, { x: topping.x + nudge.x, y: topping.y + nudge.y });
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedId(selectedId === topping.id ? null : topping.id);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      putBack(topping);
    }
  };

  const addFromKeys = (toppingId: ToppingId, left: number) => {
    const before = run.nextToppingNumber;
    addAt(toppingId, null);
    if (left > 1) return;
    const next = TOPPINGS.find(
      (topping) => topping.id !== toppingId && availableToppings(state, topping.id) > 0,
    );
    focusAfter.current = next === undefined ? `topping-${before}` : `tile-${next.id}`;
  };

  const update = (topping: PlacedTopping, change: Partial<PlacedPose>) => {
    const pose = clampPose(CAKE_CANVAS, { ...poseOf(topping), ...change });
    dispatch({ type: "moveTopping", toppingId: topping.id, ...pose, rotation: snapRotation(pose.rotation) });
  };

  const addAt = (toppingId: ToppingId, point: { readonly x: number; readonly y: number } | null) => {
    const spot = point ?? {
      x: DROP_SPOT.x + ((run.toppings.length % 5) - 2) * 26,
      y: DROP_SPOT.y + (run.toppings.length % 3) * 22,
    };
    const added = dispatch({ type: "addTopping", toppingId, x: Math.round(spot.x), y: Math.round(spot.y) });
    if (added) setSelectedId(`topping-${run.nextToppingNumber}`);
  };

  const beginPose = (event: PointerEvent<SVGElement>, topping: PlacedTopping) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const origin = poseOf(topping);
    setDrag({
      id: topping.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      pose: origin,
      moved: false,
    });
  };

  const poseAt = (current: PoseDrag, event: PointerEvent<SVGElement>): PoseDrag => {
    const start = clientToSvg(svg(), current.startX, current.startY);
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    if (start === null || point === null) return current;
    const moved =
      current.moved ||
      Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > MOVE_THRESHOLD;
    const pose = clampPose(CAKE_CANVAS, {
      ...current.origin,
      x: current.origin.x + point.x - start.x,
      y: current.origin.y + point.y - start.y,
    });
    return { ...current, pose, moved };
  };

  const endPose = (event: PointerEvent<SVGElement>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const final = poseAt(drag, event);
    setDrag(null);
    if (!final.moved) {
      dispatch({ type: "removeTopping", toppingId: final.id });
      setSelectedId(null);
      return;
    }
    setSelectedId(final.id);
    if (!samePose(final.pose, final.origin))
      dispatch({ type: "moveTopping", toppingId: final.id, ...final.pose });
  };

  const trayDown = (event: PointerEvent<HTMLButtonElement>, toppingId: ToppingId) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setTray({
      toppingId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    });
  };
  const trayMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (tray === null || tray.pointerId !== event.pointerId) return;
    const moved =
      tray.moved || Math.hypot(event.clientX - tray.startX, event.clientY - tray.startY) > MOVE_THRESHOLD;
    setTray({ ...tray, x: event.clientX, y: event.clientY, moved });
  };
  const trayUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (tray === null || tray.pointerId !== event.pointerId) return;
    const current = tray;
    setTray(null);
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    const onCake =
      point !== null &&
      point.x >= 0 &&
      point.x <= CAKE_CANVAS.width &&
      point.y >= 0 &&
      point.y <= CAKE_CANVAS.height;
    if (current.moved && !onCake) return;
    addAt(current.toppingId, current.moved && point !== null ? point : null);
  };

  const required = run.brief?.requiredToppings ?? [];
  const trayRank = (toppingId: ToppingId): number =>
    availableToppings(state, toppingId) > 0
      ? 2
      : run.toppings.some((entry) => entry.toppingId === toppingId)
        ? 1
        : 0;
  const trayOrder = [...TOPPINGS].sort((a, b) => trayRank(b.id) - trayRank(a.id));
  const onTray = trayOrder.filter((topping) => trayRank(topping.id) > 0);
  const soldOut = trayOrder.filter((topping) => trayRank(topping.id) === 0);
  return (
    <div className="pa-decorate">
      <aside className="pa-decorate__tray pa-doily" aria-label="Topping tray">
        <header>
          <strong>Topping tray</strong>
          <span className="pa-muted">Drag onto the bake</span>
        </header>
        <div className="pa-decorate__grid">
          {onTray.map((topping) => {
            const left = availableToppings(state, topping.id);
            const onBake = run.toppings.filter((entry) => entry.toppingId === topping.id).length;
            return (
              <button
                key={topping.id}
                type="button"
                className={
                  left > 0
                    ? "pa-topping-tile"
                    : onBake > 0
                      ? "pa-topping-tile pa-topping-tile--empty pa-topping-tile--placed"
                      : "pa-topping-tile pa-topping-tile--empty"
                }
                disabled={left <= 0}
                onPointerDown={(event) => trayDown(event, topping.id)}
                onPointerMove={trayMove}
                onPointerUp={trayUp}
                onPointerCancel={() => setTray(null)}
                onClick={(event) => {
                  if (event.detail === 0) addFromKeys(topping.id, left);
                }}
                aria-label={`${topping.name}, ${left} left`}
                data-testid={`topping-${topping.id}`}
                data-topping={`tile-${topping.id}`}
              >
                <span className="pa-topping-tile__plate" aria-hidden="true">
                  <ToppingBadge toppingId={topping.id} size={54} />
                </span>
                <span className="pa-topping-tile__name">{topping.name}</span>
                <span
                  className={
                    left <= 0 && onBake > 0
                      ? "pa-topping-tile__count pa-topping-tile__count--placed"
                      : "pa-topping-tile__count"
                  }
                >
                  {left > 0 ? `${left} left` : onBake > 0 ? `${onBake} placed` : "0 left"}
                </span>
              </button>
            );
          })}
        </div>
        {soldOut.length > 0 ? (
          <p className="pa-decorate__out">
            <Icon name="bag" size={16} /> {soldOut.length} more{" "}
            {soldOut.length === 1 ? "topping waits" : "toppings wait"} in the pantry.
          </p>
        ) : null}
        {required.length > 0 ? (
          <ul className="pa-decorate__wants">
            {required.map((requirement) => {
              const placed = run.toppings.filter((entry) => entry.toppingId === requirement.topping).length;
              return (
                <li
                  key={requirement.topping}
                  className={placed >= requirement.count ? "pa-decorate__want--met" : undefined}
                >
                  {toppingById(requirement.topping).name}: {Math.min(placed, requirement.count)}/
                  {requirement.count}
                </li>
              );
            })}
          </ul>
        ) : null}
        <Button variant="secondary" size="sm" icon="bag" onClick={() => setPantryOpen(true)}>
          Quick pantry trip
        </Button>
      </aside>
      <div className="pa-decorate__cake" ref={cakeRef} onPointerDown={() => setSelectedId(null)}>
        <BenchScene className="pa-bench-scene" />
        <BakePreview
          look={look}
          title="Your bake with toppings"
          selectedToppingId={selected?.id}
          className="pa-decorate__art"
          plaque={run.word}
        >
          <g>
            {[...toppings]
              .sort((a, b) => a.layer - b.layer)
              .map((topping) => (
                <circle
                  key={topping.id}
                  cx={topping.x}
                  cy={topping.y}
                  r={(TOPPING_EXTENT / 2 + 6) * topping.scale}
                  fill="transparent"
                  className="pa-decorate__hit"
                  onPointerDown={(event) => beginPose(event, topping)}
                  onPointerMove={(event) => {
                    if (drag !== null && drag.pointerId === event.pointerId) setDrag(poseAt(drag, event));
                  }}
                  onPointerUp={endPose}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(event) => toppingKey(event, topping)}
                  onFocus={() => setSelectedId(topping.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={topping.id === selected?.id}
                  aria-label={`${toppingById(topping.toppingId).name} on the bake. Arrow keys move it, Delete puts it back.`}
                  data-topping={topping.id}
                />
              ))}
          </g>
        </BakePreview>
        {selected !== undefined ? (
          <div
            className="pa-decorate__controls"
            aria-label={`${toppingById(selected.toppingId).name} controls`}
          >
            <Button
              variant="secondary"
              size="sm"
              aria-label="Turn left"
              onClick={() => update(selected, { rotation: selected.rotation - ROTATION_STEP })}
            >
              ↺
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Turn right"
              onClick={() => update(selected, { rotation: selected.rotation + ROTATION_STEP })}
            >
              ↻
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Smaller"
              disabled={selected.scale <= MIN_PLACED_SCALE}
              onClick={() => update(selected, { scale: selected.scale - 0.1 })}
            >
              −
            </Button>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Bigger"
              disabled={selected.scale >= MAX_PLACED_SCALE}
              onClick={() => update(selected, { scale: selected.scale + 0.1 })}
            >
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={() => putBack(selected)}>
              Put back
            </Button>
          </div>
        ) : null}
      </div>
      {tray !== null && tray.moved ? (
        <div
          className="pa-drag-ghost pa-drag-ghost--topping"
          style={{ transform: `translate(${tray.x - 32}px, ${tray.y - 32}px)` }}
          aria-hidden="true"
        >
          <ToppingBadge toppingId={tray.toppingId} size={64} />
        </div>
      ) : null}
      <PantryDialog
        open={pantryOpen}
        onClose={() => setPantryOpen(false)}
        state={state}
        run={run}
        dispatch={dispatch}
      />
      <StageFooter
        {...props}
        ready={
          required.every(
            (requirement) =>
              run.toppings.filter((entry) => entry.toppingId === requirement.topping).length >=
              requirement.count,
          )
            ? "Gorgeous! Let's box it up."
            : "The order card asks for more toppings. Add them, or box it up as it is."
        }
      />
    </div>
  );
}
