import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useSettings } from "../../../../../../studio/SettingsContext";
import { useSvgId } from "../../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../../ui/kit/clientToSvg";
import { useElementSize } from "../../../../../../ui/kit/useElementSize";
import { useTickLoop } from "../../../../../../ui/kit/useTickLoop";
import type { JointKindId } from "../../../../content/jointKind";
import type { WoodId } from "../../../../content/wood";
import { gateValue, jointError, type JointPose } from "../../../../core";
import { FixedPiece, GhostPiece, MovingPiece, MOVING_LENGTH_MM } from "../../../art/JointCloseUp";
import { MalletArt, MalletRing } from "../../../art/MalletArt";
import { woodLook } from "../../../art/woodLook";
import { WoodPattern } from "../../../art/WoodPattern";

interface JoinBenchProps {
  readonly kind: JointKindId;
  readonly woodId: WoodId;
  readonly targetAngle: number;
  readonly tolerance: { readonly offsetMm: number; readonly angleDeg: number };
  readonly startPose: JointPose;
  readonly taps: number;
  readonly magnet: boolean;
  readonly onSeat: (pose: JointPose, goodTaps: number) => void;
  readonly onHint: (text: string) => void;
}

const ANCHOR_X = 58;
const ANCHOR_Y = 54;
const RING_PERIOD = 1.1;
const RING_START = 34;
const RING_END = 6;
const RING_TARGET = 12;
const RING_WINDOW = 4.5;
const MM_PER_STEP = 1;
const VIEW_WIDTH = 160;
const VIEW_HEIGHT = 108;
const HANDLE_RADIUS = 4.2;
const HANDLE_TARGET_PX = 48;

type Grab = { readonly kind: "move"; readonly dx: number; readonly dy: number } | { readonly kind: "turn" };

function ringRadius(phase: number): number {
  return RING_START - (RING_START - RING_END) * phase;
}

