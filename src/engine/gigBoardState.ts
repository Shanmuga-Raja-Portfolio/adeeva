import type { DifficultyId } from "./difficulty";
import {
  acceptOffer,
  declineOffer,
  expireOffers,
  lapseOverdue,
  offerAcceptIssue,
  rollOffers,
  type DatedBrief,
  type GatedClient,
  type Gig,
  type GigBoard,
  type Offer,
  type OfferRoll,
} from "./gigBoard";
import type { RngState } from "./rng";
import { applyStanding, type Standing } from "./standing";
import type { TraitId } from "./trait";

export interface BoardState<B> {
  readonly gigs: GigBoard<B>;
  readonly calendar: { readonly day: number };
}

export interface RollingBoardState<B> extends BoardState<B> {
  readonly buzz: number;
  readonly rng: RngState;
  readonly profile: { readonly trait: TraitId };
}

interface LapsingState<B extends DatedBrief> extends BoardState<B>, Standing {
  readonly profile: { readonly difficulty: DifficultyId; readonly trait: TraitId };
  readonly activeRun: object | null;
}

function clearRun<S extends { readonly activeRun: unknown }>(state: S): S {
  return { ...state, activeRun: null };
}

export function lapseOverdueState<B extends DatedBrief, S extends LapsingState<B>>(
  state: S,
  runGigId: (run: NonNullable<S["activeRun"]>) => string | null,
  drop: (state: S) => S = clearRun,
  forgiven: (gig: Gig<B>) => boolean = () => false,
): S {
  const lapse = lapseOverdue(
    state.gigs,
    state.calendar.day,
    state.profile.difficulty,
    state.profile.trait,
    forgiven,
  );
  if (lapse === null) return state;
  const run = state.activeRun;
  const gigId = run === null ? null : runGigId(run);
  const runLapsed = gigId !== null && lapse.lapsedIds.has(gigId);
  const updated: S = { ...(runLapsed ? drop(state) : state), gigs: lapse.board };
  return applyStanding(updated, { coins: 0, reputation: lapse.reputation, buzz: 0 });
}

export interface OfferView<B, C> {
  readonly offer: Offer<B>;
  readonly client: C;
}

export function stateOfferViews<B, C>(
  state: BoardState<B>,
  clientById: (id: string) => C | undefined,
): OfferView<B, C>[] {
  return state.gigs.offers.flatMap((offer) => {
    const client = clientById(offer.clientId);
    return client === undefined ? [] : [{ offer, client }];
  });
}

export function expireStaleOffers<B, S extends BoardState<B>>(state: S): S {
  const gigs = expireOffers(state.gigs, state.calendar.day);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function rollStateOffers<B, C extends GatedClient, S extends RollingBoardState<B>>(
  state: S,
  pool: readonly C[],
  rollBrief: OfferRoll<C, B>["rollBrief"],
  onTraitArrival: (state: S, trait: TraitId) => S,
): S {
  const rolled = rollOffers(state.gigs, pool, {
    day: state.calendar.day,
    buzz: state.buzz,
    rng: state.rng,
    rollBrief,
  });
  if (rolled.board === state.gigs) return state;
  const next: S = { ...state, rng: rolled.rng, gigs: rolled.board };
  const gatedArrived = rolled.arrived.some((client) => client.traitGate === state.profile.trait);
  return gatedArrived ? onTraitArrival(next, state.profile.trait) : next;
}

export function acceptStateOffer<B, S extends BoardState<B>>(state: S, offerId: string): S {
  const gigs = acceptOffer(state.gigs, offerId, state.calendar.day);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function declineStateOffer<B, S extends BoardState<B>>(state: S, offerId: string): S {
  const gigs = declineOffer(state.gigs, offerId);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function stateOfferAcceptIssue<B>(state: BoardState<B>, offerId: string): string | null {
  return offerAcceptIssue(state.gigs, offerId);
}
