import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import { HINTS } from "../../../content/hints";
import type { JointDef } from "../../../content/product";
import {
  COLD_LAMP,
  joinAccuracy,
  lampTick,
  MAX_JOIN_TICKS,
  warmthBand,
  warmthStep,
  zoneCentre,
  type JoinRecord,
  type JoinZone,
  type LampState,
} from "../../../core";
import { JoiningLamp } from "../../art/JoiningLamp";
import type { MetalLook } from "../../art/metalLook";

interface LampBenchProps {
  readonly joint: JointDef;
  readonly stored: JoinRecord | undefined;
  readonly zone: JoinZone;
  readonly warmRate: number;
  readonly assisted: boolean;
  readonly metal: MetalLook;
  readonly reducedMotion: boolean;
  readonly onRecord: (record: JoinRecord) => void;
  readonly onRestart: () => void;
}

function seededLamp(stored: JoinRecord | undefined): LampState {
  return stored === undefined
    ? COLD_LAMP
    : { warmth: 0, ticks: stored.ticks, insideTicks: stored.insideTicks, overTicks: stored.overTicks };
}

export function LampBench({
  joint,
  stored,
  zone,
  warmRate,
  assisted,
  metal,
  reducedMotion,
  onRecord,
  onRestart,
}: LampBenchProps) {
  const [lamp, setLamp] = useState<LampState>(() => seededLamp(stored));
  const lampRef = useRef<LampState>(lamp);
  const recordedTicks = useRef(stored?.ticks ?? 0);
  const recordRef = useRef(onRecord);
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const done = lamp.insideTicks >= joint.ticks;
  const tired = !done && lamp.ticks >= MAX_JOIN_TICKS;
  const running = !done && (tired ? lamp.warmth > 0 : holding || assisted || lamp.warmth > 0);
  const benchRef = useRef<HTMLDivElement | null>(null);
  const restartRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    recordRef.current = onRecord;
  }, [onRecord]);

  const assistedRef = useRef(assisted);
  const discarded = useRef(false);
  const flush = useRef((wasAssisted: boolean) => {
    const current = lampRef.current;
    if (discarded.current || current.ticks <= recordedTicks.current) return;
    recordedTicks.current = current.ticks;
    recordRef.current({
      ticks: current.ticks,
      insideTicks: current.insideTicks,
      overTicks: current.overTicks,
      assisted: wasAssisted,
      twin: false,
    });
  });

  useEffect(() => {
    if (assistedRef.current === assisted) return;
    flush.current(assistedRef.current);
    assistedRef.current = assisted;
  }, [assisted]);

  useEffect(() => {
    const record = flush.current;
    const latest = assistedRef;
    return () => record(latest.current);
  }, []);

  useTickLoop(running, (count) => {
    let next = lampRef.current;
    for (let tick = 0; tick < count && next.insideTicks < joint.ticks; tick += 1) {
      if (next.ticks >= MAX_JOIN_TICKS) next = { ...next, warmth: warmthStep(next.warmth, false, warmRate) };
      else if (assisted) {
        next = {
          warmth: zoneCentre(zone),
          ticks: next.ticks + 1,
          insideTicks: next.insideTicks + 1,
          overTicks: next.overTicks,
        };
      } else next = lampTick(next, holding, warmRate, zone);
    }
    lampRef.current = next;
    setLamp(next);
    const band = warmthBand(next.warmth, zone);
    if (next.ticks >= MAX_JOIN_TICKS) {
      setHolding(false);
      flush.current(assisted);
      return next.warmth > 0;
    }
    if (band === "over") setHint(HINTS.tooWarm);
    else if (!holding && !assisted && band === "below" && next.ticks > 0) setHint(HINTS.warmMore);
    else setHint(null);
    if (next.insideTicks >= joint.ticks) {
      flush.current(assisted);
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!tired || stored === undefined) return;
    const active = document.activeElement;
    const lost = active === null || active === document.body || active === restartRef.current;
    if (lost || benchRef.current?.contains(active) === true) restartRef.current?.focus();
  }, [tired, stored]);

  const press = () => {
    if (done || tired) return;
    setHolding(true);
  };
  const release = () => {
    if (!holding) return;
    setHolding(false);
    flush.current(assisted);
  };
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

  const progress = Math.min(1, lamp.insideTicks / joint.ticks);
  const band = warmthBand(lamp.warmth, zone);
  const accuracy =
    lamp.insideTicks + lamp.overTicks > 0
      ? joinAccuracy({ ...lamp, assisted: assisted || (stored?.assisted ?? false), twin: false })
      : null;
  const seamStart = 96;
  const seamEnd = 204;
  return (
    <div
      ref={benchRef}
      className="jb-lamp-bench"
      data-testid="lamp-bench"
      data-progress={progress.toFixed(3)}
      data-warmth={lamp.warmth.toFixed(3)}
      data-zone={`${zone.from.toFixed(3)},${zone.to.toFixed(3)}`}
    >
      <div className="jb-stats" aria-live="polite">
        <span>
          <span className="ad-eyebrow">Seam joined</span>
          <strong>{Math.round(progress * 100)}%</strong>
        </span>
        <span>
          <span className="ad-eyebrow">Smooth glow</span>
          <strong>{accuracy === null ? "—" : `${Math.round(accuracy * 100)}%`}</strong>
        </span>
      </div>
      <div className="jb-lamp-bench__scene">
        <svg
          viewBox="0 0 300 260"
          className="jb-lamp-bench__svg"
          role="img"
          aria-label={`${joint.name}: ${Math.round(progress * 100)}% joined`}
        >
          <rect x={30} y={180} width={240} height={64} rx={10} fill="#8c8a86" />
          <rect x={30} y={180} width={240} height={64} rx={10} fill="none" stroke="#5f5d59" strokeWidth={2} />
          <path
            d="M48 196 L120 196 M150 214 L250 214 M60 232 L180 232"
            stroke="#a9a7a2"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <JoiningLamp warmth={lamp.warmth} over={band === "over"} flicker={!reducedMotion && holding} />
          <path
            d={`M${seamStart - 34} 176 Q150 150 ${seamEnd + 34} 176`}
            fill="none"
            stroke={metal.dark}
            strokeWidth={22}
            strokeLinecap="round"
          />
          <path
            d={`M${seamStart - 34} 176 Q150 150 ${seamEnd + 34} 176`}
            fill="none"
            stroke={metal.mid}
            strokeWidth={17}
            strokeLinecap="round"
          />
          <path
            d={`M${seamStart - 30} 172 Q150 146 ${seamEnd + 30} 172`}
            fill="none"
            stroke={metal.light}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.7}
          />
          <path
            d={`M${seamStart} 168 L${seamEnd} 168`}
            stroke="#2a1d2c"
            strokeOpacity={0.55}
            strokeWidth={2.5}
            strokeDasharray="4 3"
          />
          <path
            d={`M${seamStart} 168 L${seamStart + (seamEnd - seamStart) * progress} 168`}
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {progress > 0 && progress < 1 ? (
            <circle
              cx={seamStart + (seamEnd - seamStart) * progress}
              cy={168}
              r={5}
              fill="#fff8d0"
              className={reducedMotion ? undefined : "jb-twinkle"}
            />
          ) : null}
          {done ? (
            <g className="jb-lamp-bench__chime">
              <path d="M150 120 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 Z" fill="#fff8d0" />
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
          <div
            className="jb-warmth__zone"
            style={{ bottom: `${zone.from * 100}%`, height: `${(zone.to - zone.from) * 100}%` }}
          />
          <div
            className={`jb-warmth__fill jb-warmth__fill--${band}`}
            style={{ height: `${lamp.warmth * 100}%` }}
          />
          <span className="jb-warmth__label">
            Gold
            <br />
            zone
          </span>
        </div>
      </div>
      <p
        className={hint === null && !tired ? "jb-hint-line" : "jb-hint-line jb-hint-line--warn"}
        aria-live="polite"
      >
        {done
          ? "Joined! See that little chime?"
          : tired
            ? HINTS.seamTired
            : (hint ??
              (assisted
                ? "The steady lamp keeps the glow just right."
                : "Hold Warm. Keep the glow in the gold zone."))}
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
            <Icon name="sparkle" size={22} /> {holding ? "Warming…" : "Hold to warm"}
          </button>
        ) : null}
        <button
          type="button"
          ref={restartRef}
          className="ad-button ad-button--secondary"
          onClick={() => {
            discarded.current = true;
            onRestart();
          }}
          disabled={done || stored === undefined}
          data-testid="restart-seam"
        >
          Restart this seam
        </button>
      </div>
    </div>
  );
}
