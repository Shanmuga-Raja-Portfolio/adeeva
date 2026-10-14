import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { polygonBounds } from "../../../../../engine/geometry/polygonPlacement";
import type { Rotation } from "../../../../../engine/geometry/rotation";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg, isInsideElement } from "../../../../../ui/kit/clientToSvg";
import { HINTS } from "../../../content/hints";
import type { PartDef } from "../../../content/product";
import type { StockSizeId } from "../../../content/stockSize";
import {
  designInput,
  freeSpot,
  partOutline,
  placedPart,
  placementIssue,
  planSheets,
  productById,
  stockSizeById,
  type Placement,
} from "../../../core";
import { metalLook } from "../../art/metalLook";
import { outlinePath } from "../../art/outlinePath";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./plan.css";

const PX_PER_MM = 6;
const MOVE_THRESHOLD = 5;
const NUDGES: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface Drag {
  readonly partKey: string;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
  readonly rotation: Rotation;
}

function turned(rotation: Rotation): Rotation {
  return ((rotation + 45) % 360) as Rotation;
}

export function PlanStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const product = productById(run.design.productId);
  const sheets = planSheets(state, run);
  const sheetRefs = useRef<Partial<Record<StockSizeId, SVGSVGElement | null>>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const look = metalLook(run.design.metalId, "high-shine");
  const tray = product.parts.filter((part) => !Object.hasOwn(run.plan, part.key));

  const tryPlace = (part: PartDef, placement: Placement): boolean => {
    const issue = placementIssue(state, run, part.key, placement);
    if (issue !== null) {
      setHint(issue);
      return false;
    }
    setHint(null);
    dispatch({ type: "placePart", partKey: part.key, ...placement });
    setSelected(part.key);
    return true;
  };

  const dropAt = (part: PartDef, clientX: number, clientY: number, rotation: Rotation) => {
    const size = sheets.find((id) => isInsideElement(sheetRefs.current[id] ?? null, clientX, clientY));
    if (size === undefined) {
      setHint(HINTS.ownSpace);
      return;
    }
    const point = clientToSvg(sheetRefs.current[size] ?? null, clientX, clientY);
    if (point === null) return;
    const { maxX, maxY } = polygonBounds(placedPart(run, part, { size, x: 0, y: 0, rotation }));
    tryPlace(part, {
      size,
      x: Math.round((point.x - maxX / 2) * 2) / 2,
      y: Math.round((point.y - maxY / 2) * 2) / 2,
      rotation,
    });
  };

  const begin = (event: PointerEvent<Element>, partKey: string, rotation: Rotation) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      partKey,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      rotation,
    });
  };
  const move = (event: PointerEvent<Element>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const moved =
      drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > MOVE_THRESHOLD;
    setDrag({ ...drag, x: event.clientX, y: event.clientY, moved });
  };
  const end = (event: PointerEvent<Element>) => {
    if (drag === null || drag.pointerId !== event.pointerId) return;
    setDrag(null);
    const part = product.parts.find((entry) => entry.key === drag.partKey);
    if (part === undefined) return;
    if (!drag.moved) {
      if (Object.hasOwn(run.plan, part.key)) setSelected(part.key);
      else placeSomewhere(part);
      return;
    }
    dropAt(part, event.clientX, event.clientY, drag.rotation);
  };

  const placeSomewhere = (part: PartDef) => {
    const spot = freeSpot(state, run, part);
    if (spot === null) setHint(HINTS.ownSpace);
    else tryPlace(part, spot);
  };

  const selectedPart = product.parts.find((part) => part.key === selected);
  const selectedPlacement = selected === null ? undefined : run.plan[selected];

  const turnSelected = () => {
    if (selectedPart === undefined || selectedPlacement === undefined) return;
    tryPlace(selectedPart, { ...selectedPlacement, rotation: turned(selectedPlacement.rotation) });
  };
  const removeSelected = () => {
    if (selected === null) return;
    dispatch({ type: "removePart", partKey: selected });
    setSelected(null);
  };
  const keyOnPart = (event: KeyboardEvent<SVGGElement>, part: PartDef, placement: Placement) => {
    const nudge = NUDGES[event.key];
    if (nudge !== undefined) {
      event.preventDefault();
      setSelected(part.key);
      tryPlace(part, { ...placement, x: placement.x + nudge[0], y: placement.y + nudge[1] });
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      tryPlace(part, { ...placement, rotation: turned(placement.rotation) });
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      dispatch({ type: "removePart", partKey: part.key });
      setSelected(null);
    }
  };

  const dragged = drag === null ? undefined : product.parts.find((part) => part.key === drag.partKey);
  return (
    <div className="jb-plan">
      <div className="jb-plan__layout">
        <aside className="jb-plan__tray jb-measure" aria-label="Shapes to place">
          <h3>Shapes</h3>
          {tray.length === 0 ? (
            <p className="jb-plan__all">Every shape has its own space. ✓</p>
          ) : (
            <ul>
              {tray.map((part) => {
                const outline = partOutline(part, designInput(run.design));
                const box = Math.max(part.width, part.height);
                return (
                  <li key={part.key}>
                    <button
                      type="button"
                      className="jb-plan__part"
                      data-testid={`tray-${part.key}`}
                      onPointerDown={(event) => begin(event, part.key, 0)}
                      onPointerMove={move}
                      onPointerUp={end}
                      onPointerCancel={() => setDrag(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          placeSomewhere(part);
                        }
                      }}
                      aria-label={`Place ${part.name}`}
                    >
                      <svg viewBox={`-1 -1 ${box + 2} ${box + 2}`} aria-hidden="true">
                        <path
                          d={outlinePath(outline, 1, (box - part.width) / 2, (box - part.height) / 2)}
                          fill={look.mid}
                          stroke={look.line}
                          strokeWidth={box / 40}
                        />
                      </svg>
                      <span>{part.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="jb-tools">
            <Button
              variant="secondary"
              icon="sparkle"
              onClick={() => dispatch({ type: "showMePlan" })}
              disabled={tray.length === 0}
            >
              Show me
            </Button>
          </div>
        </aside>
        <div className="jb-plan__sheets">
          {sheets.length === 0 ? (
            <p className="jb-hint">No sheets of this metal yet. Visit the Supply Cabinet.</p>
          ) : null}
          {sheets.map((size) => {
            const sheet = stockSizeById(size);
            return (
              <figure key={size} className="jb-plan__sheet">
                <svg
                  ref={(element) => {
                    sheetRefs.current[size] = element;
                  }}
                  viewBox={`0 0 ${sheet.width} ${sheet.height}`}
                  style={{ width: `min(100%, ${sheet.width * PX_PER_MM}px)` }}
                  data-testid={`sheet-${size}`}
                  role="group"
                  aria-label={`${sheet.name}, ${sheet.width} by ${sheet.height}`}
                >
                  <rect width={sheet.width} height={sheet.height} rx={1} fill={look.mid} />
                  <rect width={sheet.width} height={sheet.height} rx={1} fill={look.light} opacity={0.35} />
                  {Array.from({ length: Math.floor(sheet.height / 2) }, (_, index) => (
                    <path
                      key={index}
                      d={`M0 ${index * 2 + 1} L${sheet.width} ${index * 2 + 1}`}
                      stroke={look.dark}
                      strokeOpacity={0.12}
                      strokeWidth={0.2}
                    />
                  ))}
                  {product.parts.map((part) => {
                    const placement = run.plan[part.key];
                    if (placement === undefined || placement.size !== size) return null;
                    const polygon = placedPart(run, part, placement);
                    const isSelected = selected === part.key;
                    return (
                      <g
                        key={part.key}
                        className={isSelected ? "jb-plan__placed jb-plan__placed--on" : "jb-plan__placed"}
                        tabIndex={0}
                        role="button"
                        aria-label={`${part.name} on the ${sheet.name.toLowerCase()}`}
                        aria-pressed={isSelected}
                        data-testid={`placed-${part.key}`}
                        onPointerDown={(event) => begin(event, part.key, placement.rotation)}
                        onPointerMove={move}
                        onPointerUp={end}
                        onPointerCancel={() => setDrag(null)}
                        onFocus={() => setSelected(part.key)}
                        onKeyDown={(event) => keyOnPart(event, part, placement)}
                        opacity={drag?.partKey === part.key && drag.moved ? 0.35 : 1}
                      >
                        <path
                          d={outlinePath(polygon)}
                          fill="#fff8ea"
                          fillOpacity={0.55}
                          stroke={look.line}
                          strokeWidth={0.45}
                        />
                        <path
                          d={outlinePath(polygon)}
                          fill="none"
                          stroke="#1f4e5a"
                          strokeWidth={0.35}
                          strokeDasharray="1 0.8"
                        />
                      </g>
                    );
                  })}
                </svg>
                <figcaption>
                  {sheet.name} · {sheet.width}×{sheet.height}
                </figcaption>
              </figure>
            );
          })}
          <div className="jb-tools">
            <Button
              variant="secondary"
              onClick={turnSelected}
              disabled={selectedPlacement === undefined}
              aria-label="Turn the chosen shape"
            >
              ↻ Turn
            </Button>
            <Button variant="ghost" onClick={removeSelected} disabled={selectedPlacement === undefined}>
              Back to tray
            </Button>
          </div>
          <p
            className={hint === null ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"}
            aria-live="polite"
          >
            {hint ??
              (selectedPart !== undefined
                ? `${selectedPart.name}: drag it, turn it, or use the arrow keys.`
                : "")}
          </p>
        </div>
      </div>
      {drag !== null && drag.moved && dragged !== undefined ? (
        <div className="jb-plan__ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <svg
            viewBox={`-1 -1 ${dragged.width + 2} ${dragged.height + 2}`}
            style={{ width: dragged.width * PX_PER_MM, height: dragged.height * PX_PER_MM }}
          >
            <path
              d={outlinePath(
                placedPart(run, dragged, { size: "sheet", x: 0, y: 0, rotation: drag.rotation }),
              )}
              fill={look.mid}
              fillOpacity={0.8}
              stroke={look.line}
              strokeWidth={0.4}
            />
          </svg>
        </div>
      ) : null}
      <StageFooter {...props} ready="A neat plan. Time to cut!" />
    </div>
  );
}
