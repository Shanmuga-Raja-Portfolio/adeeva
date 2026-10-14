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
  readonly minColours: number;
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
  readonly guestName: string;
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly look: AvatarLook;
  readonly brief: BriefTemplate;
  readonly lines: ClientLines;
}

const NONE = { requiredMixes: [], avoidMixes: [], wantsHotTag: false, minColours: 0 } as const;

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "pip",
    guestName: "Pip and his dad",
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
    guestName: "Coach Dani",
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
    guestName: "Grandpa Tomasz",
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
    guestName: "Mrs. Adeyemi",
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
    guestName: "Ms. Farrow",
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
    guestName: "Rosa and Mateo",
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
    guestName: "Saffi",
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
    guestName: "Mr. Bramwell",
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
  {
    id: "juniper-troop",
    guestName: "The Juniper Troop leaders",
    name: "Juniper Troop",
    relation: "Troop leaders planning a badge day",
    minReputation: 10,
    look: { skinTone: "sand", hairStyle: "ponytail", hairColour: "brown", outfit: "dungarees" },
    brief: {
      ...NONE,
      occasion: "Badge day for the troop",
      products: ["biscuit-wreath"],
      requiredTags: ["playful", "casual"],
      favouredColours: ["emerald", "mustard", "sky"],
      avoidColours: ["black"],
      requiredToppings: [{ topping: "marzipan-bee", count: 2 }],
      budget: [35, 50],
      fee: [70, 90],
      deadlineDays: [3, 5],
      minQuality: 74,
    },
    lines: {
      request: "Badge day is on Saturday! A biscuit wreath with buzzy bees, please.",
      delighted: "Everyone earned their badge and a biscuit. Best day ever!",
      nearMiss: "The troop loved it! A couple of outlines went for a wander.",
    },
  },
  {
    id: "twins-ines-sofia",
    guestName: "Inès, Sofia and their mum",
    name: "Inès & Sofia",
    relation: "Twins turning ten, with their mum",
    minReputation: 14,
    look: { skinTone: "honey", hairStyle: "braids", hairColour: "dark-brown", outfit: "denim-jacket" },
    brief: {
      ...NONE,
      occasion: "A double tenth birthday",
      products: ["spiral-roll", "petit-fours"],
      requiredTags: ["playful", "dreamy"],
      favouredColours: ["lavender", "blush", "sky"],
      avoidColours: ["charcoal"],
      requiredToppings: [{ topping: "sugar-daisy", count: 4 }],
      budget: [40, 55],
      fee: [80, 100],
      deadlineDays: [4, 6],
      minQuality: 76,
    },
    lines: {
      request: "We're both ten on the same day! Something dreamy with daisies?",
      delighted: "It looks like a garden in a dream. Thank you times two!",
      nearMiss: "We love it! One line went a little wiggly, but that's fine.",
    },
  },
  {
    id: "mr-osei",
    guestName: "Mr. Osei",
    name: "Mr. Osei",
    relation: "Keeper of the Larkspur allotments",
    minReputation: 16,
    look: { skinTone: "espresso", hairStyle: "short-bob", hairColour: "black", outfit: "cardigan" },
    brief: {
      ...NONE,
      occasion: "Allotment open day",
      products: ["tartlet-set"],
      requiredTags: ["casual"],
      requiredMixes: ["oat-crust"],
      favouredColours: ["sage", "mustard", "ivory"],
      avoidColours: [],
      requiredToppings: [{ topping: "mint-leaf", count: 6 }],
      budget: [35, 50],
      fee: [75, 95],
      deadlineDays: [4, 6],
      minQuality: 76,
    },
    lines: {
      request: "Oat-crust tartlets for the allotment open day. A mint leaf on each!",
      delighted: "Fresh as the morning dew. The gardeners sang your praises.",
      nearMiss: "Very tasty. The crusts could have been a touch more golden.",
    },
  },
  {
    id: "councillor-nwosu",
    guestName: "Councillor Nwosu",
    name: "Councillor Nwosu",
    relation: "Planning the town's Lantern Night",
    minReputation: 20,
    look: { skinTone: "cocoa", hairStyle: "high-bun", hairColour: "black", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "Lantern Night in the square",
      products: ["layer-cake", "two-tier-cake"],
      requiredTags: ["dreamy", "regal"],
      favouredColours: ["navy", "gold", "lavender"],
      avoidColours: ["coral"],
      requiredToppings: [{ topping: "sugar-snowflake", count: 4 }],
      budget: [80, 100],
      fee: [120, 150],
      deadlineDays: [5, 7],
      minQuality: 80,
    },
    lines: {
      request: "Lantern Night needs a centrepiece. Dreamy, a little grand, with snowflakes.",
      delighted: "The whole square stopped to look. It glowed like the lanterns!",
      nearMiss: "A lovely cake. A steadier border would make it shine.",
    },
  },
  {
    id: "ms-lindqvist",
    guestName: "Ms. Lindqvist",
    name: "Ms. Lindqvist",
    relation: "Music teacher with a concert coming up",
    minReputation: 22,
    look: { skinTone: "porcelain", hairStyle: "long-waves", hairColour: "blonde", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "The school concert",
      products: ["petit-fours"],
      requiredTags: ["elegant"],
      favouredColours: ["navy", "ivory", "gold"],
      avoidColours: ["ruby"],
      requiredToppings: [{ topping: "sugar-pearls", count: 6 }],
      budget: [45, 60],
      fee: [95, 120],
      deadlineDays: [5, 7],
      minQuality: 80,
    },
    lines: {
      request: "Petits fours for the concert interval. Elegant, with pearls like piano keys.",
      delighted: "The orchestra played an encore just to have another one!",
      nearMiss: "Very pretty. A few icing lines were a little out of tune.",
    },
  },
  {
    id: "aunt-maribel",
    guestName: "Aunt Maribel and Uncle Joss",
    name: "Aunt Maribel & Uncle Joss",
    relation: "Celebrating twenty-five years together",
    minReputation: 26,
    look: { skinTone: "amber", hairStyle: "curly-puff", hairColour: "platinum", outfit: "cardigan" },
    brief: {
      ...NONE,
      occasion: "A silver anniversary",
      products: ["three-tier-cake"],
      requiredTags: ["regal", "romantic"],
      avoidMixes: ["cocoa-sponge"],
      favouredColours: ["ivory", "gold", "blush"],
      avoidColours: [],
      requiredToppings: [
        { topping: "sugar-rose", count: 3 },
        { topping: "sugar-shimmer", count: 2 },
      ],
      budget: [110, 140],
      fee: [170, 210],
      deadlineDays: [6, 8],
      minQuality: 84,
    },
    lines: {
      request: "Twenty-five years! Three tiers, roses and a little shimmer. No cocoa, please.",
      delighted: "Joss cried happy tears. It's taller than our wedding cake!",
      nearMiss: "It's beautiful. The top border needs just a steadier hand.",
    },
  },
  {
    id: "wren",
    guestName: "Wren",
    name: "Wren",
    relation: "Mural painter by the station",
    traitGate: "dreamer",
    minReputation: 8,
    look: { skinTone: "peach", hairStyle: "pixie", hairColour: "ocean-teal", outfit: "dungarees" },
    brief: {
      ...NONE,
      occasion: "A new mural opening",
      products: ["cupcake-tray", "layer-cake", "iced-biscuits", "petit-fours", "spiral-roll"],
      requiredTags: ["dreamy"],
      minColours: 3,
      favouredColours: "any",
      avoidColours: [],
      requiredToppings: [
        { topping: "wafer-butterfly", count: 2 },
        { topping: "sugar-shimmer", count: 1 },
      ],
      budget: [40, 55],
      fee: [90, 110],
      deadlineDays: [4, 6],
      minQuality: 76,
    },
    lines: {
      request: "Paint me a cake that feels like weather. Three colours at least!",
      delighted: "It's a sky on a plate. I'm painting it into the mural!",
      nearMiss: "Gorgeous colours. One or two lines drifted like clouds.",
    },
  },
  {
    id: "mr-quill",
    guestName: "Mr. Quill",
    name: "Mr. Quill",
    relation: "Clockmaker on Wick Lane",
    traitGate: "perfectionist",
    minReputation: 10,
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "blazer" },
    brief: {
      ...NONE,
      occasion: "The shop's hundredth birthday",
      products: ["petit-fours"],
      requiredTags: ["classic", "elegant"],
      favouredColours: ["ivory", "charcoal", "gold"],
      avoidColours: [],
      requiredToppings: [{ topping: "wafer-fan", count: 3 }],
      budget: [40, 55],
      fee: [110, 130],
      deadlineDays: [5, 7],
      minQuality: 84,
    },
    lines: {
      request: "One hundred years of clocks. Petits fours, exactly so, if you please.",
      delighted: "Precise to the second. I shall set my clocks by your baking.",
      nearMiss: "Very fine. A line or two ran a fraction fast.",
    },
  },
];

export const FAIR_CLIENT_ID = "larkspur-fair";

export const FIRST_DAY_CLIENT_IDS: readonly string[] = ["pip", "coach-dani"];
export const GUIDED_CLIENT_ID = "pip";
