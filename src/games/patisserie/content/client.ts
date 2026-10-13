import type { AvatarLook } from "../../../engine/avatar";
import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { TraitId } from "../../../engine/trait";
import type { MixId } from "./mix";
import type { ProductId } from "./product";
import type { ToppingId } from "./topping";

export interface ToppingRequirement {
  readonly topping: ToppingId;
  readonly count: number;
}

export interface BriefTemplate {
  readonly occasion: string;
  readonly products: readonly ProductId[];
  readonly requiredTags: readonly StyleTag[];
  readonly wantsHotTag: boolean;
  readonly requiredMixes: readonly MixId[];
  readonly avoidMixes: readonly MixId[];
  readonly favouredColours: readonly ColourId[] | "any";
  readonly avoidColours: readonly ColourId[];
  readonly requiredToppings: readonly ToppingRequirement[];
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
  readonly brief: BriefTemplate;
  readonly lines: ClientLines;
}

const NONE = { requiredMixes: [], avoidMixes: [], wantsHotTag: false } as const;

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "pip",
    name: "Pip",
    relation: "Pip's dad orders from upstairs for Pip's 7th birthday",
    minReputation: 0,
    look: { skinTone: "peach", hairStyle: "curly-puff", hairColour: "auburn", outfit: "dungarees" },
    brief: {
      ...NONE,
      occasion: "Pip's 7th birthday",
      products: ["cupcake-tray"],
      requiredTags: ["playful"],
      favouredColours: ["sky", "blush", "mustard"],
      avoidColours: ["charcoal"],
      requiredToppings: [
        { topping: "sprinkles", count: 1 },
        { topping: "party-candle", count: 1 },
      ],
      budget: [20, 30],
      fee: [35, 45],
      deadlineDays: [3, 5],
      minQuality: 62,
    },
    lines: {
      request: "It's my birthday! Can my cupcakes have sprinkles AND a candle?",
      delighted: "They're the best cupcakes in the whole universe!",
      nearMiss: "I love them! One swirl went a bit wiggly.",
    },
  },
  {
    id: "coach-dani",
    name: "Coach Dani",
    relation: "Coach of the under-10s football team",
    minReputation: 0,
    look: { skinTone: "chestnut", hairStyle: "ponytail", hairColour: "black", outfit: "denim-jacket" },
    brief: {
      ...NONE,
      occasion: "The team party",
      products: ["iced-biscuits"],
      requiredTags: ["sporty"],
      favouredColours: ["emerald", "navy", "ivory"],
      avoidColours: ["ruby"],
      requiredToppings: [{ topping: "team-ball", count: 2 }],
      budget: [20, 30],
      fee: [35, 50],
      deadlineDays: [3, 5],
      minQuality: 64,
    },
    lines: {
      request: "Biscuits for the team party, please. Sporty, and no red.",
      delighted: "The team cheered louder for these than for the goal!",
      nearMiss: "Great biscuits! A few outlines wandered off the edge.",
    },
  },
  {
    id: "grandpa-tomasz",
    name: "Grandpa Tomasz",
    relation: "Retired postman, two doors down",
    minReputation: 0,
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
    brief: {
      ...NONE,
      occasion: "Fifty years married",
      products: ["layer-cake"],
      requiredTags: ["classic", "romantic"],
      avoidMixes: ["lemon-sponge"],
      favouredColours: ["ivory", "rose", "gold"],
      avoidColours: [],
      requiredToppings: [{ topping: "sugar-rose", count: 2 }],
      budget: [30, 45],
      fee: [45, 60],
      deadlineDays: [4, 6],
      minQuality: 67,
    },
    lines: {
      request: "Fifty years married on Sunday. Something classic, with two roses.",
      delighted: "Just like the cake at our wedding. Thank you.",
      nearMiss: "It's lovely. The border's a touch uneven, but the love shows.",
    },
  },
  {
    id: "mrs-adeyemi",
    name: "Mrs. Adeyemi",
    relation: "Leader of the Larkspur choir",
    minReputation: 4,
    look: { skinTone: "cocoa", hairStyle: "high-bun", hairColour: "black", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "The choir's last practice",
      products: ["fruit-tart"],
      requiredTags: ["elegant"],
      favouredColours: ["ruby", "blush", "ivory"],
      avoidColours: ["black"],
      requiredToppings: [{ topping: "fresh-berries", count: 8 }],
      budget: [35, 50],
      fee: [55, 75],
      deadlineDays: [4, 6],
      minQuality: 74,
    },
    lines: {
      request: "A tart for the choir's last practice. Elegant, lots of berries.",
      delighted: "The choir sang a thank-you song. It was for you!",
      nearMiss: "Beautiful fruit. The crust could be a shade more golden.",
    },
  },
  {
    id: "ms-farrow",
    name: "Ms. Farrow",
    relation: "Librarian who runs the poetry club",
    minReputation: 8,
    look: { skinTone: "porcelain", hairStyle: "braids", hairColour: "lilac", outfit: "cardigan" },
    brief: {
      ...NONE,
      occasion: "Poetry club on Friday",
      products: ["cupcake-tray"],
      requiredTags: ["dreamy"],
      favouredColours: ["lavender", "sky", "ivory"],
      avoidColours: ["mustard"],
      requiredToppings: [{ topping: "wafer-butterfly", count: 3 }],
      budget: [35, 50],
      fee: [70, 90],
      deadlineDays: [5, 7],
      minQuality: 78,
    },
    lines: {
      request: "Our poetry club meets Friday. Something dreamy, like a cloud.",
      delighted: "It's a poem you can eat. I'm speechless.",
      nearMiss: "Charming! A few swirls went a little wobbly.",
    },
  },
  {
    id: "rosa-mateo",
    name: "Rosa & Mateo",
    relation: "Cousins graduating on the same day",
    minReputation: 12,
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "dark-brown", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "A double graduation",
      products: ["two-tier-cake"],
      requiredTags: ["elegant", "bold"],
      favouredColours: ["navy", "gold", "emerald"],
      avoidColours: ["blush"],
      requiredToppings: [
        { topping: "gold-star", count: 3 },
        { topping: "sugar-pearls", count: 1 },
      ],
      budget: [70, 90],
      fee: [95, 120],
      deadlineDays: [5, 7],
      minQuality: 84,
    },
    lines: {
      request: "We both graduate on the same day! Elegant but bold, gold stars please.",
      delighted: "Our photos are going to be amazing!",
      nearMiss: "So close! The top tier's border needs a steadier hand.",
    },
  },
  {
    id: "saffi",
    name: "Saffi",
    relation: "Owner of the Paper Lantern Café",
    traitGate: "trendsetter",
    minReputation: 6,
    look: { skinTone: "honey", hairStyle: "pixie", hairColour: "pastel-pink", outfit: "denim-jacket" },
    brief: {
      ...NONE,
      wantsHotTag: true,
      occasion: "This week's café menu",
      products: ["cupcake-tray", "iced-biscuits"],
      requiredTags: [],
      favouredColours: "any",
      avoidColours: [],
      requiredToppings: [],
      budget: [25, 40],
      fee: [70, 90],
      deadlineDays: [3, 5],
      minQuality: 76,
    },
    lines: {
      request: "My café's menu changes every week. Bake me whatever's in right now.",
      delighted: "Sold out by lunch. You read the town perfectly.",
      nearMiss: "Nice bake! It's just not quite this week's vibe.",
    },
  },
  {
    id: "mr-bramwell",
    name: "Mr. Bramwell",
    relation: "The quiet neighbour at No. 9",
    traitGate: "charmer",
    minReputation: 5,
    look: { skinTone: "espresso", hairStyle: "short-bob", hairColour: "platinum", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "A taste of home",
      products: ["layer-cake"],
      requiredTags: ["classic"],
      requiredMixes: ["honey-sponge"],
      favouredColours: ["sage", "mustard", "ivory"],
      avoidColours: [],
      requiredToppings: [],
      budget: [25, 40],
      fee: [80, 100],
      deadlineDays: [4, 6],
      minQuality: 72,
    },
    lines: {
      request: "...Honey cake. Like my mother made. If you've time.",
      delighted: "...That's exactly it. I'll bring her old recipe tin to the street party.",
      nearMiss: "Kind of you. Not quite hers, but kind of you.",
    },
  },
];

export const FIRST_DAY_CLIENT_IDS: readonly string[] = ["pip", "coach-dani"];
export const GUIDED_CLIENT_ID = "pip";
