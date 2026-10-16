export const FAIR_BOOTH_NUMBERS = [1, 2, 3, 4] as const;
export type FairBoothNumber = (typeof FAIR_BOOTH_NUMBERS)[number];

export interface FairBoothDef {
  readonly number: FairBoothNumber;
  readonly name: string;
  readonly minPieces: number;
  readonly maxPieces: number;
  readonly readyMark: number;
}

export const FAIR_BOOTHS: readonly FairBoothDef[] = [
  { number: 1, name: "Corner Stall", minPieces: 2, maxPieces: 2, readyMark: 72 },
  { number: 2, name: "Green Pitch", minPieces: 2, maxPieces: 3, readyMark: 74 },
  { number: 3, name: "Big Canopy", minPieces: 3, maxPieces: 3, readyMark: 76 },
  { number: 4, name: "Oak Pavilion", minPieces: 3, maxPieces: 4, readyMark: 78 },
];
