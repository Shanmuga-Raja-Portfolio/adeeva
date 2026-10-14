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

export interface OvenPairTier {
  readonly name: string;
  readonly mix: MixDef;
  readonly scale: number;
  readonly stored: BakeRecord | null;
}

export interface OvenPairProps {
  readonly tiers: readonly [OvenPairTier, OvenPairTier];
  readonly assisted: boolean;
  readonly dispatch: (action: Action) => boolean;
  readonly onBakingChange: (baking: boolean) => void;
}

interface PairRun {
  readonly seconds: number;
  readonly running: boolean;
  readonly turned: number | null;
  readonly taken: readonly [number | null, number | null];
}

const IDLE: PairRun = { seconds: 0, running: false, turned: null, taken: [null, null] };

const STOP_WORDS = {
  pale: "Pale",
  light: "Light",
  golden: "Golden!",
  deep: "Deep",
  toasty: "Toasty",
} as const;

export function OvenPair({ tiers, assisted, dispatch, onBakingChange }: OvenPairProps) {
  const { reducedMotion } = useSettings();
  const [first, second] = tiers;
  const [heat, setHeat] = useState(first.stored?.heat ?? first.mix.idealHeat);
  const [oven, setOven] = useState<PairRun>(IDLE);
  const ovenRef = useRef(oven);
  const activeHeat = assisted ? first.mix.idealHeat : heat;
  const dones = tiers.map((tier) => doneTime(tier.mix, activeHeat, tier.scale));
  const limits = tiers.map((tier) => autoOutMinutes(tier.mix, activeHeat, tier.scale));
  const turnAt = (TURN_MOMENT * ((dones[0] ?? 0) + (dones[1] ?? 0))) / 2;
  const minutes = oven.seconds / REAL_SECONDS_PER_MINUTE;
  const baked = first.stored !== null && second.stored !== null;
  const update = (next: PairRun) => {
    ovenRef.current = next;
    setOven(next);
  };

  useEffect(() => {
    onBakingChange(oven.running);
  }, [oven.running, onBakingChange]);
  useEffect(() => () => onBakingChange(false), [onBakingChange]);

  const finish = (next: PairRun) => {
    const [a, b] = next.taken;
    if (a === null || b === null) return;
    const turned = next.turned !== null && next.turned < Math.min(a, b) ? next.turned : null;
    dispatch({
      type: "bakeTogether",
      heat: activeHeat,
      turnedMinutes: turned,
      takenMinutes: [a, b],
      assisted,
    });
  };

  const takeOut = (current: PairRun, index: 0 | 1, atMinutes: number): PairRun => {
    if (current.taken[index] !== null) return current;
    const limit = limits[index] ?? 1;
    const minimum = (current.turned ?? 0) + 1;
    const value = Math.min(limit, Math.max(1, Math.floor(atMinutes), minimum));
    const taken: [number | null, number | null] =
      index === 0 ? [value, current.taken[1]] : [current.taken[0], value];
    const running = taken[0] === null || taken[1] === null;
    return { ...current, taken, running };
  };

  useTickLoop(oven.running, (count) => {
    let next: PairRun = { ...ovenRef.current, seconds: ovenRef.current.seconds + count * TICK_SECONDS };
    const at = next.seconds / REAL_SECONDS_PER_MINUTE;
    if (assisted && next.turned === null && at >= turnAt)
      next = { ...next, turned: Math.max(1, Math.floor(at)) };
    for (const index of [0, 1] as const) {
      const done = dones[index] ?? 0;
      const limit = limits[index] ?? 0;
      if (next.taken[index] === null && (at >= limit || (assisted && at >= done)))
        next = takeOut(next, index, assisted ? Math.round(done) : limit);
    }
    update(next);
    if (!next.running) finish(next);
    return next.running;
  });

  const tap = (index: 0 | 1) => {
    const next = takeOut(ovenRef.current, index, ovenRef.current.seconds / REAL_SECONDS_PER_MINUTE);
    update(next);
    if (!next.running) finish(next);
  };
  const bothIn = oven.taken[0] === null && oven.taken[1] === null;
  const turnable =
    oven.running && bothIn && oven.turned === null && minutes >= TURN_MOMENT * Math.min(...dones);
  return (
    <div className="pa-oven-pair" data-testid="oven-pair">
      <div className="pa-oven-pair__ovens">
        {tiers.map((tier, index) => {
          const taken = tier.stored?.takenMinutes ?? oven.taken[index] ?? null;
          const tierMinutes = taken ?? minutes;
          const share = tierMinutes / (dones[index] ?? 1);
          const stop = colourStop(share);
          const accuracy =
            tier.stored === null ? null : bakeAccuracy(tier.stored, tier.mix, tier.stored.window, tier.scale);
          return (
            <div key={tier.name} className="pa-oven-pair__oven" data-testid={`pair-oven-${index}`}>
              <span className="ad-eyebrow">{tier.name}</span>
              <OvenCutaway
                share={share}
                heat={tier.stored?.heat ?? activeHeat}
                running={oven.running && oven.taken[index] === null}
                turned={tier.stored !== null ? tier.stored.turnedMinutes !== null : oven.turned !== null}
                kind={tier.mix.kind}
                batterColour={tier.mix.colour}
                reducedMotion={reducedMotion}
                title={`${tier.name} in the oven, looking ${STOP_WORDS[stop].toLowerCase()}`}
              />
              <span className="pa-oven-pair__card">
                {tier.mix.name} <HeatDots heat={tier.mix.idealHeat} />
              </span>
              <strong className={`pa-oven-pair__stop pa-oven-pair__stop--${stop}`}>
                {tier.stored === null && !oven.running && taken === null ? "Ready" : STOP_WORDS[stop]}
                {accuracy !== null ? ` · ${Math.round(accuracy * 100)}%` : ""}
              </strong>
              {oven.running && oven.taken[index] === null ? (
                <button
                  type="button"
                  className="pa-big-button pa-big-button--out"
                  onClick={() => tap(index === 0 ? 0 : 1)}
                  data-testid={`pair-take-out-${index}`}
                >
                  Take out
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="pa-oven-pair__controls">
        <div className="pa-knob" role="radiogroup" aria-label="Heat dots for both tiers">
          {Array.from({ length: HEAT_DOTS }, (_, index) => index + 1).map((dots) => (
            <button
              key={dots}
              type="button"
              role="radio"
              aria-checked={activeHeat === dots}
              aria-label={`${dots} heat ${dots === 1 ? "dot" : "dots"}`}
              className="pa-knob__dot"
              disabled={oven.running || baked || assisted}
              onClick={() => setHeat(dots)}
            >
              {dots}
            </button>
          ))}
        </div>
        <p className="pa-oven-bench__clock">{Math.floor(minutes)} min in the oven</p>
        {turnable ? (
          <button
            type="button"
            className="pa-big-button pa-big-button--turn"
            onClick={() => update({ ...ovenRef.current, turned: Math.max(1, Math.floor(minutes)) })}
            data-testid="pair-turn"
          >
            Turn tray
          </button>
        ) : null}
        {!baked && !oven.running ? (
          <Button size="lg" onClick={() => update({ ...IDLE, running: true })} data-testid="pair-bake">
            Bake both tiers
          </Button>
        ) : null}
        <p className="pa-hint">
          One dial for both tiers. The smaller tier is done in about three quarters of the time.
        </p>
      </div>
    </div>
  );
}
