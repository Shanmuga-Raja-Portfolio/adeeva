import type { RunStage } from "../../../core";

export const CRAFT_STAGES = [
  "brief",
  "sketch",
  "fabric",
  "cut",
  "assemble",
  "sew",
  "decorate",
  "review",
] as const satisfies readonly RunStage[];

export const STAGE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Brief",
  sketch: "Sketch",
  fabric: "Fabric",
  cut: "Cut",
  assemble: "Assemble",
  sew: "Sew",
  decorate: "Decorate",
  review: "Review",
  done: "Delivered",
};

export const STAGE_TITLES: Readonly<Record<RunStage, string>> = {
  brief: "Meet the brief",
  sketch: "Sketch the dress",
  fabric: "The fabric shop",
  cut: "Cutting table",
  assemble: "Dress form",
  sew: "Sewing machine",
  decorate: "Finishing touches",
  review: "Final fitting",
  done: "Delivered",
};

export const ADVANCE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Start sketching",
  sketch: "Finish the sketch",
  fabric: "Head to the cutting table",
  cut: "Take the panels to the form",
  assemble: "Off to the sewing machine",
  sew: "Time to decorate",
  decorate: "Final fitting",
  review: "Deliver",
  done: "Delivered",
};
