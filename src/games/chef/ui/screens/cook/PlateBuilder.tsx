import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import type { Dish } from "../../../content/dish";
import type { ComponentId, PlateColour } from "../../../content/plateComponent";
import {
  componentById,
  FOCUS_POINTS,
  ghostLayout,
  placedCentre,
  plateComponentIds,
  scorePlate,
  type PlacedComponent,
} from "../../../core";
import { ComponentArt } from "../../art/ComponentArt";
import { PlacedPiece, PlateDisc } from "../../art/PlateArt";
import { PlateTable } from "../../art/PlateTable";
import { plateInstruction } from "../../instructions/plateInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import { nudged, placeAt, rescaled, rotated, snapped, topLayer } from "./plateEditing";
import { PlateChecks } from "./PlateChecks";
import { PlateSwatches } from "./PlateSwatches";
import { PlateTools } from "./PlateTools";
import { PlateTray } from "./PlateTray";
import { PlateWipe } from "./PlateWipe";
import "./cook.css";
import "./plate.css";

const SETTING_VIEWBOX = "-6 -6 414 420";

export interface PlateDraft {
  readonly components: readonly PlacedComponent[];
  readonly plateColour: PlateColour;
  readonly wiped: boolean;
  readonly assisted: boolean;
}

export interface PlateBuilderProps {
  readonly dish: Dish;
  readonly tolerance: number;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly initial: PlateDraft | null;
  readonly onPlate: (draft: PlateDraft) => void;
  readonly helper?: ReactNode;
  readonly footer?: ReactNode;
}

interface Carry {
  readonly componentId: ComponentId;
  readonly fromTray: boolean;
  readonly moved: boolean;
  readonly startX: number;
  readonly startY: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly pointerId: number;
}

