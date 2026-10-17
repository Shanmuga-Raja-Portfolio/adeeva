import { describe, expect, it } from "vitest";
import { jewelleryModule } from "../module";
import { weeklyBill } from "./calendar";
import type { GameState } from "./gameState";
import { CLIENTS } from "../content/client";
import {
  canOpenLoft,
  drawStoryCorner,
  LOFT_DELIVERIES,
  LOFT_REPUTATION,
  loftLater,
  loftOfferReady,
} from "./loftOffer";
import { collectionTestGame, endDayOnce } from "./linePlaythrough";
import { reduce } from "./reduce";
import { serialize } from "./save";
import { currentBeat } from "./storyQueue";
import { newTestGame, settleStories } from "./testPlaythrough";

function bench(reputation: number, delivered: number, day = 19): GameState {
  const state = settleStories(newTestGame({ seed: 21 }));
  return { ...state, reputation, ordersDelivered: delivered, calendar: { day, hoursLeft: 10 } };
}

describe("the Lantern Loft offer", () => {
  it("arrives at End Day only with reputation 45 and 14 deliveries", () => {
    expect(loftOfferReady(bench(LOFT_REPUTATION - 1, LOFT_DELIVERIES))).toBe(false);
    expect(loftOfferReady(bench(LOFT_REPUTATION, LOFT_DELIVERIES - 1))).toBe(false);
    expect(loftOfferReady(bench(LOFT_REPUTATION, LOFT_DELIVERIES))).toBe(true);
    const ended = reduce(bench(45, 14), { type: "endDay" });
    expect(ended.story.queue).toContain("jb-loft-offer");
    expect(reduce(bench(44, 14), { type: "endDay" }).story.queue).not.toContain("jb-loft-offer");
  });

  it("is not queued twice while it waits and cannot be dismissed without a choice", () => {
    const ended = reduce(bench(45, 14), { type: "endDay" });
    const again = reduce(ended, { type: "endDay" });
    expect(again.story.queue.filter((id) => id === "jb-loft-offer")).toHaveLength(1);
    const head = settleStories(again);
    expect(currentBeat(head)?.id).toBe("jb-loft-offer");
    expect(reduce(head, { type: "markBeatSeen", beatId: "jb-loft-offer" })).toBe(head);
  });

  it("keeps a hub card after Not yet, so the offer never expires", () => {
    const head = settleStories(reduce(bench(45, 14), { type: "endDay" }));
    const later = reduce(head, {
      type: "chooseStoryOption",
      beatId: "jb-loft-offer",
      choiceId: "later",
      lineNameId: null,
    });
    expect(later.career).toBe("bench");
    expect(loftLater(later)).toBe(true);
    const days = endDayOnce(endDayOnce(later));
    expect(days.story.queue).not.toContain("jb-loft-offer");
    const opened = reduce(days, { type: "openLoft", lineNameId: "sea-pebble" });
    expect(opened.career).toBe("collection");
    expect(opened.collection?.lineNameId).toBe("sea-pebble");
  });

  it("opens the loft from the story with a line name and keeps everything from the bench", () => {
    const head = settleStories(reduce(bench(45, 14), { type: "endDay" }));
    expect(
      reduce(head, {
        type: "chooseStoryOption",
        beatId: "jb-loft-offer",
        choiceId: "launch",
        lineNameId: null,
      }),
    ).toBe(head);
    const opened = reduce(head, {
      type: "chooseStoryOption",
      beatId: "jb-loft-offer",
      choiceId: "launch",
      lineNameId: "velvet-comet",
    });
    expect(opened.career).toBe("collection");
    expect(opened.coins).toBe(head.coins);
    expect(opened.reputation).toBe(head.reputation);
    expect(opened.keepsakes).toEqual(head.keepsakes);
    expect(opened.gigs).toEqual(head.gigs);
    expect(opened.stock.metal.silver.wide).toBe(head.stock.metal.silver.wide + 1);
    expect(opened.stock.extras["fine-chain"]).toBe(head.stock.extras["fine-chain"] + 2);
    expect(opened.collection?.seasonStartDay).toBe(22);
    expect(opened.story.queue).toContain("jb-loft-open");
    expect(opened.profile.startedAs).toBe("bench");
  });

  it("refuses openLoft below the thresholds, twice or with an unknown name", () => {
    const low = bench(44, 14);
    expect(reduce(low, { type: "openLoft", lineNameId: "sea-pebble" })).toBe(low);
    expect(canOpenLoft(low).reasons[0]).toContain("45");
    const ready = bench(45, 14);
    const named = reduce(ready, { type: "openLoft", lineNameId: "nope" as "sea-pebble" });
    expect(named).toBe(ready);
    const opened = reduce(ready, { type: "openLoft", lineNameId: "sea-pebble" });
    expect(reduce(opened, { type: "openLoft", lineNameId: "wild-clover" })).toBe(opened);
  });

  it("keeps the bench rent until the first season starts, then charges the loft rent", () => {
    const opened = reduce(bench(45, 14, 19), { type: "openLoft", lineNameId: "sea-pebble" });
    expect(weeklyBill(opened)).toBe(90);
    const settled = endDayOnce(endDayOnce(endDayOnce(opened)));
    expect(settled.calendar.day).toBe(22);
    expect(settled.coins).toBe(opened.coins - 90);
    expect(weeklyBill(settled)).toBe(130);
    expect(weeklyBill({ ...settled, profile: { ...settled.profile, difficulty: "challenging" } })).toBe(195);
  });
});

