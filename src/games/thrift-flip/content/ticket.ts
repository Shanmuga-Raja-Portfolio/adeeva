import type { ColourId } from "../../../engine/palette";
import type { TraitId } from "../../../engine/trait";
import type { ClientLines } from "./client";
import type { ConditionGrade } from "./condition";
import type { FindId } from "./find";

export const TICKET_KINDS = ["mend", "alter"] as const;
export type TicketKind = (typeof TICKET_KINDS)[number];

export const TICKET_IDS = [
  "ticket-nana-bea",
  "ticket-juniper-wren",
  "ticket-lumi",
  "ticket-kofi",
  "ticket-theo",
  "ticket-ms-okafor",
  "ticket-mr-halvorsen",
  "ticket-rosa-and-june",
] as const;
export type TicketId = (typeof TICKET_IDS)[number];

export const TICKET_BUDGET = 3;
export const HEM_BAND = { width: 40, height: 8 } as const;
export const HEM_EDGE_CM = 2;

export interface TicketStainDef {
  readonly panel: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

export interface TicketDef {
  readonly id: TicketId;
  readonly clientId: string;
  readonly kind: TicketKind;
  readonly item: string;
  readonly findId: FindId;
  readonly grade: ConditionGrade;
  readonly line: number;
  readonly stain: TicketStainDef | null;
  readonly wornSpot: 0 | 1 | null;
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly fee: readonly [number, number];
  readonly deadlineDays: readonly [number, number];
  readonly minQuality: number;
  readonly favouredColours: readonly [ColourId, ColourId];
}

export const TICKET_LINES: Readonly<Record<TicketKind, ClientLines>> = {
  mend: {
    request: "My [item] has come apart. Could you mend it?",
    delighted: "It's back in use! Thank you so much.",
    nearMiss: "It holds! A tiny bit wobbly, but I love it.",
  },
  alter: {
    request: "My [item] has gone frayed. A fresh hem, please?",
    delighted: "A fresh hem! Ready for years more.",
    nearMiss: "Thank you! The hem wobbles just a little.",
  },
};

export const TICKETS: readonly TicketDef[] = [
  {
    id: "ticket-nana-bea",
    clientId: "nana-bea",
    kind: "mend",
    item: "blazer elbow",
    findId: "wool-blazer",
    grade: "loved",
    line: 3,
    stain: { panel: 0, cx: 25, cy: 30, radius: 7 },
    wornSpot: null,
    minReputation: 40,
    fee: [14, 18],
    deadlineDays: [2, 3],
    minQuality: 62,
    favouredColours: ["sage", "mustard"],
  },
  {
    id: "ticket-juniper-wren",
    clientId: "juniper-wren",
    kind: "mend",
    item: "jeans pocket",
    findId: "faded-jeans",
    grade: "loved",
    line: 2,
    stain: { panel: 0, cx: 30, cy: 40, radius: 7 },
    wornSpot: null,
    minReputation: 40,
    fee: [14, 18],
    deadlineDays: [2, 3],
    minQuality: 62,
    favouredColours: ["blush", "sky"],
  },
  {
    id: "ticket-lumi",
    clientId: "lumi",
    kind: "mend",
    item: "painting-shirt cuff",
    findId: "gingham-shirt",
    grade: "loved",
    line: 2,
    stain: { panel: 0, cx: 27, cy: 35, radius: 7 },
    wornSpot: null,
    minReputation: 40,
    fee: [16, 20],
    deadlineDays: [2, 3],
    minQuality: 64,
    favouredColours: ["coral", "mustard"],
  },
  {
    id: "ticket-kofi",
    clientId: "kofi",
    kind: "mend",
    item: "track-jacket cuff",
    findId: "track-jacket",
    grade: "loved",
    line: 2,
    stain: { panel: 1, cx: 25, cy: 30, radius: 7 },
    wornSpot: null,
    minReputation: 40,
    fee: [16, 22],
    deadlineDays: [2, 3],
    minQuality: 66,
    favouredColours: ["navy", "emerald"],
  },
  {
    id: "ticket-theo",
    clientId: "theo",
    kind: "mend",
    item: "jacket seam",
    findId: "denim-jacket",
    grade: "loved",
    line: 3,
    stain: { panel: 0, cx: 27, cy: 30, radius: 7 },
    wornSpot: null,
    minReputation: 40,
    fee: [16, 22],
    deadlineDays: [2, 3],
    minQuality: 64,
    favouredColours: ["navy", "mustard"],
  },
  {
    id: "ticket-ms-okafor",
    clientId: "ms-okafor",
    kind: "alter",
    item: "skirt hem",
    findId: "party-skirt",
    grade: "tired",
    line: 1,
    stain: null,
    wornSpot: 0,
    minReputation: 40,
    fee: [20, 26],
    deadlineDays: [3, 4],
    minQuality: 72,
    favouredColours: ["navy", "teal"],
  },
  {
    id: "ticket-mr-halvorsen",
    clientId: "mr-halvorsen",
    kind: "alter",
    item: "trouser hem",
    findId: "linen-trousers",
    grade: "tired",
    line: 2,
    stain: null,
    wornSpot: 1,
    traitGate: "perfectionist",
    minReputation: 40,
    fee: [22, 28],
    deadlineDays: [3, 4],
    minQuality: 74,
    favouredColours: ["charcoal", "navy"],
  },
  {
    id: "ticket-rosa-and-june",
    clientId: "rosa-and-june",
    kind: "alter",
    item: "coat hem",
    findId: "duffle-coat",
    grade: "tired",
    line: 3,
    stain: null,
    wornSpot: 0,
    minReputation: 44,
    fee: [22, 28],
    deadlineDays: [3, 4],
    minQuality: 70,
    favouredColours: ["plum", "teal"],
  },
];
