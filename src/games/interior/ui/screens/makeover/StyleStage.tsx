import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import type { SvgPoint } from "../../../../../ui/kit/clientToSvg";
import { DECOR, type DecorId } from "../../../content/decor";
import { Icon } from "../../../../../ui/kit/IconSet";
import { HINTS, HOME_HINTS } from "../../../content/hints";
import { roomColourById } from "../../../content/roomColour";
import { SOFT_COLOURS } from "../../../content/softColour";
import {
  checklist,
  decorById,
  DECOR_ROTATION_STEP,
  spareDecor,
  STYLE_CANVAS,
  tellsStory,
  type PlacedDecor,
} from "../../../core";
import { DecorArt } from "../../art/DecorArt";
import { RoomCutaway } from "../../art/RoomCutaway";
import { roomHex } from "../../art/roomHex";
import { roomLook } from "../../art/roomLook";
import { usePointerDrag } from "../../usePointerDrag";
import { DecorBin } from "./DecorBin";
import { homeRoomContext } from "./homeRoomContext";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./style.css";

type DecorDrag =
  | { readonly kind: "stock"; readonly decorId: DecorId }
  | { readonly kind: "placed"; readonly item: PlacedDecor };

const ROOM_PARTS = { walls: true, floor: true, furniture: true, lights: true, decor: false } as const;
const SCALE_STEP = 0.25;
const NUDGE = 8;
const NUDGES: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-NUDGE, 0],
  ArrowRight: [NUDGE, 0],
  ArrowUp: [0, -NUDGE],
  ArrowDown: [0, NUDGE],
};

