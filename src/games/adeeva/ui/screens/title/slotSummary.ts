import type { SlotRead } from "../../adeevaSlots";

export function slotSummary(read: SlotRead): string {
  if (read.kind === "empty") return "Empty";
  if (read.kind === "damaged") return "Damaged save";
  return `${read.state.profile.name} · Day ${read.state.calendar.day}`;
}
