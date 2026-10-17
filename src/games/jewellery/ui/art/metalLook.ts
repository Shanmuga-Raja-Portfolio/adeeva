import type { FinishId } from "../../content/finish";
import type { MetalId } from "../../content/metal";
import { mixHex } from "../../../../ui/art/colourMix";

export interface MetalLook {
  readonly light: string;
  readonly mid: string;
  readonly dark: string;
  readonly line: string;
}

const LOOKS: Readonly<Record<MetalId, MetalLook>> = {
  copper: { light: "#f6c09a", mid: "#c47a4a", dark: "#7c4524", line: "#5a2f17" },
  brass: { light: "#f8e39a", mid: "#c9a227", dark: "#7d6312", line: "#5b470b" },
  silver: { light: "#ffffff", mid: "#c7ccd4", dark: "#7c8592", line: "#535a66" },
  bronze: { light: "#e2bd88", mid: "#a0773e", dark: "#5f431f", line: "#432e14" },
  "rose-gold": { light: "#fbdccf", mid: "#d9a08b", dark: "#9a5e4c", line: "#6e3f31" },
  gold: { light: "#fff3b0", mid: "#d9b23c", dark: "#8f6e10", line: "#664e08" },
  pewter: { light: "#e3e6ea", mid: "#9aa0a6", dark: "#5f646b", line: "#43474d" },
  steel: { light: "#dfe7ef", mid: "#7d8894", dark: "#4a535e", line: "#323943" },
  "white-gold": { light: "#ffffff", mid: "#e6e2d6", dark: "#a49d8a", line: "#76705f" },
  "green-gold": { light: "#f1edb0", mid: "#b8b25a", dark: "#76712d", line: "#54501c" },
};

const SKETCH: MetalLook = { light: "#f4efe8", mid: "#ddd3c6", dark: "#b3a698", line: "#8c7b6c" };

export function metalLook(metalId: MetalId | null, finish: FinishId): MetalLook {
  const base = metalId === null ? SKETCH : LOOKS[metalId];
  if (finish === "satin")
    return { ...base, light: mixHex(base.light, base.mid, 0.55), dark: mixHex(base.dark, base.mid, 0.45) };
  if (finish === "antique") return { ...base, dark: mixHex(base.dark, "#2a2228", 0.45), line: "#2a2228" };
  if (finish === "frosted")
    return {
      ...base,
      light: mixHex(base.light, "#ffffff", 0.4),
      mid: mixHex(base.mid, "#ffffff", 0.35),
      dark: mixHex(base.dark, base.mid, 0.6),
    };
  return base;
}
