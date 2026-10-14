import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { FollowProgress } from "../../../../../engine/followRecord";
import type { Point } from "../../../../../engine/geometry/point";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import { clientToSvg } from "../../../../../ui/kit/clientToSvg";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { SimmerDef } from "../../../content/dish";
import { guidePoint, progressAtTarget, simmerLevel, TICKS_PER_LAP } from "../../../core";
import { LEVEL_LABELS, levelSpot, simmerInstruction } from "../../instructions/simmerInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import "./cook.css";

export interface SimmerPotProps {
  readonly def: SimmerDef;
  readonly laps: number;
  readonly halo: number;
  readonly colour: string;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly stored: FollowProgress | null;
  readonly onProgress?: ((sample: FollowProgress) => void) | undefined;
  readonly onStop: (follow: FollowProgress) => void;
}

const POT_RADIUS = 168;
const LEVEL_X = 430;
const LEVEL_TOP = 40;
const LEVEL_HEIGHT = 320;
const BAND = 0.06;

export function SimmerPot({
  def,
  laps,
  halo,
  colour,
  assisted,
  reducedMotion,
  stored,
  onProgress,
  onStop,
}: SimmerPotProps) {
  const id = useSvgId("ck-pot");
  const { play } = useKitchenSound();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [follow, setFollow] = useState<FollowProgress>(
    () => stored ?? { progress: 0, ticks: 0, insideTicks: 0, assisted: false },
  );
  const followRef = useRef(follow);
  const spoonRef = useRef<Point | null>(null);
  const [spoon, setSpoon] = useState<Point | null>(null);
  const [holding, setHolding] = useState(false);
  const [keyFollow, setKeyFollow] = useState(false);
  const [stopped, setStopped] = useState(false);
  const sentProgress = useRef(stored?.progress ?? 0);
  const helped = useRef(assisted || (stored?.assisted ?? false));

  useEffect(() => {
    if (assisted) helped.current = true;
  }, [assisted]);

  const flush = () => {
    const current = followRef.current;
    if (onProgress === undefined || current.progress <= sentProgress.current) return;
    sentProgress.current = current.progress;
    onProgress({ ...current, assisted: helped.current });
  };

  const stop = () => {
    if (stopped || followRef.current.progress <= 0) return;
    flush();
    setStopped(true);
    setHolding(false);
    play("chime");
    onStop({ ...followRef.current, assisted: helped.current });
  };

  const stirring = (holding || keyFollow) && !stopped && follow.progress < laps;
  useTickLoop(stirring, (count) => {
    let next = followRef.current;
    for (let tick = 0; tick < count && next.progress < laps; tick += 1) {
      const progress = Math.min(laps, Math.round((next.progress + 1 / TICKS_PER_LAP) * 100000) / 100000);
      const guide = guidePoint(def.path, progress % 1);
      const at = keyFollow ? guide : spoonRef.current;
      const inside = at !== null && Math.hypot(at[0] - guide[0], at[1] - guide[1]) <= halo;
      next = {
        progress,
        ticks: next.ticks + 1,
        insideTicks: next.insideTicks + (inside ? 1 : 0),
        assisted: false,
      };
    }
    const lap = Math.floor(followRef.current.progress);
    followRef.current = next;
    setFollow(next);
    if (keyFollow) setSpoon(guidePoint(def.path, next.progress % 1));
    if (Math.floor(next.progress) > lap) {
      play("bubble");
      flush();
    }
    if (assisted && next.progress >= progressAtTarget(laps)) {
      stop();
      return false;
    }
    return next.progress < laps;
  });

  const point = (event: PointerEvent<SVGSVGElement>): Point | null => {
    const svgPoint = clientToSvg(svgRef.current, event.clientX, event.clientY);
    return svgPoint === null ? null : [svgPoint.x, svgPoint.y];
  };

  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (stopped) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const at = point(event);
    spoonRef.current = at;
    setSpoon(at);
    setHolding(true);
  };
  const move = (event: PointerEvent<SVGSVGElement>) => {
    if (!holding) return;
    const at = point(event);
    spoonRef.current = at;
    setSpoon(at);
  };
  const up = () => {
    if (!holding) return;
    setHolding(false);
    flush();
  };
  const keyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== " " || event.repeat || stopped) return;
    event.preventDefault();
    setKeyFollow(true);
  };
  const keyUp = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    setKeyFollow(false);
    flush();
  };

  const guide = guidePoint(def.path, follow.progress % 1);
  const level = simmerLevel(def, laps, follow.progress);
  const levelY = (value: number) => LEVEL_TOP + (1 - value) * LEVEL_HEIGHT;
  const inside = spoon !== null && Math.hypot(spoon[0] - guide[0], spoon[1] - guide[1]) <= halo;
  const share = follow.ticks === 0 ? null : Math.round((follow.insideTicks / follow.ticks) * 100);
  const spot = levelSpot(level, def.targetLevel, BAND);
  const instruction = simmerInstruction({ progress: follow.progress, stirring, stopped, assisted, spot });
  return (
    <div
      className="ck-simmer"
      data-testid="simmer-pot"
      data-progress={follow.progress.toFixed(3)}
      data-level={level.toFixed(3)}
      data-target={def.targetLevel}
      data-guide={`${guide[0].toFixed(1)},${guide[1].toFixed(1)}`}
    >
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {instruction}
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 480 400"
        className="ck-pot"
        role="application"
        tabIndex={0}
        aria-label="The pot. Press and follow the glowing spoon. Hold Space to stir along with it."
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={keyDown}
        onKeyUp={keyUp}
      >
        <defs>
          <radialGradient id={`${id}-soup`} cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor={colour} />
            <stop offset="1" stopColor={colour} stopOpacity={0.75} />
          </radialGradient>
          <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff3c8" stopOpacity={0.85} />
            <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={206} cy={210} r={POT_RADIUS + 14} fill="#0d1215" opacity={0.3} />
        <circle cx={200} cy={200} r={POT_RADIUS + 12} fill="#aeb9bf" stroke="#5f6c73" strokeWidth={4} />
        <path d="M24 200 h-18 M376 200 h18" stroke="#5f6c73" strokeWidth={14} strokeLinecap="round" />
        <circle cx={200} cy={200} r={POT_RADIUS} fill={`url(#${id}-soup)`} />
        {reducedMotion
          ? null
          : [0, 1, 2, 3, 4].map((index) => (
              <circle
                key={index}
                cx={130 + index * 36}
                cy={170 + ((index * 53) % 80)}
                r={6 + (index % 3) * 2}
                fill="#ffffff"
                opacity={0.3}
                className="ck-pot__bubble"
                style={{ animationDelay: `${index * 0.5}s` }}
              />
            ))}
        <circle cx={guide[0]} cy={guide[1]} r={halo} fill={`url(#${id}-halo)`} />
        <circle
          cx={guide[0]}
          cy={guide[1]}
          r={halo}
          fill="none"
          stroke="#f2a93b"
          strokeWidth={2}
          strokeDasharray="4 6"
        />
        <g transform={`translate(${guide[0]} ${guide[1]})`}>
          <ellipse rx={13} ry={9} fill="#fff3c8" stroke="#f2a93b" strokeWidth={2} />
          <path d="M8 -6 L40 -40" stroke="#c9a77a" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        </g>
        {spoon !== null && !stopped ? (
          <g transform={`translate(${spoon[0]} ${spoon[1]})`}>
            <ellipse rx={12} ry={8} fill={inside ? "#4f8a3c" : "#dfe5e8"} stroke="#2e3a40" strokeWidth={2} />
            <path d="M-6 6 L-36 40" stroke="#7a5236" strokeWidth={6} strokeLinecap="round" />
          </g>
        ) : null}
        <g>
          <rect
            x={LEVEL_X - 14}
            y={LEVEL_TOP - 8}
            width={28}
            height={LEVEL_HEIGHT + 16}
            rx={14}
            fill="#2e3a40"
          />
          <rect
            x={LEVEL_X - 18}
            y={levelY(def.targetLevel + BAND)}
            width={36}
            height={levelY(def.targetLevel - BAND) - levelY(def.targetLevel + BAND)}
            rx={4}
            fill="#4f8a3c"
            opacity={0.85}
          />
          <rect
            x={LEVEL_X - 10}
            y={levelY(level)}
            width={20}
            height={LEVEL_TOP + LEVEL_HEIGHT - levelY(level)}
            rx={8}
            fill={colour}
          />
          <path d={`M${LEVEL_X - 22} ${levelY(def.targetLevel)} h44`} stroke="#ffffff" strokeWidth={3} />
          <path
            d={`M${LEVEL_X - 22} ${levelY(def.startLevel)} h44`}
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </g>
      </svg>
      <div className="ck-simmer__controls">
        <span className="ck-simmer__stats" aria-live="polite">
          <span>
            <span className="ad-eyebrow">In the glow</span>
            <strong>{share === null ? "—" : `${share}%`}</strong>
          </span>
          <span>
            <span className="ad-eyebrow">Level</span>
            <strong className={spot === "on" ? "ck-good" : undefined}>{LEVEL_LABELS[spot]}</strong>
          </span>
        </span>
        <button
          type="button"
          className="ck-big-button ck-big-button--stop"
          onClick={stop}
          disabled={stopped || follow.progress <= 0}
          data-testid="off-the-heat"
        >
          Off the heat
        </button>
      </div>
    </div>
  );
}
