import { describe, expect, it } from "vitest";
import { SEASONS } from "../content/season";
import type { ShowcasePlan } from "./boutique";
import { boutiqueStart, endDays, rackPieceFixture, withRack } from "./boutiquePlaythrough";
import type { GameState } from "./gameState";
import type { PlacedFinish } from "./flipRun";
import type { RackPiece } from "./rackPiece";
import { reduce } from "./reduce";
import { autoPlan, hallTip, showcaseIssues, storyCardsFor } from "./showcase";
import { rosetteFor, scoreShowcase, type ShowcaseContext } from "./showcaseScore";

function present<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing test value");
  return value;
}

const blossom = present(SEASONS[0]);

const patch: PlacedFinish = {
  id: "finish-1",
  item: {
    kind: "patch",
    patchId: "patch-heart",
    scrap: {
      id: "scrap-1",
      name: "Scrap",
      colour: "blush",
      print: "solid",
      material: "cotton",
      tags: ["romantic"],
    },
  },
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  layer: 1,
};
const button: PlacedFinish = {
  ...patch,
  id: "finish-2",
  item: { kind: "trim", trimId: "button", source: "saved" },
};

const CONTEXT: ShowcaseContext = {
  season: blossom,
  seasonNumber: 1,
  late: false,
  difficulty: "standard",
  rollingRails: false,
};

function decentShow(): RackPiece[] {
  return [
    rackPieceFixture("piece-1", {
      recipeId: "hair-bow-set",
      design: { recipeId: "hair-bow-set", parts: {} },
      quality: 84,
      leaves: 66,
      tags: ["romantic", "playful"],
      colours: ["blush", "sage"],
      findIds: ["coral-sundress"],
      finishes: [patch, button],
    }),
    rackPieceFixture("piece-2", {
      recipeId: "tote-bag",
      quality: 85,
      leaves: 64,
      tags: ["casual", "playful"],
      colours: ["sage", "lavender"],
      findIds: ["linen-trousers", "satin-robe"],
      finishes: [patch, button],
    }),
    rackPieceFixture("piece-3", {
      recipeId: "remade-top",
      design: { recipeId: "remade-top", parts: { bodice: "wrap-bodice", sleeves: "sleeveless" } },
      quality: 90,
      leaves: 62,
      tags: ["romantic", "elegant"],
      colours: ["blush", "ivory"],
      findIds: ["rose-curtains"],
      finishes: [patch, button],
    }),
  ];
}

function showReady(pieces: RackPiece[]): GameState {
  const state = endDays(withRack(boutiqueStart(), pieces), 21);
  return pieces.reduce((next, piece) => reduce(next, { type: "shelvePiece", pieceId: piece.id }), state);
}

function plan(state: GameState): ShowcasePlan {
  const auto = autoPlan(state);
  if (auto === null) throw new Error("No plan");
  return auto;
}

