import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

const HUB_ILLEGAL: readonly Action[] = [
  { type: "acceptOffer", offerId: "missing" },
  { type: "declineOffer", offerId: "missing" },
  { type: "startFlip", gigId: "missing" },
  { type: "abandonFlip" },
  { type: "goToStage", stage: "design" },
  { type: "chooseRecipe", recipeId: "tote-bag" },
  { type: "choosePart", groupId: "skirt", partId: "pencil-skirt" },
  { type: "openMarket" },
  { type: "closeMarket" },
  { type: "buyFinds", slotIds: ["missing"] },
  { type: "chooseFinds", findIds: ["missing"] },
  { type: "pullStitch", findKey: "find-1", line: 0, stitch: 0, distanceCm: 2, assisted: false },
  { type: "scrubStain", findKey: "find-1", stainId: "stain-1", cellTicks: [1], harshTicks: 0, scrubTicks: 1 },
  { type: "soakStains" },
  { type: "placePiece", pieceId: "strip-1", x: 0, y: 0, rotation: 0 },
  { type: "removePiece", pieceId: "strip-1" },
  { type: "autoLayout" },
  { type: "commitCut", assisted: false },
  { type: "traceCut", pieceId: "cushion-front", samples: [] },
  { type: "recordSeam", seamId: "tube", progress: 1, ticks: 100, insideTicks: 100, assisted: false },
  { type: "resetSeam", seamId: "tube" },
  { type: "addFinish", finish: { kind: "mark", markId: "mend-cross", colour: null }, x: 1, y: 1 },
  { type: "moveFinish", finishId: "finish-1", x: 1, y: 1, rotation: 0, scale: 1, layer: 1 },
  { type: "removeFinish", finishId: "finish-1" },
  { type: "deliver" },
  { type: "holdStall", prices: {} },
  { type: "buyUpgrade", upgradeId: "stall-awning" },
  { type: "markBeatSeen", beatId: "tf-intro" },
];

describe("illegal actions", () => {
  it("return the very same state", () => {
    const state = settleStories(newTestGame());
    for (const action of HUB_ILLEGAL) expect(reduce(state, action), action.type).toBe(state);
  });

  it("refuses a recipe the client did not ask for", () => {
    const base = settleStories(newTestGame());
    const offer = base.gigs.offers[0];
    if (offer === undefined) throw new Error("No offer");
    const started = [
      { type: "acceptOffer", offerId: offer.id },
      { type: "startFlip", gigId: offer.id },
      { type: "goToStage", stage: "design" },
    ].reduce<typeof base>((state, action) => reduce(state, action as Action), base);
    const wrong = offer.clientId === "nana-bea" ? "tote-bag" : "cushion-cover";
    expect(reduce(started, { type: "chooseRecipe", recipeId: wrong })).toBe(started);
  });
});
