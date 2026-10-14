import { ASSIST_ACCURACY_CAP } from "../../../engine/assistCap";
import type { TraitId } from "../../../engine/trait";
import { STAFF, TEO_ID, type StaffDef } from "../content/staff";
import type { StationId } from "../content/station";
import type { StepKind } from "../content/dish";

export const STAFF_SECONDS = 8;
export const CHARMER_STAFF_BONUS = 0.02;

export const STEP_STATIONS: Readonly<Record<StepKind, StationId>> = {
  chop: "board",
  sizzle: "hob",
  simmer: "pot",
  taste: "spice",
  plate: "pass",
};

export function staffSkill(staff: StaffDef, station: StationId, trait: TraitId): number {
  const base = staff.best === station ? staff.bestSkill : staff.otherSkill;
  const warm = trait === "charmer" ? CHARMER_STAFF_BONUS : 0;
  return Math.min(ASSIST_ACCURACY_CAP, Math.round((base + warm) * 100) / 100);
}

export function hireableHelpers(): StaffDef[] {
  return STAFF.filter((member) => member.id !== TEO_ID);
}
