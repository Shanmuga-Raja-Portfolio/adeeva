import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "../../../../../engine/geometry/point";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { Dish } from "../../../content/dish";
import { PLATE_COLOURS, type ComponentId, type PlateColour } from "../../../content/plateComponent";
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
import { PLATE_HEX, PLATE_NAMES, PlacedPiece, PlateDisc } from "../../art/PlateArt";
import { plateInstruction } from "../../instructions/plateInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import { nudged, placeAt, rescaled, rotated, snapped, topLayer } from "./plateEditing";
import "./cook.css";

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
  const instruction = plateInstruction({
    placed: placed.length,
    heroPlaced,
    garnishesLeft: Math.max(0, dish.plate.garnishCount - preview.garnishes),
    inWell: preview.inWell === 1,
    wiped,
    assisted,
    plated: platedKey === plateKey,
  });
  return (
    <div className="ck-plate" data-testid="plate-builder">
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {instruction}
      </p>
      <div className="ck-plate__layout">
        <div className="ck-plate__stage">
          <svg
            ref={svgRef}
            viewBox="-12 -12 424 424"
            className="ck-plate__svg"
            role="application"
            aria-label={`The plate. ${placed.length} of ${ids.length} parts placed.`}
            onPointerMove={moveCarry}
            onPointerUp={endCarry}
            onPointerCancel={cancelCarry}
            data-testid="plate-canvas"
          >
            <PlateDisc colour={colour} drips={!wiped} showWell />
            {FOCUS_POINTS.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="#f2a93b" opacity={0.35} />
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
          <div className="ck-plate__tray" role="group" aria-label="Parts of the dish">
            {ids.map((id) => {
              const component = componentById(id);
              const on = placed.some((entry) => entry.componentId === id);
              return (
                <button
                  key={id}
                  type="button"
                  className={on ? "ck-tray-item ck-tray-item--on" : "ck-tray-item"}
                  onPointerDown={(event) => begin(event, id, true)}
                  onPointerMove={moveCarry}
                  onPointerUp={endCarry}
                  onPointerCancel={cancelCarry}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    const spot = ghost.find((entry) => entry.componentId === id);
                    drop(id, spot === undefined ? [200, 200] : placedCentre(spot));
                  }}
                  data-testid={`tray-${id}`}
                >
                  <svg
                    viewBox={`-4 -4 ${component.width + 8} ${component.height + 8}`}
                    width={56}
                    height={44}
                    aria-hidden="true"
                  >
                    <ComponentArt componentId={id} />
                  </svg>
                  <span>{component.name}</span>
                  <span className="ck-tray-item__role">
                    {component.role === "garnish" ? "garnish" : component.role}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedEntry !== undefined ? (
            <div className="ck-plate__tools" aria-label="Selected part">
              <strong>{componentById(selectedEntry.componentId).name}</strong>
              <button
                type="button"
                className="ck-pause"
                onClick={() => setPlaced((current) => rotated(current, selectedEntry.componentId))}
              >
                Turn 45°
              </button>
              <button
                type="button"
                className="ck-pause"
                aria-label="Smaller"
                onClick={() => setPlaced((current) => rescaled(current, selectedEntry.componentId, -0.1))}
              >
                −
              </button>
              <button
                type="button"
                className="ck-pause"
                aria-label="Bigger"
                onClick={() => setPlaced((current) => rescaled(current, selectedEntry.componentId, 0.1))}
              >
                +
              </button>
              <button type="button" className="ck-pause" onClick={() => remove(selectedEntry.componentId)}>
                Back to the tray
              </button>
            </div>
          ) : null}
          <div className="ck-plate__colours" role="radiogroup" aria-label="Plate">
            {PLATE_COLOURS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={colour === option}
                aria-label={PLATE_NAMES[option]}
                title={PLATE_NAMES[option]}
                className="ck-plate__swatch"
                style={{ background: PLATE_HEX[option] }}
                onClick={() => setColour(option)}
              />
            ))}
          </div>
          <ul className="ck-plate__checks">
            <li className={preview.inWell === 1 ? "ck-good" : undefined}>
              <Icon name={preview.inWell === 1 ? "check" : "close"} size={14} /> Everything in the well
            </li>
            <li className={preview.spacing === 1 ? "ck-good" : undefined}>
              <Icon name={preview.spacing === 1 ? "check" : "close"} size={14} /> Each piece has its own space
            </li>
            <li className={preview.focus === 1 ? "ck-good" : undefined}>
              <Icon name={preview.focus === 1 ? "check" : "close"} size={14} /> The star of the dish on a gold
              dot
            </li>
            <li className={preview.garnishMet ? "ck-good" : undefined}>
              <Icon name={preview.garnishMet ? "check" : "close"} size={14} /> {preview.garnishes} of{" "}
              {dish.plate.garnishCount} garnishes
            </li>
            <li className={wiped ? "ck-good" : undefined}>
              <Icon name={wiped ? "check" : "close"} size={14} /> Rim wiped
            </li>
          </ul>
          <div className="ck-plate__actions">
            <button
              type="button"
              className="ck-big-button ck-big-button--cloth"
              onClick={wipe}
              disabled={wiped}
              data-testid="wipe-rim"
            >
              Wipe rim
            </button>
            <button
              type="button"
              className="ck-big-button ck-big-button--go"
              onClick={() => {
                setPlatedKey(plateKey);
                onPlate({ components: placed, plateColour: colour, wiped, assisted: helped.current });
              }}
              disabled={!heroPlaced}
              data-testid="plate-it"
            >
              Plate it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
