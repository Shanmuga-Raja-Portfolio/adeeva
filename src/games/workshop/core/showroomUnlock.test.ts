import { describe, expect, it } from "vitest";
import { workshopModule } from "../module";
import { botDay } from "./garageBot";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { serialize } from "./save";
import { showroomOfferReady, SHOWROOM_DELIVERIES, SHOWROOM_REPUTATION } from "./showroomOffer";
import { newTestGame, settleStories } from "./testPlaythrough";
import type { NewGameSettings } from "./newGame";

const OFFER = "ww-showroom-offer";

function garage(reputation: number, delivered: number): GameState {
  return { ...settleStories(newTestGame()), reputation, delivered };
}

function toOffer(state: GameState): GameState {
  let current = reduce(state, { type: "endDay" });
  while (current.story.queue[0] !== undefined && current.story.queue[0] !== OFFER)
    current = reduce(current, { type: "markBeatSeen", beatId: current.story.queue[0] });
  return current;
}

function offerDay(settings: Partial<NewGameSettings>, share: number): number {
  let state = settleStories(newTestGame(settings));
  for (let day = 0; day < 60; day += 1) {
    if (state.story.queue.includes(OFFER) || state.story.seen.includes(OFFER)) return state.calendar.day;
    state = botDay(state, share);
  }
  return 99;
}

describe("the showroom offer", () => {
  it("waits for reputation 45 and 14 deliveries", () => {
    expect(SHOWROOM_REPUTATION).toBe(45);
    expect(SHOWROOM_DELIVERIES).toBe(14);
    expect(showroomOfferReady(garage(44, 20))).toBe(false);
    expect(showroomOfferReady(garage(45, 20))).toBe(true);
    expect(showroomOfferReady(garage(60, 13))).toBe(false);
    expect(showroomOfferReady(garage(60, 14))).toBe(true);
  });

  it("queues once at End Day and never twice while it waits", () => {
    const queued = reduce(garage(45, 14), { type: "endDay" });
    expect(queued.story.queue.filter((id) => id === OFFER)).toHaveLength(1);
    const again = reduce(queued, { type: "endDay" });
    expect(again.story.queue.filter((id) => id === OFFER)).toHaveLength(1);
    expect(showroomOfferReady(queued)).toBe(false);
  });

  it("can't be skipped without a choice", () => {
    const offered = toOffer(garage(45, 14));
    expect(offered.story.queue[0]).toBe(OFFER);
    expect(reduce(offered, { type: "markBeatSeen", beatId: OFFER })).toBe(offered);
  });

  it("opens the showroom next week and keeps everything", () => {
    const offered = toOffer({ ...garage(45, 14), coins: 333, buzz: 12 });
    const opened = reduce(offered, { type: "chooseStoryOption", beatId: OFFER, choiceId: "open" });
    expect(opened.career).toBe("showroom");
    expect(opened.coins).toBe(333);
    expect(opened.reputation).toBe(45);
    expect(opened.showroom?.seasonStartDay).toBe(8);
    expect(opened.boards.length).toBe(offered.boards.length + 5);
    expect(opened.apprentice).toEqual({ hired: false, paidThroughDay: 0, jobsDone: 0, jobsToday: 0 });
    expect(opened.story.queue).toContain("ww-showroom-open");
  });

  it("keeps Bram's old shop card after Not yet, and opens from it", () => {
    const offered = toOffer(garage(45, 14));
    const later = reduce(offered, { type: "chooseStoryOption", beatId: OFFER, choiceId: "later" });
    expect(later.career).toBe("garage");
    expect(later.story.flags).toContain("showroom-later");
    const tomorrow = settleStories(reduce(later, { type: "endDay" }));
    expect(tomorrow.story.queue).not.toContain(OFFER);
    const opened = reduce(tomorrow, { type: "openShowroom" });
    expect(opened.career).toBe("showroom");
  });

  it("refuses to open twice or too early", () => {
    const early = garage(10, 2);
    expect(reduce(early, { type: "openShowroom" })).toBe(early);
    const showroom = settleStories(newTestGame({ career: "showroom" }));
    expect(reduce(showroom, { type: "openShowroom" })).toBe(showroom);
  });

  it("records where a player started and keeps studio reputation earned", () => {
    const showroom = settleStories(newTestGame({ career: "showroom" }));
    expect(showroom.profile.startedAs).toBe("showroom");
    expect(showroom.reputation).toBe(30);
    expect(showroom.coins).toBe(360);
    expect(showroom.story.seen).toContain("ww-intro-showroom");
    expect(showroom.story.seen).not.toContain("ww-key");
    const raw = JSON.parse(serialize({ ...showroom, reputation: 41 })) as unknown;
    expect(workshopModule.reputationOf(raw)).toBe(11);
    const garageRaw = JSON.parse(serialize({ ...garage(45, 14) })) as unknown;
    expect(workshopModule.reputationOf(garageRaw)).toBe(45);
  });

  it("starts a showroom maker with the board pile, season one and the coach off", () => {
    const showroom = settleStories(newTestGame({ career: "showroom" }));
    expect(showroom.showroom?.seasonStartDay).toBe(1);
    expect(showroom.boards).toHaveLength(7);
    expect(showroom.story.seen).toEqual(expect.arrayContaining(["ww-ren-hello", "ww-fair-invite"]));
    const toured = reduce(showroom, { type: "setBenchTour", on: true });
    expect(toured.story.flags).toContain("bench-tour-on");
    expect(reduce(toured, { type: "setBenchTour", on: false })).toBe(toured);
  });

  it("lands for a decent Standard maker between day 15 and 28, and is replayable", () => {
    const days = [11, 21, 37].map((seed) => offerDay({ seed }, 0.4));
    for (const day of days) {
      expect(day).toBeGreaterThanOrEqual(15);
      expect(day).toBeLessThanOrEqual(28);
    }
    expect(offerDay({ seed: 21 }, 0.4)).toBe(days[1]);
  }, 120_000);

  it("comes sooner on Relaxed and later on Challenging", () => {
    const standard = offerDay({ seed: 21 }, 0.4);
    expect(offerDay({ seed: 21, difficulty: "relaxed" }, 0.4)).toBeLessThanOrEqual(standard);
    expect(offerDay({ seed: 21, difficulty: "challenging" }, 0.4)).toBeGreaterThanOrEqual(standard);
  }, 120_000);
});
