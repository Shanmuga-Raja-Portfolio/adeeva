import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { clamp } from "../../../../../engine/clamp";
import { Button } from "../../../../../ui/kit/Button";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { HINTS } from "../../../content/hints";
import type { StoneCut } from "../../../content/stone";
import {
  clawCount,
  clawScore,
  isClawBent,
  isSeated,
  seatOutline,
  setAccuracy,
  SNUG_MARK,
  type SetTolerance,
  type StonePose,
} from "../../../core";
import type { MetalLook } from "../../art/metalLook";
import { outlinePath } from "../../art/outlinePath";
import { StoneArt } from "../../art/StoneArt";
import { clawAngles } from "../../art/StoneSeatArt";
import { HoldButton } from "./HoldButton";

interface StoneBenchProps {
  readonly cut: StoneCut;
  readonly hex: string;
  readonly stoneMm: number;
  readonly start: StonePose;
  readonly tolerance: SetTolerance;
  readonly assisted: boolean;
  readonly metal: MetalLook;
  readonly onSet: (pose: StonePose, claws: readonly number[]) => void;
}

type Grab =
  | { readonly kind: "stone"; readonly pointerId: number; readonly dx: number; readonly dy: number }
  | { readonly kind: "turn"; readonly pointerId: number }
  | { readonly kind: "claw"; readonly pointerId: number; readonly index: number };

