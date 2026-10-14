import { START_REPUTATION } from "./startReputation";

export const RUNG_IDS = ["student", "line", "sous", "head"] as const;
export type RungId = (typeof RUNG_IDS)[number];

export const START_IDS = ["student", "head"] as const;
export type StartId = (typeof START_IDS)[number];

export interface ServiceRules {
  readonly wage: number;
  readonly bonusFee: number;
  readonly railSize: number;
  readonly tickets: number;
  readonly maxDishesPerTicket: number;
  readonly ticketTargetSeconds: number;
  readonly serviceMinimum: number;
  readonly cuisinesPerShift: number;
  readonly helpers: number;
}

export interface RungDef {
  readonly id: RungId;
  readonly name: string;
  readonly place: string;
  readonly home: string;
  readonly goal: string;
  readonly rent: number;
  readonly service: ServiceRules | null;
}

export const RUNGS: readonly RungDef[] = [
  {
    id: "student",
    name: "Cookery Student",
    place: "Larkspur Cookery School",
    home: "a shared flat",
    goal: "Take one lesson with each of the six mentors.",
    rent: 40,
    service: null,
  },
  {
    id: "line",
    name: "Line Cook",
    place: "Larkspur Market Hall",
    home: "a room above the Hall",
    goal: "Earn a regular spot on the line.",
    rent: 90,
    service: {
      wage: 20,
      bonusFee: 20,
      railSize: 2,
      tickets: 6,
      maxDishesPerTicket: 2,
      ticketTargetSeconds: 75,
      serviceMinimum: 55,
      cuisinesPerShift: 1,
      helpers: 0,
    },
  },
  {
    id: "sous",
    name: "Sous Chef",
    place: "Market Hall, Main Kitchen",
    home: "a room above the Hall",
    goal: "Lead a shift and create daily specials.",
    rent: 120,
    service: {
      wage: 30,
      bonusFee: 30,
      railSize: 3,
      tickets: 8,
      maxDishesPerTicket: 2,
      ticketTargetSeconds: 70,
      serviceMinimum: 60,
      cuisinesPerShift: 2,
      helpers: 1,
    },
  },
  {
    id: "head",
    name: "Head Chef",
    place: "Market Hall, Main Kitchen",
    home: "a flat on Willow Row",
    goal: "Run the Hall's menu.",
    rent: 150,
    service: {
      wage: 45,
      bonusFee: 45,
      railSize: 4,
      tickets: 10,
      maxDishesPerTicket: 3,
      ticketTargetSeconds: 65,
      serviceMinimum: 65,
      cuisinesPerShift: 0,
      helpers: 2,
    },
  },
];

export const CAREER = {
  title: "Six Kitchens",
  startCoins: 60,
  headStart: { coins: 300, reputation: 60, mastery: 4 },
  startReputation: START_REPUTATION,
  potWashName: "Washing pots at the Hall",
  potWashPay: 30,
  lessonFee: [20, 30],
  lessonMinimum: 55,
  graduationAverage: 66,
  stationMinimum: 72,
  tastingMinimum: 78,
  testReputation: 3,
  dishHours: 4,
  testDishHours: 3,
  shiftHours: 6,
  stationTestTickets: 4,
  serviceSeconds: 240,
  challengingServiceSeconds: 200,
  confidentMastery: 4,
  expertMastery: 10,
  shiftOffersPerDay: 2,
  menuSize: 6,
  diarySize: 40,
} as const;

export const LESSON_ORDER = ["indian", "italian", "japanese", "mexican", "french", "west-african"] as const;

export const TEST_IDS = ["graduation", "station", "tasting"] as const;
export type TestId = (typeof TEST_IDS)[number];

export interface TestDef {
  readonly id: TestId;
  readonly name: string;
  readonly rung: RungId;
  readonly host: string;
  readonly pitch: string;
}

export const TESTS: readonly TestDef[] = [
  {
    id: "graduation",
    name: "Graduation Practical",
    rung: "student",
    host: "Wen",
    pitch: "Cook three dishes from three cuisines. Your average needs to reach the mark.",
  },
  {
    id: "station",
    name: "Station Test",
    rung: "line",
    host: "Rafael",
    pitch: "Run one counter on your own for a four-ticket service.",
  },
  {
    id: "tasting",
    name: "Tasting Day",
    rung: "sous",
    host: "Hollis",
    pitch: "A small plate, a main and a side from three cuisines. Each plate needs to reach the mark.",
  },
];
