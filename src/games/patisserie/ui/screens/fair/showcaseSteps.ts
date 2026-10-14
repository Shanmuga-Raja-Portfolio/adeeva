export type ShowcaseKind = "title" | "lights" | "glide" | "wait" | "reveal" | "finale" | "panels";

export interface ShowcaseStep {
  readonly kind: ShowcaseKind;
  readonly plate: number;
  readonly ms: number;
}

const MOTION_MS: Readonly<Record<ShowcaseKind, number>> = {
  title: 2600,
  lights: 1600,
  glide: 1800,
  wait: 3000,
  reveal: 1500,
  finale: 3600,
  panels: 4200,
};

const STILL_MS: Readonly<Record<ShowcaseKind, number>> = {
  title: 2200,
  lights: 0,
  glide: 0,
  wait: 3000,
  reveal: 1600,
  finale: 2400,
  panels: 3600,
};

export function showcaseSteps(plates: number, reduced: boolean): ShowcaseStep[] {
  const timing = reduced ? STILL_MS : MOTION_MS;
  const step = (kind: ShowcaseKind, plate = -1): ShowcaseStep => ({ kind, plate, ms: timing[kind] });
  const unveil = Array.from({ length: plates }, (_, plate) => [
    ...(reduced ? [] : [step("glide", plate)]),
    step("wait", plate),
    step("reveal", plate),
  ]).flat();
  return [step("title"), ...(reduced ? [] : [step("lights")]), ...unveil, step("finale"), step("panels")];
}
