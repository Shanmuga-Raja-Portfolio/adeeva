import { ownEntry } from "../../../../../engine/ownEntry";
import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import type { SvgPoint } from "../../../../../ui/kit/clientToSvg";
import { HINTS } from "../../../content/hints";
import {
  canPlaceLight,
  furnitureById,
  lightById,
  litSpots,
  mountCells,
  pieceShape,
  placedLights,
  roomById,
  sunIcons,
} from "../../../core";
import { BlueprintGrid, PLAN_CELL } from "../../art/BlueprintGrid";
import { FurnitureSymbol, symbolTransform } from "../../art/FurnitureSymbol";
import { RoomCutaway } from "../../art/RoomCutaway";
import { roomLook } from "../../art/roomLook";
import { useAssist } from "../../useAssist";
import { usePointerDrag } from "../../usePointerDrag";
import { StageFooter } from "./StageFooter";
import { assistHint } from "./stageNames";
import type { StageProps } from "./stageProps";
import "./light.css";

const LIT_PARTS = { walls: true, floor: true, furniture: true, lights: true, decor: false } as const;

function SunBadge({ x, y, hundredths }: { x: number; y: number; hundredths: number }) {
  const suns = sunIcons(hundredths);
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect
        x={-34}
        y={-14}
        width={68}
        height={28}
        rx={14}
        fill={suns >= 2 ? "#fff3c4" : "#2a3f66"}
        stroke="#ffffff"
        strokeWidth={2}
      />
      {Array.from({ length: 3 }, (_, index) => (
        <g key={index} transform={`translate(${-20 + index * 20} 0)`}>
          <circle
            r={6}
            fill={index < suns ? "#f2b632" : "none"}
            stroke={index < suns ? "#9a7a14" : "#9fb8dc"}
            strokeWidth={1.6}
          />
          {index < suns ? (
            <path d="M0 -10 L0 -8 M0 8 L0 10 M-10 0 L-8 0 M8 0 L10 0" stroke="#9a7a14" strokeWidth={1.4} />
          ) : null}
        </g>
      ))}
    </g>
  );
}

