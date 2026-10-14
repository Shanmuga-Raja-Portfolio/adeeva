import type { AvatarLook } from "../../../engine/avatar";
import type { TraitId } from "../../../engine/trait";
import type { DishId } from "./dish";
import type { IngredientId } from "./ingredient";
import type { TasteTag } from "./tasteTag";

export interface OrderTemplate {
  readonly occasion: string;
  readonly dishCount: number;
  readonly cuisines: number;
  readonly requiredTags: readonly TasteTag[];
  readonly hotTag: boolean;
  readonly dishId: DishId | null;
  readonly avoid: readonly IngredientId[];
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
  readonly who: string;
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly community: boolean;
  readonly look: AvatarLook;
  readonly avoidNote: string | null;
  readonly order: OrderTemplate;
  readonly lines: ClientLines;
}

function order(
  occasion: string,
  dishCount: number,
  requiredTags: readonly TasteTag[],
  money: { readonly budget: readonly [number, number]; readonly fee: readonly [number, number] },
  deadlineDays: readonly [number, number],
  minQuality: number,
  extra: Partial<Pick<OrderTemplate, "cuisines" | "hotTag" | "dishId" | "avoid">> = {},
): OrderTemplate {
  return {
    occasion,
    dishCount,
    cuisines: extra.cuisines ?? 1,
    requiredTags,
    hotTag: extra.hotTag ?? false,
    dishId: extra.dishId ?? null,
    avoid: extra.avoid ?? [],
    budget: money.budget,
    fee: money.fee,
    deadlineDays,
    minQuality,
  };
}

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "netball-supper",
    name: "Coach Imani",
    who: "Coach of the Larkspur Under-12s netball team",
    minReputation: 0,
    community: true,
    look: { skinTone: "cocoa", hairStyle: "ponytail", hairColour: "black", outfit: "denim-jacket" },
    avoidNote: "The team isn't keen on chilli tonight.",
    order: order(
      "A team supper after practice",
      2,
      ["hearty"],
      { budget: [12, 16], fee: [45, 60] },
      [2, 4],
      66,
      {
        avoid: ["fresh-chilli"],
      },
    ),
    lines: {
      request: "Two hearty dishes for a hungry team, please!",
      delighted: "The whole team cheered. Seconds for everyone!",
      nearMiss: "They ate every bite. Thank you, chef.",
    },
  },
  {
    id: "book-club",
    name: "Ms. Ilse Brandt",
    who: "Runs the library book club",
    minReputation: 0,
    community: false,
    look: { skinTone: "porcelain", hairStyle: "short-bob", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "The club prefers no chilli with their tea.",
    order: order(
      "Supper for the book club",
      2,
      ["delicate", "fresh"],
      { budget: [10, 14], fee: [45, 60] },
      [2, 4],
      66,
      {
        avoid: ["fresh-chilli", "scotch-bonnet"],
      },
    ),
    lines: {
      request: "Something fresh and bright to go with a good story.",
      delighted: "We talked about your food more than the book!",
      nearMiss: "Lovely, thank you. The club enjoyed it.",
    },
  },
  {
    id: "grandpa-tomasz",
    name: "Grandpa Tomasz",
    who: "Retired postman and Crumb & Comet regular",
    minReputation: 65,
    community: false,
    look: { skinTone: "peach", hairStyle: "pixie", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "He's not a fan of chilli heat.",
    order: order("Sunday family lunch", 3, ["comforting"], { budget: [16, 22], fee: [70, 90] }, [3, 5], 70, {
      avoid: ["scotch-bonnet"],
    }),
    lines: {
      request: "The whole family is coming on Sunday. Something cosy, please.",
      delighted: "Just like the lunches of my childhood. Wonderful.",
      nearMiss: "Good food, good family. Thank you, chef.",
    },
  },
  {
    id: "amara-joel",
    name: "Amara & Joel",
    who: "New neighbours on Willow Row",
    minReputation: 70,
    community: false,
    look: { skinTone: "amber", hairStyle: "locs", hairColour: "dark-brown", outfit: "dungarees" },
    avoidNote: null,
    order: order("A housewarming party", 3, ["colourful"], { budget: [18, 24], fee: [80, 100] }, [3, 5], 72, {
      cuisines: 2,
    }),
    lines: {
      request: "Three bright dishes from two kitchens for our new home!",
      delighted: "Our new home already smells like a party. Thank you!",
      nearMiss: "Everyone loved it. What a welcome!",
    },
  },
  {
    id: "science-fair",
    name: "Larkspur Primary",
    who: "Thank-you lunch for the science fair volunteers",
    minReputation: 75,
    community: true,
    look: { skinTone: "honey", hairStyle: "braids", hairColour: "brown", outfit: "cardigan" },
    avoidNote: "No chilli for the youngest helpers.",
    order: order(
      "A thank-you lunch for volunteers",
      4,
      ["fresh", "crunchy"],
      { budget: [22, 30], fee: [95, 120] },
      [4, 6],
      74,
      {
        avoid: ["fresh-chilli", "scotch-bonnet"],
      },
    ),
    lines: {
      request: "Four dishes to say thank you to our helpers.",
      delighted: "The volunteers gave you a round of applause!",
      nearMiss: "A lovely lunch. The helpers were very grateful.",
    },
  },
  {
    id: "hollis-dinner",
    name: "Hollis Varga",
    who: "Owner of Larkspur Market Hall",
    minReputation: 80,
    community: false,
    look: { skinTone: "cocoa", hairStyle: "pixie", hairColour: "platinum", outfit: "blazer" },
    avoidNote: null,
    order: order("A staff thank-you dinner", 4, ["bold"], { budget: [26, 34], fee: [110, 140] }, [4, 6], 78, {
      cuisines: 3,
    }),
    lines: {
      request: "Four dishes, three kitchens, one thank-you for my team.",
      delighted: "My team hasn't stopped smiling. Well cooked, chef.",
      nearMiss: "A good dinner. We'll do it again.",
    },
  },
  {
    id: "isadora-moonlight",
    name: "Isadora Finch",
    who: "Painter with a gallery on Lantern Street",
    traitGate: "dreamer",
    minReputation: 60,
    community: false,
    look: { skinTone: "sand", hairStyle: "long-waves", hairColour: "lilac", outfit: "denim-jacket" },
    avoidNote: "Isadora would rather skip butter tonight.",
    order: order(
      "A Moonlight Supper at the gallery",
      3,
      ["colourful", "bold"],
      { budget: [18, 24], fee: [90, 110] },
      [3, 5],
      72,
      {
        avoid: ["butter"],
      },
    ),
    lines: {
      request: "Cook me a plate that looks like moonlight.",
      delighted: "My guests stopped looking at the paintings. Wonderful!",
      nearMiss: "Beautiful colours. The gallery glowed tonight.",
    },
  },
  {
    id: "mr-kohli",
    name: "Mr. Ishaan Kohli",
    who: "Retired watchmaker",
    traitGate: "perfectionist",
    minReputation: 60,
    community: false,
    look: { skinTone: "chestnut", hairStyle: "short-bob", hairColour: "platinum", outfit: "blazer" },
    avoidNote: null,
    order: order("One perfect tamagoyaki", 1, ["delicate"], { budget: [4, 6], fee: [60, 80] }, [2, 4], 82, {
      dishId: "tamagoyaki",
    }),
    lines: {
      request: "One perfect tamagoyaki. Every layer even, like the gears of a watch.",
      delighted: "Every layer exactly right. Like a fine watch.",
      nearMiss: "Very good. One layer ran a little fast.",
    },
  },
  {
    id: "dami-market-taster",
    name: "Dami Ade",
    who: "Organiser of the Riverside Night Market",
    traitGate: "trendsetter",
    minReputation: 60,
    community: false,
    look: { skinTone: "espresso", hairStyle: "locs", hairColour: "black", outfit: "denim-jacket" },
    avoidNote: null,
    order: order(
      "A taster plate for the market poster",
      1,
      [],
      { budget: [6, 10], fee: [60, 80] },
      [2, 3],
      70,
      {
        hotTag: true,
      },
    ),
    lines: {
      request: "You always know what Larkspur's craving. Make the plate for our poster?",
      delighted: "That's our poster! The whole town will want a taste.",
      nearMiss: "Looks great. It'll make a lovely poster.",
    },
  },
  {
    id: "thursday-table",
    name: "Mrs. Agnes Bell",
    who: "Hosts a Thursday lunch for neighbours who eat alone",
    traitGate: "charmer",
    minReputation: 60,
    community: true,
    look: { skinTone: "honey", hairStyle: "high-bun", hairColour: "platinum", outfit: "cardigan" },
    avoidNote: "The Thursday table would rather skip scotch bonnet heat.",
    order: order(
      "Thursday lunch for the neighbours",
      3,
      ["comforting"],
      { budget: [14, 20], fee: [70, 90] },
      [3, 5],
      68,
      {
        avoid: ["scotch-bonnet"],
      },
    ),
    lines: {
      request: "It's just a few of us on Thursdays. Would you cook?",
      delighted: "Everyone stayed for a second cup of tea. Thank you.",
      nearMiss: "Such a kind lunch. Thank you for coming.",
    },
  },
];
