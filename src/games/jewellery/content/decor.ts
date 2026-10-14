export const DECOR_IDS = ["lantern-string", "mirror-easel", "velvet-awning"] as const;
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
];
