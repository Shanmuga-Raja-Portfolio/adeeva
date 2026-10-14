import { describe, expect, it } from "vitest";
import { CHAPTERS } from "../content/chapter";
import { CUE_CARDS } from "../content/cueCard";
import { LETTERS } from "../content/letter";
import { dishById } from "./catalog";
import type { GameState } from "./gameState";
import { tvOf, type TvState } from "./path";
import { reduce } from "./reduce";
import { cueSequence, kinderTips, segmentScore } from "./segment";
import { onClockShare, studioSeconds } from "./studioClock";
import {
  cookDish,
  crossroadsReady,
  dispatchAll,
  must,
  playWholeService,
  settleStories,
  type CookPlan,
} from "./testPlaythrough";

function tv(state: GameState): TvState {
  const found = tvOf(state);
  if (found === null) throw new Error("not on TV");
  return found;
}

function studio(): GameState {
  return settleStories(must(crossroadsReady(), { type: "choosePath", path: "tv", nameCard: null }));
}

function kindPrep(state: GameState, dishId: string): GameState {
  const prepped = must(state, { type: "prepSegment", dishId });
  const prep = tv(prepped).prep;
  if (prep === null) throw new Error("no prep");
  return dispatchAll(prepped, [
    ...prep.cues.map((cue) => ({ type: "placeCue" as const, cue })),
    ...prep.cues.map((cue, index) => ({
      type: "pickTip" as const,
      index,
      tip: CUE_CARDS.find((card) => card.id === cue)?.tips.findIndex((tip) => tip.kind) ?? 0,
    })),
  ]);
}

function segment(state: GameState, dishId: string, plan?: CookPlan): GameState {
  return settleStories(cookDish(must(kindPrep(state, dishId), { type: "startSegment" }), plan));
}

function nextDay(state: GameState): GameState {
  return settleStories(must(state, { type: "endDay" }));
}

