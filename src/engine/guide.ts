export function withGuide<S extends { readonly guide: boolean }>(state: S, on: boolean): S {
  if (typeof on !== "boolean" || state.guide === on) return state;
  return { ...state, guide: on };
}

export function coachOn(state: { readonly guide: boolean; readonly ordersDelivered: number }): boolean {
  return state.guide && state.ordersDelivered === 0;
}