describe("starting as a Collection Designer", () => {
  it("starts with 380 coins, reputation 30, the starter drawer and season 1 on day 1", () => {
    const state = collectionTestGame();
    expect(state.career).toBe("collection");
    expect(state.profile.startedAs).toBe("collection");
    expect(state.coins).toBe(380);
    expect(state.reputation).toBe(30);
    expect(state.stock.metal.silver.wide).toBe(1);
    expect(state.stock.extras["fine-chain"]).toBe(2);
    expect(state.collection?.seasonStartDay).toBe(1);
    expect(state.collection?.lineNameId).toBe("moon-and-thimble");
    expect(state.story.seen).toContain("jb-intro-loft");
    expect(state.story.seen).not.toContain("jb-key");
    expect(state.gigs.offers.map((offer) => offer.clientId)).toEqual(["gran-mina"]);
    expect(state.guide).toBe(false);
  });

  it("offers a one-time bench tour that turns the coach on", () => {
    const state = collectionTestGame();
    const toured = reduce(state, { type: "setBenchTour", on: true });
    expect(toured.guide).toBe(true);
    expect(reduce(toured, { type: "setBenchTour", on: false })).toBe(toured);
    const bench = settleStories(newTestGame());
    expect(reduce(bench, { type: "setBenchTour", on: true })).toBe(bench);
  });

  it("earns studio reputation above each career's start, and reads v1 saves as bench starts", () => {
    const loft = { ...collectionTestGame(), reputation: 42 };
    expect(jewelleryModule.reputationOf(JSON.parse(serialize(loft)))).toBe(12);
    const benchStart = { ...settleStories(newTestGame()), reputation: 12 };
    expect(jewelleryModule.reputationOf(JSON.parse(serialize(benchStart)))).toBe(12);
    expect(
      jewelleryModule.reputationOf({ schemaVersion: 1, reputation: 20, profile: { trait: "dreamer" } }),
    ).toBe(20);
    expect(
      jewelleryModule.reputationOf({
        schemaVersion: 2,
        reputation: 50,
        profile: { trait: "dreamer", startedAs: "pirate" },
      }),
    ).toBe(0);
  });
});

describe("the Story Corner", () => {
  it("only ever draws grown-ups, from past clients or from everyone", () => {
    const children = CLIENTS.filter((client) => client.child === true).map((client) => client.id);
    expect(children).toEqual(["kiko", "asha-and-meera"]);
    const past = ["kiko", "asha-and-meera", "gran-mina", "dev", "aunt-lucia"].map((clientId) => ({
      clientId,
    })) as unknown as GameState["log"];
    for (let seed = 1; seed <= 60; seed += 1)
      for (const log of [[], past]) {
        const [corner] = drawStoryCorner({ log }, seed);
        expect(corner).toHaveLength(3);
        expect(corner.filter((id) => children.includes(id))).toEqual([]);
      }
  });
});
