import type { SlotRead } from "./slotStore";

export interface SlotSummaryState {
  readonly profile: { readonly name: string };
  readonly calendar: { readonly day: number };
}

export function slotSummary(read: SlotRead<SlotSummaryState>): string {
  if (read.kind === "empty") return "Empty";
  if (read.kind === "damaged") return "Damaged save";
  return `${read.state.profile.name} · Day ${read.state.calendar.day}`;
}
