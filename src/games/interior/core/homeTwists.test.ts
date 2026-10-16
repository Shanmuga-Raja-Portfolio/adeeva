import { describe, expect, it } from "vitest";
import { roomById } from "./catalog";
import { floorCandidates, isRightPiece, rightCandidate, runFloorPieces } from "./floorLay";
import type { GameState } from "./gameState";
import { glowPath, walkPath } from "./glowPath";
import { homeRecipe, newShowHomeGame, openRoom, planHome, startHome } from "./larkspurPlaythrough";
import type { MakeoverRun } from "./makeoverRun";
import { runEdgePaths } from "./paintEdge";
import { rollRecord, rollScore } from "./paintRoll";
import { reduce } from "./reduce";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";
import { runRoom } from "./runRoom";
import {
  lastGigId,
  newTestGame,
  playRunTo,
  recipeFor,
  rowStroke,
  settleStories,
  withOrder,
} from "./testPlaythrough";
import { thresholdFloor } from "./threshold";
import { planCart } from "./warehouse";

function homeAt(state: GameState, roomIndex: number, stage: MakeoverRun["stage"], lower: boolean): GameState {
  const opened = openRoom(state, roomIndex);
  const run = opened.activeRun;
  if (run === null) throw new Error("No room");
  const planned = playRunTo(opened, homeRecipe(opened, run), "plan");
  const recipe = homeRecipe(planned, run);
  const atPlan = playRunTo(planned, recipe, "plan");
  const twoTone = lower
    ? reduce(atPlan, { type: "choosePaint", slot: "lower", paintId: "midnight-ink" })
    : atPlan;
  return playRunTo(twoTone, recipe, stage);
}

function active(state: GameState): MakeoverRun {
  if (state.activeRun === null) throw new Error("No room");
  return state.activeRun;
}

const PLOT_ONE = planHome(startHome(newShowHomeGame()));
const PLOT_TWO = (() => {
  const base = newShowHomeGame();
  const larkspur = base.larkspur;
  if (larkspur === null) throw new Error("No Larkspur");
  return planHome(startHome({ ...base, larkspur: { ...larkspur, plot: 2 } }));
})();

describe("two-tone walls", () => {
  it("adds a lower tin and a mid-wall tape on the back wall only, never with a feature wall", () => {
    const planning = homeAt(PLOT_ONE, 0, "plan", true);
    const run = active(planning);
    expect(run.plan.lowerPaint).toBe("midnight-ink");
    expect(planCart(run).paints["midnight-ink"]).toBe(1);
    expect(roomTags(roomSource(run))).toContain("bold");
    expect(runEdgePaths(run).map((path) => path.id)).toContain("back-mid");
    expect(
      runEdgePaths(run)
        .filter((path) => path.kind === "mid")
        .every((path) => path.wall === "back"),
    ).toBe(true);
    expect(reduce(planning, { type: "choosePaint", slot: "feature", paintId: "sunflower" })).toBe(planning);
    const nook = withOrder(settleStories(newTestGame()), "nana-pearl");
    const makeover = playRunTo(
      reduce(nook, { type: "startOrder", gigId: lastGigId(nook) }),
      recipeFor("nana-pearl"),
      "plan",
    );
    expect(reduce(makeover, { type: "choosePaint", slot: "lower", paintId: "sunflower" })).toBe(makeover);
  });

  it("smudges a pass in the wrong zone and switches zones with the trays", () => {
    const painting = homeAt(PLOT_ONE, 0, "paint", true);
    expect(active(painting).rollerZone).toBe("top");
    const top = reduce(painting, {
      type: "rollStroke",
      wall: "back",
      points: rowStroke(0),
      durationMs: 1000,
    });
    expect(rollRecord(active(top), "back").smudges).toBe(0);
    const wrong = reduce(reduce(top, { type: "reloadRoller" }), {
      type: "rollStroke",
      wall: "back",
      points: rowStroke(4),
      durationMs: 1000,
    });
    const record = rollRecord(active(wrong), "back");
    expect(record.smudges).toBeGreaterThan(0);
    expect(record.passes.slice(32).every((passes) => passes === 0)).toBe(true);
    const switched = reduce(wrong, { type: "pickTray", zone: "bottom" });
    expect(active(switched).rollerZone).toBe("bottom");
    expect(reduce(switched, { type: "pickTray", zone: "bottom" })).toBe(switched);
    const right = reduce(switched, {
      type: "rollStroke",
      wall: "back",
      points: rowStroke(4),
      durationMs: 1000,
    });
    expect(
      rollRecord(active(right), "back")
        .passes.slice(32)
        .some((passes) => passes > 0),
    ).toBe(true);
    expect(rollScore(right, active(right), "back")).toBeLessThan(
      rollScore(
        right,
        {
          ...active(right),
          rolls: { ...active(right).rolls, back: { ...rollRecord(active(right), "back"), smudges: 0 } },
        },
        "back",
      ),
    );
    const plain = homeAt(PLOT_ONE, 0, "paint", false);
    expect(reduce(plain, { type: "pickTray", zone: "bottom" })).toBe(plain);
  });
});

describe("where floors meet", () => {
  it("mixes the hall floor into the first three pieces only when both floors share a pattern", () => {
    expect(PLOT_TWO.larkspur?.project?.palette.hallFloor).not.toBeNull();
    const room = openRoom(PLOT_TWO, 1);
    const run = active(room);
    const withHall = (hallFloor: "walnut-boards" | "cork-tiles" | "oak-boards"): MakeoverRun => ({
      ...run,
      purpose: { ...run.purpose, hallFloor } as MakeoverRun["purpose"],
      plan: { ...run.plan, floor: "oak-boards" },
    });
    expect(thresholdFloor(withHall("walnut-boards"))).toBe("walnut-boards");
    expect(thresholdFloor(withHall("cork-tiles"))).toBeNull();
    expect(thresholdFloor(withHall("oak-boards"))).toBeNull();
    const mixedRun = withHall("walnut-boards");
    const pieces = runFloorPieces(mixedRun);
    expect(pieces.slice(0, 3).every((piece) => piece.source === "hall")).toBe(true);
    expect(pieces.slice(3).every((piece) => piece.source === "room")).toBe(true);
    const first = pieces[0];
    if (first === undefined) throw new Error("No piece");
    const candidates = floorCandidates(mixedRun, first);
    expect(candidates.some((candidate) => candidate.source === "room")).toBe(true);
    expect(isRightPiece(mixedRun, 0, rightCandidate(first).key)).toBe(true);
    expect(isRightPiece(mixedRun, 0, rightCandidate({ ...first, source: "room" }).key)).toBe(false);
    const plotOne = active(openRoom(PLOT_ONE, 0));
    expect(thresholdFloor(plotOne)).toBeNull();
  });
});

describe("light the way", () => {
  it("follows the shortest walk from the door to the through door and counts glowing cells", () => {
    const run = active(openRoom(PLOT_ONE, 0));
    const room = runRoom(run);
    const path = walkPath(room, []);
    expect(path?.[path.length - 1]).toEqual([4, 1]);
    expect(path?.[0]).toEqual([4, 2]);
    expect(glowPath(room, [], [])?.glowing).toBe(0);
    expect(glowPath(room, [], [{ lightId: "paper-pendant", col: 4, row: 1 }])?.glowing).toBe(path?.length);
    expect(walkPath(roomById("reading-nook"), [])).toBeNull();
  });
});
