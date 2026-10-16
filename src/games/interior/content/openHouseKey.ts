export const KEY_IDS = ["welcome", "copper", "silver", "gold", "star"] as const;
export type KeyId = (typeof KEY_IDS)[number];

export interface KeyDef {
  readonly id: KeyId;
  readonly name: string;
  readonly minimum: number;
  readonly metal: string;
  readonly shine: string;
  readonly line: string;
}

export const KEYS: readonly KeyDef[] = [
  {
    id: "welcome",
    name: "Welcome Key",
    minimum: 0,
    metal: "#7fa37c",
    shine: "#d9ead6",
    line: "Thank you for opening your doors!",
  },
  {
    id: "copper",
    name: "Copper Key",
    minimum: 55,
    metal: "#c8664a",
    shine: "#f2b49c",
    line: "A warm home that visitors enjoyed.",
  },
  {
    id: "silver",
    name: "Silver Key",
    minimum: 70,
    metal: "#98a6b8",
    shine: "#eef3f8",
    line: "Visitors loved walking through.",
  },
  {
    id: "gold",
    name: "Gold Key",
    minimum: 85,
    metal: "#c9a227",
    shine: "#fbe7a1",
    line: "A home people didn't want to leave.",
  },
  {
    id: "star",
    name: "Larkspur Star",
    minimum: 95,
    metal: "#8f7cc4",
    shine: "#fff4c2",
    line: "The whole street is still talking about it!",
  },
];

export const VERDICTS: readonly (readonly [number, string])[] = [
  [85, "Delighted"],
  [70, "Loved it"],
  [55, "Enjoyed it"],
  [0, "Warmly welcomed"],
];
