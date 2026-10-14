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

export const PATH_SERVICE_KINDS = ["night", "festival", "launch"] as const;
export type PathServiceKind = (typeof PATH_SERVICE_KINDS)[number];

function pathService(railSize: number, tickets: number, maxDishesPerTicket: number): ServiceRules {
  return {
    wage: 0,
    bonusFee: 0,
    railSize,
    tickets,
    maxDishesPerTicket,
    ticketTargetSeconds: 65,
    serviceMinimum: 65,
    cuisinesPerShift: 0,
    helpers: 0,
  };
}

export const PATH_SERVICE: Readonly<Record<PathServiceKind, ServiceRules>> = {
  night: pathService(4, 10, 3),
  festival: pathService(3, 8, 2),
  launch: pathService(4, 6, 1),
};

export const PATH_RULES = {
  crossroadsReputation: 85,
  crossroadsPasses: 12,
  relaxedCostShare: 0.5,
  serviceHours: 6,
  segmentPrepHours: 2,
  segmentHours: 4,
  segmentsPerWeek: 2,
  segmentBaseFee: 120,
  segmentStarFee: 30,
  segmentClockSeconds: 480,
  segmentMinimum: 65,
  bookOfferSegments: 2,
  bookAdvance: 250,
  chapterFee: 150,
  menuMin: 4,
  menuMax: 8,
  menuCuisines: 2,
  menuTags: 3,
  parMax: 30,
  defaultPar: 8,
  truckMenu: 3,
  fridge: 40,
  festivalHelperFee: 25,
  baseSeats: 16,
  seatsPerCook: 6,
  hostlessSeats: 20,
  hostGuests: 3,
  platesPerGuest: 1.5,
  happyScore: 85,
  tipPerGuest: 2,
  seasonDays: 14,
  ribbonScore: 85,
  maxTeam: 4,
  maxNights: 4,
  crowdAppeal: 0.15,
  maxReviews: 9,
  maxNotes: 6,
  notesPerNight: 2,
  cleanTeamTarget: 1.1,
  warmingPassHold: 30,
} as const;
