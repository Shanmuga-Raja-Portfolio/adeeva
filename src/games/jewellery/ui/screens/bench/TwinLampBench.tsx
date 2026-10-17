import { useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { JointDef } from "../../../content/product";
import {
  COLD_TWIN,
  MAX_JOIN_TICKS,
  twinDone,
  twinSteadyTick,
  twinTick,
  warmthBand,
  type JoinZone,
  type TwinLamp,
  type TwinSeam,
} from "../../../core";
import { JoiningLamp } from "../../art/JoiningLamp";
import type { MetalLook } from "../../art/metalLook";

interface TwinLampBenchProps {
  readonly joints: readonly [JointDef, JointDef];
  readonly zones: readonly [JoinZone, JoinZone];
  readonly warmRate: number;
  readonly assisted: boolean;
  readonly metal: MetalLook;
  readonly reducedMotion: boolean;
  readonly onRecord: (ticks: number, seams: readonly [TwinSeam, TwinSeam], assisted: boolean) => void;
}

const SEAMS = [
  { x: 54, label: "Left" },
  { x: 176, label: "Right" },
] as const;

export function TwinLampBench({
  joints,
  zones,
  warmRate,
  assisted,
  metal,
  reducedMotion,
  onRecord,
}: TwinLampBenchProps) {
  const needed = [joints[0].ticks, joints[1].ticks] as const;
  const [lamp, setLamp] = useState<TwinLamp>(COLD_TWIN);
  const lampRef = useRef<TwinLamp>(lamp);
  const [holding, setHolding] = useState(false);
  const [usedAssist, setUsedAssist] = useState(assisted);
  const recorded = useRef(false);
  const done = twinDone(lamp, needed);
  const tired = !done && lamp.ticks >= MAX_JOIN_TICKS;
  const running = !done && !tired && (holding || assisted || lamp.warmth > 0);

  useTickLoop(running, (count) => {
    let next = lampRef.current;
    for (let tick = 0; tick < count && !twinDone(next, needed) && next.ticks < MAX_JOIN_TICKS; tick += 1)
      next = assisted
        ? twinSteadyTick(next, zones, needed)
        : twinTick(next, holding, warmRate, zones, needed);
    lampRef.current = next;
    setLamp(next);
    if (assisted) setUsedAssist(true);
    if (twinDone(next, needed)) {
      if (!recorded.current) {
        recorded.current = true;
        onRecord(next.ticks, next.seams, assisted || usedAssist);
      }
      return false;
    }
    if (next.ticks >= MAX_JOIN_TICKS) {
      setHolding(false);
      return false;
    }
    return true;
  });

  const press = () => {
    if (!done && !tired) setHolding(true);
  };
  const release = () => setHolding(false);
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      press();
    }
  };
  const keyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      release();
    }
  };
  const restart = () => {
    lampRef.current = COLD_TWIN;
    recorded.current = false;
    setLamp(COLD_TWIN);
    setUsedAssist(assisted);
  };
  const shares = [
    Math.min(1, lamp.seams[0].insideTicks / needed[0]),
    Math.min(1, lamp.seams[1].insideTicks / needed[1]),
  ];
  const bands = [warmthBand(lamp.warmth, zones[0]), warmthBand(lamp.warmth, zones[1])] as const;
  const over = bands[0] === "over" && bands[1] === "over";
  const hint = done
    ? "Both seams joined!"
    : tired
      ? "The lamp needs a rest. Try both again, or join one at a time."
      : over
        ? "Too warm for both! Let go a moment."
        : assisted
          ? "The steady lamp holds the glow where both gold zones meet."
          : "One Warm button, two seams. Find where the gold zones meet!";
  return (
    <div
      className="jb-lamp-bench jb-twin-bench"
      data-testid="twin-bench"
      data-warmth={lamp.warmth.toFixed(3)}
      data-zones={`${zones[0].from.toFixed(3)},${zones[0].to.toFixed(3)},${zones[1].from.toFixed(3)},${zones[1].to.toFixed(3)}`}
      data-progress={shares.map((share) => share.toFixed(3)).join(",")}
    >
      <div className="jb-stats" aria-live="polite">
        {SEAMS.map((side, index) => (
          <span key={side.label}>
            <span className="ad-eyebrow">{side.label} seam</span>
            <strong>{Math.round((shares[index] ?? 0) * 100)}%</strong>
          </span>
        ))}
      </div>
      <div className="jb-lamp-bench__scene">
        <svg
          viewBox="0 0 300 260"
          className="jb-lamp-bench__svg"
          role="img"
          aria-label={`Twin Lamp: left ${Math.round((shares[0] ?? 0) * 100)}%, right ${Math.round((shares[1] ?? 0) * 100)}% joined`}
        >
          <rect x={20} y={180} width={260} height={64} rx={10} fill="#8c8a86" />
          <rect x={20} y={180} width={260} height={64} rx={10} fill="none" stroke="#5f5d59" strokeWidth={2} />
          <JoiningLamp warmth={lamp.warmth} over={over} flicker={!reducedMotion && holding} />
          {SEAMS.map((side, index) => {
            const share = shares[index] ?? 0;
            const inside = bands[index] === "inside";
            return (
              <g key={side.label}>
                <rect x={side.x} y={160} width={70} height={18} rx={9} fill={metal.dark} />
                <rect x={side.x + 2} y={162} width={66} height={13} rx={6.5} fill={metal.mid} />
                <rect
                  x={side.x + 5}
                  y={163}
                  width={60}
                  height={3}
                  rx={1.5}
                  fill={metal.light}
                  opacity={0.7}
                />
                <path
                  d={`M${side.x + 8} 169 L${side.x + 62} 169`}
                  stroke="#2a1d2c"
                  strokeOpacity={0.5}
                  strokeWidth={2.4}
                  strokeDasharray="4 3"
                />
                <path
                  d={`M${side.x + 8} 169 L${side.x + 8 + 54 * share} 169`}
                  stroke="#ffffff"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                {inside && !done ? (
                  <circle
                    cx={side.x + 8 + 54 * share}
                    cy={169}
                    r={5}
                    fill="#fff8d0"
                    className={reducedMotion ? undefined : "jb-twinkle"}
                  />
                ) : null}
              </g>
            );
          })}
          {done ? (
            <g className="jb-lamp-bench__chime">
              <path d="M150 116 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 Z" fill="#fff8d0" />
            </g>
          ) : null}
        </svg>
        <div
          className="jb-warmth"
          role="meter"
          aria-label="Warmth"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(lamp.warmth * 100)}
        >
          {zones.map((zone, index) => (
            <div
              key={index}
              className={
                index === 0
                  ? "jb-warmth__zone jb-warmth__zone--left"
                  : "jb-warmth__zone jb-warmth__zone--right"
              }
              style={{ bottom: `${zone.from * 100}%`, height: `${(zone.to - zone.from) * 100}%` }}
            />
          ))}
          <div
            className={`jb-warmth__fill jb-warmth__fill--${over ? "over" : bands[0] === "inside" || bands[1] === "inside" ? "inside" : "below"}`}
            style={{ height: `${lamp.warmth * 100}%` }}
          />
          <span className="jb-warmth__label">
            Two
            <br />
            zones
          </span>
        </div>
      </div>
      <p className={tired || over ? "jb-hint-line jb-hint-line--warn" : "jb-hint-line"} aria-live="polite">
        {hint}
      </p>
      <div className="jb-tools">
        {!assisted ? (
          <button
            type="button"
            className={holding ? "jb-warm-button jb-warm-button--on" : "jb-warm-button"}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              press();
            }}
            onPointerUp={release}
            onPointerCancel={release}
            onKeyDown={keyDown}
            onKeyUp={keyUp}
            onBlur={release}
            disabled={done || tired}
            data-testid="warm-button"
          >
            <Icon name="sparkle" size={22} /> {holding ? "Warming both…" : "Hold to warm both"}
          </button>
        ) : null}
        <button
          type="button"
          className="ad-button ad-button--secondary"
          onClick={restart}
          disabled={done || lamp.ticks === 0}
          data-testid="restart-twin"
        >
          Start both again
        </button>
      </div>
    </div>
  );
}
