import { arrayOf, nullable, objectOf, oneOf, rangeParser, stringParser } from "../../../engine/parse";
import type { FinishRequirement } from "../content/client";
import { PATCH_IDS } from "../content/finish";
import type { Brief } from "./brief";
import {
  clientIdParser,
  colourIdParser,
  materialIdParser,
  partIdParser,
  recipeIdParser,
  styleTagParser,
  trimIdParser,
} from "./idParsers";
import { taggedParser } from "./taggedParser";
import {
  countParser,
  dayParser as positiveIntegerParser,
  nonNegativeParser,
  shareParser,
} from "../../../engine/stateParsers";

export { countParser, nonNegativeParser, positiveIntegerParser, shareParser };

export const finishRequirementParser = taggedParser<FinishRequirement>({
  trim: objectOf<FinishRequirement & { kind: "trim" }>({
    kind: oneOf(["trim"] as const),
    trim: trimIdParser,
    count: positiveIntegerParser,
  }),
  patch: objectOf<FinishRequirement & { kind: "patch" }>({
    kind: oneOf(["patch"] as const),
    patch: oneOf(["any", ...PATCH_IDS] as const),
    count: positiveIntegerParser,
  }),
});

export const briefParser = objectOf<Brief>({
  clientId: clientIdParser,
  occasion: stringParser,
  deadlineDay: positiveIntegerParser,
  budget: nonNegativeParser,
  fee: nonNegativeParser,
  recipes: arrayOf(recipeIdParser),
  partIds: nullable(arrayOf(partIdParser)),
  requiredTags: arrayOf(styleTagParser),
  favouredColours: arrayOf(colourIdParser),
  avoidColours: arrayOf(colourIdParser),
  avoidMaterials: arrayOf(materialIdParser),
  requiredFinishes: arrayOf(finishRequirementParser),
  minQuality: rangeParser(0, 100),
  minLeaves: rangeParser(0, 100),
});
