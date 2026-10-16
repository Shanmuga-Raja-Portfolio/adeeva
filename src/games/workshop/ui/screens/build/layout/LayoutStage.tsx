import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "../../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import { useFocusAfterRender } from "../../../../../../ui/kit/useFocusAfterRender";
import { HINTS, SET_HINTS } from "../../../../content/hint";
import type { PartDef } from "../../../../content/product";
import {
  boardNumber,
  designParts,
  isAlongGrain,
  layoutBoards,
  layoutIssues,
  matchedPairs,
  placementIssue,
  runPieces,
  setTemplateById,
  showMeSpot,
  type PartPlacement,
  type QuarterTurn,
} from "../../../../core";
import { BoardSurface } from "../../../art/BoardArt";
import { StageFooter } from "../StageFooter";
import type { StageProps } from "../stageProps";
import {
  benchColumns,
  boardSlots,
  canvasHeight,
  canvasWidth,
  footprint,
  nextTurn,
  slotAt,
  type BoardSlot,
} from "./layoutGeometry";
import { PartTray } from "./PartTray";
import { PlacedPart } from "./PlacedPart";
import "./layout.css";

interface Drag {
  readonly partId: string;
  readonly rotation: QuarterTurn;
  readonly grabX: number;
  readonly grabY: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
  readonly moved: boolean;
  readonly fromBoard: boolean;
}

interface Drop {
  readonly boardId: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: QuarterTurn;
}

const CLICK_SLOP_CM = 1;

function dropFor(slots: readonly BoardSlot[], part: PartDef, drag: Drag): Drop | null {
  const slot = slotAt(slots, drag.x, drag.y);
  if (slot === null) return null;
  const size = footprint(part, drag.rotation);
  const rawX = Math.round(drag.x - drag.grabX - slot.x);
  const rawY = Math.round(drag.y - drag.grabY - slot.y);
  return {
    boardId: slot.board.id,
    x: Math.max(0, Math.min(slot.width - size.width, rawX)),
    y: Math.max(0, Math.min(slot.height - size.height, rawY)),
    rotation: drag.rotation,
  };
}

