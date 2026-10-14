import type { Point } from "../../../engine/geometry/point";
import type { ColourId, MaterialId, PrintId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { TrimId } from "../../adeeva/content/trim";
import { BOUTIQUE_FIND_IDS, BOUTIQUE_FINDS } from "./boutiqueFind";

const STALL_FIND_IDS = [
  "faded-jeans",
  "gingham-shirt",
  "linen-curtain",
  "sailor-top",
  "polka-tablecloth",
  "tea-dress",
  "black-jeans",
  "tulle-petticoat",
  "wool-blazer",
  "scarf-pair",
  "satin-dress",
  "party-skirt",
  "sparkle-cardigan",
  "check-coat",
] as const;
export const FIND_IDS = [...STALL_FIND_IDS, ...BOUTIQUE_FIND_IDS] as const;
export type FindId = (typeof FIND_IDS)[number];

export type FindShape = "jeans" | "shirt" | "dress" | "cloth" | "coat" | "skirt";

export interface PanelSize {
  readonly width: number;
  readonly height: number;
}

export interface NotionDef {
  readonly stitch: number;
  readonly notion: TrimId;
}

export interface StitchLineDef {
  readonly panel: number;
  readonly from: Point;
  readonly to: Point;
  readonly stitches: number;
  readonly notions: readonly NotionDef[];
}

export interface WornSpotDef {
  readonly panel: number;
  readonly x: number;
  readonly y: number;
}

export interface FindDef {
  readonly id: FindId;
  readonly name: string;
  readonly material: MaterialId;
  readonly colour: ColourId;
  readonly print: PrintId;
  readonly shape: FindShape;
  readonly panels: readonly PanelSize[];
  readonly price: number;
  readonly tags: readonly StyleTag[];
  readonly lines: readonly StitchLineDef[];
  readonly wornSpots: readonly [WornSpotDef, WornSpotDef];
  readonly minReputation: number;
  readonly backstory: string;
}

export const WORN_SPOT_SIZE = 12;

const JEANS_PANELS: readonly PanelSize[] = [
  { width: 60, height: 95 },
  { width: 60, height: 95 },
];

const JEANS_LINES: readonly StitchLineDef[] = [
  { panel: 0, from: [4, 12], to: [4, 48], stitches: 10, notions: [] },
  { panel: 1, from: [56, 12], to: [56, 48], stitches: 10, notions: [] },
  { panel: 0, from: [20, 4], to: [40, 4], stitches: 6, notions: [{ stitch: 2, notion: "button" }] },
];

const JEANS_SPOTS: readonly [WornSpotDef, WornSpotDef] = [
  { panel: 0, x: 44, y: 79 },
  { panel: 1, x: 4, y: 79 },
];

const STALL_FINDS: readonly FindDef[] = [
  {
    id: "faded-jeans",
    name: "Faded Jeans",
    material: "denim",
    colour: "navy",
    print: "solid",
    shape: "jeans",
    panels: JEANS_PANELS,
    price: 14,
    tags: ["casual", "edgy"],
    lines: JEANS_LINES,
    wornSpots: JEANS_SPOTS,
    minReputation: 0,
    backstory: "Climbed a hundred apple trees",
  },
  {
    id: "gingham-shirt",
    name: "Gingham Shirt",
    material: "cotton",
    colour: "sky",
    print: "check",
    shape: "shirt",
    panels: [
      { width: 55, height: 70 },
      { width: 28, height: 70 },
      { width: 28, height: 70 },
    ],
    price: 8,
    tags: ["playful", "casual"],
    lines: [
      {
        panel: 1,
        from: [14, 4],
        to: [14, 36],
        stitches: 9,
        notions: [
          { stitch: 1, notion: "button" },
          { stitch: 4, notion: "button" },
          { stitch: 7, notion: "button" },
        ],
      },
      {
        panel: 2,
        from: [14, 4],
        to: [14, 36],
        stitches: 9,
        notions: [
          { stitch: 1, notion: "button" },
          { stitch: 4, notion: "button" },
          { stitch: 7, notion: "button" },
        ],
      },
      { panel: 0, from: [13, 4], to: [41, 4], stitches: 8, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 39, y: 54 },
      { panel: 0, x: 4, y: 54 },
    ],
    minReputation: 0,
    backstory: "Went to every school picnic",
  },
  {
    id: "linen-curtain",
    name: "Linen Curtain",
    material: "linen",
    colour: "sage",
    print: "solid",
    shape: "cloth",
    panels: [{ width: 120, height: 160 }],
    price: 20,
    tags: ["classic", "casual"],
    lines: [
      { panel: 0, from: [4, 20], to: [4, 64], stitches: 12, notions: [{ stitch: 6, notion: "ribbon-belt" }] },
      { panel: 0, from: [116, 20], to: [116, 64], stitches: 12, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 104, y: 144 },
      { panel: 0, x: 4, y: 144 },
    ],
    minReputation: 0,
    backstory: "Shaded a bakery window",
  },
  {
    id: "sailor-top",
    name: "Stripy Sailor Top",
    material: "cotton",
    colour: "navy",
    print: "stripe",
    shape: "shirt",
    panels: [
      { width: 50, height: 60 },
      { width: 50, height: 60 },
    ],
    price: 10,
    tags: ["casual", "classic"],
    lines: [
      { panel: 0, from: [4, 8], to: [4, 36], stitches: 8, notions: [] },
      { panel: 1, from: [46, 8], to: [46, 36], stitches: 8, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 2, y: 46 },
      { panel: 0, x: 20, y: 46 },
    ],
    minReputation: 0,
    backstory: "Sailed a tiny boat round the harbour",
  },
  {
    id: "polka-tablecloth",
    name: "Polka Tablecloth",
    material: "cotton",
    colour: "mustard",
    print: "dot",
    shape: "cloth",
    panels: [{ width: 130, height: 130 }],
    price: 12,
    tags: ["playful"],
    lines: [{ panel: 0, from: [20, 4], to: [64, 4], stitches: 12, notions: [] }],
    wornSpots: [
      { panel: 0, x: 114, y: 114 },
      { panel: 0, x: 4, y: 114 },
    ],
    minReputation: 0,
    backstory: "Hosted thirty birthday teas",
  },
  {
    id: "tea-dress",
    name: "Garden Tea Dress",
    material: "cotton",
    colour: "blush",
    print: "floral",
    shape: "dress",
    panels: [
      { width: 120, height: 70 },
      { width: 40, height: 40 },
    ],
    price: 18,
    tags: ["romantic", "playful"],
    lines: [
      { panel: 0, from: [4, 10], to: [4, 46], stitches: 10, notions: [] },
      { panel: 0, from: [116, 10], to: [116, 38], stitches: 8, notions: [] },
      { panel: 1, from: [8, 4], to: [28, 4], stitches: 6, notions: [{ stitch: 3, notion: "bow" }] },
    ],
    wornSpots: [
      { panel: 0, x: 104, y: 54 },
      { panel: 1, x: 24, y: 24 },
    ],
    minReputation: 0,
    backstory: "Danced at forty summer fairs",
  },
  {
    id: "black-jeans",
    name: "Midnight Jeans",
    material: "denim",
    colour: "black",
    print: "solid",
    shape: "jeans",
    panels: JEANS_PANELS,
    price: 16,
    tags: ["edgy", "bold"],
    lines: JEANS_LINES,
    wornSpots: JEANS_SPOTS,
    minReputation: 5,
    backstory: "Played in a garage band",
  },
  {
    id: "tulle-petticoat",
    name: "Puffy Petticoat",
    material: "tulle",
    colour: "blush",
    print: "solid",
    shape: "skirt",
    panels: [{ width: 140, height: 60 }],
    price: 12,
    tags: ["dreamy", "romantic"],
    lines: [
      { panel: 0, from: [20, 4], to: [64, 4], stitches: 12, notions: [{ stitch: 5, notion: "lace" }] },
      { panel: 0, from: [80, 4], to: [108, 4], stitches: 8, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 124, y: 44 },
      { panel: 0, x: 4, y: 44 },
    ],
    minReputation: 5,
    backstory: "Twirled through a school play",
  },
  {
    id: "wool-blazer",
    name: "Grandad's Blazer",
    material: "wool",
    colour: "charcoal",
    print: "solid",
    shape: "coat",
    panels: [
      { width: 50, height: 70 },
      { width: 30, height: 70 },
      { width: 30, height: 70 },
    ],
    price: 22,
    tags: ["classic", "elegant"],
    lines: [
      { panel: 0, from: [4, 8], to: [4, 40], stitches: 9, notions: [] },
      {
        panel: 1,
        from: [15, 8],
        to: [15, 40],
        stitches: 9,
        notions: [
          { stitch: 1, notion: "button" },
          { stitch: 4, notion: "button" },
          { stitch: 7, notion: "button" },
        ],
      },
      { panel: 2, from: [15, 8], to: [15, 36], stitches: 8, notions: [] },
      { panel: 0, from: [15, 4], to: [35, 4], stitches: 6, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 34, y: 54 },
      { panel: 2, x: 14, y: 54 },
    ],
    minReputation: 9,
    backstory: "Went to chess club every Tuesday",
  },
  {
    id: "scarf-pair",
    name: "Twin Silk Scarves",
    material: "silk",
    colour: "lavender",
    print: "floral",
    shape: "cloth",
    panels: [
      { width: 70, height: 70 },
      { width: 70, height: 70 },
    ],
    price: 15,
    tags: ["romantic", "elegant"],
    lines: [{ panel: 0, from: [21, 4], to: [49, 4], stitches: 8, notions: [] }],
    wornSpots: [
      { panel: 0, x: 54, y: 54 },
      { panel: 1, x: 4, y: 54 },
    ],
    minReputation: 9,
    backstory: "Blew about on a seaside pier",
  },
  {
    id: "satin-dress",
    name: "Teal Satin Dress",
    material: "satin",
    colour: "teal",
    print: "solid",
    shape: "dress",
    panels: [{ width: 60, height: 110 }],
    price: 16,
    tags: ["elegant"],
    lines: [
      {
        panel: 0,
        from: [4, 10],
        to: [4, 46],
        stitches: 10,
        notions: [
          { stitch: 3, notion: "pearl" },
          { stitch: 6, notion: "pearl" },
        ],
      },
      { panel: 0, from: [56, 10], to: [56, 46], stitches: 10, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 47, y: 4 },
      { panel: 0, x: 47, y: 94 },
    ],
    minReputation: 13,
    backstory: "Went to a wedding by the lake",
  },
  {
    id: "party-skirt",
    name: "Velvet Party Skirt",
    material: "velvet",
    colour: "plum",
    print: "solid",
    shape: "skirt",
    panels: [{ width: 90, height: 65 }],
    price: 18,
    tags: ["regal", "bold"],
    lines: [
      { panel: 0, from: [4, 10], to: [4, 42], stitches: 9, notions: [] },
      { panel: 0, from: [86, 10], to: [86, 38], stitches: 8, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 2, y: 51 },
      { panel: 0, x: 30, y: 51 },
    ],
    minReputation: 13,
    backstory: "Sparkled at a New Year party",
  },
  {
    id: "sparkle-cardigan",
    name: "Disco Cardigan",
    material: "satin",
    colour: "black",
    print: "sparkle",
    shape: "shirt",
    panels: [
      { width: 50, height: 60 },
      { width: 50, height: 60 },
    ],
    price: 20,
    tags: ["bold", "edgy"],
    lines: [
      { panel: 0, from: [4, 8], to: [4, 36], stitches: 8, notions: [{ stitch: 3, notion: "sequin-patch" }] },
      {
        panel: 1,
        from: [46, 8],
        to: [46, 36],
        stitches: 8,
        notions: [{ stitch: 4, notion: "sequin-patch" }],
      },
      { panel: 0, from: [15, 4], to: [35, 4], stitches: 6, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 2, y: 46 },
      { panel: 0, x: 20, y: 46 },
    ],
    minReputation: 18,
    backstory: "Spun round a roller-rink disco",
  },
  {
    id: "check-coat",
    name: "Coral Check Coat",
    material: "wool",
    colour: "coral",
    print: "check",
    shape: "coat",
    panels: [
      { width: 60, height: 90 },
      { width: 35, height: 90 },
    ],
    price: 24,
    tags: ["classic", "bold"],
    lines: [
      { panel: 0, from: [4, 10], to: [4, 46], stitches: 10, notions: [] },
      {
        panel: 1,
        from: [17, 10],
        to: [17, 46],
        stitches: 10,
        notions: [
          { stitch: 1, notion: "button" },
          { stitch: 3, notion: "button" },
          { stitch: 5, notion: "button" },
          { stitch: 7, notion: "button" },
        ],
      },
      { panel: 0, from: [56, 10], to: [56, 38], stitches: 8, notions: [] },
      { panel: 0, from: [20, 4], to: [40, 4], stitches: 6, notions: [] },
    ],
    wornSpots: [
      { panel: 0, x: 44, y: 74 },
      { panel: 1, x: 19, y: 74 },
    ],
    minReputation: 18,
    backstory: "Walked a big dog through ten winters",
  },
];

export const FINDS: readonly FindDef[] = [...STALL_FINDS, ...BOUTIQUE_FINDS];
