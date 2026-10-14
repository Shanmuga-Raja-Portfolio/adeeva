import type { ActionCheck } from "./actionCheck";

export function workPaidShift<S extends { readonly coins: number }>(
  state: S,
  check: ActionCheck,
  pay: number,
  endDay: (state: S) => S,
): S {
  if (!check.ok) return state;
  return endDay({ ...state, coins: state.coins + pay });
}
