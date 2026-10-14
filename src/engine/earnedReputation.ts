import { isCount } from "./count";
import { isPlainObject } from "./parse";

export type StartReputation = (profile: Readonly<Record<string, unknown>>) => number | null;

export function earnedReputation(rawSave: unknown, schemaVersion: number, startOf: StartReputation): number {
  if (!isPlainObject(rawSave) || !isPlainObject(rawSave.profile)) return 0;
  const { schemaVersion: version, reputation, profile } = rawSave;
  if (typeof version !== "number" || !Number.isInteger(version)) return 0;
  if (version < 1 || version > schemaVersion) return 0;
  if (typeof reputation !== "number" || !isCount(reputation)) return 0;
  const start = startOf(profile);
  return start === null ? 0 : Math.max(0, reputation - start);
}
