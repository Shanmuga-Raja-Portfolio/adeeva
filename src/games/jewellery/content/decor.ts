export const DECOR_IDS = [
  "lantern-string",
  "mirror-easel",
  "velvet-awning",
  "music-box-shelf",
  "paper-moon",
  "patchwork-rug",
] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export interface DecorDef {
  readonly id: DecorId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
}

export const DECOR: readonly DecorDef[] = [
  {
    id: "lantern-string",
    name: "Lantern String",
    description: "Little lanterns glow over your stall.",
    price: 40,
    minReputation: 0,
  },
  {
    id: "mirror-easel",
    name: "Little Mirror Easel",
    description: "A tiny mirror that twinkles back at the tray.",
    price: 80,
    minReputation: 0,
  },
  {
    id: "velvet-awning",
    name: "Velvet Awning",
    description: "A soft velvet roof in your tray cloth colour.",
    price: 120,
    minReputation: 0,
  },
  {
    id: "music-box-shelf",
    name: "Music Box Shelf",
    description: "A shelf of Mr. Osei's little music boxes, lids open.",
    price: 60,
    minReputation: 0,
  },
  {
    id: "paper-moon",
    name: "Paper Moon",
    description: "A glowing paper moon with a little electric lamp inside.",
    price: 50,
    minReputation: 0,
  },
  {
    id: "patchwork-rug",
    name: "Patchwork Rug",
    description: "A cosy patchwork rug in your tray cloth colour.",
    price: 90,
    minReputation: 0,
  },
];
