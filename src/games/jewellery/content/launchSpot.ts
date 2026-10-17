export const LAUNCH_SPOT_NUMBERS = [1, 2, 3, 4] as const;
export type LaunchSpotNumber = (typeof LAUNCH_SPOT_NUMBERS)[number];

export interface LaunchSpotDef {
  readonly spot: LaunchSpotNumber;
  readonly name: string;
  readonly minPieces: number;
  readonly maxPieces: number;
  readonly readyMark: number;
  readonly budgetPerSeat: number;
}

export const LAUNCH_SPOTS: readonly LaunchSpotDef[] = [
  { spot: 1, name: "Lantern Corner", minPieces: 3, maxPieces: 3, readyMark: 72, budgetPerSeat: 8 },
  { spot: 2, name: "Fountain Steps", minPieces: 3, maxPieces: 4, readyMark: 74, budgetPerSeat: 9 },
  { spot: 3, name: "Arcade Stage", minPieces: 4, maxPieces: 5, readyMark: 76, budgetPerSeat: 10 },
  { spot: 4, name: "Grand Lantern Stage", minPieces: 5, maxPieces: 5, readyMark: 78, budgetPerSeat: 11 },
];
