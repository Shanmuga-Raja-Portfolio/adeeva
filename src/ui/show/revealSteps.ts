export type RevealKind = "title" | "lights" | "glide" | "wait" | "reveal" | "finale" | "panels";

export interface RevealStep {
  readonly kind: RevealKind;
  readonly slot: number;
  readonly ms: number;
}

export type RevealTiming = Readonly<Record<RevealKind, number>>;

export interface RevealTimings {
  readonly motion: RevealTiming;
  readonly still: RevealTiming;
  readonly lights: boolean;
}

export function revealSteps(pieces: number, reduced: boolean, timings: RevealTimings): RevealStep[] {
  const timing = reduced ? timings.still : timings.motion;
  const step = (kind: RevealKind, slot = -1): RevealStep => ({ kind, slot, ms: timing[kind] });
  const reveals = Array.from({ length: pieces }, (_, slot) => [
    ...(reduced ? [] : [step("glide", slot)]),
    step("wait", slot),
    step("reveal", slot),
  ]).flat();
  const lights = timings.lights && !reduced ? [step("lights")] : [];
  return [step("title"), ...lights, ...reveals, step("finale"), step("panels")];
}

export function revealedSlots(steps: readonly RevealStep[], index: number): number[] {
  return steps
    .slice(0, index)
    .filter((entry) => entry.kind === "reveal")
    .map((entry) => entry.slot);
}

export function restX(slot: number, count: number): number {
  if (count <= 1) return 50;
  const span = count >= 4 ? 72 : count === 3 ? 60 : 42;
  return 50 - span / 2 + (span * slot) / (count - 1);
}
