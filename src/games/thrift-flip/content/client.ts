import type { AvatarLook } from "../../../engine/avatar";
import type { ColourId, MaterialId } from "../../../engine/palette";
import type { TraitId } from "../../../engine/trait";
import type { StyleTag } from "../../../engine/styleTag";
import type { TrimId } from "../../adeeva/content/trim";
import type { PatchId } from "./finish";
import type { RecipeId } from "./recipe";

export type FinishRequirement =
  | { readonly kind: "trim"; readonly trim: TrimId; readonly count: number }
  | { readonly kind: "patch"; readonly patch: PatchId | "any"; readonly count: number }
  | { readonly kind: "mend"; readonly count: number }
  | { readonly kind: "mend-or-patch"; readonly count: number };

export interface BriefTemplate {
  readonly occasion: string;
  readonly recipes: readonly RecipeId[];
  readonly partIds: readonly string[] | null;
  readonly requiredTags: readonly StyleTag[];
  readonly favouredColours: readonly ColourId[];
  readonly avoidColours: readonly ColourId[];
  readonly avoidMaterials: readonly MaterialId[];
  readonly requiredFinishes: readonly FinishRequirement[];
  readonly budget: readonly [number, number];
  readonly fee: readonly [number, number];
  readonly deadlineDays: readonly [number, number];
  readonly minQuality: number;
  readonly minLeaves: number;
}

export interface ClientLines {
  readonly request: string;
  readonly delighted: string;
  readonly nearMiss: string;
}

export interface ClientPerson {
  readonly id: string;
  readonly name: string;
  readonly relation: string;
  readonly traitGate?: TraitId;
  readonly minReputation: number;
  readonly look: AvatarLook;
  readonly lines: ClientLines;
}

export interface ClientDef extends ClientPerson {
  readonly brief: BriefTemplate;
}

export const STARTER_CLIENT_IDS: readonly string[] = ["nana-bea", "juniper-wren"];
export const TICKET_REGULAR_IDS: readonly string[] = ["nana-bea", "juniper-wren", "lumi", "kofi"];

