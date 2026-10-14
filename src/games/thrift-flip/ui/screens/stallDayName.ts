import { weekdayName } from "../../../../engine/weekday";
import { isStallDay } from "../../core";

export function stallDayName(day: number): string {
  return isStallDay(day) ? "Stall Day" : weekdayName(day);
}
