import type { Point } from "../../../engine/geometry/point";
import type { GarmentSlot } from "./garmentSlot";
import type { StyleTag } from "./styleTag";

export const PART_CATEGORIES = ["bodice", "neckline", "sleeves", "skirt"] as const;
export type PartCategory = (typeof PART_CATEGORIES)[number];

export interface PatternPieceDef {
  id: string;
  name: string;
  slot: GarmentSlot;
  shape: readonly Point[];
  grain: "straight" | "bias-friendly";
}

export interface SeamDef {
  id: string;
  name: string;
  profile: readonly number[];
}

export interface GarmentPartDef {
  id: string;
  category: PartCategory;
  name: string;
  tags: readonly StyleTag[];
  pieces: readonly PatternPieceDef[];
  seams: readonly SeamDef[];
}

const gentle = [0, 0.1, 0.2, 0.15, 0, -0.15, -0.2, -0.1, 0, 0.1, 0.15, 0];
const curved = [0, 0.3, 0.55, 0.7, 0.6, 0.35, 0, -0.35, -0.6, -0.7, -0.55, -0.3, 0];
const straight = [0, 0.05, 0, -0.05, 0, 0.05, 0, -0.05, 0];
const wavy = [0, 0.45, 0, -0.45, 0, 0.45, 0, -0.45, 0, 0.45, 0];

const bodiceSeams: readonly SeamDef[] = [
  { id: "side-seams", name: "Side seams", profile: gentle },
  { id: "shoulder-seams", name: "Shoulder seams", profile: straight },
];

const sleeveShape: readonly Point[] = [
  [0, 12],
  [8, 3],
  [19, 0],
  [30, 3],
  [38, 12],
  [34, 32],
  [4, 32],
];
const capShape: readonly Point[] = [
  [0, 10],
  [8, 2],
  [15, 0],
  [22, 2],
  [30, 10],
  [26, 14],
  [4, 14],
];
const bishopShape: readonly Point[] = [
  [4, 12],
  [14, 2],
  [24, 0],
  [34, 2],
  [44, 12],
  [48, 60],
  [0, 60],
];
const aLineShape: readonly Point[] = [
  [15, 0],
  [55, 0],
  [70, 70],
  [0, 70],
];
const ballgownShape: readonly Point[] = [
  [38, 0],
  [82, 0],
  [120, 70],
  [116, 96],
  [60, 100],
  [4, 96],
  [0, 70],
];
const pencilShape: readonly Point[] = [
  [2, 0],
  [42, 0],
  [44, 20],
  [42, 65],
  [2, 65],
  [0, 20],
];
const miniShape: readonly Point[] = [
  [10, 0],
  [46, 0],
  [56, 40],
  [0, 40],
];

const setSleeveSeams: readonly SeamDef[] = [
  { id: "set-left-sleeve", name: "Set left sleeve", profile: curved },
  { id: "set-right-sleeve", name: "Set right sleeve", profile: curved },
];

const skirtSeams: readonly SeamDef[] = [
  { id: "skirt-side-seams", name: "Skirt side seams", profile: straight },
  { id: "waist-seam", name: "Waist seam", profile: gentle },
  { id: "hem", name: "Hem", profile: wavy },
];

