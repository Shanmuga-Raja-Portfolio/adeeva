import { MATERIAL_IDS, PRINTS } from "../../../engine/palette";
import { oneOf } from "../../../engine/parse";
import { knownIdParser } from "../../../engine/stateParsers";
import { TRIM_IDS } from "../../adeeva/content/trim";
import { CONDITION_GRADES } from "../content/condition";
import { FIND_IDS } from "../content/find";
import { MARK_IDS, PATCH_IDS } from "../content/finish";
import { RECIPE_IDS } from "../content/recipe";
import { UPGRADE_IDS } from "../content/upgrade";
import { clientById, partById, storyBeatById } from "./catalog";

export { colourIdParser, styleTagParser } from "../../../engine/stateParsers";

export const clientIdParser = knownIdParser(clientById, "client");
export const partIdParser = knownIdParser(partById, "garment part");
export const storyBeatIdParser = knownIdParser(storyBeatById, "story beat");
export const findIdParser = oneOf(FIND_IDS);
export const recipeIdParser = oneOf(RECIPE_IDS);
export const conditionParser = oneOf(CONDITION_GRADES);
export const materialIdParser = oneOf(MATERIAL_IDS);
export const printIdParser = oneOf(PRINTS);
export const trimIdParser = oneOf(TRIM_IDS);
export const patchIdParser = oneOf(PATCH_IDS);
export const markIdParser = oneOf(MARK_IDS);
export const upgradeIdParser = oneOf(UPGRADE_IDS);
