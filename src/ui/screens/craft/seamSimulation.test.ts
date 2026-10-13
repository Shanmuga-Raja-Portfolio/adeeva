import { describe, expect, it } from "vitest";
import { GARMENT_PARTS } from "../../../content/garmentPart";
import { reduce, requiredSeams, type GameState } from "../../../core";
import {
  assembleToSew,
  layoutAndCut,
  newTestGame,
  sketchAndShop,
  withActiveGig,
} from "../../../core/testPlaythrough";
import { seamLength } from "../../art/SeamStrip";
import { resumeSimulation, sewTick, type SewSimulation } from "./seamSimulation";

const profiles = [...new Set(GARMENT_PARTS.flatMap((part) => part.seams.map((seam) => seam.profile)))];

const feeds = [
  { name: "one long hold", holdTicks: Number.POSITIVE_INFINITY },
  { name: "single-tick taps", holdTicks: 1 },
  { name: "short bursts", holdTicks: 17 },
];

function atSewingMachine(): { state: GameState; seamId: string } {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  const state = assembleToSew(layoutAndCut(sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id }))));
  const seam = state.activeRun === null ? undefined : requiredSeams(state.activeRun.design)[0];
  if (seam === undefined) throw new Error("expected a seam");
  return { state, seamId: seam.seam.id };
}

function record(state: GameState, seamId: string, sim: SewSimulation): GameState {
  const next = reduce(state, {
    type: "recordSeam",
    seamId,
    progress: sim.progress,
    ticks: sim.ticks,
    insideTicks: sim.insideTicks,
    assisted: false,
  });
  expect(next).not.toBe(state);
  return next;
}

describe("machine feed against the seam record bounds", () => {
  for (const profile of profiles)
    for (const feed of feeds)
      it(`accepts ${feed.name} on a ${seamLength(profile)}-unit seam`, () => {
        const start = atSewingMachine();
        let state = start.state;
        let sim = resumeSimulation(undefined);
        while (sim.progress < 1) {
          for (let tick = 0; tick < feed.holdTicks && sim.progress < 1; tick += 1)
            sim = sewTick(sim, { held: true, steer: 0 }, profile, 0.2, seamLength(profile));
          state = record(state, start.seamId, sim);
          sim = sewTick(sim, { held: false, steer: 0 }, profile, 0.2, seamLength(profile));
        }
        expect(state.activeRun?.seams[start.seamId]?.progress).toBe(1);
      });
});