export function JoinBench({
  kind,
  woodId,
  targetAngle,
  tolerance,
  startPose,
  taps,
  magnet,
  onSeat,
  onHint,
}: JoinBenchProps) {
  const { reducedMotion } = useSettings();
  const id = useSvgId("ww-joint");
  const svgRef = useRef<SVGSVGElement>(null);
  const [handPose, setPose] = useState<JointPose>(startPose);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [tapsDone, setTapsDone] = useState(0);
  const [goodTaps, setGoodTaps] = useState(0);
  const [phase, setPhase] = useState(0);
  const [wobble, setWobble] = useState(0);
  const holdRef = useRef<number | null>(null);
  const svgSize = useElementSize(svgRef, { width: VIEW_WIDTH * 4, height: VIEW_HEIGHT * 4 });
  const pxPerUnit = Math.max(0.01, Math.min(svgSize.width / VIEW_WIDTH, svgSize.height / VIEW_HEIGHT));
  const handleHitRadius = Math.max(HANDLE_RADIUS, HANDLE_TARGET_PX / 2 / pxPerUnit);
  const pose: JointPose = magnet ? { x: 0, y: 0, angle: targetAngle } : handPose;
  const locked = magnet || tapsDone > 0;
  const error = jointError(pose, targetAngle);
  const gate = gateValue(error, tolerance);
  const ready = gate <= 1;
  const ringRunning = ready && !reducedMotion && tapsDone < taps;
  const radius = reducedMotion ? RING_TARGET : ringRadius(phase);
  const inWindow = Math.abs(radius - RING_TARGET) <= RING_WINDOW;

  useTickLoop(ringRunning, (_, seconds) => {
    setPhase((current) => (current + seconds / RING_PERIOD) % 1);
    return true;
  });

  useEffect(
    () => () => {
      if (holdRef.current !== null) window.clearInterval(holdRef.current);
    },
    [],
  );

  const point = (event: PointerEvent) => clientToSvg(svgRef.current, event.clientX, event.clientY);

  const startMove = (event: PointerEvent<SVGGElement>) => {
    if (locked) return;
    const at = point(event);
    if (at === null) return;
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    setGrab({ kind: "move", dx: at.x - (ANCHOR_X + pose.x), dy: at.y - (ANCHOR_Y + pose.y) });
  };

  const startTurn = (event: PointerEvent<SVGGElement>) => {
    if (locked) return;
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    setGrab({ kind: "turn" });
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (grab === null) return;
    const at = point(event);
    if (at === null) return;
    if (grab.kind === "move")
      setPose((current) => ({
        ...current,
        x: Math.round((at.x - grab.dx - ANCHOR_X) * 10) / 10,
        y: Math.round((at.y - grab.dy - ANCHOR_Y) * 10) / 10,
      }));
    else {
      const angle = (Math.atan2(at.y - (ANCHOR_Y + pose.y), at.x - (ANCHOR_X + pose.x)) * 180) / Math.PI;
      setPose((current) => ({ ...current, angle: Math.round(angle * 10) / 10 }));
    }
  };

  const end = () => setGrab(null);

  const turnBy = (degrees: number) => {
    if (locked) return;
    setPose((current) => ({ ...current, angle: Math.round((current.angle + degrees) * 10) / 10 }));
  };

  const holdTurn = (degrees: number) => {
    turnBy(degrees);
    if (holdRef.current !== null) window.clearInterval(holdRef.current);
    holdRef.current = window.setInterval(() => turnBy(degrees), 140);
  };

  const releaseTurn = () => {
    if (holdRef.current !== null) window.clearInterval(holdRef.current);
    holdRef.current = null;
  };

  const onKey = (event: KeyboardEvent) => {
    const steps: Readonly<Record<string, readonly [number, number, number]>> = {
      ArrowLeft: [-MM_PER_STEP, 0, 0],
      ArrowRight: [MM_PER_STEP, 0, 0],
      ArrowUp: [0, -MM_PER_STEP, 0],
      ArrowDown: [0, MM_PER_STEP, 0],
      q: [0, 0, -1],
      e: [0, 0, 1],
    };
    const step = steps[event.key];
    if (step === undefined || locked) return;
    event.preventDefault();
    setPose((current) => ({
      x: current.x + step[0],
      y: current.y + step[1],
      angle: current.angle + step[2],
    }));
  };

  const tap = () => {
    if (!ready) {
      onHint("Nudge it a little closer.");
      return;
    }
    const good = reducedMotion || inWindow;
    const done = tapsDone + 1;
    const nextGood = goodTaps + (good ? 1 : 0);
    setTapsDone(done);
    setGoodTaps(nextGood);
    setWobble((value) => value + 1);
    onHint(good ? "Tock! Nice timing." : "Tock! Try when the ring meets the circle.");
    if (done >= taps) onSeat(pose, nextGood);
  };

  const ghostTransform = `translate(${ANCHOR_X} ${ANCHOR_Y}) rotate(${targetAngle})`;
  const partTransform = `translate(${ANCHOR_X + pose.x} ${ANCHOR_Y + pose.y}) rotate(${pose.angle})`;
  const handleX = ANCHOR_X + pose.x + Math.cos((pose.angle * Math.PI) / 180) * MOVING_LENGTH_MM;
  const handleY = ANCHOR_Y + pose.y + Math.sin((pose.angle * Math.PI) / 180) * MOVING_LENGTH_MM;
  return (
    <div className="ww-join-bench">
      <svg
        ref={svgRef}
        className="ww-join-bench__svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        data-testid="join-bench"
        data-gate={gate.toFixed(3)}
        data-angle={(pose.angle - targetAngle).toFixed(1)}
        role="group"
        aria-label="Joint close-up"
      >
        <defs>
          <WoodPattern id={`${id}-wood`} look={woodLook(woodId)} seed={41} tile={18} />
        </defs>
        <rect x={0} y={0} width={VIEW_WIDTH} height={VIEW_HEIGHT} className="ww-join-bench__mat" />
        <g transform={`translate(${ANCHOR_X} ${ANCHOR_Y})`}>
          <FixedPiece kind={kind} fill={`url(#${id}-wood)`} />
        </g>
        <g transform={ghostTransform} data-testid="joint-ghost">
          <GhostPiece kind={kind} />
          <circle
            cx={MOVING_LENGTH_MM / 2}
            cy={0}
            r={1.4}
            className="ww-join-bench__ghost-dot"
            data-testid="joint-ghost-anchor"
          />
        </g>
        <g
          className={
            grab?.kind === "move" ? "ww-join-bench__part ww-join-bench__part--held" : "ww-join-bench__part"
          }
          transform={partTransform}
          onPointerDown={startMove}
          tabIndex={0}
          role="button"
          aria-label="Moving part. Drag it onto its shadow. Arrow keys slide it, Q and E turn it."
          onKeyDown={onKey}
          data-testid="joint-part"
        >
          <g key={wobble} className={wobble > 0 ? "ww-join-bench__wobble" : undefined}>
            <MovingPiece kind={kind} fill={`url(#${id}-wood)`} />
          </g>
          <circle cx={MOVING_LENGTH_MM / 2} cy={0} r={1.2} fill="#2f2622" data-testid="joint-anchor" />
        </g>
        <g
          className="ww-join-bench__handle"
          transform={`translate(${handleX} ${handleY})`}
          onPointerDown={startTurn}
          data-testid="joint-turn"
        >
          <circle r={handleHitRadius} className="ww-join-bench__hit" />
          <circle r={HANDLE_RADIUS} />
          <path d="M-2 -1.5 A2.4 2.4 0 1 1 -2.2 1.6" fill="none" stroke="#fff" strokeWidth={0.8} />
        </g>
        {ready ? (
          <g transform={`translate(${ANCHOR_X - 2} ${ANCHOR_Y})`}>
            <MalletRing radius={radius} targetRadius={RING_TARGET} good={reducedMotion || inWindow} />
          </g>
        ) : null}
      </svg>
      <div className="ww-join-bench__controls">
        <div className="ww-join-bench__turns" role="group" aria-label="Turn the part">
          <button
            type="button"
            className="ww-join-bench__turn"
            onPointerDown={() => holdTurn(-1)}
            onPointerUp={releaseTurn}
            onPointerLeave={releaseTurn}
            onKeyDown={(event) => (event.key === "Enter" || event.key === " " ? turnBy(-1) : undefined)}
            aria-label="Turn one degree left"
            data-testid="turn-left"
          >
            ⟲ 1°
          </button>
          <button
            type="button"
            className="ww-join-bench__turn"
            onPointerDown={() => holdTurn(1)}
            onPointerUp={releaseTurn}
            onPointerLeave={releaseTurn}
            onKeyDown={(event) => (event.key === "Enter" || event.key === " " ? turnBy(1) : undefined)}
            aria-label="Turn one degree right"
            data-testid="turn-right"
          >
            1° ⟳
          </button>
        </div>
        <div className="ww-join-bench__gauge" aria-live="polite">
          <span
            className={ready ? "ww-join-bench__light ww-join-bench__light--on" : "ww-join-bench__light"}
          />
          {ready
            ? `Snug! Tap ${taps - tapsDone} more ${taps - tapsDone === 1 ? "time" : "times"}.`
            : "Slide and turn it onto the shadow."}
        </div>
        <button
          type="button"
          className={ready ? "ww-mallet ww-mallet--ready" : "ww-mallet"}
          onClick={tap}
          aria-label="Tap with the mallet"
          data-testid="mallet"
        >
          <span
            key={wobble}
            className={
              wobble > 0 && !reducedMotion ? "ww-mallet__head ww-mallet__head--swing" : "ww-mallet__head"
            }
          >
            <MalletArt size={40} />
          </span>
          <span className="ww-mallet__count">
            {tapsDone}/{taps}
          </span>
        </button>
      </div>
    </div>
  );
}
