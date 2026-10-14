import type { AvatarLook } from "../../../engine/avatar";
import type { TraitId } from "../../../engine/trait";
import type { CharmId, ChainId } from "./extra";
import type { JewelColour } from "./jewelColour";
import type { JewelTag } from "./jewelTag";
import type { MetalId } from "./metal";
import type { ProductId } from "./product";

export const DELIVERY_SCENES = ["kitchen", "shop", "foyer", "garden"] as const;
export type DeliveryScene = (typeof DELIVERY_SCENES)[number];

export interface ExtraRequirement {
  readonly extraId: CharmId | ChainId;
  readonly count: number;
}

export interface BriefTemplate {
  readonly occasion: string;
  readonly productId: ProductId;
  readonly requiredTags: readonly JewelTag[];
  readonly favouredColours: readonly JewelColour[];
  readonly avoidColours: readonly JewelColour[];
  readonly avoidMetals: readonly MetalId[];
  readonly requiredExtras: readonly ExtraRequirement[];
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
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly look: AvatarLook;
  readonly scene: DeliveryScene;
  readonly avoidNote: string;
  readonly brief: BriefTemplate;
  readonly lines: ClientLines;
}

export const FIRST_CLIENT_ID = "gran-mina";

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "gran-mina",
    name: "Gran Mina",
    relation: "Keeps every button in a biscuit tin",
    minReputation: 0,
    look: { skinTone: "sand", hairStyle: "high-bun", hairColour: "platinum", outfit: "cardigan" },
    scene: "kitchen",
    avoidNote: "Black feels too gloomy for Sundays.",
    brief: {
      occasion: "A pendant for Sundays",
      productId: "stone-pendant",
      requiredTags: ["classic"],
      favouredColours: ["ruby", "ivory", "gold"],
      avoidColours: ["black"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [20, 30],
      fee: [35, 45],
      deadlineDays: [3, 5],
      minQuality: 55,
    },
    lines: {
      request: "A little pendant, please. Something I can wear every Sunday.",
      delighted: "It's perfect. I'm wearing it to tea right now.",
      nearMiss: "Lovely, dear. One little claw looks shy.",
    },
  },
  {
    id: "dev",
    name: "Dev",
    relation: "Skates past the arcade every morning",
    minReputation: 0,
    look: { skinTone: "chestnut", hairStyle: "pixie", hairColour: "black", outfit: "denim-jacket" },
    scene: "shop",
    avoidNote: "Blush isn't his colour this time.",
    brief: {
      occasion: "A tough-looking ring",
      productId: "stack-ring",
      requiredTags: ["bold"],
      favouredColours: ["charcoal", "copper", "bronze"],
      avoidColours: ["blush"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [10, 20],
      fee: [35, 45],
      deadlineDays: [3, 5],
      minQuality: 55,
    },
    lines: {
      request: "I want a ring that looks tough. Bold, not shiny-shiny.",
      delighted: "That's so cool. My whole crew wants one now.",
      nearMiss: "It's good! The edge is a bit rough.",
    },
  },
  {
    id: "kiko",
    name: "Kiko",
    relation: "Turning nine, with her dad, Mr. Tanabe",
    minReputation: 0,
    look: { skinTone: "porcelain", hairStyle: "ponytail", hairColour: "black", outfit: "dungarees" },
    scene: "kitchen",
    avoidNote: "Charcoal reminds her of rainy days.",
    brief: {
      occasion: "Kiko's ninth birthday",
      productId: "charm-bracelet",
      requiredTags: ["playful"],
      favouredColours: ["sky", "coral", "lavender"],
      avoidColours: ["charcoal"],
      avoidMetals: [],
      requiredExtras: [{ extraId: "star-charm", count: 1 }],
      budget: [15, 25],
      fee: [40, 50],
      deadlineDays: [4, 6],
      minQuality: 55,
    },
    lines: {
      request: "Can I have a bracelet with charms? It's my birthday!",
      delighted: "It jingles! It's the best present ever!",
      nearMiss: "I love it! One charm is a tiny bit wobbly.",
    },
  },
  {
    id: "aunt-lucia",
    name: "Aunt Lucía",
    relation: "Opening a flower shop",
    minReputation: 3,
    look: { skinTone: "honey", hairStyle: "long-waves", hairColour: "auburn", outfit: "studio-apron" },
    scene: "shop",
    avoidNote: "Gold feels too fancy among the flowerpots.",
    brief: {
      occasion: "A leafy pendant for the shop",
      productId: "shape-pendant",
      requiredTags: ["nature"],
      favouredColours: ["sage", "emerald", "copper"],
      avoidColours: [],
      avoidMetals: ["gold"],
      requiredExtras: [{ extraId: "silk-cord", count: 1 }],
      budget: [15, 25],
      fee: [45, 60],
      deadlineDays: [4, 6],
      minQuality: 60,
    },
    lines: {
      request: "Something leafy for my new shop. I'll wear it every day.",
      delighted: "It looks like it grew in my window box. Thank you!",
      nearMiss: "Very sweet. A few spots could shine more.",
    },
  },
  {
    id: "ms-saoirse",
    name: "Ms. Saoirse",
    relation: "The school music teacher",
    minReputation: 6,
    look: { skinTone: "peach", hairStyle: "short-bob", hairColour: "auburn", outfit: "blazer" },
    scene: "foyer",
    avoidNote: "Coral clashes with the choir robes.",
    brief: {
      occasion: "Earrings for the spring concert",
      productId: "drop-pair",
      requiredTags: ["elegant", "dainty"],
      favouredColours: ["silver", "teal", "navy"],
      avoidColours: ["coral"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [20, 35],
      fee: [55, 70],
      deadlineDays: [4, 6],
      minQuality: 62,
    },
    lines: {
      request: "Earrings for the spring concert, please. Graceful and light.",
      delighted: "They'll sparkle under the stage lights. Wonderful.",
      nearMiss: "They're pretty! One is a little uneven.",
    },
  },
  {
    id: "juniper",
    name: "Juniper",
    relation: "Writes stories about the moon",
    traitGate: "dreamer",
    minReputation: 10,
    look: { skinTone: "cocoa", hairStyle: "locs", hairColour: "lilac", outfit: "cardigan" },
    scene: "garden",
    avoidNote: "",
    brief: {
      occasion: "Something from the night sky",
      productId: "stone-pendant",
      requiredTags: ["dreamy"],
      favouredColours: ["lavender", "navy", "silver"],
      avoidColours: [],
      avoidMetals: [],
      requiredExtras: [{ extraId: "star-charm", count: 2 }],
      budget: [30, 45],
      fee: [85, 100],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request: "Make me something that belongs to the night sky.",
      delighted: "It's like holding the moon. I'll write it into a story!",
      nearMiss: "Almost magic! Maybe a few more stars.",
    },
  },
  {
    id: "mr-okonkwo",
    name: "Mr. Okonkwo",
    relation: "Retired postman, for his anniversary",
    minReputation: 14,
    look: { skinTone: "espresso", hairStyle: "short-bob", hairColour: "platinum", outfit: "blazer" },
    scene: "foyer",
    avoidNote: "Black doesn't feel like a happy anniversary.",
    brief: {
      occasion: "Forty years married",
      productId: "stone-ring",
      requiredTags: ["elegant"],
      favouredColours: ["ruby", "gold", "ivory"],
      avoidColours: ["black"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [35, 50],
      fee: [70, 90],
      deadlineDays: [5, 7],
      minQuality: 68,
    },
    lines: {
      request: "Forty years married. A ring with a red stone, please.",
      delighted: "She cried happy tears. Thank you, truly.",
      nearMiss: "She loves it. The stone sits a touch crooked.",
    },
  },
  {
    id: "mr-farouk",
    name: "Mr. Farouk",
    relation: "Repairs telescopes",
    traitGate: "perfectionist",
    minReputation: 24,
    look: { skinTone: "amber", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "studio-apron" },
    scene: "shop",
    avoidNote: "Copper and brass remind him of old pipes.",
    brief: {
      occasion: "A ring as true as a lens",
      productId: "stone-ring",
      requiredTags: ["classic", "elegant"],
      favouredColours: ["silver", "black", "gold"],
      avoidColours: [],
      avoidMetals: ["copper", "brass"],
      requiredExtras: [],
      budget: [50, 70],
      fee: [100, 120],
      deadlineDays: [5, 7],
      minQuality: 84,
    },
    lines: {
      request: "A ring as true as a good lens. Every line exact.",
      delighted: "Flawless alignment. I couldn't have done better myself.",
      nearMiss: "Good effort. Precision comes with patience.",
    },
  },
];
