import type { FindId } from "./find";

const SKIRTS_SHORT = ["remade-skirt:mini-skirt", "remade-skirt:pencil-skirt"] as const;
const SKIRTS_ALL = [...SKIRTS_SHORT, "remade-skirt:a-line-skirt"] as const;
const TOPS_ALL = [
  "remade-top:fitted-bodice+sleeveless",
  "remade-top:fitted-bodice+cap-sleeve",
  "remade-top:wrap-bodice+sleeveless",
  "remade-top:wrap-bodice+cap-sleeve",
] as const;
const TOPS_SLEEVELESS = ["remade-top:fitted-bodice+sleeveless", "remade-top:wrap-bodice+sleeveless"] as const;
const TOPS_WRAP = ["remade-top:wrap-bodice+sleeveless", "remade-top:wrap-bodice+cap-sleeve"] as const;
const SMALL_GOODS = ["scrunchie-trio", "cushion-cover", "tote-bag", "bucket-hat"] as const;
const PINAFORE_MINI = [
  "remade-pinafore:fitted-bodice+mini-skirt",
  "remade-pinafore:wrap-bodice+mini-skirt",
] as const;
const PINAFORE_ALL = [
  ...PINAFORE_MINI,
  "remade-pinafore:fitted-bodice+a-line-skirt",
  "remade-pinafore:wrap-bodice+a-line-skirt",
] as const;
const BOWS_AND_BOOKS = ["hair-bow-set", "book-sleeve"] as const;
const BIG_CLOTH = [
  ...SMALL_GOODS,
  ...SKIRTS_ALL,
  ...TOPS_ALL,
  ...BOWS_AND_BOOKS,
  "bunting-string",
  "garden-apron",
  ...PINAFORE_ALL,
] as const;

export const FIND_FIT: Readonly<Record<FindId, readonly string[]>> = {
  "faded-jeans": [...SMALL_GOODS, ...SKIRTS_SHORT, ...BOWS_AND_BOOKS, "garden-apron", ...PINAFORE_MINI],
  "gingham-shirt": ["scrunchie-trio", "bucket-hat", ...BOWS_AND_BOOKS],
  "linen-curtain": BIG_CLOTH,
  "sailor-top": [...SMALL_GOODS, ...TOPS_SLEEVELESS, ...BOWS_AND_BOOKS],
  "polka-tablecloth": [
    ...SMALL_GOODS,
    ...SKIRTS_SHORT,
    ...TOPS_ALL,
    ...BOWS_AND_BOOKS,
    "bunting-string",
    "garden-apron",
    ...PINAFORE_MINI,
  ],
  "tea-dress": [
    ...SMALL_GOODS,
    ...SKIRTS_SHORT,
    ...TOPS_ALL,
    ...BOWS_AND_BOOKS,
    "bunting-string",
    "garden-apron",
  ],
  "black-jeans": [...SMALL_GOODS, ...SKIRTS_SHORT, ...BOWS_AND_BOOKS, "garden-apron", ...PINAFORE_MINI],
  "tulle-petticoat": ["scrunchie-trio", ...SKIRTS_SHORT, ...TOPS_ALL, "hair-bow-set", "bunting-string"],
  "wool-blazer": ["cushion-cover", "bucket-hat", "book-sleeve"],
  "scarf-pair": ["scrunchie-trio", "cushion-cover", ...SKIRTS_SHORT, ...TOPS_ALL, ...BOWS_AND_BOOKS],
  "satin-dress": [...SMALL_GOODS, "remade-skirt:mini-skirt", ...TOPS_ALL, ...BOWS_AND_BOOKS],
  "party-skirt": [...SMALL_GOODS, ...TOPS_ALL, ...BOWS_AND_BOOKS],
  "sparkle-cardigan": [...SMALL_GOODS, ...TOPS_SLEEVELESS, ...BOWS_AND_BOOKS],
  "check-coat": ["cushion-cover", "tote-bag", "bucket-hat", ...TOPS_ALL, "book-sleeve", "garden-apron"],
  "denim-jacket": ["scrunchie-trio", "cushion-cover", "bucket-hat", ...BOWS_AND_BOOKS],
  "rose-curtains": BIG_CLOTH,
  "stripe-shirt": ["scrunchie-trio", "bucket-hat", ...BOWS_AND_BOOKS],
  "linen-trousers": [...SMALL_GOODS, ...SKIRTS_SHORT, ...TOPS_ALL, ...BOWS_AND_BOOKS, "garden-apron"],
  "coral-sundress": [...SMALL_GOODS, ...SKIRTS_SHORT, ...TOPS_ALL, ...BOWS_AND_BOOKS, "garden-apron"],
  "linen-cloth": BIG_CLOTH,
  "track-jacket": ["scrunchie-trio", "bucket-hat", ...TOPS_ALL, ...BOWS_AND_BOOKS],
  "picnic-blanket": [
    "cushion-cover",
    "tote-bag",
    "bucket-hat",
    ...SKIRTS_ALL,
    ...TOPS_ALL,
    "book-sleeve",
    "bunting-string",
    "garden-apron",
    ...PINAFORE_ALL,
  ],
  "satin-robe": [...SMALL_GOODS, "remade-skirt:mini-skirt", ...TOPS_ALL, ...BOWS_AND_BOOKS, "garden-apron"],
  "silk-blouse": ["scrunchie-trio", "hair-bow-set"],
  "plum-skirt": ["tote-bag", "bucket-hat", ...TOPS_WRAP, "book-sleeve", "garden-apron"],
  "starry-tulle": ["scrunchie-trio", ...SKIRTS_SHORT, ...TOPS_ALL, "hair-bow-set", "bunting-string"],
  "theatre-velvet": BIG_CLOTH,
  "duffle-coat": ["cushion-cover", "tote-bag", "bucket-hat", ...TOPS_ALL, "book-sleeve", "garden-apron"],
};
