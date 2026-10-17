import { describe, expect, it } from "vitest";
import { weeklyBill } from "./calendar";
import type { GameState } from "./gameState";
import {
  bestPlan,
  buyLineGems,
  collectionTestGame,
  confirmBoard,
  endDayOnce,
  endDaysUntil,
  LINE_PLAN,
  pickFirstTheme,
  playLinePiece,
  playWholeLine,
  shootLookbook,
  stagedLaunch,
  toLanternNight,
} from "./linePlaythrough";
import { reduce } from "./reduce";
import { isLanternNight, isPopupDay, lanternNightOf, seasonDayOf } from "./seasonCalendar";
import { LANTERNS_WAITING } from "./launchEndDay";
import { canEndDay } from "./calendar";
import { setAsideIssue } from "./runLifecycle";
import { newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function openedOn(day: number): GameState {
  const state = settleStories(newTestGame({ seed: 4 }));
  const ready = { ...state, reputation: 45, ordersDelivered: 14, calendar: { day, hoursLeft: 10 } };
  return reduce(ready, { type: "openLoft", lineNameId: "glimmer-lane" });
}

function boarded(state: GameState = collectionTestGame()): GameState {
  return buyLineGems(confirmBoard(pickFirstTheme(state)));
}

describe("the loft season calendar", () => {
  it("anchors season 1 on the next week start, whether the loft opens in an odd or an even week", () => {
    const odd = openedOn(10);
    const even = openedOn(16);
    expect(odd.collection?.seasonStartDay).toBe(15);
    expect(even.collection?.seasonStartDay).toBe(22);
    const collection = even.collection;
    if (collection === null) throw new Error("no loft");
    expect(seasonDayOf(collection, 21)).toBeNull();
    expect(seasonDayOf(collection, 22)).toBe(1);
    expect(lanternNightOf(collection)).toBe(34);
  });

  it("charges 130 a week, or 90 when the line rests, and rests only on season day 1", () => {
    const state = collectionTestGame();
    expect(weeklyBill(state)).toBe(130);
    const rested = reduce(state, { type: "restLine" });
    expect(rested.collection?.rested).toBe(true);
    expect(weeklyBill(rested)).toBe(90);
    expect(reduce(rested, { type: "pickLaunchTheme", themeId: "first-blossom" })).toBe(rested);
    const later = endDayOnce(state);
    expect(reduce(later, { type: "restLine" })).toBe(later);
    const themed = pickFirstTheme(state);
    expect(reduce(themed, { type: "restLine" })).toBe(themed);
  });

  it("lets Market Day run on day 7 but turns day 14 into Pop-up Day", () => {
    const themed = pickFirstTheme(collectionTestGame());
    expect(isPopupDay(themed, 14)).toBe(true);
    expect(isLanternNight(themed, 13)).toBe(true);
    const rested = reduce(collectionTestGame(), { type: "restLine" });
    expect(isPopupDay(rested, 14)).toBe(false);
  });

  it("covers some rent once a season on Standard when coins dip below zero", () => {
    const state = { ...collectionTestGame(), coins: 20 };
    const week = endDaysUntil(state, 8);
    expect(week.coins).toBe(20 - 130 + 60);
    expect(week.story.seen).toContain("jb-tight-season");
    const second = endDaysUntil({ ...week, coins: 10 }, 15);
    expect(second.coins).toBe(10 - 130);
    const nextSeason = endDaysUntil({ ...second, coins: 5 }, 22);
    expect(nextSeason.coins).toBe(5 - 130 + 60);
    const challenging = endDaysUntil({ ...collectionTestGame({ difficulty: "challenging" }), coins: 20 }, 8);
    expect(challenging.coins).toBe(20 - 195);
  });

  it("moves an order due on Lantern Night to the next day", () => {
    let state = { ...pickFirstTheme(collectionTestGame()), reputation: 30, buzz: 100 };
    let checked = 0;
    for (let day = 0; day < 12; day += 1) {
      state = endDayOnce({ ...state, gigs: { ...state.gigs, offers: [] } });
      checked += state.gigs.offers.length;
      for (const offer of state.gigs.offers) expect(offer.brief.deadlineDay).not.toBe(13);
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("Lantern Night", () => {
  it("keeps the bench open on Lantern Night and refuses End Day on day 14 while the Launch can be staged", () => {
    const night = toLanternNight(shootLookbook(playWholeLine(boarded())));
    expect(isLanternNight(night, night.calendar.day)).toBe(true);
    const late = endDayOnce(night);
    expect(late.calendar.day).toBe(14);
    expect(canEndDay(late).reasons).toEqual([LANTERNS_WAITING]);
    expect(reduce(late, { type: "endDay" })).toBe(late);
    expect(reduce(late, { type: "workShift" })).toBe(late);
    const launched = stagedLaunch(late);
    expect(launched.launch?.result?.latePenalty).toBe(10);
    expect(launched.calendar.hoursLeft).toBe(late.calendar.hoursLeft - 4);
    expect(endDayOnce(launched).collection?.seasonNumber).toBe(2);
  });

  it("stages a partial Launch with 2 pieces and moves the unfinished run to next season's line", () => {
    const first = playLinePiece(boarded(), 0);
    const second = playLinePiece(endDayOnce(first), 1);
    const onBench = reduce(endDayOnce(second), { type: "startCollectionPiece", slot: 2 });
    const night = toLanternNight(onBench);
    expect(night.activeRun?.purpose).toEqual({ kind: "collection", slot: 2 });
    const launched = stagedLaunch(night);
    expect(launched.launch?.result?.plan.order).toHaveLength(2);
    const nextSeason = endDayOnce(endDayOnce(launched));
    expect(nextSeason.collection?.seasonNumber).toBe(2);
    expect(nextSeason.activeRun?.purpose).toEqual({ kind: "collection", slot: 2 });
    const productId = nextSeason.activeRun?.design.productId;
    const themed = pickFirstTheme(nextSeason);
    const collection = themed.collection;
    if (collection === null || productId === undefined) throw new Error("no line");
    const without = { ...bestBoard(themed), products: ["coat-badge", "bag-charm", "bangle"] } as const;
    expect(reduce(themed, { type: "confirmCollection", brief: without })).toBe(themed);
    const kept = confirmBoard(themed);
    expect(kept.collection?.brief?.products).toContain(productId);
    expect(kept.activeRun?.purpose).toEqual({
      kind: "collection",
      slot: kept.collection?.brief?.products.indexOf(productId),
    });
  });

  it("launches with a single piece only on Relaxed", () => {
    const relaxed = playLinePiece(boarded(collectionTestGame({ difficulty: "relaxed" })), 0);
    const relaxedNight = toLanternNight(relaxed);
    expect(stagedLaunch(relaxedNight).launch?.result?.plan.order).toHaveLength(1);
    const standard = toLanternNight(playLinePiece(boarded(), 0));
    expect(reduce(standard, { type: "stageLaunch", ...bestPlan(standard) })).toBe(standard);
  });

  it("skips the Launch without losing the line when too few pieces are ready", () => {
    const one = playLinePiece(boarded(), 0);
    const end = endDaysUntil(toLanternNight(one), 15);
    const collection = end.collection;
    if (collection === null) throw new Error("no loft");
    expect(collection.seasonNumber).toBe(2);
    expect(collection.carried).toBe(true);
    expect(collection.themeId).toBe(one.collection?.themeId);
    expect(collection.pieces).toHaveLength(1);
    expect(collection.brief).toEqual(one.collection?.brief);
    expect(end.story.seen).toContain("jb-launch-skipped");
  });

  it("never touches the order log or the delivered count with line pieces", () => {
    const ordered = withOrder(boarded(), "gran-mina");
    const piece = playLinePiece(ordered, 0);
    expect(piece.log).toEqual(ordered.log);
    expect(piece.ordersDelivered).toBe(ordered.ordersDelivered);
  });

  it("refuses to set aside a line piece after its first cut", () => {
    const started = reduce(boarded(), { type: "startCollectionPiece", slot: 0 });
    expect(reduce(started, { type: "abandonRun" }).activeRun).toBeNull();
    const cut = playRunTo(started, LINE_PLAN, "join");
    expect(reduce(cut, { type: "abandonRun" })).toBe(cut);
    expect(setAsideIssue(cut)).toBe("Finish this piece first.");
  });
});

function bestBoard(state: GameState) {
  const brief = confirmBoard(state).collection?.brief;
  if (brief === undefined || brief === null) throw new Error("no board");
  return brief;
}
