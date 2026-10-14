import { STATION_DEFS } from "../../../content/station";
import type { StaffDef } from "../../../content/staff";

export function staffRoleLine(member: StaffDef): string {
  if (member.role === "host") return "Front of house";
  if (member.role === "clean") return "Clean Team";
  const best = STATION_DEFS.find((station) => station.id === member.best);
  return best === undefined
    ? `Every station ${Math.round(member.bestSkill * 100)}%`
    : `${best.name} ${Math.round(member.bestSkill * 100)}%`;
}
