import { hostileTexts, type HostileCase } from "./hostileJson";
import type { SaveParseResult } from "./saveEnvelope";

export interface SaveFuzzTarget<S> {
  readonly parse: (json: string) => SaveParseResult<S>;
  readonly serialize: (state: S) => string;
  readonly newestVersion: number;
  readonly afterLoad: (state: S) => unknown;
}

export interface FuzzReport {
  readonly tried: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly failures: readonly string[];
}

const MAX_ERROR_LENGTH = 2000;
const SHARED_PROTOTYPES = [Object.prototype, Array.prototype, Function.prototype, String.prototype];

export function prototypeShape(): readonly unknown[] {
  return SHARED_PROTOTYPES.flatMap((prototype) =>
    Reflect.ownKeys(prototype).flatMap((key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(prototype, key);
      return [key, descriptor?.value, descriptor?.get, descriptor?.set];
    }),
  );
}

export function prototypeChanged(before: readonly unknown[]): boolean {
  const after = prototypeShape();
  if (after.length !== before.length || after.some((entry, index) => entry !== before[index])) return true;
  return "polluted" in {} || "polluted" in [];
}

export function describeThrown(error: unknown): string {
  return error instanceof Error
    ? `${error.name}: ${error.message.slice(0, 160)}`
    : String(error).slice(0, 160);
}

function judged<S>(target: SaveFuzzTarget<S>, entry: HostileCase<string>): string {
  let result: SaveParseResult<S>;
  try {
    result = target.parse(entry.input);
  } catch (error) {
    return `${entry.label}: threw ${describeThrown(error)}`;
  }
  if (!result.ok) {
    if ("thrown" in result) return `${entry.label}: threw ${describeThrown(result.thrown)} inside the loader`;
    if (typeof result.error !== "string" || result.error.length === 0)
      return `${entry.label}: rejected without a message`;
    if (result.error.length > MAX_ERROR_LENGTH)
      return `${entry.label}: rejection message is ${result.error.length} characters long`;
    return "rejected";
  }
  const text = target.serialize(result.state);
  const again = target.parse(text);
  if (!again.ok) return `${entry.label}: accepted a save that does not load again (${again.error})`;
  if (target.serialize(again.state) !== text) return `${entry.label}: accepted a save that changes on reload`;
  try {
    target.afterLoad(result.state);
  } catch (error) {
    return `${entry.label}: accepted a save that breaks play (${describeThrown(error)})`;
  }
  return "accepted";
}

export function fuzzSaves<S>(
  target: SaveFuzzTarget<S>,
  samples: readonly S[],
  seed: number,
  rounds: number,
): FuzzReport {
  const before = prototypeShape();
  const cases = hostileTexts(samples.map(target.serialize), seed, rounds, target.newestVersion);
  const failures: string[] = [];
  let accepted = 0;
  let rejected = 0;
  for (const entry of cases) {
    const verdict = judged(target, entry);
    if (verdict === "accepted") accepted += 1;
    else if (verdict === "rejected") rejected += 1;
    else failures.push(verdict);
    if (prototypeChanged(before)) {
      failures.push(`${entry.label}: changed a shared prototype`);
      break;
    }
  }
  return { tried: cases.length, accepted, rejected, failures };
}
