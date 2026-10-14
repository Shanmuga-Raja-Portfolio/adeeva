import type { FlipRun, FlipStage } from "../../../core";

export const STAGE_LABELS: Readonly<Record<FlipStage, string>> = {
  brief: "Order",
  design: "Plan",
  market: "Rail",
  unpick: "Snip",
  clean: "Scrub",
  layout: "Lay out",
  cut: "Cut",
  sew: "Sew",
  finish: "Finish",
  review: "Review",
  done: "Done",
};

export const STAGE_TITLES: Readonly<Record<FlipStage, string>> = {
  brief: "Meet the order",
  design: "Plan the flip",
  market: "The market rail",
  unpick: "Snip old stitches",
  clean: "Scrub the stains",
  layout: "Lay out the pieces",
  cut: "Cutting table",
  sew: "Sewing machine",
  finish: "Finishing touches",
  review: "Ready to hand over",
  done: "All done",
};

export const ADVANCE_LABELS: Readonly<Record<FlipStage, string>> = {
  brief: "Plan the flip",
  design: "Off to the rail",
  market: "To the workbench",
  unpick: "Time to scrub",
  clean: "Lay out the pieces",
  layout: "Pick up the scissors",
  cut: "Off to the sewing machine",
  sew: "Add finishing touches",
  finish: "Take a final look",
  review: "Hand it over",
  done: "Done",
};

export function craftStages(run: FlipRun): readonly FlipStage[] {
  const all: readonly FlipStage[] = [
    "brief",
    "design",
    "market",
    "unpick",
    "clean",
    "layout",
    "cut",
    "sew",
    "finish",
    "review",
  ];
  return run.purpose.kind === "gig" ? all : all.filter((stage) => stage !== "brief");
}