export function PlateBuilder({
  dish,
  tolerance,
  assisted,
  reducedMotion,
  initial,
  onPlate,
  helper,
  footer,
}: PlateBuilderProps) {
  const { play } = useKitchenSound();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [placed, setPlaced] = useState<readonly PlacedComponent[]>(initial?.components ?? []);
  const [colour, setColour] = useState<PlateColour>(initial?.plateColour ?? "white");
  const [wiped, setWiped] = useState(initial?.wiped ?? false);
  const [selected, setSelected] = useState<ComponentId | null>(null);
  const [carry, setCarry] = useState<Carry | null>(null);
  const [wiping, setWiping] = useState(0);
  const helped = useRef(assisted || (initial?.assisted ?? false));
  const [platedKey, setPlatedKey] = useState(
    initial === null ? null : JSON.stringify([initial.components, initial.plateColour, initial.wiped]),
  );
  const ghost = ghostLayout(dish);
  const ids = plateComponentIds(dish);

  useEffect(() => {
    if (assisted) helped.current = true;
  }, [assisted]);

  const svgPoint = (clientX: number, clientY: number): Point | null => {
    const point = clientToSvg(svgRef.current, clientX, clientY);
    if (point === null || point.x < 0 || point.y < 0 || point.x > 400 || point.y > 400) return null;
    return [point.x, point.y];
  };

  const drop = (componentId: ComponentId, point: Point) => {
    const target = snapped(
      point,
      ghost.find((entry) => entry.componentId === componentId),
      assisted,
    );
    setPlaced((current) => placeAt(current, componentId, target, topLayer(current)));
    setSelected(componentId);
    play("pop");
  };

  const begin = (event: PointerEvent<Element>, componentId: ComponentId, fromTray: boolean) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(componentId);
    setCarry({
      pointerId: event.pointerId,
      componentId,
      fromTray,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  };

  const moveCarry = (event: PointerEvent<Element>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    const moved = carry.moved || Math.hypot(event.clientX - carry.startX, event.clientY - carry.startY) > 6;
    setCarry({ ...carry, moved, clientX: event.clientX, clientY: event.clientY });
    if (!carry.fromTray && moved) {
      const point = svgPoint(event.clientX, event.clientY);
      if (point !== null)
        setPlaced((current) => placeAt(current, carry.componentId, point, topLayer(current)));
    }
  };

  const cancelCarry = () => setCarry(null);

  const endCarry = (event: PointerEvent<Element>) => {
    if (carry === null || carry.pointerId !== event.pointerId) return;
    const point = svgPoint(event.clientX, event.clientY);
    if (carry.fromTray) {
      if (carry.moved && point !== null) drop(carry.componentId, point);
      else if (!carry.moved) {
        const spot = ghost.find((entry) => entry.componentId === carry.componentId);
        drop(carry.componentId, spot === undefined ? [200, 200] : placedCentre(spot));
      }
    } else if (carry.moved && point !== null) drop(carry.componentId, point);
    setCarry(null);
  };

  const remove = (componentId: ComponentId) => {
    setPlaced((current) => current.filter((entry) => entry.componentId !== componentId));
    setSelected(null);
  };

  const keyOnPiece = (event: KeyboardEvent<SVGGElement>, componentId: ComponentId) => {
    const step = 10;
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = moves[event.key];
    if (delta !== undefined) setPlaced((current) => nudged(current, componentId, delta[0], delta[1]));
    else if (event.key === "r" || event.key === "R") setPlaced((current) => rotated(current, componentId));
    else if (event.key === "+" || event.key === "=")
      setPlaced((current) => rescaled(current, componentId, 0.1));
    else if (event.key === "-") setPlaced((current) => rescaled(current, componentId, -0.1));
    else if (event.key === "Delete" || event.key === "Backspace") remove(componentId);
    else return;
    event.preventDefault();
  };

  const wipe = () => {
    setWiped(true);
    setWiping((count) => count + 1);
    play("sparkle");
  };

  const preview = scorePlate(
    dish,
    { components: placed, plateColour: colour, wiped, assisted: false },
    tolerance,
  );
  const heroPlaced = placed.some((entry) => entry.componentId === dish.plate.hero);
  const sorted = [...placed].sort((a, b) => a.layer - b.layer);
  const selectedEntry = placed.find((entry) => entry.componentId === selected);
  const plateKey = JSON.stringify([placed, colour, wiped]);
  const plated = platedKey === plateKey;
  const instruction = plateInstruction({
    placed: placed.length,
    heroPlaced,
    garnishesLeft: Math.max(0, dish.plate.garnishCount - preview.garnishes),
    inWell: preview.inWell === 1,
    wiped,
    assisted,
    plated,
  });
  const ready =
    heroPlaced && preview.inWell === 1 && preview.spacing === 1 && preview.focus === 1 && preview.garnishMet;
  const placeFromTray = (componentId: ComponentId) => {
    const spot = ghost.find((entry) => entry.componentId === componentId);
    drop(componentId, spot === undefined ? [200, 200] : placedCentre(spot));
  };
  return (
    <div className="ck-plate" data-testid="plate-builder">
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {instruction}
      </p>
      <div className="ck-plate__layout">
        <PlateTable className="ck-plate__table" />
        <div className="ck-plate__left">
          <PlateTray
            ids={ids}
            placed={new Set(placed.map((entry) => entry.componentId))}
            onBegin={(event, id) => begin(event, id, true)}
            onMove={moveCarry}
            onEnd={endCarry}
            onCancel={cancelCarry}
            onPlace={placeFromTray}
          />
          {selectedEntry !== undefined ? (
            <PlateTools
              name={componentById(selectedEntry.componentId).name}
              onTurn={() => setPlaced((current) => rotated(current, selectedEntry.componentId))}
              onSmaller={() => setPlaced((current) => rescaled(current, selectedEntry.componentId, -0.1))}
              onBigger={() => setPlaced((current) => rescaled(current, selectedEntry.componentId, 0.1))}
              onRemove={() => remove(selectedEntry.componentId)}
            />
          ) : null}
        </div>
        <div className="ck-plate__stage">
          <svg
            ref={svgRef}
            viewBox={SETTING_VIEWBOX}
            className="ck-plate__svg"
            role="application"
            aria-label={`The plate. ${placed.length} of ${ids.length} parts placed.`}
            onPointerMove={moveCarry}
            onPointerUp={endCarry}
            onPointerCancel={cancelCarry}
            data-testid="plate-canvas"
          >
            <PlateDisc
              colour={colour}
              drips={!wiped}
              dripColour={componentById(dish.plate.hero).colour}
              showWell
            />
            {FOCUS_POINTS.map(([x, y]) => (
              <g key={`${x}-${y}`} opacity={0.7}>
                <circle cx={x} cy={y} r={7} fill="#ffffff" opacity={0.55} />
                <circle cx={x} cy={y} r={5} fill="#f2a93b" />
              </g>
            ))}
            {assisted
              ? ghost.map((entry) => (
                  <g key={`ghost-${entry.componentId}`} opacity={0.22}>
                    <PlacedPiece placed={entry} />
                  </g>
                ))
              : null}
            {sorted.map((entry) => (
              <g
                key={entry.componentId}
                tabIndex={0}
                role="button"
                aria-label={`${componentById(entry.componentId).name}. Arrows move, R turns, plus and minus resize.`}
                className={
                  selected === entry.componentId ? "ck-plate__piece ck-plate__piece--on" : "ck-plate__piece"
                }
                onPointerDown={(event) => begin(event, entry.componentId, false)}
                onKeyDown={(event) => keyOnPiece(event, entry.componentId)}
                onFocus={() => setSelected(entry.componentId)}
                data-testid={`placed-${entry.componentId}`}
              >
                <PlacedPiece placed={entry} />
              </g>
            ))}
            {wiping > 0 && !reducedMotion ? (
              <g key={wiping} className="ck-plate__cloth">
                <path
                  d="M300 20 q30 10 60 0 l10 40 q-30 10 -60 0 Z"
                  fill="#f3f0e8"
                  stroke="#aeb9bf"
                  strokeWidth={2}
                />
              </g>
            ) : null}
          </svg>
          <PlateWipe wiped={wiped} onWipe={wipe} />
          {carry !== null && carry.fromTray && carry.moved ? (
            <div
              className="ck-plate__carry"
              style={{ left: carry.clientX, top: carry.clientY }}
              aria-hidden="true"
            >
              <svg
                viewBox={`0 0 ${componentById(carry.componentId).width} ${componentById(carry.componentId).height}`}
                width={componentById(carry.componentId).width * 0.8}
              >
                <ComponentArt componentId={carry.componentId} />
              </svg>
            </div>
          ) : null}
        </div>
        <div className="ck-plate__side">
          <PlateChecks
            checks={[
              { key: "well", ok: preview.inWell === 1, label: "Everything in the well" },
              { key: "space", ok: preview.spacing === 1, label: "Each piece has space" },
              { key: "focus", ok: preview.focus === 1, label: "Star piece on a gold dot" },
              {
                key: "garnish",
                ok: preview.garnishMet,
                label: `Garnishes ${preview.garnishes} of ${dish.plate.garnishCount}`,
              },
            ]}
          >
            <PlateSwatches colour={colour} onPick={setColour} />
            {helper}
          </PlateChecks>
          <button
            type="button"
            className={
              plated
                ? "ck-big-button ck-plate__go ck-plate__go--done"
                : ready
                  ? "ck-big-button ck-plate__go ck-plate__go--ready"
                  : "ck-big-button ck-plate__go"
            }
            onClick={() => {
              setPlatedKey(plateKey);
              onPlate({ components: placed, plateColour: colour, wiped, assisted: helped.current });
            }}
            disabled={!heroPlaced}
            data-testid="plate-it"
          >
            {plated ? "Plated!" : "Plate it"}
          </button>
          {footer}
        </div>
      </div>
    </div>
  );
}
