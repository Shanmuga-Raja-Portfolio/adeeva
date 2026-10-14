export interface PlateMoment {
  readonly placed: number;
  readonly heroPlaced: boolean;
  readonly garnishesLeft: number;
  readonly inWell: boolean;
  readonly wiped: boolean;
  readonly assisted: boolean;
  readonly plated: boolean;
}

export const PLATE_LINES = {
  start: "Drag each part from the tray onto the plate.",
  ghost: "Drag each part onto its faint ghost spot.",
  hero: "Now drag the star of the dish onto the plate.",
  well: "Slide everything inside the well, away from the rim.",
  wipe: "Lovely! Now tap Wipe rim to clean the edge.",
  ready: "All set. Tap Plate it!",
  plated: "Plated! Tap Send it to the pass.",
} as const;

export function garnishesLeftLine(count: number): string {
  return `Add ${count} more ${count === 1 ? "garnish" : "garnishes"} to finish the look.`;
}

export function plateInstruction(moment: PlateMoment): string {
  if (moment.plated) return PLATE_LINES.plated;
  if (moment.placed === 0) return moment.assisted ? PLATE_LINES.ghost : PLATE_LINES.start;
  if (!moment.heroPlaced) return PLATE_LINES.hero;
  if (moment.garnishesLeft > 0) return garnishesLeftLine(moment.garnishesLeft);
  if (!moment.inWell) return PLATE_LINES.well;
  if (!moment.wiped) return PLATE_LINES.wipe;
  return PLATE_LINES.ready;
}
