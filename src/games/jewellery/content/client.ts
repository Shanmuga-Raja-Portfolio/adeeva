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

export interface PersonDef {
  readonly id: string;
  readonly name: string;
  readonly relation: string;
  readonly child?: boolean;
  readonly look: AvatarLook;
  readonly scene: DeliveryScene;
  readonly avoidNote: string;
  readonly lines: ClientLines;
}

export interface ClientDef extends PersonDef {
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly brief: BriefTemplate;
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
    child: true,
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
  {
    id: "ms-adaeze",
    name: "Ms. Adaeze",
    relation: "Runs the arcade bookshop",
    minReputation: 14,
    look: { skinTone: "cocoa", hairStyle: "high-bun", hairColour: "black", outfit: "blazer" },
    scene: "shop",
    avoidNote: "Coral feels too loud for a bookshop.",
    brief: {
      occasion: "A badge for a reading coat",
      productId: "coat-badge",
      requiredTags: ["classic"],
      favouredColours: ["navy", "ivory", "gold"],
      avoidColours: ["coral"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [15, 25],
      fee: [55, 70],
      deadlineDays: [4, 6],
      minQuality: 70,
    },
    lines: {
      request: "A badge for my reading coat. Something classic, please.",
      delighted: "It looks like it came from a story. Wonderful.",
      nearMiss: "Lovely! One edge is a little fuzzy.",
    },
  },
  {
    id: "asha-and-meera",
    name: "Asha and Meera",
    relation: "Best friends, with Asha's grandad",
    child: true,
    minReputation: 16,
    look: { skinTone: "chestnut", hairStyle: "braids", hairColour: "black", outfit: "dungarees" },
    scene: "kitchen",
    avoidNote: "Charcoal is too gloomy for best friends.",
    brief: {
      occasion: "A best-friends necklace",
      productId: "friendship-halves",
      requiredTags: ["playful"],
      favouredColours: ["coral", "sky", "lavender"],
      avoidColours: ["charcoal"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [18, 28],
      fee: [60, 75],
      deadlineDays: [4, 6],
      minQuality: 70,
    },
    lines: {
      request: "One necklace in two halves. One for each of us!",
      delighted: "They click together! Best friends forever.",
      nearMiss: "We love it! One half is a bit dull.",
    },
  },
  {
    id: "captain-rui",
    name: "Captain Rui",
    relation: "Runs the harbour ferry",
    minReputation: 18,
    look: { skinTone: "honey", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "denim-jacket" },
    scene: "shop",
    avoidNote: "Blush doesn't suit a ferry captain.",
    brief: {
      occasion: "A strong captain's bangle",
      productId: "bangle",
      requiredTags: ["bold"],
      favouredColours: ["navy", "teal", "silver"],
      avoidColours: ["blush"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [12, 22],
      fee: [60, 75],
      deadlineDays: [4, 6],
      minQuality: 72,
    },
    lines: {
      request: "A strong bangle for a ferry captain, please.",
      delighted: "Sturdy as my boat. Thank you, crew-mate.",
      nearMiss: "Ahoy, it's handsome! The seam looks a bit wobbly.",
    },
  },
  {
    id: "coach-imani",
    name: "Coach Imani",
    relation: "Coaches the junior swim club",
    minReputation: 22,
    look: { skinTone: "espresso", hairStyle: "ponytail", hairColour: "black", outfit: "denim-jacket" },
    scene: "shop",
    avoidNote: "",
    brief: {
      occasion: "A team charm for the kit bag",
      productId: "bag-charm",
      requiredTags: ["playful"],
      favouredColours: ["teal", "sky", "coral"],
      avoidColours: [],
      avoidMetals: [],
      requiredExtras: [{ extraId: "star-charm", count: 1 }],
      budget: [18, 28],
      fee: [70, 85],
      deadlineDays: [4, 6],
      minQuality: 74,
    },
    lines: {
      request: "Our club needs a team charm for the kit bag.",
      delighted: "The whole team cheered when they saw it!",
      nearMiss: "The team likes it! It could shine a bit more.",
    },
  },
  {
    id: "nana-ife",
    name: "Nana Ifẹ",
    relation: "Grows sunflowers on her roof",
    minReputation: 24,
    look: { skinTone: "espresso", hairStyle: "curly-puff", hairColour: "platinum", outfit: "cardigan" },
    scene: "kitchen",
    avoidNote: "Black feels too heavy for sunflowers.",
    brief: {
      occasion: "Sunflower earrings",
      productId: "stone-drops",
      requiredTags: ["nature"],
      favouredColours: ["mustard", "emerald", "gold"],
      avoidColours: ["black"],
      avoidMetals: [],
      requiredExtras: [],
      budget: [26, 40],
      fee: [80, 100],
      deadlineDays: [5, 7],
      minQuality: 74,
    },
    lines: {
      request: "Earrings that feel like my sunflowers. Bright and green.",
      delighted: "They glow like my garden at noon. Thank you, dear.",
      nearMiss: "So pretty! One stone sits a little shy.",
    },
  },
  {
    id: "mr-abebe",
    name: "Mr. Abebe",
    relation: "Plays accordion by the fountain",
    traitGate: "charmer",
    minReputation: 16,
    look: { skinTone: "cocoa", hairStyle: "short-bob", hairColour: "black", outfit: "cardigan" },
    scene: "foyer",
    avoidNote: "",
    brief: {
      occasion: "A ring for playing tunes",
      productId: "motif-ring",
      requiredTags: ["classic", "playful"],
      favouredColours: ["ruby", "mustard", "gold"],
      avoidColours: [],
      avoidMetals: [],
      requiredExtras: [],
      budget: [18, 30],
      fee: [85, 105],
      deadlineDays: [4, 6],
      minQuality: 74,
    },
    lines: {
      request: "A ring for playing tunes. Cheerful, like a polka!",
      delighted: "It makes my fingers want to dance. Bravo!",
      nearMiss: "A happy ring! The top could sit a bit neater.",
    },
  },
  {
    id: "zara",
    name: "Zara",
    relation: "Draws the arcade's comic strip",
    traitGate: "trendsetter",
    minReputation: 18,
    look: { skinTone: "peach", hairStyle: "pixie", hairColour: "pastel-pink", outfit: "denim-jacket" },
    scene: "shop",
    avoidNote: "",
    brief: {
      occasion: "A slide for a comic launch",
      productId: "hair-slide",
      requiredTags: ["bold", "sparkly"],
      favouredColours: ["plum", "coral", "gold"],
      avoidColours: [],
      avoidMetals: [],
      requiredExtras: [],
      budget: [12, 24],
      fee: [90, 110],
      deadlineDays: [4, 6],
      minQuality: 76,
    },
    lines: {
      request: "Make me something bold and sparkly for my comic launch.",
      delighted: "It's going in my next comic strip!",
      nearMiss: "Cool! It needs one more sparkly touch.",
    },
  },
  {
    id: "dr-sorensen",
    name: "Dr. Sørensen",
    relation: "The town astronomer",
    minReputation: 32,
    look: { skinTone: "porcelain", hairStyle: "long-waves", hairColour: "platinum", outfit: "blazer" },
    scene: "garden",
    avoidNote: "Copper and brass fog up her telescope room.",
    brief: {
      occasion: "A pendant like the night sky",
      productId: "stone-pendant",
      requiredTags: ["dreamy", "elegant"],
      favouredColours: ["navy", "silver", "sky"],
      avoidColours: [],
      avoidMetals: ["copper", "brass"],
      requiredExtras: [],
      budget: [30, 44],
      fee: [110, 130],
      deadlineDays: [5, 7],
      minQuality: 80,
    },
    lines: {
      request: "A pendant like the night sky. Exact and elegant, please.",
      delighted: "Like holding a little star chart. Splendid.",
      nearMiss: "Beautiful. A few spots could shine a little brighter.",
    },
  },
];
