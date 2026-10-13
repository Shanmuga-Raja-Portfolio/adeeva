import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { followAccuracy, type FollowProgress } from "../../../../../engine/followRecord";
import { useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { MixDef } from "../../../content/mix";
import { lapDirection, type Action } from "../../../core";
import { MixingBowl } from "../../art/MixingBowl";
import { resumeStir, stirTick, type StirSim } from "./stirSimulation";

const KEY_LEAD = 0.3;

export interface StirBowlProps {
  readonly batch: number;
  readonly mix: MixDef;
  readonly halfWidth: number;
  readonly assisted: boolean;
  readonly stored: FollowProgress | null;
  readonly dispatch: (action: Action) => boolean;
}

export function StirBowl({ batch, mix, halfWidth, assisted, stored, dispatch }: StirBowlProps) {
  const [sim, setSim] = useState<StirSim>(() => resumeStir(stored));
  const simRef = useRef(sim);
  const centre = useRef<{ readonly x: number; readonly y: number } | null>(null);
  const recorded = useRef({ ticks: stored?.ticks ?? 0, progress: stored?.progress ?? 0 });
  const assistRef = useRef(assisted);
  const keyHelped = useRef(false);
  const [keyStirred, setKeyStirred] = useState(false);
  const keyTurn = useRef(0);
  const done = sim.progress >= mix.laps;
  const record = useRef((latest: StirSim) => {
    if (latest.ticks <= recorded.current.ticks || latest.progress <= recorded.current.progress) return;
    recorded.current = { ticks: latest.ticks, progress: latest.progress };
    dispatch({
      type: "recordStir",
      batch,
      progress: latest.progress,
      ticks: latest.ticks,
      insideTicks: latest.insideTicks,
      assisted: assistRef.current || keyHelped.current,
    });
  });

  useEffect(() => {
    const flush = record.current;
    return () => flush(simRef.current);
  }, []);

  useEffect(() => {
    if (assistRef.current === assisted) return;
    record.current(simRef.current);
    assistRef.current = assisted;
  }, [assisted]);

  const update = (next: StirSim) => {
    simRef.current = next;
    setSim(next);
  };

  useTickLoop(sim.finger !== null || sim.splash > 0, (count) => {
    let next = simRef.current;
    const lap = Math.floor(next.progress);
    for (let tick = 0; tick < count; tick += 1) {
      if (keyTurn.current !== 0) next = { ...next, finger: next.spoon + keyTurn.current * KEY_LEAD };
      next = stirTick(next, mix.laps, halfWidth);
    }
    update(next);
    if (Math.floor(next.progress) > lap || next.progress >= mix.laps) record.current(next);
    return next.finger !== null || next.splash > 0;
  });

  const angleOf = (event: PointerEvent<HTMLDivElement>): number | null => {
    const middle = centre.current;
    if (middle === null) return null;
    return Math.atan2(event.clientY - middle.y, event.clientX - middle.x);
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    centre.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const finger = angleOf(event);
    if (finger === null) return;
    const current = simRef.current;
    const unwrapped =
      current.spoon + Math.atan2(Math.sin(finger - current.spoon), Math.cos(finger - current.spoon));
    update({ ...current, finger: unwrapped, spoon: current.finger === null ? unwrapped : current.spoon });
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = simRef.current;
    if (current.finger === null) return;
    const finger = angleOf(event);
    if (finger === null) return;
    const unwrapped =
      current.finger + Math.atan2(Math.sin(finger - current.finger), Math.cos(finger - current.finger));
    simRef.current = { ...current, finger: unwrapped };
  };

  const up = () => {
    const current = simRef.current;
    if (current.finger === null) return;
    update({ ...current, finger: null, speed: 0 });
    record.current(simRef.current);
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (done || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) return;
    event.preventDefault();
    if (event.repeat) return;
    const current = simRef.current;
    if (!keyHelped.current) {
      record.current(current);
      keyHelped.current = true;
      setKeyStirred(true);
    }
    keyTurn.current = event.key === "ArrowRight" ? 1 : -1;
    update({ ...current, finger: current.spoon });
  };

  const keyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    keyTurn.current = 0;
    up();
  };

  const accuracy = followAccuracy({
    progress: sim.progress,
    ticks: sim.ticks,
    insideTicks: sim.insideTicks,
    assisted: assisted || keyStirred || stored?.assisted === true,
  });
  const lapsDone = Math.min(mix.laps, Math.floor(sim.progress));
  const direction = lapDirection(sim.progress);
  return (
    <div className="pa-stir">
      <div
        className={done ? "pa-stir__bowl pa-stir__bowl--done" : "pa-stir__bowl"}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={keyDown}
        onKeyUp={keyUp}
        tabIndex={0}
        role="application"
        aria-label="Mixing bowl. Drag round it to stir, or hold the left or right arrow key for a steady stir that counts up to 80%."
        data-testid="stir-bowl"
        data-progress={sim.progress.toFixed(3)}
      >
        <MixingBowl
          colour={mix.colour}
          smooth={sim.progress / mix.laps}
          spoon={sim.spoon}
          speed={sim.speed}
          halfWidth={halfWidth}
          direction={direction}
          splash={sim.splash}
          title={`Bowl of ${mix.name}, ${lapsDone} of ${mix.laps} laps stirred`}
        />
        {!done && sim.finger === null ? (
          <div className="pa-stir__prompt" aria-hidden="true">
            <strong>{sim.progress > 0 ? "Keep stirring" : "Press and stir round"}</strong>
            <span>{direction === 1 ? "Clockwise this lap" : "Now the other way round"}</span>
          </div>
        ) : null}
        {done ? (
          <div className="pa-stir__done" role="status">
            <strong>Smooth and glossy!</strong>
            <span>{Math.round(accuracy * 100)}% steady</span>
          </div>
        ) : null}
      </div>
      <div className="pa-stir__laps" aria-label={`${lapsDone} of ${mix.laps} laps`}>
        {Array.from({ length: mix.laps }, (_, index) => (
          <span key={index} className={index < lapsDone ? "pa-stir__lap pa-stir__lap--done" : "pa-stir__lap"}>
            Lap {index + 1}
          </span>
        ))}
        <span className="pa-stir__score">
          {sim.ticks > 0 ? `${Math.round(accuracy * 100)}% in the green` : "—"}
        </span>
      </div>
      {sim.splash > 0.5 ? <p className="pa-hint">Whoa, splash! A little slower.</p> : null}
    </div>
  );
}
