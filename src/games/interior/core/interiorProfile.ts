import { objectOf, oneOf } from "../../../engine/parse";
import { profileShape } from "../../../engine/stateParsers";
import { TRAIT_IDS } from "../../../engine/trait";
import { CAREER_IDS, CAREERS } from "../content/career";
import type { Profile } from "./gameState";

export const interiorProfileParser = objectOf<Profile>({ ...profileShape, startedAs: oneOf(CAREER_IDS) });

export function startReputationOf(profile: Readonly<Record<string, unknown>>): number | null {
  if (!TRAIT_IDS.some((trait) => trait === profile.trait)) return null;
  const startedAs = profile.startedAs === undefined ? "loft" : profile.startedAs;
  return CAREERS.find((career) => career.id === startedAs)?.startReputation ?? null;
}