export function StyleStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const soft = roomHex(run.softColour);
  const missing = checklist(state, run).some((item) => item.id.startsWith("must-") && item.status !== "met");
  const home = homeRoomContext(state, run);
  const telling = home !== null && tellsStory(run, home.story);

  const canvasPoint = (spot: SvgPoint | null) => {
    if (spot === null) return null;
    const inside =
      spot.x >= 0 && spot.y >= 0 && spot.x <= STYLE_CANVAS.width && spot.y <= STYLE_CANVAS.height;
    return inside ? { x: Math.round(spot.x), y: Math.round(spot.y) } : null;
  };

  const onDrop = (drag: DecorDrag, point: SvgPoint | null) => {
    const spot = canvasPoint(point);
    if (drag.kind === "stock") {
      if (spot !== null && dispatch({ type: "addDecor", decorId: drag.decorId, x: spot.x, y: spot.y }))
        setSelected(`decor-${run.nextDecorNumber}`);
      return;
    }
    if (spot === null) {
      dispatch({ type: "removeDecor", decorPieceId: drag.item.id });
      setSelected(null);
      return;
    }
    const { rotation, scale, layer } = drag.item;
    dispatch({ type: "moveDecor", decorPieceId: drag.item.id, x: spot.x, y: spot.y, rotation, scale, layer });
    setSelected(drag.item.id);
  };

  const onTap = (drag: DecorDrag) => {
    if (drag.kind === "placed") {
      setSelected(drag.item.id);
      return;
    }
    const count = run.decor.length;
    const onWall = decorById(drag.decorId).onWall;
    const added = dispatch({
      type: "addDecor",
      decorId: drag.decorId,
      x: Math.round(STYLE_CANVAS.width * (onWall ? 0.24 + (count % 3) * 0.09 : 0.32 + (count % 4) * 0.11)),
      y: Math.round(STYLE_CANVAS.height * (onWall ? 0.22 + (count % 2) * 0.06 : 0.66 + (count % 2) * 0.07)),
    });
    if (added) setSelected(`decor-${run.nextDecorNumber}`);
  };

  const { active, handlers } = usePointerDrag<DecorDrag>(svgRef, onDrop, onTap);
  const selectedItem = run.decor.find((item) => item.id === selected) ?? null;
  const moving = active !== null && active.moved ? active : null;
  const movingSpot = moving === null ? null : canvasPoint(moving.spot);

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
      {[...run.decor]
        .sort((a, b) => a.layer - b.layer)
        .map((item) => {
          const lifted =
            moving !== null && moving.payload.kind === "placed" && moving.payload.item.id === item.id;
          const x = lifted && movingSpot !== null ? movingSpot.x : item.x;
          const y = lifted && movingSpot !== null ? movingSpot.y : item.y;
          return (
            <g
              key={item.id}
              transform={`translate(${x} ${y}) rotate(${item.rotation}) scale(${item.scale})`}
              role="button"
              tabIndex={0}
              aria-label={`${decorById(item.decorId).name}. Tap to choose it. Arrow keys move it, Delete puts it back.`}
              aria-pressed={selected === item.id}
              className={selected === item.id ? "is-style__item is-style__item--selected" : "is-style__item"}
              data-testid={`placed-${item.decorId}`}
              onFocus={() => setSelected(item.id)}
              onKeyDown={(event) => nudge(item, event)}
              {...handlers({ kind: "placed", item })}
            >
              <circle r={34} fill="transparent" />
              <DecorArt decorId={item.decorId} soft={soft} />
            </g>
          );
        })}
      {moving !== null && moving.payload.kind === "stock" && movingSpot !== null ? (
        <g transform={`translate(${movingSpot.x} ${movingSpot.y})`} opacity={0.75} pointerEvents="none">
          <DecorArt decorId={moving.payload.decorId} soft={soft} />
        </g>
      ) : null}
    </g>
  );

  return (
    <div className="is-style">
      <div className="is-style__work">
        <div className="is-style__stage">
          <RoomCutaway
            svgRef={svgRef}
            look={roomLook(run, ROOM_PARTS)}
            title="Your room, ready to style"
            className="is-style__room"
            decorLayer={decorLayer}
          />
          <div className="is-style__tools" aria-label="Chosen decor">
            {selectedItem !== null ? (
              <>
                <strong>{decorById(selectedItem.decorId).name}</strong>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    adjust(selectedItem, { rotation: (selectedItem.rotation + DECOR_ROTATION_STEP) % 360 })
                  }
                >
                  Turn
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    adjust(selectedItem, { scale: Math.max(0.5, selectedItem.scale - SCALE_STEP) })
                  }
                >
                  Smaller
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    adjust(selectedItem, { scale: Math.min(2, selectedItem.scale + SCALE_STEP) })
                  }
                >
                  Bigger
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    adjust(selectedItem, { layer: Math.max(...run.decor.map((item) => item.layer)) + 1 })
                  }
                >
                  To front
                </Button>
                <Button variant="ghost" size="sm" onClick={() => putBack(selectedItem)}>
                  Back to the box
                </Button>
              </>
            ) : (
              <span className="is-muted">
                Drag decor into the room. Tap a piece to turn, resize or put it back.
              </span>
            )}
          </div>
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
          <h3 className="is-tray__heading">Your decor box</h3>
          <div className="is-style__box">
            {DECOR.map((item) => {
              const spare = spareDecor(state, run, item.id);
              if (spare <= 0) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="is-style__stock"
                  data-testid={`stock-${item.id}`}
                  aria-label={`Add ${item.name}. ${spare} left.`}
                  {...handlers({ kind: "stock", decorId: item.id })}
                >
                  <svg viewBox="-40 -40 80 80" aria-hidden="true">
                    <DecorArt decorId={item.id} soft={soft} />
                  </svg>
                  <span>{item.name}</span>
                  <span className="is-style__count">× {spare}</span>
                </button>
              );
            })}
            {DECOR.every((item) => spareDecor(state, run, item.id) <= 0) ? (
              <p className="is-muted">Buy decor from the Decor Bin below.</p>
            ) : null}
          </div>
          <h3 className="is-tray__heading">Soft fabrics</h3>
          <div className="is-style__fabrics" role="radiogroup" aria-label="Soft fabric colour">
            {SOFT_COLOURS.map((colour) => (
              <button
                key={colour}
                type="button"
                role="radio"
                aria-checked={run.softColour === colour}
                aria-label={roomColourById(colour).name}
                className="is-style__fabric"
                style={{ background: roomHex(colour) }}
                onClick={() => dispatch({ type: "setSoftColour", colour })}
              />
            ))}
          </div>
        </aside>
      </div>
      <DecorBin {...props} title="Decor Bin" />
      <StageFooter {...props} ready="It feels just like them. Ready for the reveal?" />
    </div>
  );
}
