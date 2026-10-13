import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { TRAIT_IDS } from "../../../engine/trait";
import { endDay } from "./calendar";
import type { GameState } from "./gameState";
import { MAX_ACTIVE_GIGS, offerCountForBuzz } from "../../../engine/gigBoard";
import { eligibleClients, rollOffers } from "./offers";
import { reduce } from "./reduce";
import { newTestGame } from "./testPlaythrough";

const gatedClients = CLIENTS.filter((client) => client.traitGate !== undefined);

describe("trait-gated clients", () => {
  it("are eligible only for their own trait", () => {
    for (const trait of TRAIT_IDS) {
      const state: GameState = { ...newTestGame({ trait }), reputation: 20 };
      const gatedIds = eligibleClients(state)
        .filter((client) => client.traitGate !== undefined)
        .map((client) => client.id);
      const expected = gatedClients.filter((client) => client.traitGate === trait).map((client) => client.id);
      expect(gatedIds).toEqual(expected);
    }
  });

  it("never send offers to another trait across many days", () => {
    let state: GameState = { ...newTestGame({ trait: "charmer", seed: 99 }), reputation: 20, buzz: 100 };
    const seen = new Set<string>();
    for (let day = 0; day < 40; day += 1) {
      state = endDay({ ...state, gigs: { ...state.gigs, offers: [] } });
      for (const offer of state.gigs.offers) seen.add(offer.clientId);
    }
    expect(seen.has("mr-abara")).toBe(true);
    expect(["iris", "aunt-odile", "jaz"].some((id) => seen.has(id))).toBe(false);
    expect(state.story.seen.concat(state.story.queue)).toContain("curtain-call");
  });

  it("respect reputation and career", () => {
    const fresh = newTestGame();
    const student: GameState = { ...fresh, gigs: { ...fresh.gigs, offers: [] } };
    expect(eligibleClients(student).map((client) => client.id)).toEqual(["mom", "priya"]);
    const labelStart = newTestGame({ career: "label" });
    const label: GameState = { ...labelStart, gigs: { ...labelStart.gigs, offers: [] } };
    expect(eligibleClients(label).some((client) => client.id === "valentina")).toBe(true);
    expect(eligibleClients(label).some((client) => client.id === "mom")).toBe(false);
  });
});

describe("offer rolling", () => {
  it("scales the daily offer count with buzz", () => {
    expect([0, 33, 34, 67, 68, 100].map(offerCountForBuzz)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it("does not offer a client who is already waiting", () => {
    const state: GameState = { ...newTestGame({ seed: 3 }), reputation: 20, buzz: 100 };
    const rolled = rollOffers(rollOffers(state));
    const ids = rolled.gigs.offers.map((offer) => offer.clientId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("accepts, declines and caps active gigs", () => {
    const state: GameState = { ...newTestGame({ seed: 5 }), reputation: 20, buzz: 100 };
    const rolled = rollOffers(state);
    const [first, second] = rolled.gigs.offers;
    if (first === undefined || second === undefined) throw new Error("expected two offers");
    const declined = reduce(rolled, { type: "declineOffer", offerId: second.id });
    expect(declined.gigs.offers.some((offer) => offer.id === second.id)).toBe(false);
    const accepted = reduce(declined, { type: "acceptOffer", offerId: first.id });
    expect(accepted.gigs.active[0]?.brief).toEqual(first.brief);
    expect(reduce(accepted, { type: "acceptOffer", offerId: first.id })).toBe(accepted);
    const gig = accepted.gigs.active[0];
    if (gig === undefined) throw new Error("expected an active gig");
    const full: GameState = {
      ...rolled,
      gigs: { ...rolled.gigs, active: Array.from({ length: MAX_ACTIVE_GIGS }, () => gig) },
    };
    expect(reduce(full, { type: "acceptOffer", offerId: second.id })).toBe(full);
  });
});
