import { isPlainObject, type Parser } from "./parse";

export type SaveMigration = (raw: Readonly<Record<string, unknown>>) => Record<string, unknown>;

export interface SaveCodec<S> {
  readonly version: number;
  readonly migrations: Readonly<Record<number, SaveMigration>>;
  readonly parse: Parser<S>;
}

export type SaveParseResult<S> =
  { readonly ok: true; readonly state: S } | { readonly ok: false; readonly error: string };

function readJson(json: string): { readonly ok: true; readonly value: unknown } | { readonly ok: false } {
  try {
    return { ok: true, value: JSON.parse(json) as unknown };
  } catch {
    return { ok: false };
  }
}

export function migrateRaw(
  raw: Readonly<Record<string, unknown>>,
  fromVersion: number,
  toVersion: number,
  migrations: Readonly<Record<number, SaveMigration>>,
): Readonly<Record<string, unknown>> | null {
  let current = raw;
  for (let version = fromVersion; version < toVersion; version += 1) {
    const migration = Object.hasOwn(migrations, version) ? migrations[version] : undefined;
    if (migration === undefined) return null;
    current = { ...migration(current), schemaVersion: version + 1 };
  }
  return current;
}

export function parseSaveWith<S>(json: string, codec: SaveCodec<S>): SaveParseResult<S> {
  const read = readJson(json);
  if (!read.ok) return { ok: false, error: "The save file is damaged and could not be read." };
  const raw = read.value;
  if (!isPlainObject(raw)) return { ok: false, error: "The save file does not contain a game." };
  const version = raw.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version))
    return { ok: false, error: "The save file has no version number." };
  if (version > codec.version || version < 1)
    return { ok: false, error: `This save uses version ${version}, which this game does not recognise.` };
  const migrated = migrateRaw(raw, version, codec.version, codec.migrations);
  if (migrated === null)
    return { ok: false, error: `This save uses version ${version}, which can no longer be upgraded.` };
  const outcome = codec.parse(migrated, "save");
  if (!outcome.ok) return { ok: false, error: `The save file is damaged (${outcome.error}).` };
  return { ok: true, state: outcome.value };
}

export function serializeSave<S>(state: S): string {
  return JSON.stringify(state);
}
