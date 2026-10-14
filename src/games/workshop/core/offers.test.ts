import { describe, expect, it } from "vitest";
import type { TraitId } from "../../../engine/trait";
import { CLIENTS } from "../content/client";
import type { GameState } from "./gameState";
import { clientIsEligible, eligibleClients, rollOffers } from "./offers";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

function client(id: string) {
  const found = CLIENTS.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(id);
  return found;
}

function later(trait: TraitId, reputation: number): GameState {
  const state = newTestGame({ trait });
  return { ...state, reputation, calendar: { ...state.calendar, day: 5 } };
}

describe("commission offers", () => {
  it("pins Grandpa Teodor's birdhouse on day 1 and nobody else", () => {
    const state = settleStories(newTestGame());
    expect(state.gigs.offers.map((offer) => offer.clientId)).toEqual(["grandpa-teodor"]);
    expect(eligibleClients(state).map((entry) => entry.id)).toEqual([]);
  });

  it("opens Luna only to dreamers with reputation 6", () => {
    expect(clientIsEligible(client("luna"), later("dreamer", 6))).toBe(true);
    expect(clientIsEligible(client("luna"), later("dreamer", 5))).toBe(false);
    expect(clientIsEligible(client("luna"), later("perfectionist", 30))).toBe(false);
  });

  it("opens Mr. Lindqvist only to perfectionists with reputation 8", () => {
    expect(clientIsEligible(client("mr-lindqvist"), later("perfectionist", 8))).toBe(true);
    expect(clientIsEligible(client("mr-lindqvist"), later("perfectionist", 7))).toBe(false);
    expect(clientIsEligible(client("mr-lindqvist"), later("charmer", 30))).toBe(false);
  });

  it("opens the other neighbours by reputation for every trait", () => {
    expect(clientIsEligible(client("ms-ingrid"), later("charmer", 4))).toBe(true);
    expect(clientIsEligible(client("ms-ingrid"), later("charmer", 3))).toBe(false);
    expect(clientIsEligible(client("mr-desmond"), later("trendsetter", 12))).toBe(true);
  });

  it("brings the trait story when a trait-gated client arrives", () => {
    let state: GameState = {
      ...later("perfectionist", 8),
      gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    };
    for (let roll = 0; roll < 40 && !state.story.queue.includes("ww-perfectionist"); roll += 1)
      state = rollOffers({ ...state, gigs: { ...state.gigs, offers: [] }, rng: state.rng + roll });
    expect(state.story.queue).toContain("ww-perfectionist");
  });

  it("accepts and declines offers, and refuses unknown ones", () => {
    const state = settleStories(newTestGame());
    const offerId = state.gigs.offers[0]?.id ?? "";
    const accepted = reduce(state, { type: "acceptOffer", offerId });
    expect(accepted.gigs.active).toHaveLength(1);
    expect(reduce(state, { type: "declineOffer", offerId }).gigs.offers).toHaveLength(0);
    expect(reduce(state, { type: "acceptOffer", offerId: "gig-99" })).toBe(state);
  });
});
