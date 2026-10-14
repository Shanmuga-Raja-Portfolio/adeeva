import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { findById } from "./catalog";
import { clientIsEligible, eligibleClients, rollOffers } from "./offers";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";
import type { GameState } from "./gameState";
import { visibleNextTrends } from "../../../engine/trendMarket";
import { hotMarker } from "./trendPreview";

function client(id: string) {
  const found = CLIENTS.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`No client ${id}`);
  return found;
}

describe("clients and offers", () => {
  it("draws the very first offer from Nana Bea or the twins", () => {
    for (let seed = 1; seed < 40; seed += 1) {
      const state = newTestGame({ seed });
      expect(state.gigs.offers).toHaveLength(1);
      expect(["nana-bea", "juniper-wren"]).toContain(state.gigs.offers[0]?.clientId);
    }
  });

  it("opens Marisol only to Dreamers with reputation 15", () => {
    const marisol = client("marisol");
    const dreamer = { ...newTestGame({ trait: "dreamer" }), reputation: 15 };
    expect(clientIsEligible(marisol, dreamer)).toBe(true);
    expect(clientIsEligible(marisol, { ...dreamer, reputation: 14 })).toBe(false);
    expect(clientIsEligible(marisol, { ...newTestGame({ trait: "charmer" }), reputation: 30 })).toBe(false);
  });

  it("opens Mr. Halvorsen only to Perfectionists with reputation 18, for pencil skirts", () => {
    const halvorsen = client("mr-halvorsen");
    const perfectionist = { ...newTestGame({ trait: "perfectionist" }), reputation: 18 };
    expect(clientIsEligible(halvorsen, perfectionist)).toBe(true);
    expect(clientIsEligible(halvorsen, { ...perfectionist, reputation: 17 })).toBe(false);
    expect(clientIsEligible(halvorsen, { ...newTestGame({ trait: "dreamer" }), reputation: 30 })).toBe(false);
    expect(halvorsen.brief.partIds).toEqual(["pencil-skirt"]);
  });

  it("queues the trait story when a trait-gated client writes in", () => {
    let found: GameState | null = null;
    for (let seed = 1; seed < 200 && found === null; seed += 1) {
      const base = settleStories({ ...newTestGame({ seed, trait: "perfectionist" }), reputation: 18 });
      const opened = { ...base, calendar: { ...base.calendar, day: 2 }, gigs: { ...base.gigs, offers: [] } };
      const rolled = rollOffers({ ...opened, buzz: 99 });
      if (rolled.gigs.offers.some((offer) => offer.clientId === "mr-halvorsen")) found = rolled;
    }
    expect(found?.story.queue).toContain("tf-trait-perfectionist");
  });

  it("keeps busy clients off the board", () => {
    const state = newTestGame();
    const offered = state.gigs.offers[0]?.clientId;
    const later = { ...state, calendar: { ...state.calendar, day: 2 } };
    expect(eligibleClients(later).map((entry) => entry.id)).not.toContain(offered);
  });

  it("accepts and declines offers, refusing unknown ones with the same state", () => {
    const state = newTestGame();
    const offerId = state.gigs.offers[0]?.id ?? "";
    const accepted = reduce(state, { type: "acceptOffer", offerId });
    expect(accepted.gigs.active).toHaveLength(1);
    expect(reduce(accepted, { type: "acceptOffer", offerId })).toBe(accepted);
    expect(reduce(state, { type: "declineOffer", offerId: "nope" })).toBe(state);
    expect(reduce(state, { type: "declineOffer", offerId }).gigs.offers).toHaveLength(0);
  });

  it("shows next week's crowd only to Trendsetters, as Hot markers on finds", () => {
    const trendy = newTestGame({ trait: "trendsetter" });
    expect(visibleNextTrends(trendy)).toEqual(trendy.trends.next);
    expect(visibleNextTrends(newTestGame({ trait: "charmer" }))).toBeNull();
    for (const slot of trendy.rail)
      expect(hotMarker(trendy, slot.findId)).toBe(
        findById(slot.findId).tags.some((tag) => trendy.trends.next.includes(tag)),
      );
    const charmer = newTestGame({ trait: "charmer" });
    expect(charmer.rail.some((slot) => hotMarker(charmer, slot.findId))).toBe(false);
  });
});
