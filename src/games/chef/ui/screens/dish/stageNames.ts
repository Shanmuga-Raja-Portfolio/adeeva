import type { CookStepKind } from "../../../content/dish";
import type { DishRun } from "../../../core";

export const COOK_STEP_NAMES: Readonly<Record<CookStepKind, string>> = {
  chop: "Chop",
  sizzle: "Sizzle",
  simmer: "Simmer",
  taste: "Taste",
};

export const STATION_TITLES: Readonly<Record<CookStepKind, string>> = {
  chop: "The Board",
  sizzle: "The Hob",
  simmer: "The Pot",
  taste: "The Spice Shelf",
};

export function purposeLabel(run: DishRun): string {
  switch (run.purpose.kind) {
    case "lesson":
      return "Lesson";
    case "test":
      return run.purpose.test === "graduation" ? "Graduation Practical" : "Tasting Day";
    case "order":
      return "Private order";
    case "practice":
      return "Practice kitchen";
    case "segment":
      return "Spoon & Story";
  }
}
