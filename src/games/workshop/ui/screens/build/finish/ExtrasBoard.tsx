import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { clampPose, poseOf } from "../../../../../../engine/placedPose";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import { Button } from "../../../../../../ui/kit/Button";
import { EXTRAS, type ExtraId } from "../../../../content/extra";
import type { WoodId } from "../../../../content/wood";
import {
  EXTRA_ROTATION_STEP,
  FINISH_CANVAS,
  extraFits,
  extraTallies,
  woodById,
  type Action,
  type CommissionRun,
} from "../../../../core";
import { ExtraArt } from "../../../art/ExtraArt";
import { PiecePreview } from "../../../art/PiecePreview";
import type { PieceLook } from "../../../art/pieceLook";
import { woodLook } from "../../../art/woodLook";

interface ExtrasBoardProps {
  readonly run: CommissionRun;
  readonly woodId: WoodId;
  readonly look: PieceLook;
  readonly piece: number;
  readonly coins: number;
  readonly dispatch: (action: Action) => boolean;
  readonly onHint: (text: string) => void;
}

type Drag =
  | {
      readonly kind: "new";
      readonly extraId: ExtraId;
      readonly x: number;
      readonly y: number;
      readonly clientX: number;
      readonly clientY: number;
      readonly moved: boolean;
    }
  | {
      readonly kind: "move";
      readonly placedId: string;
      readonly x: number;
      readonly y: number;
      readonly dx: number;
      readonly dy: number;
      readonly moved: boolean;
    };

const DROP_SPOTS: readonly (readonly [number, number])[] = [
  [200, 190],
  [160, 200],
  [240, 200],
  [200, 150],
  [150, 160],
  [250, 160],
];

