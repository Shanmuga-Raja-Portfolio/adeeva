import type { SeamProgress } from "./dressRun";
import { isPlainObject } from "../../../engine/parse";

import type { SaveMigration } from "../../../engine/saveEnvelope";

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

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {
  1: addAssistantPaidThroughDay,
  2: countSeamTicks,
};
