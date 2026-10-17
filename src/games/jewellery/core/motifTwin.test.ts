import { describe, expect, it } from "vitest";
import type { CollectionBrief, CollectionPiece } from "./collectionState";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import {
  collectionTestGame,
  confirmBoard,
  LINE_PLAN,
  pickFirstTheme,
  playLinePiece,
} from "./linePlaythrough";
import { everyMotifCrisp } from "./motifMaster";
import { reduce } from "./reduce";
import { stoneMatch } from "./stoneMatch";
import { lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";
import {
  COLD_TWIN,
  overlapCentre,
  twinDone,
  twinGlows,
  twinSteadyTick,
  twinTick,
  twinZones,
  type TwinSeam,
} from "./twinLamp";

const PAIR_LINE: CollectionBrief = {
  products: ["drop-pair", "shape-pendant", "bangle"],
  motif: "star",
  metalId: "silver",
  hero: null,
  accent: null,
  finish: "high-shine",
  glaze: null,
};

function boarded(): GameState {
  return confirmBoard(pickFirstTheme(collectionTestGame()), PAIR_LINE);
}

function atJoin(state: GameState, slot: number): GameState {
  return playRunTo(reduce(state, { type: "startCollectionPiece", slot }), LINE_PLAN, "join");
}

const seam = (doneAt: number): TwinSeam => ({ insideTicks: 240, overTicks: 6, doneAt });

describe("the motif master", () => {
  it("records the season's first motif cut and scores Every motif crisp from the weakest", () => {
    const piece = playLinePiece(boarded(), 0);
    expect(piece.collection?.motifMaster).toBeGreaterThan(0.9);
    const cuts = (values: (number | null)[]) =>
      values.map((value) => ({ motifCutAccuracy: value }) as Pick<CollectionPiece, "motifCutAccuracy">);
    expect(everyMotifCrisp(cuts([0.95, 0.9]))).toBe(100);
    expect(everyMotifCrisp(cuts([0.95, 0.82]))).toBeCloseTo(80);
    expect(Math.round(everyMotifCrisp(cuts([0.8])))).toBe(75);
    expect(everyMotifCrisp(cuts([0.4]))).toBe(0);
    expect(everyMotifCrisp(cuts([null]))).toBe(0);
  });

  it("counts an assisted motif cut as 0.8", () => {
    const assisted = playLinePiece(boarded(), 0, { ...LINE_PLAN, cutAssist: true });
    expect(assisted.collection?.pieces[0]?.motifCutAccuracy).toBe(0.8);
  });
});

describe("the Motif Charm", () => {
  it("stores the line's motif on a line piece and the piece's own shape on a bench order", () => {
    const state = {
      ...boarded(),
      stock: { ...boarded().stock, extras: { ...boarded().stock.extras, "motif-charm": 2 } },
    };
    const atDisplay = playRunTo(
      reduce(state, { type: "startCollectionPiece", slot: 2 }),
      LINE_PLAN,
      "display",
    );
    const charmed = reduce(atDisplay, { type: "addCharm", charmId: "motif-charm", x: 120, y: 180 });
    expect(charmed.activeRun?.display.charms[0]?.shape).toBe("star");
    const done = reduce(playRunTo(charmed, LINE_PLAN, "review"), { type: "addToCollection" });
    expect(done.collection?.pieces[0]?.carriesMotif).toBe(true);

    const bench = withOrder({ ...settleStories(newTestGame()), coins: 200 }, "gran-mina");
    const order = playRunTo(
      reduce(bench, { type: "startOrder", gigId: lastGigId(bench) }),
      LINE_PLAN,
      "display",
    );
    const stocked = {
      ...order,
      stock: { ...order.stock, extras: { ...order.stock.extras, "motif-charm": 1 } },
    };
    const benchCharm = reduce(stocked, { type: "addCharm", charmId: "motif-charm", x: 120, y: 180 });
    expect(benchCharm.activeRun?.display.charms[0]?.shape).toBe("circle");
  });
});

describe("the Twin Lamp", () => {
  it("overlaps its two zones by width − 0.06 per difficulty and widens with the stand", () => {
    const zones = (difficulty: "relaxed" | "standard" | "challenging", upgrades: string[] = []) => {
      const [a, b] = twinZones({
        profile: { ...newTestGame().profile, difficulty, trait: "dreamer" },
        upgrades: upgrades as never,
      });
      return a.to - b.from;
    };
    expect(zones("standard")).toBeCloseTo(0.09);
    expect(zones("relaxed")).toBeCloseTo(0.135);
    expect(zones("challenging")).toBeCloseTo(0.0675);
    expect(zones("standard", ["twin-lamp-stand"])).toBeCloseTo(0.15 * 1.15 - 0.06);
  });

  it("shares one tick counter that starts inside either zone and counts each seam in its own zone", () => {
    const zonesNow = twinZones({ profile: newTestGame().profile, upgrades: [] });
    let lamp = COLD_TWIN;
    let before = 0;
    for (let tick = 0; tick < 400; tick += 1) {
      lamp = twinTick(lamp, lamp.warmth < 0.73, 0.4, zonesNow, [240, 240]);
      if (lamp.ticks === 0) before += 1;
      expect(lamp.seams[0].insideTicks + lamp.seams[0].overTicks).toBeLessThanOrEqual(lamp.ticks);
      expect(lamp.seams[1].insideTicks + lamp.seams[1].overTicks).toBeLessThanOrEqual(lamp.ticks);
    }
    expect(before).toBeGreaterThan(0);
    expect(lamp.ticks).toBe(400 - before);
    expect(lamp.seams[0].insideTicks).toBeGreaterThan(200);
    expect(lamp.seams[1].insideTicks).toBe(0);
    for (let tick = 0; tick < 600; tick += 1)
      lamp = twinTick(lamp, lamp.warmth < 0.8, 0.4, zonesNow, [240, 240]);
    expect(lamp.seams[0].doneAt).toBeGreaterThan(0);
    expect(lamp.seams[1].doneAt).toBeGreaterThan(lamp.seams[0].doneAt);
  });

  it("holds the steady lamp in the overlap so both seams finish together", () => {
    const zonesNow = twinZones({
      profile: { ...newTestGame().profile, difficulty: "challenging" },
      upgrades: [],
    });
    const centre = overlapCentre(zonesNow);
    expect(centre).toBeGreaterThanOrEqual(zonesNow[1].from);
    expect(centre).toBeLessThanOrEqual(zonesNow[0].to);
    let lamp = COLD_TWIN;
    while (!twinDone(lamp, [240, 240])) lamp = twinSteadyTick(lamp, zonesNow, [240, 240]);
    expect(lamp.ticks).toBe(240);
    expect(lamp.seams[0]).toEqual({ insideTicks: 240, overTicks: 0, doneAt: 240 });
    expect(twinGlows(lamp.seams)).toBe(true);
    expect(twinDone(twinSteadyTick(COLD_TWIN, zonesNow, [240, 240]), [240, 240])).toBe(false);
  });

  it("glows when both seams finish within 90 ticks, and the glowing Join step then costs no hours", () => {
    const state = atJoin(boarded(), 0);
    const glow = reduce(state, {
      type: "recordTwinJoin",
      ticks: 400,
      seams: [seam(300), seam(390)],
      assisted: false,
    });
    const run = glow.activeRun;
    if (run === null) throw new Error("no run");
    expect(run.twinGlow).toBe(true);
    expect(Object.values(run.joins).map((record) => [record.twin, record.ticks])).toEqual([
      [true, 400],
      [true, 400],
    ]);
    expect(leaveHours(run)).toBe(0);
    expect(glow.story.queue).toContain("jb-first-twin");
    const apart = reduce(state, {
      type: "recordTwinJoin",
      ticks: 400,
      seams: [seam(300), seam(391)],
      assisted: false,
    });
    expect(apart.activeRun?.twinGlow).toBe(false);
    expect(apart.activeRun === null ? 1 : leaveHours(apart.activeRun)).toBe(1);
  });

  it("refuses twin records on non-pairs, unfinished seams, a second time and outside the loft", () => {
    const pendant = atJoin(boarded(), 1);
    expect(
      reduce(pendant, { type: "recordTwinJoin", ticks: 400, seams: [seam(300), seam(320)], assisted: false }),
    ).toBe(pendant);
    const pair = atJoin(boarded(), 0);
    const short = { insideTicks: 100, overTicks: 0, doneAt: 100 };
    expect(
      reduce(pair, { type: "recordTwinJoin", ticks: 400, seams: [short, seam(320)], assisted: false }),
    ).toBe(pair);
    const done = reduce(pair, {
      type: "recordTwinJoin",
      ticks: 400,
      seams: [seam(300), seam(320)],
      assisted: false,
    });
    expect(
      reduce(done, { type: "recordTwinJoin", ticks: 410, seams: [seam(300), seam(320)], assisted: false }),
    ).toBe(done);
    expect(reduce(done, { type: "restartJoin", jointId: "clip-loop-l" })).toBe(done);
  });
});

describe("Stone match", () => {
  it("is the share of set stones in the most common tint of their type", () => {
    const pick = (stoneId: "garnet" | "sky-glass", tint: "pale" | "true" | "deep") => ({
      stoneId,
      tint,
      shimmer: 1 as const,
    });
    expect(
      stoneMatch([
        { potStones: [pick("garnet", "true")] },
        { potStones: [pick("garnet", "true"), pick("garnet", "deep")] },
      ]),
    ).toBeCloseTo(2 / 3);
    expect(stoneMatch([{ potStones: [pick("garnet", "pale"), pick("sky-glass", "deep")] }])).toBe(1);
    expect(stoneMatch([{ potStones: [] }])).toBeNull();
  });
});
