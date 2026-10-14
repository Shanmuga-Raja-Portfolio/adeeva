import { describe, expect, it } from "vitest";
import { serialize } from "./save";
import { patisserieModule } from "../module";
import type { GameState } from "./gameState";
import { canOpenSalon, salonOfferReady } from "./openSalon";
import { reduce } from "./reduce";
import { storyBeatById } from "./catalog";
import { storyChoiceIssue } from "./storyChoice";
import { currentBeat } from "./storyQueue";
import { salonTestGame } from "./salonPlaythrough";
import { GOOD_PLAN, lastGigId, newTestGame, playOrder, settleStories, withOrder } from "./testPlaythrough";

function veteran(reputation: number, ordersDelivered: number, day = 12): GameState {
  return { ...settleStories(newTestGame()), calendar: { day, hoursLeft: 10 }, reputation, ordersDelivered };
}

const PIP = {
  ...GOOD_PLAN,
  productId: "cupcake-tray" as const,
  mixIds: ["vanilla-sponge" as const],
  fillingId: null,
  colours: ["sky" as const],
};

describe("unlocking the Comet Room", () => {
  it("waits for reputation 30 and 12 delivered orders", () => {
    expect(salonOfferReady(veteran(29, 12))).toBe(false);
    expect(salonOfferReady(veteran(30, 11))).toBe(false);
    expect(salonOfferReady(veteran(30, 12))).toBe(true);
    expect(canOpenSalon(veteran(29, 12)).ok).toBe(false);
    expect(canOpenSalon(veteran(30, 11)).ok).toBe(false);
    expect(canOpenSalon(veteran(30, 12)).ok).toBe(true);
  });

  it("offers the parlour key after the twelfth delivery", () => {
    const almost = withOrder(veteran(29, 11), "pip");
    const delivered = playOrder(almost, lastGigId(almost), PIP);
    expect(delivered.ordersDelivered).toBe(12);
    expect(delivered.reputation).toBeGreaterThanOrEqual(30);
    expect(delivered.story.queue).toContain("pa-salon-offer");
  });

  it("offers the parlour key when the day ends at the threshold", () => {
    const ended = reduce(veteran(30, 12), { type: "endDay" });
    expect(ended.story.queue).toContain("pa-salon-offer");
    const seen = settleStories(ended);
    expect(currentBeat(seen)?.id).toBe("pa-salon-offer");
  });

  it("waits for the counter tray on the bench before offering the parlour key", () => {
    const busy = reduce(veteran(30, 12), { type: "startTray", productId: "cupcake-tray" });
    expect(busy.activeRun?.purpose.kind).toBe("tray");
    expect(salonOfferReady(busy)).toBe(false);
    expect(reduce(busy, { type: "endDay" }).story.queue).not.toContain("pa-salon-offer");
    const atOffer = { ...busy, story: { ...busy.story, queue: ["pa-salon-offer"] } };
    const open = storyBeatById("pa-salon-offer")?.choices.find((choice) => choice.effect === "open-salon");
    if (open === undefined) throw new Error("No open choice");
    expect(storyChoiceIssue(atOffer, open)).toBe("Finish the counter tray on the bench first.");
    expect(reduce(atOffer, { type: "chooseStoryOption", beatId: "pa-salon-offer", choiceId: open.id })).toBe(
      atOffer,
    );
    const cleared = reduce(busy, { type: "abandonRun" });
    expect(cleared.activeRun).toBeNull();
    expect(reduce(cleared, { type: "endDay" }).story.queue).toContain("pa-salon-offer");
  });

  it("asks for a choice instead of a plain Continue", () => {
    const offered = reduce(veteran(30, 12), { type: "endDay" });
    const atOffer = { ...offered, story: { ...offered.story, queue: ["pa-salon-offer"] } };
    expect(reduce(atOffer, { type: "markBeatSeen", beatId: "pa-salon-offer" })).toBe(atOffer);
    expect(reduce(atOffer, { type: "chooseStoryOption", beatId: "pa-salon-offer", choiceId: "nope" })).toBe(
      atOffer,
    );
    const later = reduce(atOffer, { type: "chooseStoryOption", beatId: "pa-salon-offer", choiceId: "later" });
    expect(later.career).toBe("bakery");
    expect(later.story.flags).toContain("salon-later");
    expect(salonOfferReady(later)).toBe(false);
    expect(canOpenSalon(later).ok).toBe(true);
    const opened = reduce(later, { type: "openSalon" });
    expect(opened.career).toBe("salon");
  });

  it("keeps coins, reputation, pantry, upgrades and the Bake Book when the parlour opens", () => {
    const base = { ...veteran(31, 14, 10), coins: 512, upgrades: ["bright-scale" as const] };
    const atOffer = { ...base, story: { ...base.story, queue: ["pa-salon-offer"] } };
    const opened = reduce(atOffer, { type: "chooseStoryOption", beatId: "pa-salon-offer", choiceId: "open" });
    expect(opened.career).toBe("salon");
    expect(opened.coins).toBe(512);
    expect(opened.reputation).toBe(31);
    expect(opened.upgrades).toEqual(["bright-scale"]);
    expect(opened.bakeBook).toBe(base.bakeBook);
    expect(opened.pantry.ingredients).toEqual(base.pantry.ingredients);
    expect(opened.pantry.teas["garden-mint"]).toBe(20);
    expect(opened.pantry.fillings["lemon-curd"]).toBe(1);
    expect(opened.fair?.seasonStartDay).toBe(15);
    expect(opened.salon?.parlour).toBe("undecided");
    expect(opened.story.queue).toContain("pa-salon-open");
    expect(opened.profile.startedAs).toBe("bakery");
  });

  it("refuses to open twice, too early or with a counter tray on the bench", () => {
    const open = reduce(veteran(30, 12), { type: "openSalon" });
    expect(reduce(open, { type: "openSalon" })).toBe(open);
    const early = veteran(10, 2);
    expect(reduce(early, { type: "openSalon" })).toBe(early);
    const tray = reduce(veteran(30, 12), { type: "startTray", productId: "cupcake-tray" });
    expect(tray.activeRun?.purpose.kind).toBe("tray");
    expect(reduce(tray, { type: "openSalon" })).toBe(tray);
  });
});

