import type { AvatarLook } from "../../../engine/avatar";
import type { TraitId } from "../../../engine/trait";
import type { ExtraNeed } from "./extra";
import type { ProductId } from "./product";
import type { ShadeId } from "./shade";
import type { WoodId } from "./wood";
import type { WoodTag } from "./woodTag";

export const DELIVERY_SCENES = ["garden", "bedroom", "cafe", "library"] as const;
export type DeliveryScene = (typeof DELIVERY_SCENES)[number];

export interface BriefTemplate {
  readonly occasion: string;
  readonly products: readonly ProductId[];
  readonly requiredTags: readonly WoodTag[];
  readonly favouredColours: readonly ShadeId[];
  readonly avoidColours: readonly ShadeId[];
  readonly avoidWoods: readonly WoodId[];
  readonly requiredExtras: readonly ExtraNeed[];
  readonly budget: readonly [number, number];
  readonly fee: readonly [number, number];
  readonly deadlineDays: readonly [number, number];
  readonly minQuality: number;
}

export interface ClientLines {
  readonly request: string;
  readonly delighted: string;
  readonly nearMiss: string;
}

export interface ClientDef {
  readonly id: string;
  readonly name: string;
  readonly relation: string;
  readonly payer: string | null;
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly look: AvatarLook;
  readonly scene: DeliveryScene;
  readonly brief: BriefTemplate;
  readonly lines: ClientLines;
}

