import { describe, expect, it } from "vitest";
import type { GigBoard } from "./gigBoard";
import { expireStaleOffers, rollStateOffers } from "./gigBoardState";
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
});
