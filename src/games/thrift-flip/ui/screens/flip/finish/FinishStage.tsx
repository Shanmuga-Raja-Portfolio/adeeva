import { useRef, useState, type PointerEvent } from "react";
import { PlacedLayer } from "../../../../../../ui/art/PlacedLayer";
import { createPortal } from "react-dom";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { clientToSvg, type SvgPoint } from "../../../../../../ui/kit/clientToSvg";
import { HINTS } from "../../../../content/hint";
import {
  findById,
  FINISH_CANVAS,
  FINISH_ROTATION_STEP,
  mainFind,
  markById,
  runKind,
  patchById,
  trimById,
  type FinishItem,
  type FinishPose,
  type FinishRequest,
  type PlacedFinish,
} from "../../../../core";
import { FindArt } from "../../../art/FindArt";
import { finishExtent } from "../../../art/FinishArt";
import { findCloth } from "../../../art/findCloth";
import { ProductPreview } from "../../../art/ProductPreview";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import { FinishDrawer } from "./FinishDrawer";
import { poseOf, samePose, snapPose } from "./finishPose";
import "./finish.css";

type Gesture = "move" | "rotate" | "scale";

interface PoseDrag {
  readonly id: string;
  readonly gesture: Gesture;
  readonly pointerId: number;
  readonly start: SvgPoint;
  readonly origin: FinishPose;
  readonly pose: FinishPose;
  readonly moved: boolean;
}

interface TrayDrag {
  readonly request: FinishRequest;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
}

const CENTRE = FINISH_CANVAS / 2;

function itemName(item: FinishItem | FinishRequest): string {
  if (item.kind === "trim") return trimById(item.trimId).name;
  if (item.kind === "patch") return patchById(item.patchId).name;
  return markById(item.markId).name;
}

