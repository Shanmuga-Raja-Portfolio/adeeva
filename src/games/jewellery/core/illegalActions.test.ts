import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { EMPTY_CART } from "./supplies";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

const NO_RUN_ACTIONS: readonly Action[] = [
  { type: "acceptOffer", offerId: "gig-404" },
  { type: "declineOffer", offerId: "gig-404" },
  { type: "startOrder", gigId: "gig-404" },
  { type: "abandonRun" },
  { type: "goToStage", stage: "cut" },
  { type: "chooseOption", slot: "shape", optionId: "star" },
  { type: "chooseMetal", metalId: "silver" },
  { type: "chooseStone", stoneId: "garnet" },
  { type: "buySupplies", cart: { ...EMPTY_CART, clips: 1 } },
  { type: "placePart", partKey: "plate", size: "sheet", x: 1, y: 1, rotation: 0 },
  { type: "removePart", partKey: "plate" },
  { type: "showMePlan" },
  { type: "cutPath", pathId: "plate", strokes: [[[1, 1]]], pxPerMm: 10, assisted: false },
  { type: "recordJoin", jointId: "seat", ticks: 10, insideTicks: 5, overTicks: 0, assisted: false },
  { type: "restartJoin", jointId: "seat" },
  {
    type: "setStone",
    seatKey: "seat",
    x: 0,
    y: 0,
    rotation: 0,
    claws: [0.8, 0.8, 0.8, 0.8],
    assisted: false,
  },
  {
    type: "polishStroke",
    partKey: "plate",
    samples: [
      [0, 0],
      [9, 9],
    ],
    pxPerMm: 10,
  },
  { type: "buffPart", partKey: "plate" },
  { type: "restartPolish", partKey: "plate" },
  { type: "chooseFinish", finish: "satin", glaze: null },
  { type: "chooseChain", chain: "fine-chain", cordColour: null },
  { type: "addCharm", charmId: "star-charm", x: 100, y: 100 },
  { type: "moveCharm", charmPieceId: "charm-1", x: 1, y: 1, rotation: 0, scale: 1, layer: 1 },
  { type: "removeCharm", charmPieceId: "charm-1" },
  { type: "deliver" },
  { type: "finishStall" },
  { type: "showTray", slots: [null, null, null], cloth: "teal", sign: 0 },
  { type: "buyUpgrade", upgradeId: "steady-peg" },
  { type: "buyDecor", decorId: "velvet-awning" },
  { type: "markBeatSeen", beatId: "jb-nowhere" },
  { type: "setGuide", on: true },
  {
    type: "newGame",
    seed: 1,
    name: " ",
    look: newTestGame().profile.look,
    trait: "dreamer",
    difficulty: "standard",
    career: "bench",
    lineNameId: "little-lantern",
  },
];

function midDisplay(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, GOOD_PLAN, "display");
}

describe("illegal actions", () => {
  it("return the very same state with nothing on the bench", () => {
    const state = settleStories(newTestGame());
    for (const action of NO_RUN_ACTIONS) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state mid-piece", () => {
    const state = midDisplay();
    const illegal: Action[] = [
      { type: "goToStage", stage: "design" },
      { type: "goToStage", stage: "polish" },
      { type: "goToStage", stage: "done" },
      { type: "goToStage", stage: "review" },
      { type: "chooseMetal", metalId: "copper" },
      { type: "startStall", productId: "stack-ring" },
      { type: "addCharm", charmId: "star-charm", x: 500, y: 100 },
      { type: "addCharm", charmId: "pearl-drop", x: 100, y: 100 },
      { type: "chooseFinish", finish: "glaze", glaze: null },
      { type: "chooseFinish", finish: "satin", glaze: "sky" },
      { type: "chooseChain", chain: "rope-chain", cordColour: null },
      { type: "chooseChain", chain: "fine-chain", cordColour: "sky" },
      { type: "deliver" },
      { type: "finishStall" },
      { type: "workShift" },
      { type: "cutPath", pathId: "plate", strokes: [[[1, 1]]], pxPerMm: 10, assisted: false },
    ];
    for (const action of illegal) expect(reduce(state, action), action.type).toBe(state);
  });

  it("move charms only in 15 degree turns, up to 1.5 times as big, inside the card", () => {
    const state = reduce(
      {
        ...midDisplay(),
        stock: { ...midDisplay().stock, extras: { ...midDisplay().stock.extras, "star-charm": 2 } },
      },
      {
        type: "addCharm",
        charmId: "star-charm",
        x: 120,
        y: 120,
      },
    );
    const placed = state.activeRun?.display.charms[0];
    if (placed === undefined) throw new Error("no charm");
    const move = {
      type: "moveCharm" as const,
      charmPieceId: placed.id,
      x: 130,
      y: 110,
      rotation: 30,
      scale: 1.5,
      layer: 2,
    };
    expect(reduce(state, move)).not.toBe(state);
    expect(reduce(state, { ...move, rotation: 20 })).toBe(state);
    expect(reduce(state, { ...move, scale: 1.6 })).toBe(state);
    expect(reduce(state, { ...move, x: 241 })).toBe(state);
    expect(reduce(state, { type: "removeCharm", charmPieceId: placed.id }).activeRun?.display.charms).toEqual(
      [],
    );
  });
});
