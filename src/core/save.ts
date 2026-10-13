import { SCHEMA_VERSION, type GameState } from "./gameState";
import { gameStateParser } from "./gameStateParser";
import { migrateSave } from "./saveMigrations";
import { isPlainObject } from "./shapeParser";

export type SaveParseResult =
  { readonly ok: true; readonly state: GameState } | { readonly ok: false; readonly error: string };

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

function readJson(json: string): { readonly ok: true; readonly value: unknown } | { readonly ok: false } {
  try {
    return { ok: true, value: JSON.parse(json) as unknown };
  } catch {
    return { ok: false };
  }
}

export function parseSave(json: string): SaveParseResult {
  const read = readJson(json);
  if (!read.ok) return { ok: false, error: "The save file is damaged and could not be read." };
  const raw = read.value;
  if (!isPlainObject(raw)) return { ok: false, error: "The save file does not contain a game." };
  const version = raw.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version))
    return { ok: false, error: "The save file has no version number." };
  if (version > SCHEMA_VERSION || version < 1)
    return { ok: false, error: `This save uses version ${version}, which this game does not recognise.` };
  const migrated = migrateSave(raw, version, SCHEMA_VERSION);
  if (migrated === null)
    return { ok: false, error: `This save uses version ${version}, which can no longer be upgraded.` };
  const outcome = gameStateParser(migrated, "save");
  if (!outcome.ok) return { ok: false, error: `The save file is damaged (${outcome.error}).` };
  return { ok: true, state: outcome.value };
}
