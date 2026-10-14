export const RUN_STAGES = [
  "brief",
  "design",
  "timber",
  "layout",
  "saw",
  "join",
  "sand",
  "finish",
  "review",
  "done",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];
