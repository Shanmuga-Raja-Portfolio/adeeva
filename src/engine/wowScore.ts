import { average } from "./average";
import { clamp } from "./clamp";
import type { StyleTag } from "./styleTag";

export const WOW_TAGS: readonly StyleTag[] = ["bold", "dreamy", "regal"];
export const WOW_POINTS_PER_TRIM = 25;

export interface WowItem {
  readonly wowTrims: number;
  readonly tags: readonly StyleTag[];
}

export function hasWowTag(tags: readonly StyleTag[]): boolean {
  return tags.some((tag) => WOW_TAGS.includes(tag));
}

export function wowScore(items: readonly WowItem[]): number {
  if (items.length === 0) return 0;
  const trims = average(items.map((item) => item.wowTrims));
  const tagged = items.filter((item) => hasWowTag(item.tags)).length / items.length;
  return Math.round(0.5 * clamp(trims * WOW_POINTS_PER_TRIM, 0, 100) + 50 * tagged);
}
