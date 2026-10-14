export interface CareerDef {
  readonly name: string;
  readonly workshopName: string;
  readonly street: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly landlord: string;
  readonly shiftName: string;
  readonly shiftPay: number;
}

export const CAREER: CareerDef = {
  name: "Garage Workshop Maker",
  workshopName: "the Garage on Larkspur Road",
  street: "Larkspur Road",
  startCoins: 100,
  startReputation: 0,
  weeklyRent: 100,
  landlord: "Uncle Bram",
  shiftName: "Sweeping at Pell's Timber Yard",
  shiftPay: 30,
};