export const FIRST_CLIENT_ID = "grandpa-teodor";

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "grandpa-teodor",
    name: "Grandpa Teodor",
    relation: "Feeds every bird on the street",
    payer: null,
    minReputation: 0,
    look: { skinTone: "sand", hairStyle: "pixie", hairColour: "platinum", outfit: "cardigan" },
    scene: "garden",
    brief: {
      occasion: "A home for the robins",
      products: ["birdhouse"],
      requiredTags: ["natural"],
      favouredColours: ["honey-wood", "sage", "sky"],
      avoidColours: ["navy"],
      avoidWoods: [],
      requiredExtras: [],
      budget: [20, 30],
      fee: [35, 45],
      deadlineDays: [3, 5],
      minQuality: 55,
    },
    lines: {
      request: "The robins need a new home. Nothing fancy, just honest wood.",
      delighted: "Look, a robin is already peeking in! Wonderful.",
      nearMiss: "A fine little house. The birds won't mind a wobble.",
    },
  },
  {
    id: "cousin-milo",
    name: "Cousin Milo",
    relation: "Age 6, owner of many toys. Aunt Noor pays and picks it up",
    payer: "Aunt Noor",
    minReputation: 0,
    look: { skinTone: "chestnut", hairStyle: "curly-puff", hairColour: "black", outfit: "dungarees" },
    scene: "bedroom",
    brief: {
      occasion: "A chest for the dinosaurs",
      products: ["toy-chest"],
      requiredTags: ["playful"],
      favouredColours: ["coral", "sky", "mustard"],
      avoidColours: ["dark-wood"],
      avoidWoods: [],
      requiredExtras: [{ extra: "name-plaque", count: 1 }],
      budget: [50, 65],
      fee: [55, 70],
      deadlineDays: [4, 6],
      minQuality: 55,
    },
    lines: {
      request: "I need a chest for my dinosaurs. A bright one with my name!",
      delighted: "My name! It's the best box in the world!",
      nearMiss: "I love it! The lid is a tiny bit wiggly.",
    },
  },
  {
    id: "mrs-adaeze",
    name: "Mrs. Adaeze",
    relation: "Neighbour with the jungle balcony",
    payer: null,
    minReputation: 0,
    look: { skinTone: "cocoa", hairStyle: "high-bun", hairColour: "dark-brown", outfit: "denim-jacket" },
    scene: "garden",
    brief: {
      occasion: "Room for the ferns to grow",
      products: ["plant-stand"],
      requiredTags: ["natural", "cosy"],
      favouredColours: ["honey-wood", "sage", "teal"],
      avoidColours: ["black"],
      avoidWoods: [],
      requiredExtras: [],
      budget: [25, 35],
      fee: [45, 60],
      deadlineDays: [4, 6],
      minQuality: 58,
    },
    lines: {
      request: "My ferns want to be taller. Could you make them a stand?",
      delighted: "My plants look like they're on a stage. Thank you!",
      nearMiss: "It holds them nicely. A few rough spots, but I'm happy.",
    },
  },
  {
    id: "ms-ingrid",
    name: "Ms. Ingrid",
    relation: "Children's librarian",
    payer: null,
    minReputation: 4,
    look: { skinTone: "porcelain", hairStyle: "short-bob", hairColour: "auburn", outfit: "blazer" },
    scene: "library",
    brief: {
      occasion: "A shelf for picture books",
      products: ["bookshelf"],
      requiredTags: ["classic", "sturdy"],
      favouredColours: ["pale-wood", "honey-wood", "navy"],
      avoidColours: ["coral"],
      avoidWoods: [],
      requiredExtras: [{ extra: "wood-knob", count: 2 }],
      budget: [30, 45],
      fee: [60, 80],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request: "Picture books need a strong shelf. Classic and sturdy, please.",
      delighted: "The reading corner finally feels finished. Marvellous.",
      nearMiss: "It's very kind. One shelf sits a little crooked.",
    },
  },
  {
    id: "rosalind",
    name: "Rosalind",
    relation: "Runs the Corner Cup café",
    payer: null,
    minReputation: 8,
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "brown", outfit: "studio-apron" },
    scene: "cafe",
    brief: {
      occasion: "A bench for the café window",
      products: ["window-bench"],
      requiredTags: ["cosy"],
      favouredColours: ["blush", "sage", "honey-wood"],
      avoidColours: ["charcoal"],
      avoidWoods: [],
      requiredExtras: [],
      budget: [50, 70],
      fee: [75, 95],
      deadlineDays: [5, 7],
      minQuality: 68,
    },
    lines: {
      request: "My window seat needs a bench. Warm and comfy, please.",
      delighted: "Customers keep asking to sit there. It's perfect.",
      nearMiss: "It's lovely! A couple of joints could be snugger.",
    },
  },
  {
    id: "mr-desmond",
    name: "Mr. Desmond",
    relation: "Retired ferry captain",
    payer: null,
    minReputation: 12,
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "platinum", outfit: "blazer" },
    scene: "bedroom",
    brief: {
      occasion: "A table by the bed",
      products: ["bedside-table"],
      requiredTags: ["elegant"],
      favouredColours: ["red-wood", "dark-wood", "gold"],
      avoidColours: ["pale-wood"],
      avoidWoods: [],
      requiredExtras: [{ extra: "brass-knob", count: 1 }],
      budget: [45, 70],
      fee: [90, 110],
      deadlineDays: [5, 7],
      minQuality: 72,
    },
    lines: {
      request: "A bedside table, please. Something with a bit of polish.",
      delighted: "Shipshape and handsome. I'm very pleased.",
      nearMiss: "Good work. The top could be a touch smoother.",
    },
  },
  {
    id: "luna",
    name: "Luna",
    relation: "Paints murals on garden walls",
    payer: null,
    traitGate: "dreamer",
    minReputation: 6,
    look: { skinTone: "honey", hairStyle: "locs", hairColour: "lilac", outfit: "dungarees" },
    scene: "garden",
    brief: {
      occasion: "Something from the night sky",
      products: ["step-stool", "plant-stand"],
      requiredTags: ["playful", "elegant"],
      favouredColours: ["lavender", "navy", "gold"],
      avoidColours: [],
      avoidWoods: [],
      requiredExtras: [{ extra: "star-stencil", count: 2 }],
      budget: [30, 45],
      fee: [85, 105],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request: "I want a stool that looks like it fell from the night sky.",
      delighted: "It looks like a piece of the night sky. I'm painting it into my mural!",
      nearMiss: "Almost magic! Maybe a few more stars next time.",
    },
  },
  {
    id: "mr-lindqvist",
    name: "Mr. Lindqvist",
    relation: "Clock repairer two doors down",
    payer: null,
    traitGate: "perfectionist",
    minReputation: 8,
    look: { skinTone: "peach", hairStyle: "short-bob", hairColour: "blonde", outfit: "cardigan" },
    scene: "library",
    brief: {
      occasion: "A chest for small tools",
      products: ["toy-chest"],
      requiredTags: ["classic"],
      favouredColours: ["dark-wood", "honey-wood"],
      avoidColours: [],
      avoidWoods: ["pine", "spruce"],
      requiredExtras: [
        { extra: "brass-hinge", count: 2 },
        { extra: "brass-knob", count: 1 },
      ],
      budget: [70, 95],
      fee: [100, 120],
      deadlineDays: [5, 7],
      minQuality: 82,
    },
    lines: {
      request: "I need a chest for my small tools. Every joint must be true.",
      delighted: "Tight as a good clock. I could not have done better.",
      nearMiss: "Good effort. Patience makes joints tighter.",
    },
  },
];