export const CLIENTS: readonly ClientDef[] = [
  {
    id: "nana-bea",
    name: "Nana Bea",
    relation: "Neighbour with the sunny porch",
    minReputation: 0,
    look: { skinTone: "porcelain", hairStyle: "high-bun", hairColour: "platinum", outfit: "cardigan" },
    brief: {
      occasion: "Porch bench cushion",
      recipes: ["cushion-cover"],
      partIds: null,
      requiredTags: ["classic"],
      favouredColours: ["sage", "ivory", "mustard"],
      avoidColours: ["black"],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "trim", trim: "button", count: 2 }],
      budget: [25, 35],
      fee: [30, 40],
      deadlineDays: [4, 6],
      minQuality: 68,
      minLeaves: 0,
    },
    lines: {
      request: "My porch bench needs a cushion. Something tidy, dear?",
      delighted: "It looks like it was always there. Thank you, dear.",
      nearMiss: "It's lovely. A few loose bits, but I'll treasure it.",
    },
  },
  {
    id: "juniper-wren",
    name: "Juniper & Wren",
    relation: "The twins next door",
    minReputation: 0,
    look: { skinTone: "peach", hairStyle: "ponytail", hairColour: "auburn", outfit: "denim-jacket" },
    brief: {
      occasion: "Matching hair ties",
      recipes: ["scrunchie-trio"],
      partIds: null,
      requiredTags: ["playful"],
      favouredColours: ["blush", "sky", "lavender"],
      avoidColours: ["charcoal"],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "patch", patch: "any", count: 1 }],
      budget: [15, 25],
      fee: [22, 30],
      deadlineDays: [3, 5],
      minQuality: 64,
      minLeaves: 0,
    },
    lines: {
      request: "We need matching scrunchies! But not boring ones!",
      delighted: "Matching! We're wearing them all week!",
      nearMiss: "They're fun! One came a bit wobbly, that's okay.",
    },
  },
  {
    id: "lumi",
    name: "Lumi",
    relation: "Art-club classmate",
    minReputation: 0,
    look: { skinTone: "sand", hairStyle: "short-bob", hairColour: "lilac", outfit: "studio-apron" },
    brief: {
      occasion: "Brush bag",
      recipes: ["tote-bag"],
      partIds: null,
      requiredTags: ["casual", "playful"],
      favouredColours: ["coral", "mustard", "sky"],
      avoidColours: [],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "patch", patch: "any", count: 2 }],
      budget: [30, 45],
      fee: [32, 44],
      deadlineDays: [4, 6],
      minQuality: 72,
      minLeaves: 40,
    },
    lines: {
      request: "My brushes need a bag with personality. Patches, please!",
      delighted: "This tote is basically art. I love it.",
      nearMiss: "Cool idea! The seams could be a little neater.",
    },
  },
  {
    id: "kofi",
    name: "Kofi",
    relation: "Cousin who skates",
    minReputation: 0,
    look: { skinTone: "cocoa", hairStyle: "curly-puff", hairColour: "black", outfit: "denim-jacket" },
    brief: {
      occasion: "Skate park hat",
      recipes: ["bucket-hat"],
      partIds: null,
      requiredTags: ["sporty"],
      favouredColours: ["navy", "black", "emerald"],
      avoidColours: ["ivory", "sky"],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "patch", patch: "patch-star", count: 1 }],
      budget: [25, 40],
      fee: [36, 48],
      deadlineDays: [4, 6],
      minQuality: 72,
      minLeaves: 0,
    },
    lines: {
      request: "Need a hat for the skate park. Sporty, and nothing that shows dust.",
      delighted: "This is the one. Everyone's asking about it.",
      nearMiss: "Nice hat! The brim's a bit uneven, but I'll wear it.",
    },
  },
  {
    id: "ms-okafor",
    name: "Ms. Okafor",
    relation: "School librarian",
    minReputation: 12,
    look: { skinTone: "espresso", hairStyle: "braids", hairColour: "black", outfit: "blazer" },
    brief: {
      occasion: "Book-fair skirt",
      recipes: ["remade-skirt"],
      partIds: null,
      requiredTags: ["classic"],
      favouredColours: ["navy", "teal", "sage"],
      avoidColours: [],
      avoidMaterials: ["denim"],
      requiredFinishes: [{ kind: "trim", trim: "button", count: 1 }],
      budget: [40, 60],
      fee: [52, 66],
      deadlineDays: [5, 7],
      minQuality: 82,
      minLeaves: 0,
    },
    lines: {
      request: "A skirt for book-fair day? Classic, no denim.",
      delighted: "Perfect for the reading corner. Wonderful work.",
      nearMiss: "Very kind of you. Let's look at the hem together sometime.",
    },
  },
  {
    id: "rafa",
    name: "Rafa",
    relation: "Drummer in your sister's band",
    minReputation: 24,
    look: { skinTone: "chestnut", hairStyle: "locs", hairColour: "dark-brown", outfit: "denim-jacket" },
    brief: {
      occasion: "First gig stage top",
      recipes: ["remade-top"],
      partIds: null,
      requiredTags: ["edgy"],
      favouredColours: ["black", "charcoal", "ruby"],
      avoidColours: ["ivory"],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "trim", trim: "sequin-patch", count: 1 }],
      budget: [45, 65],
      fee: [58, 72],
      deadlineDays: [5, 7],
      minQuality: 87,
      minLeaves: 0,
    },
    lines: {
      request:
        "Stage top for our first gig. Edgy, with one sparkle patch. Pale shades vanish under the lights.",
      delighted: "We're going to look amazing up there. Thanks!",
      nearMiss: "It's rad. A couple of seams wandered off, though.",
    },
  },
  {
    id: "marisol",
    name: "Marisol",
    relation: "Muralist with paint on her sleeves",
    traitGate: "dreamer",
    minReputation: 15,
    look: { skinTone: "amber", hairStyle: "long-waves", hairColour: "dark-brown", outfit: "studio-apron" },
    brief: {
      occasion: "Loud patchwork piece",
      recipes: ["tote-bag", "cushion-cover"],
      partIds: null,
      requiredTags: ["bold"],
      favouredColours: ["lavender", "coral", "teal", "mustard"],
      avoidColours: [],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "patch", patch: "any", count: 3 }],
      budget: [35, 50],
      fee: [66, 80],
      deadlineDays: [5, 7],
      minQuality: 84,
      minLeaves: 70,
    },
    lines: {
      request: "Make me something loud and patchy. Use all the leftovers.",
      delighted: "It's a walking mural! Every scrap found a home.",
      nearMiss: "So close to wild! Maybe more patches next time.",
    },
  },
  {
    id: "mr-halvorsen",
    name: "Mr. Halvorsen",
    relation: "Retired tailor at the next stall",
    traitGate: "perfectionist",
    minReputation: 18,
    look: { skinTone: "peach", hairStyle: "pixie", hairColour: "platinum", outfit: "blazer" },
    brief: {
      occasion: "Pencil skirt for his daughter",
      recipes: ["remade-skirt"],
      partIds: ["pencil-skirt"],
      requiredTags: ["elegant"],
      favouredColours: ["charcoal", "navy"],
      avoidColours: ["gold"],
      avoidMaterials: [],
      requiredFinishes: [{ kind: "trim", trim: "button", count: 2 }],
      budget: [40, 60],
      fee: [70, 86],
      deadlineDays: [5, 7],
      minQuality: 88,
      minLeaves: 0,
    },
    lines: {
      request: "I'd like a pencil skirt for my daughter. Straight lines, please.",
      delighted: "Proper work. I couldn't have cut it straighter myself.",
      nearMiss: "A good start. Patience with the seams comes with time.",
    },
  },
];
