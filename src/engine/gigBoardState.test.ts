import { describe, expect, it } from "vitest";
import type { DifficultyId } from "./difficulty";
import type { GigBoard } from "./gigBoard";
import {
  acceptStateOffer,
  declineStateOffer,
  expireStaleOffers,
  lapseOverdueState,
  rollStateOffers,
  stateOfferAcceptIssue,
  stateOfferViews,
} from "./gigBoardState";
import type { TraitId } from "./trait";

interface BoardGame {
  readonly gigs: GigBoard<string>;
  readonly calendar: { readonly day: number };
  readonly buzz: number;
  readonly rng: number;
  readonly profile: { readonly trait: TraitId };
  readonly beats: readonly string[];
}

const emptyBoard: GigBoard<string> = { offers: [], active: [], lapsed: [], nextGigNumber: 1 };
const game: BoardGame = {
  gigs: emptyBoard,
  calendar: { day: 3 },
  buzz: 0,
  rng: 7,
  profile: { trait: "charmer" },
  beats: [],
};
const rollBrief = (client: { readonly id: string }, day: number, rng: number): [string, number] => [
  `${client.id}@${day}`,
  rng + 1,
];
const noteTrait = (state: BoardGame, trait: TraitId): BoardGame => ({
  ...state,
  beats: [...state.beats, trait],
});

describe("gig board state", () => {
  it("drops expired offers and keeps the same state when none expire", () => {
    const offer = { id: "gig-1", clientId: "ana", brief: "b", expiresDay: 2 };
    const stale: BoardGame = { ...game, gigs: { ...emptyBoard, offers: [offer] } };
    expect(expireStaleOffers(stale).gigs.offers).toEqual([]);
    expect(expireStaleOffers(game)).toBe(game);
  });

  it("rolls offers and notes a trait-gated arrival", () => {
    const gated = [{ id: "ana", minReputation: 0, traitGate: "charmer" as const }];
    const rolled = rollStateOffers(game, gated, rollBrief, noteTrait);
    expect(rolled.gigs.offers.map((offer) => offer.brief)).toEqual(["ana@3"]);
    expect(rolled.beats).toEqual(["charmer"]);
    const open = rollStateOffers(game, [{ id: "bo", minReputation: 0 }], rollBrief, noteTrait);
    expect(open.beats).toEqual([]);
  });

  it("returns the same state when no offer can arrive", () => {
    expect(rollStateOffers(game, [], rollBrief, noteTrait)).toBe(game);
  });

  it("accepts or declines an offer on the state and returns the same state for an unknown offer", () => {
    const offer = { id: "gig-1", clientId: "ana", brief: "b", expiresDay: 9 };
    const offered: BoardGame = { ...game, gigs: { ...emptyBoard, offers: [offer] } };
    const accepted = acceptStateOffer(offered, "gig-1");
    expect(accepted.gigs.active).toEqual([{ id: "gig-1", clientId: "ana", brief: "b", acceptedDay: 3 }]);
    expect(accepted.gigs.offers).toEqual([]);
    expect(declineStateOffer(offered, "gig-1").gigs.offers).toEqual([]);
    expect(acceptStateOffer(offered, "gig-9")).toBe(offered);
    expect(declineStateOffer(offered, "gig-9")).toBe(offered);
  });

  it("pairs each offer with its known client and skips unknown ones", () => {
    const offers = [
      { id: "gig-1", clientId: "ana", brief: "b", expiresDay: 9 },
      { id: "gig-2", clientId: "ghost", brief: "c", expiresDay: 9 },
    ];
    const offered: BoardGame = { ...game, gigs: { ...emptyBoard, offers } };
    const lookup = (id: string) => (id === "ana" ? { name: "Ana" } : undefined);
    expect(stateOfferViews(offered, lookup)).toEqual([{ offer: offers[0], client: { name: "Ana" } }]);
  });

  it("reports why an offer cannot be accepted", () => {
    const offer = { id: "gig-1", clientId: "ana", brief: "b", expiresDay: 9 };
    const offered: BoardGame = { ...game, gigs: { ...emptyBoard, offers: [offer] } };
    expect(stateOfferAcceptIssue(offered, "gig-1")).toBeNull();
    expect(stateOfferAcceptIssue(offered, "gig-9")).not.toBeNull();
  });
});

interface LapseRun {
  readonly gigId: string | null;
}

interface LapseGame {
  readonly gigs: GigBoard<{ readonly deadlineDay: number }>;
  readonly calendar: { readonly day: number };
  readonly profile: { readonly difficulty: DifficultyId; readonly trait: TraitId };
  readonly activeRun: LapseRun | null;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly dropped: number;
}

const lateGig = { id: "gig-1", clientId: "ana", brief: { deadlineDay: 1 }, acceptedDay: 1 };
const lapsing: LapseGame = {
  gigs: { offers: [], active: [lateGig], lapsed: [], nextGigNumber: 2 },
  calendar: { day: 9 },
  profile: { difficulty: "challenging", trait: "trendsetter" },
  activeRun: { gigId: "gig-1" },
  coins: 0,
  reputation: 10,
  buzz: 0,
  dropped: 0,
};
const runGigId = (run: LapseRun): string | null => run.gigId;

describe("lapsing overdue gigs on the state", () => {
  it("lapses an overdue gig, clears its run and costs reputation", () => {
    const lapsed = lapseOverdueState(lapsing, runGigId);
    expect(lapsed.gigs.active).toEqual([]);
    expect(lapsed.gigs.lapsed.map((gig) => gig.gigId)).toEqual(["gig-1"]);
    expect(lapsed.activeRun).toBeNull();
    expect(lapsed.reputation).toBe(7);
  });

  it("keeps a run that belongs to no lapsed gig", () => {
    const own: LapseGame = { ...lapsing, activeRun: { gigId: null } };
    expect(lapseOverdueState(own, runGigId).activeRun).toEqual({ gigId: null });
  });

  it("drops the lapsed run with the given drop", () => {
    const drop = (state: LapseGame): LapseGame => ({ ...state, activeRun: null, dropped: state.dropped + 1 });
    expect(lapseOverdueState(lapsing, runGigId, drop).dropped).toBe(1);
  });

  it("returns the same state when nothing is overdue or the difficulty is relaxed", () => {
    const early: LapseGame = { ...lapsing, calendar: { day: 1 } };
    expect(lapseOverdueState(early, runGigId)).toBe(early);
    const relaxed: LapseGame = { ...lapsing, profile: { difficulty: "relaxed", trait: "trendsetter" } };
    expect(lapseOverdueState(relaxed, runGigId)).toBe(relaxed);
  });
});
