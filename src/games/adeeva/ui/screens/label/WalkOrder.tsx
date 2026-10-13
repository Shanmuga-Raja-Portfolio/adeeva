import { type PointerEvent, useRef, useState } from "react";
import type { LabelSeason } from "../../../core";
import { skinHex } from "../../../../../ui/art/avatar/Avatar";
import { DressPreview } from "../../art/DressPreview";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { lookDress } from "./lookDress";
import { lookTitle } from "./lookTitle";
import { modelLook } from "./modelLook";
import { walkRole } from "./walkRole";

export interface WalkOrderProps {
  season: LabelSeason;
  order: readonly number[];
  strongest: readonly number[];
  onChange: (order: number[]) => void;
}

interface Drag {
  readonly position: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly dx: number;
  readonly dy: number;
  readonly target: number;
}

const TAP_SLOP = 8;

function moved(order: readonly number[], from: number, to: number): number[] {
  const next = [...order];
  const [item] = next.splice(from, 1);
  if (item === undefined) return next;
  next.splice(to, 0, item);
  return next;
}

function swapped(order: readonly number[], a: number, b: number): number[] {
  const next = [...order];
  const first = next[a];
  const second = next[b];
  if (first === undefined || second === undefined) return next;
  next[a] = second;
  next[b] = first;
  return next;
}

export function WalkOrder({ season, order, strongest, onChange }: WalkOrderProps) {
  const slots = useRef<(HTMLLIElement | null)[]>([]);
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const setDrag = (next: Drag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const [picked, setPickedState] = useState<number | null>(null);
  const pickedRef = useRef<number | null>(null);
  const setPicked = (next: number | null) => {
    pickedRef.current = next;
    setPickedState(next);
  };

  const slotAt = (x: number, y: number, fallback: number): number => {
    let best = fallback;
    let bestDistance = Number.POSITIVE_INFINITY;
    slots.current.forEach((element, index) => {
      if (element === null) return;
      const box = element.getBoundingClientRect();
      const distance = Math.hypot(box.left + box.width / 2 - x, box.top + box.height / 2 - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  };

  const handleDown = (event: PointerEvent<HTMLDivElement>, position: number) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button") !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      position,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      target: position,
    });
  };

  const dragAt = (current: Drag, event: PointerEvent<HTMLDivElement>): Drag => ({
    ...current,
    dx: event.clientX - current.startX,
    dy: event.clientY - current.startY,
    target: slotAt(event.clientX, event.clientY, current.position),
  });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(dragAt(current, event));
  };

  const handleUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = dragAt(current, event);
    const travelled = Math.hypot(final.dx, final.dy);
    setDrag(null);
    if (travelled < TAP_SLOP) {
      const chosen = pickedRef.current;
      if (chosen === null) setPicked(final.position);
      else {
        if (chosen !== final.position) onChange(swapped(order, chosen, final.position));
        setPicked(null);
      }
      return;
    }
    setPicked(null);
    if (final.target !== final.position) onChange(moved(order, final.position, final.target));
  };

  return (
    <ol className="ad-walk-order" aria-label="Walk order">
      {order.map((lookIndex, position) => {
        const look = season.looks[lookIndex] ?? null;
        if (look === null) return null;
        const dress = lookDress(look);
        const dragging = drag?.position === position && Math.hypot(drag.dx, drag.dy) >= TAP_SLOP;
        const targeted =
          drag !== null && dragging === false && drag.target === position && drag.position !== position;
        const classes = [
          "ad-walk-card",
          dragging ? "is-dragging" : "",
          targeted ? "is-target" : "",
          picked === position ? "is-picked" : "",
          strongest.includes(lookIndex) ? "is-strongest" : "",
        ]
          .filter((name) => name.length > 0)
          .join(" ");
        return (
          <li
            key={lookIndex}
            ref={(element) => {
              slots.current[position] = element;
            }}
            className="ad-walk-order__slot"
            data-testid={`walk-slot-${position + 1}`}
          >
            <span className="ad-walk-order__role">
              {position + 1}. {walkRole(position, order.length)}
            </span>
            <div
              className={classes}
              style={
                dragging && drag !== null
                  ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(2deg)` }
                  : undefined
              }
              onPointerDown={(event) => handleDown(event, position)}
              onPointerMove={handleMove}
              onPointerUp={handleUp}
              onPointerCancel={() => setDrag(null)}
              aria-label={`Look ${lookIndex + 1}, ${lookTitle(look)}, walking ${walkRole(position, order.length).toLowerCase()}`}
              role="group"
            >
              {strongest.includes(lookIndex) ? <span className="ad-walk-card__crown">Strongest</span> : null}
              <DressPreview
                parts={dress.parts}
                fabrics={dress.fabrics}
                trims={dress.trims}
                skinTone={skinHex(modelLook(look.runId, lookIndex))}
                title={`Look ${lookIndex + 1}`}
                className="ad-walk-card__art"
              />
              <span className="ad-walk-card__name">
                Look {lookIndex + 1} · {lookTitle(look)}
              </span>
              <span className="ad-walk-card__score">
                <StarRating stars={look.evaluation.stars} size={12} />
                {look.evaluation.score}
              </span>
              <span className="ad-walk-card__moves">
                <button
                  type="button"
                  className="ad-walk-card__move"
                  aria-label={`Move look ${lookIndex + 1} earlier`}
                  disabled={position === 0}
                  onClick={() => onChange(moved(order, position, position - 1))}
                >
                  ‹
                </button>
                <span className="ad-walk-card__grip" aria-hidden="true">
                  ⋮⋮
                </span>
                <button
                  type="button"
                  className="ad-walk-card__move"
                  aria-label={`Move look ${lookIndex + 1} later`}
                  disabled={position === order.length - 1}
                  onClick={() => onChange(moved(order, position, position + 1))}
                >
                  ›
                </button>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
