import { describe, expect, it } from "vitest";
import { launchThemeById } from "./catalog";
import { collectionBrief, canCarryMotif } from "./collectionBrief";
import {
  benchHoursEstimate,
  boardIssues,
  harmonyMeter,
  oseiSuggestion,
  pieceHours,
  workingHoursLeft,
} from "./collectionBoard";
import type { CollectionBrief } from "./collectionState";
import type { GameState } from "./gameState";
import { checklist } from "./checklist";
import { collectionTestGame, confirmBoard, pickFirstTheme, suggestedBrief } from "./linePlaythrough";
import { reduce } from "./reduce";

function themed(): GameState {
  return pickFirstTheme(collectionTestGame());
}

function withSpot(state: GameState, spot: 1 | 2 | 3 | 4): GameState {
  if (state.launch === null) throw new Error("no launch");
  return { ...state, launch: { ...state.launch, spot } };
}

const LINE: CollectionBrief = {
  products: ["shape-pendant", "clip-pair", "bangle"],
  motif: "leaf",
  metalId: "silver",
  hero: "sea-glass",
  accent: null,
  finish: "high-shine",
  glaze: null,
};

describe("the Collection Board", () => {
  it("fits the pieces to the spot: 3 at Lantern Corner, 3–4 at Fountain Steps, 4–5 at the Arcade Stage", () => {
    const state = themed();
    expect(boardIssues(state, LINE)).toEqual([]);
    const four = { ...LINE, products: [...LINE.products, "motif-ring"] } as const;
    expect(boardIssues(state, four)).toContain("Lantern Corner shows 3 pieces.");
    expect(boardIssues(withSpot(state, 2), four)).toEqual([]);
    expect(boardIssues(withSpot(state, 3), LINE)[0]).toBe("Arcade Stage shows 4 to 5 pieces.");
    const five = { ...four, products: [...four.products, "coat-badge"] } as const;
    expect(boardIssues(withSpot(state, 4), five)).toEqual([]);
  });

  it("asks for a line, not a pile: two kinds and a different product in each slot", () => {
    const state = themed();
    const pile = { ...LINE, products: ["stack-ring", "stone-ring", "motif-ring"] } as const;
    expect(boardIssues(state, pile)).toContain("A line, not a pile.");
    const twice = { ...LINE, products: ["shape-pendant", "shape-pendant", "bangle"] } as const;
    expect(boardIssues(state, twice)).toContain("Each piece in the line is a different kind.");
  });

  it("needs a hero stone for seated pieces, an accent only with a pair, and none without stones", () => {
    const state = themed();
    expect(boardIssues(state, { ...LINE, hero: null })).toContain("Pick a hero stone for the line.");
    const bare = { ...LINE, products: ["shape-pendant", "bangle", "bag-charm"] } as const;
    expect(boardIssues(state, bare)).toContain("None of these pieces holds a stone.");
    expect(boardIssues(state, { ...bare, hero: null })).toEqual([]);
    const accent = {
      ...LINE,
      products: ["stone-pendant", "shape-pendant", "bangle"],
      accent: "garnet",
    } as const;
    expect(boardIssues(state, accent)).toContain("An accent stone needs a pair of earrings in the line.");
  });

  it("refuses locked metals, unknown motifs and a glaze without colour", () => {
    const state = themed();
    expect(boardIssues(state, { ...LINE, metalId: "green-gold" })).toContain("Green Gold is still locked.");
    expect(boardIssues(state, { ...LINE, finish: "glaze" })).toContain(
      "A glaze finish needs a glaze colour.",
    );
  });

  it("knows which pieces can carry the motif", () => {
    expect(canCarryMotif("shape-pendant")).toBe(true);
    expect(canCarryMotif("bangle")).toBe(true);
    expect(canCarryMotif("hair-slide")).toBe(true);
    expect(canCarryMotif("stack-ring")).toBe(false);
    expect(canCarryMotif("stone-ring")).toBe(false);
    expect(
      harmonyMeter({ ...LINE, products: ["stack-ring", "shape-pendant", "bangle"] }).motifShare,
    ).toBeCloseTo(2 / 3);
  });

  it("confirms once in an hour, opens Kemi's tray and is refused after that", () => {
    const state = themed();
    const confirmed = reduce(state, { type: "confirmCollection", brief: LINE });
    expect(confirmed.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
    expect(confirmed.collection?.brief).toEqual(LINE);
    expect(confirmed.collection?.gemTray).toHaveLength(16);
    expect(confirmed.story.queue).toContain("jb-kemi-hello");
    expect(reduce(confirmed, { type: "confirmCollection", brief: LINE })).toBe(confirmed);
    const unthemed = collectionTestGame();
    expect(reduce(unthemed, { type: "confirmCollection", brief: LINE })).toBe(unthemed);
  });

  it("closes the board after season day 10", () => {
    let state = themed();
    for (let day = 1; day <= 10; day += 1) state = reduce(state, { type: "endDay" });
    expect(state.calendar.day).toBe(11);
    expect(reduce(state, { type: "confirmCollection", brief: LINE })).toBe(state);
  });

  it("suggests a valid line on Relaxed and every difficulty", () => {
    for (const difficulty of ["relaxed", "standard", "challenging"] as const) {
      const state = pickFirstTheme(collectionTestGame({ difficulty }));
      const collection = state.collection;
      if (collection === null) throw new Error("no loft");
      const suggestion = oseiSuggestion(state, collection);
      expect(suggestion).not.toBeNull();
      if (suggestion !== null) expect(boardIssues(state, suggestion)).toEqual([]);
    }
  });

  it("estimates bench hours against the working hours left before Lantern Night", () => {
    const state = confirmBoard(themed());
    const collection = state.collection;
    if (collection === null || collection.brief === null) throw new Error("no board");
    expect(pieceHours("stone-pendant")).toBe(5);
    expect(pieceHours("clip-pair")).toBe(6);
    const pieces = collection.brief.products.reduce((sum, id) => sum + pieceHours(id), 0);
    expect(benchHoursEstimate(collection, collection.brief)).toBe(pieces + 1 + 2);
    expect(workingHoursLeft(state, collection)).toBe(state.calendar.hoursLeft + 12 * 10);
  });

  it("guides line pieces with the theme tags, palette and the spot's ready mark, never budget or deadline", () => {
    const theme = launchThemeById("first-blossom");
    expect(collectionBrief(theme, 1, "standard")).toEqual({
      requiredTags: ["nature", "dainty"],
      favouredColours: ["blush", "sage", "ivory", "rose-gold"],
      minQuality: 72,
    });
    expect(collectionBrief(theme, 2, "challenging").minQuality).toBe(80);
    const state = reduce(confirmBoard(themed(), suggestedBrief(themed())), {
      type: "startCollectionPiece",
      slot: 0,
    });
    const run = state.activeRun;
    if (run === null) throw new Error("no run");
    const ids = checklist(state, run).map((item) => item.id);
    expect(ids).not.toContain("budget");
    expect(ids).not.toContain("deadline");
    expect(ids).toContain("line-cost");
  });
});
