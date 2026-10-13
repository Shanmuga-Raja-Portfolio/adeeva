export const PRINTS = ["solid", "floral", "stripe", "dot", "check", "sparkle"] as const;
export type PrintId = (typeof PRINTS)[number];
