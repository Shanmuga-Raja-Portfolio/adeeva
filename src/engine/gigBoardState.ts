import { expireOffers, rollOffers, type GatedClient, type GigBoard, type OfferRoll } from "./gigBoard";
import type { RngState } from "./rng";
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
