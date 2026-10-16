import type { RunStage } from "../../../content/runStage";

export const STAGE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Note",
  design: "Design",
  timber: "Timber",
  layout: "Boards",
  saw: "Saw",
  join: "Join",
  sand: "Sand",
  finish: "Finish",
  review: "Deliver",
  done: "Done",
};

export const STAGE_TITLES: Readonly<Record<RunStage, string>> = {
  brief: "The pinned note",
  design: "Design the piece",
  timber: "Pell's Timber Yard",
  layout: "Plan your boards",
  saw: "Saw the parts",
  join: "Join it together",
  sand: "Sand it smooth",
  finish: "Finish and extras",
  review: "Ready to deliver",
  done: "Delivered",
};

export const ADVANCE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Start designing",
  design: "To the timber yard",
  timber: "Plan the boards",
  layout: "To the sawhorses",
  saw: "Start joining",
  join: "Start sanding",
  sand: "Add a finish",
  finish: "Check it over",
  review: "Deliver",
  done: "Done",
};

export const SET_STAGE_TITLES: Readonly<Partial<Record<RunStage, string>>> = {
  brief: "Hattie's set card",
  design: "Design the set",
  review: "Ready for the floor",
  done: "On the showroom floor",
};
