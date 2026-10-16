import { clampUnit, easeInOut, easeOut, window01 } from "../../../../../ui/kit/easing";
import type { ShowWalker } from "./showCast";
import type { ShowMoment } from "../../../../../ui/show/showTimeline";
import { walkProgress } from "./walkProgress";

export interface StageFigure<W = ShowWalker> {
  readonly key: string;
  readonly walker: W | null;
  readonly progress: number;
  readonly lateral: number;
  readonly opacity: number;
  readonly spin: number;
  readonly dip: number;
  readonly stride: boolean;
}

export interface StageShot<W = ShowWalker> {
  readonly figures: readonly StageFigure<W>[];
  readonly focus: number;
  readonly flashes: boolean;
  readonly burst: number;
  readonly darkness: number;
  readonly cheer: number;
  readonly cheerSeed: number;
  readonly petals: number;
}

const WALK_STILL_T = 0.5;
const FINALE_STILL_T = 0.85;
const BOW_STILL_T = 0.62;
const LINEUP = 290;
const BOW_LINEUP = 345;
const BOW_DEPTH = 0.36;
const PARTNER = 115;

function pulses(t: number, at: readonly number[], spanMs: number): number {
  return at.reduce((strongest, moment) => {
    const age = (t - moment) * spanMs;
    if (age < 0) return strongest;
    return Math.max(strongest, Math.exp(-age / 90));
  }, 0);
}

function figure<W>(
  key: string,
  walker: W | null,
  progress: number,
  lateral: number,
  opacity = 1,
  extra: Partial<Pick<StageFigure<W>, "spin" | "dip" | "stride">> = {},
): StageFigure<W> {
  return {
    key,
    walker,
    progress,
    lateral,
    opacity,
    spin: extra.spin ?? 1,
    dip: extra.dip ?? 0,
    stride: extra.stride ?? true,
  };
}

function spinScale(t: number): number {
  const s = window01(t, 0.47, 0.57);
  if (s <= 0 || s >= 1) return 1;
  return Math.cos(2 * Math.PI * easeInOut(s));
}

function lineupLateral(position: number, count: number): number {
  if (position === count - 1) return 0;
  return position % 2 === 0 ? -LINEUP : LINEUP;
}

function lineupDepth(position: number, count: number): number {
  return position === count - 1 ? 0.5 : 0.41;
}

function walkShot<W>(
  moment: ShowMoment,
  cast: readonly W[],
  audience: number,
  reduced: boolean,
  scoreOf: (walker: W) => number,
): StageShot<W> {
  const walker = cast[moment.segment.walk] ?? null;
  const t = reduced ? WALK_STILL_T : moment.t;
  const progress = walkProgress(t);
  const opacity = reduced ? 1 : clampUnit(Math.min(t / 0.05, (1 - t) / 0.07));
  const lookScore = walker === null ? 50 : scoreOf(walker);
  const span = moment.segment.durationMs;
  return {
    figures: [
      figure(`walk-${moment.segment.walk}`, walker, progress, 0, opacity, {
        spin: reduced ? 1 : spinScale(t),
      }),
    ],
    focus: progress,
    flashes: !reduced && t > 0.3 && t < 0.72,
    burst: reduced ? 0 : 0.3 * pulses(t, [0.41, 0.45, 0.52, 0.6], span),
    darkness: 0,
    cheer: clampUnit((0.35 + 0.65 * (audience / 100)) * (0.55 + 0.45 * (lookScore / 100))),
    cheerSeed: 101 + moment.segment.walk * 37,
    petals: -1,
  };
}

function finaleShot<W>(
  moment: ShowMoment,
  cast: readonly W[],
  audience: number,
  reduced: boolean,
): StageShot<W> {
  const t = reduced ? FINALE_STILL_T : moment.t;
  const count = cast.length;
  const figures = cast.map((walker, position) => {
    const local = window01(t, position * 0.12, position * 0.12 + 0.5);
    const target = lineupDepth(position, count);
    const progress = target * easeOut(local);
    const lateral = lineupLateral(position, count) * easeInOut(window01(local, 0.35, 1));
    return figure(`finale-${position}`, walker, progress, lateral, clampUnit(local / 0.1), {
      stride: local < 1,
    });
  });
  const span = moment.segment.durationMs;
  return {
    figures,
    focus: figures[count - 1]?.progress ?? 0.5,
    flashes: !reduced && t > 0.45,
    burst: reduced ? 0 : 0.34 * pulses(t, [0.62, 0.68, 0.74, 0.86, 0.9], span),
    darkness: 0,
    cheer: clampUnit((0.5 + 0.5 * (audience / 100)) * window01(t, 0.45, 0.6)),
    cheerSeed: 271,
    petals: -1,
  };
}

function bowShot<W>(
  moment: ShowMoment,
  cast: readonly W[],
  audience: number,
  reduced: boolean,
): StageShot<W> {
  const t = reduced ? BOW_STILL_T : moment.t;
  const count = cast.length;
  const step = easeInOut(window01(t, 0, 0.32));
  const models = cast.map((walker, position) => {
    const closer = position === count - 1;
    const side = lineupLateral(position, count) / LINEUP;
    return figure(
      `finale-${position}`,
      walker,
      closer
        ? lineupDepth(position, count)
        : lineupDepth(position, count) + (BOW_DEPTH - lineupDepth(position, count)) * step,
      closer ? PARTNER * step : side * (LINEUP + (BOW_LINEUP - LINEUP) * step),
      1,
      { stride: false },
    );
  });
  const walk = easeOut(window01(t, 0.04, 0.46));
  const dip = Math.sin(Math.PI * window01(t, 0.5, 0.72));
  const designer = figure<W>("designer", null, 0.5 * walk, -PARTNER, clampUnit(walk / 0.12), {
    dip,
    stride: walk < 1,
  });
  return {
    figures: [...models, designer],
    focus: 0.5 * walk,
    flashes: !reduced && t > 0.45,
    burst: reduced ? 0 : 0.36 * pulses(t, [0.55, 0.6, 0.66, 0.8], moment.segment.durationMs),
    darkness: reduced ? 0 : 0.25 * window01(t, 0.88, 1),
    cheer: clampUnit(0.6 + 0.4 * (audience / 100)),
    cheerSeed: 433,
    petals: window01(t, 0.4, 1),
  };
}

export function stageShot<W>(
  moment: ShowMoment,
  cast: readonly W[],
  audience: number,
  reduced: boolean,
  scoreOf: (walker: W) => number,
): StageShot<W> {
  const kind = moment.segment.kind;
  if (kind === "walk") return walkShot(moment, cast, audience, reduced, scoreOf);
  if (kind === "finale") return finaleShot(moment, cast, audience, reduced);
  if (kind === "bow") return bowShot(moment, cast, audience, reduced);
  const lights = kind === "lights" ? moment.t : 0;
  const darkness =
    lights < 0.22 ? 1 : lights < 0.44 ? 0.62 : lights < 0.66 ? 0.34 : 0.34 * (1 - window01(lights, 0.66, 1));
  return {
    figures: [],
    focus: 0,
    flashes: false,
    burst: 0,
    darkness,
    cheer: 0,
    cheerSeed: 0,
    petals: -1,
  };
}
