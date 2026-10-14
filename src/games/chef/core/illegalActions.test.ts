import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  must,
  newTestGame,
  perfectChop,
  perfectFollow,
  perfectPlate,
  perfectSizzle,
  settleStories,
} from "./testPlaythrough";
import { dishById } from "./catalog";

const NOTHING_ON: readonly Action[] = [
  { type: "acceptOffer", offerId: "gig-404" },
  { type: "declineOffer", offerId: "gig-404" },
  { type: "startOrderDish", gigId: "gig-404", dishId: "dal-tadka" },
  { type: "startPractice", dishId: "nope" },
  { type: "startTest", test: "graduation", dishIds: ["dal-tadka", "jollof-rice", "miso-soup"] },
  { type: "startNextTestDish" },
  { type: "abandonRun" },
  { type: "goToStage", stage: "cook" },
  { type: "placeIngredient", ingredientId: "garlic" },
  { type: "chopItem", itemIndex: 0, record: perfectChop(2) },
  {
    type: "cookSizzle",
    record: perfectSizzle(
      dishById("dal-tadka").sizzle ?? { piece: "seeds", count: 3, idealDots: 2, flips: 1 },
    ),
  },
  { type: "stirSimmer", sample: perfectFollow(3) },
  { type: "stopSimmer" },
  { type: "tasteDish", pinches: ["lime-squeeze"], tastes: 1, assisted: false },
  { type: "plateDish", record: perfectPlate(dishById("dal-tadka")) },
  { type: "ringBell" },
  { type: "startShift", offerId: "shift-1-1", setup: { special: null, helpers: [] } },
  { type: "startStationTest", cuisine: "indian" },
  {
    type: "serviceStep",
    slot: { ticketId: "ticket-1", dishIndex: 0 },
    at: 1,
    record: { kind: "plate", wiped: true },
  },
  { type: "staffStep", slot: { ticketId: "ticket-1", dishIndex: 0 }, at: 1 },
  { type: "assignStaff", staffId: "lin", station: "hob" },
  { type: "endService", at: 1 },
  { type: "setMenu", dishIds: ["dal-tadka"] },
  { type: "buyUpgrade", upgradeId: "plating-spoons" },
  { type: "markBeatSeen", beatId: "ch-nowhere" },
  { type: "setGuide", on: true },
  {
    type: "newGame",
    seed: 1,
    name: " ",
    look: newTestGame().profile.look,
    trait: "dreamer",
    difficulty: "standard",
    start: "student",
  },
];

function onTheBoard(): GameState {
  return settleStories(must(settleStories(newTestGame()), { type: "startLesson" }));
}

describe("illegal actions", () => {
  it("return the very same state when nothing is on the board", () => {
    const state = settleStories(newTestGame());
    for (const action of NOTHING_ON) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state mid-dish", () => {
    const state = onTheBoard();
    const illegal: Action[] = [
      { type: "goToStage", stage: "cook" },
      { type: "goToStage", stage: "done" },
      { type: "startLesson" },
      { type: "startPractice", dishId: "jollof-rice" },
      { type: "potWash" },
      { type: "placeIngredient", ingredientId: "garlic" },
      { type: "chopItem", itemIndex: 0, record: perfectChop(2) },
      { type: "ringBell" },
    ];
    for (const action of illegal) expect(reduce(state, action), action.type).toBe(state);
    const mise = must(state, { type: "goToStage", stage: "mise" });
    expect(reduce(mise, { type: "placeIngredient", ingredientId: "tomato" })).toBe(mise);
    const once = must(mise, { type: "placeIngredient", ingredientId: "garlic" });
    expect(reduce(once, { type: "placeIngredient", ingredientId: "garlic" })).toBe(once);
    expect(reduce(once, { type: "goToStage", stage: "cook" })).toBe(once);
  });

  it("insist on the dish's step order and well-formed records", () => {
    const placed = ["toor-dal", "ghee", "cumin-seeds", "garlic", "turmeric"].reduce(
      (next, ingredientId) => reduce(next, { type: "placeIngredient", ingredientId }),
      must(onTheBoard(), { type: "goToStage", stage: "mise" }),
    );
    const cooking = must(placed, { type: "goToStage", stage: "cook" });
    expect(reduce(cooking, { type: "stirSimmer", sample: perfectFollow(3) })).toBe(cooking);
    expect(reduce(cooking, { type: "chopItem", itemIndex: 1, record: perfectChop(2) })).toBe(cooking);
    expect(reduce(cooking, { type: "chopItem", itemIndex: 0, record: perfectChop(5) })).toBe(cooking);
    expect(reduce(cooking, { type: "goToStage", stage: "mise" })).not.toBe(cooking);
    const chopped = must(cooking, { type: "chopItem", itemIndex: 0, record: perfectChop(2) });
    expect(reduce(chopped, { type: "goToStage", stage: "mise" })).toBe(chopped);
    expect(
      reduce(chopped, {
        type: "stirSimmer",
        sample: { progress: 1, ticks: 10, insideTicks: 10, assisted: false },
      }),
    ).toBe(chopped);
    expect(reduce(chopped, { type: "stopSimmer" })).toBe(chopped);
  });

  it("refuse service moves that go back in time or hit a ticket not yet on the rail", () => {
    const head = settleStories(
      must(settleStories(newTestGame({ start: "head" })), {
        type: "setMenu",
        dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"],
      }),
    );
    const offer = head.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = settleStories(
      must(head, {
        type: "startShift",
        offerId: offer.id,
        setup: { special: null, helpers: ["lin", "yaw"] },
      }),
    );
    const late = open.service?.tickets[9];
    if (late === undefined) throw new Error("no late ticket");
    expect(
      reduce(open, {
        type: "serviceStep",
        slot: { ticketId: late.id, dishIndex: 0 },
        at: 3,
        record: { kind: "plate", wiped: true },
      }),
    ).toBe(open);
    expect(reduce(open, { type: "endService", at: -1 })).toBe(open);
    expect(reduce(open, { type: "endService", at: 999 })).toBe(open);
    expect(reduce(open, { type: "assignStaff", staffId: "teo", station: "hob" })).toBe(open);
    expect(reduce(open, { type: "endDay" })).toBe(open);
  });

  it("return the very same state for crafted actions a player could send by hand", () => {
    const head = settleStories(newTestGame({ start: "head" }));
    const line: GameState = { ...head, rung: "line", reputation: 40, passes: { line: 5, sous: 0, head: 0 } };
    const crafted = [
      { type: "startTest", test: "station", dishIds: ["dal-tadka", "spaghetti-al-pomodoro", "miso-soup"] },
      { type: "startTest", test: "graduation", dishIds: null },
      { type: "setMenu", dishIds: null },
      { type: "bake-a-cake" },
    ] as unknown as readonly Action[];
    for (const action of crafted) {
      expect(reduce(line, action), JSON.stringify(action)).toBe(line);
      expect(reduce(head, action), JSON.stringify(action)).toBe(head);
    }
  });
});
