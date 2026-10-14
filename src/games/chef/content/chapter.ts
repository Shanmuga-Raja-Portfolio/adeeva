import type { TasteTag } from "./tasteTag";

export const CHAPTER_IDS = [
  "weeknight-warmers",
  "festival-food",
  "fresh-and-bright",
  "around-the-hall",
] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface ChapterDef {
  readonly id: ChapterId;
  readonly title: string;
  readonly theme: string;
  readonly tags: readonly TasteTag[];
  readonly tips: readonly [string, string, string];
  readonly colour: string;
  readonly review: string;
}

export const CARDS_PER_CHAPTER = 3;

export const CHAPTERS: readonly ChapterDef[] = [
  {
    id: "weeknight-warmers",
    title: "Weeknight Warmers",
    theme: "Cosy, warming dishes for a busy evening.",
    tags: ["comforting", "warming", "hearty"],
    tips: [
      "Cook it together on a rainy day.",
      "Taste as you go, with a grown-up.",
      "Save a bowl for a neighbour.",
    ],
    colour: "#d9472b",
    review: "Clear pictures, kind tips and dishes worth cooking together.",
  },
  {
    id: "festival-food",
    title: "Festival Food",
    theme: "Bold, crunchy, colourful plates to share.",
    tags: ["bold", "crunchy", "smoky", "colourful"],
    tips: [
      "Share it with friends outside.",
      "Make it as colourful as you like.",
      "Cook it together for a party.",
    ],
    colour: "#f2a93b",
    review: "A chapter that feels like cooking beside a friend.",
  },
  {
    id: "fresh-and-bright",
    title: "Fresh & Bright",
    theme: "Fresh, zesty and gentle dishes.",
    tags: ["fresh", "zesty", "delicate"],
    tips: [
      "A squeeze of lime brightens it up.",
      "Pick the herbs together.",
      "Taste it, then taste it again.",
    ],
    colour: "#4f8a3c",
    review: "Every card says: cook with an adult, taste as you go. Lovely.",
  },
  {
    id: "around-the-hall",
    title: "Around the Hall",
    theme: "One dish from each of three different kitchens.",
    tags: [],
    tips: [
      "Ask who taught your family to cook.",
      "Try a kitchen that's new to you.",
      "Thank the cook who helped you.",
    ],
    colour: "#3d6fb4",
    review: "Simple, warm and welcoming. Young readers will enjoy it.",
  },
];
