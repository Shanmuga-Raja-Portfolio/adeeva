import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { FabricDef } from "../../../content/fabric";
import { seamAccuracy, type Action, type SeamProgress } from "../../../core";
import { SEAM_VIEW, seamLength } from "../../art/SeamStrip";
import { SewingStage } from "../../art/SewingStage";
import { Button } from "../../../../../ui/kit/Button";
import {
  MAX_TICKS_PER_FRAME,
  resumeSimulation,
  sewSpeed,
  sewTick,
  STEER_LIMIT,
  TICK_SECONDS,
  type SewSimulation,
} from "./seamSimulation";

export interface SewingMachineProps {
  readonly seamId: string;
  readonly seamName: string;
  readonly profile: readonly number[];
  readonly fabric: FabricDef;
  readonly band: number;
  readonly stored: SeamProgress | undefined;
  readonly assisted: boolean;
  readonly dispatch: (action: Action) => void;
  readonly onNext: (() => void) | null;
}

interface Press {
  readonly pointerId: number;
  readonly x: number;
  readonly steer: number;
  readonly unitsPerPx: number;
}

export function SewingMachine({
  seamId,
  seamName,
  profile,
  fabric,
  band,
  stored,
  assisted,
  dispatch,
  onNext,
}: SewingMachineProps) {
  const [sim, setSim] = useState<SewSimulation>(() => resumeSimulation(stored));
  const [held, setHeld] = useState(false);
  const simRef = useRef(sim);
  const input = useRef({ held: false, steer: 0 });
  const press = useRef<Press | null>(null);
  const recordedTicks = useRef(stored?.ticks ?? 0);
  const recordedAssist = useRef(assisted);
  const length = seamLength(profile);
  const done = sim.progress >= 1;
  const record = useRef((latest: SewSimulation) => {
    if (latest.ticks <= recordedTicks.current) return;
    recordedTicks.current = latest.ticks;
    dispatch({
      type: "recordSeam",
      seamId,
      progress: latest.progress,
      ticks: latest.ticks,
      insideTicks: latest.insideTicks,
      assisted: recordedAssist.current,
    });
  });

  useEffect(() => {
    const flush = record.current;
    return () => flush(simRef.current);
  }, []);

  useEffect(() => {
    if (recordedAssist.current === assisted) return;
    record.current(simRef.current);
    recordedAssist.current = assisted;
  }, [assisted]);

  useEffect(() => {
    if (stored === undefined || stored.ticks <= simRef.current.ticks) return;
    const resumed = resumeSimulation(stored);
    simRef.current = resumed;
    recordedTicks.current = stored.ticks;
    setSim(resumed);
  }, [stored]);

  useEffect(() => {
    if (!held) return;
    let frame = 0;
    let last: number | null = null;
    let carry = 0;
    const step = (now: number) => {
      carry += last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      let next = simRef.current;
      let count = 0;
      while (carry >= TICK_SECONDS && count < MAX_TICKS_PER_FRAME) {
        next = sewTick(next, input.current, profile, band, length);
        carry -= TICK_SECONDS;
        count += 1;
      }
      simRef.current = next;
      setSim(next);
      if (next.progress >= 1) {
        input.current.held = false;
        press.current = null;
        record.current(next);
        setHeld(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [held, profile, band, length]);

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    press.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      steer: input.current.steer,
      unitsPerPx: SEAM_VIEW.width / Math.max(1, rect.width),
    };
    input.current.held = true;
    setHeld(true);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const shift = ((event.clientX - current.x) * current.unitsPerPx) / SEAM_VIEW.amplitude;
    input.current.steer = Math.max(-STEER_LIMIT, Math.min(STEER_LIMIT, current.steer + shift));
  };

  const release = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    press.current = null;
    input.current.held = false;
    setHeld(false);
    record.current(simRef.current);
  };

  const restart = () => {
    if (stored !== undefined || recordedTicks.current > 0) dispatch({ type: "resetSeam", seamId });
    recordedTicks.current = 0;
    input.current = { held: false, steer: 0 };
    const fresh = resumeSimulation(undefined);
    simRef.current = fresh;
    setSim(fresh);
  };

  const accuracy = Math.round(
    seamAccuracy({
      progress: sim.progress,
      ticks: sim.ticks,
      insideTicks: sim.insideTicks,
      assisted: assisted || (stored?.assisted ?? false),
    }) * 100,
  );
  const speed = held ? (sewSpeed(sim.holdSeconds) - sewSpeed(0)) / (sewSpeed(99) - sewSpeed(0)) : 0;
  const lamp = sim.ticks === 0 ? "idle" : sim.onLine ? "on" : "off";
  return (
    <div className="ad-machine">
      <div className="ad-machine__hud">
        <span className={`ad-machine__lamp ad-machine__lamp--${lamp}`} aria-hidden="true" />
        <span className="ad-machine__seam">{seamName}</span>
        <span className="ad-machine__stat">
          <span className="ad-eyebrow">On the line</span>
          <strong>{sim.ticks > 0 ? `${accuracy}%` : "—"}</strong>
        </span>
        <span className="ad-machine__speed" aria-label="Machine speed">
          <span style={{ width: `${Math.round(speed * 100)}%` }} />
        </span>
      </div>
      <div
        className={held ? "ad-machine__bed ad-machine__bed--running" : "ad-machine__bed"}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        data-testid="sewing-bed"
        data-progress={sim.progress.toFixed(3)}
      >
        <SewingStage
          profile={profile}
          scroll={sim.progress}
          bandWidth={band}
          offsetX={sim.offset}
          sewnUntil={sim.progress}
          fabric={fabric}
          running={held}
          title={`Sewing the ${seamName.toLowerCase()}`}
          className="ad-machine__stage"
        />
        {!held && !done ? (
          <div className="ad-machine__prompt" aria-hidden="true">
            <strong>{sim.progress > 0 ? "Hold to carry on" : "Press and hold to sew"}</strong>
            <span>Slide left and right to keep the needle on the dashed line</span>
          </div>
        ) : null}
        {done ? (
          <div className="ad-machine__done" role="status">
            <span className="ad-machine__done-title">Seam sewn!</span>
            <strong>{accuracy}% on the line</strong>
          </div>
        ) : null}
      </div>
      <div className="ad-machine__progress" aria-label={`Seam progress ${Math.round(sim.progress * 100)}%`}>
        <span style={{ width: `${sim.progress * 100}%` }} />
      </div>
      <div className="ad-machine__actions">
        <Button variant="ghost" onClick={restart} disabled={sim.progress === 0 || held}>
          {done ? "Unpick and resew" : "Restart seam"}
        </Button>
        {done && onNext !== null ? (
          <Button onClick={onNext} data-testid="next-seam">
            Next seam
          </Button>
        ) : null}
      </div>
    </div>
  );
}
