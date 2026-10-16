import { isPlainObject } from "../../../engine/parse";
import type { SaveMigration } from "../../../engine/saveEnvelope";
import { DECOR_IDS } from "../content/decor";
import { FLOOR_IDS } from "../content/floor";
import { FURNITURE_IDS } from "../content/furniture";
import { LIGHT_IDS } from "../content/light";
import { PAINT_IDS } from "../content/paint";

type Raw = Readonly<Record<string, unknown>>;

function mapValues(value: unknown, change: (entry: Raw) => Raw): unknown {
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, isPlainObject(entry) ? change(entry) : entry]),
  );
}

function withZeros(shelf: unknown, ids: readonly string[]): unknown {
  if (!isPlainObject(shelf)) return shelf;
  return { ...Object.fromEntries(ids.map((id) => [id, 0])), ...shelf };
}

function stockV2(stock: unknown): unknown {
  if (!isPlainObject(stock)) return stock;
  return {
    ...stock,
    furniture: withZeros(stock.furniture, FURNITURE_IDS),
    paints: withZeros(stock.paints, PAINT_IDS),
    floors: withZeros(stock.floors, FLOOR_IDS),
    lights: withZeros(stock.lights, LIGHT_IDS),
    decor: withZeros(stock.decor, DECOR_IDS),
  };
}

function runV2(run: unknown): unknown {
  if (!isPlainObject(run)) return run;
  const plan = isPlainObject(run.plan) ? { ...run.plan, lowerPaint: null } : run.plan;
  return {
    ...run,
    purpose: { kind: "makeover" },
    plan,
    rollerZone: "top",
    lightCrew: null,
    edges: mapValues(run.edges, (edge) => ({ ...edge, byCrew: false })),
    rolls: mapValues(run.rolls, (roll) => ({ ...roll, smudges: 0, byCrew: false })),
    floorLaid: mapValues(run.floorLaid, (record) => ({ ...record, byCrew: false })),
  };
}

export function addDevelopmentFields(raw: Raw): Record<string, unknown> {
  const profile = isPlainObject(raw.profile) ? { ...raw.profile, startedAs: "loft" } : raw.profile;
  return {
    ...raw,
    profile,
    career: "loft",
    larkspur: null,
    stock: stockV2(raw.stock),
    activeRun: runV2(raw.activeRun),
  };
}

export const SAVE_MIGRATIONS: Readonly<Record<number, SaveMigration>> = {
  1: addDevelopmentFields,
};
