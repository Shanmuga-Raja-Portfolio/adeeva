import { useEffect, useRef, useState } from "react";
import { useSettings } from "../../../../../studio/SettingsContext";
import { Button } from "../../../../../ui/kit/Button";
import { TICK_SECONDS, useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { MixDef } from "../../../content/mix";
import {
  autoOutMinutes,
  bakeAccuracy,
  colourStop,
  doneTime,
  HEAT_DOTS,
  REAL_SECONDS_PER_MINUTE,
  TURN_MOMENT,
  type Action,
  type BakeRecord,
} from "../../../core";
import { HeatDots } from "../../art/HeatDots";
import { OvenCutaway } from "../../art/OvenCutaway";

export interface OvenBenchProps {
  readonly batch: number;
  readonly mix: MixDef;
  readonly assisted: boolean;
  readonly stored: BakeRecord | null;
  readonly locked: boolean;
  readonly dispatch: (action: Action) => boolean;
  readonly onBakingChange: (baking: boolean) => void;
}

type FocusTarget = "out" | "result";

interface OvenRun {
  readonly seconds: number;
  readonly turned: number | null;
  readonly running: boolean;
}

const STOP_WORDS = {
  pale: "Pale",
  light: "Light",
  golden: "Golden!",
  deep: "Deep",
  toasty: "Toasty",
} as const;

export function OvenBench({
  batch,
  mix,
  assisted,
  stored,
  locked,
  dispatch,
  onBakingChange,
}: OvenBenchProps) {
  const { reducedMotion } = useSettings();
  const benchRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<FocusTarget | null>(null);
  const [heat, setHeat] = useState(assisted ? mix.idealHeat : (stored?.heat ?? 3));
  const [oven, setOven] = useState<OvenRun>({ seconds: 0, turned: null, running: false });
  const ovenRef = useRef(oven);
  const activeHeat = assisted ? mix.idealHeat : heat;
  const done = doneTime(mix, activeHeat);
  const limit = autoOutMinutes(mix, activeHeat);
  const minutes = oven.seconds / REAL_SECONDS_PER_MINUTE;
  const update = (next: OvenRun) => {
    ovenRef.current = next;
    setOven(next);
  };
  const keepFocus = (target: FocusTarget) => {
    const active = document.activeElement;
    if (active !== null && benchRef.current?.contains(active) === true) pendingFocus.current = target;
  };

  useEffect(() => {
    onBakingChange(oven.running);
  }, [oven.running, onBakingChange]);

  useEffect(() => () => onBakingChange(false), [onBakingChange]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    const element = target === "out" ? outRef.current : resultRef.current;
    if (element === null) return;
    pendingFocus.current = null;
    element.focus();
  }, [oven, stored]);

  const takeOut = (turned: number | null, atMinutes: number) => {
    const taken = Math.min(limit, Math.max(1, Math.floor(atMinutes), (turned ?? 0) + 1));
    keepFocus("result");
    update({ ...ovenRef.current, running: false });
    dispatch({
      type: "bakeBatch",
      batch,
      heat: activeHeat,
      turnedMinutes: turned,
      takenMinutes: taken,
      assisted,
    });
  };

  useTickLoop(oven.running, (count) => {
    const current = ovenRef.current;
    const seconds = current.seconds + count * TICK_SECONDS;
    const at = seconds / REAL_SECONDS_PER_MINUTE;
    const turned =
      assisted && current.turned === null && at >= done * TURN_MOMENT
        ? Math.max(1, Math.floor(at))
        : current.turned;
    if (at >= limit || (assisted && at >= done)) {
      update({ seconds, turned, running: false });
      takeOut(turned, assisted ? Math.round(done) : limit);
      return false;
    }
    update({ seconds, turned, running: true });
    return true;
  });

  const share = stored !== null ? stored.takenMinutes / doneTime(mix, stored.heat) : minutes / done;
  const stop = colourStop(share);
  const turnable = oven.running && oven.turned === null && minutes >= done * TURN_MOMENT;
  const accuracy = stored === null ? null : bakeAccuracy(stored, mix, stored.window);
  return (
    <div className="pa-oven-bench" ref={benchRef}>
      <div className="pa-oven-bench__oven" data-testid="oven" data-share={share.toFixed(3)}>
        <OvenCutaway
          share={share}
          heat={stored?.heat ?? activeHeat}
          running={oven.running}
          turned={stored !== null ? stored.turnedMinutes !== null : oven.turned !== null}
          kind={mix.kind}
          batterColour={mix.colour}
          reducedMotion={reducedMotion}
          title={`Oven with ${mix.name}, looking ${STOP_WORDS[stop].toLowerCase()}`}
        />
        <span className={`pa-oven-bench__stop pa-oven-bench__stop--${stop}`} aria-live="polite">
          {stored === null && !oven.running ? "Ready when you are" : STOP_WORDS[stop]}
        </span>
      </div>
      <div className="pa-oven-bench__controls">
        <div className="pa-oven-bench__card">
          <span className="ad-eyebrow">The mix card says</span>
          <strong>{mix.name}</strong>
          <HeatDots heat={mix.idealHeat} />
          <span className="pa-muted">About {mix.minutes} minutes at that heat</span>
        </div>
        <div className="pa-knob" role="radiogroup" aria-label="Heat dots">
          {Array.from({ length: HEAT_DOTS }, (_, index) => index + 1).map((dots) => (
            <button
              key={dots}
              type="button"
              role="radio"
              aria-checked={activeHeat === dots}
              aria-label={`${dots} heat ${dots === 1 ? "dot" : "dots"}`}
              className="pa-knob__dot"
              disabled={oven.running || stored !== null || assisted || locked}
              onClick={() => setHeat(dots)}
            >
              {dots}
            </button>
          ))}
        </div>
        <p className="pa-oven-bench__clock" aria-live="off">
          {Math.floor(stored?.takenMinutes ?? minutes)} min in the oven
        </p>
        {stored === null ? (
          oven.running ? (
            <div className="pa-oven-bench__live">
              {turnable ? (
                <button
                  type="button"
                  className="pa-big-button pa-big-button--turn"
                  onClick={() => {
                    keepFocus("out");
                    update({ ...ovenRef.current, turned: Math.max(1, Math.floor(minutes)) });
                  }}
                  data-testid="turn-tray"
                >
                  Turn tray
                </button>
              ) : null}
              <button
                type="button"
                ref={outRef}
                className="pa-big-button pa-big-button--out"
                onClick={() =>
                  takeOut(ovenRef.current.turned, ovenRef.current.seconds / REAL_SECONDS_PER_MINUTE)
                }
                data-testid="take-out"
              >
                Take out
              </button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => {
                keepFocus("out");
                update({ seconds: 0, turned: null, running: true });
              }}
              disabled={locked}
              data-testid="start-bake"
            >
              Bake
            </Button>
          )
        ) : (
          <p className="pa-oven-bench__result" role="status" ref={resultRef} tabIndex={-1}>
            <strong>{STOP_WORDS[stop]}</strong>{" "}
            {accuracy === null ? "" : `${Math.round(accuracy * 100)}% bake score.`}{" "}
            {stop === "toasty"
              ? "A little toasty. Icing hides a lot!"
              : stop === "golden"
                ? "Perfect colour!"
                : ""}
          </p>
        )}
      </div>
    </div>
  );
}
