export const BACKDROP_IDS = ["teal-velvet", "linen", "slate", "moon-paper"] as const;
export type BackdropId = (typeof BACKDROP_IDS)[number];

export interface BackdropDef {
  readonly id: BackdropId;
  readonly name: string;
  readonly word: string;
  readonly base: string;
  readonly detail: string;
}

export const BACKDROPS: readonly BackdropDef[] = [
  { id: "teal-velvet", name: "Teal Velvet", word: "deep", base: "#1f4e5a", detail: "#2f6b78" },
  { id: "linen", name: "Linen", word: "fresh", base: "#efe6d2", detail: "#ddcfb3" },
  { id: "slate", name: "Slate", word: "strong", base: "#4a5360", detail: "#5f6a78" },
  { id: "moon-paper", name: "Moon Paper", word: "magic", base: "#2b2f5c", detail: "#f3e7b0" },
];
