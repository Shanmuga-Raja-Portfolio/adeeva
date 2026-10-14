import { describe, expect, it } from "vitest";
import { THEME_IDS } from "../content/marketTheme";
import { themeById } from "./catalog";
import type { GameState } from "./gameState";
import { canOpenMarket, rollNextTheme, salePrice, salesCount, shopperScore } from "./marketDay";
import type { PieceLook } from "./pieceLook";
import { reduce } from "./reduce";
import type { StallPiece } from "./stallBox";
import { GOOD_PLAN, newTestGame, playStall, settleStories } from "./testPlaythrough";

const LOOK: PieceLook = {
  productId: "shape-pendant",
  options: { shape: "leaf", accent: "plain" },
  metalId: "copper",
  stoneId: null,
  finish: "glaze",
  glaze: "sage",
  chain: "silk-cord",
  cordColour: "sage",
  charms: [],
};

function piece(
  id: string,
  quality: number,
  tags: StallPiece["tags"],
  colours: StallPiece["colours"],
): StallPiece {
  return { id, look: LOOK, quality, tags, colours, madeDay: 1 };
}

const spring = themeById("spring-fair");

describe("shopper score", () => {
  it("needs both a theme tag and a theme colour for theme share, and counts empty slots as zero", () => {
    const fits = piece("a", 90, ["nature"], ["sage"]);
    const tagOnly = piece("b", 90, ["nature"], ["navy"]);
    const colourOnly = piece("c", 90, ["classic"], ["sage"]);
    expect(shopperScore([fits, tagOnly, colourOnly], spring).themeShare).toBeCloseTo(1 / 3, 3);
    const lonely = shopperScore([null, fits, null], spring);
    expect(lonely.avgQuality).toBe(30);
    expect(lonely.cohesion).toBe(0);
    expect(lonely.centreBonus).toBe(1);
  });

  it("adds 0.45 × quality, 30 × theme share, 20 × cohesion and 5 for the strongest centre piece", () => {
    const slots = [
      piece("a", 80, ["nature"], ["sage", "copper"]),
      piece("b", 96, ["playful"], ["coral", "copper"]),
      piece("c", 88, ["nature"], ["sky", "copper"]),
    ];
    const score = shopperScore(slots, spring);
    expect(score.centreBonus).toBe(1);
    expect(score.score).toBe(
      Math.round(0.45 * ((80 + 96 + 88) / 3) + 30 * score.themeShare + 20 * score.cohesion + 5),
    );
    const weakCentre = shopperScore([slots[1] ?? null, slots[0] ?? null, slots[2] ?? null], spring);
    expect(weakCentre.centreBonus).toBe(0);
  });
});

describe("sales", () => {
  it("sells 3 at 75, 2 at 55, 1 at 35, and at least 1 on Relaxed", () => {
    expect(salesCount(75, "standard", 3)).toBe(3);
    expect(salesCount(74, "standard", 3)).toBe(2);
    expect(salesCount(55, "standard", 3)).toBe(2);
    expect(salesCount(54, "standard", 3)).toBe(1);
    expect(salesCount(35, "challenging", 3)).toBe(1);
    expect(salesCount(34, "standard", 3)).toBe(0);
    expect(salesCount(10, "relaxed", 3)).toBe(1);
    expect(salesCount(90, "standard", 2)).toBe(2);
  });

  it("prices a sold piece at base × (0.6 + 0.6 × score ÷ 100)", () => {
    expect(salePrice(piece("a", 90, [], []), 87)).toBe(Math.round(30 * (0.6 + 0.522)));
    expect(salePrice({ ...piece("b", 90, [], []), look: { ...LOOK, productId: "stack-ring" } }, 50)).toBe(
      Math.round(22 * 0.9),
    );
  });
});

describe("market themes", () => {
  it("never repeat two weeks running", () => {
    for (const current of THEME_IDS)
      for (let seed = 1; seed < 60; seed += 1) expect(rollNextTheme(current, seed)[0]).not.toBe(current);
  });
});

