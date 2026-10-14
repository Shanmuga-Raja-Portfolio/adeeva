import { describe, expect, it } from "vitest";
import {
  floorAccuracy,
  floorCandidates,
  floorPieces,
  floorScore,
  FLOOR_GATE,
  rightCandidate,
  runPattern,
} from "./floorLay";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { floorTolerance } from "./skillTolerance";
import { lastGigId, newTestGame, playRunTo, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function atFloor(clientId = "nana-pearl"): GameState {
  const ordered = withOrder(settleStories(newTestGame()), clientId);
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor(clientId), "floor");
}

function run(state: GameState) {
  if (state.activeRun === null) throw new Error("no run");
  return state.activeRun;
}

describe("laying the floor", () => {
  it("offers the right piece among three, with a wrong colour for checker floors", () => {
    const tiles = run(atFloor());
    const piece = floorPieces(runPattern(tiles))[0];
    if (piece === undefined) throw new Error("no piece");
    const offered = floorCandidates(tiles, piece);
    expect(offered).toHaveLength(3);
    expect(offered.map((entry) => entry.key)).toContain(rightCandidate(piece).key);
    const checker = run(atFloor("orla"));
    const first = floorPieces("checker")[0];
    if (first === undefined) throw new Error("no piece");
    const tones = floorCandidates(checker, first).map((entry) => entry.tone);
    expect(new Set(tones).size).toBe(2);
  });

  it("rejects a wrong pick, a drop past the gate and pieces out of order", () => {
    const state = atFloor();
    const piece = floorPieces(runPattern(run(state)))[0];
    if (piece === undefined) throw new Error("no piece");
    const wrong = floorCandidates(run(state), piece).find((entry) => entry.key !== rightCandidate(piece).key);
    const drop = {
      type: "layFloor" as const,
      pieceIndex: 0,
      candidateKey: rightCandidate(piece).key,
      x: 0,
      y: 0,
      assisted: false,
    };
    expect(reduce(state, { ...drop, candidateKey: wrong?.key ?? "" })).toBe(state);
    const gate = FLOOR_GATE * floorTolerance(state);
    expect(reduce(state, { ...drop, x: gate + 0.01 })).toBe(state);
    expect(reduce(state, { ...drop, x: gate - 0.01 })).not.toBe(state);
    expect(reduce(state, { ...drop, pieceIndex: 1 })).toBe(state);
  });

  it("scores the offset on a smooth curve: 1 dead on, 0.6 at tolerance, 0.1 at the gate", () => {
    expect(floorAccuracy(0, 2.5)).toBe(1);
    expect(floorAccuracy(2.5, 2.5)).toBeCloseTo(0.6);
    expect(floorAccuracy(3.75, 2.5)).toBeCloseTo(0.1);
  });

  it("lets a piece be lifted and re-laid, counts unlaid pieces as zero and caps the magnet", () => {
    let state = atFloor();
    const pieces = floorPieces(runPattern(run(state)));
    const first = pieces[0];
    if (first === undefined) throw new Error("no piece");
    const key = rightCandidate(first).key;
    state = reduce(state, {
      type: "layFloor",
      pieceIndex: 0,
      candidateKey: key,
      x: 2,
      y: 0,
      assisted: false,
    });
    expect(floorScore(state, run(state))).toBeCloseTo(floorAccuracy(2, 2.5) / 6);
    state = reduce(state, { type: "layFloor", pieceIndex: 0, candidateKey: key, x: 0, y: 0, assisted: true });
    expect(floorScore(state, run(state))).toBeCloseTo(0.8 / 6);
  });

  it("counts a drop exactly on the shadow as helped, however it was sent", () => {
    const state = atFloor();
    const first = floorPieces(runPattern(run(state)))[0];
    if (first === undefined) throw new Error("no piece");
    const drop = {
      type: "layFloor" as const,
      pieceIndex: 0,
      candidateKey: rightCandidate(first).key,
      x: first.x,
      y: first.y,
      assisted: false,
    };
    const exact = reduce(state, drop);
    expect(run(exact).floorLaid["0"]?.assisted).toBe(true);
    expect(reduce(exact, drop)).toBe(exact);
    expect(floorScore(exact, run(exact))).toBeCloseTo(0.8 / 6);
    const near = reduce(state, { ...drop, x: first.x + 0.5, y: first.y + 0.5 });
    expect(run(near).floorLaid["0"]?.assisted).toBe(false);
    expect(floorScore(near, run(near))).toBeGreaterThan(0.8 / 6);
  });
});
