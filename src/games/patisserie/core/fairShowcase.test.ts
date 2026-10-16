import { describe, expect, it } from "vitest";
import { FAIR_TENTS } from "../content/fairTent";
import { FAIR_THEMES, type FairThemeId } from "../content/fairTheme";
import type { RibbonId } from "../content/ribbon";
import { fairThemeById } from "./catalog";
import { fairBrief } from "./fairBrief";
import { overallScore } from "../../../engine/panelScore";
import { panelVerdict } from "../../../engine/panelScore";
import { fairPanels, type ShowPlate } from "./fairPanels";
import { fairPrize, ribbonFor } from "./fairPrize";
import { canStageFair } from "./fairStage";
import type { FairEntry, FairPlan, FairState } from "./fairState";
import { flairScore } from "./flair";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { reduce } from "./reduce";
import { everyHookGold, wallFinished } from "./ribbonWall";
import {
  endDays,
  playShowpiece,
  readySeason,
  salonTestGame,
  showpiecePlan,
  stageSuggestedFair,
} from "./salonPlaythrough";
import { showpieceIssue } from "./showpiece";
import { ottisPicks } from "./sidePlates";
import { lastGigId, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function themed(overrides: Parameters<typeof salonTestGame>[0] = {}): GameState {
  return readySeason(salonTestGame(overrides));
}

function withEntry(overrides: Parameters<typeof salonTestGame>[0] = {}): GameState {
  return settleStories(playShowpiece(endDays(themed(overrides), 3)));
}

const PLAIN_PLAN: FairPlan = { sidePlates: [], order: [0], cloth: "linen", music: "string-trio" };

function entry(overrides: Partial<FairEntry> = {}): FairEntry {
  return {
    runId: "run-1",
    design: {
      productId: "layer-cake",
      mixIds: ["vanilla-sponge"],
      fillingId: "vanilla-cream",
      colours: ["blush", "lavender"],
      pattern: "a",
      split: 6,
    },
    toppings: [],
    tags: ["classic", "romantic", "dreamy"],
    colours: ["blush", "lavender"],
    spend: 57,
    budget: 95,
    quality: 87,
    touches: [{ flourish: "blind-scale", accuracy: 0.85 }],
    flair: 66,
    word: null,
    ...overrides,
  };
}

function plate(overrides: Partial<ShowPlate> = {}): ShowPlate {
  return { quality: 85, tags: ["romantic"], colours: ["blush"], toppings: [], ...overrides };
}

describe("the Fair brief and the showpiece", () => {
  it("builds each tent's brief from the theme", () => {
    const theme = fairThemeById("blossom-lane");
    for (const tent of FAIR_TENTS) {
      const brief = fairBrief(theme, tent, "standard", 13);
      expect(brief.products).toEqual(tent.products);
      expect(brief.requiredTags).toEqual(theme.tags);
      expect(brief.favouredColours).toEqual(theme.palette);
      expect(brief.requiredToppings).toEqual([
        { topping: "sugar-daisy", count: 1 + Math.ceil(tent.tent / 2) },
      ]);
      expect(brief.budget).toBe(80 + 15 * tent.tent);
      expect(brief.minQuality).toBe(tent.readyMark);
      expect(brief.deadlineDay).toBe(13);
      expect(fairBrief(theme, tent, "challenging", 13).minQuality).toBe(tent.readyMark + 6);
    }
  });

  it("opens the showpiece window from season day 3 to day 12", () => {
    const ready = themed();
    expect(showpieceIssue(ready)).toContain("day 3");
    expect(reduce(ready, { type: "startShowpiece" })).toBe(ready);
    const third = endDays(ready, 3);
    expect(showpieceIssue(third)).toBeNull();
    const started = reduce(third, { type: "startShowpiece" });
    expect(started.activeRun?.purpose).toEqual({ kind: "showpiece" });
    expect(started.activeRun?.brief?.deadlineDay).toBe(13);
    expect(started.story.queue).toContain("pa-first-showpiece");
    const late = endDays(ready, 13);
    expect(reduce(late, { type: "startShowpiece" })).toBe(late);
    const noTheme = endDays(salonTestGame(), 3);
    expect(showpieceIssue(noTheme)).toBe("Pick this season's Fair theme first.");
  });

  it("is refused while an order is on the bench", () => {
    const third = endDays(themed(), 3);
    const ordered = withOrder(third, "grandpa-tomasz");
    const baking = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
    expect(baking.activeRun?.purpose.kind).toBe("order");
    expect(reduce(baking, { type: "startShowpiece" })).toBe(baking);
  });

  it("goes to the Fair with its evaluation, flair and a Bake Book page", () => {
    const state = withEntry();
    const fairEntry = state.fair?.entry;
    expect(fairEntry?.quality).toBeGreaterThan(80);
    expect(fairEntry?.flair).toBe(50);
    expect(withEntry({ trait: "charmer" }).fair?.entry?.flair).toBe(40);
    expect(state.bakeBook[state.bakeBook.length - 1]?.clientId).toBe("larkspur-fair");
    expect(state.coins).toBeLessThan(themed().coins);
    expect(reduce(state, { type: "startShowpiece" })).toBe(state);
  });

  it("skips the Fair kindly when the showpiece never arrives", () => {
    const third = endDays(themed(), 3);
    const started = reduce(third, { type: "startShowpiece" });
    const nextSeason = reduce(endDays(started, 14), { type: "endDay" });
    expect(nextSeason.fair?.seasonNumber).toBe(2);
    expect(nextSeason.activeRun).toBeNull();
    expect(nextSeason.story.queue).toContain("pa-fair-skipped");
    expect(nextSeason.fair?.tent).toBe(1);
    expect(nextSeason.reputation).toBe(started.reputation);
  });
});

describe("extra touches", () => {
  it("allows up to two, each only where it fits", () => {
    const design = playRunTo(
      reduce(endDays(themed(), 3), { type: "startShowpiece" }),
      showpiecePlan(themed()),
      "design",
    );
    const layer = reduce(design, { type: "chooseProduct", productId: "layer-cake" });
    expect(reduce(layer, { type: "toggleFlourish", flourish: "bake-together" })).toBe(layer);
    const one = reduce(layer, { type: "toggleFlourish", flourish: "blind-scale" });
    const two = reduce(one, { type: "toggleFlourish", flourish: "plaque-lettering" });
    expect(two.activeRun?.flourishes).toEqual(["blind-scale", "plaque-lettering"]);
    expect(reduce(two, { type: "toggleFlourish", flourish: "ribbon-stir" })).toBe(two);
    expect(reduce(two, { type: "chooseWord", word: "JOY" }).activeRun?.word).toBe("JOY");
    expect(reduce(one, { type: "chooseWord", word: "JOY" })).toBe(one);
    const off = reduce(two, { type: "toggleFlourish", flourish: "blind-scale" });
    expect(off.activeRun?.flourishes).toEqual(["plaque-lettering"]);
  });

  it("scores flair from touch accuracy, with assisted and Dreamer touches", () => {
    expect(flairScore([], false)).toBe(40);
    expect(flairScore([{ flourish: "blind-scale", accuracy: 0.85 }], false)).toBe(66);
    const two = [
      { flourish: "blind-scale" as const, accuracy: 0.9 },
      { flourish: "plaque-lettering" as const, accuracy: 0.9 },
    ];
    expect(flairScore(two, false)).toBe(94);
    expect(flairScore(two, true)).toBe(100);
    const assisted = [
      { flourish: "blind-scale" as const, accuracy: 0.8 },
      { flourish: "ribbon-stir" as const, accuracy: 0.8 },
    ];
    expect(flairScore(assisted, false)).toBe(88);
    expect(flairScore([], true)).toBe(50);
  });

  it("pipes a word on a plaque for one more hour and counts its letters", () => {
    const plan = {
      ...showpiecePlan(themed()),
      flourishes: ["plaque-lettering" as const],
      word: "HOME" as const,
    };
    const started = reduce(endDays(themed(), 3), { type: "startShowpiece" });
    const atPipe = playRunTo(started, plan, "pipe");
    const run = atPipe.activeRun;
    if (run === null) throw new Error("no run");
    expect(leaveHours(run, [])).toBe(3);
    expect(leaveHours(run, ["showpiece-trolley"])).toBe(2);
    const done = settleStories(playShowpiece(endDays(themed(), 3), plan));
    const touch = done.fair?.entry?.touches[0];
    expect(touch?.flourish).toBe("plaque-lettering");
    expect(touch?.accuracy).toBeGreaterThan(0.8);
    expect(done.fair?.entry?.flair).toBeGreaterThan(60);
  });

  it("bakes two tiers together with one dial, the small tier at three quarters of the time", () => {
    const base = themed();
    const fair = base.fair;
    if (fair === null) throw new Error("no fair");
    const tent3 = { ...base, fair: { ...fair, tent: 3 as const } };
    const plan = { ...showpiecePlan(tent3), flourishes: ["bake-together" as const] };
    const started = reduce(endDays(tent3, 3), { type: "startShowpiece" });
    const atBake = playRunTo(started, plan, "bake");
    const run = atBake.activeRun;
    if (run === null) throw new Error("no run");
    expect(leaveHours(run, [])).toBe(2);
    expect(
      reduce(atBake, {
        type: "bakeBatch",
        batch: 0,
        heat: 3,
        turnedMinutes: 10,
        takenMinutes: 24,
        assisted: false,
      }),
    ).toBe(atBake);
    const bad = {
      type: "bakeTogether" as const,
      heat: 3,
      turnedMinutes: 9,
      takenMinutes: [24],
      assisted: false,
    };
    expect(reduce(atBake, bad)).toBe(atBake);
    expect(reduce(atBake, { ...bad, takenMinutes: [24, 40] })).toBe(atBake);
    const both = reduce(atBake, { ...bad, takenMinutes: [24, 18] });
    expect(both.activeRun?.batches[0]?.bake?.takenMinutes).toBe(24);
    expect(both.activeRun?.batches[1]?.bake?.takenMinutes).toBe(18);
    const done = settleStories(playShowpiece(endDays(tent3, 3), plan));
    expect(done.fair?.entry?.touches[0]?.accuracy).toBeGreaterThan(0.9);
  });
});

describe("the Fair Showcase panels", () => {
  const theme = fairThemeById("blossom-lane");

  it("scores a decent table near Silver", () => {
    const sides = [plate(), plate({ colours: ["lavender"] })];
    const plan: FairPlan = { sidePlates: ["a", "b"], order: [1, 2, 0], cloth: "linen", music: "string-trio" };
    const panels = fairPanels(entry(), sides, theme, plan);
    const [bench, garden, visitors] = panels;
    expect(bench?.parts.map((part) => part.value)).toEqual([87, 85, 66, 90]);
    expect(bench?.score).toBe(Math.round(0.55 * 87 + 0.15 * 85 + 0.2 * 66 + 0.1 * 90));
    expect(garden?.parts.find((part) => part.id === "harmony")?.value).toBe(100);
    expect(visitors?.parts.find((part) => part.id === "setting")?.value).toBe(100);
    expect(ribbonFor(overallScore(panels, 0))).toBe("silver");
  });

  it("counts empty side plates as nothing", () => {
    const panels = fairPanels(entry(), [], theme, PLAIN_PLAN);
    const [bench, garden, visitors] = panels;
    expect(bench?.parts.find((part) => part.id === "companions")?.value).toBe(0);
    expect(garden?.parts.find((part) => part.id === "harmony")?.value).toBe(0);
    expect(garden?.parts.find((part) => part.id === "palette")?.value).toBe(33);
    expect(visitors?.parts.find((part) => part.id === "unveil")?.value).toBe(33);
    expect(overallScore(panels, 0)).toBeLessThan(55);
    expect(overallScore(panels, 10)).toBe(Math.max(0, overallScore(panels, 0) - 10));
  });

  it("rewards the best plate last and the theme's cloth and music", () => {
    const sides = [plate({ quality: 60 }), plate({ quality: 70 })];
    const last = fairPanels(entry(), sides, theme, {
      ...PLAIN_PLAN,
      sidePlates: ["a", "b"],
      order: [2, 1, 0],
    });
    const first = fairPanels(entry(), sides, theme, {
      ...PLAIN_PLAN,
      sidePlates: ["a", "b"],
      order: [0, 1, 2],
    });
    const unveil = (panels: typeof last) => panels[2]?.parts.find((part) => part.id === "unveil")?.value ?? 0;
    expect(unveil(last)).toBeGreaterThan(unveil(first));
    const off = fairPanels(entry(), [], theme, { ...PLAIN_PLAN, cloth: "gingham", music: "brass-band" });
    expect(off[2]?.parts.find((part) => part.id === "setting")?.value).toBe(30);
    const notes = fairPanels(entry(), [plate()], theme, PLAIN_PLAN).map((panel) => panel.note);
    expect(notes[0]).toBe("Such a well-made showpiece.");
    for (const note of notes) expect(note).toMatch(/^[A-Z].*\.$/);
  });

  it("speaks kindly at every score", () => {
    expect([90, 85, 84, 70, 69, 55, 54, 0].map(panelVerdict)).toEqual([
      "Delighted",
      "Delighted",
      "Loved it",
      "Loved it",
      "Enjoyed it",
      "Enjoyed it",
      "Warmly cheered",
      "Warmly cheered",
    ]);
  });

  it("hands out ribbons from fixed bands, never placings", () => {
    const bands: [number, RibbonId][] = [
      [0, "bakers"],
      [54, "bakers"],
      [55, "merit"],
      [69, "merit"],
      [70, "silver"],
      [84, "silver"],
      [85, "gold"],
      [94, "gold"],
      [95, "rosette"],
      [100, "rosette"],
    ];
    for (const [overall, ribbon] of bands) expect(ribbonFor(overall), String(overall)).toBe(ribbon);
  });

  it("pays coins, reputation and buzz from the overall score", () => {
    expect(fairPrize(77, 2, "standard")).toEqual({ coins: 30 + 20 + 81, reputation: 6, buzz: 8 });
    expect(fairPrize(48, 1, "standard")).toEqual({ coins: 40, reputation: 0, buzz: 5 });
    expect(fairPrize(48, 1, "challenging").reputation).toBe(-1);
    expect(fairPrize(48, 1, "relaxed").reputation).toBe(0);
  });
});

describe("staging the Fair", () => {
  function atFair(overrides: Parameters<typeof salonTestGame>[0] = {}): GameState {
    return endDays(withEntry(overrides), 13);
  }

  it("only happens on Fair Day with a showpiece, once", () => {
    expect(canStageFair(endDays(themed(), 13)).ok).toBe(false);
    const early = withEntry();
    expect(reduce(early, { type: "stageFair", plan: PLAIN_PLAN })).toBe(early);
    const fair = atFair();
    expect(reduce(fair, { type: "stageFair", plan: { ...PLAIN_PLAN, order: [1] } })).toBe(fair);
    expect(
      reduce(fair, { type: "stageFair", plan: { ...PLAIN_PLAN, sidePlates: ["ghost"], order: [0, 1] } }),
    ).toBe(fair);
    const staged = reduce(fair, { type: "stageFair", plan: PLAIN_PLAN });
    expect(staged.fair?.result).not.toBeNull();
    expect(reduce(staged, { type: "stageFair", plan: PLAIN_PLAN })).toBe(staged);
    expect(staged.story.queue).toContain("pa-first-fair");
    expect(staged.fair?.shownRunIds).toContain(fair.fair?.entry?.runId);
  });

  it("applies the prize, hangs the ribbon and lets the Bake Book find it", () => {
    const fair = atFair();
    const staged = stageSuggestedFair(fair);
    const result = staged.fair?.result;
    if (result === null || result === undefined) throw new Error("no result");
    expect(staged.coins).toBe(fair.coins + result.coins);
    expect(staged.reputation).toBe(Math.max(0, fair.reputation + result.reputation));
    expect(staged.fair?.ribbonWall["blossom-lane"]).toBe(result.ribbon);
    expect(staged.fair?.ribbonsByRun[fair.fair?.entry?.runId ?? ""]).toBe(result.ribbon);
    expect(result.tip).toMatch(/^Next time, try /);
  });

  it("moves up a tent at 60 on Standard, 65 on Challenging and only by choice on Relaxed", () => {
    const standard = stageSuggestedFair(atFair());
    const overall = standard.fair?.result?.overall ?? 0;
    expect(standard.fair?.tent).toBe(overall >= 60 ? 2 : 1);
    const challenging = stageSuggestedFair(atFair({ difficulty: "challenging" }));
    const hardOverall = challenging.fair?.result?.overall ?? 0;
    expect(challenging.fair?.tent).toBe(hardOverall >= 65 ? 2 : 1);
    const relaxedFair = atFair({ difficulty: "relaxed" });
    const relaxed = stageSuggestedFair(relaxedFair);
    expect(relaxed.fair?.tent).toBe(1);
    expect(relaxed.fair?.tentOffer).toBe((relaxed.fair?.result?.overall ?? 0) >= 60);
    if (relaxed.fair?.tentOffer === true) {
      const moved = reduce(relaxed, { type: "moveUpTent" });
      expect(moved.fair?.tent).toBe(2);
      expect(reduce(moved, { type: "moveUpTent" })).toBe(moved);
    }
    expect(reduce(standard, { type: "moveUpTent" })).toBe(standard);
  });

  it("takes 10 points off a Fair staged late on Counter Day, except on Relaxed", () => {
    const late = endDays(withEntry(), 14);
    expect(canStageFair(late).ok).toBe(true);
    const staged = reduce(late, { type: "stageFair", plan: PLAIN_PLAN });
    expect(staged.fair?.result?.latePenalty).toBe(10);
    const relaxed = reduce(endDays(withEntry({ difficulty: "relaxed" }), 14), {
      type: "stageFair",
      plan: PLAIN_PLAN,
    });
    expect(relaxed.fair?.result?.latePenalty).toBe(0);
  });

  it("picks the two Bake Book plates that carry the most of the theme", () => {
    const state = withEntry();
    const theme = fairThemeById("blossom-lane");
    const page = (runId: string, colours: FairEntry["colours"], toppingId: "sugar-daisy" | "team-ball") => ({
      runId,
      day: 2,
      clientId: "pip",
      productId: "cupcake-tray" as const,
      mixIds: ["vanilla-sponge" as const],
      fillingId: null,
      colours,
      pattern: "a" as const,
      toppings: [{ id: "t", toppingId, x: 1, y: 1, rotation: 0, scale: 1, layer: 1 }],
      stars: 4,
      happy: true,
      quality: 80,
    });
    const book = [
      page("run-a", ["navy"], "team-ball"),
      page("run-b", ["blush"], "sugar-daisy"),
      page("run-c", ["navy"], "sugar-daisy"),
      page("run-d", ["blush", "lavender"], "sugar-daisy"),
    ];
    expect(ottisPicks({ ...state, bakeBook: [...state.bakeBook, ...book] }, theme)).toEqual([
      "run-d",
      "run-b",
    ]);
  });
});

describe("the Ribbon Wall", () => {
  function wall(ribbons: Partial<Record<FairThemeId, RibbonId>>, extra: RibbonId[] = []): FairState {
    const byRun = Object.fromEntries(
      [...Object.values(ribbons), ...extra].map((ribbon, index) => [`run-${index}`, ribbon]),
    );
    return {
      seasonStartDay: 1,
      seasonNumber: 5,
      tent: 3,
      themeId: null,
      visitors: [],
      entry: null,
      result: null,
      tentOffer: false,
      shownRunIds: [],
      ribbonWall: ribbons,
      ribbonsByRun: byRun,
    };
  }

  it("finishes with Silver in every season and one Gold", () => {
    const silver: Partial<Record<FairThemeId, RibbonId>> = {
      "blossom-lane": "silver",
      "seaside-postcard": "silver",
      "harvest-moon": "silver",
      "snow-globe": "silver",
    };
    expect(wallFinished(wall(silver))).toBe(false);
    expect(wallFinished(wall({ ...silver, "kite-day": "gold" }))).toBe(true);
    expect(wallFinished(wall({ ...silver, "snow-globe": "merit", "comet-night": "rosette" }))).toBe(true);
    expect(wallFinished(wall({ ...silver, "snow-globe": "merit" }, ["gold"]))).toBe(false);
  });

  it("collects every hook at Gold or better", () => {
    const gold = Object.fromEntries(FAIR_THEMES.map((theme) => [theme.id, "gold"])) as Record<
      FairThemeId,
      RibbonId
    >;
    expect(everyHookGold(wall(gold))).toBe(true);
    expect(everyHookGold(wall({ ...gold, "kite-day": "silver" }))).toBe(false);
  });
});
