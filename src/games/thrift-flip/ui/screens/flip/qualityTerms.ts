import type { QualityTerm } from "../../../core";

export const QUALITY_LABELS: Readonly<Record<QualityTerm, string>> = {
  unpick: "Snipping",
  clean: "Scrubbing",
  cut: "Cutting",
  seams: "Sewing",
  grain: "Fabric lines",
  restored: "Fresh as new",
};

export const QUALITY_ORDER: readonly QualityTerm[] = ["unpick", "clean", "cut", "seams", "grain", "restored"];
