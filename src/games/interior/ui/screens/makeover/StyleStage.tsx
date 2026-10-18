import { memo, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { SvgPoint } from "../../../../../ui/kit/clientToSvg";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { DecorId } from "../../../content/decor";
import { HINTS, HOME_HINTS } from "../../../content/hints";
import { roomColourById } from "../../../content/roomColour";
import { SOFT_COLOURS } from "../../../content/softColour";
import { checklist, decorById, runRoom, STYLE_CANVAS, tellsStory, type PlacedDecor } from "../../../core";
import { DecorArt } from "../../art/DecorArt";
import { RoomCutaway, type StagingLook } from "../../art/RoomCutaway";
import type { RoomLook } from "../../art/roomLook";
import { roomHex } from "../../art/roomHex";
import { roomLook } from "../../art/roomLook";
import { usePointerDrag } from "../../usePointerDrag";
import { BriefChecklist } from "./BriefChecklist";
import { decorSpots, nearestSpot, type DecorSpot } from "./decorSpots";
import { DecorShelf } from "./DecorShelf";
import { homeRoomContext } from "./homeRoomContext";
import { StageFooter } from "./StageFooter";
import { StyleTools } from "./StyleTools";
import type { StageProps } from "./stageProps";
import "./style.css";

type DecorDrag =
  | { readonly kind: "stock"; readonly decorId: DecorId }
  | { readonly kind: "placed"; readonly item: PlacedDecor };

interface Burst {
  readonly x: number;
  readonly y: number;
  readonly key: number;
}

const ROOM_PARTS = { walls: true, floor: true, furniture: true, lights: true, decor: false } as const;
const NUDGE = 8;
const NUDGES: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-NUDGE, 0],
  ArrowRight: [NUDGE, 0],
  ArrowUp: [0, -NUDGE],
  ArrowDown: [0, NUDGE],
};
const CENTRE = { x: STYLE_CANVAS.width / 2, y: STYLE_CANVAS.height * 0.55 } as const;

function SpotHints({ spots, target }: { spots: readonly DecorSpot[]; target: DecorSpot | null }) {
  return (
    <g pointerEvents="none">
      {spots.map((spot) => {
        const hit = target !== null && target.x === spot.x && target.y === spot.y;
        return (
          <g key={`${spot.x},${spot.y}`} transform={`translate(${spot.x} ${spot.y})`}>
            <circle r={hit ? 30 : 17} fill={hit ? "rgba(255,246,200,0.55)" : "rgba(255,250,242,0.45)"} />
            <circle
              r={hit ? 30 : 17}
              fill="none"
              stroke={hit ? "#e0a92e" : "#ffffff"}
              strokeWidth={hit ? 3.5 : 2.5}
              strokeDasharray={hit ? undefined : "5 4"}
            />
            <circle r={hit ? 5 : 3.5} fill={hit ? "#e0a92e" : "#ffffff"} />
          </g>
        );
      })}
    </g>
  );
}

const StyleRoom = memo(function StyleRoom({ look, staging }: { look: RoomLook; staging: StagingLook }) {
  return (
    <RoomCutaway look={look} title="Your room, ready to style" className="is-style__room" staging={staging} />
  );
});

