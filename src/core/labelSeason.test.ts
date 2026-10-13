import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { endDay } from "./calendar";
import { seasonTheme } from "./labelSeason";
import { canStageRunway } from "./runway";
import { canStartNextSeason } from "./seasonFlow";
import { seasonMinQuality } from "./seasonMinQuality";
import { craftToReview, dispatchAll, newTestGame } from "./testPlaythrough";

function finishLook(state: GameState, lookIndex: number): GameState {
  const started = reduce(state, { type: "startLook", lookIndex });
  return reduce(reduce(craftToReview(started), { type: "deliver" }), { type: "endDay" });
}

function endDays(state: GameState, count: number): GameState {
  return Array.from({ length: count }).reduce<GameState>((current) => endDay(current), state);
}

function finishedLooks(): GameState {
  const start = newTestGame({ career: "label", seed: 11 });
  return [0, 1, 2].reduce(finishLook, start);
}

function seasonWithLooks(): GameState {
  const looks = finishedLooks();
  const showEve = (looks.season?.deadlineDay ?? 0) - 1;
  return endDays(looks, showEve - looks.calendar.day);
}

describe("label season", () => {
  it("starts with a themed season and its story beats", () => {
    const start = newTestGame({ career: "label" });
    expect(start.coins).toBe(600);
    expect(start.reputation).toBe(20);
    expect(start.season).toMatchObject({
      number: 1,
      startDay: 1,
      deadlineDay: 14,
      runway: null,
      result: null,
    });
    expect(start.season?.looks).toEqual([null, null, null]);
    expect(start.story.queue).toEqual(["doors-open", "new-season"]);
  });

  it("raises the season's minimum quality by the difficulty bonus, the same bar each look is judged by", () => {
    const standard = newTestGame({ career: "label" });
    const challenging = newTestGame({ career: "label", difficulty: "challenging" });
    if (standard.season === null || challenging.season === null) throw new Error("expected a season");
    const themeMinimum = seasonTheme(challenging.season).minQuality;
    expect(seasonMinQuality(standard, standard.season)).toBe(seasonTheme(standard.season).minQuality);
    expect(seasonMinQuality(challenging, challenging.season)).toBe(themeMinimum + 6);
    const started = reduce(challenging, { type: "startLook", lookIndex: 0 });
    expect(started.activeRun?.brief.minQuality).toBe(themeMinimum + 6);
  });

  it("builds three looks against the theme brief", () => {
    const state = seasonWithLooks();
    const season = state.season;
    if (season === null) throw new Error("expected a season");
    expect(season.looks.every((look) => look !== null)).toBe(true);
    expect(
      season.looks[0]?.evaluation.criteria.find((criterion) => criterion.id === "deadline")?.passed,
    ).toBe(true);
    expect(reduce(state, { type: "startLook", lookIndex: 0 })).toBe(state);
    expect(state.log.every((entry) => entry.reward === null)).toBe(true);
  });

  it("scores the runway with three explained panels and pays out once", () => {
    const looks = seasonWithLooks();
    expect(canStageRunway(looks).ok).toBe(false);
    expect(
      reduce(looks, { type: "chooseRunway", order: [0, 0, 1], mood: "dreamy-strings", light: "cool" }),
    ).toBe(looks);
    const chosen = reduce(looks, {
      type: "chooseRunway",
      order: [2, 0, 1],
      mood: "dreamy-strings",
      light: "cool",
    });
    expect(chosen.season?.runway).toEqual({ order: [2, 0, 1], mood: "dreamy-strings", light: "cool" });
    expect(
      reduce(chosen, { type: "chooseRunway", order: [2, 0, 1], mood: "dreamy-strings", light: "cool" }),
    ).toBe(chosen);
    const staged = reduce(chosen, { type: "stageRunway" });
    const result = staged.season?.result;
    if (result === undefined || result === null) throw new Error("expected a runway result");
    expect(result.panels.map((panel) => panel.id)).toEqual(["critics", "buyers", "audience"]);
    expect(result.panels.every((panel) => panel.parts.every((part) => part.detail.length > 0))).toBe(true);
    expect(result.pressQuote.length).toBeGreaterThan(0);
    expect(staged.coins).toBe(chosen.coins + result.coins);
    expect(staged.buzz).toBe(Math.min(100, chosen.buzz + result.buzz));
    expect(staged.story.queue).toContain("after-the-lights");
    expect(reduce(staged, { type: "stageRunway" })).toBe(staged);
    expect(reduce(chosen, { type: "stageRunway" })).toEqual(staged);
  });

  it("opens the venue only from the day before the show", () => {
    const early = reduce(finishedLooks(), {
      type: "chooseRunway",
      order: [0, 1, 2],
      mood: "beach-pop",
      light: "warm",
    });
    const deadline = early.season?.deadlineDay ?? 0;
    expect(early.calendar.day).toBeLessThan(deadline - 1);
    expect(canStageRunway(early).reasons).toEqual([
      `The venue is booked for day ${deadline}. The doors open the day before.`,
    ]);
    expect(reduce(early, { type: "stageRunway" })).toBe(early);
    const eve = endDays(early, deadline - 1 - early.calendar.day);
    expect(canStageRunway(eve).ok).toBe(true);
  });

  it("moves on to a new theme and a bigger venue next season", () => {
    const looks = seasonWithLooks();
    expect(reduce(looks, { type: "startNextSeason", themeId: null })).toBe(looks);
    const staged = dispatchAll(looks, [
      { type: "chooseRunway", order: [0, 1, 2], mood: "beach-pop", light: "warm" },
      { type: "stageRunway" },
    ]);
    const deadline = staged.season?.deadlineDay ?? 0;
    expect(staged.calendar.day).toBeLessThanOrEqual(deadline);
    expect(canStartNextSeason(staged).reasons).toEqual(["The next season opens the day after the show."]);
    expect(reduce(staged, { type: "startNextSeason", themeId: null })).toBe(staged);
    const onDeadline = endDays(staged, deadline - staged.calendar.day);
    expect(onDeadline.calendar.day).toBe(deadline);
    expect(reduce(onDeadline, { type: "startNextSeason", themeId: null })).toBe(onDeadline);
    const opened = endDay(onDeadline);
    const previousTheme = opened.season?.themeId;
    expect(reduce(opened, { type: "startNextSeason", themeId: previousTheme ?? null })).toBe(opened);
    const next = reduce(opened, { type: "startNextSeason", themeId: null });
    expect(next.season?.number).toBe(2);
    expect(next.season?.themeId).not.toBe(previousTheme);
    expect(next.season?.venue).toMatch(/Main Hall$/);
    expect(next.season?.looks).toEqual([null, null, null]);
    expect(next.season?.deadlineDay).toBe(next.calendar.day + 13);
  });
});
