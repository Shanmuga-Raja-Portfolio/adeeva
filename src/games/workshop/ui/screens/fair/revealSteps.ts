export type RevealKind = "title" | "glide" | "wait" | "lift" | "finale" | "panels";

export interface RevealStep {
  readonly kind: RevealKind;
  readonly slot: number;
  readonly ms: number;
}

const MOTION_MS: Readonly<Record<RevealKind, number>> = {
  title: 2600,
  glide: 1800,
  wait: 3000,
  lift: 1600,
  finale: 3800,
  panels: 4400,
};

const STILL_MS: Readonly<Record<RevealKind, number>> = {
  title: 2200,
  glide: 0,
  wait: 3000,
  lift: 1800,
  finale: 2600,
  panels: 3800,
};

export function revealSteps(pieces: number, reduced: boolean): RevealStep[] {
  const timing = reduced ? STILL_MS : MOTION_MS;
  const step = (kind: RevealKind, slot = -1): RevealStep => ({ kind, slot, ms: timing[kind] });
  const reveals = Array.from({ length: pieces }, (_, slot) => [
    ...(reduced ? [] : [step("glide", slot)]),
    step("wait", slot),
    step("lift", slot),
  ]).flat();
  return [step("title"), ...reveals, step("finale"), step("panels")];
}

export function restX(slot: number, count: number): number {
  if (count <= 1) return 50;
  const span = count >= 4 ? 72 : count === 3 ? 60 : 42;
  return 50 - span / 2 + (span * slot) / (count - 1);
}