export function ExtrasBoard({ run, woodId, look, piece, coins, dispatch, onHint }: ExtrasBoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const finishRef = useRef<(drag: Drag) => void>(() => undefined);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const tallies = extraTallies(run).filter((tally) => tally.piece === null || tally.piece === piece);
  const woodHex = woodLook(woodId).base;
  const onPiece = run.extras.filter((placed) => placed.piece === piece);
  const chosen = onPiece.find((placed) => placed.id === selected);

  const toCanvas = (clientX: number, clientY: number) => {
    const svg = wrapRef.current?.querySelector("svg") ?? null;
    return clientToSvg(svg, clientX, clientY);
  };

  const inCanvas = (x: number, y: number) =>
    x >= 0 && y >= 0 && x <= FINISH_CANVAS.width && y <= FINISH_CANVAS.height;

  useEffect(() => {
    finishRef.current = (finished: Drag) => {
      if (finished.kind === "new") {
        if (finished.moved && !inCanvas(finished.x, finished.y)) return;
        const spot = DROP_SPOTS[onPiece.length % DROP_SPOTS.length] ?? [200, 190];
        const [x, y] = finished.moved ? [finished.x, finished.y] : spot;
        const action: Action = {
          type: "addExtra",
          extraId: finished.extraId,
          x: Math.round(x),
          y: Math.round(y),
          piece,
        };
        if (!dispatch(action)) onHint("Not enough coins for that one.");
        else setSelected(`extra-${run.nextExtraNumber}`);
        return;
      }
      const placed = run.extras.find((entry) => entry.id === finished.placedId);
      if (placed === undefined) return;
      if (!finished.moved) {
        dispatch({ type: "removeExtra", placedId: placed.id });
        setSelected(null);
        onHint("Back in the tin.");
        return;
      }
      const pose = clampPose(FINISH_CANVAS, {
        ...poseOf(placed),
        x: finished.x - finished.dx,
        y: finished.y - finished.dy,
      });
      dispatch({ type: "moveExtra", placedId: placed.id, ...pose });
      setSelected(placed.id);
    };
  });

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      const point = toCanvas(event.clientX, event.clientY);
      if (current === null || point === null) return;
      const travelled =
        current.kind === "new"
          ? Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) > 6
          : Math.hypot(point.x - current.dx - current.x, point.y - current.dy - current.y) > 3;
      const next = { ...current, x: point.x, y: point.y, moved: current.moved || travelled } as Drag;
      dragRef.current = next;
      setDrag(next);
    };
    const up = () => {
      const finished = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (finished !== null) finishRef.current(finished);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  const begin = (next: Drag) => {
    dragRef.current = next;
    setDrag(next);
  };

  const startNew = (event: ReactPointerEvent, extraId: ExtraId) => {
    event.preventDefault();
    const point = toCanvas(event.clientX, event.clientY);
    begin({
      kind: "new",
      extraId,
      x: point?.x ?? -1,
      y: point?.y ?? -1,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
    });
  };

  const startMove = (event: ReactPointerEvent, placedId: string, x: number, y: number) => {
    event.preventDefault();
    event.stopPropagation();
    const point = toCanvas(event.clientX, event.clientY);
    if (point === null) return;
    begin({ kind: "move", placedId, x: point.x, y: point.y, dx: point.x - x, dy: point.y - y, moved: false });
  };

  const adjust = (change: { rotation?: number; scale?: number }) => {
    if (chosen === undefined) return;
    const rotation = (((chosen.rotation + (change.rotation ?? 0)) % 360) + 360) % 360;
    const scale = Math.round(Math.min(2, Math.max(0.5, chosen.scale + (change.scale ?? 0))) * 100) / 100;
    dispatch({ type: "moveExtra", placedId: chosen.id, ...poseOf(chosen), rotation, scale });
  };

  const moving = drag?.kind === "move" ? drag : null;
  return (
    <div className="ww-extras">
      <div className="ww-extras__stage" ref={wrapRef} data-testid="finish-canvas">
        <PiecePreview
          look={{
            ...look,
            extras: look.extras.filter((placed) => placed.id !== moving?.placedId || !moving.moved),
          }}
          title="Your piece with its finish"
          className="ww-extras__art"
        >
          {onPiece.map((placed) => (
            <circle
              key={placed.id}
              cx={placed.x}
              cy={placed.y}
              r={Math.max(22, 18 * placed.scale)}
              className={
                placed.id === selected ? "ww-extras__hit ww-extras__hit--selected" : "ww-extras__hit"
              }
              onPointerDown={(event) => startMove(event, placed.id, placed.x, placed.y)}
              data-testid={`placed-${placed.extraId}`}
            />
          ))}
          {moving !== null && moving.moved
            ? (() => {
                const placed = run.extras.find((entry) => entry.id === moving.placedId);
                return placed === undefined ? null : (
                  <g
                    transform={`translate(${moving.x - moving.dx} ${moving.y - moving.dy}) rotate(${placed.rotation}) scale(${placed.scale})`}
                    pointerEvents="none"
                  >
                    <ExtraArt extraId={placed.extraId} woodHex={woodHex} plaque={look.plaque} />
                  </g>
                );
              })()
            : null}
          {drag?.kind === "new" && drag.moved && inCanvas(drag.x, drag.y) ? (
            <g transform={`translate(${drag.x} ${drag.y})`} pointerEvents="none" opacity={0.8}>
              <ExtraArt extraId={drag.extraId} woodHex={woodHex} plaque={look.plaque} />
            </g>
          ) : null}
        </PiecePreview>
        {chosen !== undefined ? (
          <div className="ww-extras__controls" role="group" aria-label="Adjust the chosen extra">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => adjust({ rotation: -EXTRA_ROTATION_STEP })}
              aria-label="Turn left"
            >
              ⟲
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => adjust({ rotation: EXTRA_ROTATION_STEP })}
              aria-label="Turn right"
            >
              ⟳
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => adjust({ scale: -0.25 })}
              aria-label="Smaller"
            >
              −
            </Button>
            <Button variant="secondary" size="sm" onClick={() => adjust({ scale: 0.25 })} aria-label="Bigger">
              +
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "removeExtra", placedId: chosen.id }) && setSelected(null)}
            >
              Back to the tin
            </Button>
          </div>
        ) : null}
      </div>
      <div className="ww-extras__tin" aria-label="Knobs and extras tin">
        <h3 className="ww-extras__title">Knobs &amp; extras</h3>
        <ul>
          {EXTRAS.filter((extra) => extraFits(run, extra.id, piece)).map((extra) => {
            const tally = tallies.find((entry) => entry.extra === extra.id);
            return (
              <li key={extra.id}>
                <button
                  type="button"
                  className={
                    tally === undefined ? "ww-extras__item" : "ww-extras__item ww-extras__item--needed"
                  }
                  onPointerDown={(event) => startNew(event, extra.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      finishRef.current({
                        kind: "new",
                        extraId: extra.id,
                        x: -1,
                        y: -1,
                        clientX: 0,
                        clientY: 0,
                        moved: false,
                      });
                    }
                  }}
                  disabled={extra.price > coins}
                  aria-label={`${extra.name}, ${extra.price} coins. Drag it onto the piece.`}
                  data-testid={`extra-${extra.id}`}
                >
                  <svg viewBox="-20 -20 40 40" aria-hidden="true">
                    <ExtraArt
                      extraId={extra.id}
                      woodHex={woodHex}
                      plaque={extra.id === "name-plaque" ? look.plaque.slice(0, 6) : ""}
                    />
                  </svg>
                  <span className="ww-extras__name">{extra.name}</span>
                  <span className="ww-extras__price">{extra.price}</span>
                  {tally !== undefined ? (
                    <span className="ww-extras__need">
                      {Math.min(tally.placed, tally.needed)}/{tally.needed}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="ww-muted ww-extras__note">
          Wooden knobs match your {woodById(woodId).name.toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