const VIEW = 16;
const MAX_CLAW = 1.2;
const CLAW_KEY_STEP = 0.02;

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function StoneBench({ cut, hex, stoneMm, start, tolerance, assisted, metal, onSet }: StoneBenchProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pose, setPose] = useState<StonePose>(start);
  const [pressing, setPressing] = useState(false);
  const [claws, setClaws] = useState<readonly number[]>(() =>
    Array.from({ length: clawCount(cut) }, () => 0),
  );
  const [grab, setGrab] = useState<Grab | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const seated = isSeated(pose, cut, tolerance);
  const radius = stoneMm / 2;
  const openRadius = radius + 4;
  const closedRadius = radius * 0.86;
  const angles = clawAngles(cut);
  const turnAngle = ((pose.rotation - 90) * Math.PI) / 180;
  const turnHandle = {
    x: pose.x + Math.cos(turnAngle) * (radius + 3.2),
    y: pose.y + Math.sin(turnAngle) * (radius + 3.2),
  };
  const bent = claws.some(isClawBent);
  const accuracy = pressing ? setAccuracy(pose, claws, cut, tolerance, assisted) : null;

  const pointAt = (event: PointerEvent<Element>) => clientToSvg(svgRef.current, event.clientX, event.clientY);

  const down = (event: PointerEvent<Element>, next: Grab) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setGrab(next);
  };

  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (grab === null || grab.pointerId !== event.pointerId) return;
    const point = pointAt(event);
    if (point === null) return;
    if (grab.kind === "stone") {
      setPose({
        ...pose,
        x: round(clamp(point.x - grab.dx, -11, 11), 2),
        y: round(clamp(point.y - grab.dy, -11, 11), 2),
      });
      return;
    }
    if (grab.kind === "turn") {
      const angle = (Math.atan2(point.y - pose.y, point.x - pose.x) * 180) / Math.PI + 90;
      setPose({ ...pose, rotation: Math.round(((angle + 540) % 360) - 180) });
      return;
    }
    const radians = ((angles[grab.index] ?? 0) * Math.PI) / 180;
    const along = point.x * Math.cos(radians) + point.y * Math.sin(radians);
    const t = clamp((openRadius - along) / (openRadius - closedRadius), 0, MAX_CLAW);
    const next = claws.map((value, index) => (index === grab.index ? round(t, 3) : value));
    setClaws(next);
    setHint(isClawBent(t) ? HINTS.clawBent : null);
  };

  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (grab === null || grab.pointerId !== event.pointerId) return;
    setGrab(null);
  };

  const nudgeTurn = (step: number) =>
    setPose((current) => ({ ...current, rotation: current.rotation + step }));

  const pressClaws = () => {
    if (!seated) {
      setHint(HINTS.nudgeCloser);
      return;
    }
    setHint(null);
    setPressing(true);
  };

  const lift = () => {
    setPressing(false);
    setClaws(claws.map(() => 0));
    setHint(null);
  };

  const tweezers = () => {
    const snapped: StonePose = { x: 0, y: 0, rotation: 0 };
    const snug = claws.map(() => SNUG_MARK);
    setPose(snapped);
    setClaws(snug);
    setPressing(true);
    onSet(snapped, snug);
  };

  const clawKey = (event: KeyboardEvent<SVGGElement>, index: number) => {
    const step =
      event.key === "ArrowUp" || event.key === "ArrowRight"
        ? CLAW_KEY_STEP
        : event.key === "ArrowDown" || event.key === "ArrowLeft"
          ? -CLAW_KEY_STEP
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = claws.map((value, at) =>
      at === index ? round(clamp(value + step, 0, MAX_CLAW), 3) : value,
    );
    setClaws(next);
    setHint(isClawBent(next[index] ?? 0) ? HINTS.clawBent : null);
  };

  const stoneKey = (event: KeyboardEvent<SVGGElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-0.2, 0],
      ArrowRight: [0.2, 0],
      ArrowUp: [0, -0.2],
      ArrowDown: [0, 0.2],
    };
    const delta = moves[event.key];
    if (delta === undefined || pressing) return;
    event.preventDefault();
    setPose({ ...pose, x: round(pose.x + delta[0], 2), y: round(pose.y + delta[1], 2) });
  };

  const ghost = seatOutline(cut).points.map(([x, y]): [number, number] => [
    (x - 0.5) * stoneMm,
    (y - 0.5) * stoneMm,
  ]);
  return (
    <div
      className="jb-stone-bench"
      data-testid="stone-bench"
      data-pose={`${pose.x},${pose.y},${pose.rotation}`}
      data-seated={seated ? "true" : "false"}
    >
      <div className="jb-stats" aria-live="polite">
        <span>
          <span className="ad-eyebrow">In the seat</span>
          <strong>{seated ? "Yes!" : "Not yet"}</strong>
        </span>
        <span>
          <span className="ad-eyebrow">Snug</span>
          <strong>{accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}</strong>
        </span>
      </div>
      <div className="jb-loupe">
        <div className="jb-loupe__glass">
          <svg
            ref={svgRef}
            viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            role="group"
            aria-label="Stone seat"
          >
            <circle r={radius * 1.18} fill={metal.mid} stroke={metal.line} strokeWidth={0.25} />
            <circle r={radius * 1.02} fill={metal.dark} opacity={0.55} />
            <circle r={tolerance.distance} fill="#e8a33d" opacity={0.18} />
            <path
              d={outlinePath(ghost)}
              fill="none"
              stroke="#fff8ea"
              strokeWidth={0.18}
              strokeDasharray="0.5 0.4"
            />
            <g
              transform={`translate(${pose.x} ${pose.y})`}
              className={pressing ? "jb-stone" : "jb-stone jb-stone--loose"}
              onPointerDown={(event) => {
                if (pressing) return;
                const point = pointAt(event);
                if (point !== null)
                  down(event, {
                    kind: "stone",
                    pointerId: event.pointerId,
                    dx: point.x - pose.x,
                    dy: point.y - pose.y,
                  });
              }}
              tabIndex={pressing ? -1 : 0}
              role="button"
              aria-label={`Stone. Use the arrow keys to slide it.${seated ? " It's in the seat." : ""}`}
              onKeyDown={stoneKey}
              data-testid="stone"
            >
              <circle r={Math.max(radius, 2.4)} fill="transparent" />
              <StoneArt
                cut={cut}
                hex={hex}
                x={0}
                y={0}
                size={stoneMm}
                rotation={pose.rotation}
                twinkle={seated}
              />
            </g>
            {!pressing && cut !== "round" ? (
              <g
                transform={`translate(${turnHandle.x} ${turnHandle.y})`}
                className="jb-turn-handle"
                onPointerDown={(event) => down(event, { kind: "turn", pointerId: event.pointerId })}
                data-testid="turn-handle"
              >
                <circle r={2} fill="#1f4e5a" stroke="#fff8ea" strokeWidth={0.25} />
                <path d="M-1 0.3 A1 1 0 1 1 0.6 0.8" fill="none" stroke="#fff8ea" strokeWidth={0.3} />
              </g>
            ) : null}
            {pressing
              ? angles.map((angle, index) => {
                  const radians = (angle * Math.PI) / 180;
                  const t = claws[index] ?? 0;
                  const at = openRadius - (openRadius - closedRadius) * t;
                  const snugAt = openRadius - (openRadius - closedRadius) * SNUG_MARK;
                  const good = clawScore(t, tolerance.band) === 1;
                  return (
                    <g key={angle}>
                      <line
                        x1={Math.cos(radians) * (openRadius + 1)}
                        y1={Math.sin(radians) * (openRadius + 1)}
                        x2={Math.cos(radians) * closedRadius}
                        y2={Math.sin(radians) * closedRadius}
                        stroke="#fff8ea"
                        strokeOpacity={0.4}
                        strokeWidth={0.2}
                        strokeDasharray="0.4 0.3"
                      />
                      <circle
                        cx={Math.cos(radians) * snugAt}
                        cy={Math.sin(radians) * snugAt}
                        r={0.45}
                        fill="#e8a33d"
                      />
                      <g
                        transform={`translate(${Math.cos(radians) * at} ${Math.sin(radians) * at}) rotate(${angle + 90 + (isClawBent(t) ? 25 : 0)})`}
                        className={good ? "jb-claw jb-claw--snug" : "jb-claw"}
                        onPointerDown={(event) =>
                          down(event, { kind: "claw", pointerId: event.pointerId, index })
                        }
                        tabIndex={0}
                        role="slider"
                        aria-label={`Claw ${index + 1}`}
                        aria-valuemin={0}
                        aria-valuemax={120}
                        aria-valuenow={Math.round(t * 100)}
                        onKeyDown={(event) => clawKey(event, index)}
                        data-testid={`claw-${index}`}
                        data-snug={`${(Math.cos(radians) * snugAt).toFixed(3)},${(Math.sin(radians) * snugAt).toFixed(3)}`}
                      >
                        <circle r={2} fill="transparent" />
                        <path
                          d="M-0.8 -1.6 L0.8 -1.6 L0.5 1.4 L-0.5 1.4 Z"
                          fill={metal.mid}
                          stroke={metal.line}
                          strokeWidth={0.2}
                        />
                      </g>
                    </g>
                  );
                })
              : null}
          </svg>
          <div className="jb-loupe__shine" aria-hidden="true" />
        </div>
      </div>
      <p className={hint === null ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"} aria-live="polite">
        {hint ??
          (pressing
            ? bent
              ? HINTS.clawBent
              : "Slide each claw in to the gold dot."
            : "Slide the stone into its seat. Turn it to match the ghost.")}
      </p>
      <div className="jb-tools">
        {assisted ? (
          <Button size="lg" icon="sparkle" onClick={tweezers} data-testid="tweezers">
            Use the gentle tweezers
          </Button>
        ) : pressing ? (
          <>
            <Button variant="ghost" onClick={lift}>
              Lift the stone
            </Button>
            <Button
              size="lg"
              icon="check"
              onClick={() => onSet(pose, claws)}
              disabledReason={claws.some((claw) => claw === 0) ? "Press every claw first." : undefined}
              data-testid="seat-done"
            >
              Stone is set
            </Button>
          </>
        ) : (
          <>
            {cut !== "round" ? (
              <>
                <HoldButton label="Turn left one degree" onStep={() => nudgeTurn(-1)}>
                  ⟲ 1°
                </HoldButton>
                <HoldButton label="Turn right one degree" onStep={() => nudgeTurn(1)}>
                  ⟳ 1°
                </HoldButton>
              </>
            ) : null}
            <Button size="lg" onClick={pressClaws} data-testid="press-claws" aria-disabled={!seated}>
              Press claws
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
