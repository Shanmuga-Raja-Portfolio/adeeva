import type { RevealTimings } from "../../../../../ui/show/revealSteps";

export const REVEAL_TIMINGS: RevealTimings = {
  motion: { title: 2600, lights: 0, glide: 1800, wait: 3000, reveal: 1600, finale: 3800, panels: 4400 },
  still: { title: 2200, lights: 0, glide: 0, wait: 3000, reveal: 1800, finale: 2600, panels: 3800 },
  lights: false,
};