export function FinishStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
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
  const main = mainFind(run);
  const cloth = main === null ? null : findCloth(findById(main.findId));
  const finishes = run.finishes.map((finish) =>
    drag !== null && drag.id === finish.id ? { ...finish, ...drag.pose } : finish,
  );
  const active = finishes.find((finish) => finish.id === activeId) ?? finishes[finishes.length - 1];

  const add = (request: FinishRequest, point: SvgPoint | null) => {
    const spot = point ?? { x: CENTRE, y: CENTRE - 40 + (run.finishes.length % 5) * 22 };
    dispatch({ type: "addFinish", finish: request, x: Math.round(spot.x), y: Math.round(spot.y) });
    setActiveId(null);
  };

  const onCanvas = (point: SvgPoint | null): point is SvgPoint =>
    point !== null && point.x >= 0 && point.y >= 0 && point.x <= FINISH_CANVAS && point.y <= FINISH_CANVAS;

  const trayStart = (event: PointerEvent<HTMLButtonElement>, request: FinishRequest) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setTray({
      request,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    });
  };

  const trayMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const moved =
      current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 8;
    setTray({ ...current, x: event.clientX, y: event.clientY, moved });
  };

  const trayEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const current = trayRef.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    setTray(null);
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (!current.moved) add(current.request, null);
    else if (onCanvas(point)) add(current.request, point);
  };

  const beginPose = (event: PointerEvent<SVGElement>, finish: PlacedFinish, gesture: Gesture) => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveId(finish.id);
    const origin = poseOf(finish);
    setDrag({
      id: finish.id,
      gesture,
      pointerId: event.pointerId,
      start: point,
      origin,
      pose: origin,
      moved: false,
    });
  };

  const poseAt = (current: PoseDrag, event: PointerEvent<SVGElement>): PoseDrag => {
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return current;
    const { origin, start } = current;
    const moved = current.moved || Math.hypot(point.x - start.x, point.y - start.y) > 4;
    let pose = origin;
    if (current.gesture === "move")
      pose = { ...origin, x: origin.x + point.x - start.x, y: origin.y + point.y - start.y };
    if (current.gesture === "rotate")
      pose = {
        ...origin,
        rotation: (Math.atan2(point.y - origin.y, point.x - origin.x) * 180) / Math.PI + 90,
      };
    if (current.gesture === "scale") {
      const from = Math.max(4, Math.hypot(start.x - origin.x, start.y - origin.y));
      pose = { ...origin, scale: (origin.scale * Math.hypot(point.x - origin.x, point.y - origin.y)) / from };
    }
    return { ...current, moved, pose: snapPose(pose) };
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
    if (final.gesture === "move" && !final.moved) {
      dispatch({ type: "removeFinish", finishId: final.id });
      setActiveId(null);
      return;
    }
    if (!samePose(final.pose, final.origin))
      dispatch({ type: "moveFinish", finishId: final.id, ...final.pose });
  };

  const adjust = (finish: PlacedFinish, change: Partial<FinishPose>) => {
    const pose = snapPose({ ...poseOf(finish), ...change });
    if (!samePose(pose, poseOf(finish))) dispatch({ type: "moveFinish", finishId: finish.id, ...pose });
  };

  const handle = 18;
  const extent = active === undefined ? null : finishExtent(active.item);
  return (
    <div className="tf-finish">
      <div className="tf-finish__preview">
        <p className="tf-hint">
          <Icon name="sparkle" size={18} />
          {HINTS.finish}
        </p>
        <div className="tf-finish__stage" onPointerDown={() => setActiveId(null)}>
          <ProductPreview
            design={run.design}
            cloth={cloth}
            finishes={finishes}
            selectedId={active?.id}
            title="Your flip with its finishing touches"
            className="tf-finish__svg"
            svgRef={svgRef}
            base={
              runKind(run) !== "flip" && main !== null ? (
                <g transform="translate(60 25)">
                  <FindArt find={findById(main.findId)} grade="like-new" size={280} />
                </g>
              ) : undefined
            }
          >
            <PlacedLayer
              items={finishes}
              className="tf-finish__hits"
              render={(finish) => {
                const size = finishExtent(finish.item);
                const width = Math.max(44, size.width);
                const height = Math.max(44, size.height);
                return (
                  <g
                    transform={`translate(${finish.x} ${finish.y}) rotate(${finish.rotation}) scale(${finish.scale})`}
                    data-finish-id={finish.id}
                  >
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      fill="transparent"
                      className="tf-finish__hit"
                      onPointerDown={(event) => beginPose(event, finish, "move")}
                      onPointerMove={movePose}
                      onPointerUp={endPose}
                      onPointerCancel={() => setDrag(null)}
                    />
                  </g>
                );
              }}
            />
            {active !== undefined && extent !== null ? (
              <g
                className="tf-finish__handles"
                transform={`translate(${active.x} ${active.y}) rotate(${active.rotation})`}
              >
                <line
                  x1={0}
                  y1={(-extent.height * active.scale) / 2 - 6}
                  x2={0}
                  y2={(-extent.height * active.scale) / 2 - 28}
                />
                <circle
                  className="tf-handle"
                  cx={0}
                  cy={(-extent.height * active.scale) / 2 - 34}
                  r={handle}
                  onPointerDown={(event) => beginPose(event, active, "rotate")}
                  onPointerMove={movePose}
                  onPointerUp={endPose}
                  onPointerCancel={() => setDrag(null)}
                />
                <path
                  className="tf-handle-icon"
                  transform={`translate(0 ${(-extent.height * active.scale) / 2 - 34})`}
                  d="M-7 2 A7 7 0 1 0 -2 -6.5 M-2 -6.5 L-7 -8 M-2 -6.5 L-3 -1.5"
                />
                <rect
                  className="tf-handle"
                  x={(extent.width * active.scale) / 2 + 4}
                  y={(extent.height * active.scale) / 2 + 4}
                  width={handle * 2}
                  height={handle * 2}
                  rx={8}
                  onPointerDown={(event) => beginPose(event, active, "scale")}
                  onPointerMove={movePose}
                  onPointerUp={endPose}
                  onPointerCancel={() => setDrag(null)}
                />
                <path
                  className="tf-handle-icon"
                  transform={`translate(${(extent.width * active.scale) / 2 + 4 + handle} ${(extent.height * active.scale) / 2 + 4 + handle})`}
                  d="M-7 -7 L7 7 M-7 -7 L-7 -1 M-7 -7 L-1 -7 M7 7 L7 1 M7 7 L1 7"
                />
              </g>
            ) : null}
          </ProductPreview>
        </div>
      </div>
      <div className="tf-finish__side">
        <FinishDrawer
          state={state}
          onPick={(request) => add(request, null)}
          onDragStart={trayStart}
          onDragMove={trayMove}
          onDragEnd={trayEnd}
          onDragCancel={() => setTray(null)}
        />
        {active !== undefined ? (
          <div className="tf-finish__controls">
            {finishes.length > 1 ? (
              <div className="tf-finish__pick" role="group" aria-label="Choose a finishing touch">
                {finishes.map((finish, index) => (
                  <Button
                    key={finish.id}
                    variant={finish.id === active.id ? "primary" : "secondary"}
                    size="sm"
                    aria-pressed={finish.id === active.id}
                    onClick={() => setActiveId(finish.id)}
                  >
                    {index + 1}. {itemName(finish.item)}
                  </Button>
                ))}
              </div>
            ) : null}
            <strong aria-live="polite">{itemName(active.item)}</strong>
            <div className="tf-finish__buttons">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjust(active, { rotation: active.rotation - FINISH_ROTATION_STEP })}
                aria-label="Turn left"
              >
                ↺
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjust(active, { rotation: active.rotation + FINISH_ROTATION_STEP })}
                aria-label="Turn right"
              >
                ↻
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjust(active, { scale: active.scale - 0.25 })}
                aria-label="Smaller"
              >
                −
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjust(active, { scale: active.scale + 0.25 })}
                aria-label="Bigger"
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "removeFinish", finishId: active.id })}
              >
                Back to stock
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {tray !== null && tray.moved
        ? createPortal(
            <div
              className="tf-finish__ghost"
              style={{ transform: `translate(${tray.x - 28}px, ${tray.y - 28}px)` }}
              aria-hidden="true"
            >
              <Icon name="sparkle" size={28} />
              <span>{itemName(tray.request)}</span>
            </div>,
            document.body,
          )
        : null}
      <StageFooter {...props} hint="Looking wonderful! Take a final look." />
    </div>
  );
}
