export const BASE_DAY_HOURS = 10;

export interface DayClock {
  readonly day: number;
  readonly hoursLeft: number;
}

export function hasHours(clock: DayClock, hours: number): boolean {
  return clock.hoursLeft >= hours;
}

export function spendCalendarHours<C extends DayClock>(clock: C, hours: number): C | null {
  if (!hasHours(clock, hours)) return null;
  if (hours === 0) return clock;
  return { ...clock, hoursLeft: clock.hoursLeft - hours };
}

export function hoursShortfallReason(clock: DayClock, hours: number): string | null {
  if (hasHours(clock, hours)) return null;
  return `This needs ${hours} ${hours === 1 ? "hour" : "hours"} and only ${clock.hoursLeft} ${clock.hoursLeft === 1 ? "is" : "are"} left today. End the day to continue.`;
}

export function spendHours<S extends { readonly calendar: DayClock }>(state: S, hours: number): S | null {
  const calendar = spendCalendarHours(state.calendar, hours);
  if (calendar === null) return null;
  return calendar === state.calendar ? state : { ...state, calendar };
}

export function dayGreeting(hoursLeft: number, dayHours: number): string {
  const share = hoursLeft / dayHours;
  if (share > 0.66) return "Good morning";
  if (share > 0.3) return "Good afternoon";
  return "Good evening";
}