export const GARMENT_PARTS: readonly GarmentPartDef[] = [
  {
    id: "fitted-bodice",
    category: "bodice",
    name: "Fitted Bodice",
    tags: ["classic", "elegant"],
    pieces: [
      {
        id: "fitted-front",
        name: "Bodice front",
        slot: "bodice-front",
        grain: "straight",
        shape: [
          [0, 0],
          [14, 0],
          [18, 6],
          [32, 6],
          [36, 0],
          [50, 0],
          [46, 18],
          [44, 40],
          [6, 40],
          [4, 18],
        ],
      },
      {
        id: "fitted-back",
        name: "Bodice back",
        slot: "bodice-back",
        grain: "straight",
        shape: [
          [0, 0],
          [50, 0],
          [46, 18],
          [44, 40],
          [6, 40],
          [4, 18],
        ],
      },
    ],
    seams: bodiceSeams,
  },
  {
    id: "corset-bodice",
    category: "bodice",
    name: "Corset Bodice",
    tags: ["regal", "edgy"],
    pieces: [
      {
        id: "corset-front",
        name: "Corset front",
        slot: "bodice-front",
        grain: "straight",
        shape: [
          [2, 4],
          [14, 0],
          [25, 6],
          [36, 0],
          [48, 4],
          [44, 22],
          [40, 40],
          [25, 44],
          [10, 40],
          [6, 22],
        ],
      },
      {
        id: "corset-back",
        name: "Corset back",
        slot: "bodice-back",
        grain: "straight",
        shape: [
          [2, 4],
          [48, 4],
          [44, 22],
          [40, 40],
          [10, 40],
          [6, 22],
        ],
      },
    ],
    seams: bodiceSeams,
  },
  {
    id: "wrap-bodice",
    category: "bodice",
    name: "Wrap Bodice",
    tags: ["romantic", "casual"],
    pieces: [
      {
        id: "wrap-front",
        name: "Wrap front",
        slot: "bodice-front",
        grain: "bias-friendly",
        shape: [
          [0, 0],
          [12, 0],
          [44, 34],
          [48, 40],
          [4, 40],
          [2, 18],
        ],
      },
      {
        id: "wrap-back",
        name: "Wrap back",
        slot: "bodice-back",
        grain: "straight",
        shape: [
          [0, 0],
          [48, 0],
          [46, 18],
          [44, 40],
          [4, 40],
          [2, 18],
        ],
      },
    ],
    seams: bodiceSeams,
  },
  {
    id: "sweetheart-neckline",
    category: "neckline",
    name: "Sweetheart Neckline",
    tags: ["romantic"],
    pieces: [
      {
        id: "sweetheart-facing",
        name: "Sweetheart facing",
        slot: "neckline",
        grain: "bias-friendly",
        shape: [
          [0, 0],
          [10, 6],
          [20, 2],
          [30, 6],
          [40, 0],
          [40, 6],
          [30, 12],
          [20, 8],
          [10, 12],
          [0, 6],
        ],
      },
    ],
    seams: [{ id: "neckline-attach", name: "Attach neckline", profile: curved }],
  },
  {
    id: "peter-pan-collar",
    category: "neckline",
    name: "Peter Pan Collar",
    tags: ["playful", "classic"],
    pieces: [
      {
        id: "peter-pan",
        name: "Peter Pan collar",
        slot: "neckline",
        grain: "straight",
        shape: [
          [0, 0],
          [36, 0],
          [34, 6],
          [28, 10],
          [18, 8],
          [8, 10],
          [2, 6],
        ],
      },
    ],
    seams: [{ id: "neckline-attach", name: "Attach collar", profile: curved }],
  },
  {
    id: "high-collar",
    category: "neckline",
    name: "High Collar",
    tags: ["regal", "elegant"],
    pieces: [
      {
        id: "high-collar-band",
        name: "Collar band",
        slot: "neckline",
        grain: "straight",
        shape: [
          [0, 0],
          [40, 0],
          [40, 9],
          [0, 9],
        ],
      },
    ],
    seams: [{ id: "neckline-attach", name: "Attach collar", profile: gentle }],
  },
  {
    id: "sleeveless",
    category: "sleeves",
    name: "Sleeveless",
    tags: ["casual", "sporty"],
    pieces: [],
    seams: [],
  },
  {
    id: "puff-sleeve",
    category: "sleeves",
    name: "Puff Sleeves",
    tags: ["playful", "dreamy"],
    pieces: [
      {
        id: "puff-left",
        name: "Left puff sleeve",
        slot: "sleeve-left",
        grain: "straight",
        shape: sleeveShape,
      },
      {
        id: "puff-right",
        name: "Right puff sleeve",
        slot: "sleeve-right",
        grain: "straight",
        shape: sleeveShape,
      },
    ],
    seams: setSleeveSeams,
  },
  {
    id: "cap-sleeve",
    category: "sleeves",
    name: "Cap Sleeves",
    tags: ["classic"],
    pieces: [
      { id: "cap-left", name: "Left cap sleeve", slot: "sleeve-left", grain: "straight", shape: capShape },
      { id: "cap-right", name: "Right cap sleeve", slot: "sleeve-right", grain: "straight", shape: capShape },
    ],
    seams: setSleeveSeams,
  },
  {
    id: "bishop-sleeve",
    category: "sleeves",
    name: "Bishop Sleeves",
    tags: ["romantic", "dreamy"],
    pieces: [
      {
        id: "bishop-left",
        name: "Left bishop sleeve",
        slot: "sleeve-left",
        grain: "straight",
        shape: bishopShape,
      },
      {
        id: "bishop-right",
        name: "Right bishop sleeve",
        slot: "sleeve-right",
        grain: "straight",
        shape: bishopShape,
      },
    ],
    seams: setSleeveSeams,
  },
  {
    id: "a-line-skirt",
    category: "skirt",
    name: "A-line Skirt",
    tags: ["classic", "casual"],
    pieces: [
      { id: "a-line-front", name: "Skirt front", slot: "skirt-front", grain: "straight", shape: aLineShape },
      { id: "a-line-back", name: "Skirt back", slot: "skirt-back", grain: "straight", shape: aLineShape },
    ],
    seams: skirtSeams,
  },
  {
    id: "ballgown-skirt",
    category: "skirt",
    name: "Ballgown Skirt",
    tags: ["regal", "dreamy"],
    pieces: [
      {
        id: "ballgown-front",
        name: "Ballgown front",
        slot: "skirt-front",
        grain: "bias-friendly",
        shape: ballgownShape,
      },
      {
        id: "ballgown-back",
        name: "Ballgown back",
        slot: "skirt-back",
        grain: "bias-friendly",
        shape: ballgownShape,
      },
    ],
    seams: skirtSeams,
  },
  {
    id: "pencil-skirt",
    category: "skirt",
    name: "Pencil Skirt",
    tags: ["elegant", "edgy"],
    pieces: [
      {
        id: "pencil-front",
        name: "Pencil front",
        slot: "skirt-front",
        grain: "straight",
        shape: pencilShape,
      },
      { id: "pencil-back", name: "Pencil back", slot: "skirt-back", grain: "straight", shape: pencilShape },
    ],
    seams: skirtSeams,
  },
  {
    id: "mini-skirt",
    category: "skirt",
    name: "Flared Mini",
    tags: ["playful", "sporty", "edgy"],
    pieces: [
      { id: "mini-front", name: "Mini front", slot: "skirt-front", grain: "bias-friendly", shape: miniShape },
      { id: "mini-back", name: "Mini back", slot: "skirt-back", grain: "bias-friendly", shape: miniShape },
    ],
    seams: skirtSeams,
  },
];
