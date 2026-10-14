import { rectangle } from "../../../engine/geometry/rectangle";
import { SEAM_PROFILES } from "../../adeeva/content/garmentPart";
import type { RecipeDef, RecipePiece } from "./recipe";

export const BOUTIQUE_RECIPE_IDS = [
  "hair-bow-set",
  "book-sleeve",
  "bunting-string",
  "garden-apron",
  "patch-throw",
  "remade-pinafore",
] as const;

export const PATCH_THROW_SQUARES = 9;
export const PATCH_THROW_MIN_PER_FIND = 3;

function numbered(prefix: string, name: string, count: number, make: () => RecipePiece["shape"]) {
  return Array.from({ length: count }, (_, index): RecipePiece => ({
    id: `${prefix}-${index + 1}`,
    name: `${name} ${index + 1}`,
    shape: make(),
    grain: "straight",
  }));
}

const PENNANT: RecipePiece["shape"] = [
  [0, 0],
  [20, 0],
  [10, 24],
];

export const BOUTIQUE_RECIPES: readonly RecipeDef[] = [
  {
    id: "hair-bow-set",
    name: "Hair Bow Set",
    blurb: "Four floppy bows with neat little knots.",
    baseValue: 22,
    tags: ["romantic", "playful"],
    blockedMaterials: ["wool"],
    sewHours: 2,
    pieces: [
      ...numbered("bow", "Bow", 4, () => rectangle(24, 12)),
      ...numbered("knot", "Knot", 2, () => rectangle(6, 10)),
    ],
    seams: [
      { id: "loops", name: "Bow loops", profile: SEAM_PROFILES.gentle },
      { id: "knots", name: "Knot wraps", profile: SEAM_PROFILES.straight },
    ],
    partGroups: [],
  },
  {
    id: "book-sleeve",
    name: "Book Sleeve",
    blurb: "A padded jacket that keeps a story safe.",
    baseValue: 30,
    tags: ["classic", "playful"],
    blockedMaterials: ["tulle"],
    sewHours: 2,
    pieces: [
      ...numbered("sleeve-body", "Sleeve side", 2, () => rectangle(30, 38)),
      { id: "sleeve-flap", name: "Flap", shape: rectangle(30, 16), grain: "straight" },
    ],
    seams: [
      { id: "sleeve-sides", name: "Side seams", profile: SEAM_PROFILES.straight },
      { id: "sleeve-flap", name: "Curved flap", profile: SEAM_PROFILES.curved },
    ],
    partGroups: [],
  },
  {
    id: "bunting-string",
    name: "Bunting String",
    blurb: "Six cheerful flags on one long tape.",
    baseValue: 38,
    tags: ["playful", "bold"],
    blockedMaterials: [],
    sewHours: 2,
    pieces: [
      ...numbered("pennant", "Flag", 6, () => PENNANT),
      { id: "bunting-tape", name: "Tape", shape: rectangle(6, 120), grain: "straight" },
    ],
    seams: [
      { id: "pennant-edges", name: "Flag edges", profile: SEAM_PROFILES.wavy },
      { id: "bunting-tape", name: "Tape seam", profile: SEAM_PROFILES.straight },
    ],
    partGroups: [],
  },
  {
    id: "garden-apron",
    name: "Garden Apron",
    blurb: "A bib apron with long ties and room for pockets.",
    baseValue: 50,
    tags: ["casual", "classic"],
    blockedMaterials: ["tulle", "silk"],
    sewHours: 2,
    pieces: [
      { id: "apron-bib", name: "Bib", shape: rectangle(30, 28), grain: "straight" },
      { id: "apron-skirt", name: "Apron skirt", shape: rectangle(60, 45), grain: "straight" },
      ...numbered("apron-tie", "Tie", 2, () => rectangle(8, 70)),
    ],
    seams: [
      { id: "apron-hems", name: "Hems", profile: SEAM_PROFILES.straight },
      { id: "apron-ties", name: "Ties", profile: SEAM_PROFILES.straight },
      { id: "apron-waist", name: "Waist seam", profile: SEAM_PROFILES.gentle },
    ],
    partGroups: [],
  },
  {
    id: "patch-throw",
    name: "Patchwork Lap Throw",
    blurb: "Nine squares from two finds, bound with a soft edge.",
    baseValue: 75,
    tags: ["classic", "dreamy"],
    blockedMaterials: ["tulle"],
    sewHours: 2,
    pieces: [
      ...numbered("square", "Square", PATCH_THROW_SQUARES, () => rectangle(20, 20)),
      ...numbered("binding", "Binding", 2, () => rectangle(8, 64)),
    ],
    seams: [
      { id: "throw-rows", name: "Rows", profile: SEAM_PROFILES.straight },
      { id: "throw-columns", name: "Columns", profile: SEAM_PROFILES.straight },
      { id: "throw-binding", name: "Binding", profile: SEAM_PROFILES.gentle },
    ],
    partGroups: [],
  },
  {
    id: "remade-pinafore",
    name: "Remade Pinafore",
    blurb: "A sleeveless bodice joined to a swishy skirt.",
    baseValue: 110,
    tags: [],
    blockedMaterials: [],
    sewHours: 3,
    pieces: [],
    seams: [{ id: "pinafore-join", name: "Join bodice and skirt", profile: SEAM_PROFILES.gentle }],
    partGroups: [
      { id: "bodice", label: "Body", partIds: ["fitted-bodice", "wrap-bodice"] },
      { id: "skirt", label: "Skirt shape", partIds: ["a-line-skirt", "mini-skirt"] },
    ],
  },
];