function stalls(trait: "charmer" | "dreamer" = "charmer"): GameState {
  let state = settleStories(newTestGame({ difficulty: "relaxed", trait }));
  const plan = {
    ...GOOD_PLAN,
    metalId: "copper" as const,
    stoneId: null,
    finish: "glaze" as const,
    chain: "silk-cord" as const,
  };
  state = playStall(state, "stack-ring", { ...plan, glaze: "sage", cordColour: null });
  state = playStall(state, "shape-pendant", {
    ...plan,
    glaze: "coral",
    cordColour: "sky",
    options: { shape: "leaf" },
  });
  for (let day = 1; day < 4; day += 1) state = settleStories(reduce(state, { type: "endDay" }));
  state = playStall(state, "drop-pair", {
    ...plan,
    glaze: "sky",
    cordColour: null,
    options: { shape: "leaf" },
  });
  for (let day = 4; day < 7; day += 1) state = settleStories(reduce(state, { type: "endDay" }));
  return { ...state, marketTheme: "spring-fair" };
}

describe("Market Day", () => {
  it("only opens on the seventh day with pieces and hours, once a day", () => {
    const early = settleStories(newTestGame());
    expect(canOpenMarket(early).ok).toBe(false);
    const ready = stalls();
    expect(ready.calendar.day).toBe(7);
    expect(ready.stallBox).toHaveLength(3);
    expect(canOpenMarket(ready).ok).toBe(true);
    const ids = ready.stallBox.map((entry) => entry.id);
    const shown = reduce(ready, {
      type: "showTray",
      slots: [ids[0] ?? null, ids[1] ?? null, ids[2] ?? null],
      cloth: "sage",
      sign: 1,
    });
    expect(shown).not.toBe(ready);
    expect(shown.calendar.hoursLeft).toBe(ready.calendar.hoursLeft - 3);
    expect(
      reduce(shown, { type: "showTray", slots: [null, ids[0] ?? null, null], cloth: "sage", sign: 1 }),
    ).toBe(shown);
  });

  it("sells, pays trait lines, keeps unsold pieces and puts every shown piece in the Keepsake Case", () => {
    const ready = stalls("charmer");
    const ids = ready.stallBox.map((entry) => entry.id);
    const shown = reduce(ready, {
      type: "showTray",
      slots: [ids[0] ?? null, ids[1] ?? null, ids[2] ?? null],
      cloth: "teal",
      sign: 0,
    });
    const summary = shown.market.last;
    if (summary === null) throw new Error("no summary");
    expect(summary.score).toBeGreaterThan(60);
    expect(summary.sold.length).toBeGreaterThanOrEqual(2);
    expect(summary.lines.some((line) => line.label === "Charmer tip")).toBe(true);
    expect(shown.coins).toBe(ready.coins + summary.coins);
    expect(shown.stallBox).toHaveLength(3 - summary.sold.length);
    expect(shown.keepsakes.filter((entry) => entry.source.kind === "market")).toHaveLength(3);
    expect(shown.buzz).toBe(Math.min(100, ready.buzz + Math.round(summary.score / 10)));
    expect(shown.reputation).toBe(ready.reputation + (summary.score >= 75 ? 1 : 0));
  });

  it("refuses duplicate or unknown pieces and an empty tray", () => {
    const ready = stalls();
    const id = ready.stallBox[0]?.id ?? null;
    expect(reduce(ready, { type: "showTray", slots: [id, id, null], cloth: "teal", sign: 0 })).toBe(ready);
    expect(
      reduce(ready, { type: "showTray", slots: ["piece-nope", null, null], cloth: "teal", sign: 0 }),
    ).toBe(ready);
    expect(reduce(ready, { type: "showTray", slots: [null, null, null], cloth: "teal", sign: 0 })).toBe(
      ready,
    );
    expect(reduce(ready, { type: "showTray", slots: [id, null, null], cloth: "teal", sign: 7 })).toBe(ready);
  });
});
