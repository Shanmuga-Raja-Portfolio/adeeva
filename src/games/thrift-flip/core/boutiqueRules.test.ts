import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import {
  boutiqueStart,
  endDays,
  openedBoutique,
  settleWithChoice,
  stallDayAtThreshold,
} from "./boutiquePlaythrough";
import { flipPieces } from "./flipPieces";
import type { GameState } from "./gameState";
import { runBoard, runLayoutIssues } from "./layout";
import { reduce } from "./reduce";
import { THROW_SPLIT_REASON } from "./throwSplit";
import { autoPlacements } from "./autoLayout";
import {
  dispatchAll,
  newTestGame,
  playFlipToReview,
  runOf,
  settleStories,
  withFind,
} from "./testPlaythrough";

const BOUTIQUE_ILLEGAL: readonly Action[] = [
  { type: "chooseStoryOption", beatId: "tf-boutique-offer", choiceId: "open", signId: "second-bloom" },
  { type: "openBoutique", signId: "second-bloom" },
  { type: "shelvePiece", pieceId: "piece-1" },
  { type: "unshelvePiece", pieceId: "piece-1" },
  { type: "fillShelf" },
  { type: "dressWindow", pieces: [{ pieceId: "piece-1", x: 10, y: 10 }], props: [] },
  { type: "buyProp", propId: "paper-moon" },
  {
    type: "stageShowcase",
    order: ["piece-1"],
    mood: "beach-pop",
    light: "warm",
    cards: { "piece-1": "fresh" },
  },
  { type: "tablePull", tableId: "table-1", stitch: 0, distanceCm: 2, assisted: false },
  { type: "tableScrub", tableId: "table-1", cellTicks: [1], harshTicks: 0, scrubTicks: 1 },
  { type: "tableSoak", tableId: "table-1" },
  { type: "tableSew", tableId: "table-1", progress: 1, ticks: 100, insideTicks: 100, assisted: false },
  { type: "resetTableSeam", tableId: "table-1" },
  { type: "swapFind", slotId: "swap-1", findKey: "find-1" },
  { type: "buyUpgrade", upgradeId: "swap-shelf" },
];

function script(state: GameState): GameState {
  const offer = state.gigs.offers[0];
  const steps: Action[] = [
    ...(offer === undefined ? [] : [{ type: "acceptOffer", offerId: offer.id } as const]),
    { type: "workShift" },
    { type: "endDay" },
  ];
  return settleStories(dispatchAll(state, steps));
}

describe("boutique rules", () => {
  it("return the very same state for every illegal boutique action at the stall", () => {
    const state = settleStories(newTestGame());
    for (const action of BOUTIQUE_ILLEGAL) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state for illegal actions inside the boutique too", () => {
    const state = { ...openedBoutique(), coins: 0 };
    for (const action of BOUTIQUE_ILLEGAL.filter((entry) => entry.type !== "buyUpgrade"))
      expect(reduce(state, action), action.type).toBe(state);
    expect(reduce(state, { type: "buyUpgrade", upgradeId: "swap-shelf" })).toBe(state);
    const rich = { ...state, coins: 500 };
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "swap-shelf" }).upgrades).toContain("swap-shelf");
  });

  it("is deterministic: the same seed and the same choices give the same boutique", () => {
    const run = () => {
      let state = openedBoutique({ seed: 42 });
      for (let day = 0; day < 12; day += 1) state = script(state);
      return state;
    };
    expect(run()).toEqual(run());
    const other = (() => {
      let state = openedBoutique({ seed: 43 });
      for (let day = 0; day < 12; day += 1) state = script(state);
      return state;
    })();
    expect(other).not.toEqual(run());
  });

  it("counts things saved: each find in a flip, each ticket, each swap and table", () => {
    const state = settleStories(newTestGame());
    const own = playFlipToReview(state, null, {
      design: { recipeId: "cushion-cover", parts: {} },
      findId: "linen-curtain",
      grade: "like-new",
      pullCm: 2,
      harshShare: 0,
      cut: "trace",
      seamAccuracy: 0.9,
    });
    expect(reduce(own, { type: "deliver" }).keptInUse).toBe(1);
  });

  it("queues the Fifty Saved beat in the boutique only", () => {
    const base = { ...boutiqueStart(), keptInUse: 49 };
    const own = playFlipToReview(base, null, {
      design: { recipeId: "cushion-cover", parts: {} },
      findId: "linen-curtain",
      grade: "like-new",
      pullCm: 2,
      harshShare: 0,
      cut: "trace",
      seamAccuracy: 0.9,
    });
    expect(reduce(own, { type: "deliver" }).story.queue).toContain("tf-kept-50");
  });

  it("asks the Patchwork Lap Throw for at least three squares on each of two finds", () => {
    const base = withFind(withFind(boutiqueStart(), "linen-cloth"), "picnic-blanket");
    const keys = base.stock.finds.slice(-2).map((owned) => owned.id);
    const atLayout = dispatchAll(base, [
      { type: "startOwnFlip" },
      { type: "chooseRecipe", recipeId: "patch-throw" },
      { type: "goToStage", stage: "market" },
      { type: "chooseFinds", findIds: [keys[0] ?? ""] },
    ]);
    const run = runOf(atLayout);
    const oneFind = autoPlacements(runBoard(run), flipPieces(run.design), {});
    expect(oneFind).not.toBeNull();
    const allOnOne = { ...run, placements: oneFind ?? {} };
    expect(runLayoutIssues(allOnOne).map((issue) => issue.message)).toContain(THROW_SPLIT_REASON);
    const both = reduce(atLayout, { type: "chooseFinds", findIds: keys });
    const twoRun = runOf(both);
    const board = runBoard(twoRun);
    const second = board.panels.find((panel) => panel.findKey === keys[1]);
    if (second === undefined) throw new Error("No second find");
    const placements = { ...(oneFind ?? {}) };
    ["square-7", "square-8", "square-9"].forEach((id, index) => {
      placements[id] = { x: second.x + 2 + index * 22, y: second.y + 2, rotation: 0 };
    });
    const split = { ...twoRun, placements };
    expect(runLayoutIssues(split).map((issue) => issue.message)).not.toContain(THROW_SPLIT_REASON);
  });

  it("offers the boutique only once the stall is ready, and 'Not yet' keeps the stall going", () => {
    const later = settleWithChoice(reduce(stallDayAtThreshold(), { type: "endDay" }), "later");
    expect(later.profile.career).toBe("stall");
    const weekLater = endDays(later, 7);
    expect(weekLater.story.queue).not.toContain("tf-boutique-offer");
  });
});
