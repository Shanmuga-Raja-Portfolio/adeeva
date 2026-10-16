import { describe, expect, it } from "vitest";
import { interiorModule } from "../module";
import type { GameState, LogEntry } from "./gameState";
import { canOpenLarkspur, larkspurOfferReady, OFFER_BEAT_ID } from "./larkspurOffer";
import { endDays, newShowHomeGame } from "./larkspurPlaythrough";
import { reduce } from "./reduce";
import { serialize } from "./save";
import { currentBeat } from "./storyQueue";
import { lastGigId, newTestGame, playOrder, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function showHomeLog(state: GameState): LogEntry {
  const shown = withOrder(
    { ...state, coins: 600, reputation: 24, trends: { ...state.trends, current: ["classic", "cosy"] } },
    "bellwind",
  );
  const played = settleStories(playOrder(shown, lastGigId(shown), recipeFor("bellwind")));
  const entry = played.log.at(-1);
  if (entry === undefined || entry.openHouse === null) throw new Error("No Open House");
  return entry;
}

const BASE = settleStories(newTestGame({ trait: "trendsetter" }));
const OPEN_HOUSE_ENTRY = showHomeLog(BASE);

function loftAt(reputation: number, delivered: number, showHomes: number): GameState {
  return {
    ...BASE,
    reputation,
    ordersDelivered: delivered,
    log: showHomes > 0 ? [OPEN_HOUSE_ENTRY] : [{ ...OPEN_HOUSE_ENTRY, openHouse: null }],
  };
}

describe("the Larkspur Close offer", () => {
  it("needs reputation 34, 14 makeovers and one Bellwind show home", () => {
    expect(larkspurOfferReady(loftAt(34, 14, 1))).toBe(true);
    expect(larkspurOfferReady(loftAt(33, 14, 1))).toBe(false);
    expect(larkspurOfferReady(loftAt(34, 13, 1))).toBe(false);
    expect(larkspurOfferReady(loftAt(34, 14, 0))).toBe(false);
    expect(canOpenLarkspur(loftAt(33, 13, 0)).reasons).toHaveLength(3);
  });

  it("queues the offer at End Day once the thresholds pass, and never twice", () => {
    const ended = reduce(loftAt(34, 14, 1), { type: "endDay" });
    expect(currentBeat(ended)?.id).toBe(OFFER_BEAT_ID);
    expect(reduce(loftAt(33, 14, 1), { type: "endDay" }).story.queue).not.toContain(OFFER_BEAT_ID);
    const later = reduce(ended, { type: "chooseStoryOption", beatId: OFFER_BEAT_ID, choiceId: "not-yet" });
    expect(endDays(later, 2).story.queue).not.toContain(OFFER_BEAT_ID);
  });

  it("queues the offer straight after a reveal that crosses the line", () => {
    const ordered = withOrder({ ...loftAt(34, 13, 1), coins: 200 }, "nana-pearl");
    const revealed = playOrder(ordered, lastGigId(ordered), recipeFor("nana-pearl"));
    expect(revealed.ordersDelivered).toBe(14);
    expect(revealed.story.queue).toContain(OFFER_BEAT_ID);
  });

  it("keeps a Larkspur card after Not yet, and needs a choice rather than a plain Continue", () => {
    const offered = reduce(loftAt(34, 14, 1), { type: "endDay" });
    expect(reduce(offered, { type: "markBeatSeen", beatId: OFFER_BEAT_ID })).toBe(offered);
    const later = reduce(offered, { type: "chooseStoryOption", beatId: OFFER_BEAT_ID, choiceId: "not-yet" });
    expect(later.story.flags).toContain("larkspur-later");
    expect(later.career).toBe("loft");
    expect(canOpenLarkspur(later).ok).toBe(true);
    const opened = reduce(later, { type: "openLarkspur" });
    expect(opened.career).toBe("development");
  });

  it("takes the keys in the same save and keeps coins, reputation, stock and the log", () => {
    const offered = reduce(loftAt(34, 14, 1), { type: "endDay" });
    const keys = reduce(offered, { type: "chooseStoryOption", beatId: OFFER_BEAT_ID, choiceId: "take-keys" });
    expect(keys.career).toBe("development");
    expect(keys.profile.startedAs).toBe("loft");
    expect(keys.coins).toBe(offered.coins);
    expect(keys.reputation).toBe(offered.reputation);
    expect(keys.log).toBe(offered.log);
    expect(keys.stock).toBe(offered.stock);
    expect(keys.larkspur?.plot).toBe(1);
    expect(keys.larkspur?.storyOffer).toHaveLength(2);
    expect(keys.story.queue).toContain("is-larkspur-keys");
    expect(reduce(keys, { type: "openLarkspur" })).toBe(keys);
    const early = loftAt(33, 14, 1);
    expect(reduce(early, { type: "openLarkspur" })).toBe(early);
  });

  it("stops Bellwind single-room letters once the keys are taken", () => {
    const opened = reduce({ ...loftAt(34, 14, 1), buzz: 100 }, { type: "openLarkspur" });
    const later = endDays(opened, 6);
    expect(later.gigs.offers.some((offer) => offer.clientId === "bellwind")).toBe(false);
  });
});

describe("start here as a Show-Home Designer", () => {
  it("opens with 380 coins, reputation 34, two tools, a housewarming shelf and its own intro", () => {
    const fresh = newTestGame({ career: "development" });
    expect(fresh.coins).toBe(380);
    expect(fresh.reputation).toBe(34);
    expect(fresh.career).toBe("development");
    expect(fresh.profile.startedAs).toBe("development");
    expect(fresh.upgrades).toEqual(["long-reach-brush", "spacer-kit"]);
    expect(fresh.stock.paints["chalk-white"]).toBe(1);
    expect(fresh.stock.paints["sea-glass"]).toBe(1);
    expect(fresh.stock.paints["morning-sky"]).toBe(1);
    expect(fresh.stock.lights["paper-pendant"]).toBe(1);
    expect(currentBeat(fresh)?.id).toBe("is-larkspur-intro");
    expect(fresh.story.queue).not.toContain("is-keys");
    expect(fresh.larkspur?.storyOffer).toHaveLength(2);
  });

  it("counts only earned studio reputation from the career the save started as", () => {
    const showHome = { ...newShowHomeGame(), reputation: 50 };
    expect(interiorModule.reputationOf(JSON.parse(serialize(showHome)))).toBe(16);
    const loft = { ...settleStories(newTestGame()), reputation: 50 };
    expect(interiorModule.reputationOf(JSON.parse(serialize(loft)))).toBe(50);
    expect(
      interiorModule.reputationOf({ schemaVersion: 1, reputation: 12, profile: { trait: "dreamer" } }),
    ).toBe(12);
    expect(
      interiorModule.reputationOf({
        schemaVersion: 2,
        reputation: 40,
        profile: { trait: "dreamer", startedAs: "development" },
      }),
    ).toBe(6);
  });

  it("keeps earned reputation unchanged when a loft designer takes the keys", () => {
    const opened = reduce(loftAt(40, 14, 1), { type: "openLarkspur" });
    expect(interiorModule.reputationOf(JSON.parse(serialize(opened)))).toBe(40);
  });
});
