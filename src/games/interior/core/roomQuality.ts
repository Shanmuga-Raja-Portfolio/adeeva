import { roundShare } from "../../../engine/roundShare";
import { roomById } from "./catalog";
import { floorScore } from "./floorLay";
import type { GameState } from "./gameState";
import { lightScore } from "./lighting";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { paintScore } from "./paintScore";
import { roomFit } from "./roomFit";
import { roomSource } from "./roomSource";
import { capped, difficultyMultiplier } from "./skillTolerance";
import { walkThrough } from "./walkThrough";

export interface QualityBreakdown {
  readonly flow: number;
  readonly paint: number;
  readonly floor: number;
  readonly light: number;
  readonly fit: number;
  readonly quality: number;
}

const WEIGHTS = { flow: 0.25, paint: 0.25, floor: 0.2, light: 0.2, fit: 0.1 } as const;

function runFlow(state: Pick<GameState, "profile">, run: MakeoverRun): number {
  const room = roomById(run.brief.roomId);
  return capped(state, walkThrough(room, run.plan.pieces, difficultyMultiplier(state)).flow, run.plan.tidied);
}

function runLight(state: Pick<GameState, "profile">, run: MakeoverRun): number {
  const room = roomById(run.brief.roomId);
  return capped(
    state,
    lightScore(room, run.plan.pieces, placedLights(run), run.brief.mood),
    run.lightAssisted,
  );
}

export function roomQuality(state: Pick<GameState, "profile">, run: MakeoverRun): QualityBreakdown {
  const flow = runFlow(state, run);
  const paint = paintScore(state, run);
  const floor = floorScore(state, run);
  const light = runLight(state, run);
  const fit = roomFit(roomSource(run), run.brief);
  const raw =
    WEIGHTS.flow * flow +
    WEIGHTS.paint * paint +
    WEIGHTS.floor * floor +
    WEIGHTS.light * light +
    WEIGHTS.fit * fit;
  return {
    flow: roundShare(flow),
    paint: roundShare(paint),
    floor: roundShare(floor),
    light: roundShare(light),
    fit: roundShare(fit),
    quality: Math.round(100 * raw),
  };
}
