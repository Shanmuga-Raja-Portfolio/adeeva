import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playUntil,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

const HUB_ILLEGAL: readonly Action[] = [
  { type: "acceptOffer", offerId: "missing" },
  { type: "declineOffer", offerId: "missing" },
  { type: "startCommission", gigId: "missing" },
  { type: "setAside" },
  { type: "goToStage", stage: "design" },
  { type: "chooseProduct", productId: "birdhouse" },
  { type: "chooseOption", slot: "edge", optionId: "rounded-edge" },
  { type: "chooseWood", woodId: "pine" },
  { type: "buyBoards", sizes: ["long"] },
  { type: "buyPlan" },
  { type: "placePart", partId: "roof-1", boardId: "board-1", x: 0, y: 0, rotation: 0 },
  { type: "removePart", partId: "roof-1" },
  { type: "showMe", partId: null },
  { type: "sawCut", partId: "roof-1", cut: 0, samples: [[0, 0]] },
  { type: "sawAssist", partId: "roof-1" },
  { type: "seatJoint", jointId: "peg-1", pose: { x: 0, y: 0, angle: 0 }, goodTaps: 2, assisted: false },
  { type: "resetJoint", jointId: "peg-1" },
  {
    type: "sandDrag",
    surfaceId: "roof-1",
    points: [
      [0, 0],
      [100, 0],
    ],
    assisted: false,
  },
  { type: "chooseFinish", finishId: "clear-oil", paint: null },
  { type: "addExtra", extraId: "wood-knob", x: 10, y: 10, piece: 0 },
  { type: "moveExtra", placedId: "extra-1", x: 1, y: 1, rotation: 0, scale: 1, layer: 1 },
  { type: "removeExtra", placedId: "extra-1" },
  { type: "chooseCushion", fabricId: "sky-gingham" },
  { type: "recordSeam", progress: 1, ticks: 100, insideTicks: 100, assisted: false },
  { type: "resetSeam" },
  { type: "deliver" },
  { type: "buyUpgrade", upgradeId: "skylight" },
  { type: "buyDecor", decorId: "bench-lamp", paint: null },
  { type: "markBeatSeen", beatId: "ww-key" },
];

describe("illegal actions", () => {
  it("return the very same state from the hub", () => {
    const state = settleStories(newTestGame());
    for (const action of HUB_ILLEGAL) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state in the middle of a commission", () => {
    const base = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const atLayout = playUntil(base, lastGigId(base), BIRDHOUSE_PLAN, "layout");
    const wrongStep: readonly Action[] = [
      { type: "chooseProduct", productId: "toy-chest" },
      { type: "buyPlan" },
      { type: "sawAssist", partId: "roof-1" },
      { type: "goToStage", stage: "join" },
      { type: "goToStage", stage: "saw" },
      { type: "goToStage", stage: "brief" },
      { type: "startCommission", gigId: lastGigId(base) },
      { type: "placePart", partId: "ghost", boardId: atLayout.boards[0]?.id ?? "", x: 0, y: 0, rotation: 0 },
      { type: "placePart", partId: "roof-1", boardId: "board-99", x: 0, y: 0, rotation: 0 },
      {
        type: "placePart",
        partId: "roof-1",
        boardId: atLayout.boards[0]?.id ?? "",
        x: Number.NaN,
        y: 0,
        rotation: 0,
      },
    ];
    for (const action of wrongStep) expect(reduce(atLayout, action), action.type).toBe(atLayout);
  });

  it("refuses a product the client did not ask for and a wood not yet unlocked", () => {
    const base = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const atDesign = [
      { type: "startCommission", gigId: lastGigId(base) },
      { type: "goToStage", stage: "design" },
    ].reduce((state, action) => reduce(state, action as Action), base);
    expect(reduce(atDesign, { type: "chooseProduct", productId: "toy-chest" })).toBe(atDesign);
    expect(reduce(atDesign, { type: "chooseWood", woodId: "walnut" })).toBe(atDesign);
    expect(reduce(atDesign, { type: "chooseOption", slot: "legs", optionId: "tapered-legs" })).toBe(atDesign);
  });
});
