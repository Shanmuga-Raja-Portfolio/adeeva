import type { MaterialId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";

export interface MaterialDef {
  id: MaterialId;
  name: string;
  drape: number;
  sheen: number;
  sewDifficulty: number;
  tags: readonly StyleTag[];
}

export const MATERIALS: readonly MaterialDef[] = [
  { id: "cotton", name: "Cotton", drape: 0.4, sheen: 0.1, sewDifficulty: 0.1, tags: ["casual", "classic"] },
  { id: "linen", name: "Linen", drape: 0.35, sheen: 0.1, sewDifficulty: 0.2, tags: ["casual", "classic"] },
  { id: "wool", name: "Wool", drape: 0.3, sheen: 0.05, sewDifficulty: 0.3, tags: ["classic", "elegant"] },
  { id: "silk", name: "Silk", drape: 0.9, sheen: 0.7, sewDifficulty: 0.7, tags: ["elegant", "romantic"] },
  { id: "satin", name: "Satin", drape: 0.75, sheen: 0.9, sewDifficulty: 0.6, tags: ["elegant", "regal"] },
  { id: "velvet", name: "Velvet", drape: 0.6, sheen: 0.5, sewDifficulty: 0.55, tags: ["regal", "bold"] },
  { id: "tulle", name: "Tulle", drape: 0.8, sheen: 0.3, sewDifficulty: 0.65, tags: ["dreamy", "romantic"] },
  {
    id: "denim",
    name: "Denim",
    drape: 0.15,
    sheen: 0.05,
    sewDifficulty: 0.4,
    tags: ["casual", "edgy", "sporty"],
  },
];