export function StyleStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);
  const soft = roomHex(run.softColour);
  const missing = checklist(state, run).some((item) => item.id.startsWith("must-") && item.status !== "met");
  const home = homeRoomContext(state, run);
  const telling = home !== null && tellsStory(run, home.story);
  const room = runRoom(run);
  const look = useMemo(() => roomLook(run, ROOM_PARTS), [run]);
  const staging = useMemo<StagingLook>(() => ({ palette: [soft], extras: false }), [soft]);

  const spotsFor = (decorId: DecorId, movingId: string | null) =>
    decorSpots(room, run.plan.pieces, decorById(decorId).onWall, run.decor, movingId);

  const canvasPoint = (spot: SvgPoint | null) => {
    if (spot === null) return null;
    const inside =
      spot.x >= 0 && spot.y >= 0 && spot.x <= STYLE_CANVAS.width && spot.y <= STYLE_CANVAS.height;
    return inside ? { x: Math.round(spot.x), y: Math.round(spot.y) } : null;
  };

  const snapped = (decorId: DecorId, movingId: string | null, spot: { x: number; y: number }) => {
    const target = nearestSpot(spotsFor(decorId, movingId), spot.x, spot.y);
    return target === null ? { ...spot, snap: false } : { ...target, snap: true };
  };

  const celebrate = (spot: { x: number; y: number; snap: boolean }) => {
    if (spot.snap) setBurst((last) => ({ x: spot.x, y: spot.y, key: (last?.key ?? 0) + 1 }));
  };

  const onDrop = (drag: DecorDrag, point: SvgPoint | null) => {
    const raw = canvasPoint(point);
    if (drag.kind === "stock") {
      if (raw === null) return;
      const spot = snapped(drag.decorId, null, raw);
      if (dispatch({ type: "addDecor", decorId: drag.decorId, x: spot.x, y: spot.y })) {
        setSelected(`decor-${run.nextDecorNumber}`);
        celebrate(spot);
      }
      return;
    }
    if (raw === null) {
      dispatch({ type: "removeDecor", decorPieceId: drag.item.id });
      setSelected(null);
      return;
    }
    const spot = snapped(drag.item.decorId, drag.item.id, raw);
    const { rotation, scale, layer } = drag.item;
    if (
      dispatch({
        type: "moveDecor",
        decorPieceId: drag.item.id,
        x: spot.x,
        y: spot.y,
        rotation,
        scale,
        layer,
      })
    )
      celebrate(spot);
    setSelected(drag.item.id);
  };

  const onTap = (drag: DecorDrag) => {
    if (drag.kind === "placed") {
      setSelected(drag.item.id);
      return;
    }
    const count = run.decor.length;
    const onWall = decorById(drag.decorId).onWall;
    const best = [...spotsFor(drag.decorId, null)].sort(
      (a, b) => Math.hypot(a.x - CENTRE.x, a.y - CENTRE.y) - Math.hypot(b.x - CENTRE.x, b.y - CENTRE.y),
    )[0];
    const spot =
      best === undefined
        ? {
            x: Math.round(
              STYLE_CANVAS.width * (onWall ? 0.24 + (count % 3) * 0.09 : 0.32 + (count % 4) * 0.11),
            ),
            y: Math.round(
              STYLE_CANVAS.height * (onWall ? 0.22 + (count % 2) * 0.06 : 0.66 + (count % 2) * 0.07),
            ),
            snap: false,
          }
        : { ...best, snap: true };
    if (dispatch({ type: "addDecor", decorId: drag.decorId, x: spot.x, y: spot.y })) {
      setSelected(`decor-${run.nextDecorNumber}`);
      celebrate(spot);
    }
  };

  const { active, handlers } = usePointerDrag<DecorDrag>(svgRef, onDrop, onTap);
  const selectedItem = run.decor.find((item) => item.id === selected) ?? null;
  const moving = active !== null && active.moved ? active : null;
  const movingSpot = moving === null ? null : canvasPoint(moving.spot);
  const movingDecor =
    moving === null
      ? null
      : moving.payload.kind === "stock"
        ? moving.payload.decorId
        : moving.payload.item.decorId;
  const movingId = moving !== null && moving.payload.kind === "placed" ? moving.payload.item.id : null;
  const hints = movingDecor === null ? [] : spotsFor(movingDecor, movingId);
  const target = movingSpot === null ? null : nearestSpot(hints, movingSpot.x, movingSpot.y);
  const held = target ?? movingSpot;

  const adjust = (item: PlacedDecor, change: Partial<Pick<PlacedDecor, "rotation" | "scale" | "layer">>) =>
    dispatch({
      type: "moveDecor",
      decorPieceId: item.id,
      x: item.x,
      y: item.y,
      rotation: item.rotation,
      scale: item.scale,
      layer: item.layer,
      ...change,
    });

  const putBack = (item: PlacedDecor) => {
    dispatch({ type: "removeDecor", decorPieceId: item.id });
    setSelected(null);
  };

  const nudge = (item: PlacedDecor, event: KeyboardEvent<SVGGElement>) => {
    const move = NUDGES[event.key];
    if (move !== undefined) {
      event.preventDefault();
      const x = Math.min(STYLE_CANVAS.width, Math.max(0, item.x + move[0]));
      const y = Math.min(STYLE_CANVAS.height, Math.max(0, item.y + move[1]));
      if (x !== item.x || y !== item.y)
        dispatch({
          type: "moveDecor",
          decorPieceId: item.id,
          x,
          y,
          rotation: item.rotation,
          scale: item.scale,
          layer: item.layer,
        });
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      putBack(item);
    }
  };

  const decorLayer = (
    <g>
      {moving !== null ? <SpotHints spots={hints} target={target} /> : null}
      {[...run.decor]
        .sort((a, b) => a.layer - b.layer)
        .map((item) => {
          const lifted = movingId === item.id;
          const x = lifted && held !== null ? held.x : item.x;
          const y = lifted && held !== null ? held.y : item.y;
          const chosen = selected === item.id;
          return (
            <g
              key={item.id}
              transform={`translate(${x} ${y}) rotate(${item.rotation}) scale(${item.scale})`}
              role="button"
              tabIndex={0}
              aria-label={`${decorById(item.decorId).name}. Tap to choose it. Arrow keys move it, Delete puts it back.`}
              aria-pressed={chosen}
              className="is-style__item"
              data-testid={`placed-${item.decorId}`}
              onFocus={() => setSelected(item.id)}
              onKeyDown={(event) => nudge(item, event)}
              {...handlers({ kind: "placed", item })}
            >
              <circle r={34} fill={chosen ? "rgba(60,106,168,0.12)" : "transparent"} />
              {chosen ? (
                <circle r={36} fill="none" stroke="#3c6aa8" strokeWidth={2.5} strokeDasharray="6 4" />
              ) : null}
              <DecorArt decorId={item.decorId} soft={soft} />
            </g>
          );
        })}
      {moving !== null && moving.payload.kind === "stock" && held !== null ? (
        <g
          transform={`translate(${held.x} ${held.y})`}
          opacity={target === null ? 0.7 : 0.95}
          pointerEvents="none"
        >
          <DecorArt decorId={moving.payload.decorId} soft={soft} />
        </g>
      ) : null}
    </g>
  );

  return (
    <div className="is-style">
      <div className="is-style__work">
        <div className="is-style__stage">
          <div className="is-style__frame">
            <StyleRoom look={look} staging={staging} />
            <svg
              ref={svgRef}
              className="is-style__decor"
              viewBox={`0 0 ${STYLE_CANVAS.width} ${STYLE_CANVAS.height}`}
              aria-label="Decor in your room"
            >
              {decorLayer}
            </svg>
            {burst !== null ? (
              <span
                key={burst.key}
                className="is-style__snap"
                style={{
                  left: `${((burst.x / STYLE_CANVAS.width) * 100).toFixed(2)}%`,
                  top: `${((burst.y / STYLE_CANVAS.height) * 100).toFixed(2)}%`,
                }}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : null}
          </div>
          <StyleTools
            item={selectedItem}
            topLayer={Math.max(...run.decor.map((item) => item.layer))}
            onAdjust={adjust}
            onPutBack={putBack}
          />
          {missing ? <p className="is-style__warn">{HINTS.mustHavesMissing}</p> : null}
          {home !== null ? (
            <p
              className={telling ? "is-style__story is-style__story--told" : "is-style__story"}
              data-testid="story-status"
            >
              <Icon name={telling ? "check" : "sparkle"} size={16} />{" "}
              {telling ? "This room tells the family's story!" : HOME_HINTS.storyPieces}
            </p>
          ) : null}
        </div>
        <aside className="is-style__side">
          <BriefChecklist state={state} run={run} compact />
          <DecorShelf
            {...props}
            soft={soft}
            stockHandlers={(decorId) => handlers({ kind: "stock", decorId })}
            onChoose={setSelected}
          />
          <div className="is-style__fabric-row">
            <h3 className="is-tray__heading">
              Soft fabrics <span>{roomColourById(run.softColour).name}</span>
            </h3>
            <div className="is-style__fabrics" role="radiogroup" aria-label="Soft fabric colour">
              {SOFT_COLOURS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  role="radio"
                  aria-checked={run.softColour === colour}
                  aria-label={roomColourById(colour).name}
                  title={roomColourById(colour).name}
                  className="is-style__fabric"
                  onClick={() => dispatch({ type: "setSoftColour", colour })}
                >
                  <span className="is-style__swatch" style={{ background: roomHex(colour) }}>
                    {run.softColour === colour ? <Icon name="check" size={18} /> : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <StageFooter {...props} ready="It feels just like them. Ready for the reveal?" />
    </div>
  );
}
