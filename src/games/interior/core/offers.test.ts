import type { TraitId } from "../../../engine/trait";
import { describe, expect, it } from "vitest";
import { CLIENTS, SHOW_HOME_CLIENT_ID } from "../content/client";
import type { GameState } from "./gameState";
import { clientIsEligible, rollOffers } from "./offers";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

function client(id: string) {
  const found = CLIENTS.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(id);
  return found;
}

function dayTwo(trait: TraitId, reputation: number): GameState {
  const state = settleStories(newTestGame({ trait }));
  return { ...state, reputation, calendar: { day: 2, hoursLeft: 10 } };
}

describe("client offers", () => {
  it("always starts with Nana Pearl on day one", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const state = newTestGame({ seed });
      expect(state.gigs.offers.map((offer) => offer.clientId)).toEqual(["nana-pearl"]);
    }
  });

  it("opens Orla only to Dreamers and Dr. Faraday only to Perfectionists", () => {
    expect(clientIsEligible(client("orla"), dayTwo("dreamer", 20))).toBe(true);
    expect(clientIsEligible(client("orla"), dayTwo("charmer", 20))).toBe(false);
    expect(clientIsEligible(client("dr-faraday"), dayTwo("perfectionist", 20))).toBe(true);
    expect(clientIsEligible(client("dr-faraday"), dayTwo("trendsetter", 20))).toBe(false);
    expect(clientIsEligible(client("orla"), dayTwo("dreamer", 5))).toBe(false);
  });

  it("queues the trait story when a trait-gated client arrives", () => {
    let state: GameState = {
      ...dayTwo("dreamer", 7),
      gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 5 },
    };
    let orlaArrived = false;
    for (let day = 0; day < 30 && !orlaArrived; day += 1) {
      const next = reduce(state, { type: "endDay" });
      orlaArrived = next.gigs.offers.some((offer) => offer.clientId === "orla");
      expect(next.story.queue.includes("is-dreamer")).toBe(orlaArrived);
      state = { ...settleStories(next), coins: 500, reputation: 7, gigs: { ...next.gigs, offers: [] } };
    }
    expect(orlaArrived).toBe(true);
    expect(state.story.seen).toContain("is-dreamer");
  });

  it("offers a Bellwind show home from reputation 22, at most once a week, with the hot tags", () => {
    expect(clientIsEligible(client(SHOW_HOME_CLIENT_ID), dayTwo("charmer", 21))).toBe(false);
    const open = dayTwo("charmer", 22);
    expect(clientIsEligible(client(SHOW_HOME_CLIENT_ID), open)).toBe(true);
    const onlyBellwind = { ...open, buzz: 0, gigs: { ...open.gigs, offers: [] } };
    let rolled = rollOffers(onlyBellwind);
    for (
      let tries = 0;
      tries < 40 && !rolled.gigs.offers.some((offer) => offer.clientId === SHOW_HOME_CLIENT_ID);
      tries += 1
    )
      rolled = rollOffers({ ...onlyBellwind, rng: onlyBellwind.rng + tries + 1 });
    const offer = rolled.gigs.offers.find((entry) => entry.clientId === SHOW_HOME_CLIENT_ID);
    expect(offer?.brief.requiredTags).toEqual(open.trends.current);
    expect(offer?.brief.showHome).toBe(true);
    expect(rolled.showHomeWeek).toBe(1);
    expect(rolled.story.queue).toContain("is-show-home");
    expect(clientIsEligible(client(SHOW_HOME_CLIENT_ID), rolled)).toBe(false);
  });
});
