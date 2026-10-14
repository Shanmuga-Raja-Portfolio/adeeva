import { actionCheck, type ActionCheck } from "./actionCheck";

export function workPaidShift<S extends { readonly coins: number }>(
  state: S,
  check: ActionCheck,
  pay: number,
  endDay: (state: S) => S,
): S {
  if (!check.ok) return state;
  return endDay({ ...state, coins: state.coins + pay });
}

export function freshDayCheck(hoursLeft: number, dayHours: number): ActionCheck {
  return actionCheck(
    hoursLeft >= dayHours ? [] : ["A shift takes the whole day. Start it first thing in the morning."],
  );
}
