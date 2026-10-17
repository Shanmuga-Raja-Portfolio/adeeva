import { revealSteps, type RevealStep, type RevealTimings } from "../../../../../ui/show/revealSteps";

const SHOWCASE_TIMINGS: RevealTimings = {
  motion: { title: 2600, lights: 1600, glide: 1800, wait: 3000, reveal: 1500, finale: 3600, panels: 4200 },
  still: { title: 2200, lights: 0, glide: 0, wait: 3000, reveal: 1600, finale: 2400, panels: 3600 },
  lights: true,
};

export interface ShowcaseStep extends RevealStep {
  readonly plate: number;
}

export function showcaseSteps(plates: number, reduced: boolean): ShowcaseStep[] {
  return revealSteps(plates, reduced, SHOWCASE_TIMINGS).map((step) => ({ ...step, plate: step.slot }));
}
