export type LevelSpot = "above" | "on" | "past";

export interface SimmerMoment {
  readonly progress: number;
  readonly stirring: boolean;
  readonly stopped: boolean;
  readonly assisted: boolean;
  readonly spot: LevelSpot;
}

export const SIMMER_LINES = {
  start: "Press and hold, then follow the glowing spoon.",
  resume: "Press and hold to keep stirring with the glow.",
  stir: "Keep your spoon in the glow. Stop on the line.",
  onLine: "On the line! Tap Off the heat now.",
  pastLine: "Past the line. Tap Off the heat now.",
  assistStart: "Press and follow the glow. The pot stops itself.",
  assistStir: "Keep your spoon in the glow. The pot stops itself.",
  stopped: "Off the heat. Nicely done!",
} as const;

export const LEVEL_LABELS: Readonly<Record<LevelSpot, string>> = {
  above: "Above the line",
  on: "On the line!",
  past: "Past the line",
};

export function levelSpot(level: number, target: number, band: number): LevelSpot {
  if (Math.abs(level - target) <= band) return "on";
  return level > target ? "above" : "past";
}

export function simmerInstruction({ progress, stirring, stopped, assisted, spot }: SimmerMoment): string {
  if (stopped) return SIMMER_LINES.stopped;
  if (assisted) return stirring ? SIMMER_LINES.assistStir : SIMMER_LINES.assistStart;
  if (spot === "on") return SIMMER_LINES.onLine;
  if (spot === "past") return SIMMER_LINES.pastLine;
  if (stirring) return SIMMER_LINES.stir;
  return progress > 0 ? SIMMER_LINES.resume : SIMMER_LINES.start;
}
