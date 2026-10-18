import type { RngState } from "./rng";
import { drawInt, drawItem } from "./rngDraw";

export interface HostileCase<T> {
  readonly label: string;
  readonly input: T;
}

interface Draw {
  readonly int: (min: number, max: number) => number;
  readonly item: <T>(items: readonly T[]) => T;
  readonly chance: (share: number) => boolean;
}

type Step = string | number;

const REMOVED = Symbol("removed");

const RAW_MARKS: readonly (readonly [string, string])[] = [
  ["@@fuzz:infinity@@", "1e999"],
  ["@@fuzz:-infinity@@", "-1e999"],
  ["@@fuzz:huge-digits@@", `1${"0".repeat(400)}`],
  ["@@fuzz:tiny@@", "1e-400"],
  ["@@fuzz:nan@@", "NaN"],
  ["@@fuzz:deep-list@@", `${"[".repeat(50_000)}${"]".repeat(50_000)}`],
  ["@@fuzz:deep-object@@", `${'{"a":'.repeat(20_000)}1${"}".repeat(20_000)}`],
  ["@@fuzz:megabyte@@", `"${"m".repeat(1_000_000)}"`],
];

const MARKS = RAW_MARKS.map(([mark]) => mark);

const HOSTILE_KEYS = [
  "__proto__",
  "constructor",
  "prototype",
  "toString",
  "hasOwnProperty",
  "schemaVersion",
  "version",
  "profile",
  "reputation",
  "name",
  "trait",
  "career",
  "start",
  "seconds",
  "activeRun",
  "calendar",
  "day",
  "0",
  "",
  "k".repeat(300),
  "q".repeat(20_000),
] as const;

const HOSTILE_LEAVES: readonly unknown[] = [
  null,
  true,
  false,
  0,
  -0,
  -1,
  1,
  0.5,
  -0.5,
  1.5,
  7,
  99,
  1e21,
  -1e21,
  Number.MAX_VALUE,
  -Number.MAX_VALUE,
  Number.MIN_VALUE,
  Number.MAX_SAFE_INTEGER + 2,
  -Number.MAX_SAFE_INTEGER - 2,
  2147483648,
  4294967296,
  "",
  " ",
  "0",
  "1",
  "true",
  "null",
  "NaN",
  "Infinity",
  "__proto__",
  "constructor",
  "prototype",
  "toString",
  "valueOf",
  "hasOwnProperty",
  "<script>alert(1)</script>",
  '"><img src=x onerror=alert(1)>',
  "javascript:alert(1)",
  "url(https://example.invalid/x.png)",
  "‮\u0000\ud800",
  "x".repeat(10_000),
  [],
  {},
  [null],
  [[]],
  Object.fromEntries([["__proto__", { polluted: true }]]),
  { constructor: { prototype: { polluted: true } } },
  ...MARKS,
];

const FIXED_TEXTS: readonly string[] = [
  "",
  " ",
  "null",
  "true",
  "0",
  "-1",
  "[]",
  "{}",
  '"text"',
  "﻿{}",
  "{",
  "}",
  "[{]",
  "undefined",
  "NaN",
  "Infinity",
  "1e999",
  '{"schemaVersion":1}',
  '{"schemaVersion":"1"}',
  '{"schemaVersion":1.5}',
  '{"schemaVersion":0}',
  '{"schemaVersion":-1}',
  '{"schemaVersion":1e999}',
  '{"schemaVersion":99999}',
  '{"schemaVersion":null}',
  '{"schemaVersion":[1]}',
  '{"__proto__":{"polluted":true},"schemaVersion":1}',
  '{"constructor":{"prototype":{"polluted":true}},"schemaVersion":1}',
  '{"schemaVersion":1,"profile":{"__proto__":{"polluted":true}}}',
  `${"[".repeat(200_000)}${"]".repeat(200_000)}`,
  `${'{"a":'.repeat(100_000)}1${"}".repeat(100_000)}`,
  `"${"s".repeat(3_000_000)}"`,
  `[${Array.from({ length: 100_000 }, () => "0").join(",")}]`,
];

function drawFrom(seed: number): Draw {
  let state: RngState = seed;
  const int = (min: number, max: number): number => {
    const [value, next] = drawInt(state, min, max);
    state = next;
    return value;
  };
  const item = <T>(items: readonly T[]): T => {
    const [value, next] = drawItem(state, items);
    state = next;
    return value;
  };
  return { int, item, chance: (share) => int(0, 999) < share * 1000 };
}

function randomValue(draw: Draw, depth: number): unknown {
  if (depth <= 0 || draw.chance(0.45)) return draw.item(HOSTILE_LEAVES);
  const size = draw.int(0, 4);
  if (draw.chance(0.5)) return Array.from({ length: size }, () => randomValue(draw, depth - 1));
  return Object.fromEntries(
    Array.from({ length: size }, () => [draw.item(HOSTILE_KEYS), randomValue(draw, depth - 1)]),
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pathsOf(value: unknown, prefix: readonly Step[], into: Step[][]): Step[][] {
  into.push([...prefix]);
  if (Array.isArray(value)) value.forEach((entry, index) => pathsOf(entry, [...prefix, index], into));
  else if (isRecord(value))
    for (const [key, entry] of Object.entries(value)) pathsOf(entry, [...prefix, key], into);
  return into;
}

function changedAt(value: unknown, path: readonly Step[], change: (old: unknown) => unknown): unknown {
  const [step, ...rest] = path;
  if (step === undefined) return change(value);
  if (Array.isArray(value))
    return value
      .map((entry, index) => (index === step ? changedAt(entry, rest, change) : entry))
      .filter((entry) => entry !== REMOVED);
  if (isRecord(value))
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entry]) => [key, key === step ? changedAt(entry, rest, change) : entry] as const)
        .filter(([, entry]) => entry !== REMOVED),
    );
  return value;
}

