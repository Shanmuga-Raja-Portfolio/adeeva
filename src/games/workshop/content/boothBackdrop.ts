export const BOOTH_BACKDROP_IDS = ["linen-drape", "bunting", "lantern-string"] as const;
export type BoothBackdropId = (typeof BOOTH_BACKDROP_IDS)[number];

export interface BoothBackdropDef {
  readonly id: BoothBackdropId;
  readonly name: string;
  readonly mood: string;
  readonly blurb: string;
}

export const BOOTH_BACKDROPS: readonly BoothBackdropDef[] = [
  { id: "linen-drape", name: "Linen drape", mood: "calm", blurb: "Soft cream linen hung in folds." },
  { id: "bunting", name: "Bunting", mood: "cheerful", blurb: "Bright flags strung corner to corner." },
  {
    id: "lantern-string",
    name: "Lantern string",
    mood: "cosy",
    blurb: "Paper lanterns with little electric lights.",
  },
];
