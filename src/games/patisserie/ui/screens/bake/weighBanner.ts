import type { PourState } from "./weighPour";

export type WeighBannerTone = "ready" | "pouring" | "green" | "over" | "done" | "great";

export interface WeighBannerInput {
  readonly pour: PourState;
  readonly target: number;
  readonly band: number;
  readonly unit: string;
  readonly piece: boolean;
  readonly covered: boolean;
  readonly verdict: string | null;
  readonly great: boolean;
}

export interface WeighBanner {
  readonly text: string;
  readonly tone: WeighBannerTone;
}

export function weighBanner({
  pour,
  target,
  band,
  unit,
  piece,
  covered,
  verdict,
  great,
}: WeighBannerInput): WeighBanner {
  const inZone = Math.abs(pour.grams - target) <= target * band;
  const over = pour.grams > target * (1 + band);
  if (pour.emptied) return { text: "The bag is empty!", tone: "over" };
  if (pour.holding) {
    if (!covered && inZone) return { text: "In the green! Let go now!", tone: "green" };
    if (!covered && over) return { text: "Too much! Let go!", tone: "over" };
    return { text: `Pouring… stop near ${target} ${unit}`, tone: "pouring" };
  }
  if (pour.settleLeft > 0) return { text: "The scale keeps going after you let go!", tone: "pouring" };
  if (verdict !== null) return { text: verdict, tone: great ? "great" : "done" };
  if (piece) return { text: `Tap to add, up to ${target} ${unit}`, tone: "ready" };
  return { text: `Hold the button to pour ${target} ${unit}`, tone: "ready" };
}
