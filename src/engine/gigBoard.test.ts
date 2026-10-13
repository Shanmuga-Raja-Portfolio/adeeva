import { describe, expect, it } from "vitest";
import {
  acceptOffer,
  clientIsOpen,
  declineOffer,
  expireOffers,
  freeClients,
  gigLapseDay,
  isGigLate,
  lapseOverdue,
  lapseReputation,
  MAX_ACTIVE_GIGS,
  MAX_PENDING_OFFERS,
  offerAcceptIssue,
  offerCountForBuzz,
  OFFER_LIFETIME_DAYS,
  rollOffers,
  type GigBoard,
  type Offer,
} from "./gigBoard";
import type { RngState } from "./rng";
import { drawInt } from "./rngDraw";

interface TestBrief {
  readonly deadlineDay: number;
  readonly size: number;
}

const empty: GigBoard<TestBrief> = { offers: [], active: [], lapsed: [], nextGigNumber: 1 };
const ana = { id: "ana", minReputation: 0 };
const ben = { id: "ben", minReputation: 5 };
const cy = { id: "cy", minReputation: 0, traitGate: "charmer" as const };
const clients = [ana, ben, cy, { id: "dee", minReputation: 0 }];

function rollBrief(_client: { readonly id: string }, day: number, rng: RngState): [TestBrief, RngState] {
  const [size, next] = drawInt(rng, 1, 9);
  return [{ deadlineDay: day + 4, size }, next];
}

function boardWithOffers(): GigBoard<TestBrief> {
  return rollOffers(empty, clients, { day: 1, buzz: 100, rng: 9, rollBrief }).board;
}

function firstOffer(board: GigBoard<TestBrief>): Offer<TestBrief> {
  const offer = board.offers[0];
  if (offer === undefined) throw new Error("expected an offer");
  return offer;
}

describe("client gates", () => {
  it("opens clients by reputation and trait", () => {
    expect(clientIsOpen(ana, 0, "dreamer")).toBe(true);
    expect(clientIsOpen(ben, 4, "dreamer")).toBe(false);
    expect(clientIsOpen(cy, 0, "dreamer")).toBe(false);
    expect(clientIsOpen(cy, 0, "charmer")).toBe(true);
  });

  it("leaves out clients who already have an offer or a gig", () => {
    const board = boardWithOffers();
    const busy = new Set(board.offers.map((offer) => offer.clientId));
    const free = freeClients(clients, board, () => true);
    expect(free.every((client) => !busy.has(client.id))).toBe(true);
    expect(free.length).toBe(clients.length - busy.size);
  });
});

describe("rollOffers", () => {
  it("scales the daily offer count with buzz", () => {
    expect([0, 33, 34, 67, 68, 100].map(offerCountForBuzz)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it("numbers offers, sets their expiry and is deterministic", () => {
    const first = rollOffers(empty, clients, { day: 3, buzz: 100, rng: 42, rollBrief });
    const again = rollOffers(empty, clients, { day: 3, buzz: 100, rng: 42, rollBrief });
    expect(first).toEqual(again);
    expect(first.board.offers.map((offer) => offer.id)).toEqual(["gig-1", "gig-2", "gig-3"]);
    expect(first.board.offers.every((offer) => offer.expiresDay === 3 + OFFER_LIFETIME_DAYS)).toBe(true);
    expect(first.board.nextGigNumber).toBe(4);
    expect(first.arrived.map((client) => client.id)).toEqual(
      first.board.offers.map((offer) => offer.clientId),
    );
  });

  it("returns the same board when there is no room or nobody is free", () => {
    const full = { ...empty, offers: boardWithOffers().offers.concat(boardWithOffers().offers).slice(0, 4) };
    expect(full.offers.length).toBe(MAX_PENDING_OFFERS);
    const noRoom = rollOffers(full, clients, { day: 1, buzz: 0, rng: 5, rollBrief });
    expect(noRoom.board).toBe(full);
    expect(noRoom.rng).toBe(5);
    const nobody = rollOffers(empty, [], { day: 1, buzz: 0, rng: 5, rollBrief });
    expect(nobody.board).toBe(empty);
    expect(nobody.arrived).toEqual([]);
  });
});

describe("offer responses", () => {
  it("accepts an offer into the active gigs", () => {
    const board = boardWithOffers();
    const offer = firstOffer(board);
    const accepted = acceptOffer(board, offer.id, 2);
    expect(accepted.offers.some((entry) => entry.id === offer.id)).toBe(false);
    expect(accepted.active).toEqual([
      { id: offer.id, clientId: offer.clientId, brief: offer.brief, acceptedDay: 2 },
    ]);
  });

  it("returns the same board for an unknown offer or a full gig list", () => {
    const board = boardWithOffers();
    expect(offerAcceptIssue(board, "gig-99")).toBe("That offer is no longer available.");
    expect(acceptOffer(board, "gig-99", 1)).toBe(board);
    expect(declineOffer(board, "gig-99")).toBe(board);
    const gig = { id: "gig-50", clientId: "zed", brief: { deadlineDay: 9, size: 1 }, acceptedDay: 1 };
    const busy = { ...board, active: Array.from({ length: MAX_ACTIVE_GIGS }, () => gig) };
    expect(offerAcceptIssue(busy, firstOffer(board).id)).toBe(
      `You already have ${MAX_ACTIVE_GIGS} gigs on the go. Finish one first.`,
    );
    expect(acceptOffer(busy, firstOffer(board).id, 1)).toBe(busy);
  });

  it("declines and expires offers, keeping the board when nothing changes", () => {
    const board = boardWithOffers();
    const declined = declineOffer(board, firstOffer(board).id);
    expect(declined.offers.length).toBe(board.offers.length - 1);
    expect(expireOffers(board, 1 + OFFER_LIFETIME_DAYS)).toBe(board);
    expect(expireOffers(board, 2 + OFFER_LIFETIME_DAYS).offers).toEqual([]);
  });
});

describe("deadlines", () => {
  const gig = { id: "gig-1", clientId: "ana", brief: { deadlineDay: 5, size: 2 }, acceptedDay: 1 };
  const board: GigBoard<TestBrief> = { ...empty, active: [gig] };

  it("marks a gig late after its deadline and lapses it after the grace days", () => {
    expect(isGigLate(gig, 5)).toBe(false);
    expect(isGigLate(gig, 6)).toBe(true);
    expect(gigLapseDay(gig)).toBe(9);
  });

  it("costs reputation by difficulty and trait", () => {
    expect(lapseReputation("relaxed", "dreamer")).toBe(0);
    expect(lapseReputation("standard", "dreamer")).toBe(-1);
    expect(lapseReputation("standard", "charmer")).toBe(0);
    expect(lapseReputation("challenging", "charmer")).toBe(-3);
  });

  it("moves overdue gigs to the lapsed list", () => {
    expect(lapseOverdue(board, 8, "challenging", "dreamer")).toBeNull();
    expect(lapseOverdue(board, 30, "relaxed", "dreamer")).toBeNull();
    const lapse = lapseOverdue(board, 9, "challenging", "dreamer");
    expect(lapse?.board.active).toEqual([]);
    expect(lapse?.board.lapsed).toEqual([{ gigId: "gig-1", clientId: "ana", day: 9, reputation: -3 }]);
    expect(lapse?.lapsedIds.has("gig-1")).toBe(true);
    expect(lapse?.reputation).toBe(-3);
  });
});
