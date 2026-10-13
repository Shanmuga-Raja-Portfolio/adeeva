import { useRef, useState, type PointerEvent } from "react";
import type { TrimId } from "../../../content/trim";
import { DOLL_HEIGHT, DOLL_WIDTH, type Decoration, type DecorationPose } from "../../../core";
import { DressPreview } from "../../art/DressPreview";
import { TRIM_EXTENT, TrimBadge } from "../../art/TrimArt";
import { clientToSvg, type SvgPoint } from "./clientToSvg";
import { DecorationControls } from "./DecorationControls";
import { clampPose, poseOf, samePose } from "./decorationPose";
import { designFabrics, designParts } from "../../art/designLook";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import { TrimTray } from "./TrimTray";
import "./decorate.css";

type Gesture = "move" | "rotate" | "scale";

interface PoseDrag {
  readonly id: string;
  readonly gesture: Gesture;
  readonly pointerId: number;
  readonly start: SvgPoint;
  readonly origin: DecorationPose;
  readonly pose: DecorationPose;
}

interface TrayDrag {
  readonly trimId: TrimId;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

const DROP_SPOT = { x: 200, y: 250 } as const;
const NEWEST = "newest";

export function DecorateStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const dollRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDragState] = useState<PoseDrag | null>(null);
  const [tray, setTrayState] = useState<TrayDrag | null>(null);
  const dragRef = useRef<PoseDrag | null>(null);
  const trayRef = useRef<TrayDrag | null>(null);
  const setDrag = (next: PoseDrag | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const setTray = (next: TrayDrag | null) => {
    trayRef.current = next;
    setTrayState(next);
  };
  const svg = () => dollRef.current?.querySelector("svg") ?? null;
  const decorations: Decoration[] = run.decorations.map((decoration) =>
    drag !== null && drag.id === decoration.id ? { ...decoration, ...drag.pose } : decoration,
  );
  const selected =
    selectedId === NEWEST
      ? decorations[decorations.length - 1]
      : decorations.find((decoration) => decoration.id === selectedId);

  const beginPose = (event: PointerEvent<SVGElement>, decoration: Decoration, gesture: Gesture) => {
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    if (point === null) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(decoration.id);
    const origin = poseOf(decoration);
    setDrag({ id: decoration.id, gesture, pointerId: event.pointerId, start: point, origin, pose: origin });
  };

  const poseAt = (current: PoseDrag, event: PointerEvent<SVGElement>): PoseDrag => {
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    if (point === null) return current;
    const { origin, start } = current;
    let pose: DecorationPose = origin;
    if (current.gesture === "move")
      pose = { ...origin, x: origin.x + point.x - start.x, y: origin.y + point.y - start.y };
    if (current.gesture === "rotate") {
      const angle = (Math.atan2(point.y - origin.y, point.x - origin.x) * 180) / Math.PI + 90;
      pose = { ...origin, rotation: angle };
    }
    if (current.gesture === "scale") {
      const from = Math.max(4, Math.hypot(start.x - origin.x, start.y - origin.y));
      pose = { ...origin, scale: (origin.scale * Math.hypot(point.x - origin.x, point.y - origin.y)) / from };
    }
    return { ...current, pose: clampPose(pose) };
  };

  const movePose = (event: PointerEvent<SVGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setDrag(poseAt(current, event));
  };

  const endPose = (event: PointerEvent<SVGElement>) => {
    const current = dragRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = poseAt(current, event);
    setDrag(null);
    if (!samePose(final.pose, final.origin))
      dispatch({ type: "moveDecoration", decorationId: final.id, ...final.pose });
  };

  const addTrim = (trimId: TrimId, point: SvgPoint | null) => {
    const spot = point ?? { x: DROP_SPOT.x, y: DROP_SPOT.y + (run.decorations.length % 6) * 22 };
    const added = dispatch({ type: "addDecoration", trimId, x: Math.round(spot.x), y: Math.round(spot.y) });
    if (added) setSelectedId(NEWEST);
  };

  const trayDown = (event: PointerEvent<HTMLButtonElement>, trimId: TrimId) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setTray({
      trimId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    });
  };

  const trayAt = (current: TrayDrag, event: PointerEvent<HTMLButtonElement>): TrayDrag => {
    const moved =
      current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 8;
    return { ...current, x: event.clientX, y: event.clientY, moved };
  };

  const trayMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setTray(trayAt(current, event));
  };

  const trayUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const final = trayAt(current, event);
    setTray(null);
    const point = clientToSvg(svg(), event.clientX, event.clientY);
    const onDoll =
      point !== null && point.x >= 0 && point.x <= DOLL_WIDTH && point.y >= 0 && point.y <= DOLL_HEIGHT;
    if (final.moved && !onDoll) return;
    addTrim(final.trimId, final.moved && point !== null ? point : null);
  };

  const handleRadius = 13;
  return (
    <div className="ad-decorate-stage">
      <div className="ad-decorate-stage__side">
        <header>
          <strong>Trim box</strong>
          <span className="ad-muted">Drag onto the dress</span>
        </header>
        <TrimTray
          state={state}
          run={run}
          liftedId={tray?.moved === true ? tray.trimId : null}
          onPointerDown={trayDown}
          onPointerMove={trayMove}
          onPointerUp={trayUp}
          onPointerCancel={() => setTray(null)}
          onKeyboardPick={(trimId) => addTrim(trimId, null)}
        />
        <DecorationControls
          decoration={selected}
          all={run.decorations}
          dispatch={dispatch}
          onDeselect={() => setSelectedId(null)}
        />
      </div>
      <div className="ad-decorate-stage__doll" ref={dollRef} onPointerDown={() => setSelectedId(null)}>
        <DressPreview
          parts={designParts(run.design)}
          fabrics={designFabrics(run.design)}
          trims={decorations}
          selectedTrimId={selected?.id}
          title="Dress with trims"
        >
          <g className="ad-deco-hits">
            {[...decorations]
              .sort((a, b) => a.layer - b.layer)
              .map((decoration) => {
                const extent = TRIM_EXTENT[decoration.trimId];
                const width = Math.max(30, extent.width);
                const height = Math.max(30, extent.height);
                return (
                  <g
                    key={decoration.id}
                    transform={`translate(${decoration.x} ${decoration.y}) rotate(${decoration.rotation}) scale(${decoration.scale})`}
                    data-decoration={decoration.id}
                  >
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      fill="transparent"
                      className="ad-deco-hit"
                      onPointerDown={(event) => beginPose(event, decoration, "move")}
                      onPointerMove={movePose}
                      onPointerUp={endPose}
                      onPointerCancel={() => setDrag(null)}
                    />
                  </g>
                );
              })}
          </g>
          {selected !== undefined ? (
            <g
              className="ad-deco-handles"
              transform={`translate(${selected.x} ${selected.y}) rotate(${selected.rotation})`}
            >
              <line
                x1={0}
                y1={(-TRIM_EXTENT[selected.trimId].height * selected.scale) / 2 - 6}
                x2={0}
                y2={(-TRIM_EXTENT[selected.trimId].height * selected.scale) / 2 - 26}
              />
              <circle
                className="ad-deco-handle ad-deco-handle--rotate"
                cx={0}
                cy={(-TRIM_EXTENT[selected.trimId].height * selected.scale) / 2 - 30}
                r={handleRadius}
                onPointerDown={(event) => beginPose(event, selected, "rotate")}
                onPointerMove={movePose}
                onPointerUp={endPose}
                onPointerCancel={() => setDrag(null)}
                aria-label="Turn"
              />
              <rect
                className="ad-deco-handle ad-deco-handle--scale"
                x={(TRIM_EXTENT[selected.trimId].width * selected.scale) / 2 + 2}
                y={(TRIM_EXTENT[selected.trimId].height * selected.scale) / 2 + 2}
                width={handleRadius * 2}
                height={handleRadius * 2}
                rx={6}
                onPointerDown={(event) => beginPose(event, selected, "scale")}
                onPointerMove={movePose}
                onPointerUp={endPose}
                onPointerCancel={() => setDrag(null)}
                aria-label="Resize"
              />
            </g>
          ) : null}
        </DressPreview>
      </div>
      {tray !== null && tray.moved ? (
        <div
          className="ad-trim-ghost"
          style={{ transform: `translate(${tray.x - 32}px, ${tray.y - 32}px)` }}
          aria-hidden="true"
        >
          <TrimBadge trimId={tray.trimId} size={64} />
        </div>
      ) : null}
      <StageFooter {...props} hint="Looking lovely. Bring it to the final fitting." />
    </div>
  );
}
