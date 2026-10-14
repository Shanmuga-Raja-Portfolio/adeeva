import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { TasteDef } from "../../../content/dish";
import type { JarId } from "../../../content/seasoning";
import {
  COMPASS_REACH,
  jarById,
  MAX_SAVOURY,
  suggestedJar,
  tasteAfter,
  type TasteState,
} from "../../../core";
import { tasteInstruction } from "../../instructions/tasteInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import "./cook.css";

export interface TasteRecordDraft {
  readonly pinches: readonly JarId[];
  readonly tastes: number;
  readonly assisted: boolean;
}

export interface TasteCompassProps {
  readonly def: TasteDef;
  readonly jars: readonly JarId[];
  readonly start: TasteState;
  readonly radius: number;
  readonly helper: boolean;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly onDone: (record: TasteRecordDraft) => void;
}

const CELL = 24;
const SIZE = (COMPASS_REACH * 2 + 1) * CELL;
const PAD = 34;

function toX(value: number): number {
  return PAD + (value + COMPASS_REACH) * CELL + CELL / 2;
}

function toY(value: number): number {
  return PAD + (COMPASS_REACH - value) * CELL + CELL / 2;
}

export function TasteCompass({
  def,
  jars,
  start,
  radius,
  helper,
  assisted,
  reducedMotion,
  onDone,
}: TasteCompassProps) {
  const { play } = useKitchenSound();
  const [pinches, setPinches] = useState<readonly JarId[]>([]);
  const [tastes, setTastes] = useState(0);
  const [revealed, setRevealed] = useState<TasteState | null>(null);
  const [puff, setPuff] = useState(0);
  const helped = useRef(assisted);
  const [served, setServed] = useState(false);

  useEffect(() => {
    if (assisted) helped.current = true;
  }, [assisted]);

  const current = tasteAfter(start, pinches);
  const visible = assisted || helper ? current : revealed;
  const hint = assisted || helper ? suggestedJar(def, jars, current) : null;

  const pinch = (jar: JarId) => {
    if (served || pinches.length >= 20) return;
    play("pop");
    setPinches([...pinches, jar]);
  };
  const taste = () => {
    if (served || tastes >= 20) return;
    play("mm");
    setTastes(tastes + 1);
    setRevealed(current);
    setPuff((value) => value + 1);
  };
  const serve = () => {
    if (served) return;
    setServed(true);
    onDone({ pinches, tastes, assisted: helped.current });
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = Number(event.key) - 1;
    const jar = jars[index];
    if (jar !== undefined) pinch(jar);
    else if (event.key === "t" || event.key === "T") taste();
    else return;
    event.preventDefault();
  };

  return (
    <div
      className="ck-taste"
      onKeyDown={keyDown}
      data-testid="taste-compass"
      data-point={visible === null ? "" : visible.point.join(",")}
      data-savoury={visible === null ? "" : visible.savoury}
      data-target={def.target.join(",")}
      data-target-savoury={def.savoury}
    >
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {tasteInstruction({
          def,
          radius,
          current,
          revealed,
          tastes,
          seeing: assisted || helper,
          suggested: hint,
          served,
        })}
      </p>
      <div className="ck-taste__layout">
        <svg
          viewBox={`0 0 ${SIZE + PAD * 2} ${SIZE + PAD * 2}`}
          className="ck-taste__compass"
          role="img"
          aria-label={
            visible === null
              ? "The Taste Compass. Taste to find where the dish is."
              : `Tasted at ${visible.point[0]}, ${visible.point[1]}. The target circle is at ${def.target[0]}, ${def.target[1]}.`
          }
        >
          <rect x={PAD - 6} y={PAD - 6} width={SIZE + 12} height={SIZE + 12} rx={18} fill="#2f3438" />
          {Array.from({ length: COMPASS_REACH * 2 + 2 }, (_, index) => (
            <g
              key={index}
              stroke="#f3f0e8"
              strokeOpacity={index === COMPASS_REACH || index === COMPASS_REACH + 1 ? 0.2 : 0.07}
            >
              <path d={`M${PAD + index * CELL} ${PAD} V${PAD + SIZE}`} />
              <path d={`M${PAD} ${PAD + index * CELL} H${PAD + SIZE}`} />
            </g>
          ))}
          <path
            d={`M${toX(0)} ${PAD} V${PAD + SIZE} M${PAD} ${toY(0)} H${PAD + SIZE}`}
            stroke="#f3f0e8"
            strokeOpacity={0.35}
            strokeWidth={2}
          />
          <text x={PAD + SIZE + 2} y={toY(0) - 8} textAnchor="end" className="ck-taste__axis">
            Bright
          </text>
          <text x={PAD - 2} y={toY(0) - 8} className="ck-taste__axis">
            Rich
          </text>
          <text x={toX(0) + 8} y={PAD + 16} className="ck-taste__axis">
            Warm
          </text>
          <text x={toX(0) + 8} y={PAD + SIZE - 6} className="ck-taste__axis">
            Gentle
          </text>
          <circle
            cx={toX(def.target[0])}
            cy={toY(def.target[1])}
            r={radius * CELL + 6}
            fill="#4f8a3c"
            fillOpacity={0.3}
            stroke="#7fc46a"
            strokeWidth={3}
          />
          <circle cx={toX(def.target[0])} cy={toY(def.target[1])} r={4} fill="#7fc46a" />
          {visible !== null ? (
            <g>
              <circle
                cx={toX(visible.point[0])}
                cy={toY(visible.point[1])}
                r={11}
                fill="#f2a93b"
                stroke="#fff3c8"
                strokeWidth={3}
              />
              {hint !== null ? (
                <path
                  d={`M${toX(visible.point[0])} ${toY(visible.point[1])} L${toX(visible.point[0] + jarById(hint).vector[0])} ${toY(visible.point[1] + jarById(hint).vector[1])}`}
                  stroke="#fff3c8"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  markerEnd="none"
                />
              ) : null}
              {puff > 0 && !reducedMotion ? (
                <g key={puff} className="ck-taste__puff">
                  <path
                    d={`M${toX(visible.point[0]) - 8} ${toY(visible.point[1]) - 14} q6 -10 0 -20 M${toX(visible.point[0]) + 6} ${toY(visible.point[1]) - 14} q6 -10 0 -20`}
                    stroke="#ffffff"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              ) : null}
            </g>
          ) : (
            <text x={toX(0)} y={toY(0) + 6} textAnchor="middle" className="ck-taste__mystery">
              ?
            </text>
          )}
        </svg>
        <div className="ck-taste__side">
          <div
            className="ck-taste__savoury"
            aria-label={`Savoury ${visible === null ? "unknown" : visible.savoury} of ${MAX_SAVOURY}, hoping for ${def.savoury}`}
          >
            <span className="ad-eyebrow">Savoury</span>
            <span className="ck-taste__dots">
              {Array.from({ length: MAX_SAVOURY }, (_, index) => (
                <span
                  key={index}
                  className={[
                    "ck-taste__dot",
                    visible !== null && index < visible.savoury ? "ck-taste__dot--on" : "",
                    index < def.savoury ? "ck-taste__dot--goal" : "",
                  ].join(" ")}
                />
              ))}
            </span>
          </div>
          <div className="ck-taste__jars" role="group" aria-label="Seasoning jars">
            {jars.map((id, index) => {
              const jar = jarById(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={hint === id ? "ck-jar ck-jar--hint" : "ck-jar"}
                  onClick={() => pinch(id)}
                  disabled={served}
                  data-testid={`jar-${id}`}
                  data-vector={jar.vector.join(",")}
                  data-savoury={jar.savoury}
                >
                  <span className="ck-jar__lid" style={{ background: jar.colour }} />
                  <span className="ck-jar__name">{jar.name}</span>
                  <span className="ck-jar__key" aria-hidden="true">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="ck-taste__pinches" aria-live="polite">
            {pinches.length === 0
              ? "No pinches yet."
              : `${pinches.length} ${pinches.length === 1 ? "pinch" : "pinches"}: ${pinches.map((id) => jarById(id).name.toLowerCase()).join(", ")}`}
          </p>
          <div className="ck-taste__actions">
            <button
              type="button"
              className="ck-big-button ck-big-button--spoon"
              onClick={taste}
              disabled={served}
              data-testid="taste-spoon"
            >
              <Icon name="heart" size={20} /> Taste
            </button>
            <button
              type="button"
              className="ck-pause"
              onClick={() => setPinches(pinches.slice(0, -1))}
              disabled={served || pinches.length === 0}
            >
              Undo last pinch
            </button>
            <button
              type="button"
              className="ck-big-button ck-big-button--go"
              onClick={serve}
              disabled={served || tastes === 0}
              data-testid="taste-done"
            >
              Tastes right!
            </button>
          </div>
          <p className="ck-muted ck-taste__count">Tastes: {tastes}</p>
        </div>
      </div>
    </div>
  );
}
