import { describe, expect, it } from "vitest";
import { hostileTexts, hostileValues } from "./hostileJson";
import { integerRangeParser, objectOf, oneOf, stringParser } from "./parse";
import { parseSaveWith, serializeSave, type SaveCodec, type SaveParseResult } from "./saveEnvelope";
import { fuzzSaves, type SaveFuzzTarget } from "./saveFuzz";

interface Jar {
  readonly schemaVersion: 1;
  readonly label: string;
  readonly cookies: number;
}

const jarCodec: SaveCodec<Jar> = {
  version: 1,
  migrations: {},
  parse: objectOf<Jar>({
    schemaVersion: oneOf([1] as const),
    label: stringParser,
    cookies: integerRangeParser(0, 99),
  }),
};

const SAMPLES: readonly Jar[] = [
  { schemaVersion: 1, label: "Oat", cookies: 3 },
  { schemaVersion: 1, label: "Ginger", cookies: 12 },
];

const jarTarget: SaveFuzzTarget<Jar> = {
  parse: (json) => parseSaveWith(json, jarCodec),
  serialize: serializeSave,
  newestVersion: 1,
  afterLoad: () => undefined,
};

function firstFailure(target: SaveFuzzTarget<Jar>): string {
  return fuzzSaves(target, SAMPLES, 0x1a2, 200).failures[0] ?? "";
}

describe("hostile save generator", () => {
  it("gives the same cases for the same seed and new ones for another seed", () => {
    const texts = SAMPLES.map(serializeSave);
    expect(hostileTexts(texts, 7, 200, 1)).toEqual(hostileTexts(texts, 7, 200, 1));
    expect(hostileValues(SAMPLES, 7, 200, 1)).toEqual(hostileValues(SAMPLES, 7, 200, 1));
    expect(hostileTexts(texts, 8, 200, 1)).not.toEqual(hostileTexts(texts, 7, 200, 1));
  });
});

describe("save fuzz runner", () => {
  it("passes a loader that loads or cleanly refuses every case", () => {
    const report = fuzzSaves(jarTarget, SAMPLES, 0x1a2, 200);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.accepted + report.rejected).toBe(report.tried);
  });

  it("reports a loader that throws, even when the save envelope catches it", () => {
    const thrower = (): SaveParseResult<Jar> => {
      throw new TypeError("boom");
    };
    const caught: SaveCodec<Jar> = {
      ...jarCodec,
      parse: () => {
        throw new TypeError("boom");
      },
    };
    expect(firstFailure({ ...jarTarget, parse: thrower })).toMatch(/threw TypeError: boom$/);
    expect(firstFailure({ ...jarTarget, parse: (json) => parseSaveWith(json, caught) })).toMatch(
      /threw TypeError: boom inside the loader$/,
    );
  });

  it("reports long messages, saves that change on reload, and saves that break play", () => {
    const flood = (): SaveParseResult<Jar> => ({ ok: false, error: "x".repeat(2001) });
    expect(firstFailure({ ...jarTarget, parse: flood })).toMatch(
      /rejection message is 2001 characters long$/,
    );
    const drifting = (state: Jar): string => JSON.stringify({ ...state, label: `${state.label}!` });
    expect(firstFailure({ ...jarTarget, serialize: drifting })).toMatch(
      /accepted a save that changes on reload$/,
    );
    const broken = (): never => {
      throw new RangeError("no day");
    };
    expect(firstFailure({ ...jarTarget, afterLoad: broken })).toMatch(/breaks play \(RangeError: no day\)$/);
  });

  it("stops at the first case that changes a shared prototype", () => {
    const polluting = (json: string): SaveParseResult<Jar> => {
      Object.defineProperty(Object.prototype, "polluted", { value: true, configurable: true });
      return jarTarget.parse(json);
    };
    try {
      const report = fuzzSaves({ ...jarTarget, parse: polluting }, SAMPLES, 0x1a2, 200);
      expect(report.failures.at(-1)).toMatch(/changed a shared prototype$/);
      expect(report.accepted + report.rejected).toBe(1);
    } finally {
      Reflect.deleteProperty(Object.prototype, "polluted");
    }
    expect("polluted" in {}).toBe(false);
  });
});