describe("Spoon & Story", () => {
  it("builds three cue cards in cooking order, and every tip set has exactly one kind tip", () => {
    expect(cueSequence(dishById("kelewele"))).toEqual(["ready", "chop", "taste"]);
    expect(cueSequence(dishById("tamagoyaki"))).toEqual(["ready", "sizzle", "taste"]);
    expect(cueSequence(dishById("croque-monsieur"))).toEqual(["ready", "chop", "plate"]);
    for (const card of CUE_CARDS) expect(card.tips.filter((tip) => tip.kind)).toHaveLength(1);
    const words = JSON.stringify(CUE_CARDS).toLowerCase();
    for (const word of ["degree", "minute", "knife grip", "hot oil"]) expect(words).not.toContain(word);
  });

  it("shuffles the cards, takes them in any order, and remembers the tips", () => {
    const prepped = must(studio(), { type: "prepSegment", dishId: "kelewele" });
    const prep = tv(prepped).prep;
    expect(prep?.deck).not.toEqual(prep?.cues);
    expect(prepped.calendar.hoursLeft).toBe(8);
    const wrong = dispatchAll(prepped, [
      { type: "placeCue", cue: "taste" },
      { type: "placeCue", cue: "ready" },
    ]);
    expect(reduce(wrong, { type: "placeCue", cue: "taste" })).toBe(wrong);
    expect(reduce(wrong, { type: "startSegment" })).toBe(wrong);
    expect(tv(must(wrong, { type: "clearCues" })).prep?.order).toEqual([]);
    expect(reduce(prepped, { type: "pickTip", index: 3, tip: 0 })).toBe(prepped);
    expect(reduce(prepped, { type: "prepSegment", dishId: "elote" })).toBe(prepped);
    expect(tv(must(prepped, { type: "dropSegment" })).prep).toBeNull();
  });

  it("offers the kind tip for every card that missed it", () => {
    expect(
      kinderTips([
        { cue: "ready", tip: 0 },
        { cue: "chop", tip: 0 },
        { cue: "taste", tip: 2 },
      ]),
    ).toEqual([
      { cue: "chop", label: "Chop on the beat", text: "Ask an adult to do the chopping with you." },
      { cue: "taste", label: "Taste and season", text: "If it's too warm, a squeeze of lime helps." },
    ]);
  });

  it("scores a segment from quality, clarity and the studio clock", () => {
    expect(segmentScore(90, 1, 1)).toBe(90);
    expect(segmentScore(90, 0.5, 1)).toBe(79);
    expect(segmentScore(80, 0, 0.5)).toBe(54);
    expect(segmentScore(87, 1, 1)).toBeLessThan(90);
    expect(onClockShare(470, "standard")).toBe(1);
    expect(onClockShare(540, "standard")).toBe(0.75);
    expect(onClockShare(2000, "standard")).toBe(0.5);
    expect(onClockShare(2000, "relaxed")).toBe(1);
  });

  it("pays 120 plus 30 a star, sends a letter from a young cook, and counts as tested", () => {
    const state = studio();
    const done = segment(state, "kelewele");
    const report = tv(done).lastSegment;
    if (report === null) throw new Error("no report");
    expect(report.clarity).toBe(1);
    expect(report.stars).toBeGreaterThanOrEqual(4);
    expect(tv(done).letters).toEqual([LETTERS[0]?.id]);
    expect(done.story.seen).toContain("tv-first-letter");
    expect(tv(done).tested).toContain("kelewele");
    expect(tv(done).week.amounts.shows).toBe(done.coins - state.coins);
    expect(done.coins - state.coins).toBeGreaterThanOrEqual(120 + 30 * 4);
    const run = done.activeRun;
    if (run === null) throw new Error("no run");
    expect(report.clockSeconds).toBe(studioSeconds(run, dishById("kelewele")));
  });

  it("allows two segments a week", () => {
    const twice = segment(nextDay(segment(studio(), "kelewele")), "elote");
    const next = nextDay(twice);
    expect(reduce(next, { type: "prepSegment", dishId: "jollof-rice" })).toBe(next);
  });

  it("every letter that mentions cooking also mentions an adult", () => {
    const adults = /aunt|grandad|mum|dad|gran|sister|uncle|nana/i;
    for (const letter of LETTERS) expect(letter.text).toMatch(adults);
  });

  it("offers a four-chapter cookbook after two strong segments, filled with tested dishes", () => {
    const state = studio();
    expect(reduce(state, { type: "startBook" })).toBe(state);
    const two = segment(nextDay(segment(state, "kelewele")), "elote");
    const signed = must(two, { type: "startBook" });
    expect(signed.coins).toBe(two.coins + 250);
    expect(tv(signed).book?.chapters).toHaveLength(CHAPTERS.length);
    expect(
      reduce(signed, { type: "addRecipeCard", chapterId: "festival-food", dishId: "jollof-rice", tip: 0 }),
    ).toBe(signed);
    expect(
      reduce(signed, { type: "addRecipeCard", chapterId: "fresh-and-bright", dishId: "kelewele", tip: 0 }),
    ).toBe(signed);
    const carded = must(signed, {
      type: "addRecipeCard",
      chapterId: "festival-food",
      dishId: "kelewele",
      tip: 1,
    });
    expect(
      reduce(carded, { type: "addRecipeCard", chapterId: "festival-food", dishId: "kelewele", tip: 1 }),
    ).toBe(carded);
  });

  it("pays 150 and earns a kind review for a full chapter, then launches the book", () => {
    const tested = [
      "dal-tadka",
      "chana-masala",
      "minestrone",
      "kelewele",
      "elote",
      "jollof-rice",
      "miso-soup",
      "onigiri",
      "omelette-aux-fines-herbes",
      "spaghetti-al-pomodoro",
      "guacamole-con-totopos",
      "ratatouille",
    ] as const;
    const base = segment(nextDay(segment(studio(), "kelewele")), "elote");
    const ready = { ...base, path: { ...tv(base), tested: [...tested] } };
    const signed = must(ready, { type: "startBook" });
    const plan: readonly [string, string][] = [
      ["weeknight-warmers", "dal-tadka"],
      ["weeknight-warmers", "chana-masala"],
      ["weeknight-warmers", "minestrone"],
      ["festival-food", "kelewele"],
      ["festival-food", "elote"],
      ["festival-food", "jollof-rice"],
      ["fresh-and-bright", "miso-soup"],
      ["fresh-and-bright", "onigiri"],
      ["fresh-and-bright", "omelette-aux-fines-herbes"],
      ["around-the-hall", "spaghetti-al-pomodoro"],
      ["around-the-hall", "guacamole-con-totopos"],
      ["around-the-hall", "ratatouille"],
    ];
    const first = must(signed, {
      type: "addRecipeCard",
      chapterId: "weeknight-warmers",
      dishId: "dal-tadka",
      tip: 0,
    });
    expect(first.coins).toBe(signed.coins);
    const written = plan.reduce(
      (state, [chapterId, dishId]) => reduce(state, { type: "addRecipeCard", chapterId, dishId, tip: 2 }),
      signed,
    );
    expect(written.coins).toBe(signed.coins + 4 * 150);
    const chapter = tv(written).book?.chapters[0];
    expect(chapter?.review).toBe(CHAPTERS[0]?.review);
    expect(chapter?.spoons).toBeGreaterThanOrEqual(4);
    const day = settleStories(must(written, { type: "endDay" }));
    const launch = must(day, { type: "launchBook" });
    expect(launch.service?.kind).toBe("launch");
    expect(launch.service?.tickets).toHaveLength(6);
    const done = playWholeService(launch);
    expect(tv(done).book?.launched).toBe(true);
    expect(tv(done).awards).toContain("golden-page");
    expect(tv(done).finished).toBe(true);
    expect(done.story.seen).toContain("tv-chapter-end");
  });
});
