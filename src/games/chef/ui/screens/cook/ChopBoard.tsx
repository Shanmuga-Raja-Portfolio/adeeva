import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import type { ChopItemDef } from "../../../content/dish";
import { ingredientById, markScore, type ChopRecord } from "../../../core";
import { ChefKnife } from "../../art/ChefKnife";
import { ChopPile } from "../../art/ChopPile";
import { IngredientIcon } from "../../art/IngredientIcon";
import { chopBoardLabel, chopInstruction } from "../../instructions/chopInstruction";
import { useKitchenSound } from "../../sound/SoundContext";
import { assignTap, chopTimeline, clampOffset } from "./chopTimeline";
import "./cook.css";

export interface ChopBoardProps {
  readonly item: ChopItemDef;
  readonly difficulty: DifficultyId;
  readonly window: number;
  readonly assisted: boolean;
  readonly reducedMotion: boolean;
  readonly hand: string;
  readonly onDone: (record: ChopRecord) => void;
}

type Phase = "ready" | "running" | "done";
type Flash = "perfect" | "good" | "miss" | null;

const KNIFE_X = 380;
const MARK_GAP = 58;

export function ChopBoard({
  item,
  difficulty,
  window: chopWindow,
  assisted,
  reducedMotion,
  hand,
  onDone,
}: ChopBoardProps) {
  const timeline = chopTimeline(item, difficulty);
  const woodId = useSvgId("ck-wood");
  const { play } = useKitchenSound();
  const [phase, setPhase] = useState<Phase>("ready");
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState(0);
  const [offsets, setOffsets] = useState<(number | null)[]>(() =>
    Array.from({ length: item.cut === "mince" ? 2 : timeline.marks.length }, () => null),
  );
  const [flash, setFlash] = useState<{ readonly kind: Flash; readonly id: number }>({ kind: null, id: 0 });
  const [pile, setPile] = useState(0);
  const [pressing, setPressing] = useState(false);
  const clockRef = useRef(0);
  const offsetsRef = useRef(offsets);
  const pressRef = useRef<number | null>(null);
  const holdRef = useRef(false);
  const usedAssist = useRef(assisted);
  const finished = useRef(false);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assisted) usedAssist.current = true;
  }, [assisted]);

  const commit = (next: (number | null)[]) => {
    offsetsRef.current = next;
    setOffsets(next);
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setPhase("done");
    const record = { offsets: offsetsRef.current, assisted: usedAssist.current };
    if (record.offsets.every((offset) => offset !== null && Math.abs(offset) <= chopWindow)) play("sparkle");
    onDone(record);
  };

  const chopAt = (at: number) => {
    const next = assignTap(timeline.marks, offsetsRef.current, at, chopWindow);
    if (next === null) return;
    const changed = next.findIndex((entry, index) => entry !== offsetsRef.current[index]);
    commit(next);
    const offset = next[changed] ?? null;
    const score = markScore(offset, chopWindow);
    play("thunk");
    setPile((count) => count + 1);
    setFlash((current) => ({
      kind: score === 1 ? "perfect" : score > 0 ? "good" : "miss",
      id: current.id + 1,
    }));
  };

  const press = () => {
    if (phase !== "running" || paused) return;
    if (item.cut === "mince") {
      if (pressRef.current !== null || offsetsRef.current[0] !== null) return;
      pressRef.current = clockRef.current;
      setPressing(true);
      const stretch = timeline.stretch;
      if (stretch !== null) commit([clampOffset(clockRef.current - stretch[0]), null]);
      return;
    }
    if (assisted) {
      holdRef.current = true;
      setPressing(true);
      return;
    }
    chopAt(clockRef.current);
  };

  const release = () => {
    holdRef.current = false;
    setPressing(false);
    if (item.cut !== "mince" || pressRef.current === null || offsetsRef.current[1] !== null) return;
    const stretch = timeline.stretch;
    if (stretch === null) return;
    pressRef.current = null;
    commit([offsetsRef.current[0] ?? null, clampOffset(clockRef.current - stretch[1])]);
    play("thunk");
    finish();
  };

  useTickLoop(phase === "running" && !paused, (_count, seconds) => {
    const now = clockRef.current + seconds * 1000;
    clockRef.current = now;
    setClock(now);
    const stretch = timeline.stretch;
    if (stretch !== null && assisted && !finished.current) {
      if (pressRef.current === null && offsetsRef.current[0] === null && now >= stretch[0]) {
        pressRef.current = now;
        commit([0, null]);
        setPressing(true);
      }
      if (pressRef.current !== null && now >= stretch[1]) {
        commit([offsetsRef.current[0] ?? 0, 0]);
        pressRef.current = null;
        setPressing(false);
        finish();
        return false;
      }
    }
    if (holdRef.current && item.cut !== "mince") {
      const due = timeline.marks.findIndex(
        (mark, index) => offsetsRef.current[index] === null && mark <= now,
      );
      const mark = timeline.marks[due];
      if (mark !== undefined && now - mark < chopWindow) chopAt(mark);
    }
    if (now >= timeline.endsAt) {
      if (stretch !== null && pressRef.current !== null)
        commit([offsetsRef.current[0] ?? null, clampOffset(now - stretch[1])]);
      finish();
      return false;
    }
    return true;
  });

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== " " || event.repeat) return;
    event.preventDefault();
    press();
  };
  const keyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    release();
  };

  const speed = MARK_GAP / timeline.beat;
  const shown = reducedMotion ? Math.floor(clock / timeline.beat) * timeline.beat : clock;
  const turned = timeline.turnAt !== null && clock >= timeline.turnAt;
  const ingredient = ingredientById(item.ingredient);
  const instruction = chopInstruction({ cut: item.cut, stage: phase, assisted, paused, turned, pressing });
  const nextMark = timeline.marks.find(
    (mark, index) => offsets[index] === null && mark >= clock - chopWindow,
  );
  return (
    <div
      className="ck-chop"
      data-testid="chop-board"
      data-clock={Math.round(clock)}
      data-marks={JSON.stringify(timeline.marks.map(Math.round))}
      data-stretch={JSON.stringify(timeline.stretch?.map(Math.round) ?? null)}
      data-turn={timeline.turnAt === null ? "" : Math.round(timeline.turnAt)}
      data-phase={phase}
    >
      <p className="ck-chop__hint" aria-live="polite" data-testid="station-instruction">
        {instruction}
      </p>
      <div className="ck-chop__counter">
        <div
          className={pressing ? "ck-chop__board ck-chop__board--pressed" : "ck-chop__board"}
          role="button"
          tabIndex={0}
          ref={surfaceRef}
          aria-label={chopBoardLabel(item.cut, assisted, ingredient.name.toLowerCase())}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            press();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onKeyDown={keyDown}
          onKeyUp={keyUp}
          data-testid="chop-surface"
        >
          <svg viewBox="0 0 600 300" className="ck-chop__svg" aria-hidden="true">
            <defs>
              <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ecc68c" />
                <stop offset="0.55" stopColor="#d6a462" />
                <stop offset="1" stopColor="#b47a3c" />
              </linearGradient>
            </defs>
            <rect x={20} y={38} width={568} height={256} rx={30} fill="#7a4a22" opacity={0.9} />
            <rect
              x={14}
              y={26}
              width={572}
              height={258}
              rx={30}
              fill={`url(#${woodId})`}
              stroke="#8a5a2a"
              strokeWidth={3}
            />
            {[156, 300, 444].map((x) => (
              <g key={x}>
                <path d={`M${x} 30 V280`} stroke="#8a5a2a" strokeWidth={2.4} opacity={0.4} />
                <path d={`M${x + 2} 30 V280`} stroke="#ffe2b0" strokeWidth={1} opacity={0.35} />
              </g>
            ))}
            {[52, 70, 88, 104, 122, 140, 158, 176, 192, 210, 228, 246, 264].map((y, index) => (
              <path
                key={y}
                d={`M30 ${y} C140 ${y - 8 + (index % 3) * 5} 320 ${y + 9 - (index % 4) * 3} 570 ${y - 3 + (index % 2) * 4}`}
                stroke={index % 3 === 0 ? "#9a6430" : "#b88448"}
                strokeWidth={index % 3 === 0 ? 2.2 : 1.2}
                opacity={index % 3 === 0 ? 0.45 : 0.3}
                fill="none"
              />
            ))}
            {[
              [92, 96],
              [508, 214],
            ].map(([x = 0, y = 0]) => (
              <g key={x} transform={`translate(${x} ${y})`} opacity={0.5}>
                <ellipse rx={16} ry={7} fill="none" stroke="#8a5a2a" strokeWidth={2} />
                <ellipse rx={8} ry={3.5} fill="#a8743a" />
              </g>
            ))}
            {[
              [214, 70, 30],
              [470, 92, -20],
              [236, 236, 12],
              [520, 160, 40],
            ].map(([x = 0, y = 0, turn = 0]) => (
              <path
                key={`${x}-${y}`}
                d={`M${x - 14} ${y} H${x + 14}`}
                transform={`rotate(${turn} ${x} ${y})`}
                stroke="#fff1d6"
                strokeWidth={1.4}
                opacity={0.5}
                strokeLinecap="round"
              />
            ))}
            <rect
              x={34}
              y={44}
              width={532}
              height={222}
              rx={20}
              fill="none"
              stroke="#a8743a"
              strokeWidth={3}
              opacity={0.45}
            />
            <rect
              x={36}
              y={46}
              width={528}
              height={218}
              rx={19}
              fill="none"
              stroke="#ffe2b0"
              strokeWidth={1.2}
              opacity={0.6}
            />
            <path d="M44 40 Q300 30 556 40" stroke="#fff3d6" strokeWidth={4} opacity={0.45} fill="none" />
            <g transform="translate(140 180)">
              <ChopPile
                count={pile}
                cut={item.cut}
                colour={ingredient.colour}
                accent={ingredient.accent}
                animated={!reducedMotion}
              />
            </g>
            <ellipse cx={KNIFE_X} cy={236} rx={78} ry={14} fill="#5a3412" opacity={0.2} />
            <g transform={`translate(${KNIFE_X} 160) rotate(${turned ? 90 : 0})`} className="ck-chop__food">
              <g transform="translate(-80 -80)">
                <IngredientIcon ingredientId={item.ingredient} size={160} />
              </g>
            </g>
            {timeline.marks.map((mark, index) => {
              const x = KNIFE_X + (mark - shown) * speed;
              if (offsets[index] !== null || x < 250 || x > 570) return null;
              const next = mark === nextMark;
              const tone = next ? "#d9472b" : "#8a6a4a";
              return (
                <g key={index} opacity={next ? 1 : 0.5}>
                  <path d={`M${x} 70 V250`} stroke="#fffaf0" strokeWidth={next ? 10 : 5} opacity={0.75} />
                  <path
                    d={`M${x} 70 V250`}
                    stroke={tone}
                    strokeWidth={next ? 5 : 3}
                    strokeDasharray={next ? "12 7" : "4 8"}
                    strokeLinecap="round"
                  />
                  <path
                    d={`M${x - 9} 56 H${x + 9} L${x} 70 Z`}
                    fill={tone}
                    stroke="#fffaf0"
                    strokeWidth={2}
                  />
                  {next ? (
                    <g transform={`translate(${x} 262)`}>
                      <rect
                        x={-27}
                        y={-12}
                        width={54}
                        height={24}
                        rx={12}
                        fill={tone}
                        stroke="#fffaf0"
                        strokeWidth={2}
                      />
                      <text y={5} textAnchor="middle" className="ck-chop__tag">
                        next
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
            {timeline.stretch !== null ? (
              <rect
                x={KNIFE_X + (timeline.stretch[0] - shown) * speed}
                y={252}
                width={(timeline.stretch[1] - timeline.stretch[0]) * speed}
                height={14}
                rx={7}
                fill="#4f8a3c"
                opacity={offsets[1] === null ? 0.9 : 0.4}
              />
            ) : null}
            <path d={`M${KNIFE_X} 40 V276`} stroke="#ffd387" strokeWidth={9} opacity={0.35} />
            <path d={`M${KNIFE_X} 40 V276`} stroke="#f2a93b" strokeWidth={4} strokeDasharray="6 6" />
            <g transform={`translate(${KNIFE_X} 0)`}>
              <g
                key={flash.id}
                className={reducedMotion || flash.kind === null ? "ck-knife" : "ck-knife ck-knife--chop"}
              >
                <ChefKnife hand={hand} moving={phase === "running"} />
              </g>
            </g>
          </svg>
          {flash.kind !== null && phase === "running" ? (
            <span
              key={flash.id}
              className={`ck-chop__flash ck-chop__flash--${flash.kind}`}
              aria-hidden="true"
            >
              {flash.kind === "perfect" ? "Perfect!" : flash.kind === "good" ? "Good" : "Close"}
            </span>
          ) : null}
        </div>
      </div>
      <div className="ck-chop__controls">
        {phase === "ready" ? (
          <button
            key="start"
            type="button"
            className="ck-big-button"
            onClick={() => {
              setPhase("running");
              surfaceRef.current?.focus();
            }}
            data-testid="chop-start"
          >
            <Icon name="sparkle" size={22} /> Start chopping
          </button>
        ) : (
          <button
            key="pause"
            type="button"
            className="ck-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            disabled={phase === "done"}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        {item.cut === "mince" ? null : (
          <ol className="ck-chop__beads" aria-hidden="true">
            {offsets.map((offset, index) => {
              const score = offset === null ? null : markScore(offset, chopWindow);
              const tone = score === null ? "todo" : score === 1 ? "perfect" : score > 0 ? "good" : "miss";
              return <li key={index} className={`ck-chop__bead ck-chop__bead--${tone}`} />;
            })}
          </ol>
        )}
        <span className="ck-chop__count">
          {item.cut === "mince"
            ? `${offsets[1] === null ? 0 : 1} of 1 green stretch`
            : `${offsets.filter((offset) => offset !== null).length} of ${timeline.marks.length} cuts`}
        </span>
      </div>
    </div>
  );
}
