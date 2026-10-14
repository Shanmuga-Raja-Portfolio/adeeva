import type { Point } from "../../../engine/geometry/point";
import type { MaterialId } from "../../../engine/palette";
import { SEAM_PROFILES, type PatternPieceDef } from "../../adeeva/content/garmentPart";
import type { GarmentSlot } from "../../adeeva/content/garmentSlot";
import type { StyleTag } from "../../../engine/styleTag";

export const RECIPE_IDS = [
  "scrunchie-trio",
  "cushion-cover",
  "tote-bag",
  "bucket-hat",
  "remade-skirt",
  "remade-top",
] as const;
export type RecipeId = (typeof RECIPE_IDS)[number];

export interface RecipePiece {
  readonly id: string;
  readonly name: string;
  readonly shape: readonly Point[];
  readonly grain: PatternPieceDef["grain"];
  readonly slot?: GarmentSlot | undefined;
}

export interface RecipeSeam {
  readonly id: string;
  readonly name: string;
  readonly profile: readonly number[];
}

export interface PartGroup {
  readonly id: string;
  readonly label: string;
  readonly partIds: readonly string[];
}

export interface RecipeDef {
  readonly id: RecipeId;
  readonly name: string;
  readonly blurb: string;
  readonly baseValue: number;
  readonly tags: readonly StyleTag[];
  readonly blockedMaterials: readonly MaterialId[];
  readonly sewHours: number;
  readonly pieces: readonly RecipePiece[];
  readonly seams: readonly RecipeSeam[];
  readonly partGroups: readonly PartGroup[];
}

function rectangle(width: number, height: number): readonly Point[] {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
}

const CROWN: readonly Point[] = [
  [5.27, 0],
  [12.73, 0],
  [18, 5.27],
  [18, 12.73],
  [12.73, 18],
  [5.27, 18],
  [0, 12.73],
  [0, 5.27],
];

const BRIM: readonly Point[] = [
  [0, 6],
  [5, 3.38],
  [10, 1.5],
  [15, 0.38],
  [20, 0],
  [25, 0.38],
  [30, 1.5],
  [35, 3.38],
  [40, 6],
  [40, 12],
  [35, 9.38],
  [30, 7.5],
  [25, 6.38],
  [20, 6],
  [15, 6.38],
  [10, 7.5],
  [5, 9.38],
  [0, 12],
];

export const RECIPES: readonly RecipeDef[] = [
  {
    id: "scrunchie-trio",
    name: "Scrunchie Trio",
    blurb: "Three bouncy hair ties from long strips.",
    baseValue: 18,
    tags: ["playful"],
    blockedMaterials: ["wool"],
    sewHours: 1,
    pieces: [
      { id: "strip-1", name: "Strip one", shape: rectangle(50, 10), grain: "straight" },
      { id: "strip-2", name: "Strip two", shape: rectangle(50, 10), grain: "straight" },
      { id: "strip-3", name: "Strip three", shape: rectangle(50, 10), grain: "straight" },
    ],
    seams: [
      { id: "tube", name: "Tube seam", profile: SEAM_PROFILES.straight },
      { id: "loop", name: "Close the loop", profile: SEAM_PROFILES.gentle },
    ],
    partGroups: [],
  },
  {
    id: "cushion-cover",
    name: "Envelope Cushion",
    blurb: "A cosy cushion with a tuck-in back.",
    baseValue: 35,
    tags: ["classic"],
    blockedMaterials: ["tulle"],
    sewHours: 2,
    pieces: [
      { id: "cushion-front", name: "Front", shape: rectangle(45, 45), grain: "straight" },
      { id: "cushion-back-1", name: "Back flap", shape: rectangle(45, 30), grain: "straight" },
      { id: "cushion-back-2", name: "Back tuck", shape: rectangle(45, 30), grain: "straight" },
    ],
    seams: [
      { id: "hems", name: "Flap hems", profile: SEAM_PROFILES.straight },
      { id: "outer", name: "Outer edge", profile: SEAM_PROFILES.gentle },
    ],
    partGroups: [],
  },
  {
    id: "tote-bag",
    name: "Market Tote",
    blurb: "A sturdy bag with two long straps.",
    baseValue: 40,
    tags: ["casual"],
    blockedMaterials: ["tulle", "silk"],
    sewHours: 2,
    pieces: [
      { id: "tote-body-1", name: "Bag front", shape: rectangle(36, 40), grain: "straight" },
      { id: "tote-body-2", name: "Bag back", shape: rectangle(36, 40), grain: "straight" },
      { id: "tote-strap-1", name: "Strap one", shape: rectangle(8, 60), grain: "straight" },
      { id: "tote-strap-2", name: "Strap two", shape: rectangle(8, 60), grain: "straight" },
    ],
    seams: [
      { id: "sides", name: "Side seams", profile: SEAM_PROFILES.straight },
      { id: "straps", name: "Strap seams", profile: SEAM_PROFILES.straight },
      { id: "top-hem", name: "Top hem", profile: SEAM_PROFILES.gentle },
    ],
    partGroups: [],
  },
  {
    id: "bucket-hat",
    name: "Bucket Hat",
    blurb: "A sunny hat with a soft wavy brim.",
    baseValue: 45,
    tags: ["sporty", "playful"],
    blockedMaterials: ["tulle", "silk"],
    sewHours: 2,
    pieces: [
      { id: "hat-crown", name: "Crown", shape: CROWN, grain: "straight" },
      { id: "hat-band-1", name: "Band one", shape: rectangle(30, 8), grain: "straight" },
      { id: "hat-band-2", name: "Band two", shape: rectangle(30, 8), grain: "straight" },
      { id: "hat-brim-1", name: "Brim one", shape: BRIM, grain: "straight" },
      { id: "hat-brim-2", name: "Brim two", shape: BRIM, grain: "straight" },
    ],
    seams: [
      { id: "band", name: "Band seam", profile: SEAM_PROFILES.gentle },
      { id: "crown", name: "Crown seam", profile: SEAM_PROFILES.curved },
      { id: "brim", name: "Brim edge", profile: SEAM_PROFILES.wavy },
    ],
    partGroups: [],
  },
  {
    id: "remade-skirt",
    name: "Remade Skirt",
    blurb: "A fresh skirt cut from a loved find.",
    baseValue: 60,
    tags: [],
    blockedMaterials: [],
    sewHours: 2,
    pieces: [],
    seams: [],
    partGroups: [
      { id: "skirt", label: "Skirt shape", partIds: ["mini-skirt", "a-line-skirt", "pencil-skirt"] },
    ],
  },
  {
    id: "remade-top",
    name: "Remade Top",
    blurb: "A new top with a choice of sleeves.",
    baseValue: 70,
    tags: [],
    blockedMaterials: ["denim"],
    sewHours: 2,
    pieces: [],
    seams: [],
    partGroups: [
      { id: "bodice", label: "Body", partIds: ["fitted-bodice", "wrap-bodice"] },
      { id: "sleeves", label: "Sleeves", partIds: ["sleeveless", "cap-sleeve"] },
    ],
  },
];
