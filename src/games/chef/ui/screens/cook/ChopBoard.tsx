import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DifficultyId } from "../../../../../engine/difficulty";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import { useSvgId } from "../../../../../ui/art/useSvgId";
import type { ChopItemDef } from "../../../content/dish";
import { ingredientById, markScore, type ChopRecord } from "../../../core";
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
  readonly onDone: (record: ChopRecord) => void;
}

type Phase = "ready" | "running" | "done";
type Flash = "perfect" | "good" | "miss" | null;

const KNIFE_X = 250;
const MARK_GAP = 58;

export function ChopBoard({
  item,
  difficulty,
  window: chopWindow,
  assisted,
  reducedMotion,
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
        <svg viewBox="0 0 400 260" className="ck-chop__svg" aria-hidden="true">
          <defs>
            <linearGradient id={woodId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e2b77a" />
              <stop offset="1" stopColor="#b98444" />
            </linearGradient>
          </defs>
          <rect
            x={10}
            y={20}
            width={380}
            height={220}
            rx={26}
            fill={`url(#${woodId})`}
            stroke="#8a5a2a"
            strokeWidth={4}
          />
          {[60, 100, 150, 200].map((y) => (
            <path
              key={y}
              d={`M24 ${y} C140 ${y - 8} 260 ${y + 8} 376 ${y}`}
              stroke="#a8743a"
              strokeWidth={2}
              opacity={0.4}
              fill="none"
            />
          ))}
          <g transform={`translate(70 ${200 - Math.min(pile, 12) * 3})`}>
            {Array.from({ length: Math.min(pile, 12) }, (_, index) => (
              <rect
                key={index}
                x={(index % 4) * 13 - 20}
                y={-Math.floor(index / 4) * 9}
                width={12}
                height={9}
                rx={3}
                fill={ingredient.colour}
                stroke={ingredient.accent}
                strokeWidth={1.2}
                className={reducedMotion ? undefined : "ck-chop__piece"}
              />
            ))}
          </g>
          <g transform={`translate(240 130) rotate(${turned ? 90 : 0})`} className="ck-chop__food">
            <g transform="translate(-62 -62)">
              <IngredientIcon ingredientId={item.ingredient} size={124} />
            </g>
          </g>
          {timeline.marks.map((mark, index) => {
            const x = KNIFE_X + (mark - shown) * speed;
            if (offsets[index] !== null || x < 150 || x > 380) return null;
            return (
              <path
                key={index}
                d={`M${x} 60 V200`}
                stroke={mark === nextMark ? "#2e3a40" : "#5f4630"}
                strokeWidth={mark === nextMark ? 4 : 3}
                strokeDasharray="8 6"
              />
            );
          })}
          {timeline.stretch !== null ? (
            <rect
              x={KNIFE_X + (timeline.stretch[0] - shown) * speed}
              y={196}
              width={(timeline.stretch[1] - timeline.stretch[0]) * speed}
              height={14}
              rx={7}
              fill="#4f8a3c"
              opacity={offsets[1] === null ? 0.9 : 0.4}
            />
          ) : null}
          <path d={`M${KNIFE_X} 40 V220`} stroke="#f2a93b" strokeWidth={3} strokeDasharray="4 6" />
          <g
            key={flash.id}
            className={reducedMotion || flash.kind === null ? "ck-knife" : "ck-knife ck-knife--chop"}
            transform={`translate(${KNIFE_X} 0)`}
          >
            <rect x={-6} y={0} width={12} height={34} rx={5} fill="#5a3a24" />
            <path d="M-26 34 L26 34 L26 88 Q0 98 -26 88 Z" fill="#dfe5e8" stroke="#7d8a91" strokeWidth={2} />
            <path d="M-20 42 L-20 82" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
          </g>
        </svg>
        {flash.kind !== null && phase === "running" ? (
          <span key={flash.id} className={`ck-chop__flash ck-chop__flash--${flash.kind}`} aria-hidden="true">
            {flash.kind === "perfect" ? "Perfect!" : flash.kind === "good" ? "Good" : "Close"}
          </span>
        ) : null}
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
        <span className="ck-chop__count">
          {item.cut === "mince"
            ? `${offsets[1] === null ? 0 : 1} of 1 green stretch`
            : `${offsets.filter((offset) => offset !== null).length} of ${timeline.marks.length} cuts`}
        </span>
      </div>
    </div>
  );
}
