export const CUE_KINDS = ["ready", "chop", "sizzle", "simmer", "taste", "plate"] as const;
export type CueKind = (typeof CUE_KINDS)[number];

export interface CueTip {
  readonly text: string;
  readonly kind: boolean;
}

export interface CueCardDef {
  readonly id: CueKind;
  readonly label: string;
  readonly tips: readonly [CueTip, CueTip, CueTip];
}

export const CUE_CARDS: readonly CueCardDef[] = [
  {
    id: "ready",
    label: "Get ready",
    tips: [
      { text: "Put every ingredient in a little bowl first.", kind: true },
      { text: "Get things out as you go along.", kind: false },
      { text: "Do the steps in any order.", kind: false },
    ],
  },
  {
    id: "chop",
    label: "Chop on the beat",
    tips: [
      { text: "Cut it into some pieces.", kind: false },
      { text: "Ask an adult to do the chopping with you.", kind: true },
      { text: "Make the bits any size you like.", kind: false },
    ],
  },
  {
    id: "sizzle",
    label: "Sizzle in the pan",
    tips: [
      { text: "Cook it for a while.", kind: false },
      { text: "Turn it over at some point.", kind: false },
      { text: "Watch for golden and ask your adult when to turn it.", kind: true },
    ],
  },
  {
    id: "simmer",
    label: "Simmer and stir",
    tips: [
      { text: "Stir in slow, steady circles, like drawing.", kind: true },
      { text: "Give it a stir now and then.", kind: false },
      { text: "Stir it any way you like.", kind: false },
    ],
  },
  {
    id: "taste",
    label: "Taste and season",
    tips: [
      { text: "Season it until it seems right.", kind: false },
      { text: "If it's too warm, a squeeze of lime helps.", kind: true },
      { text: "Add a bit of this and that.", kind: false },
    ],
  },
  {
    id: "plate",
    label: "Plate it",
    tips: [
      { text: "Put it on a plate somehow.", kind: false },
      { text: "Any plate will do.", kind: false },
      { text: "Wipe the rim so the plate looks cared for.", kind: true },
    ],
  },
];
