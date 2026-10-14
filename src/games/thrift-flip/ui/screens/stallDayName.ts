import { weekdayName } from "../../../../engine/weekday";
import type { CareerId } from "../../content/career";
import { careerById, isStallDay } from "../../core";

export function stallDayName(day: number, career: CareerId): string {
  return isStallDay(day) ? careerById(career).sellDayName : weekdayName(day);
}
