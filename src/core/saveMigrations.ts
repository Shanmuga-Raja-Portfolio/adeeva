import type { SeamProgress } from "./dressRun";
import { isPlainObject } from "./shapeParser";

export type SaveMigration = (raw: Readonly<Record<string, unknown>>) => Record<string, unknown>;

function addAssistantPaidThroughDay(raw: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const studio = raw.studio;
  if (!isPlainObject(studio)) return { ...raw };
  return { ...raw, studio: { ...studio, assistantPaidThroughDay: 0 } };
}

const LEGACY_SEAM_TICKS = 247;

export function legacySeamCounts(progress: number, accuracy: number): SeamProgress {
  const ticks = progress > 0 ? Math.max(1, Math.round(progress * LEGACY_SEAM_TICKS)) : 0;
  return { progress, ticks, insideTicks: Math.round(accuracy * ticks), assisted: false };
}

function countSeam(seam: unknown): unknown {
  if (!isPlainObject(seam)) return seam;
  const { progress, accuracy } = seam;
  if (typeof progress !== "number" || typeof accuracy !== "number") return seam;
  return legacySeamCounts(progress, accuracy);
}

function countSeamTicks(raw: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const run = raw.activeRun;
  if (!isPlainObject(run) || !isPlainObject(run.seams)) return { ...raw };
  const seams = Object.fromEntries(Object.entries(run.seams).map(([id, seam]) => [id, countSeam(seam)]));
  return { ...raw, activeRun: { ...run, seams } };
}

const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {
  1: addAssistantPaidThroughDay,
  2: countSeamTicks,
};

export function migrateSave(
  raw: Readonly<Record<string, unknown>>,
  fromVersion: number,
  toVersion: number,
): Readonly<Record<string, unknown>> | null {
  let current = raw;
  for (let version = fromVersion; version < toVersion; version += 1) {
    const migration = Object.hasOwn(SAVE_MIGRATIONS, version) ? SAVE_MIGRATIONS[version] : undefined;
    if (migration === undefined) return null;
    current = { ...migration(current), schemaVersion: version + 1 };
  }
  return current;
}
