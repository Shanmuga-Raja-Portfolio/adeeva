import { isCount } from "./count";
import { isPlainObject } from "./parse";
import { TRAIT_IDS } from "./trait";

export type StartReputation = (profile: Readonly<Record<string, unknown>>) => number | null;

export function traitGatedStart(start: number): StartReputation {
  return (profile) => (TRAIT_IDS.some((trait) => trait === profile.trait) ? start : null);
}

export function earnedReputation(rawSave: unknown, schemaVersion: number, startOf: StartReputation): number {
  if (!isPlainObject(rawSave) || !isPlainObject(rawSave.profile)) return 0;
  const { schemaVersion: version, reputation, profile } = rawSave;
  if (typeof version !== "number" || !Number.isInteger(version)) return 0;
  if (version < 1 || version > schemaVersion) return 0;
  if (typeof reputation !== "number" || !isCount(reputation)) return 0;
  const start = startOf(profile);
  return start === null ? 0 : Math.max(0, reputation - start);
}

export function traitGatedReputation(schemaVersion: number, start: number): (rawSave: unknown) => number {
  const startOf = traitGatedStart(start);
  return (rawSave) => earnedReputation(rawSave, schemaVersion, startOf);
}

export function fixedStartReputation(schemaVersion: number, start: number): (rawSave: unknown) => number {
  return (rawSave) => earnedReputation(rawSave, schemaVersion, () => start);
}
