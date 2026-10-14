import type { StepKind } from "../content/dish";
import type { JarId } from "../content/seasoning";
import { jarById } from "./catalog";

export const CONSTRUCTION_LINE = "One step was left unfinished. Every step counts.";
export const HANDLED_LINE = "The team carried tonight. Let's cook more of it together tomorrow.";
export const SLOW_TICKETS_LINE = "Tickets ran a bit slow. Start the slow pan first.";
export const TEAM_FINISH_LINE = "Team effort! Everyone got fed.";

export interface StepDetail {
  readonly chopHeld: boolean;
  readonly sizzleHeatFit: number;
  readonly sizzleCrispy: boolean;
  readonly simmerFollow: number;
  readonly simmerLevel: number;
  readonly tasteJar: JarId | null;
  readonly plateInWell: number;
  readonly plateWiped: boolean;
}

export function stepLine(step: StepKind, detail: StepDetail): string {
  switch (step) {
    case "chop":
      return detail.chopHeld
        ? "The green stretch slipped a little. Hold right to its end."
        : "The beat ran ahead a little. Tap as the mark meets the line.";
    case "sizzle":
      if (detail.sizzleHeatFit < 1) return "Try the heat dots printed on the dish card.";
      return detail.sizzleCrispy
        ? "One piece went extra-crispy. Flip a bit sooner."
        : "One piece stayed a little pale. Give it a moment longer.";
    case "simmer":
      return detail.simmerLevel < detail.simmerFollow
        ? "Stop right on the line next time."
        : "The guide spoon got away a little. Steady circles next time.";
    case "taste":
      return detail.tasteJar === null
        ? "Taste a little more often to find the balance."
        : `A pinch of ${jarById(detail.tasteJar).name.toLowerCase()} would have balanced it.`;
    case "plate":
      if (detail.plateInWell < 1) return "Keep everything inside the well.";
      return detail.plateWiped
        ? "Give every piece its own space on the plate."
        : "A wipe of the rim makes it shine.";
  }
}

export function fitLine(missingTags: readonly string[], avoided: readonly string[]): string {
  if (avoided.length > 0) return `They're not a fan of ${avoided.join(" or ").toLowerCase()}.`;
  return `They hoped for something more ${missingTags.join(" and ")}.`;
}

export function garnishLine(count: number): string {
  return `So close! The order asked for ${count} ${count === 1 ? "garnish" : "garnishes"}.`;
}
