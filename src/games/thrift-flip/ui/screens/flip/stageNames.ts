import { runKind, runStages, type FlipRun, type FlipStage } from "../../../core";

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

const STAGE_TITLES: Readonly<Record<FlipStage, string>> = {
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

const TICKET_TITLES: Partial<Readonly<Record<FlipStage, string>>> = {
  brief: "A loved thing comes in",
  unpick: "Snip the old split",
  layout: "Lay the fresh hem band",
  sew: "Sew it closed",
  review: "Ready to hand it back",
};

export const ADVANCE_TO: Readonly<Record<FlipStage, string>> = {
  brief: "Back to the order",
  design: "Plan the flip",
  market: "Off to the rail",
  unpick: "To the workbench",
  clean: "Time to scrub",
  layout: "Lay out the pieces",
  cut: "Pick up the scissors",
  sew: "Off to the sewing machine",
  finish: "Add finishing touches",
  review: "Take a final look",
  done: "Hand it over",
};

export function stageTitle(run: FlipRun): string {
  return (runKind(run) === "flip" ? undefined : TICKET_TITLES[run.stage]) ?? STAGE_TITLES[run.stage];
}

export function craftStages(run: FlipRun): readonly FlipStage[] {
  return runStages(run).filter(
    (stage) => stage !== "done" && (stage !== "brief" || run.purpose.kind === "gig"),
  );
}
