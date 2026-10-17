import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { rentLabel, weeklyBill, type GameState } from "../../../core";

export function rentNote(state: GameState): string {
  const rent = weeklyBill(state);
  if (rent === 0) return "No rent on Relaxed. Bake for joy!";
  const days = daysUntilWeekEnd(state.calendar.day);
  const label = rentLabel(state);
  if (days === 0) return `${label}: ${rent} coins, due tonight.`;
  return `${label}: ${rent} coins, due in ${days} ${days === 1 ? "day" : "days"}.`;
}