export function LayoutStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const finishRef = useRef<(drag: Drag) => void>(() => undefined);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [trayTurns, setTrayTurns] = useState<Readonly<Record<string, QuarterTurn>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const focusAfter = useFocusAfterRender();
  const parts = designParts(run);
  const benchBoards = layoutBoards(state, run);
  const columns = benchColumns(benchBoards);
  const slots = boardSlots(benchBoards, columns);
  const height = canvasHeight(slots);
  const issues = layoutIssues(state, run);
  const placedParts = parts.filter((part) => Object.hasOwn(run.placements, part.id));
  const trayParts = parts.filter((part) => !Object.hasOwn(run.placements, part.id));
  const dragPart = drag === null ? undefined : parts.find((part) => part.id === drag.partId);
  const drop = drag === null || dragPart === undefined ? null : dropFor(slots, dragPart, drag);
  const dropSlot = drop === null ? undefined : slots.find((slot) => slot.board.id === drop.boardId);
  const dropOk =
    drop !== null && dragPart !== undefined && placementIssue(state, run, dragPart, drop) === null;
  const showMeReady = showMeSpot(state, run, null) !== null;
  const purpose = run.purpose;
  const matchable = purpose.kind === "set" ? setTemplateById(purpose.templateId).matchablePairs : 0;
  const pairs = purpose.kind === "set" ? matchedPairs(run) : 0;

  const place = (part: PartDef, target: Drop): boolean => {
    const issue = placementIssue(state, run, part, target);
    if (issue !== null) {
      setMessage(issue.message);
      return false;
    }
    dispatch({ type: "placePart", partId: part.id, ...target });
    setMessage(isAlongGrain(target.rotation) ? null : HINTS.turnAcross);
    return true;
  };

  useEffect(() => {
    finishRef.current = (finished: Drag) => {
      const part = parts.find((entry) => entry.id === finished.partId);
      if (part === undefined) return;
      if (!finished.moved) {
        setSelected(finished.fromBoard ? part.id : null);
        return;
      }
      const target = dropFor(slots, part, finished);
      if (target !== null) {
        if (place(part, target)) setSelected(part.id);
        return;
      }
      if (finished.fromBoard) {
        dispatch({ type: "removePart", partId: part.id });
        setSelected(null);
        setMessage(`${part.name} is back in the tray.`);
      }
    };
  });

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
      if (current === null || point === null) return;
      const moved =
        current.moved || Math.hypot(point.x - current.startX, point.y - current.startY) > CLICK_SLOP_CM;
      const next = { ...current, x: point.x, y: point.y, moved };
      dragRef.current = next;
      setDrag(next);
    };
    const up = () => {
      const finished = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (finished !== null) finishRef.current(finished);
    };
    const cancel = () => {
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [dragging]);

  const begin = (next: Drag) => {
    dragRef.current = next;
    setDrag(next);
    setMessage(null);
  };

  const startTrayDrag = (event: ReactPointerEvent, part: PartDef) => {
    event.preventDefault();
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    const rotation = trayTurns[part.id] ?? 0;
    const size = footprint(part, rotation);
    const x = point?.x ?? -100;
    const y = point?.y ?? -100;
    begin({
      partId: part.id,
      rotation,
      grabX: size.width / 2,
      grabY: size.height / 2,
      startX: x,
      startY: y,
      x,
      y,
      moved: false,
      fromBoard: false,
    });
  };

  const startBoardDrag = (
    event: ReactPointerEvent,
    part: PartDef,
    placement: PartPlacement,
    slot: BoardSlot,
  ) => {
    event.preventDefault();
    const point = clientToSvg(svgRef.current, event.clientX, event.clientY);
    if (point === null) return;
    begin({
      partId: part.id,
      rotation: placement.rotation,
      grabX: point.x - (slot.x + placement.x),
      grabY: point.y - (slot.y + placement.y),
      startX: point.x,
      startY: point.y,
      x: point.x,
      y: point.y,
      moved: false,
      fromBoard: true,
    });
  };

  const turnPlaced = (part: PartDef) => {
    const placement = run.placements[part.id];
    const slot =
      placement === undefined ? undefined : slots.find((entry) => entry.board.id === placement.boardId);
    if (placement === undefined || slot === undefined) return;
    const rotation = nextTurn(placement.rotation);
    const size = footprint(part, rotation);
    place(part, {
      boardId: placement.boardId,
      rotation,
      x: Math.max(0, Math.min(slot.width - size.width, placement.x)),
      y: Math.max(0, Math.min(slot.height - size.height, placement.y)),
    });
  };

  const onPartKey = (event: KeyboardEvent, part: PartDef, placement: PartPlacement) => {
    const steps: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      place(part, {
        boardId: placement.boardId,
        rotation: placement.rotation,
        x: placement.x + step[0],
        y: placement.y + step[1],
      });
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      turnPlaced(part);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (dispatch({ type: "removePart", partId: part.id })) {
        setSelected(null);
        focusAfter([`[data-testid="tray-${part.id}"]`]);
      }
    }
  };

  const selectedPart = placedParts.find((part) => part.id === selected);
  const ghostSize = dragPart === undefined || drag === null ? null : footprint(dragPart, drag.rotation);

  return (
    <div className="ww-layout">
      <div className="ww-layout__bench ww-paper">
        <div className="ww-layout__tools">
          <p className="ww-layout__legend">
            <svg viewBox="0 0 60 16" width={60} height={16} aria-hidden="true">
              <path
                d="M2 8 H58 M50 3 L58 8 L50 13 M10 3 L2 8 L10 13"
                stroke="#3f6b4f"
                strokeWidth={2.5}
                fill="none"
              />
            </svg>
            Wood lines run along each board. Long parts love to run the same way.
          </p>
          <div className="ww-layout__buttons">
            <Button
              variant="secondary"
              className="ww-big-button"
              icon="sparkle"
              onClick={() => {
                if (dispatch({ type: "showMe", partId: null })) setMessage(null);
              }}
              disabledReason={
                showMeReady
                  ? undefined
                  : trayParts.length === 0
                    ? "Every part has a spot."
                    : "No free spot for the next part."
              }
              data-testid="show-me"
            >
              Show me
            </Button>
            <Button
              variant="secondary"
              className="ww-big-button"
              onClick={() => {
                if (selectedPart !== undefined) turnPlaced(selectedPart);
              }}
              disabledReason={selectedPart === undefined ? "Tap a part on a board first." : undefined}
              aria-label={selectedPart === undefined ? "Turn the chosen part" : `Turn ${selectedPart.name}`}
            >
              ↻ Turn
            </Button>
            {purpose.kind === "set" ? (
              <Button
                variant="secondary"
                className="ww-big-button"
                onClick={() => {
                  if (dispatch({ type: "planTheRest" }))
                    setMessage("Every part has a spot. Plan the rest scores up to 90%.");
                }}
                disabledReason={trayParts.length === 0 ? "Every part has a spot." : undefined}
                data-testid="plan-the-rest"
              >
                Plan the rest
              </Button>
            ) : null}
          </div>
        </div>
        {purpose.kind === "set" ? (
          <p className="ww-layout__faces" data-testid="matched-faces">
            <strong>
              Matched faces: {Math.min(pairs, matchable)} of {matchable}
            </strong>{" "}
            {matchable === 0 ? "These pieces are too big to share a board." : SET_HINTS.matchFaces}
          </p>
        ) : null}
        <svg
          ref={svgRef}
          className="ww-layout__canvas"
          viewBox={`0 0 ${canvasWidth(columns)} ${height}`}
          data-testid="layout-canvas"
          role="group"
          aria-label="Your boards"
        >
          {slots.map((slot) => (
            <g key={slot.board.id} data-board-id={slot.board.id}>
              <BoardSurface
                woodId={slot.board.woodId}
                width={slot.width}
                height={slot.height}
                knots={slot.board.knots}
                seed={boardNumber(slot.board.id) * 97}
                x={slot.x}
                y={slot.y}
              />
            </g>
          ))}
          {placedParts.map((part) => {
            const placement = run.placements[part.id];
            const slot =
              placement === undefined
                ? undefined
                : slots.find((entry) => entry.board.id === placement.boardId);
            if (placement === undefined || slot === undefined) return null;
            return (
              <PlacedPart
                key={part.id}
                part={part}
                placement={placement}
                slot={slot}
                selected={selected === part.id}
                lifted={drag?.partId === part.id && drag.moved}
                hasIssue={issues.some((entry) => entry.partId === part.id)}
                onPointerDown={(event) => startBoardDrag(event, part, placement, slot)}
                onKeyDown={(event) => onPartKey(event, part, placement)}
                onFocus={() => setSelected(part.id)}
              />
            );
          })}
          {drag !== null && drag.moved && ghostSize !== null ? (
            <rect
              pointerEvents="none"
              x={dropSlot === undefined || drop === null ? drag.x - drag.grabX : dropSlot.x + drop.x}
              y={dropSlot === undefined || drop === null ? drag.y - drag.grabY : dropSlot.y + drop.y}
              width={ghostSize.width}
              height={ghostSize.height}
              rx={0.6}
              className={
                dropOk ? "ww-layout__ghost ww-layout__ghost--ok" : "ww-layout__ghost ww-layout__ghost--bad"
              }
            />
          ) : null}
        </svg>
        <p
          className={message === null ? "ww-layout__message" : "ww-layout__message ww-layout__message--on"}
          role="status"
          aria-live="polite"
        >
          {message ??
            (issues.length === 0
              ? "Every part fits. Lovely plan!"
              : `${trayParts.length} parts left in the tray.`)}
        </p>
      </div>
      <PartTray
        parts={trayParts}
        pieces={runPieces(run)}
        turns={trayTurns}
        draggingId={drag !== null && !drag.fromBoard ? drag.partId : null}
        onTurn={(partId, turn) => setTrayTurns((current) => ({ ...current, [partId]: turn }))}
        onStartDrag={startTrayDrag}
        onPlace={(partId) => {
          if (dispatch({ type: "showMe", partId })) {
            setMessage(null);
            focusAfter([`[data-part-id="${partId}"]`]);
          } else setMessage("No free spot for that part. Try moving the others.");
        }}
      />
      <StageFooter {...props} ready="Every part has a spot. To the sawhorses!" />
    </div>
  );
}