function valueAt(value: unknown, path: readonly Step[]): unknown {
  const [step, ...rest] = path;
  if (step === undefined) return value;
  if (Array.isArray(value) && typeof step === "number") return valueAt(value[step], rest);
  if (isRecord(value) && typeof step === "string" && Object.hasOwn(value, step))
    return valueAt(value[step], rest);
  return undefined;
}

function nudged(draw: Draw, value: number): unknown {
  return draw.item([value + 1, value - 1, -value, value * 1000, value + 0.5, value - 0.25, -1, 0]);
}

function swapped(value: unknown): unknown {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return Number(value.length);
  if (typeof value === "boolean") return value ? 1 : 0;
  if (Array.isArray(value)) return Object.fromEntries(value.entries());
  if (isRecord(value)) return Object.values(value);
  return {};
}

function withPollution(value: unknown): unknown {
  if (Array.isArray(value)) return [...value, Object.fromEntries([["__proto__", { polluted: true }]])];
  if (!isRecord(value)) return value;
  return Object.fromEntries([
    ...Object.entries(value),
    ["__proto__", { polluted: true }],
    ["constructor", { prototype: { polluted: true } }],
  ]);
}

function mutation(draw: Draw, old: unknown): readonly [string, unknown] {
  const kind = draw.int(0, 9);
  if (kind === 0 && typeof old === "number") return ["nudge", nudged(draw, old)];
  if (kind === 1) return ["swap type", swapped(old)];
  if (kind === 2) return ["remove", REMOVED];
  if (kind === 3) return ["pollute", withPollution(old)];
  if (kind === 4 && Array.isArray(old))
    return draw.chance(0.2)
      ? ["grow list", Array.from({ length: 5000 }, (_, index) => old[index % Math.max(1, old.length)] ?? 0)]
      : ["duplicate", [...old, ...old]];
  if (kind === 5) return ["random tree", randomValue(draw, 3)];
  if (kind === 6 && isRecord(old))
    return [
      "foreign key",
      Object.fromEntries([...Object.entries(old), [draw.item(HOSTILE_KEYS), randomValue(draw, 2)]]),
    ];
  return ["hostile leaf", draw.item(HOSTILE_LEAVES)];
}

function rawText(value: unknown): string {
  let text = JSON.stringify(value) ?? "null";
  for (const [mark, raw] of RAW_MARKS) text = text.replaceAll(`"${mark}"`, raw);
  return text;
}

function describePath(path: readonly Step[]): string {
  return path.length === 0 ? "(root)" : path.map((step) => String(step).slice(0, 24)).join(".");
}

function mutatedSample(draw: Draw, sample: unknown, newestVersion: number): HostileCase<unknown> {
  const paths = pathsOf(sample, [], []);
  if (draw.chance(0.08) && isRecord(sample)) {
    const version = draw.int(1, Math.max(1, newestVersion));
    return {
      label: `schemaVersion set to ${version}`,
      input: changedAt(sample, ["schemaVersion"], () => version),
    };
  }
  const path = draw.item(paths);
  const [kind, value] = mutation(draw, valueAt(sample, path));
  const replacement = path.length === 0 && value === REMOVED ? null : value;
  return { label: `${kind} at ${describePath(path)}`, input: changedAt(sample, path, () => replacement) };
}

export function hostileValues(
  samples: readonly unknown[],
  seed: number,
  rounds: number,
  newestVersion = 1,
): HostileCase<unknown>[] {
  const draw = drawFrom(seed);
  return Array.from({ length: rounds }, (_, round) => {
    const sample = samples.length > 0 && draw.chance(0.75) ? draw.item(samples) : undefined;
    if (sample !== undefined) return mutatedSample(draw, sample, newestVersion);
    return { label: `random tree ${round}`, input: randomValue(draw, 5) };
  });
}

function corrupted(draw: Draw, text: string): HostileCase<string> {
  if (text.length === 0) return { label: "empty text", input: text };
  const at = draw.int(0, text.length - 1);
  if (draw.chance(0.5)) return { label: `truncated at ${at}`, input: text.slice(0, at) };
  const swap = draw.item(["{", "}", "[", "]", '"', ",", ":", "\\", "0", "a", "\u0000"]);
  return {
    label: `byte ${at} became ${JSON.stringify(swap)}`,
    input: `${text.slice(0, at)}${swap}${text.slice(at + 1)}`,
  };
}

export function hostileTexts(
  sampleTexts: readonly string[],
  seed: number,
  rounds: number,
  newestVersion = 1,
): HostileCase<string>[] {
  const draw = drawFrom(seed);
  const samples = sampleTexts.map((text) => JSON.parse(text) as unknown);
  const fixed = FIXED_TEXTS.map((input, index) => ({ label: `fixed text ${index}`, input }));
  const values = hostileValues(samples, seed ^ 0x5bd1e995, rounds, newestVersion);
  const drawn = values.map((entry, index) => {
    const text = sampleTexts.length > 0 && index % 5 === 4 ? draw.item(sampleTexts) : null;
    return text === null ? { label: entry.label, input: rawText(entry.input) } : corrupted(draw, text);
  });
  return [...fixed, ...drawn];
}
