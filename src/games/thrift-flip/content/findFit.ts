import type { FindId } from "./find";

const SKIRTS_SHORT = ["remade-skirt:mini-skirt", "remade-skirt:pencil-skirt"] as const;
const TOPS_ALL = [
  "remade-top:fitted-bodice+sleeveless",
  "remade-top:fitted-bodice+cap-sleeve",
  "remade-top:wrap-bodice+sleeveless",
  "remade-top:wrap-bodice+cap-sleeve",
] as const;
const TOPS_SLEEVELESS = ["remade-top:fitted-bodice+sleeveless", "remade-top:wrap-bodice+sleeveless"] as const;
const SMALL_GOODS = ["scrunchie-trio", "cushion-cover", "tote-bag", "bucket-hat"] as const;

export const FIND_FIT: Readonly<Record<FindId, readonly string[]>> = {
  "faded-jeans": [...SMALL_GOODS, ...SKIRTS_SHORT],
  "gingham-shirt": ["scrunchie-trio", "bucket-hat"],
  "linen-curtain": [...SMALL_GOODS, ...SKIRTS_SHORT, "remade-skirt:a-line-skirt", ...TOPS_ALL],
  "sailor-top": [...SMALL_GOODS, ...TOPS_SLEEVELESS],
  "polka-tablecloth": [...SMALL_GOODS, ...SKIRTS_SHORT, ...TOPS_ALL],
  "tea-dress": [...SMALL_GOODS, ...SKIRTS_SHORT, ...TOPS_ALL],
  "black-jeans": [...SMALL_GOODS, ...SKIRTS_SHORT],
  "tulle-petticoat": ["scrunchie-trio", ...SKIRTS_SHORT, ...TOPS_ALL],
  "wool-blazer": ["cushion-cover", "bucket-hat"],
  "scarf-pair": ["scrunchie-trio", "cushion-cover", ...SKIRTS_SHORT, ...TOPS_ALL],
  "satin-dress": [...SMALL_GOODS, "remade-skirt:mini-skirt", ...TOPS_ALL],
  "party-skirt": [...SMALL_GOODS, ...TOPS_ALL],
  "sparkle-cardigan": [...SMALL_GOODS, ...TOPS_SLEEVELESS],
  "check-coat": ["cushion-cover", "tote-bag", "bucket-hat", ...TOPS_ALL],
};