describe("the Upcycle Showcase", () => {
  it("scores a decent three-piece show in Silver Thread", () => {
    const result = scoreShowcase(decentShow(), { mood: "dreamy-strings", light: "warm" }, CONTEXT);
    expect(result.panels.map((panel) => panel.id)).toEqual(["craft-circle", "green-thread", "story-table"]);
    expect(result.overall).toBeGreaterThanOrEqual(78);
    expect(result.overall).toBeLessThanOrEqual(86);
    expect(result.rosette).toBe("silver-thread");
    expect(result.requests).toBe(Math.round((result.overall - 50) / 5));
    expect(result.coins).toBe(result.requests * 30);
    expect(result.reputation).toBe(Math.round((result.overall - 40) / 6));
    expect(result.buzz).toBe(Math.round(result.overall / 4));
  });

  it("scores one and two piece shows, with full show flow for one piece", () => {
    const [first, second] = decentShow();
    const one = scoreShowcase([present(first)], { mood: "dreamy-strings", light: "warm" }, CONTEXT);
    expect(one.panels[2]?.parts.find((part) => part.id === "flow")?.value).toBe(100);
    expect(one.panels[2]?.parts.find((part) => part.id === "range")?.value).toBe(40);
    const two = scoreShowcase(
      [present(first), present(second)],
      { mood: "dreamy-strings", light: "warm" },
      CONTEXT,
    );
    expect(two.panels[2]?.parts.find((part) => part.id === "range")?.value).toBe(70);
  });

  it("gives a careless show a Copper Thread or a Thank-you Ribbon with gentle tips", () => {
    const careless = decentShow().map(
      (piece) =>
        ({
          ...piece,
          recipeId: "tote-bag",
          quality: 66,
          leaves: 30,
          tags: ["edgy"],
          colours: ["black"],
          findIds: ["black-jeans"],
          finishes: [],
        }) as RackPiece,
    );
    const result = scoreShowcase(careless, { mood: "synth-pulse", light: "cool" }, CONTEXT);
    expect(result.overall).toBeLessThan(70);
    expect(["copper-thread", "thank-you-ribbon"]).toContain(result.rosette);
    expect(result.panels.some((panel) => panel.tip !== null)).toBe(true);
    expect(result.reputation).toBeGreaterThanOrEqual(0);
  });

  it("hands out rosettes by band, and never a 'lost'", () => {
    expect(rosetteFor(85)).toBe("gold-thread");
    expect(rosetteFor(84)).toBe("silver-thread");
    expect(rosetteFor(70)).toBe("silver-thread");
    expect(rosetteFor(69)).toBe("copper-thread");
    expect(rosetteFor(55)).toBe("copper-thread");
    expect(rosetteFor(54)).toBe("thank-you-ribbon");
    expect(rosetteFor(0)).toBe("thank-you-ribbon");
  });

  it("takes 10 off on the late day, except on Relaxed, and is gentle below 50", () => {
    const pieces = decentShow();
    const late = scoreShowcase(pieces, { mood: "dreamy-strings", light: "warm" }, { ...CONTEXT, late: true });
    const onTime = scoreShowcase(pieces, { mood: "dreamy-strings", light: "warm" }, CONTEXT);
    expect(late.overall).toBe(onTime.overall - 10);
    expect(
      scoreShowcase(
        pieces,
        { mood: "dreamy-strings", light: "warm" },
        { ...CONTEXT, late: true, difficulty: "relaxed" },
      ).overall,
    ).toBe(onTime.overall);
    const weak = [
      rackPieceFixture("piece-9", { quality: 10, leaves: 0, tags: [], colours: [], findIds: [] }),
    ];
    const quiet = scoreShowcase(
      weak,
      { mood: "synth-pulse", light: "cool" },
      { ...CONTEXT, difficulty: "challenging" },
    );
    expect(quiet.overall).toBeLessThan(50);
    expect(quiet.reputation).toBe(-1);
    expect(scoreShowcase(weak, { mood: "synth-pulse", light: "cool" }, CONTEXT).reputation).toBe(0);
  });

  it("is staged once on days 22 to 27 with every shelf piece, then the pieces return to the rack", () => {
    const early = withRack(boutiqueStart(), decentShow());
    const shelvedEarly = reduce(early, { type: "shelvePiece", pieceId: "piece-1" });
    expect(showcaseIssues(shelvedEarly, plan(shelvedEarly))).toContain(
      "The hall hosts the Showcase on days 22 to 27 of the season.",
    );
    const ready = showReady(decentShow());
    const staging = plan(ready);
    expect(staging.order).toEqual(["piece-1", "piece-2", "piece-3"]);
    const staged = reduce(ready, { type: "stageShowcase", ...staging });
    const showcase = staged.boutique?.season.showcase;
    expect(showcase?.result.rosette).toBeDefined();
    expect(staged.boutique?.season.capsule).toEqual([]);
    expect(staged.rack.every((piece) => piece.showcaseSeason === 1)).toBe(true);
    expect(staged.boutique?.rosettes).toHaveLength(1);
    expect(staged.coins).toBe(ready.coins + (showcase?.result.coins ?? 0));
    expect(reduce(staged, { type: "stageShowcase", ...staging })).toBe(staged);
    expect(reduce(ready, { type: "stageShowcase", ...staging, order: ["piece-1"] })).toBe(ready);
    expect(reduce(ready, { type: "stageShowcase", ...staging, cards: {} })).toBe(ready);
  });

  it("offers each piece the stories of its finds and a fresh start", () => {
    const [, second] = decentShow();
    expect(storyCardsFor(present(second)).map((card) => card.id)).toEqual([
      "find:linen-trousers",
      "find:satin-robe",
      "fresh",
    ]);
    expect(storyCardsFor(rackPieceFixture("piece-8", { findIds: [] })).map((card) => card.line)).toEqual([
      "A fresh start",
    ]);
  });

  it("shows the hall tip from the second show on, and always on Relaxed", () => {
    const ready = showReady(decentShow());
    expect(hallTip(ready)).toBeNull();
    expect(hallTip({ ...ready, profile: { ...ready.profile, difficulty: "relaxed" } })).toEqual({
      mood: "dreamy-strings",
      light: "warm",
    });
    const staged = reduce(ready, { type: "stageShowcase", ...plan(ready) });
    expect(hallTip(staged)).not.toBeNull();
  });

  it("stages itself on Relaxed at the end of day 27, with the suggested pieces", () => {
    const relaxed = endDays(withRack(boutiqueStart({ difficulty: "relaxed" }), decentShow()), 26);
    expect(relaxed.calendar.day).toBe(27);
    expect(relaxed.boutique?.season.showcase).toBeNull();
    const next = endDays(relaxed, 1);
    expect(next.boutique?.season.showcase?.pieces.map((piece) => piece.id)).toEqual([
      "piece-1",
      "piece-2",
      "piece-3",
    ]);
    const standard = endDays(endDays(withRack(boutiqueStart(), decentShow()), 26), 1);
    expect(standard.boutique?.season.showcase).toBeNull();
  });

  it("closes the season quietly when no show was staged", () => {
    const ready = showReady(decentShow());
    const closed = endDays(ready, 7);
    expect(closed.boutique?.season.number).toBe(2);
    expect(closed.boutique?.season.capsule).toEqual([]);
    expect(closed.rack.map((piece) => piece.id)).toEqual(["piece-1", "piece-2", "piece-3"]);
  });
});
