import { describe, expect, it } from "vitest";
import type { GigBoard } from "./gigBoard";
import { arrivedClientIds, lapsedClientIds, vanishedOfferCount } from "./gigBoardChanges";

function offer(id: string, clientId: string) {
  return { id, clientId, brief: null, expiresDay: 3 };
}

const before: GigBoard<null> = {
  offers: [offer("gig-1", "ann"), offer("gig-2", "bo"), offer("gig-3", "cy")],
  active: [],
  lapsed: [{ gigId: "gig-0", clientId: "dee", day: 1, reputation: 1 }],
  nextGigNumber: 4,
};

const after: GigBoard<null> = {
  offers: [offer("gig-3", "cy"), offer("gig-4", "eve"), offer("gig-5", "fin")],
  active: [{ id: "gig-1", clientId: "ann", brief: null, acceptedDay: 2 }],
  lapsed: [...before.lapsed, { gigId: "gig-9", clientId: "gus", day: 2, reputation: 1 }],
  nextGigNumber: 6,
};

describe("gig board changes", () => {
  it("lists the clients of newly arrived offers", () => {
    expect(arrivedClientIds(before, after)).toEqual(["eve", "fin"]);
    expect(arrivedClientIds(before, before)).toEqual([]);
  });

  it("counts offers that left the board without being accepted", () => {
    expect(vanishedOfferCount(before, after)).toBe(1);
    expect(vanishedOfferCount(after, after)).toBe(0);
  });

  it("lists the clients whose gigs lapsed since", () => {
    expect(lapsedClientIds(before, after)).toEqual(["gus"]);
    expect(lapsedClientIds(after, after)).toEqual([]);
  });
});
