import { MATERIAL_IDS } from "../../../engine/palette";
import { TRIM_IDS } from "../content/trim";
import { clientById, fabricById, partById, storyBeatById, themeById } from "./catalog";
import { oneOf } from "../../../engine/parse";
import { knownIdParser } from "../../../engine/stateParsers";

export { colourIdParser, styleTagParser } from "../../../engine/stateParsers";

export const fabricIdParser = knownIdParser(fabricById, "fabric");
export const partIdParser = knownIdParser(partById, "garment part");
export const clientIdParser = knownIdParser(clientById, "client");
export const themeIdParser = knownIdParser(themeById, "show theme");
export const storyBeatIdParser = knownIdParser(storyBeatById, "story beat");
export const materialIdParser = oneOf(MATERIAL_IDS);
export const trimIdParser = oneOf(TRIM_IDS);
