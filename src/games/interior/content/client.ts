import type { AvatarLook } from "../../../engine/avatar";
import type { TraitId } from "../../../engine/trait";
import type { DecorId } from "./decor";
import type { FurnitureId } from "./furniture";
import type { LightId, LightMood } from "./light";
import type { RoomColour } from "./roomColour";
import type { RoomId } from "./roomTemplate";
import type { RoomTag } from "./roomTag";

export type ItemId = FurnitureId | DecorId | LightId;

export interface MustHave {
  readonly itemId: ItemId;
  readonly count: number;
}

export interface BriefTemplate {
  readonly roomId: RoomId;
  readonly requiredTags: readonly RoomTag[];
  readonly favouredColours: readonly RoomColour[];
  readonly avoidColours: readonly RoomColour[];
  readonly mustHaves: readonly MustHave[];
  readonly mood: LightMood;
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
  readonly showHome: boolean;
  readonly trendBrief: boolean;
  readonly look: AvatarLook;
  readonly avoidNote: string;
  readonly brief: BriefTemplate;
  readonly lines: ClientLines;
}

export const FIRST_CLIENT_ID = "nana-pearl";
export const SHOW_HOME_CLIENT_ID = "bellwind";

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "nana-pearl",
    name: "Nana Pearl",
    relation: "Reads three books a week",
    minReputation: 0,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "chestnut", hairStyle: "high-bun", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "Black feels too gloomy for a reading corner.",
    brief: {
      roomId: "reading-nook",
      requiredTags: ["cosy"],
      favouredColours: ["sage", "ivory", "honey-wood"],
      avoidColours: ["black"],
      mustHaves: [
        { itemId: "armchair", count: 1 },
        { itemId: "bookcase", count: 1 },
      ],
      mood: "warm",
      budget: [40, 50],
      fee: [50, 60],
      deadlineDays: [3, 5],
      minQuality: 55,
    },
    lines: {
      request: "I need a cosy corner for reading. Somewhere soft and warm.",
      delighted: "Oh my. I may never leave this chair again.",
      nearMiss: "It's lovely, dear. The lamp could be a touch closer.",
    },
  },
  {
    id: "okafor-twins",
    name: "Mr. Okafor",
    relation: "Booking for twins Kit and Bea, age 7",
    minReputation: 0,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "espresso", hairStyle: "pixie", hairColour: "black", outfit: "denim-jacket" },
    avoidNote: "Kit and Bea say charcoal is too sleepy.",
    brief: {
      roomId: "shared-bedroom",
      requiredTags: ["playful"],
      favouredColours: ["mustard", "sky", "coral"],
      avoidColours: ["charcoal"],
      mustHaves: [
        { itemId: "bunk-bed", count: 1 },
        { itemId: "toy-box", count: 1 },
      ],
      mood: "any",
      budget: [60, 74],
      fee: [70, 85],
      deadlineDays: [4, 6],
      minQuality: 58,
    },
    lines: {
      request: "We want a room for two explorers! Bunk beds, please!",
      delighted: "Top bunk is mine, no, mine! It's the best room ever!",
      nearMiss: "We love it! Can the toy box be easier to reach?",
    },
  },
  {
    id: "jun",
    name: "Jun",
    relation: "Moving into a first flat",
    minReputation: 3,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "peach", hairStyle: "short-bob", hairColour: "dark-brown", outfit: "blazer" },
    avoidNote: "Mustard reminds Jun of old school chairs.",
    brief: {
      roomId: "first-flat",
      requiredTags: ["modern"],
      favouredColours: ["sky", "teal", "pale-wood"],
      avoidColours: ["mustard"],
      mustHaves: [
        { itemId: "single-bed", count: 1 },
        { itemId: "desk", count: 1 },
      ],
      mood: "cool",
      budget: [60, 74],
      fee: [75, 90],
      deadlineDays: [4, 6],
      minQuality: 60,
    },
    lines: {
      request: "My first flat. Clean and modern, with a proper desk.",
      delighted: "It finally feels like my place. Thank you!",
      nearMiss: "Really nice. It's a bit tight to walk around.",
    },
  },
  {
    id: "orla",
    name: "Orla",
    relation: "A puppet maker who dreams big",
    traitGate: "dreamer",
    minReputation: 6,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "porcelain", hairStyle: "curly-puff", hairColour: "auburn", outfit: "dungarees" },
    avoidNote: "Orla loves every colour of the night sky.",
    brief: {
      roomId: "attic-room",
      requiredTags: ["bold", "playful"],
      favouredColours: ["navy", "gold", "lavender"],
      avoidColours: [],
      mustHaves: [
        { itemId: "single-bed", count: 1 },
        { itemId: "star-garland", count: 2 },
        { itemId: "firefly-string", count: 1 },
      ],
      mood: "warm",
      budget: [67, 80],
      fee: [90, 110],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request: "I dream under a sky full of stars. Can my room do that?",
      delighted: "It's a night sky indoors. My puppets will love it!",
      nearMiss: "Almost magic! It needs a little more sparkle.",
    },
  },
  {
    id: "mrs-halloran",
    name: "Mrs. Halloran",
    relation: "Retired music teacher",
    minReputation: 8,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "Coral is a little loud for quiet records.",
    brief: {
      roomId: "living-room",
      requiredTags: ["classic", "calm"],
      favouredColours: ["ivory", "navy", "honey-wood"],
      avoidColours: ["coral"],
      mustHaves: [
        { itemId: "sofa", count: 1 },
        { itemId: "armchair", count: 1 },
        { itemId: "bookcase", count: 1 },
      ],
      mood: "warm",
      budget: [80, 98],
      fee: [95, 115],
      deadlineDays: [5, 7],
      minQuality: 65,
    },
    lines: {
      request: "A calm front room for tea and old records.",
      delighted: "It feels like a quiet song. Beautiful work.",
      nearMiss: "Very pleasant. One wall looks a little patchy.",
    },
  },
  {
    id: "dr-faraday",
    name: "Dr. Imogen Faraday",
    relation: "Museum archivist",
    traitGate: "perfectionist",
    minReputation: 10,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "cocoa", hairStyle: "locs", hairColour: "black", outfit: "blazer" },
    avoidNote: "Mustard and coral feel far too busy for an archive.",
    brief: {
      roomId: "quiet-study",
      requiredTags: ["calm", "classic"],
      favouredColours: ["sage", "ivory", "honey-wood"],
      avoidColours: ["mustard", "coral"],
      mustHaves: [
        { itemId: "bookcase", count: 2 },
        { itemId: "desk", count: 1 },
      ],
      mood: "any",
      budget: [60, 76],
      fee: [105, 125],
      deadlineDays: [5, 7],
      minQuality: 84,
    },
    lines: {
      request: "A study as calm as an archive. Everything just so.",
      delighted: "Precise, quiet and kind to the eyes. Exemplary.",
      nearMiss: "Thank you. A few edges could be crisper.",
    },
  },
  {
    id: "bluebell-cafe",
    name: "Ivy and Tomas",
    relation: "Run the Bluebell Café",
    minReputation: 12,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "honey", hairStyle: "ponytail", hairColour: "brown", outfit: "studio-apron" },
    avoidNote: "Navy makes the corner feel like night-time.",
    brief: {
      roomId: "cafe-corner",
      requiredTags: ["bright", "natural"],
      favouredColours: ["mustard", "emerald", "coral"],
      avoidColours: ["navy"],
      mustHaves: [
        { itemId: "dining-table", count: 2 },
        { itemId: "potted-fern", count: 2 },
      ],
      mood: "warm",
      budget: [68, 85],
      fee: [95, 115],
      deadlineDays: [5, 7],
      minQuality: 66,
    },
    lines: {
      request: "Our corner needs sunshine and plants. Bright, please!",
      delighted: "Customers keep choosing that corner first. Wonderful!",
      nearMiss: "It's cheerful! A couple of tables feel cramped.",
    },
  },
  {
    id: "bellwind",
    name: "Ms. Delphine Achebe",
    relation: "Bellwind Homes builder",
    minReputation: 22,
    showHome: true,
    trendBrief: true,
    look: { skinTone: "amber", hairStyle: "braids", hairColour: "black", outfit: "blazer" },
    avoidNote: "Make it what the street loves right now.",
    brief: {
      roomId: "show-lounge",
      requiredTags: [],
      favouredColours: [],
      avoidColours: [],
      mustHaves: [
        { itemId: "sofa", count: 1 },
        { itemId: "armchair", count: 1 },
        { itemId: "framed-print", count: 1 },
      ],
      mood: "any",
      budget: [118, 140],
      fee: [140, 170],
      deadlineDays: [6, 7],
      minQuality: 70,
    },
    lines: {
      request: "Our show home opens soon. Make it what people love right now.",
      delighted: "Visitors are queueing at the door. Splendid!",
      nearMiss: "Good work. We'll tidy a few details before opening.",
    },
  },
  {
    id: "castellanos",
    name: "Lucía and Mateo Castellano",
    relation: "New on Marigold Row",
    minReputation: 14,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "honey", hairStyle: "long-waves", hairColour: "dark-brown", outfit: "denim-jacket" },
    avoidNote: "Charcoal feels too heavy by the front door.",
    brief: {
      roomId: "entry-hall",
      requiredTags: ["bright", "natural"],
      favouredColours: ["mustard", "emerald", "ivory"],
      avoidColours: ["charcoal"],
      mustHaves: [
        { itemId: "hall-bench", count: 1 },
        { itemId: "plant-stand", count: 1 },
      ],
      mood: "warm",
      budget: [38, 48],
      fee: [70, 85],
      deadlineDays: [3, 5],
      minQuality: 66,
    },
    lines: {
      request: "Our hall is the first thing friends see. Make it sunny!",
      delighted: "Every visitor smiles before they even take off their coats!",
      nearMiss: "So welcoming! The bench feels a little hidden.",
    },
  },
  {
    id: "grandpa-amos",
    name: "Grandpa Amos",
    relation: "Plays piano every evening",
    minReputation: 16,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "cocoa", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "Sky blue feels too chilly for evening tunes.",
    brief: {
      roomId: "snug",
      requiredTags: ["classic", "cosy"],
      favouredColours: ["ruby", "gold", "honey-wood"],
      avoidColours: ["sky"],
      mustHaves: [
        { itemId: "upright-piano", count: 1 },
        { itemId: "armchair", count: 1 },
      ],
      mood: "warm",
      budget: [50, 62],
      fee: [85, 100],
      deadlineDays: [4, 6],
      minQuality: 68,
    },
    lines: {
      request: "A cosy corner for my piano and my tea.",
      delighted: "Every note sounds warmer in here.",
      nearMiss: "Lovely. The lamp could reach the keys better.",
    },
  },
  {
    id: "ms-nakamura",
    name: "Ms. Nakamura",
    relation: "Booking for Hiro, age 9",
    minReputation: 18,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "peach", hairStyle: "ponytail", hairColour: "black", outfit: "blazer" },
    avoidNote: "Hiro wants every colour, so nothing is off the list.",
    brief: {
      roomId: "kids-room",
      requiredTags: ["playful", "bold"],
      favouredColours: ["mustard", "navy", "teal"],
      avoidColours: [],
      mustHaves: [
        { itemId: "single-bed", count: 1 },
        { itemId: "play-tent", count: 1 },
        { itemId: "bean-bag", count: 1 },
      ],
      mood: "any",
      budget: [54, 66],
      fee: [85, 105],
      deadlineDays: [4, 6],
      minQuality: 68,
    },
    lines: {
      request: "Hiro wants a room for adventures. A tent, please!",
      delighted: "Hiro hasn't come out of the tent all day. Thank you!",
      nearMiss: "Hiro loves it! The bean bag is a bit squeezed.",
    },
  },
  {
    id: "supper-club",
    name: "The Thursday Supper Club",
    relation: "Friends who cook together each week",
    minReputation: 20,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "sand", hairStyle: "braids", hairColour: "auburn", outfit: "studio-apron" },
    avoidNote: "Black feels too formal for our suppers.",
    brief: {
      roomId: "dining-room",
      requiredTags: ["classic", "natural"],
      favouredColours: ["ruby", "ivory", "honey-wood"],
      avoidColours: ["black"],
      mustHaves: [
        { itemId: "dining-set", count: 1 },
        { itemId: "sideboard", count: 1 },
      ],
      mood: "warm",
      budget: [60, 74],
      fee: [95, 115],
      deadlineDays: [5, 7],
      minQuality: 70,
    },
    lines: {
      request: "A warm room for long suppers and good stories.",
      delighted: "It feels like a hug with a table in it. Wonderful.",
      nearMiss: "Lovely room! A chair or two feels squeezed.",
    },
  },
  {
    id: "ms-farrow",
    name: "Ms. Farrow",
    relation: "Works from home",
    minReputation: 24,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "porcelain", hairStyle: "pixie", hairColour: "auburn", outfit: "blazer" },
    avoidNote: "Ruby feels too loud for a long day of work.",
    brief: {
      roomId: "home-office",
      requiredTags: ["modern", "calm"],
      favouredColours: ["charcoal", "sage", "sky"],
      avoidColours: ["ruby"],
      mustHaves: [
        { itemId: "desk", count: 1 },
        { itemId: "bookcase", count: 1 },
        { itemId: "plant-stand", count: 1 },
      ],
      mood: "cool",
      budget: [52, 64],
      fee: [95, 115],
      deadlineDays: [5, 7],
      minQuality: 72,
    },
    lines: {
      request: "A calm office where I can really think.",
      delighted: "I got more done this morning than all last week!",
      nearMiss: "Very calm. The desk could use brighter light.",
    },
  },
  {
    id: "bea-and-rufus",
    name: "Bea and Rufus",
    relation: "Retired gardeners",
    minReputation: 28,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "chestnut", hairStyle: "curly-puff", hairColour: "platinum", outfit: "dungarees" },
    avoidNote: "Navy makes the garden feel far away.",
    brief: {
      roomId: "garden-room",
      requiredTags: ["natural", "bright"],
      favouredColours: ["sage", "emerald", "mustard"],
      avoidColours: ["navy"],
      mustHaves: [
        { itemId: "daybed", count: 1 },
        { itemId: "potted-fern", count: 2 },
        { itemId: "herb-pots", count: 1 },
      ],
      mood: "any",
      budget: [64, 78],
      fee: [105, 125],
      deadlineDays: [5, 7],
      minQuality: 72,
    },
    lines: {
      request: "A sunny room full of plants, so the garden comes inside.",
      delighted: "It's like sitting in the garden when it rains. Perfect!",
      nearMiss: "Lovely and leafy! The daybed is hard to reach.",
    },
  },
  {
    id: "solenne",
    name: "Solenne",
    relation: "Window dresser at the arcade",
    traitGate: "trendsetter",
    minReputation: 18,
    showHome: false,
    trendBrief: true,
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "rose-gold", outfit: "blazer" },
    avoidNote: "Make it what the street loves this week.",
    brief: {
      roomId: "loft-studio",
      requiredTags: [],
      favouredColours: [],
      avoidColours: [],
      mustHaves: [
        { itemId: "daybed", count: 1 },
        { itemId: "framed-print", count: 2 },
      ],
      mood: "any",
      budget: [60, 74],
      fee: [110, 130],
      deadlineDays: [5, 7],
      minQuality: 74,
    },
    lines: {
      request: "Help me show what's next. Make my studio what people love now.",
      delighted: "It's the talk of the arcade already. Brilliant!",
      nearMiss: "Nearly there! It needs one more fresh idea.",
    },
  },
  {
    id: "the-hollins",
    name: "Mr. and Mrs. Hollin",
    relation: "Run the hardware shop downstairs",
    traitGate: "charmer",
    minReputation: 14,
    showHome: false,
    trendBrief: false,
    look: { skinTone: "sand", hairStyle: "high-bun", hairColour: "brown", outfit: "cardigan" },
    avoidNote: "We like every colour, as long as it feels like home.",
    brief: {
      roomId: "main-bedroom",
      requiredTags: ["cosy", "classic"],
      favouredColours: ["blush", "honey-wood", "ivory"],
      avoidColours: [],
      mustHaves: [
        { itemId: "double-bed", count: 1 },
        { itemId: "bedside-table", count: 2 },
        { itemId: "chest-of-drawers", count: 1 },
      ],
      mood: "warm",
      budget: [70, 86],
      fee: [110, 130],
      deadlineDays: [5, 7],
      minQuality: 70,
    },
    lines: {
      request: "After years of biscuits, it's our turn. A cosy bedroom, please.",
      delighted: "We'll sleep like logs in here. Thank you, dear!",
      nearMiss: "So cosy! One bedside lamp could be brighter.",
    },
  },
];