export function LightStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const room = roomById(run.brief.roomId);
  const svgRef = useRef<SVGSVGElement>(null);
  const [showMe] = useAssist("light");
  const [hint, setHint] = useState<string | null>(null);
  const lights = placedLights(run);
  const spots = litSpots(room, run.plan.pieces, lights);
  const placeOf = (index: number) => ownEntry(run.lightPlaces, String(index));

  const cellAt = (spot: SvgPoint | null): readonly [number, number] | null => {
    if (spot === null) return null;
    const col = Math.floor(spot.x / PLAN_CELL);
    const row = Math.floor(spot.y / PLAN_CELL);
    return col < 0 || row < 0 || col >= room.cols || row >= room.rows ? null : [col, row];
  };

  const tryPlace = (index: number, col: number, row: number) => {
    if (!canPlaceLight(run, index, col, row)) {
      setHint(HINTS.lightNotHere);
      return;
    }
    setHint(null);
    dispatch({ type: "placeLight", index, col, row });
  };

  const onDrop = (index: number, spot: SvgPoint | null) => {
    const cell = cellAt(spot);
    if (cell === null) {
      if (placeOf(index) !== undefined) dispatch({ type: "liftLight", index });
      return;
    }
    tryPlace(index, cell[0], cell[1]);
  };

  const onTap = (index: number) => {
    if (placeOf(index) !== undefined) {
      dispatch({ type: "liftLight", index });
      return;
    }
    const lightId = run.plan.lights[index];
    if (lightId === undefined) return;
    const cell = mountCells(room, run.plan.pieces, placedLights(run), lightId)[0];
    if (cell === undefined) setHint(HINTS.lightNotHere);
    else tryPlace(index, cell[0], cell[1]);
  };

  const { active, handlers } = usePointerDrag<number>(svgRef, onDrop, onTap);
  const draggingIndex = active !== null && active.moved ? active.payload : null;
  const draggingLight = draggingIndex === null ? undefined : run.plan.lights[draggingIndex];
  const targets =
    draggingIndex === null || draggingLight === undefined
      ? []
      : mountCells(room, run.plan.pieces, placedLights(run, draggingIndex), draggingLight);
  const hover = active !== null && active.moved ? cellAt(active.spot) : null;

  const nudge = (index: number, event: KeyboardEvent<SVGGElement>) => {
    const place = placeOf(index);
    const moves: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (place === undefined || move === undefined) return;
    event.preventDefault();
    tryPlace(index, place.col + move[0], place.row + move[1]);
  };

  return (
    <div className="is-light">
      <div className="is-light__work">
        <div className="is-light__board">
          <p className="is-light__hint" role="status" aria-live="polite">
            {hint ?? (spots.lit < spots.total ? HINTS.darkSpot : "Every spot people use is lit. Cosy!")}
          </p>
          <BlueprintGrid ref={svgRef} room={room} title="Lighting plan" className="is-light__grid">
            <defs>
              <radialGradient id="is-light-warm">
                <stop offset="0" stopColor="#ffe08a" stopOpacity={0.85} />
                <stop offset="1" stopColor="#ffe08a" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="is-light-cool">
                <stop offset="0" stopColor="#d9f2ff" stopOpacity={0.85} />
                <stop offset="1" stopColor="#d9f2ff" stopOpacity={0} />
              </radialGradient>
            </defs>
            <rect
              x={0}
              y={0}
              width={room.cols * PLAN_CELL}
              height={room.rows * PLAN_CELL}
              fill="#0f1d3a"
              opacity={0.45}
            />
            {lights.map((light, index) => {
              const def = lightById(light.lightId);
              return (
                <circle
                  key={`glow-${index}`}
                  cx={(light.col + 0.5) * PLAN_CELL}
                  cy={(light.row + 0.5) * PLAN_CELL}
                  r={def.radius * PLAN_CELL * def.strength}
                  fill={`url(#is-light-${def.warmth})`}
                  className="is-glow"
                />
              );
            })}
            {run.plan.pieces.map((piece) => {
              const shape = pieceShape(piece.furnitureId, piece.rotation);
              const def = furnitureById(piece.furnitureId);
              return (
                <g
                  key={piece.id}
                  transform={symbolTransform(
                    piece.furnitureId,
                    PLAN_CELL,
                    (piece.col + shape.width / 2) * PLAN_CELL,
                    (piece.row + shape.depth / 2) * PLAN_CELL,
                    piece.rotation,
                  )}
                  opacity={0.9}
                >
                  <FurnitureSymbol
                    furnitureId={piece.furnitureId}
                    cell={PLAN_CELL}
                    fill={def.holdsLamp ? "rgba(125,138,74,0.9)" : "rgba(90,134,194,0.9)"}
                  />
                </g>
              );
            })}
            {targets.map(([col, row]) => (
              <rect
                key={`t${col}-${row}`}
                x={col * PLAN_CELL + 6}
                y={row * PLAN_CELL + 6}
                width={PLAN_CELL - 12}
                height={PLAN_CELL - 12}
                rx={10}
                fill={
                  hover !== null && hover[0] === col && hover[1] === row
                    ? "rgba(246,215,122,0.6)"
                    : "rgba(246,215,122,0.18)"
                }
                stroke="#f6d77a"
                strokeWidth={2}
                strokeDasharray="5 4"
                pointerEvents="none"
              />
            ))}
            {spots.spots.map((entry) => {
              const cx =
                entry.spot.cells.reduce((sum, cell) => sum + cell[0] + 0.5, 0) / entry.spot.cells.length;
              const cy =
                entry.spot.cells.reduce((sum, cell) => sum + cell[1] + 0.5, 0) / entry.spot.cells.length;
              return (
                <SunBadge
                  key={entry.spot.pieceId}
                  x={cx * PLAN_CELL}
                  y={cy * PLAN_CELL}
                  hundredths={entry.hundredths}
                />
              );
            })}
            {run.plan.lights.map((lightId, index) => {
              const place = placeOf(index);
              if (place === undefined) return null;
              const def = lightById(lightId);
              return (
                <g
                  key={`light-${index}`}
                  transform={`translate(${(place.col + 0.5) * PLAN_CELL} ${(place.row + 0.5) * PLAN_CELL})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${def.name}. Arrow keys move it, Enter takes it down.`}
                  className="is-light__bulb"
                  data-testid={`placed-light-${index}`}
                  onKeyDown={(event) => nudge(index, event)}
                  {...handlers(index)}
                >
                  <circle
                    r={22}
                    fill={def.warmth === "warm" ? "#ffd96b" : "#cdeeff"}
                    stroke="#3b2a33"
                    strokeWidth={3}
                  />
                  <path d="M-7 4 Q0 -14 7 4 Z" fill="#ffffff" opacity={0.85} />
                  <text y={38} textAnchor="middle" className="is-plan__label">
                    {def.mount}
                  </text>
                </g>
              );
            })}
          </BlueprintGrid>
        </div>
        <aside className="is-light__side">
          <RoomCutaway
            look={roomLook(run, LIT_PARTS)}
            title="Your room with the lights on"
            evening
            className="is-light__preview"
          />
          <h3 className="is-tray__heading">Your lights</h3>
          <ul className="is-light__tray">
            {run.plan.lights.map((lightId, index) => {
              const def = lightById(lightId);
              const placed = placeOf(index) !== undefined;
              return (
                <li key={`${lightId}-${index}`}>
                  <button
                    type="button"
                    className={placed ? "is-light-chip is-light-chip--placed" : "is-light-chip"}
                    data-testid={`tray-light-${index}`}
                    aria-label={placed ? `${def.name} is up. Tap to take it down.` : `Hang the ${def.name}`}
                    {...handlers(index)}
                  >
                    <span
                      className={`is-light-chip__bulb is-light-chip__bulb--${def.warmth}`}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>{def.name}</strong>
                      <span className="is-muted">
                        {" "}
                        ·{" "}
                        {def.mount === "ceiling"
                          ? "ceiling, any square"
                          : def.mount === "floor"
                            ? "free floor square"
                            : def.mount === "desk"
                              ? "on a desk or table"
                              : "on a wall edge"}
                      </span>
                    </span>
                    <span className="is-light-chip__state">{placed ? "Up!" : "Drag me"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="is-muted">
            {run.brief.mood === "any"
              ? "Any light mood is fine."
              : `The brief asks for ${run.brief.mood} light.`}{" "}
            Lit spots: {spots.lit} of {spots.total}.
          </p>
          {showMe ? (
            <Button
              variant="secondary"
              icon="sparkle"
              onClick={() => dispatch({ type: "showMeLight" })}
              data-testid="show-me-light"
            >
              Show me
            </Button>
          ) : (
            <p className="is-hint">{assistHint("Show me lights", state)}</p>
          )}
        </aside>
      </div>
      <StageFooter {...props} ready="The room glows. Time to style it!" />
    </div>
  );
}
