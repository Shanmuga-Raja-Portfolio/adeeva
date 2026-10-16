import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";

type Raw = Readonly<Record<string, unknown>>;

function mappedRecord(record: unknown, change: (entry: Raw) => Raw): unknown {
  if (!isPlainObject(record)) return record;
  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, isPlainObject(entry) ? change(entry) : entry]),
  );
}

function migratedRun(run: unknown): unknown {
  if (!isPlainObject(run)) return run;
  const extras = Array.isArray(run.extras)
    ? run.extras.map((extra: unknown) => (isPlainObject(extra) ? { ...extra, piece: 0 } : extra))
    : run.extras;
  return {
    ...run,
    purpose: { kind: "commission" },
    extras,
    joints: mappedRecord(run.joints, (record) => ({ ...record, byApprentice: false })),
    sanding: mappedRecord(run.sanding, (record) => ({ ...record, renAccuracy: null })),
    renJobs: [],
  };
}

export function addShowroomFields(raw: Raw): Record<string, unknown> {
  return {
    ...raw,
    profile: isPlainObject(raw.profile) ? { ...raw.profile, startedAs: "garage" } : raw.profile,
    career: "garage",
    activeRun: raw.activeRun === null ? null : migratedRun(raw.activeRun),
    showroom: null,
    fair: null,
    apprentice: null,
  };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = { 1: addShowroomFields };
