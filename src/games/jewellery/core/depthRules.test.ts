import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import {
  bestPlan,
  buyLineGems,
  collectionTestGame,
  confirmBoard,
  endDayOnce,
  lanternNightLine,
  LINE_PLAN,
  pickFirstTheme,
  stagedLaunch,
} from "./linePlaythrough";
import { reduce } from "./reduce";
import { dispatchAll, newTestGame, playRunTo, settleStories } from "./testPlaythrough";

const DEPTH_ACTIONS: readonly Action[] = [
  { type: "chooseStoryOption", beatId: "jb-loft-offer", choiceId: "launch", lineNameId: "sea-pebble" },
  { type: "openLoft", lineNameId: "sea-pebble" },
  { type: "setBenchTour", on: true },
  { type: "pickLaunchTheme", themeId: "first-blossom" },
  { type: "restLine" },
  { type: "renameLine", lineNameId: "wild-clover" },
  {
    type: "confirmCollection",
    brief: {
      products: ["shape-pendant", "drop-pair", "bangle"],
      motif: "leaf",
      metalId: "silver",
      hero: null,
      accent: null,
      finish: "high-shine",
      glaze: null,
    },
  },
  { type: "buyGems", picks: [0] },
  { type: "startCollectionPiece", slot: 0 },
  { type: "choosePotStones", indices: [0] },
  {
    type: "recordTwinJoin",
    ticks: 400,
    seams: [
      { insideTicks: 240, overTicks: 0, doneAt: 300 },
      { insideTicks: 240, overTicks: 0, doneAt: 320 },
    ],
    assisted: false,
  },
  { type: "addToCollection" },
  { type: "styleLookbookPage", pieceId: "piece-run-1", backdrop: "linen", props: [] },
  { type: "styleEveryPage", fromPieceId: "piece-run-1" },
  { type: "snapLookbookPage", pieceId: "piece-run-1", lampAngle: 90, assisted: false },
  { type: "closeLookbook" },
  { type: "stageLaunch", order: [], lantern: "rose", music: "beach-pop", card: 0 },
  { type: "moveSpot" },
  { type: "openPopup", plinth: "piece-run-1", tags: {}, shelf: [] },
];

function refusedEverywhere(state: GameState, skip: readonly Action["type"][] = []): void {
  for (const action of DEPTH_ACTIONS) {
    if (skip.includes(action.type)) continue;
    expect(reduce(state, action), action.type).toBe(state);
  }
}

describe("depth actions in the wrong state", () => {
  it("are all refused with the same state on a fresh bench", () => {
    refusedEverywhere(settleStories(newTestGame()));
  });

  it("are refused in the loft before a theme, except picking or resting and renaming", () => {
    refusedEverywhere(collectionTestGame(), ["pickLaunchTheme", "restLine", "renameLine", "setBenchTour"]);
  });

  it("refuse bench-only and early steps on Lantern Night, except staging", () => {
    const night = lanternNightLine();
    refusedEverywhere(night, ["setBenchTour"]);
    const bad = { ...bestPlan(night), card: 7 };
    expect(reduce(night, { type: "stageLaunch", ...bad })).toBe(night);
    const shuffled = { ...bestPlan(night), order: [...bestPlan(night).order].slice(1) };
    expect(reduce(night, { type: "stageLaunch", ...shuffled })).toBe(night);
  });

  it("refuse a board with an unknown product and a second theme pick", () => {
    const themed = pickFirstTheme(collectionTestGame());
    expect(reduce(themed, { type: "pickLaunchTheme", themeId: "kite-meadow" })).toBe(themed);
    const brief = {
      ...(confirmBoard(themed).collection?.brief ?? DEPTH_BRIEF),
      products: ["teapot" as never],
    };
    expect(reduce(themed, { type: "confirmCollection", brief })).toBe(themed);
  });
});

const DEPTH_BRIEF = {
  products: ["shape-pendant", "drop-pair", "bangle"] as const,
  motif: "leaf" as const,
  metalId: "silver" as const,
  hero: null,
  accent: null,
  finish: "high-shine" as const,
  glaze: null,
};

const DEPTH_BRIEF_SHAPE = { ...DEPTH_BRIEF, products: [...DEPTH_BRIEF.products] };

describe("determinism", () => {
  it("replays a whole collection season identically from the same seed", () => {
    const first = stagedLaunch(lanternNightLine({ seed: 31 }));
    const second = stagedLaunch(lanternNightLine({ seed: 31 }));
    expect(second).toEqual(first);
    const other = stagedLaunch(lanternNightLine({ seed: 32 }));
    expect(other.collection?.gemTray).not.toEqual(first.collection?.gemTray);
  });

  it("gives the same result for the same actions", () => {
    const actions: Action[] = [
      { type: "pickLaunchTheme", themeId: "first-blossom" },
      { type: "confirmCollection", brief: DEPTH_BRIEF },
      { type: "startCollectionPiece", slot: 0 },
    ];
    expect(dispatchAll(collectionTestGame(), actions)).toEqual(dispatchAll(collectionTestGame(), actions));
  });
});

const MALFORMED = [
  { type: "confirmCollection", brief: null },
  { type: "confirmCollection", brief: {} },
  { type: "confirmCollection", brief: { ...DEPTH_BRIEF_SHAPE, products: "ring" } },
  { type: "confirmCollection", brief: { ...DEPTH_BRIEF_SHAPE, hero: 4 } },
  { type: "buyGems", picks: null },
  { type: "choosePotStones", indices: null },
  { type: "recordTwinJoin", ticks: 100, seams: null, assisted: false },
  { type: "recordTwinJoin", ticks: 100, seams: [null, null], assisted: false },
  { type: "styleLookbookPage", pieceId: "piece-run-1", backdrop: "linen", props: null },
  { type: "styleLookbookPage", pieceId: "piece-run-1", backdrop: "linen", props: [null] },
  { type: "stageLaunch", order: null, lantern: "rose", music: "beach-pop", card: 0 },
  { type: "openPopup", plinth: null, tags: null, shelf: null },
  { type: "openPopup", plinth: "piece-run-1", tags: {}, shelf: null },
] as unknown as readonly Action[];

describe("malformed depth payloads", () => {
  it("return the same state instead of throwing at every step of a season", () => {
    const themed = pickFirstTheme(collectionTestGame());
    const gemmed = buyLineGems(confirmBoard(themed));
    const atSet = playRunTo(reduce(gemmed, { type: "startCollectionPiece", slot: 0 }), LINE_PLAN, "set");
    const night = lanternNightLine();
    const popupDay = endDayOnce(stagedLaunch(night));
    for (const state of [themed, gemmed, atSet, night, popupDay])
      for (const action of MALFORMED) expect(reduce(state, action), action.type).toBe(state);
  });
});
