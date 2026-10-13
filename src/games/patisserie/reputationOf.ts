import { earnedReputation } from "../../engine/earnedReputation";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";

export function reputationOf(rawSave: unknown): number {
  return earnedReputation(rawSave, SCHEMA_VERSION, () => CAREER.startReputation);
}
