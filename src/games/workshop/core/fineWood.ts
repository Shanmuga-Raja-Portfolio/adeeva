import { hammersFor, type WoodId } from "../content/wood";
import { woodById } from "./catalog";

const FINE_WOOD_SHARE_PER_HAMMER = 0.15;
const FINE_WOOD_REPUTATION_HAMMERS = 3;

export function fineWoodBonus(fee: number, woodId: WoodId): number {
  const hammers = hammersFor(woodById(woodId));
  return Math.round(fee * FINE_WOOD_SHARE_PER_HAMMER * Math.max(0, hammers - 1));
}

export function fineWoodReputation(woodId: WoodId): number {
  return hammersFor(woodById(woodId)) >= FINE_WOOD_REPUTATION_HAMMERS ? 1 : 0;
}