describe("starting as a Salon Pâtissier", () => {
  it("starts with 400 coins, reputation 30, a double pantry and the Parlour Box", () => {
    const salon = newTestGame({ career: "salon" });
    const bakery = newTestGame();
    expect(salon.career).toBe("salon");
    expect(salon.profile.startedAs).toBe("salon");
    expect(salon.coins).toBe(400);
    expect(salon.reputation).toBe(30);
    expect(salon.pantry.ingredients.flour).toBe(2 * bakery.pantry.ingredients.flour);
    expect(salon.pantry.teas["hot-cocoa"]).toBe(20);
    expect(salon.guide).toBe(false);
    expect(salon.fair?.seasonStartDay).toBe(1);
    expect(salon.story.queue[0]).toBe("pa-intro-salon");
    expect(salon.story.queue).toContain("pa-fair-invite");
    expect(salon.story.queue).not.toContain("pa-intro");
  });

  it("is refused for a career that does not exist", () => {
    const state = settleStories(newTestGame());
    const action = {
      type: "newGame" as const,
      seed: 3,
      name: "Ada",
      look: state.profile.look,
      trait: "dreamer" as const,
      difficulty: "standard" as const,
      career: "pirate" as never,
    };
    expect(reduce(state, action)).toBe(state);
  });

  it("is deterministic from the seed", () => {
    expect(salonTestGame()).toEqual(salonTestGame());
  });
});

describe("studio reputation", () => {
  it("counts only what was earned, from the career the save started in", () => {
    const salon = JSON.parse(serialize({ ...salonTestGame(), reputation: 41 })) as unknown;
    expect(patisserieModule.reputationOf(salon)).toBe(11);
    const bakery = JSON.parse(serialize({ ...settleStories(newTestGame()), reputation: 41 })) as unknown;
    expect(patisserieModule.reputationOf(bakery)).toBe(41);
    const opened = reduce(veteran(33, 12), { type: "openSalon" });
    expect(patisserieModule.reputationOf(JSON.parse(serialize(opened)) as unknown)).toBe(33);
    const v1 = { schemaVersion: 1, reputation: 12, profile: { name: "Ada" } };
    expect(patisserieModule.reputationOf(v1)).toBe(12);
    expect(
      patisserieModule.reputationOf({ schemaVersion: 2, reputation: 12, profile: { startedAs: "x" } }),
    ).toBe(0);
  });
});
