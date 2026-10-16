import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import { fairThemeById } from "./catalog";
import { panelVerdict } from "../../../engine/panelScore";
import { fairPanels, harmonyPanel } from "./fairPanels";
import { bramsPick } from "./fairPick";
import { bestLastOrder, hattieSuggests } from "./fairPlan";
import { boothAdvanceMark, fairPrize, rosetteFor } from "./fairPrize";
import type { FairPlan, FairState } from "./fairState";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { everyHookGold, hangRosette, railFinished } from "./rosetteRail";
import { parseSave, serialize } from "./save";
import { NOOK_PLAN, playSetToFloor, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import type { FloorSet } from "./showroomState";
import { settleStories } from "./testPlaythrough";

const THEME = fairThemeById("orchard-picnic");

function endDaysTo(state: GameState, day: number): GameState {
  let current = state;
  while (current.calendar.day < day) current = settleStories(reduce(current, { type: "endDay" }));
  return current;
}

function fairDay(difficulty: DifficultyId = "standard"): GameState {
  const start = reduce(showroomTestGame({ difficulty }), {
    type: "chooseFairTheme",
    themeId: "orchard-picnic",
  });
  const floored = playSetToFloor(start, { ...READING_PLAN, cushion: "mustard-dot" });
  return endDaysTo(reduce(floored, { type: "markFloorSet", setId: "set-1", mode: "show" }), 13);
}

function setOf(state: GameState): FloorSet {
  const set = state.showroom?.floor[0];
  if (set === undefined) throw new Error("No set");
  return set;
}

function staged(state: GameState, plan: Partial<FairPlan> = {}): GameState {
  const picked = reduce(state, { type: "pickFairSet", setId: "set-1" });
  return reduce(picked, {
    type: "stageFair",
    plan: { ...hattieSuggests(THEME, setOf(picked), "relaxed"), ...plan },
  });
}

describe("the four panels", () => {
  it("score craft, comfort, harmony and story from the set", () => {
    const set = setOf(fairDay());
    const plan = hattieSuggests(THEME, set, "relaxed");
    const [craft, comfort, harmony, story] = fairPanels(set, THEME, plan, false);
    expect(craft?.parts.map((part) => [part.id, part.weight])).toEqual([
      ["craft", 0.5],
      ["joints", 0.2],
      ["set-joint", 0.1],
      ["fine-wood", 0.2],
    ]);
    expect(craft?.parts.find((part) => part.id === "set-joint")?.value).toBe(60);
    expect(craft?.parts.find((part) => part.id === "fine-wood")?.value).toBe(60);
    expect(comfort?.parts.find((part) => part.id === "cosy")?.value).toBe(100);
    expect(harmony?.parts.map((part) => part.id)).toEqual(["faces", "evenness", "palette", "hardware"]);
    expect(story?.parts.find((part) => part.id === "setting")?.value).toBe(100);
    expect(story?.parts.find((part) => part.id === "theme")?.value).toBe(100);
    const awning = fairPanels(set, THEME, plan, true)[3];
    expect(awning?.score).toBe(Math.min(100, (story?.score ?? 0) + 5));
  });

  it("drops matched faces and doubles evenness when nothing can share a board", () => {
    const panel = harmonyPanel({ matchedFaces: null, evenness: 80, palette: 0.5, hardware: 70 });
    expect(panel.parts.map((part) => [part.id, part.weight])).toEqual([
      ["evenness", 0.6],
      ["palette", 0.2],
      ["hardware", 0.2],
    ]);
    expect(panel.score).toBe(Math.round(80 * 0.6 + 50 * 0.2 + 70 * 0.2));
  });

  it("matches the music to the theme, and the reveal to the best piece last", () => {
    const set = setOf(fairDay());
    const good = hattieSuggests(THEME, set, "relaxed");
    const off: FairPlan = {
      ...good,
      music: "wind-chimes",
      backdrop: "linen-drape",
      order: [...good.order].reverse(),
    };
    const goodStory = fairPanels(set, THEME, good, false)[3];
    const offStory = fairPanels(set, THEME, off, false)[3];
    expect(offStory?.parts.find((part) => part.id === "setting")?.value).toBe(30);
    expect(goodStory?.score).toBeGreaterThan(offStory?.score ?? 0);
  });

  it("uses kind verdict words", () => {
    expect([85, 84, 70, 69, 55, 54].map(panelVerdict)).toEqual([
      "Delighted",
      "Loved it",
      "Loved it",
      "Enjoyed it",
      "Enjoyed it",
      "Warmly cheered",
    ]);
  });
});

describe("rosettes, prizes and booths", () => {
  it("gives a rosette from fixed bands, never a placing", () => {
    expect([0, 54, 55, 69, 70, 84, 85, 94, 95, 100].map(rosetteFor)).toEqual([
      "makers-ribbon",
      "makers-ribbon",
      "merit",
      "merit",
      "silver",
      "silver",
      "gold",
      "gold",
      "oak-leaf",
      "oak-leaf",
    ]);
  });

  it("pays coins by booth and score, gently", () => {
    expect(fairPrize(80, 2, "standard")).toEqual({ coins: 25 + 20 + 90, reputation: 7, buzz: 8 });
    expect(fairPrize(40, 1, "standard")).toEqual({ coins: 35, reputation: 0, buzz: 4 });
    expect(fairPrize(40, 1, "challenging").reputation).toBe(-1);
    expect(boothAdvanceMark("standard")).toBe(60);
    expect(boothAdvanceMark("challenging")).toBe(65);
  });

  it("stages the Fair on Fair Day, using the rest of the day", () => {
    const day = fairDay();
    expect(bramsPick(day, THEME)?.setId).toBe("set-1");
    const result = staged(day);
    expect(result).not.toBe(day);
    expect(result.calendar.hoursLeft).toBe(0);
    const fair = result.fair as FairState;
    expect(fair.result?.overall).toBeGreaterThan(60);
    expect(fair.booth).toBe(2);
    expect(fair.rosetteRail["orchard-picnic"]).toBe(fair.result?.rosette);
    expect(fair.rosettesBySet["set-1"]).toBe(fair.result?.rosette);
    expect(result.story.queue).toContain("ww-first-fair");
    expect(result.showroom?.floor[0]?.mode).toBe("sale");
    expect(result.showroom?.floor[0]?.price).toBeGreaterThan(setOf(day).price);
    expect(staged(result)).toBe(result);
    expect(parseSave(serialize(result)).ok).toBe(true);
  });

  it("keeps a Relaxed maker in the booth until they choose to move up", () => {
    const relaxed = staged(fairDay("relaxed"));
    expect(relaxed.fair?.booth).toBe(1);
    expect(relaxed.fair?.boothOffer).toBe(true);
    const moved = reduce(relaxed, { type: "moveUpBooth" });
    expect(moved.fair?.booth).toBe(2);
    expect(reduce(moved, { type: "moveUpBooth" })).toBe(moved);
  });

  it("costs a late booth 10 points and 4 hours on day 14", () => {
    const onTime = staged(fairDay());
    const late = staged(settleStories(reduce(fairDay(), { type: "endDay" })));
    expect(late.fair?.result?.latePenalty).toBe(10);
    expect((onTime.fair?.result?.overall ?? 0) - (late.fair?.result?.overall ?? 0)).toBe(10);
    expect(late.calendar.hoursLeft).toBe(6);
  });

  it("skips the Fair kindly when no set was staged by the end of day 14", () => {
    const day = fairDay();
    const next = endDaysTo(day, 15);
    expect(next.showroom?.seasonNumber).toBe(2);
    expect(next.story.seen).toContain("ww-fair-skipped");
    expect(next.showroom?.floor).toHaveLength(1);
    expect(next.fair?.result).toBeNull();
  });

  it("refuses a set from another season or too big for the booth", () => {
    const start = reduce(showroomTestGame(), { type: "chooseFairTheme", themeId: "orchard-picnic" });
    const nook = playSetToFloor(start, NOOK_PLAN);
    expect(reduce(nook, { type: "pickFairSet", setId: "set-1" })).toBe(nook);
  });
});

describe("planner and rail", () => {
  it("opens on Hattie's suggestion: full on Relaxed, backdrop only otherwise", () => {
    const set = setOf(fairDay());
    expect(hattieSuggests(THEME, set, "relaxed")).toMatchObject({
      backdrop: "bunting",
      music: "fiddle-folk",
    });
    expect(hattieSuggests(THEME, set, "standard")).toMatchObject({
      backdrop: "bunting",
      music: "fiddle-folk",
    });
    expect(hattieSuggests(fairThemeById("snowy-lodge"), set, "standard").music).toBe("fiddle-folk");
    expect(bestLastOrder([80, 95, 70])).toEqual([0, 2, 1]);
  });

  it("finishes the rail with silver in every season and a gold", () => {
    const fair: FairState = {
      booth: 1,
      pickSetId: null,
      visitors: [],
      result: null,
      boothOffer: false,
      rosetteRail: {
        "orchard-picnic": "silver",
        "seaside-cabin": "silver",
        "harvest-barn": "silver",
        "snowy-lodge": "silver",
      },
      rosettesBySet: { "set-1": "silver" },
    };
    expect(railFinished(fair)).toBe(false);
    expect(railFinished({ ...fair, rosettesBySet: { "set-9": "gold" } })).toBe(true);
    expect(everyHookGold(fair)).toBe(false);
    expect(hangRosette({ "orchard-picnic": "gold" }, "orchard-picnic", "silver")).toEqual({
      "orchard-picnic": "gold",
    });
  });
});
