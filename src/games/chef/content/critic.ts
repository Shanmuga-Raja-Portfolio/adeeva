import type { AvatarLook } from "../../../engine/avatar";

export const CRITIC_IDS = ["ottoline-reyes", "barnaby-quill", "hazel-oduya"] as const;
export type CriticId = (typeof CRITIC_IDS)[number];

export interface CriticDef {
  readonly id: CriticId;
  readonly name: string;
  readonly outlet: string;
  readonly focus: string;
  readonly look: AvatarLook;
}

export const CRITICS: readonly CriticDef[] = [
  {
    id: "ottoline-reyes",
    name: "Ottoline Reyes",
    outlet: "The Larkspur Ledger",
    focus: "technique and food",
    look: { skinTone: "sand", hairStyle: "high-bun", hairColour: "dark-brown", outfit: "blazer" },
  },
  {
    id: "barnaby-quill",
    name: "Barnaby Quill",
    outlet: "Radio Larkspur",
    focus: "warmth and service",
    look: { skinTone: "peach", hairStyle: "pixie", hairColour: "auburn", outfit: "cardigan" },
  },
  {
    id: "hazel-oduya",
    name: "Hazel Oduya",
    outlet: "Market Hall Monthly",
    focus: "value and community",
    look: { skinTone: "espresso", hairStyle: "locs", hairColour: "black", outfit: "denim-jacket" },
  },
];

export const REVIEW_LINES = {
  foodHigh: "The {dish} was cooked with real care. Every bite was right.",
  foodGood: "The {dish} was good, honest cooking.",
  foodGentle: "The {dish} has a lovely idea in it. I'll be back to taste it again.",
  warm: "Plates came out warm and right on time.",
  slow: "Service was slow tonight, and the team stayed kind about it.",
  fair: "Fair prices for food this good.",
  dear: "A little dear tonight, though you can taste the care.",
} as const;
