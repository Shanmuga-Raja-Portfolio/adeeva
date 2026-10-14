import { arrayOf, integerRangeParser, objectOf, oneOf, stringParser } from "../../../engine/parse";
import { countParser, dayParser, knownIdParser } from "../../../engine/stateParsers";
import type { ExtraRequirement } from "../content/client";
import { CHAIN_IDS, CHARM_IDS } from "../content/extra";
import { JEWEL_COLOURS, type JewelColour } from "../content/jewelColour";
import { JEWEL_TAGS } from "../content/jewelTag";
import { METAL_IDS } from "../content/metal";
import { PRODUCT_IDS } from "../content/product";
import type { Brief } from "./brief";
import { clientById } from "./catalog";

export const clientIdParser = knownIdParser(clientById, "client");
export const jewelTagParser = oneOf(JEWEL_TAGS);
export const jewelColourParser = oneOf(JEWEL_COLOURS.map((colour): JewelColour => colour.id));

const extraRequirementParser = objectOf<ExtraRequirement>({
  extraId: oneOf([...CHAIN_IDS, ...CHARM_IDS]),
  count: integerRangeParser(1, 9),
});

export const briefParser = objectOf<Brief>({
  clientId: clientIdParser,
  occasion: stringParser,
  productId: oneOf(PRODUCT_IDS),
  deadlineDay: dayParser,
  budget: countParser,
  fee: countParser,
  requiredTags: arrayOf(jewelTagParser),
  favouredColours: arrayOf(jewelColourParser),
  avoidColours: arrayOf(jewelColourParser),
  avoidMetals: arrayOf(oneOf(METAL_IDS)),
  requiredExtras: arrayOf(extraRequirementParser),
  minQuality: integerRangeParser(0, 100),
});
