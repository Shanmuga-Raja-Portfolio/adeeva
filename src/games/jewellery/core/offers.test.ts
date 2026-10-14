import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import type { GameState } from "./gameState";
import { clientIsEligible } from "./offers";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";
import { joinZone } from "./joiningLamp";
import { cutToleranceMm } from "./cutRecord";
import { setTolerance } from "./stoneSetting";

function eligible(state: GameState): string[] {
  return CLIENTS.filter((client) => clientIsEligible(client, state)).map((client) => client.id);
}

function onDay(state: GameState, day: number, reputation: number): GameState {
  return { ...state, reputation, calendar: { ...state.calendar, day } };
}

describe("offers", () => {
  it("always start with Gran Mina on day one", () => {
    for (const seed of [1, 2, 3, 99, 1234]) {
      const state = newTestGame({ seed });
      expect(state.gigs.offers.map((offer) => offer.clientId)).toEqual(["gran-mina"]);
    }
  });

  it("open clients by reputation from day two", () => {
    const state = newTestGame({ trait: "charmer" });
    expect(eligible(onDay(state, 2, 0))).toEqual(["gran-mina", "dev", "kiko"]);
    expect(eligible(onDay(state, 2, 6))).toEqual(["gran-mina", "dev", "kiko", "aunt-lucia", "ms-saoirse"]);
    expect(eligible(onDay(state, 2, 30))).toContain("mr-okonkwo");
  });

  it("keep Juniper for Dreamers with 10 reputation and Mr. Farouk for Perfectionists with 24", () => {
    expect(eligible(onDay(newTestGame({ trait: "dreamer" }), 3, 10))).toContain("juniper");
    expect(eligible(onDay(newTestGame({ trait: "dreamer" }), 3, 9))).not.toContain("juniper");
    expect(eligible(onDay(newTestGame({ trait: "charmer" }), 3, 30))).not.toContain("juniper");
    expect(eligible(onDay(newTestGame({ trait: "perfectionist" }), 3, 24))).toContain("mr-farouk");
    expect(eligible(onDay(newTestGame({ trait: "perfectionist" }), 3, 23))).not.toContain("mr-farouk");
    expect(eligible(onDay(newTestGame({ trait: "dreamer" }), 3, 40))).not.toContain("mr-farouk");
  });

  it("queue the trait story when a trait-gated client arrives", () => {
    let state = settleStories(newTestGame({ trait: "perfectionist", seed: 5 }));
    state = { ...state, reputation: 30, buzz: 100 };
    let arrived = false;
    for (let day = 0; day < 40 && !arrived; day += 1) {
      state = reduce(state, { type: "endDay" });
      state = {
        ...state,
        gigs: { ...state.gigs, offers: state.gigs.offers.filter((offer) => offer.clientId === "mr-farouk") },
      };
      arrived = state.gigs.offers.some((offer) => offer.clientId === "mr-farouk");
    }
    expect(arrived).toBe(true);
    expect([...state.story.queue, ...state.story.seen]).toContain("jb-perfectionist");
  });

  it("accept into active orders and refuse a fourth", () => {
    const state = settleStories(newTestGame());
    const offer = state.gigs.offers[0];
    if (offer === undefined) throw new Error("no offer");
    const accepted = reduce(state, { type: "acceptOffer", offerId: offer.id });
    expect(accepted.gigs.active.map((gig) => gig.clientId)).toEqual(["gran-mina"]);
    const full: GameState = {
      ...state,
      gigs: {
        ...state.gigs,
        active: [offer, offer, offer].map((entry, index) => ({
          id: `gig-${index + 10}`,
          clientId: entry.clientId,
          brief: entry.brief,
          acceptedDay: 1,
        })),
      },
    };
    expect(reduce(full, { type: "acceptOffer", offerId: offer.id })).toBe(full);
    expect(reduce(state, { type: "declineOffer", offerId: offer.id }).gigs.offers).toEqual([]);
  });
});

describe("trait perks", () => {
  it("make a Perfectionist 20% more forgiving at cutting, joining and setting", () => {
    const dreamer = newTestGame({ trait: "dreamer" });
    const perfectionist = newTestGame({ trait: "perfectionist" });
    expect(cutToleranceMm(perfectionist, "silver") / cutToleranceMm(dreamer, "silver")).toBeCloseTo(1.2);
    expect((joinZone(perfectionist).to - 0.7) / (joinZone(dreamer).to - 0.7)).toBeCloseTo(1.2);
    expect(setTolerance(perfectionist).band / setTolerance(dreamer).band).toBeCloseTo(1.2);
  });

  it("give a Charmer a one-time +2 buzz story and a Trendsetter next week's trends after week one", () => {
    const charmer = settleStories(newTestGame({ trait: "charmer" }));
    const queued = { ...charmer, story: { ...charmer.story, queue: ["jb-charmer"] } };
    const seen = reduce(queued, { type: "markBeatSeen", beatId: "jb-charmer" });
    expect(seen.buzz).toBe(charmer.buzz + 2);
    const again = reduce(
      { ...seen, story: { ...seen.story, queue: ["jb-charmer"] } },
      { type: "markBeatSeen", beatId: "jb-charmer" },
    );
    expect(again.buzz).toBe(seen.buzz);
    let trendsetter = settleStories(newTestGame({ trait: "trendsetter" }));
    for (let day = 1; day <= 7; day += 1) trendsetter = reduce(trendsetter, { type: "endDay" });
    expect(trendsetter.story.queue).toContain("jb-trendsetter");
  });
});
