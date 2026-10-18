import { describe, expect, it } from "vitest";
import { integerParser, objectOf, stringParser } from "./parse";
import { migrateRaw, parseSaveWith, type SaveCodec } from "./saveEnvelope";

interface Jar {
  readonly schemaVersion: number;
  readonly label: string;
  readonly cookies: number;
}

const codec: SaveCodec<Jar> = {
  version: 2,
  migrations: { 1: (raw) => ({ ...raw, cookies: 0 }) },
  parse: objectOf<Jar>({ schemaVersion: integerParser, label: stringParser, cookies: integerParser }),
};

describe("parseSaveWith", () => {
  it("reads a current save", () => {
    expect(parseSaveWith('{"schemaVersion":2,"label":"Oat","cookies":3}', codec)).toEqual({
      ok: true,
      state: { schemaVersion: 2, label: "Oat", cookies: 3 },
    });
  });

  it("migrates an older save up to the current version", () => {
    expect(parseSaveWith('{"schemaVersion":1,"label":"Oat"}', codec)).toEqual({
      ok: true,
      state: { schemaVersion: 2, label: "Oat", cookies: 0 },
    });
  });

  it("explains each way a save can fail", () => {
    const errors = ["{", "[]", '{"label":"Oat"}', '{"schemaVersion":9}', '{"schemaVersion":2,"label":4}'].map(
      (json) => {
        const result = parseSaveWith(json, codec);
        return result.ok ? "" : result.error;
      },
    );
    expect(errors).toEqual([
      "The save file is damaged and could not be read.",
      "The save file does not contain a game.",
      "The save file has no version number.",
      "This save uses version 9, which this game does not recognise.",
      "The save file is damaged (save.label: expected text).",
    ]);
    const gap = parseSaveWith('{"schemaVersion":1}', { ...codec, migrations: {} });
    expect(gap).toEqual({ ok: false, error: "This save uses version 1, which can no longer be upgraded." });
  });

  it("turns a migration or parser that throws into a damaged save instead of a crash", () => {
    const brokenStep: SaveCodec<Jar> = {
      ...codec,
      migrations: {
        1: () => {
          throw new TypeError("step broke");
        },
      },
    };
    const brokenParser: SaveCodec<Jar> = {
      ...codec,
      parse: () => {
        throw new RangeError("too deep");
      },
    };
    const error = "The save file is damaged and could not be opened.";
    expect(parseSaveWith('{"schemaVersion":1,"label":"Oat"}', brokenStep)).toEqual({
      ok: false,
      error,
      thrown: new TypeError("step broke"),
    });
    expect(parseSaveWith('{"schemaVersion":2,"label":"Oat","cookies":3}', brokenParser)).toEqual({
      ok: false,
      error,
      thrown: new RangeError("too deep"),
    });
  });
});

describe("migrateRaw", () => {
  it("stamps each step's version and stops at a missing step", () => {
    expect(migrateRaw({ schemaVersion: 1 }, 1, 2, codec.migrations)).toEqual({
      schemaVersion: 2,
      cookies: 0,
    });
    expect(migrateRaw({ schemaVersion: 1 }, 1, 3, codec.migrations)).toBeNull();
  });
});
