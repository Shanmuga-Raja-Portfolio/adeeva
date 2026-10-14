import { describe, expect, it } from "vitest";
import { kidSummary } from "./kidSummary";
import { evaluatePiece } from "./pieceEvaluate";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playToReview,
  playUntil,
  runOf,
  sandActions,
  dispatchAll,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

function teodor() {
  return withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
}

describe("the kid summary on the results card", () => {
  it("says one short line per skill and wish", () => {
    const start = teodor();
    const review = playToReview(start, lastGigId(start), BIRDHOUSE_PLAN);
    const run = runOf(review);
    const lines = kidSummary(evaluatePiece(review, run, review.calendar.day), run);
    expect(lines.map((line) => `${line.label}: ${line.verdict}`)).toEqual([
      "Sawing: right on the line!",
      "Joints: snug!",
      "Sanding: silky smooth!",
      "Wood lines: great!",
      "Style: just what they wanted!",
      "Colours: lovely!",
      "Extras: all there!",
      "Budget: on target!",
      "Delivery: right on time!",
    ]);
    expect(lines.every((line) => line.good)).toBe(true);
  });

  it("names what is missing in kind words", () => {
    const start = teodor();
    const review = playToReview(start, lastGigId(start), {
      ...BIRDHOUSE_PLAN,
      saw: "assist",
      sand: "across",
    });
    const run = runOf(review);
    const late = { ...review, calendar: { ...review.calendar, day: run.brief.deadlineDay + 1 } };
    const evaluation = evaluatePiece(late, run, late.calendar.day);
    const lines = kidSummary({ ...evaluation, spend: run.brief.budget + 1 }, run);
    const byId = Object.fromEntries(lines.map((line) => [line.id, line.verdict]));
    expect(byId.saw).toBe("nice and steady");
    expect(byId.budget).toBe("1 coin over");
    expect(byId.deadline).toBe("a little late");
    const plaqueLess = {
      ...run,
      brief: { ...run.brief, requiredExtras: [{ extra: "name-plaque" as const, count: 1 }] },
    };
    const short = kidSummary(evaluatePiece(late, plaqueLess, late.calendar.day), plaqueLess);
    expect(short.find((line) => line.id === "extras")?.verdict).toBe("1 more extra needed");
  });
});

describe("starting a sanded surface again", () => {
  it("clears only that surface while sanding", () => {
    const start = teodor();
    const atSand = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "sand");
    const sanded = dispatchAll(atSand, sandActions(atSand, "along"));
    expect(Object.keys(runOf(sanded).sanding)).toEqual(["roof-1"]);
    const fresh = reduce(sanded, { type: "resetSurface", surfaceId: "roof-1" });
    expect(runOf(fresh).sanding).toEqual({});
    expect(reduce(fresh, { type: "resetSurface", surfaceId: "roof-1" })).toBe(fresh);
  });
});
