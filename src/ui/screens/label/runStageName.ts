import type { RunStage } from "../../../core";

const STAGE_NAMES: Record<RunStage, string> = {
  brief: "Reading the brief",
  sketch: "Sketching",
  fabric: "Choosing fabric",
  cut: "Cutting",
  assemble: "On the dress form",
  sew: "Sewing",
  decorate: "Adding trims",
  review: "Final review",
  done: "Finished",
};

export function runStageName(stage: RunStage): string {
  return STAGE_NAMES[stage];
}
